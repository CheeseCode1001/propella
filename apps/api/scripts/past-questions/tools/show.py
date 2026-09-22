"""Print one year of a subject's final questions: python show.py <subject> <year>"""
import json
import sys

subject, year = sys.argv[1], int(sys.argv[2])
path = rf"C:\Users\PROBOOK 430 G2\Desktop\propella\apps\api\data\past-questions\{subject}.json"
for q in json.load(open(path, encoding="utf-8"))["questions"]:
    if q["year"] != year:
        continue
    opts = " | ".join(f"{o['id']}) {o['text'][:40]}" for o in q["options"])
    img = " [img]" if q.get("image") else ""
    print(q["source"].split()[-1], q["answer"], q["topic"][:12], img, "|", q["question"][:70], "||", opts)
