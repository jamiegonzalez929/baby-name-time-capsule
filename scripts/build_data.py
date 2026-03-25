#!/usr/bin/env python3
"""Build a compact JSON bundle for the baby name time capsule site."""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import pathlib
import urllib.request
from collections import defaultdict
from typing import Dict, Iterable, List, Tuple

SOURCE_URL = "https://raw.githubusercontent.com/hadley/data-baby-names/master/baby-names.csv"
ROOT = pathlib.Path(__file__).resolve().parents[1]
RAW_PATH = ROOT / "data" / "raw-baby-names.csv"
OUTPUT_PATH = ROOT / "data" / "baby-name-time-capsule.json"


def download_source(url: str = SOURCE_URL, destination: pathlib.Path = RAW_PATH) -> pathlib.Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(url) as response:
        destination.write_bytes(response.read())
    return destination


def load_rows(csv_path: pathlib.Path) -> List[dict]:
    with csv_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        return [
            {
                "year": int(row["year"]),
                "name": row["name"],
                "percent": float(row["percent"]),
                "sex": row["sex"],
            }
            for row in reader
        ]


def build_top_by_year(rows: Iterable[dict], top_n: int = 25) -> Dict[str, Dict[str, List[dict]]]:
    grouped: Dict[int, Dict[str, List[dict]]] = defaultdict(lambda: defaultdict(list))
    for row in rows:
        grouped[row["year"]][row["sex"]].append(row)

    output: Dict[str, Dict[str, List[dict]]] = {}
    for year, by_sex in sorted(grouped.items()):
        output[str(year)] = {}
        for sex, sex_rows in sorted(by_sex.items()):
            ranked = sorted(sex_rows, key=lambda item: item["percent"], reverse=True)[:top_n]
            output[str(year)][sex] = [
                {
                    "rank": index + 1,
                    "name": item["name"],
                    "percent": round(item["percent"] * 100, 3),
                }
                for index, item in enumerate(ranked)
            ]
    return output


def build_streaks(rows: Iterable[dict], top_k: int = 10, limit: int = 12) -> Dict[str, List[dict]]:
    appearances: Dict[str, Dict[str, List[int]]] = defaultdict(lambda: defaultdict(list))
    grouped: Dict[int, Dict[str, List[dict]]] = defaultdict(lambda: defaultdict(list))
    for row in rows:
        grouped[row["year"]][row["sex"]].append(row)

    for year, by_sex in grouped.items():
        for sex, sex_rows in by_sex.items():
            ranked = sorted(sex_rows, key=lambda item: item["percent"], reverse=True)[:top_k]
            for item in ranked:
                appearances[sex][item["name"]].append(year)

    streaks: Dict[str, List[dict]] = {}
    for sex, names in appearances.items():
        records: List[dict] = []
        for name, years in names.items():
            sorted_years = sorted(years)
            best_start = sorted_years[0]
            best_end = sorted_years[0]
            current_start = sorted_years[0]
            current_end = sorted_years[0]

            for year in sorted_years[1:]:
                if year == current_end + 1:
                    current_end = year
                else:
                    if current_end - current_start > best_end - best_start:
                        best_start, best_end = current_start, current_end
                    current_start = current_end = year

            if current_end - current_start > best_end - best_start:
                best_start, best_end = current_start, current_end

            records.append(
                {
                    "name": name,
                    "start_year": best_start,
                    "end_year": best_end,
                    "years": best_end - best_start + 1,
                }
            )

        streaks[sex] = sorted(
            records,
            key=lambda item: (-item["years"], item["start_year"], item["name"]),
        )[:limit]
    return streaks


def build_dataset(rows: Iterable[dict], top_n: int = 25) -> dict:
    row_list = list(rows)
    years = sorted({row["year"] for row in row_list})
    return {
        "title": "Baby Name Time Capsule",
        "source": {
            "name": "hadley/data-baby-names",
            "url": SOURCE_URL,
            "notes": "SSA national baby name data mirrored as a CSV for reproducible local builds.",
        },
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "year_range": {"start": min(years), "end": max(years)},
        "top_n": top_n,
        "top_by_year": build_top_by_year(row_list, top_n=top_n),
        "streaks": build_streaks(row_list, top_k=10),
    }


def write_dataset(dataset: dict, output_path: pathlib.Path = OUTPUT_PATH) -> pathlib.Path:
    output_path.write_text(json.dumps(dataset, indent=2), encoding="utf-8")
    return output_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=pathlib.Path, default=RAW_PATH)
    parser.add_argument("--output", type=pathlib.Path, default=OUTPUT_PATH)
    parser.add_argument("--top-n", type=int, default=25)
    parser.add_argument("--download", action="store_true", help="Download the source CSV before building.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_path = args.input
    if args.download or not input_path.exists():
        input_path = download_source(destination=input_path)

    dataset = build_dataset(load_rows(input_path), top_n=args.top_n)
    write_dataset(dataset, output_path=args.output)
    print(f"Wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
