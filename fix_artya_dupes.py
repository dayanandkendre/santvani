import os
import re
from bs4 import BeautifulSoup

file_path = "pages/artisangrah/artya-sangrah.html"

if not os.path.exists(file_path):
    print(f"एरर: '{file_path}' मेळ्ळी ना.")
    exit()

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

soup = BeautifulSoup(content, "html.parser")

# आरती कार्डे वा सेक्शन सोदप
cards = soup.find_all(class_=re.compile(r'(sarth-grid|aarti-card|card)'))

seen_texts = set()
removed_count = 0

for card in cards:
    text_elem = card.find(class_=re.compile(r'aarti-text'))
    if not text_elem:
        continue

    raw_text = re.sub(r'\s+', ' ', text_elem.get_text()).strip()
    sample_key = raw_text[:50]

    if len(sample_key) >= 15 and sample_key in seen_texts:
        card.decompose()
        removed_count += 1
    else:
        if len(sample_key) >= 15:
            seen_texts.add(sample_key)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(str(soup))

print(f"[यशस्वी] {file_path} मधलीं {removed_count} डुप्लिकेट ब्लॉक्स काडून उडयलीं!")