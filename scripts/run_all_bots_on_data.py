#!/usr/bin/env python3
"""
scripts/run_all_bots_on_data.py

Runs all 6 Specialist AI Threat Detection Bots against the datasets present in
data/flows/ and data/synthetic/, measuring detection accuracy, F1-score, confusion
matrix, and prediction throughput.

Usage:
    python scripts/run_all_bots_on_data.py
"""

import os
import sys
import time
import csv
import json
from typing import Dict, Any, List

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ai_models.common.model_registry import load_all_bots, load_bot

SAVED_MODELS_DIR = os.path.join(PROJECT_ROOT, "ai_models", "saved_models")
DATA_FLOWS_DIR = os.path.join(PROJECT_ROOT, "data", "flows")


def load_csv_data(filepath: str) -> List[Dict[str, Any]]:
    if not os.path.exists(filepath):
        return []
    rows = []
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)
    return rows


def evaluate_bot_dataset(bot, dataset_rows: List[Dict[str, Any]], ground_truth_key: str = "is_attack"):
    total = len(dataset_rows)
    if total == 0:
        return None

    ground_truths = []
    for row in dataset_rows:
        raw_val = row.get(ground_truth_key, row.get("is_dga", row.get("is_attack", False)))
        if isinstance(raw_val, str):
            truth_malicious = raw_val.strip().lower() in ["true", "1", "t", "yes", "attack", "malicious"]
        else:
            truth_malicious = bool(raw_val)
        ground_truths.append(truth_malicious)

    t0 = time.perf_counter()
    results = bot.predict_batch(dataset_rows)
    t1 = time.perf_counter()
    total_time_ms = (t1 - t0) * 1000.0
    avg_latency = total_time_ms / max(1, total)

    tp = fp = tn = fn = 0
    for truth_malicious, res in zip(ground_truths, results):
        pred_malicious = res.malicious
        if truth_malicious and pred_malicious:
            tp += 1
        elif not truth_malicious and not pred_malicious:
            tn += 1
        elif not truth_malicious and pred_malicious:
            fp += 1
        elif truth_malicious and not pred_malicious:
            fn += 1

    accuracy = (tp + tn) / max(1, total)
    precision = tp / max(1, tp + fp)
    recall = tp / max(1, tp + fn)
    f1 = 2 * (precision * recall) / max(1e-6, (precision + recall))

    return {
        "bot_name": bot.bot_name,
        "category": bot.threat_category,
        "total_samples": total,
        "tp": tp,
        "tn": tn,
        "fp": fp,
        "fn": fn,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "avg_latency_ms": avg_latency,
    }


try:
    if sys.stdout and hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass



def main():
    print("=" * 80)
    print(" EVALUATING 6 SPECIALIST AI BOTS ON DATASETS IN data/flows/ ")
    print("=" * 80)

    # 1. Check/Load models
    bots = load_all_bots(SAVED_MODELS_DIR)
    if not bots:
        print("[!] No trained models found in saved_models directory.")
        print("    Please run: Get-ChildItem -Path 'ai_models\\bots\\*\\train.py' | ForEach-Object { python $_.FullName }")
        return

    print(f"Loaded {len(bots)} active specialist bots from saved_models:")
    for b in bots:
        print(f"  * {b} ({bots[b].threat_category})")
    print("-" * 80)

    # Map each bot to its corresponding dataset file
    eval_plan = [
        {
            "bot_name": "ddos_bot",
            "file": os.path.join(DATA_FLOWS_DIR, "ddos_flows.csv"),
            "gt_key": "is_attack",
        },
        {
            "bot_name": "beaconing_bot",
            "file": os.path.join(DATA_FLOWS_DIR, "beacon_sessions.csv"),
            "gt_key": "is_attack",
        },
        {
            "bot_name": "dga_dns_bot",
            "file": os.path.join(DATA_FLOWS_DIR, "dga_domains.csv"),
            "gt_key": "is_dga",
        },
        {
            "bot_name": "encrypted_malware_bot",
            "file": os.path.join(DATA_FLOWS_DIR, "encrypted_malware_ja3.csv"),
            "gt_key": "is_attack",
        },
        {
            "bot_name": "scanning_bot",
            "file": os.path.join(DATA_FLOWS_DIR, "port_scan_sessions.csv"),
            "gt_key": "is_attack",
        },
        {
            "bot_name": "exfiltration_bot",
            "file": os.path.join(DATA_FLOWS_DIR, "exfiltration_ratios.csv"),
            "gt_key": "is_attack",
        },
    ]

    results = []

    for item in eval_plan:
        bot_name = item["bot_name"]
        if bot_name not in bots:
            print(f"[!] Skipping {bot_name}: model not found.")
            continue

        bot = bots[bot_name]
        data_file = item["file"]
        if not os.path.exists(data_file):
            print(f"[!] Dataset {os.path.basename(data_file)} not found for {bot_name}.")
            continue

        rows = load_csv_data(data_file)
        metrics = evaluate_bot_dataset(bot, rows, ground_truth_key=item["gt_key"])
        if metrics:
            results.append(metrics)
            print(f"[+] {bot_name:<24} | Samples: {metrics['total_samples']:>5} | Acc: {metrics['accuracy']*100:>6.2f}% | F1: {metrics['f1']:>6.4f} | Latency: {metrics['avg_latency_ms']:>5.2f}ms")

    print("\n" + "=" * 80)
    print(" DETAILED PERFORMANCE SUMMARY TABLE")
    print("=" * 80)
    header = f"{'Bot Name':<22} | {'Category':<22} | {'Samples':<7} | {'Accuracy':<8} | {'Precision':<9} | {'Recall':<7} | {'F1-Score':<8} | {'Latency':<8}"
    print(header)
    print("-" * len(header))
    for r in results:
        print(f"{r['bot_name']:<22} | {r['category']:<22} | {r['total_samples']:<7} | {r['accuracy']*100:>6.2f}%  | {r['precision']:>9.4f} | {r['recall']:>7.4f} | {r['f1']:>8.4f} | {r['avg_latency_ms']:>6.2f}ms")

    print("=" * 80)


if __name__ == "__main__":
    main()
