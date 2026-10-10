---
name: proto-hci-study
description: >-
  Archetype skill for prototyping HCI, Interactive UI, and User-Study applications with a built-in
  side-by-side Researcher Drawer (A/B condition switcher, interaction telemetry, and live observation logger).
---

# HCI & Interactive User-Study Prototype (`proto-hci-study`)

Use this skill when prototyping interactive user interfaces, human-AI interaction paradigms, or user-study testbeds where the researcher wants to test UI variants and take live notes side by side.

## Blueprint Structure
```text
prototypes/<slug>/
├── SPEC.md
├── LAB_NOTEBOOK.md            # Study design, condition descriptions, participant/self-pilot findings
├── src/                       # Interactive Web UI (Vite/React or lightweight HTML/JS + local API)
│   ├── components/
│   │   └── ResearcherDrawer/  # Built-in collapsible side panel for experimentation & note-taking
│   └── telemetry/             # Logs clicks, task completion time, and researcher notes
└── experiments/
    └── runs/<session-id>/
        ├── config.json        # Active UI condition (e.g., "baseline" vs "spatial-canvas")
        ├── events.jsonl       # Timestamped interaction events (task_start, click, task_complete)
        ├── observations.jsonl # Live qualitative notes typed by the researcher in the UI drawer
        └── metrics.json       # Task completion time, error count, interaction count
```

## Built-In "Researcher Drawer" Specification
Every HCI prototype must include a toggleable side-by-side **Researcher Drawer** (`Cmd+Shift+R` or floating toggle button) containing:
1. **Condition Switcher**: Instant toggle between study conditions (e.g., `Condition A: Baseline` vs. `Condition B: Treatment`) and key UI parameters.
2. **Live Telemetry Counter**: Displays elapsed task timer, interaction count, and current state.
3. **Side-by-Side Note Pad**: A quick input box where the researcher can type observations tagged to the current timestamp and UI state, plus an **"Export Run to Lab Notebook"** button (or local endpoint) that saves to `experiments/runs/<session-id>/` so `proto-scribe` can merge it into `LAB_NOTEBOOK.md`.
