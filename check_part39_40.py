import os
import re
from bs4 import BeautifulSoup

def inspect_file(filepath):
    if not os.path.exists(filepath):
        return f"[फाईल सापडली नाही: {filepath}]", []
    
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    
    # हेडर मधील टायटल/क्रमांक पाहणे
    title = soup.find("title")
    title_text = title.get_text() if title else ""
    
    # अभंग शोधणे
    abhangs = []
    cards = soup.find_all(class_=re.compile(r'(sarth-grid|abhang-card)'))
    for c in cards:
        num = c.find(class_=re.compile(r'abhang-number'))
        txt = c.find(class_=re.compile(r'abhang-text'))
        n_val = num.get_text().strip() if num else ""
        t_val = re.sub(r'\s+', ' ', txt.get_text()).strip()[:40] if txt else ""
        if t_val:
            abhangs.append((n_val, t_val))
            
    return title_text, abhangs

t39, a39 = inspect_file("pages/abhang/tukaram-gatha-part39.html")
t40, a40 = inspect_file("pages/abhang/tukaram-gatha-part40.html")

print("="*60)
print(f"Part 39 Title: {t39}")
print(f"Part 39 मधील अभंग संख्या: {len(a39)}")
if a39:
    print(f"Part 39 पहिला अभंग : {a39[0]}")
    print(f"Part 39 शेवटचा अभंग: {a39[-1]}")

print("\n" + "-"*60 + "\n")

print(f"Part 40 Title: {t40}")
print(f"Part 40 मधील अभंग संख्या: {len(a40)}")
if a40:
    print(f"Part 40 पहिला अभंग : {a40[0]}")
    print(f"Part 40 शेवटचा अभंग: {a40[-1]}")
print("="*60)