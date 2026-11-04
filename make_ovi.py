import re, csv, html, sys, collections
SRC = 'pages/granth/dnyaneshwari/adhyay-01.html'
LINK = '/pages/granth/dnyaneshwari/adhyay-01.html'
t = open(SRC, encoding='utf-8').read()

# प्रत्येक "ओवी कार्ड" वेगळे करा (श्लोक कार्ड वगळले जातात)
cards = re.split(r'(?=<div id="card-ovi-)', t)[1:]
rows, nums, problems = [], [], []
for c in cards:
    badge = re.search(r'>(ओवी\s*[०-९0-9]+)<', c)
    verse = re.search(r"Rozha One[^>]*>\s*(.*?)\s*</p>", c, re.S)
    mean  = re.search(r'सार्थ भावार्थ:</strong>\s*<p[^>]*>(.*?)</p>', c, re.S)
    if not (badge and verse and mean): continue
    clean = lambda s: html.unescape(re.sub(r'\s+', ' ', re.sub(r'<br\s*/?>', ' ', s))).strip()
    v, m, b = clean(verse.group(1)), clean(mean.group(1)), badge.group(1)
    num = re.sub(r'\D', '', b.translate(str.maketrans('०१२३४५६७८९','0123456789')))
    nums.append(num)
    if len(m) < 25 or 'उपलब्ध नाही' in m:
        problems.append(f'{b}: अर्थ नाही/खूप छोटा'); continue
    rows.append([v, m, f'ज्ञानेश्वरी, अध्याय १, {b}', LINK, 'अध्याय १ वाचा'])

for n, k in collections.Counter(nums).items():
    if k > 1: problems.append(f'ओवी {n}: {k} वेळा आहे')

with open('data/ovi.csv', 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f, quoting=csv.QUOTE_ALL)
    w.writerow(['verse','meaning','source','link','link_text'])
    w.writerows(rows)

print(len(rows), 'ओव्या data/ovi.csv मध्ये लिहिल्या')
print('\n'.join(problems) or 'कोणतीही अडचण नाही')