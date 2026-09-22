# Past-question pipeline

Turns the JAMB past-question PDFs in `~/Downloads` into the bank the app serves
(`apps/api/data/past-questions/<subject>.json` plus the diagrams beside it),
which `pnpm --filter api seed:past-questions` loads into the database.

Nothing here runs automatically. Each paper is read by hand, every answer is
worked out and recorded in a review file, and only then is the subject rebuilt.

## Layout

| Path | What it holds |
| --- | --- |
| `pdf_to_json.py` | the extractor: PDF → questions, options, diagram crops |
| `convert_all.py` | rebuilds one subject (or all) from the PDFs + review files |
| `reviews/<subject>.json` | the editorial decisions: topics, edits, drops, crops |
| `answer-keys/<subject>.json` | the answer for every kept question, by year and number |
| `tools/` | helpers used while reviewing a paper (below) |
| `../../data/past-questions/` | the built bank: one JSON per subject + `images/<subject>/` |

## The loop, one paper at a time

```bash
cd apps/api/scripts/past-questions

# 1. read the paper
python tools/worksheet.py <subject> <year>          # every question, as extracted

# 2. decide each question by hand, then record the batch
python tools/decide.py <subject> batch.json         # writes reviews/ + answer-keys/

# 3. rebuild and check nothing was thrown away by accident
python convert_all.py ~/Downloads <subject>
python tools/drops.py <subject>                     # only non-routine drops print

# 4. once the subject is finished
cd ../.. && npm run test:unit                       # validates topics, answers, images
npx tsx src/seeds/run-past-questions.ts             # writes to the database
```

### batch.json

```jsonc
{"<year>": {
  "12": "drop",                       // leave this question out
  "13": ["B", "alg"],                 // answer letter as printed, topic alias
  "14": ["C", "circ", {              // optional third element:
    "img": [[page, x0, y0, x1, y1]],  //   diagram crop (page is 0-based), or "auto"
    "edit": {"question": "...",       //   hand-corrected text where extraction garbled it
             "options": ["...", "..."]}
  }]
}}
```

Topic aliases are listed at the top of `tools/decide.py`, one map per subject;
they expand to the syllabus topic slugs the app uses, and `decide.py` refuses a
topic that is not in the syllabus.

### Review-file options

Beyond `topics`, `edit`, `images` and `drop`, which `decide.py` maintains:

| Key | Effect |
| --- | --- |
| `rich` | read each line from its font spans, so 10⁸ and P₁ survive |
| `banner` | only lines carrying this heading start a new paper (for papers that quote years in their own text) |
| `dehyphenate` | join words the paper broke across lines ("incur- red") |
| `allow` | words this subject uses in its own sense ("a partner's drawing") which must not read as a reference to a missing diagram |
| `add` | questions the extractor missed entirely; their text comes from `edit`, their answer from the key |
| `correct`, `replace`, `symbols` | fix a printed answer, fix a recurring typo, map a symbol font |

## Reviewing tools

- `tools/worksheet.py <subject> <year>` — dump a paper as extracted.
- `tools/decide.py <subject> batch.json` — merge a batch of decisions.
- `tools/drops.py <subject>` — list questions that were answered but dropped.
- `tools/figures.py <pdf> <page>…` — propose diagram crops for a page and render a contact sheet.
- `tools/montage.py out.png img…` — grid of finished crops, to check what a student will see.
- `tools/show.py <subject> <year>` — print a built year: answer, topic, stem, options.

## Subjects

Wired into `convert_all.py`, `tools/worksheet.py` and the alias maps in
`tools/decide.py`: biology, economics, literature, physics, mathematics,
principles-of-accounts, english, chemistry, government, commerce. The last three
are set up but not yet reviewed - their `reviews/*.json` carry only the reader
flags, so a build produces nothing until answers are recorded.

Government's prose quotes historical years ("the 1914 amalgamation"), which is
why every review here sets `banner`: without it those years start a new paper
and the questions after them are lost.

## Rules the build enforces

A question is dropped rather than shipped when it cannot stand on its own: it
refers to a diagram, table or passage that is not attached; its options
cross-reference each other ("none of the above"); two options are identical;
the extraction bled text from a neighbouring question; or the answer key points
outside the options. Five-option papers are trimmed to four by removing a wrong
option, the correct one is never moved out, and `npm run test:unit` re-checks
every one of those properties against the syllabus before anything is seeded.
