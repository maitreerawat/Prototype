# Prototype Studio — Research-First Agent & Skill System

Welcome to **Prototype**! This repository houses a modular system of **Antigravity System Agents, Subagents, Rules, and Skills** designed specifically for **Researchers** so that **rapid prototyping, controlled experimentation, and structured lab notes happen side by side**.

## Core Philosophy: Experimentation & Notes Side by Side

Every research prototype created in `prototypes/<study-slug>/` pairs runnable experimental code with live note-taking and structured telemetry:
1. **Synced Lab Bench (`LAB_NOTEBOOK.md` + `experiments/runs/`)**: Hypotheses, LaTeX mathematical formulations, Mermaid diagrams, and run comparison tables live right beside timestamped JSON/JSONL run outputs (`config.json`, `metrics.json`, `observations.jsonl`) with direct clickable links to code and commits.
2. **In-App Researcher Drawer (for HCI & Interactive UI)**: Interactive web prototypes ship with a collapsible **Researcher Drawer** (`Cmd+Shift+R`) to toggle between study conditions (e.g., Baseline vs. Variant), track task timers, and record live qualitative observations directly to disk.
3. **Dual Note-Taking Workflow**:
   - **Automatic (`proto-scribe`)**: Automatically logs parameters, git state, and metric deltas ($\Delta$) into `LAB_NOTEBOOK.md` after every experiment run.
   - **On-Demand (`research-synthesis`)**: Synthesizes multiple runs and qualitative notes into publication-ready Markdown/LaTeX tables and findings summaries.

## Dual-Mode Repository Layout (Workspace + Plugin)

```text
Prototype/
├── AGENTS.md                                  # Workspace-level research orchestration rules
├── .agents/
│   ├── plugins.json                           # Auto-discovers plugins/ in the workspace
│   └── skills.json                            # Auto-discovers plugin skills in the workspace
├── plugins/
│   └── prototype-kit/                         # Self-contained Antigravity Plugin bundle
│       ├── plugin.json                        # Plugin manifest (v0.2.0)
│       ├── README.md                          # Plugin documentation
│       ├── rules/
│       │   └── AGENTS.md                      # Always-on research prototyping principles
│       ├── agents/                            # 4 Specialized Research Subagent Profiles
│       │   ├── architect.md                   # proto-architect: Hypothesis & Study Spec Designer
│       │   ├── scaffolder.md                  # proto-builder: Instrumented Prototype Scaffolder
│       │   ├── verifier.md                    # proto-verifier: Baseline vs. Variant Runner & QA
│       │   └── scribe.md                      # proto-scribe: Automatic Side-by-Side Lab Logger
│       └── skills/                            # Modular Research & Domain Archetype Skills
│           ├── rapid-prototype/               # End-to-end 5-step research prototyping loop
│           ├── proto-ai-eval/                 # AI / ML / LLM & Agentic evaluation harnesses
│           ├── proto-sim-lab/                 # Data Science, Simulation & Computational Modeling
│           ├── proto-hci-study/               # HCI & Interactive UI with Researcher Drawer
│           ├── research-synthesis/            # Paper/report table & findings synthesizer
│           └── agent-skill-factory/           # Meta-skill to add new domain skills & subagents
└── prototypes/                                # Sandbox directory for research prototypes & lab notebooks
```

## Subagents & Skills Summary

| Component | Kind | Purpose |
| :--- | :--- | :--- |
| **`proto-architect`** | Subagent | Turns a research question into `SPEC.md` (hypothesis, variables, conditions) and initializes `LAB_NOTEBOOK.md`. |
| **`proto-builder`** | Subagent | Scaffolds the prototype with deterministic seeding, run telemetry, and (for HCI) the in-app Researcher Drawer. |
| **`proto-verifier`** | Subagent | Executes baseline vs. experimental smoke runs and validates `experiments/runs/` outputs. |
| **`proto-scribe`** | Subagent | Automatically appends run configs, metric comparisons ($\Delta$), and notes into `LAB_NOTEBOOK.md`. |
| **`rapid-prototype`** | Skill | Orchestrates the full 5-step loop from hypothesis to logged experiment. |
| **`proto-ai-eval`** | Skill | Blueprint for AI/LLM/Agentic evaluation harnesses and side-by-side output comparison. |
| **`proto-sim-lab`** | Skill | Blueprint for seeded numerical simulations, parameter sweeps, and equation-to-code traceability. |
| **`proto-hci-study`** | Skill | Blueprint for interactive UI studies with built-in A/B Condition Switcher and live Researcher Drawer. |
| **`research-synthesis`** | Skill | Consolidates runs and observations into publication-ready Markdown/LaTeX tables and takeaways. |
| **`agent-skill-factory`** | Skill | Meta-skill to expand the studio with new domain skills or subagents. |
