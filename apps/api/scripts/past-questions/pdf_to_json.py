#!/usr/bin/env python3
"""
Convert a MySchoolGist-style JAMB past-question PDF into Propella's
past-question JSON (the same shape the admin importer accepts).

Usage:
  python pdf_to_json.py <pdf> <subjectSlug> <out.json>
      [--answers answer-keys/<subject>.json] [--review reviews/<subject>.json]
      [--dropped dropped.json]

Needs PyMuPDF (`pip install pymupdf`).

Why the filtering is aggressive: a question that leans on a diagram, table,
passage or underlined word loses its meaning once the PDF is flattened to
text. Serving it would give students an unanswerable question, so those are
dropped and reported instead.

Answers come from the PDF's own answer key when it has one. For PDFs without
a key, pass --answers with a {"<year>": {"<number>": "B", ...}} map; questions
without an answer are left out of the output.

The printed keys are not trustworthy on their own (whole years are off), so
every subject also gets --review: a per-question editorial pass that corrects
plainly wrong keys and drops anything ambiguous or garbled.

Science papers need more than plain text. A review with "rich": true reads
each line from its font spans instead, so 10⁸ and P₁ survive (plain text gives
"108" and "P1") and the paper's symbol font is mapped back to Ω, θ, μ, π...
Rich reviews may also carry:
  "images": {"<year>": {"<n>": "auto" | [[page, x0, y0, x1, y1], ...]}}
      the diagram a question cannot be answered without. "auto" finds the
      drawing next to the question; a list gives the crop by hand (page is
      0-based, coordinates in PDF points). The crop is saved as
      images/<subject>/<year>-<n>.png and diagram labels inside it are taken
      out of the question text.
  "edit": {"<year>": {"<n>": {"question": "...", "options": [...]}}}
      hand-corrected text where extraction garbled a formula.
  "allow": ["drawing", "figure", ...]
      words this subject uses in its own sense ("a partner's drawing", "the
      capital figure"), which must not count as a reference to a diagram.
  "dehyphenate": true
      this paper breaks words across lines ("incur- red"); join them back up.
  "add": {"<year>": [<n>, ...]}
      questions the extractor missed altogether, e.g. two of them printed on
      one line. Their text comes from "edit", their answer from the key.
"""
import json
import os
import re
import sys
import unicodedata

import fitz  # PyMuPDF

BOILERPLATE = re.compile(
    r"myschoolgist|Download MySchoolGist|^\s*<<<PAGE|^\s*\d{1,3}\s*$|https?://",
    re.I,
)

YEAR_HEADER = re.compile(
    r"^\s*(?:UTME\s+)?(?:[A-Za-z][A-Za-z -]{2,40}?\s+)?((?:19|20)\d{2})\s*(?:[A-Za-z -]*QUESTIONS)?\s*$",
    re.I,
)

ANSWER_KEY = re.compile(r"^\s*ANSWERS?(\s+KEYS?)?\s*:?\s*$", re.I)

# Anything that points at material we cannot carry across.
LOST_CONTEXT = re.compile(
    r"\b(diagram|figure|fig\.|graph|table|chart|illustrat\w*|sketch|drawing|picture|"
    r"passage|extract|excerpt|stanza|lines? \d+|underlined|italicized|in capitals|"
    r"stressed|labell?ed|part[s]? marked|structure [IVX]+|following (structure|formula)|"
    r"paper type)\b|"
    # "... the schedule above", "... information below:", "... shown above"
    r"\b(\w+)\s+(above|below)\s*[,.:?]?\s*$|\b(above|below)\s*[,.:?]|"
    r"\b(the|this|these|table|schedule|data|information|map|curve|poem|list|"
    r"statements?|sentences?|equations?|shown|given|provided|represented)\s+(above|below)\b",
    re.I,
)

# Options that name other options cannot be shuffled or trimmed safely.
CROSS_REFERENCE = re.compile(
    r"\b(all|none|both) of the (above|options|foregoing)\b|"
    r"\b[A-E]\s*(,|and|&|or)\s*[A-E]\b(?!\w)|^\s*[A-E]\s*only\s*$",
    re.I,
)


# ── Rich (layout-aware) extraction ───────────────────────────────────────

SUPERSCRIPT = str.maketrans("0123456789+-\u2212=()ni", "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁻⁼⁽⁾ⁿⁱ")
SUBSCRIPT = str.maketrans("0123456789+-=()aehklmnopstx", "₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₕₖₗₘₙₒₚₛₜₓ")
SUP_OK = set("0123456789+-\u2212=()ni")
SUB_OK = set("0123456789+-=()aehklmnopstx")

# The papers' symbol font puts Greek letters on Latin-1 code points.
SYMBOL_FONT = {"Ù": "Ω", "è": "θ", "á": "α", "â": "β", "ì": "μ", "Ä": "Δ", "ð": "π", "ë": "λ", "ƒ": "f"}

# NFKC would fold these back to plain digits, undoing the rebuild.
SCRIPTS = set("⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱ₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₕₖₗₘₙₒₚₛₜₓ°½¼¾")
_keep_scripts = False


class Line(str):
    """A text line that remembers its page and position (rich mode only)."""

    page = -1
    rect = None


def make_line(text, page, rect):
    line = Line(text)
    line.page = page
    line.rect = rect
    return line


def rich_text(spans, symbols):
    """One line of text from its spans, with raised and lowered runs rebuilt."""
    texts = [sp for sp in spans if sp["text"].strip()]
    if not texts:
        return ""
    base = max(texts, key=lambda sp: (round(sp["size"], 1), len(sp["text"])))
    out = []
    for span in spans:
        text = span["text"]
        for old, new in symbols.items():
            text = text.replace(old, new)
        core = text.replace(" ", "")
        if core and span["size"] < base["size"] * 0.85:
            dy = span["origin"][1] - base["origin"][1]
            if span["flags"] & 1 or dy < -0.8:
                if core in ("0", "o", "O"):
                    text = "°"
                elif set(core) <= SUP_OK:
                    text = core.translate(SUPERSCRIPT)
                else:
                    text = "^" + core
            elif dy > 0.8:
                text = core.translate(SUBSCRIPT) if set(core) <= SUB_OK else core
        out.append(text)
    return "".join(out)


# The plain-mode check above is case-insensitive and needs no spaces around the
# connector, so it reads "bore" as "B or E". Rich subjects use this stricter one.
CROSS_REFERENCE_RICH = re.compile(
    r"(?i:\b(all|none|both) of the (above|options|foregoing)\b)|"
    r"\b[A-E]\s*(?:,|&|\s(?:and|or)\s)\s*[A-E]\b(?!\w)|^\s*[A-E]\s*only\s*$"
)
STRAY_LETTER = re.compile(r"(?:^|\s)[A-E]\s*[.)](?:\s|$)")
# "D. 0.8 [g = 10ms⁻²]" - data the paper prints after the last option.
TRAILING_DATA = re.compile(r"\s*\[([^\[\]]{3,})\]\s*[.,;]?\s*$")


def clean(text):
    if _keep_scripts:
        text = "".join(c if c in SCRIPTS else unicodedata.normalize("NFKC", c) for c in text)
    else:
        text = unicodedata.normalize("NFKC", text)
    text = text.replace("’", "'").replace("‘", "'")
    text = text.replace("“", '"').replace("”", '"')
    text = text.replace("–", "-").replace("—", "-")
    text = text.replace("„", '"').replace("‟", '"').replace("‹", "'").replace("›", "'")
    text = re.sub(r"\s+", " ", text)
    return text.strip(" \t;")


def read_lines(pdf_path, rich=False, symbols=None):
    doc = fitz.open(pdf_path)
    lines = []
    for pno, page in enumerate(doc):
        if not rich:
            for line in page.get_text("text").split("\n"):
                if not line.strip() or BOILERPLATE.search(line):
                    continue
                lines.append(line.rstrip())
            continue
        found = []
        for block in page.get_text("dict")["blocks"]:
            for raw in block.get("lines", []):
                text = rich_text(raw["spans"], symbols or SYMBOL_FONT)
                rect = fitz.Rect(raw["bbox"])
                if not text.strip():
                    continue
                # A bare number is a page number only down in the footer; up
                # on the page it is an option value ("A. 8") or a label.
                bare = re.fullmatch(r"\s*\d{1,3}\s*", text)
                if bare and rect.y0 < page.rect.height - 60:
                    pass
                elif BOILERPLATE.search(text):
                    continue
                found.append(make_line(text.rstrip(), pno, rect))
        lines.extend(reading_order(found, page.rect.width))
    return lines


def reading_order(found, page_width):
    """The text layer's own order is not reading order (a page's year banner
    comes mid-page, option values before their letters). Rebuild it: the page
    is cut into bands at each year banner (a heading across the centre line,
    or at the top); within a band the left column comes before the right,
    each top to bottom and each row left to right."""
    mid = page_width / 2

    def centre(ln):
        return (ln.rect.y0 + ln.rect.y1) / 2

    banners = sorted(
        (ln for ln in found
         if YEAR_HEADER.match(ln) and (ln.rect.y0 < 100 or ln.rect.x0 < mid < ln.rect.x1)),
        key=lambda ln: ln.rect.y0,
    )
    taken = {id(ln) for ln in banners}
    rest = [ln for ln in found if id(ln) not in taken]
    ordered = []
    top = float("-inf")
    for cut, banner in [(b.rect.y0, b) for b in banners] + [(float("inf"), None)]:
        band = [ln for ln in rest if top <= centre(ln) < cut]
        for column in (
            [ln for ln in band if ln.rect.x0 < mid - 8],
            [ln for ln in band if ln.rect.x0 >= mid - 8],
        ):
            column.sort(key=centre)
            row = []
            for ln in column:
                if row and abs(centre(ln) - centre(row[0])) > 4:
                    ordered.extend(sorted(row, key=lambda r: r.rect.x0))
                    row = []
                row.append(ln)
            ordered.extend(sorted(row, key=lambda r: r.rect.x0))
        if banner is not None:
            ordered.append(banner)
        top = cut
    return ordered


def split_years(lines, banner=None):
    """[(year, [lines])] in document order. Repeated years are merged.

    `banner` is the paper's own heading ("Principles of Account"): when the
    body text quotes years of its own ("Subscriptions received in 1991"),
    only lines carrying the heading start a new paper.
    """
    sections = []
    current = None
    for line in lines:
        m = YEAR_HEADER.match(line)
        # A bare year line is only a header when a subject word or UTME is
        # present, or it is followed by question 1 - otherwise it is data.
        if m and banner and current is not None and banner.lower() not in str(line).lower():
            m = None
        if m and (re.search(r"[A-Za-z]", line) or current is None):
            year = int(m.group(1))
            current = (year, [])
            sections.append(current)
            continue
        if current is not None:
            current[1].append(line)
    merged = {}
    order = []
    for year, body in sections:
        if year not in merged:
            merged[year] = []
            order.append(year)
        merged[year].extend(body)
    return [(y, merged[y]) for y in order]


KEY_TOKEN = re.compile(r"^\s*(\d{1,3}\s*[.):]?\s*\.?\s*[A-E]?|\.?[A-E])\s*$")


def split_key(body):
    """Separate the answer key (if any) from the question lines.

    Text extraction sometimes puts part of the key *before* its heading, so
    the key also swallows the run of key-shaped lines just above it.
    """
    for i, line in enumerate(body):
        if ANSWER_KEY.match(line):
            start = i
            while start > 0 and KEY_TOKEN.match(body[start - 1]):
                start -= 1
            return body[:start], body[start:]
    return body, []


def parse_key(key_lines, question_count):
    text = " ".join(key_lines)
    pairs = re.findall(r"(?<![\d.])(\d{1,3})\s*[.):]?\s*\.?\s*([A-E])(?![A-Za-z])", text)
    answers = {}
    for num, letter in pairs:
        n = int(num)
        if 1 <= n <= question_count and n not in answers:
            answers[n] = letter
    if len(answers) >= question_count * 0.8:
        return answers
    # Some keys are a bare column of letters with the numbers lost.
    letters = re.findall(r"(?<![A-Za-z])\.?([A-E])(?![A-Za-z])", re.sub(r"ANSWERS?\s*KEYS?:?", " ", text, flags=re.I))
    if len(letters) == question_count:
        return {i + 1: l for i, l in enumerate(letters)}
    return answers


QUESTION_START = re.compile(r"^\s*(\d{1,3})\s*[.)]\s*(.*)$")
RICH_QUESTION_START = re.compile(r"^\s*(\d{1,3})\s*[.)](?!\d)\s*(.*)$")
BARE_NUMBER = re.compile(r"^\s*(\d{1,3})\s*$")


BASED_ON = re.compile(
    r"^\s*Questions?\s+(\d{1,3})\s*(?:to|-|and)\s*(\d{1,3})\s+(?:are\s+)?based\s+on\s*(.*)$",
    re.I,
)


def work_contexts(body):
    """Literature papers group questions under "Questions 2 to 5 are based on
    <play>". Returns {question number: "<play>"} so each stem can name it."""
    contexts = {}
    for i, line in enumerate(body):
        m = BASED_ON.match(line)
        if not m:
            continue
        text = m.group(3)
        # The title often wraps onto the next line or two.
        j = i + 1
        # A full stop ends the title, unless it is an initial as in "J.C.".
        while (
            j < len(body)
            and j <= i + 2
            and not QUESTION_START.match(body[j])
            and not re.search(r"\w{3,}\.\s*$", text)
        ):
            text += " " + body[j]
            j += 1
        title = clean(text).rstrip(".").strip()
        if not title or re.search(r"\b(poem|passage|extract|quotation)s?\b", title, re.I):
            continue
        for n in range(int(m.group(1)), int(m.group(2)) + 1):
            contexts[n] = title
    return contexts


SECTION_HEADING = re.compile(
    r"^\s*(?:in\s+(?:each\s+of\s+)?(?:the\s+)?questions?|questions?)\s+(\d{1,3})\b",
    re.I,
)


def split_questions(body, with_lines=False, cloze_jumps=False):
    """{number: text}. Numbers must run in sequence, which rejects table data.

    with_lines also returns {number: [(line, text it contributes)]} - the page
    lines behind each question, for cropping its diagram.
    """
    questions = {}
    members = {}
    expected = 1
    current = None
    buf = []
    own = []
    for line in body:
        if BASED_ON.match(line):
            # Section heading, not part of the previous question.
            if current is not None:
                questions[current] = buf
                members[current] = own
                buf = []
                own = []
                current = None
            continue
        if cloze_jumps:
            m_sec = SECTION_HEADING.match(line)
            if m_sec:
                sec_n = int(m_sec.group(1))
                if sec_n > expected and sec_n <= 100:
                    expected = sec_n
        if _keep_scripts:
            m = RICH_QUESTION_START.match(line)
        else:
            m = QUESTION_START.match(line) or BARE_NUMBER.match(line)
        if m:
            n = int(m.group(1))
            accept = (expected <= n <= expected + 2) or (
                cloze_jumps and n > expected and n <= 100 and n in (16, 21, 26, 27)
            )
            if accept:
                if current is not None:
                    questions[current] = buf
                    members[current] = own
                current = n
                buf = [m.group(2)] if m.lastindex and m.lastindex >= 2 else []
                own = [(line, buf[0] if buf else "")]
                expected = n + 1
                continue
        if current is not None:
            buf.append(line)
            own.append((line, line))
    if current is not None:
        questions[current] = buf
        members[current] = own
    text = {n: clean(" ".join(b)) for n, b in questions.items()}
    return (text, members) if with_lines else text


def split_options(text, bare=False):
    """Return (stem, [option texts in A..]) or None."""
    marks = []
    want = "A"
    pos = 0
    pattern = (
        re.compile(r"(?:(?<=\s)|^)([A-E])(?:\s*[.)]|\s+(?=\S))")
        if bare
        else re.compile(r"(?:(?<=\s)|^)([A-E])\s*[.)]")
    )
    while True:
        m = None
        for cand in pattern.finditer(text, pos):
            if cand.group(1) == want:
                if bare and want == "A" and cand.start() == 0:
                    continue
                m = cand
                break
        if not m:
            break
        marks.append(m)
        pos = m.end()
        want = chr(ord(want) + 1)
        if want > "E":
            break
    if len(marks) < 4:
        return None
    stem = text[: marks[0].start()].strip()
    options = []
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(text)
        options.append(text[m.end():end].strip())
    return stem, options


INSTRUCTION_TAIL = re.compile(
    # Case-sensitive on purpose: only a capitalised instruction phrase is the
    # start of the next section, not "the study of" inside an option.
    r"\s+(Use the|Study the|Read the|Refer to|In each of|In questions?|Questions? \d|"
    r"From the (options|words|list)|Choose the|Select the|Fill in|Answer the|Each of the)\b.*$"
)


STRAY_MARK = re.compile(r"(?:^|\s)[A-E]\s*[.)](?:\s|$)|(?:^|\s)\d{1,3}\s*\.\s*[A-Z][a-z]")


def tidy_option(text):
    # Section instructions for the next block often trail the last option.
    text = INSTRUCTION_TAIL.sub("", text).strip()
    return text.rstrip(" .;,").strip()


# ── Diagrams ─────────────────────────────────────────────────────────────

OPTION_LINE = re.compile(r"^\s*[A-E]\s*[.)]\s")

# Any serif font with Greek will do for re-setting "Ω"; Times New Roman ships
# with Windows, DejaVu with most Linux installs.
SERIF_FONT = next(
    (f for f in ("C:/Windows/Fonts/times.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf")
     if os.path.exists(f)),
    None,
)


def is_label(text):
    """Short diagram labels ("20V", "I₃", "Copper", "Fig. 4") as opposed to
    question prose - including the short last line of a sentence."""
    t = text.strip()
    if not t or OPTION_LINE.match(t) or QUESTION_START.match(t):
        return False
    # "66½° B. 62½° C. 125°" is a row of options, not a label on the drawing.
    if re.search(r"\s[A-E]\s*[.)]\s", t):
        return False
    prose = re.search(r"[a-z]{5,}", t)
    if prose and t[-1] in "?:,;":
        return False
    return len(t) <= 16 or not prose


class Cropper:
    """Finds a question's diagram on the page and saves it as a PNG."""

    def __init__(self, pdf_path):
        self.doc = fitz.open(pdf_path)
        self._drawings = {}
        self._lines = {}

    def drawings(self, pno):
        if pno not in self._drawings:
            page = self.doc[pno]
            width, height = page.rect.width, page.rect.height
            rects = []
            # Vector strokes, plus figures pasted in as pictures.
            found = [fitz.Rect(d["rect"]) for d in page.get_drawings()]
            found += [fitz.Rect(info["bbox"]) for info in page.get_image_info()]
            for r in found:
                r = r + (-0.6, -0.6, 0.6, 0.6)
                # Page furniture: the black year banner, rules, the page number.
                if r.width > width * 0.6 or r.y1 < 60 or r.y0 > height - 55:
                    continue
                rects.append(r)
            self._drawings[pno] = rects
        return self._drawings[pno]

    def page_lines(self, pno):
        if pno not in self._lines:
            found = []
            for block in self.doc[pno].get_text("dict")["blocks"]:
                for raw in block.get("lines", []):
                    text = "".join(sp["text"] for sp in raw["spans"])
                    # The diagonal watermark's box covers half the page.
                    if text.strip() and "myschoolgist" not in text.lower():
                        found.append((text, fitz.Rect(raw["bbox"])))
            self._lines[pno] = found
        return self._lines[pno]

    def propose(self, qlines):
        """[(page, rect)] for the drawing(s) beside a question's lines."""
        crops = []
        segments = {}
        for ln in qlines:
            mid = self.doc[ln.page].rect.width / 2
            segments.setdefault((ln.page, ln.rect.x0 >= mid - 8), []).append(ln)
        for (pno, right), mine in sorted(segments.items()):
            page = self.doc[pno]
            mid = page.rect.width / 2
            x0, x1 = (mid, page.rect.width) if right else (0, mid)
            core = fitz.Rect(
                x0,
                min(ln.rect.y0 for ln in mine) - 6,
                x1,
                max(ln.rect.y1 for ln in mine) + 6,
            )
            pool = [r for r in self.drawings(pno) if x0 <= (r.x0 + r.x1) / 2 < x1]
            picked = [
                r for r in pool
                if core.contains(fitz.Point((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2))
                and max(r.width, r.height) >= 25
            ]
            if not picked:
                continue
            union = fitz.Rect(picked[0])
            for r in picked[1:]:
                union |= r
            # The neighbouring questions' text fences this question's drawing
            # in, so growth cannot wander into the figure above or below.
            own = {tuple(round(v, 1) for v in ln.rect) for ln in mine}

            def mine_only(rect):
                return tuple(round(v, 1) for v in rect) in own

            top, bottom = 0.0, page.rect.height
            for text, rect in self.page_lines(pno):
                if not x0 <= (rect.x0 + rect.x1) / 2 < x1:
                    continue
                # Another question's text, or any question's number, fences
                # this drawing in - "19." sits between two figures.
                if mine_only(rect) and not RICH_QUESTION_START.match(text):
                    continue
                if rect.y1 <= union.y0:
                    top = max(top, rect.y1)
                elif rect.y0 >= union.y1:
                    bottom = min(bottom, rect.y0)
            # A diagram is one connected cluster of strokes; grow into it.
            grew = True
            while grew:
                grew = False
                zone = union + (-8, -8, 8, 8)
                for r in pool:
                    if r not in picked and r.intersects(zone) and top <= r.y0 and r.y1 <= bottom:
                        picked.append(r)
                        union |= r
                        grew = True
            strokes = fitz.Rect(union)
            zone = union + (-14, -14, 14, 14)
            height = page.rect.height
            # Only this question's own lines can be part of its diagram; a line
            # belonging to the question above or below always bounds the crop.
            for text, rect in self.page_lines(pno):
                centre = (rect.x0 + rect.x1) / 2
                furniture = rect.y1 < 60 or rect.y0 > height - 60
                if (rect.intersects(zone) and is_label(text) and mine_only(rect)
                        and x0 <= centre < x1 and not furniture):
                    union |= rect
            crop = union + (-4, -4, 4, 4)
            # Question prose just above or below the drawing must not be cut
            # in half at the crop's edge: pull the edge back to the strokes.
            for text, rect in self.page_lines(pno):
                if not rect.intersects(crop) or crop.contains(rect) and is_label(text) and mine_only(rect):
                    continue
                if is_label(text) and mine_only(rect) and not RICH_QUESTION_START.match(text):
                    continue
                middle = (rect.y0 + rect.y1) / 2
                if middle > strokes.y1:
                    crop.y1 = min(crop.y1, rect.y0 - 0.5)
                elif middle < strokes.y0:
                    crop.y0 = max(crop.y0, rect.y1 + 0.5)
            # Never trim into the strokes themselves.
            crop.y0 = min(crop.y0, strokes.y0 - 1)
            crop.y1 = max(crop.y1, strokes.y1 + 1)
            crops.append((pno, crop))
        return crops

    def relabelled(self, pno, clip):
        """A copy of the page where labels drawn in the symbol font ("2Ù") are
        re-set with the real character ("2Ω"), so the diagram reads right."""
        copy = fitz.open()
        copy.insert_pdf(self.doc, from_page=pno, to_page=pno)
        page = copy[0]
        fixes = []
        for block in page.get_text("dict")["blocks"]:
            for raw in block.get("lines", []):
                line_text = "".join(sp["text"] for sp in raw["spans"])
                if re.fullmatch(r"\d{1,3}\s*[.)]", line_text.strip()) and fitz.Rect(raw["bbox"]).intersects(clip):
                    for span in raw["spans"]:
                        fixes.append((span, None))
                    continue
                for span in raw["spans"]:
                    text = span["text"]
                    if not any(c in text for c in SYMBOL_FONT) or not fitz.Rect(span["bbox"]).intersects(clip):
                        continue
                    for old, new in SYMBOL_FONT.items():
                        text = text.replace(old, new)
                    fixes.append((span, text))
        if not fixes:
            return self.doc, pno
        for span, _ in fixes:
            page.add_redact_annot(fitz.Rect(span["bbox"]) + (0.3, 0.8, -0.3, -0.8))
        page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
        for span, text in fixes:
            if text:
                page.insert_text(span["origin"], text, fontsize=span["size"], fontname="symfix", fontfile=SERIF_FONT)
        return copy, 0

    def render(self, crops, dest, dpi=170):
        """Stacks the crops into one image. Only the red channel is kept: the
        pink watermark is near-white in red while the black strokes stay black."""
        out = fitz.open()
        gap = 6
        width = max(r.width for _, r in crops)
        height = sum(r.height for _, r in crops) + gap * (len(crops) - 1)
        page = out.new_page(width=width, height=height)
        y = 0
        for pno, r in crops:
            src, src_pno = self.relabelled(pno, r)
            page.show_pdf_page(fitz.Rect(0, y, r.width, y + r.height), src, src_pno, clip=r)
            y += r.height + gap
        pix = page.get_pixmap(dpi=dpi, alpha=False)
        red = bytes(pix.samples[0::pix.n])
        fitz.Pixmap(fitz.csGRAY, pix.width, pix.height, red, False).save(dest)


def text_outside(members, crops):
    """A question's text without the diagram labels that sit inside its crop."""
    kept = []
    for line, contribution in members:
        rect = getattr(line, "rect", None)
        inside = rect is not None and any(
            line.page == pno and crop.contains(fitz.Point((rect.x0 + rect.x1) / 2, (rect.y0 + rect.y1) / 2))
            for pno, crop in crops
        )
        if not inside:
            kept.append(contribution)
    return clean(" ".join(kept))


def resolve_crops(cropper, spec, qlines):
    if spec == "auto":
        return cropper.propose(qlines)
    return [(int(c[0]), fitz.Rect(c[1:5])) for c in spec]


def build(pdf_path, subject_slug, external_answers=None, review=None, image_dir=None):
    global _keep_scripts
    review = review or {}
    rich = bool(review.get("rich"))
    _keep_scripts = rich
    lines = read_lines(pdf_path, rich=rich, symbols={**SYMBOL_FONT, **review.get("symbols", {})})
    banner = review.get("banner")
    images = review.get("images", {})
    edits = review.get("edit", {})
    missed = review.get("add", {})
    # A paper that hyphenates at line ends leaves "incur- red" in the text.
    allowed = review.get("allow", [])
    allow_re = re.compile(r"\b(" + "|".join(re.escape(w) for w in allowed) + r")s?\b", re.I) if allowed else None
    dehyphen = (lambda t: re.sub(r"(?<=[a-z])- (?=[a-z])", "", t)) if review.get("dehyphenate") else (lambda t: t)
    cropper = Cropper(pdf_path) if rich else None
    if images and not rich:
        raise ValueError("diagram crops need a rich review")
    out = []
    report = {"years": {}, "dropped": {}, "corrected": 0, "images": 0}
    corrections = (review or {}).get("correct", {})
    rejected = (review or {}).get("drop", {})
    # Typos in set-text titles and headings, fixed wherever they appear.
    fixes = (review or {}).get("replace", [])
    topics = (review or {}).get("topics", {})
    # JAMB reuses questions across years; one copy is enough in the bank.
    seen_stems = set()

    report["droppedItems"] = []
    current = {}

    def drop(reason):
        report["dropped"][reason] = report["dropped"].get(reason, 0) + 1
        report["droppedItems"].append({"reason": reason, **current})

    for year, body in split_years(lines, banner):
        q_lines, key_lines = split_key(body)
        questions, members = split_questions(
            q_lines, with_lines=True, cloze_jumps=bool(review.get("cloze_jumps"))
        )
        if not questions:
            continue
        key = parse_key(key_lines, max(questions)) if key_lines else {}
        # A key read by hand from the page image beats a garbled text layer.
        ext = (external_answers or {}).get(str(year), {})
        contexts = work_contexts(q_lines)
        kept = 0
        for n in sorted(set(questions) | {int(x) for x in missed.get(str(year), [])}):
            current.clear()
            current.update({"year": year, "n": n, "text": questions.get(n, "")[:300]})
            answer = ext.get(str(n)) or key.get(n)
            if n in rejected.get(str(year), []):
                drop("editorial review")
                continue
            corrected = corrections.get(str(year), {}).get(str(n))
            if corrected:
                answer = corrected
            if not answer:
                drop("no answer")
                continue
            spec = images.get(str(year), {}).get(str(n))
            crops = None
            text = questions.get(n, "")
            if spec:
                crops = resolve_crops(cropper, spec, [m[0] for m in members.get(n, [])])
                if not crops:
                    drop("diagram not found")
                    continue
                text = text_outside(members.get(n, []), crops)
            edit = edits.get(str(year), {}).get(str(n), {})
            if "question" in edit and "options" in edit:
                parsed = (edit["question"], list(edit["options"]))
            else:
                parsed = split_options(text, bare=bool(review.get("bare_options")))
            if not parsed:
                drop("options not found")
                continue
            stem, options = parsed
            stem = edit.get("question", stem)
            options = list(edit.get("options", options))
            # Science papers print constants after the last option. They belong
            # to the question, not to option D.
            data = TRAILING_DATA.search(options[-1]) if rich else None
            if data:
                options[-1] = options[-1][: data.start()]
                given = data.group(1).strip()
                if not all(n in stem for n in re.findall(r"\d+(?:\.\d+)?", given)):
                    stem = f"{stem} ({given})"
            # "...dislike for Lawyer B because of ." - the dot marks a blank the
            # options complete, so it reads better without it.
            stem = re.sub(r"\s+\.$", "", stem)
            stem = dehyphen(stem)
            options = [dehyphen(tidy_option(o)) for o in options]
            if len(stem) < 8 or any(not o for o in options):
                drop("empty stem or option")
                continue
            checked = allow_re.sub(" ", stem) if allow_re else stem
            if LOST_CONTEXT.search(checked) and not crops:
                drop("needs diagram/passage/table")
                continue
            cross = CROSS_REFERENCE_RICH if rich else CROSS_REFERENCE
            if any(cross.search(o) for o in options):
                drop("options reference each other")
                continue
            if any(len(o) > 220 for o in options) or len(stem) > 700:
                drop("run-on text (extraction bleed)")
                continue
            # A leftover "B." or "47." inside an option means text from another
            # question bled in when the PDF's reading order was scrambled. In a
            # science stem "Fig. 2. The force..." or "ratio of 5. It..." is
            # ordinary prose, so rich stems are only checked for a stray letter;
            # hand-edited text has been read already.
            stem_check = STRAY_LETTER if rich else STRAY_MARK
            bled_options = "options" not in edit and any(STRAY_MARK.search(o) for o in options)
            bled_stem = "question" not in edit and stem_check.search(stem)
            if bled_options or bled_stem:
                drop("run-on text (extraction bleed)")
                continue
            letters = "ABCDE"[: len(options)]
            if answer not in letters:
                drop("answer outside options")
                continue
            # The bank is 4-option. Older papers had 5: drop one wrong option.
            if len(options) == 5:
                remove = 4 if answer != "E" else 3
                correct_text = options[letters.index(answer)]
                options = [o for i, o in enumerate(options) if i != remove]
                answer = "ABCD"[options.index(correct_text)]
            if len(set(o.lower() for o in options)) < 4:
                drop("duplicate options")
                continue
            title = contexts.get(n)
            if title and title.lower() not in stem.lower():
                stem = f"{title}: {stem}"
            for old, new in fixes:
                stem = stem.replace(old, new)
                options = [o.replace(old, new) for o in options]
            normalised = re.sub(r"[^a-z0-9]+", " ", stem.lower()).strip()
            if crops:
                # Same words, different picture: "Which of the diagrams...".
                normalised += f"|diagram {year}-{n}"
            if normalised in seen_stems:
                drop("repeat of an earlier year")
                continue
            seen_stems.add(normalised)
            item = {
                "exam": "jamb",
                "year": year,
                "subject": subject_slug,
            }
            topic = topics.get(str(year), {}).get(str(n))
            if topic:
                item["topic"] = topic
            if crops:
                if not image_dir:
                    raise ValueError("diagram crops need an image directory")
                folder = os.path.join(image_dir, subject_slug)
                os.makedirs(folder, exist_ok=True)
                name = f"{year}-{n}.png"
                cropper.render(crops, os.path.join(folder, name))
                item["image"] = f"/static/past-questions/{subject_slug}/{name}"
                report["images"] += 1
            out.append(
                {
                    **item,
                    "question": stem,
                    "options": [{"id": "ABCD"[i], "text": o} for i, o in enumerate(options)],
                    "answer": answer,
                    "source": f"JAMB UTME {year} Q{n}",
                }
            )
            kept += 1
            if corrected:
                report["corrected"] += 1
        report["years"][year] = {"parsed": len(questions), "kept": kept, "keyed": bool(key)}
    return out, report


def worksheet(pdf_path, review, out_txt, sheet_dir=None, years=None):
    """Dumps every parsed question - answered or not - for editorial review,
    with the diagram crop that "auto" would take. sheet_dir gets one contact
    sheet per year showing those crops."""
    global _keep_scripts
    review = review or {}
    rich = bool(review.get("rich"))
    _keep_scripts = rich
    lines = read_lines(pdf_path, rich=rich, symbols={**SYMBOL_FONT, **review.get("symbols", {})})
    cropper = Cropper(pdf_path) if rich else None
    rows = []
    for year, body in split_years(lines, review.get("banner")):
        if years and year not in years:
            continue
        q_lines, _ = split_key(body)
        questions, members = split_questions(
            q_lines, with_lines=True, cloze_jumps=bool(review.get("cloze_jumps"))
        )
        crops_for = {}
        for n in sorted(questions):
            crops = cropper.propose([m[0] for m in members[n]]) if rich else []
            text = text_outside(members[n], crops) if crops else questions[n]
            flags = []
            if LOST_CONTEXT.search(text):
                flags.append("REF")
            if crops:
                flags.append("DRAW " + " + ".join(
                    f"p{pno}[{r.x0:.0f},{r.y0:.0f},{r.x1:.0f},{r.y1:.0f}]" for pno, r in crops))
                crops_for[n] = crops
            page = members[n][0][0].page if rich else -1
            parsed = split_options(text, bare=bool(review.get("bare_options")))
            if parsed:
                stem, options = parsed
                body_text = stem + " || " + " | ".join(
                    f"{'ABCDE'[i]}) {tidy_option(o)}" for i, o in enumerate(options))
            else:
                body_text = "?? " + text
            rows.append(f"{year}-{n} p{page} {' '.join(flags)}\n    {body_text}")
        if sheet_dir and crops_for:
            os.makedirs(sheet_dir, exist_ok=True)
            contact_sheet(cropper, crops_for, os.path.join(sheet_dir, f"{year}.png"), str(year))
    with open(out_txt, "w", encoding="utf-8") as fh:
        fh.write("\n".join(rows) + "\n")
    return len(rows)


def contact_sheet(cropper, crops_for, dest, title, cols=3, cell_w=260, cell_h=200):
    out = fitz.open()
    items = sorted(crops_for.items())
    rows = (len(items) + cols - 1) // cols
    page = out.new_page(width=cols * cell_w, height=rows * (cell_h + 16) + 20)
    page.insert_text((6, 14), title, fontsize=11)
    for i, (n, crops) in enumerate(items):
        cx = (i % cols) * cell_w
        cy = 20 + (i // cols) * (cell_h + 16)
        page.insert_text((cx + 4, cy + 11), f"Q{n}", fontsize=10, color=(0.8, 0, 0))
        # Show exactly what a student will get: the final, cleaned render.
        preview = os.path.join(os.path.dirname(dest), f".preview-{n}.png")
        cropper.render(crops, preview, dpi=110)
        page.insert_image(fitz.Rect(cx + 4, cy + 14, cx + cell_w - 4, cy + cell_h + 10), filename=preview)
        os.remove(preview)
        page.draw_rect(fitz.Rect(cx + 1, cy + 1, cx + cell_w - 1, cy + cell_h + 14), color=(0.7, 0.7, 0.7), width=0.5)
    page.get_pixmap(dpi=100, alpha=False).save(dest)


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)
    pdf, slug, dest = sys.argv[1:4]
    answers = None
    if "--answers" in sys.argv:
        with open(sys.argv[sys.argv.index("--answers") + 1], encoding="utf-8") as fh:
            answers = json.load(fh)
    review = None
    if "--review" in sys.argv:
        with open(sys.argv[sys.argv.index("--review") + 1], encoding="utf-8") as fh:
            review = json.load(fh)
    if "--worksheet" in sys.argv:
        sheets = sys.argv[sys.argv.index("--sheets") + 1] if "--sheets" in sys.argv else None
        only = None
        if "--years" in sys.argv:
            only = {int(y) for y in sys.argv[sys.argv.index("--years") + 1].split(",")}
        count = worksheet(pdf, review, dest, sheets, only)
        print(json.dumps({"subject": slug, "worksheet": dest, "questions": count}))
        return
    image_dir = sys.argv[sys.argv.index("--images") + 1] if "--images" in sys.argv else None
    questions, report = build(pdf, slug, answers, review, image_dir)
    with open(dest, "w", encoding="utf-8") as fh:
        json.dump({"questions": questions}, fh, ensure_ascii=False, indent=1)
    dropped = report.pop("droppedItems")
    if "--dropped" in sys.argv:
        with open(sys.argv[sys.argv.index("--dropped") + 1], "w", encoding="utf-8") as fh:
            json.dump(dropped, fh, ensure_ascii=False, indent=1)
    print(json.dumps({"subject": slug, "kept": len(questions), **report}))


if __name__ == "__main__":
    main()
