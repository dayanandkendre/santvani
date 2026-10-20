import os
import re

# Abhang files aslelya folder cha path
TARGET_DIR = "./pages/abhang"

def clean_abhang_buttons(directory):
    if not os.path.exists(directory):
        print(f"Error: '{directory}' folder sapadla nahi. Path check kara.")
        return

    updated_files_count = 0
    total_files_checked = 0

    # Folder aani tyachya aatle sub-folders scan karne
    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith(".html"):
                continue

            total_files_checked += 1
            file_path = os.path.join(root, file)

            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            original_content = content

            # 1. Copy button - "कॉपी" shabd kadhun CSS class lavne
            content = re.sub(
                r'<button\s+class="action-btn"\s+onclick="copyAbhangText\((\d+)\)">\s*<i\s+class="fa-regular fa-copy"></i>\s*कॉपी\s*</button>',
                r'<button class="action-btn btn-copy" onclick="copyAbhangText(\1)" aria-label="अभंग कॉपी करा" title="कॉपी करा"><i class="fa-regular fa-copy"></i></button>',
                content
            )

            # 2. Share button - "शेअर" shabd kadhun CSS class lavne
            content = re.sub(
                r'<button\s+class="action-btn"\s+onclick="shareAbhang\((\d+)\)">\s*<i\s+class="fa-solid fa-share-nodes"></i>\s*शेअर\s*</button>',
                r'<button class="action-btn btn-share" onclick="shareAbhang(\1)" aria-label="अभंग शेअर करा" title="शेअर करा"><i class="fa-solid fa-share-nodes"></i></button>',
                content
            )

            # 3. Image 9:16 button - "इमेज ९:१६" shabd kadhun CSS class lavne
            content = re.sub(
                r'<button\s+class="action-btn"\s+onclick="saveAbhangAsImage\((\d+)\)">\s*<i\s+class="fa-regular fa-image"></i>\s*इमेज\s*९:१६\s*</button>',
                r'<button class="action-btn btn-img" onclick="saveAbhangAsImage(\1)" aria-label="इमेज डाऊनलोड करा" title="इमेज ९:१६"><i class="fa-regular fa-image"></i></button>',
                content
            )

            # 4. Bhavarth toggle button - "भावार्थ पहा" span madhun kadhne
            content = re.sub(
                r'<button\s+class="toggle-view-btn"\s+id="toggle-btn-(\d+)"\s+onclick="toggleAbhangView\((\d+)\)">\s*<i\s+class="fa-solid fa-eye"></i><span>भावार्थ पहा</span>\s*</button>',
                r'<button class="toggle-view-btn btn-meaning" id="toggle-btn-\1" onclick="toggleAbhangView(\2)" aria-label="भावार्थ पहा" title="भावार्थ पहा"><i class="fa-solid fa-eye"></i><span></span></button>',
                content
            )

            # Jar badal zala asel tarach file rewrite kara
            if content != original_content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                updated_files_count += 1
                print(f"[Updated] -> {file}")

    print("\n" + "="*45)
    print(f"Total HTML files checked: {total_files_checked}")
    print(f"Yashasvi update zalelya files: {updated_files_count}")
    print("="*45)

if __name__ == "__main__":
    print("Abhang folder madhil sarva files clean karne suru aahe...\n")
    clean_abhang_buttons(TARGET_DIR)