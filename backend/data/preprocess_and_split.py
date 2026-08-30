#!/usr/bin/env python3
"""
AI-Powered Cyber Threat Detection System - Dataset Stratified Splitter
======================================================================
Splits the combined multi-vector flow dataset into Train (70%), Validation (15%),
and Test (15%) splits while preserving balanced class representation across all
attack categories (stratified sampling).

Exports:
  data/splits/train.csv & train.json
  data/splits/val.csv & val.json
  data/splits/test.csv & test.json
"""

import os
import sys
import json
import csv
import random
from collections import defaultdict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(BASE_DIR, "flows", "sample_mixed_flows.json")
SPLITS_DIR = os.path.join(BASE_DIR, "splits")
os.makedirs(SPLITS_DIR, exist_ok=True)

SEED = 42
random.seed(SEED)

def stratified_split(records, train_ratio=0.70, val_ratio=0.15):
    """Splits records into stratified train, val, and test partitions."""
    class_buckets = defaultdict(list)
    for row in records:
        label = row.get("attack_type", "BENIGN")
        class_buckets[label].append(row)
        
    train_set, val_set, test_set = [], [], []
    
    print(f"{'Attack Class':<28} | {'Total':<6} | {'Train':<6} | {'Val':<6} | {'Test':<6}")
    print("-" * 62)
    
    for label, items in sorted(class_buckets.items()):
        random.shuffle(items)
        n = len(items)
        n_train = int(n * train_ratio)
        n_val = int(n * val_ratio)
        
        train_items = items[:n_train]
        val_items = items[n_train:n_train + n_val]
        test_items = items[n_train + n_val:]
        
        train_set.extend(train_items)
        val_set.extend(val_items)
        test_set.extend(test_items)
        
        print(f"{label:<28} | {n:<6} | {len(train_items):<6} | {len(val_items):<6} | {len(test_items):<6}")
        
    random.shuffle(train_set)
    random.shuffle(val_set)
    random.shuffle(test_set)
    
    return train_set, val_set, test_set

def export_split(split_name, data):
    json_path = os.path.join(SPLITS_DIR, f"{split_name}.json")
    csv_path = os.path.join(SPLITS_DIR, f"{split_name}.csv")
    
    with open(json_path, "w", encoding="utf-8") as fp:
        json.dump(data, fp, indent=2)
        
    if data:
        keys = list(data[0].keys())
        with open(csv_path, "w", newline="", encoding="utf-8") as fp:
            writer = csv.DictWriter(fp, fieldnames=keys)
            writer.writeheader()
            for row in data:
                clean_row = {}
                for k, v in row.items():
                    clean_row[k] = json.dumps(v) if isinstance(v, (dict, list)) else v
                writer.writerow(clean_row)
                
    print(f"  [+] Saved {split_name}: {len(data)} rows ({json_path}, {csv_path})")

def main():
    print("=================================================================")
    print("✂️  Performing Stratified Dataset Splitting (70% Train, 15% Val, 15% Test)")
    print("=================================================================\n")
    
    if not os.path.exists(INPUT_FILE):
        print(f"Error: {INPUT_FILE} not found. Run generate_datasets.py first.")
        sys.exit(1)
        
    with open(INPUT_FILE, "r", encoding="utf-8") as fp:
        all_flows = json.load(fp)
        
    train_set, val_set, test_set = stratified_split(all_flows)
    
    print("\nWriting split files...")
    export_split("train", train_set)
    export_split("val", val_set)
    export_split("test", test_set)
    
    print("\n✨ Stratified dataset splits generated successfully!")

if __name__ == "__main__":
    main()
