"""check-numbers.py - list every k-amount and percentage on the session pages that the course map
does not contain, so a human can confirm each one is hand arithmetic shown on the page.
Run from the repo root: python3 materials/check-numbers.py [page ...]"""
import glob
import re
import sys

TOK = re.compile(r"[+-]?\d[\d,]*\.\d+k|[+-]?\d+(?:\.\d+)?%")
mp = open("materials/official-course-map.md").read() + open("materials/source-facts.md").read()
allowed = {t.lstrip("+-") for t in TOK.findall(mp)}
pages = sys.argv[1:] or sorted(glob.glob("courses/*.html"))
for p in pages:
    txt = re.sub(r"<[^>]+>", " ", open(p).read())
    odd = sorted({t for t in TOK.findall(txt) if t.lstrip("+-") not in allowed})
    print(p.split("/")[-1], "->", ", ".join(odd) if odd else "clean")
