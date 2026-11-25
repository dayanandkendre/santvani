#!/usr/bin/env python3
"""
संतवाणी: सर्व .html पेजेसमधील फुटर लोगो (✨ संतवाणी) बदलून विठ्ठल गंध लोगो लावतो.

वापर:
    python replace_footer_logo.py            -> फक्त तपासणी (काहीही बदलत नाही)
    python replace_footer_logo.py --apply    -> प्रत्यक्ष बदल करतो
"""
import re
import sys
from pathlib import Path

APPLY = "--apply" in sys.argv
ROOT = Path(".")
SKIP_DIRS = {".git", "node_modules", ".venv", "__pycache__"}

NEW_FOOTER = (
    '<h3 class="footer-logo">'
    '<img src="/logo-tilak.svg" alt="" width="20" height="30" '
    'style="vertical-align: middle; margin-right: 6px;">'
    'संतवाणी</h3>'
)

# <h3 class="footer-logo">✨ संतवाणी</h3> (मध्ये रिकामी जागा किंवा नवी ओळ असली तरी चालेल)
PATTERN = re.compile(r'<h3\s+class="footer-logo"\s*>\s*✨\s*संतवाणी\s*</h3>')

changed, already, unmatched = [], 0, []

for path in ROOT.rglob("*.html"):
    if any(part in SKIP_DIRS for part in path.parts):
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        print("वाचता आली नाही (UTF-8 नाही):", path)
        continue

    if 'class="footer-logo"' in text and "/logo-tilak.svg" in text.split('class="footer-logo"')[1][:150]:
        already += 1
        continue

    new_text, n = PATTERN.subn(NEW_FOOTER, text)
    if n:
        changed.append((path, n))
        if APPLY:
            path.write_text(new_text, encoding="utf-8")
    elif "footer-logo" in text:
        unmatched.append(path)

print()
print("बदल लागू होणारी पेजेस :", len(changed))
print("आधीच बदललेली पेजेस   :", already)
print("footer-logo आहे पण वेगळ्या रूपात (हाताने पहा):", len(unmatched))
for p in unmatched[:30]:
    print("   -", p)
if not APPLY:
    print("\nही फक्त तपासणी होती. प्रत्यक्ष बदलासाठी: python replace_footer_logo.py --apply")