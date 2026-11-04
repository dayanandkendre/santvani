import re, csv, html, sys, collections

SRC = 'pages/granth/dnyaneshwari/adhyay-01.html'
LINK = '/pages/granth/dnyaneshwari/adhyay-01.html'

# १. मूळ HTML फाईल UTF-8 मध्ये सुरक्षितपणे वाचणे
try:
    with open(SRC, 'r', encoding='utf-8') as f:
        t = f.read()
except UnicodeDecodeError:
    with open(SRC, 'r', encoding='utf-8-sig') as f:
        t = f.read()

# २. प्रत्येक "ओवी कार्ड" वेगळे करा (श्लोक कार्ड वगळले जातात)
cards = re.split(r'(?=<div id="card-ovi-)', t)[1:]
rows, nums, problems = [], [], []

for c in cards:
    badge = re.search(r'>(ओवी\s*[०-९0-9]+)<', c)
    verse = re.search(r"Rozha One[^>]*>\s*(.*?)\s*</p>", c, re.S)
    mean  = re.search(r'सार्थ भावार्थ:</strong>\s*<p[^>]*>(.*?)</p>', c, re.S)
    
    if not (badge and verse and mean): 
        continue
    
    # <br> काढून ओवीच्या चरणांमध्ये ' | ' ठेवणे (dashboard.js साठी आवश्यक)
    def clean_verse(s):
        s = re.sub(r'<br\s*/?>', ' | ', s)
        s = re.sub(r'\s+', ' ', s)
        return html.unescape(s).strip()

    def clean_text(s):
        s = re.sub(r'<br\s*/?>', ' ', s)
        s = re.sub(r'\s+', ' ', s)
        return html.unescape(s).strip()

    v = clean_verse(verse.group(1))
    m = clean_text(mean.group(1))
    b = clean_text(badge.group(1))
    
    num = re.sub(r'\D', '', b.translate(str.maketrans('०१२३४५६७८९','0123456789')))
    nums.append(num)
    
    if len(m) < 15 or 'उपलब्ध नाही' in m:
        problems.append(f'{b}: अर्थ नाही/खूप छोटा')
        continue
        
    rows.append([v, m, f'ज्ञानेश्वरी, अध्याय १, {b}', LINK, 'अध्याय १ वाचा'])

# डुप्लिकेट ओवी क्रमांक तपासणे
for n, k in collections.Counter(nums).items():
    if k > 1: 
        problems.append(f'ओवी {n}: {k} वेळा आहे')

# ३. CSV फाईल delimiter=',' आणि utf-8-sig सह सेव्ह करणे
with open('data/ovi.csv', 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f, delimiter=',', quoting=csv.QUOTE_ALL)
    w.writerow(['verse', 'meaning', 'source', 'link', 'link_text'])
    w.writerows(rows)

print(len(rows), 'ओव्या data/ovi.csv मध्ये लिहिल्या')
print('\n'.join(problems) if problems else 'कोणतीही अडचण नाही')