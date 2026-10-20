import os
import re
from bs4 import BeautifulSoup

file_path = "pages/abhang/sant-sena-maharaj-abhang.html"

if not os.path.exists(file_path):
    print(f"एरर: '{file_path}' सापडली नाही. कृपया फाईल पाथ तपासा.")
    exit()

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

soup = BeautifulSoup(content, "html.parser")
cards = soup.find_all(class_=re.compile(r'sarth-grid'))

print("="*60)
print(f"तपासणी: {file_path}")
print(f"एकूण सापडलेले अभंग बॉक्सेस: {len(cards)}")
print("="*60)

# १. डुप्लिकेट अभंग शोधणे
seen_abhangs = {}
duplicates_found = []

for idx, card in enumerate(cards, start=1):
    header = card.find(class_=re.compile(r'abhang-number'))
    h_text = header.get_text().strip() if header else f"क्रमांक {idx}"

    text_elem = card.find(class_=re.compile(r'abhang-text'))
    if not text_elem:
        continue

    # पहिली ओळ/कडवे तपासणीसाठी घेणे
    raw_text = re.sub(r'\s+', ' ', text_elem.get_text()).strip()
    first_line = raw_text[:45]

    if first_line in seen_abhangs:
        duplicates_found.append((seen_abhangs[first_line], h_text, first_line))
    else:
        seen_abhangs[first_line] = h_text

print("\n[१] डुप्लिकेट अभंग तपासणी निकाल:")
if duplicates_found:
    for orig, dupe, line in duplicates_found:
        print(f" -> '{orig}' आणि '{dupe}' सारखेच आहेत!")
        print(f"    सुरुवात: {line}...\n")
else:
    print(" -> कोणतीही पुनरावृत्ती (Duplicate) आढळली नाही.")

# २. अभंग २० भावार्थ टायपो तपासणी
print("[२] अभंग २० च्या भावार्थातील टायपो तपासणी:")
if "जीवां व्हिडींवर" in content:
    print(" -> आढळले: 'जीवां व्हिडींवर' हा चुकीचा शब्द कोडमध्ये उपस्थित आहे.")
else:
    print(" -> 'जीवां व्हिडींवर' हा शब्द सापडला नाही (आधीच दुरुस्त झाला असावा).")

# ३. अभंग ४० चा क्रम तपासणी
print("\n[३] अभंग ४० चा कडवा क्रम तपासणी:")
abhang_40_match = re.search(r'॥ अभंग ४० ॥.*?<div class="abhang-text"[^>]*>(.*?)</div>', content, re.DOTALL)
if abhang_40_match:
    lines_40 = [l.strip() for l in abhang_40_match.group(1).split("<br>") if l.strip()]
    for l in lines_40:
        clean_l = re.sub(r'<[^>]+>', '', l).strip()
        print(f"    {clean_l}")
else:
    print(" -> अभंग ४० चा टेक्स्ट ब्लॉक सापडला नाही.")

print("="*60)