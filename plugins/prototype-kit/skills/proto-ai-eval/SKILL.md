---
name: proto-ai-eval
description: >-
  Archetype skill for prototyping AI, ML, LLM, and Agentic research experiments (prompts, RAG,
  multi-agent workflows, embeddings, or model evaluations) with side-by-side output comparison and lab logging.
---

# AI / ML / Agentic Research Prototype (`proto-ai-eval`)

Use this skill when prototyping an AI/ML or LLM experiment where the researcher wants to test prompts, agent architectures, retrieval strategies, or scoring metrics side by side with structured notes.

## Blueprint Structure
```text
prototypes/<slug>/
├── SPEC.md
├── LAB_NOTEBOOK.md
├── data/
│   └── eval_cases.json        # Seed evaluation dataset (5–15 realistic test cases)
├── src/
│   ├── runner.py              # CLI/script accepting --condition, --model, --seed
│   ├── conditions.py          # Baseline vs. Variant implementations
│   └── evaluator.py           # Exact-match, heuristic, or LLM-as-judge scoring
└── experiments/
    └── runs/<run-id>/
        ├── config.json        # Prompt template, hyperparameters, git commit
        ├── predictions.jsonl  # Per-example input, baseline vs. variant output, score
        └── metrics.json       # Aggregate accuracy, latency, token usage
```

## Key Conventions
1. **Zero-Friction Fallback**: Support both live API keys (via `.env`) and a deterministic mock/cached mode so the evaluation harness can be smoke-tested immediately offline.
2. **Side-by-Side Diff Table**: After each run, output a Markdown comparison table showing side-by-side qualitative outputs (`Input | Baseline Output | Variant Output | Score`) and trigger `proto-scribe` to log the aggregate metrics in `LAB_NOTEBOOK.md`.
