"""Merge a batch of editorial decisions into answer-keys/<subject>.json and
reviews/<subject>.json.

Usage: python decide.py <subject> <decisions.json>

decisions.json: {"<year>": {"<n>": entry}} where entry is
  "drop"                                   - leave the question out
  ["B", "cur"]                             - answer (printed letter) and topic alias
  ["B", "cur", {"img": "auto" | [[page, x0, y0, x1, y1], ...],
                "edit": {"question": "...", "options": [...]}}]
"""
import json
import os
import sys

ROOT = r"C:\Users\PROBOOK 430 G2\Desktop\propella\apps\api\scripts\past-questions"

ALIASES = {
    "mathematics": {
        "nb": "number-bases", "fr": "fractions-decimals-approximation", "ind": "indices",
        "log": "logarithms", "sur": "surds", "set": "sets", "ratio": "ratio-proportion-rates",
        "pct": "percentages-commercial-arithmetic", "mod": "modular-arithmetic",
        "alg": "algebraic-expressions", "lin": "linear-equations-inequalities",
        "quad": "quadratic-equations", "var": "variation", "seq": "sequences-series",
        "mat": "matrices-determinants", "poly": "polynomials-remainder-theorem",
        "logic": "logical-reasoning", "ang": "plane-geometry-angles", "tri": "triangles-polygons",
        "circ": "circle-geometry", "mens": "mensuration-plane", "solid": "mensuration-solids",
        "pyth": "pythagoras-theorem", "trig": "trigonometric-ratios", "sine": "sine-cosine-rules",
        "tgraph": "trigonometric-graphs", "coord": "coordinate-geometry",
        "constr": "geometric-construction", "earth": "earth-geometry",
        "func": "functions-relations", "diff": "differentiation",
        "appdiff": "applications-of-differentiation", "integ": "integration",
        "data": "data-presentation", "mean": "measures-of-central-tendency",
        "disp": "measures-of-dispersion", "perm": "permutations-combinations",
        "prob": "probability",
    },
    "principles-of-accounts": {
        "nat": "nature-of-accounting", "de": "double-entry", "boe": "books-of-original-entry",
        "cb": "cash-book", "brs": "bank-reconciliation", "tb": "trial-balance-and-errors",
        "fa": "final-accounts", "adj": "adjustments-and-depreciation", "stock": "stock-valuation",
        "ctrl": "control-accounts", "inc": "incomplete-records", "manu": "manufacturing-accounts",
        "nfp": "not-for-profit-accounts", "dept": "departmental-accounts", "branch": "branch-accounts",
        "jv": "joint-ventures", "part": "partnership-accounts", "co": "company-accounts",
        "interp": "interpretation-of-accounts", "psa": "public-sector-accounting",
        "tech": "accounting-technology",
    },
    "english": {
        "comp": "comprehension", "sum": "summary-writing", "pos": "parts-of-speech",
        "sent": "sentence-structure", "conc": "concord", "tense": "tenses",
        "vocab": "vocabulary-synonyms-antonyms", "idiom": "idioms-figurative",
        "lex": "lexis-structure", "punc": "punctuation-mechanics",
        "vowel": "oral-english-vowels", "stress": "oral-english-stress",
        "essay": "essay-writing", "letter": "letter-writing",
    },
    "chemistry": {
        "sep": "separation-techniques", "atom": "atomic-structure", "per": "periodic-table",
        "bond": "chemical-bonding", "kin": "kinetic-theory-states", "gas": "gas-laws-chemistry",
        "form": "chemical-formulae-equations", "mole": "mole-concept",
        "stoi": "stoichiometry-calculations", "soln": "solutions-solubility",
        "acid": "acids-bases-salts", "vol": "volumetric-analysis", "redox": "oxidation-reduction",
        "elec": "electrolysis", "energy": "energy-changes", "rate": "rates-of-reaction",
        "eq": "chemical-equilibrium", "water": "water-hardness", "air": "air-and-oxygen",
        "g12": "group-1-2-elements", "hal": "halogens", "nitro": "nitrogen-compounds",
        "sul": "sulphur-compounds", "carb": "carbon-compounds-inorganic",
        "metal": "metals-extraction", "qual": "qualitative-analysis",
        "org": "organic-introduction", "alkane": "alkanes", "alkene": "alkenes-alkynes",
        "alkanol": "alkanols-alkanals", "ester": "alkanoic-acids-esters",
        "biomol": "biomolecules-polymers",
    },
    "government": {
        "concept": "basic-concepts-government", "forms": "forms-of-government",
        "organs": "organs-of-government", "systems": "systems-of-government",
        "const": "constitution", "party": "political-parties", "elect": "electoral-process",
        "admin": "public-administration", "pre": "pre-colonial-systems",
        "colad": "colonial-administration", "colconst": "colonial-constitutions",
        "nat": "nationalism-independence", "rep1": "first-republic",
        "rep23": "second-third-republic", "rep4": "fourth-republic",
        "foreign": "nigerian-foreign-policy", "intl": "international-organisations",
    },
    "commerce": {
        "nature": "nature-of-commerce", "occ": "occupations", "home": "home-trade",
        "foreign": "foreign-trade", "units": "business-units", "docs": "trade-documents",
        "trans": "transportation", "comm": "communication", "ware": "warehousing",
        "ad": "advertising-marketing", "ins": "insurance", "bank": "banking-commerce",
        "money": "money-capital-markets", "fin": "business-finance",
        "acct": "business-documents-accounts", "mgmt": "business-management",
        "consumer": "consumer-protection", "env": "commercial-environment-nigeria",
    },
    "physics": {
        "mu": "measurement-units", "vec": "scalars-vectors", "mot": "motion-linear",
        "proj": "projectile-motion", "nl": "newtons-laws", "eq": "equilibrium-forces",
        "wep": "work-energy-power", "mach": "machines", "circ": "circular-motion-gravitation",
        "shm": "simple-harmonic-motion", "elas": "elasticity", "fp": "fluids-pressure",
        "stv": "surface-tension-viscosity", "temp": "temperature-thermometry",
        "exp": "thermal-expansion", "heat": "heat-quantity", "gas": "gas-laws",
        "ht": "heat-transfer", "vap": "vapours-humidity", "wave": "wave-motion",
        "snd": "sound-waves", "refl": "light-reflection", "refr": "light-refraction",
        "opt": "optical-instruments", "ems": "electromagnetic-spectrum", "es": "electrostatics",
        "cap": "capacitors", "cur": "current-electricity", "eep": "electrical-energy-power",
        "mag": "magnetism", "emf": "electromagnetic-field", "emi": "electromagnetic-induction",
        "ac": "alternating-current", "elec": "electronics-conduction",
        "atom": "atomic-structure-physics", "pe": "photoelectric-effect", "rad": "radioactivity",
    },
}


def load(path, default):
    if os.path.exists(path):
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    return default


def save(path, data):
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1, sort_keys=True)
        fh.write("\n")


def main():
    subject, batch_file = sys.argv[1], sys.argv[2]
    aliases = ALIASES.get(subject, {})
    keys_path = os.path.join(ROOT, "answer-keys", f"{subject}.json")
    review_path = os.path.join(ROOT, "reviews", f"{subject}.json")
    keys = load(keys_path, {})
    review = load(review_path, {"rich": True})
    for section in ("topics", "images", "edit", "drop", "add"):
        review.setdefault(section, {})
    with open(batch_file, encoding="utf-8") as fh:
        batch = json.load(fh)
    counts = {"answered": 0, "dropped": 0, "images": 0, "edits": 0}
    for year, entries in batch.items():
        for n, entry in entries.items():
            # A re-decision replaces the old one entirely.
            for section in ("topics", "images", "edit"):
                review[section].get(year, {}).pop(n, None)
            keys.get(year, {}).pop(n, None)
            dropped = review["drop"].setdefault(year, [])
            if int(n) in dropped:
                dropped.remove(int(n))
            if entry == "drop":
                dropped.append(int(n))
                dropped.sort()
                counts["dropped"] += 1
                continue
            answer, topic = entry[0], entry[1]
            extra = entry[2] if len(entry) > 2 else {}
            assert answer in "ABCDE" and len(answer) == 1, (year, n, answer)
            topic = aliases.get(topic, topic)
            assert topic in aliases.values() or not aliases, (year, n, topic)
            keys.setdefault(year, {})[n] = answer
            review["topics"].setdefault(year, {})[n] = topic
            counts["answered"] += 1
            if "img" in extra:
                review["images"].setdefault(year, {})[n] = extra["img"]
                counts["images"] += 1
            if "edit" in extra:
                review["edit"].setdefault(year, {})[n] = extra["edit"]
                counts["edits"] += 1
            if extra.get("add"):
                added = review.setdefault("add", {}).setdefault(year, [])
                if int(n) not in added:
                    added.append(int(n))
                    added.sort()
    for section in ("topics", "images", "edit", "drop", "add"):
        review[section] = {y: v for y, v in review[section].items() if v}
    keys = {y: v for y, v in keys.items() if v}
    save(keys_path, keys)
    save(review_path, review)
    print(json.dumps(counts))


if __name__ == "__main__":
    main()
