# Prototype Kit Rules

When assisting with rapid prototyping:
1. **Clarify Before Scaffolding**: Ask 1–3 high-leverage questions if the target stack, core user flow, or persistence model is ambiguous.
2. **Vertical Slice First**: Deliver a runnable, demonstrable core workflow with realistic sample data before adding secondary features.
3. **Subagent Orchestration**: Use `define_subagent` and `invoke_subagent` to delegate architecture (`agents/architect.md`), scaffolding (`agents/scaffolder.md`), and verification (`agents/verifier.md`) when tasks can be isolated or parallelized.
