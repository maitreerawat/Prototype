# Interactive Literature Triage HCI + AI Study (`lit-triage-hci`)

A zero-dependency research prototype and interactive HCI testbed investigating whether **Structured AI-Extracted Evidence Cards** (*Claim, Methodology, Sample Size $N$, Confidence Badge, Limitation Highlight*) reduce screening decision time and improve methodological discernment compared to a **Standard Title + Full Abstract List** during rapid systematic review triage.

---

## 1-Command Quickstart

### A. Interactive Web Study + Side-by-Side Researcher Drawer
From `prototypes/lit-triage-hci/`:
```bash
python3 src/server.py --port 8765
```
Then open **`http://127.0.0.1:8765`** in your browser:
- **Left Pane (Literature Triage Workspace)**: Screen 8 realistic AI/HCI candidate papers (`P01`–`P08`) as `Include`, `Maybe`, or `Exclude` against the systematic review criteria.
- **Right Pane (Side-by-Side Researcher Drawer)**: Toggleable via the header button or `Cmd+Shift+R` (`Ctrl+Shift+R`):
  1. **Live Condition Switcher**: Switch dynamically between `Condition A: Baseline (Title + Full Abstract)` and `Condition B: AI Evidence Cards` + toggle `Show AI Extraction Confidence Badges`.
  2. **Live Telemetry Counter**: Real-time stopwatch, Mean Decision Time ($\bar{t}$), Accuracy vs. Ground Truth ($\text{Acc}$), Screening Efficiency ($E = \text{Acc} / \bar{t}$), Trap Paper Rejection Accuracy, and Abstract Expansion count.
  3. **Side-by-Side Researcher Note Pad**: Append timestamped qualitative observations tagged with the active Paper ID and UI condition.
  4. **Save Run to Lab Bench**: Persists a deterministic run bundle (`config.json`, `metrics.json`, `events.jsonl`, `observations.jsonl`) to `experiments/runs/<run-id>/` via `POST /api/runs`.

---

### B. Headless Deterministic CLI Simulation Mode
Run seeded screening simulations across all 8 papers and write complete telemetry bundles to `experiments/runs/<run_id>/`:

```bash
# Simulate Condition A (Baseline: Title + Full Abstract)
python3 src/server.py --simulate --condition baseline --seed 42 --run-id run_baseline_s42

# Simulate Condition B (AI Evidence Cards with Confidence Badges ON)
python3 src/server.py --simulate --condition evidence-cards --confidence-badges on --seed 42 --run-id run_cards_badges_on_s42

# Simulate Condition B Ablation (AI Evidence Cards with Confidence Badges OFF)
python3 src/server.py --simulate --condition evidence-cards --confidence-badges off --seed 42 --run-id run_cards_badges_off_s42
```

Or run both conditions together with a single command:
```bash
python3 src/server.py --simulate --seed 42
```

---

## Directory Layout

- `SPEC.md` — Study design, hypotheses ($H_1, H_2, H_3$), conditions, and telemetry schema.
- `LAB_NOTEBOOK.md` — Formal mathematical metrics, architecture diagram, run registry, and empirical observations.
- `data/papers.json` — 8 realistic HCI+AI paper fixtures (`P01`–`P08`) with full abstracts, structured evidence card fields, ground-truth labels, and methodological trap flags.
- `src/server.py` — Zero-dependency Python 3 HTTP server + deterministic cognitive screening simulator.
- `src/static/` — Vanilla HTML5/CSS3/ES6 split-pane interface (`index.html`, `styles.css`, `app.js`).
- `experiments/runs/<run-id>/` — Structured experimental output (`config.json`, `metrics.json`, `events.jsonl`, `observations.jsonl`).
