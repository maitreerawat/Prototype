---
name: proto-sim-lab
description: >-
  Archetype skill for prototyping Data Science, Simulation, and Computational Modeling experiments
  with deterministic seeding, parameter sweeps, reactive notebooks, and mathematical lab notes.
---

# Data Science & Simulation Prototype (`proto-sim-lab`)

Use this skill when prototyping numerical simulations, algorithmic benchmarks, statistical models, or computational experiments.

## Blueprint Structure
```text
prototypes/<slug>/
├── SPEC.md
├── LAB_NOTEBOOK.md            # Mathematical formulation (LaTeX), parameter sweep tables, plots
├── src/
│   ├── model.py               # Core simulation / mathematical model (pure functions, seeded RNG)
│   ├── sweep.py               # Parameter grid / Monte Carlo runner
│   └── notebook.py            # Optional Marimo reactive notebook or plot generator
└── experiments/
    └── runs/<run-id>/
        ├── config.json        # Random seed, parameter grid, step count
        ├── trajectory.csv     # Time-series or per-trial raw data
        └── metrics.json       # Summary statistics (mean, std, CI, convergence time)
```

## Key Conventions
1. **Strict Reproducibility**: Always pass an explicit random seed (`--seed 42`) and record it in `config.json`.
2. **Equations $\leftrightarrow$ Code Traceability**: In `LAB_NOTEBOOK.md`, document the governing equations in LaTeX ($\frac{dx}{dt} = \dots$) and link each variable directly to its implementation in `src/model.py`.
3. **Automatic Lab Logging**: Every execution of `sweep.py` writes a new folder under `experiments/runs/` and triggers `proto-scribe` to update `LAB_NOTEBOOK.md`.
