#!/usr/bin/env python3
"""
Rebuild apps/api/data/past-questions/*.json from the source PDFs.

Usage:
  python convert_all.py <folder containing the PDFs> [subject ...]

Each subject is converted with its answer-key and review files when present.
Subjects are listed here as they are onboarded, one at a time.
"""
import json
import os
import shutil
import sys

import pdf_to_json

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "..", "data", "past-questions"))
IMAGES = os.path.join(OUT, "images")

SUBJECTS = {
    "economics": "JAMB-Economics-Past-Questions-and-Answers.pdf",
    "biology": "JAMB-Biology-Past-Questions-and-Answers_copy.pdf",
    "literature": "Literature-In-English-JAMB-Past-Questions-and-Answers.pdf",
    "physics": "Physics-JAMB-Past-Questions.pdf",
    "mathematics": "MATHEMATICS-JAMB-Past-Questions.pdf",
    "principles-of-accounts": "Principles-of-Accounts-JAMB-Past-Questions.pdf",
    "english": "USE-OF-ENGLISH-JAMB-Past-Questions.pdf",
    "chemistry": "CHEMISTRY-JAMB-Past-Questions.pdf",
    "government": "GOVERNMENT-JAMB-Past-Questions.pdf",
    "commerce": "COMMERCE-JAMB-Past-Questions.pdf",
}


def load(kind, slug):
    path = os.path.join(HERE, kind, f"{slug}.json")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    folder = os.path.expanduser(sys.argv[1])
    wanted = sys.argv[2:] or list(SUBJECTS)
    os.makedirs(OUT, exist_ok=True)
    for slug in wanted:
        pdf = os.path.join(folder, SUBJECTS[slug])
        # Diagrams are regenerated from scratch so a dropped question leaves
        # no orphan image behind.
        shutil.rmtree(os.path.join(IMAGES, slug), ignore_errors=True)
        questions, report = pdf_to_json.build(
            pdf, slug, load("answer-keys", slug), load("reviews", slug), IMAGES
        )
        report.pop("droppedItems")
        with open(os.path.join(OUT, f"{slug}.json"), "w", encoding="utf-8", newline="\n") as fh:
            json.dump({"questions": questions}, fh, ensure_ascii=False, indent=1)
            fh.write("\n")
        print(json.dumps({"subject": slug, "kept": len(questions), "images": report["images"],
                          "corrected": report["corrected"], "dropped": report["dropped"]}))


if __name__ == "__main__":
    main()
