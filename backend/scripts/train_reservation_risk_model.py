#!/usr/bin/env python3
"""
Train a RandomForest model that predicts reservation risk level (high/medium/low)
based on synthetic OCR-friendly reservation statistics.

Usage:
    python backend/scripts/train_reservation_risk_model.py \
        --data backend/data/reservation_risk.csv \
        --output backend/models/reservation_risk_model.pkl
"""

from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


def load_dataset(csv_path: Path) -> pd.DataFrame:
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset not found: {csv_path}")
    df = pd.read_csv(csv_path)
    if "risk_level" not in df.columns:
        raise ValueError("CSV must contain a 'risk_level' target column.")
    return df


def build_pipeline() -> Pipeline:
    categorical_features = ["weekday", "payment_method"]
    numeric_features = ["noshow_count", "reservation_count", "hour", "party_size"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
            ("num", "passthrough", numeric_features),
        ]
    )

    model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        class_weight="balanced_subsample",
    )

    return Pipeline(
        steps=[
            ("preprocess", preprocessor),
            ("model", model),
        ]
    )


def train(args: argparse.Namespace) -> None:
    df = load_dataset(Path(args.data))
    X = df.drop(columns=["risk_level"])
    y = df["risk_level"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)
    acc = accuracy_score(y_test, predictions)

    print("=" * 60)
    print("RandomForest reservation risk classifier")
    print(f"Accuracy: {acc:.4f}")
    print("-" * 60)
    print(classification_report(y_test, predictions))

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    joblib.dump(
        {
            "pipeline": pipeline,
            "feature_columns": list(X.columns),
        },
        output_path,
    )
    print(f"Model saved to: {output_path.resolve()}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train reservation risk model.")
    parser.add_argument(
        "--data",
        default="backend/data/reservation_risk.csv",
        help="Path to the CSV dataset.",
    )
    parser.add_argument(
        "--output",
        default="backend/models/reservation_risk_model.pkl",
        help="Where to store the trained model (joblib).",
    )
    return parser.parse_args()


if __name__ == "__main__":
    train(parse_args())
