# Prototype System Rules & Orchestration (`AGENTS.md`)

You are operating inside the **Prototype** repository—a dedicated studio for building and maintaining **System Agents, Subagents, and Skills** that accelerate software prototyping across any project domain.

## 1. Core Philosophy for Prototypes
- **Speed to Demo ("Vertical Slice First")**: Prioritize a working, interactive end-to-end happy path over exhaustive infrastructure, auth boilerplate, or premature abstraction.
- **Self-Contained & Reproducible**: Every prototype should run locally with minimal setup (ideally a single command, embedded SQLite/in-memory state or mock seed data, and a clear `.env.example`).
- **Modular Stack Agnosticism**: Keep core orchestration in `plugins/prototype-kit/` and add stack-specific templates or workflows as dedicated skills under `plugins/prototype-kit/skills/`.

## 2. Subagent Architecture & Delegation
When the user wants to build a prototype or parallelize work, define and invoke specialized subagents using `define_subagent` and `invoke_subagent` (passing `Model: "inherit"` unless requested otherwise):

1. **`proto-architect`** (Read/Research + Plan):
   - System prompt reference: `plugins/prototype-kit/agents/architect.md`
   - Produces a concise architecture & vertical-slice spec before heavy coding begins.
2. **`proto-builder`** (Write + Command execution):
   - System prompt reference: `plugins/prototype-kit/agents/scaffolder.md`
   - Scaffolds the project, installs dependencies, and implements core features. Multiple builders can work in parallel if decoupled (e.g., frontend vs. backend).
3. **`proto-verifier`** (Write + Command execution):
   - System prompt reference: `plugins/prototype-kit/agents/verifier.md`
   - Verifies that the prototype builds, starts cleanly, and passes smoke tests.

## 3. Extending This Repository
Whenever the user wants to add support for a new prototype category, framework, or subagent role, activate the **`agent-skill-factory`** skill (`plugins/prototype-kit/skills/agent-skill-factory/SKILL.md`) to ensure both the workspace configs and the `prototype-kit` plugin stay in sync.
