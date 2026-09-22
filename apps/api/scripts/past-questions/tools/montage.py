"""Grid of the final question images, for checking what students will see.

Usage: python montage.py <out.png> <image> [<image> ...]
"""
import os
import sys

import fitz

out_path, files = sys.argv[1], sys.argv[2:]
cols, cell_w, cell_h = 3, 300, 230
rows = (len(files) + cols - 1) // cols
doc = fitz.open()
page = doc.new_page(width=cols * cell_w, height=rows * (cell_h + 16))
for i, f in enumerate(files):
    x = (i % cols) * cell_w
    y = (i // cols) * (cell_h + 16)
    page.insert_text((x + 4, y + 11), os.path.basename(f), fontsize=9, color=(0.8, 0, 0))
    page.insert_image(fitz.Rect(x + 4, y + 14, x + cell_w - 4, y + cell_h + 12), filename=f)
    page.draw_rect(fitz.Rect(x + 1, y + 1, x + cell_w - 1, y + cell_h + 14), color=(0.75, 0.75, 0.75), width=0.5)
page.get_pixmap(dpi=90, alpha=False).save(out_path)
print(out_path)
