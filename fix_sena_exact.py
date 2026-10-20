import os
import re

file_path = "pages/abhang/sant-sena-maharaj-abhang.html"

if not os.path.exists(file_path):
    print(f"एरर: '{file_path}' सापडली नाही.")
    exit()

with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# १. अभंग २० च्या भावार्थातील टायपो बदलणे
content = content.replace("जीवां व्हिडींवर", "जडजीवांवर")

# २. अभंग ४० चा चुकीचा क्रम आणि ओळी अचूक करणे
# मूळ चुकीचा पॅटर्न शोधणे
old_pattern = r'जे म्हणविती न्हावियाचे वंशीं[^\n<]*॥१॥\s*<br>\s*येर अवघे बटकीचे[^\n<]*॥२॥\s*<br>\s*शास्त्रे नेम धंदा दोन प्रहर नेमस्त[^\n<]*॥४॥\s*<br>\s*सत्य पाळारे स्वधर्मासी[^\n<]*॥३॥\s*<br>\s*जन्मलों ज्या वंशांत[^\n<]*॥५॥'

new_abhang_40_text = (
    "जे म्हणविती न्हावियाचे वंशीं । तेणें पाळावें स्वधर्मासी ॥१॥<br>\n"
    "                        येर अवघे बटकीचे । नव्हे न्हावियाचे वंशीचे ॥२॥<br>\n"
    "                        सत्य पाळारे स्वधर्मासी । सांडोनि अनाचार केला ॥३॥<br>\n"
    "                        शास्त्रे नेम धंदा दोन प्रहर नेमस्त ॥४॥<br>\n"
    "                        सेना म्हणे नेमियला । जन्मलों ज्या वंशांत आज्ञा ऐसी ॥५॥"
)

content = re.sub(old_pattern, new_abhang_40_text, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("[यशस्वी] संत सेना महाराज पेनावरील टायपो आणि अभंग ४० चा क्रम अचूक दुरुस्त झाला आहे!")