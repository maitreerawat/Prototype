---
name: rapid-prototype
description: >-
  End-to-end workflow for rapidly designing, scaffolding, and verifying a new software prototype.
  Use this skill when the user wants to prototype a new idea, spin up a proof-of-concept (PoC),
  or orchestrate architect, builder, and verifier subagents to build a working MVP.
---

# Rapid Prototype Workflow

Use this skill to take a project concept from an initial idea to a working, demonstrable prototype using coordinated subagents.

## Step 1: Scope & Stack Alignment
1. If the user's request leaves the **core interaction**, **target platform/stack**, or **output directory** (default: `prototypes/<slug>/`) unclear, use `ask_question` with 1–3 focused questions.
2. Keep the scope strictly focused on the **Vertical Slice**—the minimum end-to-end flow that proves the idea.

## Step 2: Architecture & Spec (`proto-architect`)
Either write `prototypes/<slug>/SPEC.md` directly (for small prototypes) or delegate to the `proto-architect` subagent (see [architect.md](../../agents/architect.md)):
- Core user story & happy path
- Tech stack & file layout
- Minimal data model & pre-loaded seed data
- How to run and verify

## Step 3: Parallel Scaffolding (`proto-builder`)
Define and invoke `proto-builder` (see [scaffolder.md](../../agents/scaffolder.md)) via `define_subagent` and `invoke_subagent`:
- If the prototype has independent subsystems (e.g., an API backend and a frontend client, or multiple independent modules), spawn parallel `proto-builder` subagents with clear interface contracts from `SPEC.md`.
- Ensure realistic seed data is included so the prototype is immediately demonstrable on first launch.

## Step 4: Smoke Verification (`proto-verifier`)
Run or delegate verification (see [verifier.md](../../agents/verifier.md)):
1. Run build / syntax / dependency checks.
2. Execute a smoke test of the primary user flow.
3. Ensure `prototypes/<slug>/README.md` has a one-command quickstart.
