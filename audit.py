import os
import re
import csv
from collections import Counter
from bs4 import BeautifulSoup

# तुमच्या HTML फाइल्स असलेल्या फोल्डरचा path इथे द्या
DIRECTORY_PATH = "."
OUTPUT_CSV = "santvani_audit_report.csv"

# तपासण्यासाठी UI Noise शब्दांची यादी
NOISE_KEYWORDS = ["कॉपी", "शेअर", "इमेज ९:१६", "भावार्थ पहा", "Download", "Share"]

def clean_text(text):
    return re.sub(r'\s+', ' ', text).strip()

def audit_html_files(root_dir):
    results = []

    for root, _, files in os.walk(root_dir):
        for file in files:
            if not file.endswith(".html"):
                continue

            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, root_dir)

            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            soup = BeautifulSoup(content, "html.parser")

            # Meta tags तपासणी
            canonical = soup.find("link", rel=lambda x: x and "canonical" in x.lower())
            has_canonical = "Yes" if canonical and canonical.get("href") else "No"

            meta_desc = soup.find("meta", attrs={"name": lambda x: x and x.lower() == "description"})
            has_meta_desc = "Yes" if meta_desc and meta_desc.get("content") else "No"

            # Script, style आणि अनावश्यक घटक बाजूला काढून मुख्य मजकूर काढणे
            for tag in soup(["script", "style", "noscript", "header", "footer"]):
                tag.decompose()

            raw_text = soup.get_text(separator=" ")
            words = clean_text(raw_text).split()
            word_count = len(words)

            # UI Noise शोधणे
            noise_counts = {kw: raw_text.count(kw) for kw in NOISE_KEYWORDS}
            total_noise = sum(noise_counts.values())

            # अभंग डुप्लिकेशन तपासणी (साध्या कडव्यांच्या ओळींवरून)
            lines = [clean_text(line) for line in raw_text.splitlines() if len(clean_text(line)) > 15]
            line_counts = Counter(lines)
            potential_duplicates = [line[:30] + "..." for line, count in line_counts.items() if count > 1 and not any(kw in line for kw in NOISE_KEYWORDS)]

            # Broken / Empty links
            empty_links = 0
            has_index_link = "No"
            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                if href in ["#", "", "javascript:void(0)"]:
                    empty_links += 1
                if "index.html" in href:
                    has_index_link = "Yes"

            results.append({
                "File": rel_path,
                "Word_Count": word_count,
                "Has_Canonical": has_canonical,
                "Has_Meta_Description": has_meta_desc,
                "UI_Noise_Count": total_noise,
                "Potential_Internal_Dupes": len(potential_duplicates),
                "Empty_or_Dummy_Links": empty_links,
                "Links_to_index_html": has_index_link,
                "Duplicate_Samples": " | ".join(potential_duplicates[:3])
            })

    return results

def save_to_csv(data, output_file):
    if not data:
        print("कोणतीही HTML फाईल सापडली नाही.")
        return

    fieldnames = list(data[0].keys())
    with open(output_file, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    print(f"Audit रिपोर्ट तयार झाला: {output_file}")

if __name__ == "__main__":
    print("ऑडिट सुरू आहे...")
    audit_data = audit_html_files(DIRECTORY_PATH)
    save_to_csv(audit_data, OUTPUT_CSV)