#!/usr/bin/env python3
"""
search_plans.py — keyword search for the Plans workbook.

Searches EVERY tab of "Plans: commands for rclone/bash/sqlite"
(Google Sheet 1S_efwruHKNnfQ8DrHzD3blR8LHieVHS0x82PEF6PVxM)
for a keyword, and prints a list of exact locations:

    Tab name | Cell (A1) | the matching text (short snippet)

Usage:
    python3 search_plans.py <keyword>
    python3 search_plans.py <keyword> --sheet <spreadsheet_id>
    python3 search_plans.py <keyword> --exact        # whole-cell match only
    python3 search_plans.py <keyword> --out results.txt

Reads go through Muse's Google Sheets connector CLI
(/opt/hatch/bin/hatch_gws_cli), the same route Muse uses for this
workbook, so no separate Google login or API key is needed.
Created Sat Nov 21, 2026, at Lucky's ask (Oracle computer chat).
"""

import argparse
import json
import subprocess
import sys

CLI = "/opt/hatch/bin/hatch_gws_cli"
DEFAULT_SHEET = "1S_efwruHKNnfQ8DrHzD3blR8LHieVHS0x82PEF6PVxM"  # Plans: commands for rclone/bash/sqlite
CHUNK = 15  # tabs per batchGet call


def run_cli(args):
    out = subprocess.run([CLI] + args, capture_output=True, text=True)
    if out.returncode != 0:
        raise RuntimeError(f"CLI failed: {' '.join(args)}\n{out.stderr.strip()}")
    # The wrapper prints one JSON object; tolerate any leading log lines.
    text = out.stdout
    start = text.find("{")
    return json.loads(text[start:])


def col_letter(n):
    """1 -> A, 26 -> Z, 27 -> AA"""
    s = ""
    while n > 0:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def main():
    ap = argparse.ArgumentParser(description="Search every tab of the Plans workbook for a keyword.")
    ap.add_argument("keyword", help="word or phrase to search for (case-insensitive)")
    ap.add_argument("--sheet", default=DEFAULT_SHEET, help="spreadsheet ID (default: the Plans workbook)")
    ap.add_argument("--exact", action="store_true", help="match whole cells only, not substrings")
    ap.add_argument("--out", default="", help="also write the results to this text file")
    args = ap.parse_args()

    kw = args.keyword.strip().lower()
    if not kw:
        print("Keyword is empty.")
        return 1

    meta = run_cli(["sheets", "spreadsheets", "get", "--params",
                    json.dumps({"spreadsheetId": args.sheet,
                                "fields": "sheets(properties(title))"})])
    titles = [s["properties"]["title"] for s in meta["sheets"]]
    print(f"Searching {len(titles)} tabs for: {args.keyword!r}\n")

    hits = []  # (tab, cell, snippet)
    for i in range(0, len(titles), CHUNK):
        chunk = titles[i:i + CHUNK]
        ranges = [f"'{t}'" for t in chunk]
        data = run_cli(["sheets", "spreadsheets", "values", "batchGet", "--params",
                        json.dumps({"spreadsheetId": args.sheet, "ranges": ranges,
                                    "majorDimension": "ROWS"})])
        for title, vr in zip(chunk, data.get("valueRanges", [])):
            for r, row in enumerate(vr.get("values", []), start=1):
                for c, cell in enumerate(row, start=1):
                    text = str(cell)
                    low = text.lower()
                    matched = (low == kw) if args.exact else (kw in low)
                    if matched:
                        snippet = " ".join(text.split())
                        if len(snippet) > 140:
                            snippet = snippet[:137] + "..."
                        hits.append((title, f"{col_letter(c)}{r}", snippet))

    lines = []
    if not hits:
        lines.append(f"No matches for {args.keyword!r} in any tab.")
    else:
        lines.append(f"{len(hits)} match(es) for {args.keyword!r}:")
        current = None
        n = 0
        for title, cell, snippet in hits:
            if title != current:
                current = title
                lines.append(f"\nTab: {title}")
            n += 1
            lines.append(f"  {n}. Cell {cell} — {snippet}")
    report = "\n".join(lines)
    print(report)
    if args.out:
        with open(args.out, "w") as f:
            f.write(report + "\n")
        print(f"\nSaved to {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
