import os
import re

ROOT_DIR = "."

# Mukhya policy pages sathi Meta Descriptions
META_DESCRIPTIONS = {
    "about.html": '<meta name="description" content="संतवाणी बद्दल संपूर्ण माहिती - मराठी संतांचे अभंग, गाथा, चरित्र आणि वाङ्मय संग्रह एकाच ठिकाणी उपलब्ध करून देणारा डिजिटल मंच.">',
    "contact.html": '<meta name="description" content="संतवाणी डिजिटल लायब्ररीशी संपर्क साधा. आपल्या प्रतिक्रिया, सूचना किंवा शंका आम्हाला कळवा.">',
    "disclaimer.html": '<meta name="description" content="संतवाणी संकेतस्थळाचे अस्वीकरण (Disclaimer) - साहित्याचे संकलन, अचूकता आणि कॉपीराइट विषयक माहिती.">',
    "privacy-policy.html": '<meta name="description" content="संतवाणी गोपनीयता धोरण (Privacy Policy) - वापरकर्त्यांची माहिती, कुकीज आणि सुरक्षिततेविषयीचे नियम.">',
    "terms.html": '<meta name="description" content="संतवाणी वापराच्या अटी व नियम (Terms and Conditions) - वाचक आणि वापरकर्त्यांसाठीचे कायदेशीर नियम.">'
}

def fix_links_and_meta():
    updated_files = 0

    for root, _, files in os.walk(ROOT_DIR):
        for file in files:
            if not file.endswith(".html"):
                continue

            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            orig_content = content

            # 1. /index.html links badlun root '/' karne
            content = re.sub(r'href=["\'](/index\.html|\.\./index\.html|\.\./\.\./index\.html)["\']', 'href="/"', content)

            # 2. Policy pages madhye Meta Description nasel tar add karne
            if file in META_DESCRIPTIONS and not re.search(r'<meta\s+name=["\']description["\']', content, re.IGNORECASE):
                tag = META_DESCRIPTIONS[file]
                if "<head>" in content:
                    content = content.replace("<head>", f"<head>\n    {tag}", 1)
                elif "<HEAD>" in content:
                    content = content.replace("<HEAD>", f"<HEAD>\n    {tag}", 1)

            if content != orig_content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                updated_files += 1

    print(f"Ekun {updated_files} HTML files madhil links aani SEO meta tags yashasvi update jhale!")

if __name__ == "__main__":
    fix_links_and_meta()