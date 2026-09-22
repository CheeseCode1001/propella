"""Dump one year of a subject's questions for editorial review.

Usage: python tools/worksheet.py <subject> <year> [out.txt]

Prints every question the extractor found for that paper - stem, options and
the crop "auto" would take - so the answers can be read and decided by hand.
"""
import json
import os
import subprocess
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDFS = {
    "biology": "Biology-JAMB-Past-Questions.pdf",
    "economics": "Economics-JAMB-Past-Questions.pdf",
    "literature": "Literature-In-English-JAMB-Past-Questions-and-Answers.pdf",
    "physics": "Physics-JAMB-Past-Questions.pdf",
    "mathematics": "MATHEMATICS-JAMB-Past-Questions.pdf",
    "principles-of-accounts": "Principles-of-Accounts-JAMB-Past-Questions.pdf",
    "english": "USE-OF-ENGLISH-JAMB-Past-Questions.pdf",
    "chemistry": "CHEMISTRY-JAMB-Past-Questions.pdf",
    "government": "GOVERNMENT-JAMB-Past-Questions.pdf",
    "commerce": "COMMERCE-JAMB-Past-Questions.pdf",
}
DOWNLOADS = os.path.expanduser("~/Downloads")


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    subject, year = sys.argv[1], sys.argv[2]
    out = sys.argv[3] if len(sys.argv) > 3 else f"{subject}-{year}.txt"
    subprocess.run([sys.executable, os.path.join(BASE, "pdf_to_json.py"),
                    os.path.join(DOWNLOADS, PDFS[subject]), subject, out,
                    "--review", os.path.join(BASE, "reviews", f"{subject}.json"),
                    "--worksheet", "--years", year], check=True)
    with open(out, encoding="utf-8") as fh:
        print(fh.read())


if __name__ == "__main__":
    main()
