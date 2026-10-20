import os
import re
from bs4 import BeautifulSoup
from collections import Counter

file_path = "pages/artisangrah/artya-sangrah.html"

if not os.path.exists(file_path):
    print(f"एरर: '{file_path}' मेळ्ळी ना.")
    exit()

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

soup = BeautifulSoup(content, "html.parser")

# Header, nav, footer, script कुशीक दवरप
for tag in soup(["script", "style", "noscript", "header", "footer", "nav"]):
    tag.decompose()

# पानातले सगळे परिच्छेद (p) वा कडव्यांचे टॅग्ज तपासप
all_blocks = soup.find_all(['div', 'p'])
target_blocks = []

for b in all_blocks:
    # फक्त तेच ब्लॉक्स घेवप जातुंत आरतीचे कडवे आसा (ज्यांत ॥१॥, ॥२॥ वा धृ. आसा)
    t = re.sub(r'\s+', ' ', b.get_text()).strip()
    if re.search(r'(॥\s*\d+\s*॥|॥\s*धृ\s*॥|जय देव|आरती)', t) and len(t) > 25 and len(t) < 400:
        # direct children नासलेले बारीक ब्लॉक्स दवरप
        if not b.find(['div', 'p']):
            target_blocks.append(b)

seen_stanzas = set()
removed = 0

for block in target_blocks:
    t = re.sub(r'\s+', ' ', block.get_text()).strip()
    key = t[:50]
    if key in seen_stanzas:
        block.decompose()
        removed += 1
    else:
        seen_stanzas.add(key)

if removed > 0:
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(str(soup))
    print(f"[यशस्वी] {removed} डुप्लिकेट कडवीं निवळ करून फायल अपडेट केली!")
else:
    print("[माहिती] थेट टॅग पातळीचेर डुप्लिकेट्स मेळ्ळे नात, स्ट्रक्चर वेगळे आसूं येता.")