import os
import re
from bs4 import BeautifulSoup

TARGET_FILES = [
    "pages/abhang/lokpriya-namdev-abhang.html",
    "pages/abhang/tukaram-gatha-part28.html"
]

# Marathi ank conversion
MARATHI_NUMS = str.maketrans("0123456789", "०१२३४५६७८९")

def to_marathi_num(n):
    return str(n).translate(MARATHI_NUMS)

def clean_and_reindex(file_path):
    if not os.path.exists(file_path):
        print(f"[File nahi sapadli] -> {file_path}")
        return

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    soup = BeautifulSoup(content, "html.parser")

    # Sagli abhang cards shodhne
    cards = soup.find_all(class_=re.compile(r'(sarth-grid|abhang-card)'))
    
    seen_texts = set()
    valid_cards = []
    removed_count = 0

    # 1. Duplicates kadhun takne
    for card in cards:
        text_elem = card.find(class_=re.compile(r'abhang-text'))
        if not text_elem:
            valid_cards.append(card)
            continue

        raw_text = re.sub(r'\s+', ' ', text_elem.get_text()).strip()
        sample_key = raw_text[:50]

        if len(sample_key) >= 15 and sample_key in seen_texts:
            card.decompose()
            removed_count += 1
        else:
            if len(sample_key) >= 15:
                seen_texts.add(sample_key)
            valid_cards.append(card)

    # 2. Urlelya saglya abhanganna 1 te N kramavar number lavne
    for idx, card in enumerate(valid_cards, start=1):
        idx_str = str(idx)
        marathi_idx = to_marathi_num(idx)

        # Card ID update
        card['id'] = f"abhang-card-{idx_str}"

        # Abhang Number Header: ॥ अभंग X ॥
        num_span = card.find(class_=re.compile(r'abhang-number'))
        if num_span:
            num_span.string = f"॥ अभंग {marathi_idx} ॥"

        # Badge ID
        badge = card.find(id=re.compile(r'badge-\d+'))
        if badge:
            badge['id'] = f"badge-{idx_str}"

        # Abhang Text ID
        abhang_txt = card.find(id=re.compile(r'abhang-text-\d+'))
        if abhang_txt:
            abhang_txt['id'] = f"abhang-text-{idx_str}"

        # Bhavarth Text ID
        bhavarth_txt = card.find(id=re.compile(r'bhavarth-text-\d+'))
        if bhavarth_txt:
            bhavarth_txt['id'] = f"bhavarth-text-{idx_str}"

        # Buttons functions update: copyAbhangText, shareAbhang, saveAbhangAsImage
        for btn in card.find_all("button"):
            onclick = btn.get("onclick", "")
            if "copyAbhangText" in onclick:
                btn['onclick'] = f"copyAbhangText({idx_str})"
            elif "shareAbhang" in onclick:
                btn['onclick'] = f"shareAbhang({idx_str})"
            elif "saveAbhangAsImage" in onclick:
                btn['onclick'] = f"saveAbhangAsImage({idx_str})"
            elif "toggleAbhangView" in onclick:
                btn['onclick'] = f"toggleAbhangView({idx_str})"
                btn['id'] = f"toggle-btn-{idx_str}"

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(str(soup))

    print(f"[Done] {file_path}")
    print(f" -> {removed_count} duplicate abhang kadhle.")
    print(f" -> Ekun {len(valid_cards)} abhang 1 te {len(valid_cards)} kramavar re-index kele.\n")

if __name__ == "__main__":
    print("Duplicates kadhun exact serial number lavne suru aahe...\n")
    for f in TARGET_FILES:
        clean_and_reindex(f)