import os
import re

file_path = "kabir-doha.html"

if not os.path.exists(file_path):
    print(f"एरर: '{file_path}' फाईल सापडली नाही.")
    exit()

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

orig_content = content

# १. हेड टॅगमध्ये CSS pseudo-elements ॲड करणे (स्क्रीनवर आधीसारखेच टेक्स्ट दिसण्यासाठी)
css_block = """
    <!-- UI Noise Zero CSS for Kabir Doha -->
    <style>
        .btn-k-copy::after { content: ' कॉपी'; }
        .btn-k-wa::after { content: ' व्हॉट्सॲप'; }
        .btn-k-img::after { content: ' इमेज'; }
    </style>
</head>"""

if "btn-k-copy" not in content and "</head>" in content:
    content = content.replace("</head>", css_block, 1)

# २. कॉपी बटण (कॉपी शब्द काढून क्लास लावणे)
content, c1 = re.subn(
    r'(<button\s+onclick="copyQuote\([^)]+\)"[^>]*?)(style="[^"]*?")>(\s*<i\s+class="fa-regular fa-copy"></i>)\s*कॉपी\s*</button>',
    r'\1class="btn-k-copy" \2 aria-label="कॉपी करा" title="कॉपी करा">\3</button>',
    content
)

# ३. व्हॉट्सॲप बटण
content, c2 = re.subn(
    r'(<button\s+onclick="shareWhatsApp\([^)]+\)"[^>]*?)(style="[^"]*?")>(\s*<i\s+class="fa-brands fa-whatsapp"></i>)\s*व्हॉट्सॲप\s*</button>',
    r'\1class="btn-k-wa" \2 aria-label="व्हॉट्सॲपवर शेअर करा" title="व्हॉट्सॲप">\3</button>',
    content
)

# ४. इमेज बटण
content, c3 = re.subn(
    r'(<button\s+onclick="downloadSquare\([^)]+\)"[^>]*?)(style="[^"]*?")>(\s*<i\s+class="fa-regular fa-image"></i>)\s*इमेज\s*</button>',
    r'\1class="btn-k-img" \2 aria-label="इमेज डाऊनलोड करा" title="इमेज">\3</button>',
    content
)

print(f"कबीर दोहा मधील बदल:")
print(f" -> कॉपी बटणे क्लीन: {c1}")
print(f" -> व्हॉट्सॲप बटणे क्लीन: {c2}")
print(f" -> इमेज बटणे क्लीन: {c3}")
print(f" -> एकूण काढलेला Noise: {c1 + c2 + c3}")

if content != orig_content:
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("\n[यशस्वी] kabir-doha.html फाईल अचूक अपडेट झाली आहे!")
else:
    print("\n[माहिती] कोणताही बदल झाला नाही, पॅटर्न आधीच क्लीन झाला आहे का ते तपासा.")