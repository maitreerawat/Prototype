---
name: agent-skill-factory
description: >-
  Meta-skill for creating new prototyping subagents, stack-specific skills, and templates in this repository.
  Use this skill whenever the user wants to add a new agent role, create a new prototype template/skill
  (e.g., for Web, Backend, AI, CLI, Mobile), or expand the prototype-kit plugin.
---

# Agent & Skill Factory

Use this skill to design and register new subagents and skills inside the `Prototype` repository while maintaining dual compatibility (both direct workspace discovery and the `prototype-kit` plugin bundle).

## 1. Adding a New Prototyping Skill
When the user decides on a project archetype or tech stack to codify into a reusable skill:

1. **Create the Skill Directory**:
   Place it inside `plugins/prototype-kit/skills/<skill-name>/SKILL.md` (with optional `scripts/`, `resources/`, or `references/` folders).
2. **Author `SKILL.md`**:
   - Include YAML frontmatter with `name` (lowercase kebab-case) and a third-person `description` stating **what** it builds and **when** to activate it.
   - Specify default stack choices, directory layout, starter dependencies, seed data conventions, and verification commands.
3. **Automatic Discovery**:
   Because `.agents/skills.json` points to `plugins/prototype-kit/skills` and `.agents/plugins.json` points to `plugins`, any skill added under `plugins/prototype-kit/skills/<skill-name>/SKILL.md` is automatically available both in the workspace and in the packaged plugin.

## 2. Adding a New Subagent Profile
When the user wants a specialized subagent (e.g., `ui-polisher`, `api-mocker`, `db-seeder`, `prompt-tuner`):

1. **Create the Subagent Spec**:
   Create `plugins/prototype-kit/agents/<agent-name>.md` documenting:
   - Role & Purpose
   - Recommended `define_subagent` parameters (`name`, `enable_write_tools`, `enable_mcp_tools`, `enable_subagent_tools`)
   - Complete System Prompt & output contract
2. **Register in Rules**:
   Add a brief entry to `AGENTS.md` (and `plugins/prototype-kit/rules/AGENTS.md`) so the primary orchestrator knows when to define and invoke the new subagent.
