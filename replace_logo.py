#!/usr/bin/env python3
"""
संतवाणी: सर्व .html पेजेसमधील हेडर लोगो (✨) बदलून विठ्ठल गंध लोगो लावतो.

वापर (साईटच्या मुख्य फोल्डरमध्ये, जिथे index.html आहे):
    python replace_logo.py            -> फक्त तपासणी (काहीही बदलत नाही)
    python replace_logo.py --apply    -> प्रत्यक्ष बदल करतो

आधी साईटचा बॅकअप / git commit नक्की घ्या.
"""
import re
import sys
from pathlib import Path

APPLY = "--apply" in sys.argv
ROOT = Path(".")
SKIP_DIRS = {".git", "node_modules", ".venv", "__pycache__"}

NEW = ('<span class="logo-icon"><img src="/logo-tilak.svg" alt="" '
       'width="24" height="36"></span>')

# <span class="logo-icon">✨</span>  (आत जागा/नवी ओळ असली तरी चालेल)
PATTERN = re.compile(r'<span\s+class="logo-icon"\s*>\s*✨\s*</span>')

changed, already, unmatched = [], 0, []

for path in ROOT.rglob("*.html"):
    if any(part in SKIP_DIRS for part in path.parts):
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        print("वाचता आली नाही (UTF-8 नाही):", path)
        continue

    if "logo-tilak.svg" in text:
        already += 1
        continue

    new_text, n = PATTERN.subn(NEW, text)
    if n:
        changed.append((path, n))
        if APPLY:
            path.write_text(new_text, encoding="utf-8")
    elif "logo-icon" in text:
        unmatched.append(path)

print()
print("बदल लागू होणारी पेजेस :", len(changed))
print("आधीच बदललेली पेजेस   :", already)
print("logo-icon आहे पण वेगळ्या रूपात (हाताने पहा):", len(unmatched))
for p in unmatched[:30]:
    print("   -", p)
if not APPLY:
    print("\nही फक्त तपासणी होती. प्रत्यक्ष बदलासाठी: python replace_logo.py --apply")
