"""List the questions a subject's build threw away for a fixable reason.

Usage: python tools/drops.py <subject>

"no answer" and "editorial review" are routine; anything else is a question
that was answered but did not survive the checks, and is worth looking at.
"""
import json
import os
import sys
import tempfile

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE)
import pdf_to_json as p  # noqa: E402

from worksheet import DOWNLOADS, PDFS  # noqa: E402

subject = sys.argv[1]
ans = json.load(open(f"{BASE}/answer-keys/{subject}.json", encoding="utf-8"))
rev = json.load(open(f"{BASE}/reviews/{subject}.json", encoding="utf-8"))
with tempfile.TemporaryDirectory() as tmp:
    _, report = p.build(os.path.join(DOWNLOADS, PDFS[subject]), subject, ans, rev, tmp)
for item in report["droppedItems"]:
    if item["reason"] not in ("no answer", "editorial review"):
        print(item["reason"], item["year"], item["n"], "|", item["text"][:120])
