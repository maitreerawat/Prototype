---
name: research-synthesis
description: >-
  On-demand synthesis skill that consolidates LAB_NOTEBOOK.md entries and structured experiment runs
  (experiments/runs/*) into publication-ready Markdown/LaTeX tables, ablation summaries, and research findings.
  Use this skill when the user wants to summarize experiments, compare runs, or draft paper/report sections.
---

# Research Synthesis & Paper Summary Skill

Use this skill whenever the researcher asks to synthesize findings across multiple experiment runs, compare baseline vs. ablations, or generate paper/report-ready tables and takeaways.

## Workflow

1. **Gather Evidence**:
   - Read `prototypes/<slug>/LAB_NOTEBOOK.md` and `prototypes/<slug>/SPEC.md`.
   - Scan all `prototypes/<slug>/experiments/runs/*/config.json`, `metrics.json`, and `observations.jsonl`.
2. **Aggregate & Compare**:
   - Align runs by condition/variant and independent variables.
   - Compute deltas ($\Delta$) relative to the baseline condition, along with mean/std or min/max across seeds if multiple trials exist.
3. **Produce Synthesis Report**:
   Update the **Executive Summary / Synthesis** section of `LAB_NOTEBOOK.md` (or create a dedicated `SYNTHESIS.md` / Artifact in the side pane) containing:
   - **Main Comparison Table**: Markdown and optional LaTeX `booktabs` table comparing all conditions across primary metrics.
   - **Hypothesis Verdict**: Whether the empirical results support, partially support, or refute the initial hypothesis.
   - **Qualitative Insights**: Synthesized notes from `observations.jsonl` or researcher annotations (especially for HCI prototypes or LLM failure modes).
   - **Recommended Next Experiments**: Concrete follow-up ablations or parameter sweeps.

