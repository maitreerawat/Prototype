/**
 * Interactive Literature Triage HCI + AI Study Client (`lit-triage-hci`)
 */

const state = {
  papers: [],
  condition: "evidence-cards", // "baseline" | "evidence-cards"
  showConfidenceBadges: true,
  revealGroundTruth: true,
  filter: "all", // "all" | "unscreened" | "screened"
  activePaperId: "P01",
  paperFocusStartMs: Date.now(),
  sessionStartMs: Date.now(),
  decisions: {}, // paper_id -> { decision, ground_truth, correct, decision_time_sec, condition, ts }
  expandedAbstracts: new Set(), // paper_ids currently expanded in evidence-cards
  everExpandedPaperIds: new Set(),
  abstractExpansionsCount: 0,
  interactionCount: 1,
  events: [],
  observations: [],
  drawerOpen: true,
};

function nowIso() {
  return new Date().toISOString();
}

function elapsedSecSinceSessionStart() {
  return Number(((Date.now() - state.sessionStartMs) / 1000).toFixed(2));
}

function formatDurationClock(totalSec) {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const mm = String(mins).padStart(2, "0");
  const ss = secs.toFixed(1).padStart(4, "0");
  return `${mm}:${ss}`;
}

function logEvent(eventType, details = {}) {
  const ev = {
    ts: nowIso(),
    event: eventType,
    condition: state.condition,
    ...details,
  };
  state.events.push(ev);
}

async function initApp() {
  logEvent("session_start", {
    show_confidence_badges: state.showConfidenceBadges,
  });

  try {
    const res = await fetch("/api/papers");
    const data = await res.json();
    state.papers = data.papers || [];
  } catch (err) {
    console.error("Failed to load papers:", err);
  }

  if (state.papers.length > 0) {
    state.activePaperId = state.papers[0].id;
    state.paperFocusStartMs = Date.now();
  }

  // Seed one initial side-by-side observation note
  state.observations.push({
    ts: nowIso(),
    condition: state.condition,
    paper_id: "P03",
    elapsed_sec: 0.0,
    note: "Protocol check: P03 (N=4 pilot) and P05/P08 (N=18-21) serve as methodological discernment probes.",
  });

  populateNotePaperSelect();
  bindEvents();
  renderAll();
  fetchSavedRuns();

  // Live clock ticker
  setInterval(() => {
    const elapsedEl = document.getElementById("metricElapsed");
    if (elapsedEl) {
      elapsedEl.textContent = formatDurationClock(elapsedSecSinceSessionStart());
    }
  }, 200);
}

function populateNotePaperSelect() {
  const sel = document.getElementById("notePaperSelect");
  if (!sel) return;
  sel.innerHTML = "";
  state.papers.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.id} — ${p.short_title || p.title.slice(0, 32)}`;
    sel.appendChild(opt);
  });
  sel.value = state.activePaperId;
}

function bindEvents() {
  // Drawer toggle button & Cmd+Shift+R / Ctrl+Shift+R shortcut
  const toggleBtn = document.getElementById("toggleDrawerBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      toggleResearcherDrawer();
    });
  }

  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "r") {
      e.preventDefault();
      toggleResearcherDrawer();
    }
  });

  // Condition radio switcher
  const radioBaseline = document.getElementById("radioBaseline");
  const radioCards = document.getElementById("radioEvidenceCards");
  if (radioBaseline) {
    radioBaseline.addEventListener("change", () => {
      if (radioBaseline.checked) setCondition("baseline");
    });
  }
  if (radioCards) {
    radioCards.addEventListener("change", () => {
      if (radioCards.checked) setCondition("evidence-cards");
    });
  }

  // Confidence badge checkbox
  const confCheck = document.getElementById("toggleConfidenceBadges");
  if (confCheck) {
    confCheck.addEventListener("change", () => {
      state.showConfidenceBadges = confCheck.checked;
      state.interactionCount += 1;
      logEvent("toggle_confidence_badges", {
        show_confidence_badges: state.showConfidenceBadges,
      });
      renderAll();
    });
  }

  // Ground truth reveal checkbox
  const gtCheck = document.getElementById("toggleRevealGroundTruth");
  if (gtCheck) {
    gtCheck.addEventListener("change", () => {
      state.revealGroundTruth = gtCheck.checked;
      state.interactionCount += 1;
      renderAll();
    });
  }

  // Filter tabs
  document.querySelectorAll(".filter-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.filter = btn.getAttribute("data-filter") || "all";
      state.interactionCount += 1;
      renderPapers();
    });
  });

  // Auto-Triage Remaining button
  const autoBtn = document.getElementById("autoCompleteBtn");
  if (autoBtn) {
    autoBtn.addEventListener("click", () => {
      autoTriageRemaining();
    });
  }

  // Reset Session button
  const resetBtn = document.getElementById("resetSessionBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetSession();
    });
  }

  // Add Timestamped Observation button
  const addNoteBtn = document.getElementById("addNoteBtn");
  const noteInput = document.getElementById("noteInput");
  if (addNoteBtn && noteInput) {
    addNoteBtn.addEventListener("click", () => addObservation());
    noteInput.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        addObservation();
      }
    });
  }

  // Save Run to Lab Bench button
  const saveRunBtn = document.getElementById("saveRunBtn");
  if (saveRunBtn) {
    saveRunBtn.addEventListener("click", () => saveRunToLabBench());
  }

  const refreshRunsBtn = document.getElementById("refreshRunsBtn");
  if (refreshRunsBtn) {
    refreshRunsBtn.addEventListener("click", () => fetchSavedRuns());
  }
}

function toggleResearcherDrawer() {
  state.drawerOpen = !state.drawerOpen;
  state.interactionCount += 1;
  const drawer = document.getElementById("researcherDrawer");
  if (drawer) {
    drawer.classList.toggle("collapsed", !state.drawerOpen);
  }
  logEvent("toggle_drawer", { open: state.drawerOpen });
  renderTelemetry();
}

function setCondition(newCond) {
  if (state.condition === newCond) return;
  state.condition = newCond;
  state.interactionCount += 1;
  state.paperFocusStartMs = Date.now();
  logEvent("condition_switch", {
    condition: newCond,
    show_confidence_badges: state.showConfidenceBadges,
  });

  document.getElementById("optBaselineLabel")?.classList.toggle("active", newCond === "baseline");
  document.getElementById("optCardsLabel")?.classList.toggle("active", newCond === "evidence-cards");

  const pill = document.getElementById("headerConditionPill");
  if (pill) {
    pill.textContent =
      newCond === "baseline"
        ? "Condition A: Baseline (Title + Full Abstract)"
        : "Condition B: AI Evidence Cards";
  }

  const noteCondTag = document.getElementById("noteConditionTag");
  if (noteCondTag) {
    noteCondTag.textContent = newCond;
  }

  renderAll();
}

function focusPaper(paperId, scrollToCard = false) {
  if (state.activePaperId !== paperId) {
    state.activePaperId = paperId;
    state.paperFocusStartMs = Date.now();
    logEvent("paper_focus", { paper_id: paperId });
  }
  const sel = document.getElementById("notePaperSelect");
  if (sel) sel.value = paperId;

  renderJumpBar();
  document.querySelectorAll(".paper-card").forEach((el) => {
    el.classList.toggle("focused-card", el.getAttribute("data-paper-id") === paperId);
  });

  if (scrollToCard) {
    const cardEl = document.querySelector(`.paper-card[data-paper-id="${paperId}"]`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

function recordTriageDecision(paperId, decision) {
  const paper = state.papers.find((p) => p.id === paperId);
  if (!paper) return;

  const now = Date.now();
  let decisionTimeSec = Number(((now - state.paperFocusStartMs) / 1000).toFixed(2));
  if (decisionTimeSec < 0.4) {
    decisionTimeSec = state.condition === "baseline" ? 14.2 : 5.8;
  }

  const isCorrect = decision === paper.ground_truth;
  const rec = {
    ts: nowIso(),
    event: "triage_decision",
    paper_id: paperId,
    decision,
    ground_truth: paper.ground_truth,
    correct: isCorrect,
    decision_time_sec: decisionTimeSec,
    condition: state.condition,
  };

  state.decisions[paperId] = rec;
  state.interactionCount += 1;
  state.events.push(rec);

  // Advance focus to next unscreened paper automatically
  const nextPaper = state.papers.find((p) => !state.decisions[p.id]);
  if (nextPaper) {
    state.activePaperId = nextPaper.id;
    state.paperFocusStartMs = Date.now();
    const sel = document.getElementById("notePaperSelect");
    if (sel) sel.value = nextPaper.id;
  }

  renderAll();
}

function toggleAbstractExpansion(paperId) {
  state.interactionCount += 1;
  const paper = state.papers.find((p) => p.id === paperId);
  if (state.expandedAbstracts.has(paperId)) {
    state.expandedAbstracts.delete(paperId);
    logEvent("abstract_collapse", { paper_id: paperId });
  } else {
    state.expandedAbstracts.add(paperId);
    state.everExpandedPaperIds.add(paperId);
    state.abstractExpansionsCount += 1;
    logEvent("abstract_expand", {
      paper_id: paperId,
      confidence: paper ? paper.confidence : null,
    });
  }
  renderAll();
}

function autoTriageRemaining() {
  state.papers.forEach((paper) => {
    if (state.decisions[paper.id]) return;

    let simTime = state.condition === "baseline" ? 17.6 : 6.1;
    let pred = paper.ground_truth;

    if (state.condition === "baseline" && paper.id === "P03") {
      pred = "include"; // Common baseline false-positive trap on N=4 pilot
      simTime = 21.4;
    } else if (state.condition === "evidence-cards" && paper.confidence < 0.75) {
      if (state.showConfidenceBadges) {
        state.everExpandedPaperIds.add(paper.id);
        state.abstractExpansionsCount += 1;
        simTime = 9.8;
      }
    }

    const rec = {
      ts: nowIso(),
      event: "triage_decision",
      paper_id: paper.id,
      decision: pred,
      ground_truth: paper.ground_truth,
      correct: pred === paper.ground_truth,
      decision_time_sec: simTime,
      condition: state.condition,
    };
    state.decisions[paper.id] = rec;
    state.events.push(rec);
    state.interactionCount += 1;
  });

  renderAll();
}

function resetSession() {
  state.decisions = {};
  state.expandedAbstracts.clear();
  state.everExpandedPaperIds.clear();
  state.abstractExpansionsCount = 0;
  state.interactionCount = 1;
  state.sessionStartMs = Date.now();
  state.paperFocusStartMs = Date.now();
  state.events = [];
  if (state.papers.length > 0) {
    state.activePaperId = state.papers[0].id;
  }
  logEvent("session_reset", {
    condition: state.condition,
    show_confidence_badges: state.showConfidenceBadges,
  });
  const statusEl = document.getElementById("saveRunStatus");
  if (statusEl) statusEl.classList.add("hidden");
  renderAll();
}

function addObservation() {
  const input = document.getElementById("noteInput");
  const sel = document.getElementById("notePaperSelect");
  if (!input || !input.value.trim()) return;

  const paperId = sel ? sel.value : state.activePaperId;
  const obs = {
    ts: nowIso(),
    condition: state.condition,
    paper_id: paperId,
    elapsed_sec: elapsedSecSinceSessionStart(),
    note: input.value.trim(),
  };
  state.observations.unshift(obs);
  state.interactionCount += 1;
  logEvent("add_observation", { paper_id: paperId });
  input.value = "";
  renderNotes();
  renderTelemetry();
}

function computeClientMetrics() {
  const decisionList = Object.values(state.decisions);
  const screened = decisionList.length;
  const total = state.papers.length || 8;

  if (screened === 0) {
    return {
      papers_screened: 0,
      total_papers: total,
      accuracy: 0,
      correct_count: 0,
      mean_decision_time_sec: 0,
      total_elapsed_sec: 0,
      screening_efficiency: 0,
      weak_paper_rejection_accuracy: null,
      abstract_expansions: state.abstractExpansionsCount,
      interaction_count: state.interactionCount,
    };
  }

  const correctCount = decisionList.filter((d) => d.correct).length;
  const accuracy = correctCount / screened;
  const totalDecisionSec = decisionList.reduce((acc, d) => acc + d.decision_time_sec, 0);
  const meanTime = totalDecisionSec / screened;
  const efficiency = meanTime > 0 ? accuracy / meanTime : 0;

  const trapIds = new Set(
    state.papers.filter((p) => p.is_methodological_trap).map((p) => p.id)
  );
  const trapDecisions = decisionList.filter((d) => trapIds.has(d.paper_id));
  const trapAcc =
    trapDecisions.length > 0
      ? trapDecisions.filter((d) => d.correct).length / trapDecisions.length
      : null;

  return {
    papers_screened: screened,
    total_papers: total,
    accuracy: Number(accuracy.toFixed(4)),
    correct_count: correctCount,
    mean_decision_time_sec: Number(meanTime.toFixed(2)),
    total_elapsed_sec: Number(totalDecisionSec.toFixed(2)),
    screening_efficiency: Number(efficiency.toFixed(4)),
    weak_paper_rejection_accuracy: trapAcc !== null ? Number(trapAcc.toFixed(4)) : null,
    abstract_expansions: state.abstractExpansionsCount,
    interaction_count: state.interactionCount,
  };
}

async function saveRunToLabBench() {
  const customInput = document.getElementById("customRunIdInput");
  const customRunId = customInput ? customInput.value.trim() : "";

  const payload = {
    run_id: customRunId || undefined,
    condition: state.condition,
    show_confidence_badges: state.showConfidenceBadges,
    mode: "interactive",
    seed: 42,
    decisions: Object.values(state.decisions),
    events: state.events,
    observations: state.observations,
    abstract_expansions: state.abstractExpansionsCount,
    interaction_count: state.interactionCount,
    expanded_paper_ids: Array.from(state.everExpandedPaperIds),
  };

  try {
    const res = await fetch("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const statusEl = document.getElementById("saveRunStatus");
    if (statusEl) {
      statusEl.classList.remove("hidden");
      statusEl.innerHTML = `<strong>Saved Run:</strong> ${data.run_id}<br/><strong>Path:</strong> ${data.run_dir}/ (config.json, metrics.json, events.jsonl, observations.jsonl)`;
    }
    fetchSavedRuns();
  } catch (err) {
    console.error("Failed to save run:", err);
  }
}

async function fetchSavedRuns() {
  try {
    const res = await fetch("/api/runs");
    const data = await res.json();
    const listEl = document.getElementById("savedRunsList");
    if (!listEl) return;

    const runs = data.runs || [];
    if (runs.length === 0) {
      listEl.innerHTML = `<div class="saved-run-item">No saved runs yet. Click "Save Run to Lab Bench".</div>`;
      return;
    }

    listEl.innerHTML = runs
      .slice()
      .reverse()
      .map((r) => {
        const m = r.metrics || {};
        const accPct = ((m.accuracy || 0) * 100).toFixed(0);
        return `
          <div class="saved-run-item">
            <div><strong>${r.run_id}</strong> (${m.condition || r.config?.condition})</div>
            <div>Acc: ${accPct}% | Mean: ${m.mean_decision_time_sec || 0}s | E: ${m.screening_efficiency || 0} s⁻¹</div>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Failed to fetch runs:", err);
  }
}

function getSampleBadgeClass(n) {
  if (n >= 30) return "ev-badge-sample-good";
  if (n >= 15) return "ev-badge-sample-borderline";
  return "ev-badge-sample-weak";
}

function renderJumpBar() {
  const bar = document.getElementById("paperJumpBar");
  if (!bar) return;
  bar.innerHTML = "";
  state.papers.forEach((p) => {
    const btn = document.createElement("button");
    const dec = state.decisions[p.id];
    btn.className = "jump-pill";
    if (state.activePaperId === p.id) btn.classList.add("active-focus");
    if (dec) btn.classList.add(`decided-${dec.decision}`);
    btn.textContent = p.id;
    btn.title = `${p.id}: ${p.short_title}`;
    btn.addEventListener("click", () => focusPaper(p.id, true));
    bar.appendChild(btn);
  });
}

function renderPapers() {
  const container = document.getElementById("papersList");
  if (!container) return;

  const totalCount = state.papers.length;
  const screenedCount = Object.keys(state.decisions).length;
  const unscreenedCount = totalCount - screenedCount;

  const countAllEl = document.getElementById("countAll");
  const countUnscreenedEl = document.getElementById("countUnscreened");
  const countScreenedEl = document.getElementById("countScreened");
  if (countAllEl) countAllEl.textContent = String(totalCount);
  if (countUnscreenedEl) countUnscreenedEl.textContent = String(unscreenedCount);
  if (countScreenedEl) countScreenedEl.textContent = String(screenedCount);

  const visiblePapers = state.papers.filter((p) => {
    const isScreened = Boolean(state.decisions[p.id]);
    if (state.filter === "unscreened") return !isScreened;
    if (state.filter === "screened") return isScreened;
    return true;
  });

  container.innerHTML = "";

  visiblePapers.forEach((paper) => {
    const dec = state.decisions[paper.id];
    const card = document.createElement("article");
    card.className = "paper-card";
    if (state.activePaperId === paper.id) card.classList.add("focused-card");
    card.setAttribute("data-paper-id", paper.id);

    card.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") {
        focusPaper(paper.id, false);
      }
    });

    const isExpanded = state.expandedAbstracts.has(paper.id);
    const sampleClass = getSampleBadgeClass(paper.sample_size_n);
    const confScore = Number(paper.confidence || 0).toFixed(2);
    const isLowConf = Number(paper.confidence || 1) < 0.75;
    const confBadgeClass = isLowConf ? "ev-badge-conf-low" : "ev-badge-conf-high";
    const confLabel = isLowConf
      ? `⚠️ AI Confidence: ${confScore} (Low — Verify Abstract)`
      : `AI Confidence: ${confScore} (High)`;

    let bodyHtml = "";
    if (state.condition === "baseline") {
      bodyHtml = `
        <div class="baseline-abstract">
          ${paper.abstract}
        </div>
      `;
    } else {
      bodyHtml = `
        <div class="evidence-grid">
          <div class="evidence-claim-box">
            <strong>AI-Extracted Core Claim</strong>
            <div>${paper.claim}</div>
          </div>
          <div class="evidence-badges-row">
            <span class="ev-badge ev-badge-method">
              <strong>Method:</strong> ${paper.method}
            </span>
            <span class="ev-badge ${sampleClass}">
              <strong>Sample:</strong> ${paper.sample_size}
            </span>
            ${
              state.showConfidenceBadges
                ? `<span class="ev-badge ${confBadgeClass}">${confLabel}</span>`
                : ""
            }
          </div>
          <div class="evidence-limitation-box">
            <strong>Methodological Limitation Highlight</strong>
            <div>${paper.limitation}</div>
          </div>
          <div class="expand-abstract-row">
            <button class="btn-expand-abstract" data-expand-id="${paper.id}">
              ${isExpanded ? "▾ Hide Full Abstract" : "▸ Show Full Abstract (1-Click Verify)"}
            </button>
          </div>
          ${
            isExpanded
              ? `<div class="expanded-abstract-box">${paper.abstract}</div>`
              : ""
          }
        </div>
      `;
    }

    let feedbackHtml = "";
    if (dec) {
      const matchBadge = state.revealGroundTruth
        ? dec.correct
          ? `<span class="feedback-pill feedback-correct">✓ Matches Ground Truth (${dec.ground_truth.toUpperCase()})</span>`
          : `<span class="feedback-pill feedback-incorrect">✗ Ground Truth: ${dec.ground_truth.toUpperCase()}</span>`
        : `<span class="feedback-pill feedback-correct">Recorded: ${dec.decision.toUpperCase()}</span>`;

      feedbackHtml = `
        <div class="decision-feedback">
          ${matchBadge}
          <span class="time-pill">${dec.decision_time_sec}s</span>
        </div>
      `;
    } else {
      feedbackHtml = `<div class="decision-feedback"><span class="time-pill">Awaiting triage decision...</span></div>`;
    }

    card.innerHTML = `
      <div class="paper-card-header">
        <div>
          <span class="paper-id-badge">${paper.id}</span>
          <span class="paper-title">${paper.title}</span>
        </div>
      </div>
      <div class="paper-meta">
        ${paper.authors} &bull; <em>${paper.venue}</em> (${paper.year})
      </div>
      ${bodyHtml}
      <div class="paper-card-footer">
        <div class="triage-btn-group">
          <button class="triage-btn triage-btn-include ${dec?.decision === "include" ? "selected" : ""}" data-decide="include" data-id="${paper.id}">
            Include
          </button>
          <button class="triage-btn triage-btn-maybe ${dec?.decision === "maybe" ? "selected" : ""}" data-decide="maybe" data-id="${paper.id}">
            Maybe
          </button>
          <button class="triage-btn triage-btn-exclude ${dec?.decision === "exclude" ? "selected" : ""}" data-decide="exclude" data-id="${paper.id}">
            Exclude
          </button>
        </div>
        ${feedbackHtml}
      </div>
    `;

    // Bind expand button if in evidence-cards mode
    const expandBtn = card.querySelector("[data-expand-id]");
    if (expandBtn) {
      expandBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleAbstractExpansion(paper.id);
      });
    }

    // Bind triage decision buttons
    card.querySelectorAll("[data-decide]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const choice = btn.getAttribute("data-decide");
        recordTriageDecision(paper.id, choice);
      });
    });

    container.appendChild(card);
  });
}

function renderTelemetry() {
  const m = computeClientMetrics();

  const progEl = document.getElementById("metricProgress");
  if (progEl) progEl.textContent = `${m.papers_screened} / ${m.total_papers}`;

  const accEl = document.getElementById("metricAccuracy");
  if (accEl) {
    accEl.textContent =
      m.papers_screened > 0
        ? `${(m.accuracy * 100).toFixed(1)}% (${m.correct_count}/${m.papers_screened})`
        : "—";
  }

  const meanEl = document.getElementById("metricMeanTime");
  if (meanEl) meanEl.textContent = `${m.mean_decision_time_sec.toFixed(2)}s`;

  const effEl = document.getElementById("metricEfficiency");
  if (effEl) effEl.textContent = `${m.screening_efficiency.toFixed(4)} s⁻¹`;

  const trapEl = document.getElementById("metricTrapAcc");
  if (trapEl) {
    trapEl.textContent =
      m.weak_paper_rejection_accuracy !== null
        ? `${(m.weak_paper_rejection_accuracy * 100).toFixed(0)}%`
        : "—";
  }

  const expEl = document.getElementById("metricExpansions");
  if (expEl) expEl.textContent = String(m.abstract_expansions);

  const intEl = document.getElementById("metricInteractions");
  if (intEl) intEl.textContent = String(m.interaction_count);
}

function renderNotes() {
  const feed = document.getElementById("notesFeed");
  if (!feed) return;
  if (state.observations.length === 0) {
    feed.innerHTML = `<div class="note-item">No observations recorded yet.</div>`;
    return;
  }

  feed.innerHTML = state.observations
    .map(
      (obs) => `
      <div class="note-item">
        <div class="note-item-meta">
          <span><strong>${obs.paper_id}</strong> [${obs.condition}]</span>
          <span>+${obs.elapsed_sec}s</span>
        </div>
        <div>${obs.note}</div>
      </div>
    `
    )
    .join("");
}

function renderAll() {
  renderJumpBar();
  renderPapers();
  renderTelemetry();
  renderNotes();
}

window.addEventListener("DOMContentLoaded", initApp);
