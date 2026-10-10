---
name: rapid-prototype
description: >-
  End-to-end research prototyping workflow for designing hypotheses, scaffolding runnable prototypes
  with side-by-side lab notebooks, verifying experiments, and automatically logging runs via subagents.
---

# Rapid Research Prototype Workflow

Use this skill to take a research question or prototype concept from an initial idea to a runnable, instrumented prototype with a synchronized **Side-by-Side Lab Notebook** (`LAB_NOTEBOOK.md`).

## Standard Research Prototype Layout
Every prototype created under `prototypes/<slug>/` follows the synced lab-bench layout:
```text
prototypes/<slug>/
├── SPEC.md                    # Study design, conditions, and architecture spec
├── LAB_NOTEBOOK.md            # Live side-by-side research notebook (hypotheses, runs, notes)
├── README.md                  # 1-command quickstart & reproducibility instructions
├── src/                       # Prototype source code (AI harness, simulation, or HCI web app)
└── experiments/
    └── runs/                  # Timestamped structured outputs (config.json, metrics.json, observations.jsonl)
```

## Step 1: Hypothesis & Scope Alignment
1. If the **research question/hypothesis**, **domain** (`AI/ML`, `Simulation/Data Science`, or `HCI/Interactive UI`), or **conditions** are ambiguous, use `ask_question` with 1–3 high-leverage questions.
2. Select the matching domain skill if applicable:
   - [proto-ai-eval](../proto-ai-eval/SKILL.md) for AI/LLM/Agentic evaluation harnesses
   - [proto-sim-lab](../proto-sim-lab/SKILL.md) for Data Science & Computational Modeling
   - [proto-hci-study](../proto-hci-study/SKILL.md) for HCI & Interactive UI user-study prototypes

## Step 2: Study & Architecture Spec (`proto-architect`)
Delegate to `proto-architect` (see [architect.md](../../agents/architect.md)) or author directly:
- Create `prototypes/<slug>/SPEC.md` defining the baseline vs. experimental conditions, independent/dependent variables, and minimal stack.
- Initialize `prototypes/<slug>/LAB_NOTEBOOK.md` with the main hypothesis, experimental design diagram (Mermaid), and formal metrics (LaTeX).

## Step 3: Instrumented Scaffolding (`proto-builder`)
Define and invoke `proto-builder` (see [scaffolder.md](../../agents/scaffolder.md)):
- Build the working vertical slice with realistic seed fixtures.
- Include automatic run telemetry (`experiments/runs/<run-id>/`) or an in-app **Researcher Drawer** (for HCI web apps) so experimentation and note-taking happen side by side.

## Step 4: Smoke Run & Verification (`proto-verifier`)
Define and invoke `proto-verifier` (see [verifier.md](../../agents/verifier.md)):
- Verify dependencies, build, and execute at least one baseline run and one experimental variant run.

## Step 5: Automatic Lab Logging (`proto-scribe`)
Define and invoke `proto-scribe` (see [scribe.md](../../agents/scribe.md)) after verification or after any new experiment run:
- Automatically log the run parameters, metrics comparison table, and observations into `prototypes/<slug>/LAB_NOTEBOOK.md`.
