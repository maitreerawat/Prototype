# Prototype Studio — Agent & Skill System

Welcome to **Prototype**! This repository houses a modular system of **Antigravity Agents, Subagents, Rules, and Skills** designed to rapidly ideate, architect, scaffold, and verify prototypes across different types of projects.

## Dual-Mode Architecture (Workspace + Plugin)

This repository is structured to work in **two ways simultaneously**:
1. **Directly as a Workspace**: Opening `/Users/maitree/Prototype` in Antigravity automatically discovers `.agents/plugins.json` and `AGENTS.md`, loading all prototyping rules, skills, and subagent workflows immediately.
2. **As a Reusable Plugin (`prototype-kit`)**: The core bundle lives in `plugins/prototype-kit/` with a valid `plugin.json` manifest, so it can be installed or shared as a single self-contained unit across any workspace.

```text
Prototype/
├── AGENTS.md                                  # Workspace-level entry rules & subagent orchestration guide
├── .agents/
│   ├── plugins.json                           # Registers plugins/ directory for automatic workspace discovery
│   └── skills.json                            # Registers plugin skills directly for workspace discovery
├── plugins/
│   └── prototype-kit/                         # Self-contained Antigravity Plugin bundle
│       ├── plugin.json                        # Plugin manifest
│       ├── README.md                          # Plugin documentation
│       ├── rules/
│       │   └── AGENTS.md                      # Always-on prototyping principles & subagent definitions
│       ├── agents/                            # Specialized subagent prompt profiles
│       │   ├── architect.md                   # Rapid Architect & Spec Designer
│       │   ├── scaffolder.md                  # Stack Scaffolder & Builder
│       │   └── verifier.md                    # Smoke Tester & Demo Verifier
│       └── skills/                            # On-demand modular skills
│           ├── rapid-prototype/
│           │   └── SKILL.md                   # End-to-end rapid prototyping workflow
│           └── agent-skill-factory/
│               └── SKILL.md                   # Meta-skill to create new prototype agents & skills
└── prototypes/                                # Sandbox directory for generated prototypes (optional)
```

## Core Subagent Roles

When building a prototype, the primary agent coordinates specialized subagents (via `define_subagent` / `invoke_subagent`):

| Subagent | Role | Responsibility |
| :--- | :--- | :--- |
| **`proto-architect`** | Rapid Prototype Architect | Clarifies scope, picks the leanest stack, and writes a 1-page `SPEC.md` with data models and vertical slices. |
| **`proto-builder`** | Full-Stack Prototype Scaffolder | Implements the vertical slice rapidly with working UI/API/CLI, realistic seed data, and zero boilerplate bloat. |
| **`proto-verifier`** | Prototype QA & Demo Verifier | Runs build/smoke checks, verifies the happy path works end-to-end, and writes run instructions. |

## Included Skills

- **`rapid-prototype`**: End-to-end runbook for taking a rough idea from concept to a running, demonstrable prototype in minutes.
- **`agent-skill-factory`**: Meta-skill for designing and adding new stack-specific skills (e.g., Web App, FastAPI, AI Agent, CLI) or specialized subagents to this repository as you decide on new project types.
