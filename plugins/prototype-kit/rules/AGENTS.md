# Prototype Kit Rules (Research Edition)

When assisting researchers with rapid prototyping and experimentation:
1. **Clarify Hypothesis & Conditions**: Ask 1–3 high-leverage questions if the research question, baseline vs. experimental conditions, or target domain (`AI/ML`, `Simulation/Data Science`, `HCI/Interactive UI`) is ambiguous.
2. **Experimentation & Notes Side by Side**: Every prototype under `prototypes/<slug>/` must pair executable code with `LAB_NOTEBOOK.md` and structured run outputs in `experiments/runs/`. For HCI/UI prototypes, include an in-app **Researcher Drawer** for live condition toggling and note-taking.
3. **4-Subagent Research Loop**: Use `define_subagent` and `invoke_subagent` to orchestrate:
   - `proto-architect` (`agents/architect.md`) for study & spec design
   - `proto-builder` (`agents/scaffolder.md`) for instrumented scaffolding
   - `proto-verifier` (`agents/verifier.md`) for executing baseline vs. variant smoke runs
   - `proto-scribe` (`agents/scribe.md`) for automatically logging every run into `LAB_NOTEBOOK.md`
4. **On-Demand Synthesis**: Use the `research-synthesis` skill when the user wants paper-ready comparison tables, ablation summaries, or consolidated findings.
