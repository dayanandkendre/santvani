import os
import re
from bs4 import BeautifulSoup

file_path = "kabir-doha.html"

if not os.path.exists(file_path):
    print(f"Error: {file_path} sapadli nahi!")
    exit()

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

cards = soup.find_all(class_=re.compile(r'feature-card'))
print(f"Total cards in kabir-doha: {len(cards)}")

seen_texts = set()
removed_count = 0

for card in cards:
    # Dohyacha text shodhane
    quote_tag = card.find(class_=re.compile(r'quote-main-text'))
    if not quote_tag:
        continue
    
    # Text clean karne
    raw_text = re.sub(r'\s+', ' ', quote_tag.get_text()).strip()
    # Dohyachi pahili ol match sathi vaparne
    core_doha = re.sub(r'[॥\d\s"]+', '', raw_text[:35])

    if core_doha in seen_texts:
        # Repeat card decompose/delete karne
        card.decompose()
        removed_count += 1
    else:
        seen_texts.add(core_doha)

print(f"Removed Duplicate Doha Cards: {removed_count}")
print(f"Remaining Unique Doha Cards: {len(seen_texts)}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(str(soup))

print("\n[Yashasvi] kabir-doha.html madhil duplicate dohe clean zale ahet!")