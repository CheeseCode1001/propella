"""List the figures on a PDF page as ready-to-paste crop rectangles.

Each cluster of strokes becomes one figure; the labels printed inside it (and
just beside it) are included, and question prose is kept out. The question
number printed above the cluster names it.

Usage: python figures.py <pdf> <page> [<page> ...]   (pages are 0-based)
Writes figures-<page>.png next to this script so the boxes can be eyeballed.
"""
import json
import os
import re
import sys

import fitz

QUESTION_NUMBER = re.compile(r"^\s*(\d{1,3})\s*[.)](?!\d)")
PROSE = re.compile(r"[a-z]{5,}")


def clusters(page, gap=10.0):
    width, height = page.rect.width, page.rect.height
    rects = []
    for r in [fitz.Rect(d["rect"]) for d in page.get_drawings()] + \
             [fitz.Rect(i["bbox"]) for i in page.get_image_info()]:
        r = r + (-0.6, -0.6, 0.6, 0.6)
        if r.width > width * 0.6 or r.y1 < 60 or r.y0 > height - 55 or max(r.width, r.height) < 6:
            continue
        rects.append(r)
    groups = []
    for r in rects:
        hit = [g for g in groups if (g + (-gap, -gap, gap, gap)).intersects(r)]
        if not hit:
            groups.append(fitz.Rect(r))
            continue
        merged = fitz.Rect(r)
        for g in hit:
            merged |= g
            groups.remove(g)
        groups.append(merged)
    # Merging can bring previously separate groups within reach of each other.
    changed = True
    while changed:
        changed = False
        for a in list(groups):
            for b in list(groups):
                if a is not b and a in groups and b in groups and (a + (-gap, -gap, gap, gap)).intersects(b):
                    groups.remove(a)
                    groups.remove(b)
                    groups.append(a | b)
                    changed = True
    return [g for g in groups if max(g.width, g.height) >= 25]


def main():
    pdf, pages = sys.argv[1], [int(p) for p in sys.argv[2:]]
    doc = fitz.open(pdf)
    for pno in pages:
        page = doc[pno]
        lines = []
        for block in page.get_text("dict")["blocks"]:
            for raw in block.get("lines", []):
                text = "".join(sp["text"] for sp in raw["spans"]).strip()
                if text and "myschoolgist" not in text.lower():
                    lines.append((text, fitz.Rect(raw["bbox"])))
        out = []
        for box in sorted(clusters(page), key=lambda r: (r.x0 > page.rect.width / 2, r.y0)):
            crop = fitz.Rect(box) + (-5, -5, 5, 5)
            # Pull in the labels drawn on the figure, leave the prose out.
            for text, rect in lines:
                if not crop.intersects(rect):
                    continue
                short = len(text) <= 18 and not (PROSE.search(text) and text[-1] in "?:,;.")
                if short and not QUESTION_NUMBER.match(text) and rect.width < box.width + 20:
                    crop |= rect
            for text, rect in lines:
                if QUESTION_NUMBER.match(text) or (PROSE.search(text) and len(text) > 18):
                    if rect.y1 <= box.y0:
                        crop.y0 = max(crop.y0, rect.y1 + 1)
                    elif rect.y0 >= box.y1:
                        crop.y1 = min(crop.y1, rect.y0 - 1)
                    if rect.x1 <= box.x0 and rect.y1 > box.y0 and rect.y0 < box.y1:
                        crop.x0 = max(crop.x0, rect.x1 + 1)
            owner = None
            for text, rect in lines:
                m = QUESTION_NUMBER.match(text)
                if m and rect.y0 <= box.y0 + 12 and abs((rect.x0 + rect.x1) / 2 - (box.x0 + box.x1) / 2) < 260:
                    owner = m.group(1)
            out.append((owner, [pno, round(crop.x0), round(crop.y0), round(crop.x1), round(crop.y1)]))
        print(f"page {pno}:")
        for owner, rect in out:
            print(f'  Q{owner}: {json.dumps(rect)}')
        shot = fitz.open()
        cols = 2
        rows = (len(out) + cols - 1) // cols or 1
        sheet = shot.new_page(width=cols * 300, height=rows * 230)
        for i, (owner, rect) in enumerate(out):
            x, y = (i % cols) * 300, (i // cols) * 230
            sheet.insert_text((x + 4, y + 12), f"Q{owner}", fontsize=10, color=(0.8, 0, 0))
            sheet.show_pdf_page(fitz.Rect(x + 4, y + 16, x + 296, y + 226), doc, pno,
                                clip=fitz.Rect(*rect[1:]), keep_proportion=True)
        dest = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"figures-{pno}.png")
        sheet.get_pixmap(dpi=110, alpha=False).save(dest)
        print(f"  -> {dest}")


if __name__ == "__main__":
    main()
