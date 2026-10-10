# Study & Architecture Specification: Interactive Literature Triage HCI + AI Study (`lit-triage-hci`)

## 1. Study Overview & Research Question

- **Prototype Slug**: `lit-triage-hci`
- **Archetype**: `proto-hci-study` (Interactive HCI + Human-AI Collaborative Decision Making Testbed)
- **Research Question**:
  > Does presenting structured AI-extracted evidence cards (*Claim, Methodology, Sample Size, Confidence Badge, Limitation Highlight*) reduce decision time and improve screening accuracy compared to a standard title+abstract list during rapid literature triage?

### Hypotheses
- **$H_1$ (Decision Efficiency)**: Researchers screening literature with **Condition B (`evidence-cards`)** will achieve a higher Screening Efficiency score ($E = \frac{\text{Accuracy}}{\text{Mean Decision Time (s)}}$) and lower mean decision time per paper than in **Condition A (`baseline`)**, without sacrificing screening accuracy.
- **$H_2$ (Methodological Discernment)**: Surfacing explicit *Limitation Highlights* and *Sample Size ($N$)* badges in **Condition B (`evidence-cards`)** will reduce false-positive inclusions on topically relevant but methodologically weak papers compared to **Condition A (`baseline`)**.
- **$H_3$ (Confidence Calibration)**: Displaying AI *Confidence Badges* helps researchers prioritize when to expand and verify the full abstract (measured via abstract expansion events on low-confidence items).

---

## 2. Experimental Conditions & Variables

### Experimental Conditions
| Condition ID | Name | UI Representation & Interaction Design |
| :--- | :--- | :--- |
| `baseline` | **Condition A: Standard Abstract List** | Standard chronological list of papers showing **Title**, **Authors**, **Venue/Year**, and the **full unformatted Abstract text**. Users make triage decisions (`Include`, `Maybe`, `Exclude`) directly below each abstract. |
| `evidence-cards` | **Condition B: Structured AI Evidence Cards** | Structured AI-Assisted Evidence Cards surfacing: (1) **Highlighted Core Claim**, (2) **Methodology Tag**, (3) **$N$ / Benchmark Stats Badge**, (4) **AI Extraction Confidence Score Badge** (toggleable), (5) **Limitation Highlight**, and a **1-click expandable full abstract** (`Show Full Abstract`). |

### Independent Variables (Knobs & Parameters)
1. `condition` (`"baseline"` | `"evidence-cards"`): Primary UI layout paradigm.
2. `showConfidenceBadges` (`true` | `false`): Toggle within `evidence-cards` to test whether explicit AI confidence scores affect abstract expansion behavior and trust calibration.
3. `seed` (integer, default `42`): Deterministic seed governing paper presentation order or simulated agent noise in `--simulate` mode.

### Dependent Variables (Quantitative Metrics & Qualitative Observations)
1. **Screening Accuracy ($\text{Acc}$)**: Proportion of triaged papers where the user/simulator decision matches the ground-truth label (`include`, `exclude`, `maybe`).
2. **Mean Decision Time ($\bar{t}_{\text{decision}}$)**: Average time in seconds spent per paper from focus/view to triage decision click.
3. **Screening Efficiency ($E$)**: Composite metric defined as $E = \frac{\text{Accuracy}}{\bar{t}_{\text{decision}}}$ ($\text{s}^{-1}$).
4. **Methodological Weak-Paper Rejection Rate**: Accuracy specifically on papers that are topically aligned with "Human-AI Collaborative Decision Making" but suffer from critical methodological flaws.
5. **Interaction Count & Abstract Expansions**: Total clicks, filter/toggle actions, and number of 1-click abstract expansions in `evidence-cards`.
6. **Qualitative Researcher Observations**: Timestamped side-by-side notes tagged with the active paper ID and UI condition.

---

## 3. Task & Seed Dataset (`data/papers.json`)

The task asks the participant (or simulated researcher) to screen **8 realistic AI/HCI research paper fixtures** for a systematic review on:
> **"Empirical Studies of Human-AI Collaborative Decision Making with Quantitative Task Performance Outcomes"**

### Inclusion / Exclusion Criteria
- **`include`**: Empirical user study or rigorous benchmark directly evaluating human-AI collaborative decision-making with adequate sample size ($N \ge 30$ human participants) and clear performance metrics.
- **`exclude`**: Off-topic distractors (e.g., pure systems/compiler optimization, autonomous-only robotics without human-in-the-loop) OR severely underpowered/uncontrolled opinion pieces ($N < 10$ or anecdotal only).
- **`maybe`**: Borderline studies (e.g., relevant human-AI decision domain with moderate sample size $N = 15\text{--}25$, simulation-only proxy humans, or partial confounders requiring full-text review).

### 8-Paper Seed Fixture Plan (`data/papers.json`)
| ID | Short Title | Category / Role | Ground Truth | AI Confidence | Key Structured Card Signals |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `P01` | *Calibrated Explanations in Clinical AI Triage* | Clearly Relevant & Rigorous | `include` | `0.94` (High) | **Claim**: Uncertainty-aware explanations improve clinician diagnostic accuracy by 14.2%. **Method**: Randomized Controlled Study. **Stats**: $N = 128$ clinicians. **Limitation**: Single-institution radiology dataset. |
| `P02` | *Kernel-Level KV-Cache Quantization for Edge LLMs* | Off-Topic Distractor (Pure Systems) | `exclude` | `0.97` (High) | **Claim**: 4-bit group quantization reduces TTFT latency by 2.8x on mobile NPUs. **Method**: Systems Benchmark. **Stats**: 4 LLM families, 0 human subjects. **Limitation**: No human-in-the-loop evaluation. |
| `P03` | *AI Co-Pilots for Financial Risk Auditing: A Pilot* | Methodologically Weak Trap (Topically Relevant) | `exclude` | `0.88` (High) | **Claim**: Analysts report feeling faster when using an LLM audit assistant. **Method**: Informal Think-Aloud Pilot. **Stats**: $N = 4$ internal interns (no control group). **Limitation**: Extremely small unrepresentative sample ($N=4$); subjective self-report only, no objective accuracy metric. |
| `P04` | *Adaptive Reliance in Human-Swarm Search & Rescue* | Clearly Relevant & Rigorous | `include` | `0.91` (High) | **Claim**: Adaptive autonomy switching reduces operator cognitive load and improves target recovery by 19%. **Method**: Within-Subjects Lab Experiment. **Stats**: $N = 64$ operators. **Limitation**: High-fidelity 2D simulation rather than physical field deployment. |
| `P05` | *LLM-Simulated Personas as Proxies for Crowd Annotators* | Borderline / Ambiguous Method | `maybe` | `0.62` (Low) | **Claim**: Synthetic persona ensembles approximate human disagreement on toxicity labels ($r = 0.71$). **Method**: Hybrid Validation Study. **Stats**: $N = 18$ human baseline raters + 500 LLM agents. **Limitation**: Small human validation cohort ($N=18$); unclear if collaborative decision-making or static labeling. |
| `P06` | *Prompt Ensembling for Zero-Shot Tabular Classification* | Off-Topic Distractor (Pure ML) | `exclude` | `0.95` (High) | **Claim**: Self-consistency voting over tabular serializations beats gradient boosting on 6/15 UCI datasets. **Method**: Offline ML Benchmark. **Stats**: 15 UCI datasets, $N = 0$ human participants. **Limitation**: Purely automated inference; no human decision maker involved. |
| `P07` | *Over-Reliance on Confident AI Recommendations in Legal Discovery* | Clearly Relevant & Rigorous | `include` | `0.93` (High) | **Claim**: Uncalibrated high-confidence badges increase lawyer automation bias errors by 27% on deceptive edge cases. **Method**: Between-Subjects Experiment. **Stats**: $N = 92$ JD/paralegal participants. **Limitation**: Vignette-based contract clauses rather than multi-day discovery workflows. |
| `P08` | *Interactive Counterfactuals for Loan Underwriting Decisions* | Borderline / Small Sample | `maybe` | `0.68` (Low) | **Claim**: Counterfactual sliders help loan officers contest biased model rejections in 61% of disputed cases. **Method**: Exploratory Mixed-Methods Study. **Stats**: $N = 21$ domain participants. **Limitation**: Below standard $N \ge 30$ power threshold; ceiling effect on easy cases. |

---

## 4. Built-In Researcher Drawer Specification (`Cmd+Shift+R`)

The UI features a persistent or toggleable right-hand split pane (**Researcher Drawer**, toggled via `Cmd+Shift+R` / `Ctrl+Shift+R` or the header button):

1. **Live Condition & Parameter Switcher**:
   - Radio/Segmented toggle between `Condition A: Baseline (Title + Abstract)` and `Condition B: Evidence Cards (AI Structured)`.
   - Checkbox toggle for `Show Confidence Badges` (active in `evidence-cards` mode).
   - `Reset Session` button to clear current decisions and restart the timer cleanly.
2. **Live Telemetry Counter**:
   - **Elapsed Time**: Live stopwatch (`mm:ss.d`) and mean decision time per paper ($\bar{t}$).
   - **Progress**: Papers screened (`k / 8`).
   - **Live Accuracy vs. Ground Truth**: Percentage and fraction correct, plus Screening Efficiency $E$.
   - **Interaction Counter**: Total clicks, condition switches, and abstract expansions.
3. **Side-by-Side Researcher Note Pad**:
   - Quick text area + paper selector tag (defaults to the most recently interacted paper).
   - Appends timestamped qualitative notes (`timestamp`, `condition`, `active_paper_id`, `note`) to the live observation list.
4. **"Save Run to Lab Bench" Button**:
   - Sends `POST /api/runs` to the local Python server, writing a deterministic folder `experiments/runs/<run-id>/` containing:
     - `config.json`
     - `metrics.json`
     - `events.jsonl`
     - `observations.jsonl`
   - Displays the saved run ID and file path confirmation directly inside the drawer.

---

## 5. Tech Stack & Directory Layout

### Pragmatic Stack Selection
- **Backend & CLI Harness**: Zero-dependency Python 3 standard library (`http.server`, `json`, `argparse`, `random`, `pathlib`, `datetime`, `statistics`) in `src/server.py`.
- **Frontend**: Vanilla HTML5, modern CSS3 (CSS Grid/Flexbox, scientific dark/light high-contrast lab theme), and modular ES6 JavaScript in `src/static/`. Zero external bundler or CDN required so startup is instantaneous (`< 100ms`) and 100% offline-reproducible.

### Directory Structure
```text
prototypes/lit-triage-hci/
├── SPEC.md                        # This study & architecture specification
├── LAB_NOTEBOOK.md                # Side-by-side research notebook (hypotheses, LaTeX metrics, runs)
├── README.md                      # Quickstart & reproducibility instructions
├── data/
│   └── papers.json                # 8 realistic AI/HCI paper fixtures with ground-truth & card fields
├── src/
│   ├── server.py                  # HTTP server + `/api/papers`, `/api/runs` + `--simulate` headless runner
│   └── static/
│       ├── index.html             # Split-screen Triage Workspace + Researcher Drawer (`Cmd+Shift+R`)
│       ├── styles.css             # Clean academic UI styling + evidence card badges & drawer layout
│       └── app.js                 # State management, telemetry tracker, condition switcher, API sync
└── experiments/
    └── runs/
        └── <run-id>/
            ├── config.json        # Condition, parameters, seed, mode ("interactive" | "simulated")
            ├── metrics.json       # Accuracy, mean decision time, efficiency E, per-class breakdown
            ├── events.jsonl       # Timestamped UI / triage telemetry events
            └── observations.jsonl # Timestamped researcher qualitative notes
```

---

## 6. Telemetry & Run Schema (`experiments/runs/<run-id>/`)

### `config.json`
```json
{
  "run_id": "run_20261010_baseline_s42",
  "timestamp": "2026-10-10T23:35:00Z",
  "condition": "baseline",
  "show_confidence_badges": true,
  "seed": 42,
  "mode": "simulated",
  "total_papers": 8
}
```

### `metrics.json`
```json
{
  "run_id": "run_20261010_baseline_s42",
  "condition": "baseline",
  "papers_screened": 8,
  "total_papers": 8,
  "accuracy": 0.75,
  "correct_count": 6,
  "mean_decision_time_sec": 18.42,
  "median_decision_time_sec": 17.90,
  "total_elapsed_sec": 147.36,
  "screening_efficiency": 0.0407,
  "weak_paper_rejection_accuracy": 0.50,
  "abstract_expansions": 0,
  "interaction_count": 11,
  "precision_include": 0.75,
  "recall_include": 1.00,
  "f1_include": 0.857
}
```

### `events.jsonl` (One JSON object per line)
```json
{"ts": "2026-10-10T23:35:01.120Z", "event": "session_start", "condition": "evidence-cards", "show_confidence_badges": true}
{"ts": "2026-10-10T23:35:07.450Z", "event": "triage_decision", "paper_id": "P01", "decision": "include", "ground_truth": "include", "correct": true, "decision_time_sec": 6.33, "condition": "evidence-cards"}
```

### `observations.jsonl` (One JSON object per line)
```json
{"ts": "2026-10-10T23:35:09.000Z", "condition": "evidence-cards", "paper_id": "P03", "note": "Limitation badge immediately exposed N=4 pilot trap without reading full abstract."}
```

---

## 7. Verification & Run Instructions

### 1. Headless Deterministic Simulation Mode (Automated Verification)
Run simulated baseline (`Condition A`) and treatment (`Condition B`) sessions with deterministic seeding to populate `experiments/runs/` and verify telemetry schemas:
```bash
python3 src/server.py --simulate --seed 42
```
Or run a specific condition/seed:
```bash
python3 src/server.py --simulate --condition baseline --seed 42
python3 src/server.py --simulate --condition evidence-cards --seed 42
```

### 2. Interactive Web Server Mode (Human-in-the-Loop Study + Researcher Drawer)
Start the local zero-dependency server:
```bash
python3 src/server.py --port 8765
```
Open `http://127.0.0.1:8765` in a browser:
- Press `Cmd+Shift+R` (or click **Researcher Drawer**) to toggle the right-hand split pane.
- Switch between `Condition A (Baseline)` and `Condition B (Evidence Cards)`.
- Triage the 8 papers, record live observations in the side-by-side notepad, and click **Save Run to Lab Bench** to persist the run to `experiments/runs/<run-id>/`.
