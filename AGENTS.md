# Prototype Studio — Research-First Agent & Skill System (`AGENTS.md`)

You are operating inside the **Prototype** repository—a dedicated studio for building and maintaining **System Agents, Subagents, and Skills** that accelerate **research prototyping, experimentation, and side-by-side lab note-taking**.

## 1. Core Philosophy for Research Prototypes
- **Experimentation & Notes Side by Side**: Every prototype pairs runnable code with a live `LAB_NOTEBOOK.md` and structured run telemetry (`experiments/runs/<run-id>/`). Interactive HCI prototypes additionally embed a collapsible **Researcher Drawer** for live A/B condition switching and timestamped observation logging.
- **Hypothesis-Driven Vertical Slice**: Prioritize a reproducible baseline vs. experimental condition happy path with deterministic seeds and realistic fixtures.
- **Dual Automatic + On-Demand Note-Taking**:
  - **Automatic**: After each experiment run or code iteration, `proto-scribe` appends the hypothesis, config, metrics delta ($\Delta$), and observations to `LAB_NOTEBOOK.md`.
  - **On-Demand**: The `research-synthesis` skill consolidates runs into publication-ready Markdown/LaTeX tables and findings summaries.

## 2. Subagent Architecture & Delegation
When building or iterating on a research prototype, define and invoke specialized subagents using `define_subagent` and `invoke_subagent` (passing `Model: "inherit"` unless requested otherwise):

1. **`proto-architect`** (Study & Spec Designer):
   - System prompt reference: `plugins/prototype-kit/agents/architect.md`
   - Produces `SPEC.md` (hypothesis, independent/dependent variables, conditions) and initializes `LAB_NOTEBOOK.md`.
2. **`proto-builder`** (Experiment & Prototype Scaffolder):
   - System prompt reference: `plugins/prototype-kit/agents/scaffolder.md`
   - Implements the prototype, condition switches, seed fixtures, and telemetry/Researcher Drawer hooks.
3. **`proto-verifier`** (Experiment Runner & QA):
   - System prompt reference: `plugins/prototype-kit/agents/verifier.md`
   - Validates builds, executes baseline vs. variant smoke runs, and verifies structured output in `experiments/runs/`.
4. **`proto-scribe`** (Automatic Lab Logger):
   - System prompt reference: `plugins/prototype-kit/agents/scribe.md`
   - Automatically records run parameters, commit state, quantitative metrics, and observations into `LAB_NOTEBOOK.md`.

## 3. Domain Archetype & Synthesis Skills
- **`rapid-prototype`**: End-to-end 5-step research prototyping loop (`plugins/prototype-kit/skills/rapid-prototype/SKILL.md`).
- **`proto-ai-eval`**: AI / ML / LLM & Agentic evaluation harnesses (`plugins/prototype-kit/skills/proto-ai-eval/SKILL.md`).
- **`proto-sim-lab`**: Data Science, Simulation & Computational Modeling (`plugins/prototype-kit/skills/proto-sim-lab/SKILL.md`).
- **`proto-hci-study`**: HCI & Interactive UI User-Study prototypes with built-in Researcher Drawer (`plugins/prototype-kit/skills/proto-hci-study/SKILL.md`).
- **`research-synthesis`**: Consolidates experiment runs and notes into paper/report-ready tables (`plugins/prototype-kit/skills/research-synthesis/SKILL.md`).
- **`agent-skill-factory`**: Meta-skill for adding new subagents or domain skills (`plugins/prototype-kit/skills/agent-skill-factory/SKILL.md`).
