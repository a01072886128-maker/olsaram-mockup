#!/usr/bin/env python3
"""Predict reservation risk level using the trained RandomForest model."""

import argparse
import json
from pathlib import Path

import joblib
import pandas as pd


def parse_args():
    parser = argparse.ArgumentParser(description="Predict reservation risk level")
    parser.add_argument("--model", required=True, help="Path to the trained model (joblib)")
    parser.add_argument("--noshow_count", type=int, required=True)
    parser.add_argument("--reservation_count", type=int, required=True)
    parser.add_argument("--weekday", required=True)
    parser.add_argument("--hour", type=int, required=True)
    parser.add_argument("--party_size", type=int, required=True)
    parser.add_argument("--payment_method", required=True)
    return parser.parse_args()


def main():
    args = parse_args()
    model_path = Path(args.model)
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found: {model_path}")

    bundle = joblib.load(model_path)
    pipeline = bundle["pipeline"]

    features = pd.DataFrame([
        {
            "noshow_count": args.noshow_count,
            "reservation_count": args.reservation_count,
            "weekday": args.weekday,
            "hour": args.hour,
            "party_size": args.party_size,
            "payment_method": args.payment_method,
        }
    ])

    predicted_label = pipeline.predict(features)[0]
    probabilities = pipeline.predict_proba(features)[0]
    classes = pipeline.classes_

    payload = {
        "risk_level": str(predicted_label),
        "proba": {cls: float(prob) for cls, prob in zip(classes, probabilities)},
    }

    print(json.dumps(payload))


if __name__ == "__main__":
    main()
