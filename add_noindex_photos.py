import os
import re

# Photo फाइल्स असलेल्या फोल्डरचा पाथ (रूटमधून)
PHOTO_DIR = "./photo"

ROBOTS_TAG = '<meta name="robots" content="noindex, follow">'

def update_photo_meta_tags(folder_path):
    if not os.path.exists(folder_path):
        print(f"एरर: '{folder_path}' फोल्डर सापडले नाही.")
        return

    updated_count = 0
    skipped_count = 0

    for root, _, files in os.walk(folder_path):
        for file in files:
            if not file.endswith(".html"):
                continue

            file_path = os.path.join(root, file)

            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            # आधीच noindex, follow असेल तर पुन्हा बदल करू नका
            if 'content="noindex, follow"' in content or "content='noindex, follow'" in content:
                skipped_count += 1
                continue

            # आधी एखादा दुसरा robots टॅग असेल तर तो बदला
            if re.search(r'<meta\s+name=["\']robots["\'][^>]*>', content, re.IGNORECASE):
                new_content = re.sub(
                    r'<meta\s+name=["\']robots["\'][^>]*>',
                    ROBOTS_TAG,
                    content,
                    flags=re.IGNORECASE
                )
            # जुना robots टॅग नसेल तर <head> च्या आत सुरुवातीला टाका
            elif "<head>" in content:
                new_content = content.replace("<head>", f"<head>\n    {ROBOTS_TAG}", 1)
            elif "<HEAD>" in content:
                new_content = content.replace("<HEAD>", f"<HEAD>\n    {ROBOTS_TAG}", 1)
            else:
                print(f"चेतावणी: <head> टॅग सापडला नाही: {file}")
                continue

            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)

            updated_count += 1

    print("\n--- निकाल ---")
    print(f"एकूण अपडेट केलेल्या फाइल्स: {updated_count}")
    print(f"आधीच योग्य टॅग असलेल्या फाइल्स: {skipped_count}")

if __name__ == "__main__":
    print("Photo फाइल्समध्ये noindex, follow जोडणे सुरू आहे...")
    update_photo_meta_tags(PHOTO_DIR)