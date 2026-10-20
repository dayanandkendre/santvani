import os
import re

file_path = "kabir-doha.html"

if not os.path.exists(file_path):
    print(f"एरर: '{file_path}' फाईल सापडली नाही.")
    exit()

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

orig_content = content

# १. कॉपी बटण अपडेट करणे
content = re.sub(
    r'<button\s+class="action-btn"\s+onclick="copyAbhangText\((\d+)\)">\s*<i\s+class="fa-regular fa-copy"></i>\s*कॉपी\s*</button>',
    r'<button class="action-btn btn-copy" onclick="copyAbhangText(\1)" aria-label="कॉपी करा" title="कॉपी करा"><i class="fa-regular fa-copy"></i></button>',
    content
)

# २. शेअर बटण अपडेट करणे
content = re.sub(
    r'<button\s+class="action-btn"\s+onclick="shareAbhang\((\d+)\)">\s*<i\s+class="fa-solid fa-share-nodes"></i>\s*शेअर\s*</button>',
    r'<button class="action-btn btn-share" onclick="shareAbhang(\1)" aria-label="शेअर करा" title="शेअर करा"><i class="fa-solid fa-share-nodes"></i></button>',
    content
)

# ३. इमेज ९:१६ बटण अपडेट करणे
content = re.sub(
    r'<button\s+class="action-btn"\s+onclick="saveAbhangAsImage\((\d+)\)">\s*<i\s+class="fa-regular fa-image"></i>\s*इमेज\s*९:१६\s*</button>',
    r'<button class="action-btn btn-img" onclick="saveAbhangAsImage(\1)" aria-label="इमेज डाऊनलोड करा" title="इमेज ९:१६"><i class="fa-regular fa-image"></i></button>',
    content
)

# ४. भावार्थ पहा बटण अपडेट करणे
content = re.sub(
    r'<button\s+class="toggle-view-btn"\s+id="toggle-btn-(\d+)"\s+onclick="toggleAbhangView\((\d+)\)">\s*<i\s+class="fa-solid fa-eye"></i><span>भावार्थ पहा</span>\s*</button>',
    r'<button class="toggle-view-btn btn-meaning" id="toggle-btn-\1" onclick="toggleAbhangView(\2)" aria-label="भावार्थ पहा" title="भावार्थ पहा"><i class="fa-solid fa-eye"></i><span></span></button>',
    content
)

if content != orig_content:
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[यशस्वी] {file_path} मधील सर्व बटणे क्लीन झाली आहेत!")
else:
    print("[माहिती] बटणांमध्ये बदल सापडला नाही, आधीच अपडेट झाले आहे का ते तपासा.")