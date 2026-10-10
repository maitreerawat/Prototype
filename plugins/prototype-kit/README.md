# Research Prototype Kit Plugin (`prototype-kit`)

A reusable Antigravity plugin containing system rules, 4 specialized subagent profiles, and 6 skills for **research-first rapid prototyping and side-by-side lab note-taking**.

## Contents
- `rules/AGENTS.md`: Always-on research prototyping principles and subagent orchestration rules.
- `agents/`:
  - `architect.md` (`proto-architect`): Hypothesis, experimental conditions, and `SPEC.md` / `LAB_NOTEBOOK.md` designer.
  - `scaffolder.md` (`proto-builder`): Instrumented prototype builder with telemetry and HCI Researcher Drawer.
  - `verifier.md` (`proto-verifier`): Baseline vs. treatment runner and reproducibility verifier.
  - `scribe.md` (`proto-scribe`): Automatic lab notebook scribe that logs runs into `LAB_NOTEBOOK.md`.
- `skills/`:
  - `rapid-prototype/SKILL.md`: End-to-end 5-step research prototyping workflow.
  - `proto-ai-eval/SKILL.md`: AI / ML / LLM & Agentic evaluation harnesses.
  - `proto-sim-lab/SKILL.md`: Data Science, Simulation & Computational Modeling.
  - `proto-hci-study/SKILL.md`: HCI & Interactive UI prototypes with side-by-side Researcher Drawer.
  - `research-synthesis/SKILL.md`: On-demand synthesis of runs into paper-ready tables and findings.
  - `agent-skill-factory/SKILL.md`: Meta-skill to author new stack/domain skills and subagents.
