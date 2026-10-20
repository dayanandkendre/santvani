import os
import re
from collections import Counter
from bs4 import BeautifulSoup

# ज्या पेजेसवर सर्वात जास्त डुप्लिकेट्स संशयित आहेत त्या फाइल्स
TARGET_FILES = [
    "pages/abhang/sant-sena-maharaj-abhang.html",
    "pages/abhang/lokpriya-namdev-abhang.html",
    "pages/abhang/tukaram-gatha-part28.html",
    "pages/artisangrah/artya-sangrah.html"
]

def check_file_dupes(file_path):
    if not os.path.exists(file_path):
        print(f"\n[सापडली नाही] -> {file_path}")
        return

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    # नको असलेले घटक काढून टाकणे
    for tag in soup(["script", "style", "noscript", "header", "footer", "nav"]):
        tag.decompose()

    # अभंग टेक्स्ट ब्लॉक्स शोधणे
    abhang_elements = soup.find_all(class_=re.compile(r'(abhang-text|aarti-text)'))
    
    if abhang_elements:
        lines = [re.sub(r'\s+', ' ', el.get_text()).strip()[:60] for el in abhang_elements if len(el.get_text().strip()) > 10]
    else:
        # क्लास सापडला नाही तर सरळ टेक्स्टच्या मोठ्या ओळी मोजणे
        lines = [re.sub(r'\s+', ' ', l).strip()[:60] for l in soup.get_text().splitlines() if len(re.sub(r'\s+', ' ', l).strip()) > 35]

    counts = Counter(lines)
    dupes = {text: c for text, c in counts.items() if c > 1}

    print("\n" + "="*50)
    print(f"फाईल: {file_path}")
    print("="*50)
    if not dupes:
        print("अभंगांमध्ये कोणतेही खरे डुप्लिकेट्स सापडले नाहीत (फक्त हेडिंग्स/बटन्स असू शकतात).")
    else:
        print(f"एकूण {len(dupes)} कडवे/ओळी वारंवार आलेल्या सापडल्या:")
        for text, c in list(dupes.items())[:10]:
            print(f" -> [{c} वेळा आली]: {text}...")

if __name__ == "__main__":
    print("डुप्लिकेट अभंग शोधणे सुरू आहे...")
    for f in TARGET_FILES:
        check_file_dupes(f)