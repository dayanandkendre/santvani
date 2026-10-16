import os
import re
from urllib.parse import urlparse

# Tuzhya site cha root folder path ithe dya (uda. r"F:\Test\santvani")
# Jar script root folder madhech thevli asel tar ha aapoap gheil:
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

# Report file save honyacha path
REPORT_FILE = os.path.join(ROOT_DIR, "audit_report.txt")

# Kharaab Encoding / Garbled characters pattern
GARBLED_REGEX = re.compile(r'(|Ã¢|â€™|â€œ|â€|ï¿½|&amp;amp;|&lt;/?\w+&gt;)')

# Unexpected Foreign Scripts (Devanagari, Basic Latin/English, Numbers aani Punctuation sodun)
# He pattern non-Devanagari aani non-standard symbols shodhnyasathi aahe
UNEXPECTED_CHAR_REGEX = re.compile(r'[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF]')

def get_all_html_files(root_dir):
    html_files = []
    for root, dirs, files in os.walk(root_dir):
        for f in files:
            if f.endswith('.html'):
                html_files.append(os.path.join(root, f))
    return html_files

def check_link_exists(current_file_path, href_val, root_dir):
    # External links, mailto, tel kinva anchor hashes ignore kara
    if href_val.startswith(('http://', 'https://', 'mailto:', 'tel:', '#', 'javascript:')):
        return True
    
    # Path clean karne (remove query string & hash)
    clean_href = href_val.split('#')[0].split('?')[0].strip()
    if not clean_href:
        return True

    # Root-relative path (/pages/...)
    if clean_href.startswith('/'):
        target_path = os.path.join(root_dir, clean_href.lstrip('/'))
    else:
        # Relative path (../../pages/...)
        current_dir = os.path.dirname(current_file_path)
        target_path = os.path.normpath(os.path.join(current_dir, clean_href))
        
    return os.path.exists(target_path)

def audit_html_file(file_path, root_dir):
    issues = {
        "broken_links": [],
        "garbled_text": [],
        "foreign_chars": []
    }
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        return {"error": f"File read error: {str(e)}"}

    # 1. Broken Links Check
    links = re.findall(r'href=["\']([^"\']+)["\']', content, re.IGNORECASE)
    for link in links:
        if not check_link_exists(file_path, link, root_dir):
            issues["broken_links"].append(link)

    # Text extraction sathi scripts aani styles kadhun taku
    text_content = re.sub(r'<script.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)
    text_content = re.sub(r'<style.*?</style>', '', text_content, flags=re.DOTALL | re.IGNORECASE)
    # HTML Tags kadhun plain text thevane
    clean_text = re.sub(r'<[^>]+>', ' ', text_content)

    # 2. Garbled Text / Broken Unicode Check
    garbled_matches = GARBLED_REGEX.findall(clean_text)
    if garbled_matches:
        issues["garbled_text"] = list(set(garbled_matches))

    # 3. Unexpected Foreign Character Check
    foreign_matches = UNEXPECTED_CHAR_REGEX.findall(clean_text)
    if foreign_matches:
        issues["foreign_chars"] = list(set(foreign_matches))

    return issues

def main():
    print(f"🔍 Site scan suru karat aahot: {ROOT_DIR}")
    html_files = get_all_html_files(ROOT_DIR)
    print(f"📄 Ekun {len(html_files)} HTML files sapadlyat.\n")

    report_lines = []
    report_lines.append("==================================================")
    report_lines.append("          SANTVANI SITE AUDIT REPORT             ")
    report_lines.append("==================================================\n")

    total_issues = 0

    for file_path in html_files:
        rel_path = os.path.relpath(file_path, ROOT_DIR)
        res = audit_html_file(file_path, ROOT_DIR)

        has_problem = False
        file_issues = []

        if res.get("broken_links"):
            has_problem = True
            file_issues.append(f"  [!] Broken Links ({len(res['broken_links'])}):")
            for bl in set(res["broken_links"]):
                file_issues.append(f"      - {bl}")

        if res.get("garbled_text"):
            has_problem = True
            file_issues.append(f"  [!] Garbled / Broken Characters: {', '.join(res['garbled_text'])}")

        if res.get("foreign_chars"):
            has_problem = True
            file_issues.append(f"  [!] Unexpected Foreign Script Characters: {', '.join(res['foreign_chars'])}")

        if has_problem:
            total_issues += 1
            report_lines.append(f"FILE: {rel_path}")
            report_lines.extend(file_issues)
            report_lines.append("-" * 50)
            print(f"⚠️ Issues sapadle: {rel_path}")

    report_lines.append(f"\nAudit Purna Jhala! Ekun {total_issues} files madhe issues sapadle.")

    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        f.write("\n".join(report_lines))

    print(f"\n✅ Audit complete! Sagle details ya file madhe save jhale aahet:")
    print(f"👉 {REPORT_FILE}")

if __name__ == "__main__":
    main()