#!/usr/bin/env python3
"""
Interactive Literature Triage HCI + AI Study Server & Deterministic Simulator (`lit-triage-hci`)

Provides:
1. Zero-dependency HTTP server (`http.server`) serving:
   - `/` -> `src/static/index.html` and static assets
   - `GET /api/papers` -> `data/papers.json`
   - `GET /api/runs` -> list of saved run summaries from `experiments/runs/`
   - `POST /api/runs` -> persists `config.json`, `metrics.json`, `events.jsonl`, `observations.jsonl`
     under `experiments/runs/<run_id>/`
2. Deterministic CLI simulation mode (`--simulate`) that models human-AI screening behavior across
   experimental conditions (`baseline` vs. `evidence-cards`, confidence badges `on` vs. `off`).
"""

from __future__ import annotations

import argparse
import datetime
import json
import mimetypes
import os
import random
import statistics
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "papers.json"
STATIC_DIR = BASE_DIR / "src" / "static"
RUNS_DIR = BASE_DIR / "experiments" / "runs"


def utc_now_iso(offset_sec: float = 0.0) -> str:
    base = datetime.datetime(2026, 10, 10, 23, 35, 0, tzinfo=datetime.timezone.utc)
    dt = base + datetime.timedelta(seconds=offset_sec)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def load_papers() -> List[Dict[str, Any]]:
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def compute_metrics(
    run_id: str,
    condition: str,
    show_confidence_badges: bool,
    decisions: List[Dict[str, Any]],
    papers: List[Dict[str, Any]],
    abstract_expansions: int,
    interaction_count: int,
    expanded_paper_ids: Optional[List[str]] = None,
) -> Dict[str, Any]:
    paper_map = {p["id"]: p for p in papers}
    total_papers = len(papers)
    papers_screened = len(decisions)

    if papers_screened == 0:
        return {
            "run_id": run_id,
            "condition": condition,
            "show_confidence_badges": show_confidence_badges,
            "papers_screened": 0,
            "total_papers": total_papers,
            "accuracy": 0.0,
            "correct_count": 0,
            "mean_decision_time_sec": 0.0,
            "median_decision_time_sec": 0.0,
            "total_elapsed_sec": 0.0,
            "screening_efficiency": 0.0,
            "weak_paper_rejection_accuracy": 0.0,
            "abstract_expansions": abstract_expansions,
            "low_confidence_expansions": 0,
            "selective_verification_ratio": 0.0,
            "interaction_count": interaction_count,
            "precision_include": 0.0,
            "recall_include": 0.0,
            "f1_include": 0.0,
        }

    correct_count = sum(1 for d in decisions if d.get("correct"))
    accuracy = round(correct_count / papers_screened, 4)

    times = [float(d.get("decision_time_sec", 0.0)) for d in decisions]
    total_elapsed = round(sum(times), 2)
    mean_time = round(statistics.mean(times), 2) if times else 0.0
    median_time = round(statistics.median(times), 2) if times else 0.0
    efficiency = round(accuracy / mean_time, 4) if mean_time > 0 else 0.0

    # Methodological weak/borderline trap papers: P03, P05, P08
    trap_decisions = [
        d for d in decisions if paper_map.get(d["paper_id"], {}).get("is_methodological_trap", False)
    ]
    if trap_decisions:
        weak_acc = round(
            sum(1 for d in trap_decisions if d.get("correct")) / len(trap_decisions), 4
        )
    else:
        weak_acc = 0.0

    # Include class precision, recall, F1
    tp = sum(
        1
        for d in decisions
        if d.get("decision") == "include" and d.get("ground_truth") == "include"
    )
    fp = sum(
        1
        for d in decisions
        if d.get("decision") == "include" and d.get("ground_truth") != "include"
    )
    fn = sum(
        1
        for d in decisions
        if d.get("decision") != "include" and d.get("ground_truth") == "include"
    )

    precision_inc = round(tp / (tp + fp), 4) if (tp + fp) > 0 else 0.0
    recall_inc = round(tp / (tp + fn), 4) if (tp + fn) > 0 else 0.0
    if (precision_inc + recall_inc) > 0:
        f1_inc = round(2 * precision_inc * recall_inc / (precision_inc + recall_inc), 4)
    else:
        f1_inc = 0.0

    # Selective Verification Ratio (SVR) for low-confidence papers (confidence < 0.75)
    expanded_set = set(expanded_paper_ids or [])
    low_conf_ids = [p["id"] for p in papers if float(p.get("confidence", 1.0)) < 0.75]
    low_conf_expansions = sum(1 for pid in low_conf_ids if pid in expanded_set)
    low_conf_rate = (low_conf_expansions / len(low_conf_ids)) if low_conf_ids else 0.0
    overall_exp_rate = (len(expanded_set) / total_papers) if total_papers > 0 else 0.0
    svr = round(low_conf_rate / (overall_exp_rate + 1e-6), 4) if overall_exp_rate > 0 else 0.0

    return {
        "run_id": run_id,
        "condition": condition,
        "show_confidence_badges": show_confidence_badges,
        "papers_screened": papers_screened,
        "total_papers": total_papers,
        "accuracy": accuracy,
        "correct_count": correct_count,
        "mean_decision_time_sec": mean_time,
        "median_decision_time_sec": median_time,
        "total_elapsed_sec": total_elapsed,
        "screening_efficiency": efficiency,
        "weak_paper_rejection_accuracy": weak_acc,
        "abstract_expansions": abstract_expansions,
        "low_confidence_expansions": low_conf_expansions,
        "selective_verification_ratio": svr,
        "interaction_count": interaction_count,
        "precision_include": precision_inc,
        "recall_include": recall_inc,
        "f1_include": f1_inc,
    }


def save_run_bundle(
    run_id: str,
    config: Dict[str, Any],
    metrics: Dict[str, Any],
    events: List[Dict[str, Any]],
    observations: List[Dict[str, Any]],
) -> Path:
    run_dir = RUNS_DIR / run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    with open(run_dir / "config.json", "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)
        f.write("\n")

    with open(run_dir / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
        f.write("\n")

    with open(run_dir / "events.jsonl", "w", encoding="utf-8") as f:
        for ev in events:
            f.write(json.dumps(ev) + "\n")

    with open(run_dir / "observations.jsonl", "w", encoding="utf-8") as f:
        for obs in observations:
            f.write(json.dumps(obs) + "\n")

    return run_dir


def simulate_session(
    condition: str = "baseline",
    show_confidence_badges: bool = True,
    seed: int = 42,
    run_id: Optional[str] = None,
) -> Tuple[Path, Dict[str, Any]]:
    """
    Deterministic cognitive simulation of a literature screening session across all 8 papers.
    Models:
    - Reading/parsing time: Full abstract scanning (~16-22s in `baseline`) vs. structured card scan
      (~5.5-8.0s in `evidence-cards`, plus ~4.2s when expanding full abstract on low-confidence items).
    - Methodological discernment: In `baseline`, buried sample sizes (e.g. P03 N=4 pilot or P08 N=21)
      induce higher false-positive inclusion rates under rapid triage. In `evidence-cards`, explicit
      Sample Size & Limitation badges surface methodological traps immediately.
    - Confidence calibration: When `show_confidence_badges` is enabled in `evidence-cards`, low AI
      confidence scores (< 0.75 on P05 and P08) selectively trigger 1-click abstract verification.
    """
    rng = random.Random(seed)
    papers = load_papers()

    badge_suffix = "badges_on" if show_confidence_badges else "badges_off"
    if not run_id:
        if condition == "baseline":
            run_id = f"sim_{condition}_s{seed}"
        else:
            run_id = f"sim_{condition}_{badge_suffix}_s{seed}"

    events: List[Dict[str, Any]] = []
    observations: List[Dict[str, Any]] = []
    decisions: List[Dict[str, Any]] = []
    expanded_paper_ids: List[str] = []

    elapsed = 0.0
    interaction_count = 1  # session_start
    abstract_expansions = 0

    events.append(
        {
            "ts": utc_now_iso(elapsed),
            "event": "session_start",
            "condition": condition,
            "show_confidence_badges": show_confidence_badges,
            "seed": seed,
        }
    )

    for paper in papers:
        pid = paper["id"]
        gt = paper["ground_truth"]
        conf = float(paper.get("confidence", 0.9))
        word_count = len(paper["abstract"].split())

        events.append(
            {
                "ts": utc_now_iso(elapsed + 0.15),
                "event": "paper_view",
                "paper_id": pid,
                "condition": condition,
            }
        )

        if condition == "baseline":
            # Full abstract linear reading time (~0.135s/word + cognitive evaluation jitter)
            base_read_sec = word_count * 0.138 + rng.uniform(1.8, 4.4)
            if paper.get("is_methodological_trap"):
                base_read_sec += rng.uniform(1.5, 3.2)
            decision_time = round(base_read_sec, 2)

            # Decision model for baseline:
            # P03 (N=4 pilot) has enthusiastic abstract language ("transform human-AI collaborative risk auditing",
            # "much faster and more confident") that causes false-positive 'include' in rapid prose reading.
            # P08 (N=21) has strong quantitative numbers (61.3% vs 42.0%) buried before the N=21 caveat.
            roll = rng.random()
            if pid == "P03":
                # Buried N=4 limitation missed in rapid baseline scan -> false positive include
                pred = "include" if roll < 0.92 else "exclude"
            elif pid == "P08":
                # Misclassified as 'include' because 61.3% accuracy gain is prominent before N=21 caveat
                pred = "include" if roll < 0.90 else "maybe"
            elif pid == "P05":
                pred = "maybe" if roll < 0.88 else "exclude"
            else:
                pred = gt if roll < 0.96 else ("maybe" if gt == "include" else "include")

        else:
            # Condition B: Structured AI Evidence Cards
            # Fast structured scan of 5 badged fields
            card_scan_sec = rng.uniform(4.8, 6.8)
            expanded_this_paper = False

            if show_confidence_badges:
                # Calibrated attention (H3): expand full abstract when AI confidence < 0.75 (P05, P08)
                if conf < 0.75:
                    expanded_this_paper = rng.random() < 0.98
                else:
                    expanded_this_paper = rng.random() < 0.03
            else:
                # Without confidence badges, user lacks explicit low-confidence signal on P05/P08
                if conf < 0.75:
                    expanded_this_paper = rng.random() < 0.25
                else:
                    expanded_this_paper = rng.random() < 0.05

            if expanded_this_paper:
                abstract_expansions += 1
                interaction_count += 1
                expanded_paper_ids.append(pid)
                verify_sec = rng.uniform(3.5, 4.9)
                events.append(
                    {
                        "ts": utc_now_iso(elapsed + card_scan_sec),
                        "event": "abstract_expand",
                        "paper_id": pid,
                        "confidence": conf,
                        "condition": condition,
                    }
                )
                decision_time = round(card_scan_sec + verify_sec, 2)
            else:
                decision_time = round(card_scan_sec, 2)

            # Decision model for evidence-cards:
            # Explicit N=4 and limitation badge on P03 makes rejection immediate and accurate.
            roll = rng.random()
            if pid == "P03":
                pred = "exclude" if roll < 0.98 else "maybe"
            elif pid in ("P05", "P08"):
                if expanded_this_paper:
                    pred = "maybe" if roll < 0.98 else "include"
                else:
                    # Without expanding low-confidence card, higher chance of over-inclusion on P05
                    if pid == "P05":
                        pred = "include" if roll < 0.85 else "maybe"
                    else:
                        pred = "maybe" if roll < 0.85 else "include"
            else:
                pred = gt if roll < 0.98 else "maybe"

        elapsed = round(elapsed + decision_time, 2)
        interaction_count += 1
        is_correct = pred == gt

        decision_record = {
            "ts": utc_now_iso(elapsed),
            "event": "triage_decision",
            "paper_id": pid,
            "decision": pred,
            "ground_truth": gt,
            "correct": is_correct,
            "decision_time_sec": decision_time,
            "condition": condition,
        }
        decisions.append(decision_record)
        events.append(decision_record)

        # Generate realistic timestamped researcher observations on key diagnostic papers
        if pid == "P03":
            if condition == "baseline":
                observations.append(
                    {
                        "ts": utc_now_iso(elapsed),
                        "condition": condition,
                        "paper_id": "P03",
                        "elapsed_sec": elapsed,
                        "note": (
                            f"Baseline prose emphasized 'AuditMate co-pilot' and positive analyst feedback; "
                            f"buried N=4 unrepresentative intern sample took {decision_time}s to parse and induced false-positive risk."
                        ),
                    }
                )
            else:
                observations.append(
                    {
                        "ts": utc_now_iso(elapsed),
                        "condition": condition,
                        "paper_id": "P03",
                        "elapsed_sec": elapsed,
                        "note": (
                            f"Limitation highlight and N=4 badge immediately exposed the underpowered pilot trap "
                            f"in {decision_time}s without reading the full 155-word abstract."
                        ),
                    }
                )
        elif pid == "P05" and condition == "evidence-cards":
            if show_confidence_badges and pid in expanded_paper_ids:
                observations.append(
                    {
                        "ts": utc_now_iso(elapsed),
                        "condition": condition,
                        "paper_id": "P05",
                        "elapsed_sec": elapsed,
                        "note": (
                            "Low AI confidence badge (0.62) triggered 1-click abstract expansion, confirming "
                            "borderline N=18 human validation cohort -> triaged as 'maybe'."
                        ),
                    }
                )
            elif not show_confidence_badges:
                observations.append(
                    {
                        "ts": utc_now_iso(elapsed),
                        "condition": condition,
                        "paper_id": "P05",
                        "elapsed_sec": elapsed,
                        "note": (
                            "With confidence badges hidden, borderline extraction uncertainty on P05 was less salient."
                        ),
                    }
                )
        elif pid == "P08" and condition == "evidence-cards" and show_confidence_badges and pid in expanded_paper_ids:
            observations.append(
                {
                    "ts": utc_now_iso(elapsed),
                    "condition": condition,
                    "paper_id": "P08",
                    "elapsed_sec": elapsed,
                    "note": (
                        "Low confidence badge (0.68) + N=21 badge prompted quick abstract verification to confirm "
                        "sample falls in borderline 15-25 range."
                    ),
                }
            )

    config = {
        "run_id": run_id,
        "timestamp": utc_now_iso(0.0),
        "condition": condition,
        "show_confidence_badges": show_confidence_badges,
        "seed": seed,
        "mode": "simulated",
        "total_papers": len(papers),
    }

    metrics = compute_metrics(
        run_id=run_id,
        condition=condition,
        show_confidence_badges=show_confidence_badges,
        decisions=decisions,
        papers=papers,
        abstract_expansions=abstract_expansions,
        interaction_count=interaction_count,
        expanded_paper_ids=expanded_paper_ids,
    )

    run_dir = save_run_bundle(run_id, config, metrics, events, observations)
    return run_dir, metrics


def list_saved_runs() -> List[Dict[str, Any]]:
    if not RUNS_DIR.exists():
        return []
    runs: List[Dict[str, Any]] = []
    for entry in sorted(RUNS_DIR.iterdir()):
        if entry.is_dir():
            cfg_path = entry / "config.json"
            met_path = entry / "metrics.json"
            if cfg_path.exists() and met_path.exists():
                try:
                    with open(cfg_path, "r", encoding="utf-8") as cf:
                        cfg = json.load(cf)
                    with open(met_path, "r", encoding="utf-8") as mf:
                        met = json.load(mf)
                    runs.append(
                        {
                            "run_id": entry.name,
                            "path": f"experiments/runs/{entry.name}",
                            "config": cfg,
                            "metrics": met,
                        }
                    )
                except Exception:
                    continue
    return runs


class LitTriageRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args: Any) -> None:
        sys.stderr.write(f"[lit-triage-hci] {self.address_string()} - {fmt % args}\n")

    def _send_json(self, payload: Any, status: int = 200) -> None:
        raw = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        route = parsed.path

        if route == "/api/papers":
            papers = load_papers()
            self._send_json({"papers": papers, "total": len(papers)})
            return

        if route == "/api/runs":
            runs = list_saved_runs()
            self._send_json({"runs": runs, "count": len(runs)})
            return

        # Serve static files from src/static/
        if route == "/" or route == "":
            target = STATIC_DIR / "index.html"
        else:
            rel = route.lstrip("/")
            target = (STATIC_DIR / rel).resolve()
            # Prevent path traversal outside STATIC_DIR
            if not str(target).startswith(str(STATIC_DIR.resolve())):
                self._send_json({"error": "Forbidden"}, status=403)
                return

        if not target.exists() or not target.is_file():
            self._send_json({"error": f"Not found: {route}"}, status=404)
            return

        mime_type, _ = mimetypes.guess_type(str(target))
        if not mime_type:
            mime_type = "application/octet-stream"

        content = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mime_type)
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(content)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/api/runs":
            self._send_json({"error": "Not found"}, status=404)
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            payload = json.loads(body_bytes.decode("utf-8"))
        except Exception as exc:
            self._send_json({"error": f"Invalid JSON payload: {exc}"}, status=400)
            return

        papers = load_papers()
        now_slug = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d_%H%M%S")
        condition = payload.get("condition", "baseline")
        show_badges = bool(payload.get("show_confidence_badges", True))
        seed = int(payload.get("seed", 42))
        run_id = payload.get("run_id") or f"run_{now_slug}_{condition}"

        # Sanitize run_id
        safe_run_id = "".join(c if (c.isalnum() or c in "-_") else "_" for c in str(run_id))

        decisions = payload.get("decisions", [])
        events = payload.get("events", [])
        observations = payload.get("observations", [])
        abstract_expansions = int(payload.get("abstract_expansions", 0))
        interaction_count = int(payload.get("interaction_count", len(events)))
        expanded_paper_ids = payload.get("expanded_paper_ids", [])

        config = payload.get("config") or {
            "run_id": safe_run_id,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "condition": condition,
            "show_confidence_badges": show_badges,
            "seed": seed,
            "mode": payload.get("mode", "interactive"),
            "total_papers": len(papers),
        }
        config["run_id"] = safe_run_id

        metrics = payload.get("metrics") or compute_metrics(
            run_id=safe_run_id,
            condition=condition,
            show_confidence_badges=show_badges,
            decisions=decisions,
            papers=papers,
            abstract_expansions=abstract_expansions,
            interaction_count=interaction_count,
            expanded_paper_ids=expanded_paper_ids,
        )
        metrics["run_id"] = safe_run_id

        run_dir = save_run_bundle(
            run_id=safe_run_id,
            config=config,
            metrics=metrics,
            events=events,
            observations=observations,
        )

        rel_path = f"experiments/runs/{safe_run_id}"
        self._send_json(
            {
                "status": "ok",
                "run_id": safe_run_id,
                "run_dir": rel_path,
                "abs_dir": str(run_dir),
                "config": config,
                "metrics": metrics,
            },
            status=201,
        )


def parse_bool_flag(val: str) -> bool:
    return str(val).strip().lower() in ("on", "true", "1", "yes")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Interactive Literature Triage HCI + AI Study Server & CLI Simulator"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8765,
        help="Port for the interactive web server (default: 8765)",
    )
    parser.add_argument(
        "--host",
        type=str,
        default="127.0.0.1",
        help="Host address to bind (default: 127.0.0.1)",
    )
    parser.add_argument(
        "--simulate",
        action="store_true",
        help="Run deterministic headless screening simulation instead of starting HTTP server",
    )
    parser.add_argument(
        "--condition",
        type=str,
        choices=["baseline", "evidence-cards", "all"],
        default=None,
        help="Experimental condition to simulate ('baseline', 'evidence-cards', or 'all')",
    )
    parser.add_argument(
        "--confidence-badges",
        type=str,
        default="on",
        help="Toggle confidence badges in simulation ('on' or 'off', default: 'on')",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for deterministic simulation (default: 42)",
    )
    parser.add_argument(
        "--run-id",
        type=str,
        default=None,
        help="Explicit run ID directory name under experiments/runs/<run-id>/",
    )

    args = parser.parse_args()

    if args.simulate:
        show_badges = parse_bool_flag(args.confidence_badges)
        if args.condition is None or args.condition == "all":
            # Run both baseline and evidence-cards when no single condition is specified
            _, m_base = simulate_session(
                condition="baseline",
                show_confidence_badges=False,
                seed=args.seed,
                run_id=f"{args.run_id}_baseline" if args.run_id else f"sim_baseline_s{args.seed}",
            )
            _, m_cards = simulate_session(
                condition="evidence-cards",
                show_confidence_badges=show_badges,
                seed=args.seed,
                run_id=f"{args.run_id}_evidence_cards"
                if args.run_id
                else f"sim_evidence_cards_s{args.seed}",
            )
            print(json.dumps({"baseline": m_base, "evidence-cards": m_cards}, indent=2))
        else:
            _, metrics = simulate_session(
                condition=args.condition,
                show_confidence_badges=show_badges,
                seed=args.seed,
                run_id=args.run_id,
            )
            print(json.dumps(metrics, indent=2))
        return

    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    server = HTTPServer((args.host, args.port), LitTriageRequestHandler)
    print(f"lit-triage-hci server listening on http://{args.host}:{args.port}")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()


if __name__ == "__main__":
    main()
