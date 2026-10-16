#!/usr/bin/env python3
"""
Santvani Site Auditor (Pro version)
-----------------------------------
Script tumchya site chya root folder madhe thevun run kara:
    python site_auditor.py
kinva dusrya folder sathi:
    python site_auditor.py "F:\\Test\\santvani"

Checks:
  ERRORS
   - Broken links / images / CSS / JS (href, src, srcset, action, poster)
   - Broken #anchor (target page madhe to id nahi)
   - Filename case mismatch (Windows var chalto, Linux hosting var tutato)
   - File UTF-8 nahi / BOM / replacement character (U+FFFD)
   - Garbled text (mojibake, &amp;amp;, ???? ityadi)
   - Unexpected foreign script characters (Cyrillic, Arabic, CJK, itar Indic)
   - Invisible/control characters (U+200B, U+FEFF, U+00AD ityadi)
   - Invalid JSON-LD (schema) block
  WARNINGS
   - Devanagari + English akshare ekach shabdat mix (jasa "रामRam")
   - <html lang>, <title>, meta description, viewport, charset, <h1> missing
   - <img> var alt missing
   - Orphan pages (konihi link karat nahi)
NOTE: Duplicate id check jaanun kadhla aahe (ovi cha number 100 nantar parat 1 pasun suru,
      download/copy buttons sathi id repeat honar). Parat pahije asel tar CHECK_DUPLICATE_IDS = True kara.
Output: audit_report.txt (root folder madhe) + console summary
"""
import os
import re
import sys
from collections import defaultdict
from html.parser import HTMLParser
from urllib.parse import unquote

# ---------------------------------------------------------------- settings
ROOT_DIR = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
REPORT_FILE = os.path.join(ROOT_DIR, "audit_report.txt")

CHECK_DUPLICATE_IDS = False   # True kelyas duplicate id errors disatil

SKIP_DIRS = {".git", ".github", "node_modules", "__pycache__", ".vscode", ".idea"}
HTML_EXT = (".html", ".htm")
INDEX_NAMES = ("index.html", "index.htm")

SKIP_SCHEMES = ("http://", "https://", "//", "mailto:", "tel:", "sms:", "javascript:",
                "data:", "whatsapp:", "blob:", "ftp:", "geo:", "intent:")

# Kharaab encoding patterns (mojibake). NOTE: rikama alternative nahi (aadhi chuki hoti).
GARBLED_PATTERNS = [
    (re.compile(r"Ã[\u0080-\u00BF¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿]"), "UTF-8 mojibake (Ã..)"),
    (re.compile(r"Â[\u00A0-\u00BF]"), "UTF-8 mojibake (Â..)"),
    (re.compile(r"â€[™œ\u009d\u201c\u201d\u2122\u02dc\u00a6\u0153\"“”˜¦]?"), "Smart-quote mojibake (â€..)"),
    (re.compile(r"à¤|à¥|à¦|à¨"), "Devanagari mojibake (à¤/à¥)"),
    (re.compile(r"ï¿½|\ufffd"), "Replacement character (�)"),
    (re.compile(r"&(?:amp|lt|gt|quot|nbsp|#\d+|#x[0-9a-fA-F]+);"), "Double-escaped HTML entity (&amp;amp; ityadi)"),
    (re.compile(r"\?{3,}"), "'???' (characters haravle asavet)"),
]

# Devanagari (0900-097F), English, digits, punctuation sodun itar scripts
FOREIGN_CHARS = re.compile(
    r"[\u0400-\u04FF"      # Cyrillic
    r"\u0590-\u05FF"       # Hebrew
    r"\u0600-\u06FF"       # Arabic
    r"\u0980-\u0DFF"       # Bengali..Sinhala (Devanagari nahi)
    r"\u0E00-\u0E7F"       # Thai
    r"\u1100-\u11FF"       # Hangul Jamo
    r"\u3040-\u30FF"       # Hiragana/Katakana
    r"\u3400-\u4DBF\u4E00-\u9FFF"  # CJK
    r"\uAC00-\uD7AF]"      # Hangul
)

# Invisible / control chars. NOTE: ZWJ (U+200D) / ZWNJ (U+200C) Devanagari madhe vaparle jatat, mhanun vagle.
INVISIBLE_CHARS = re.compile(r"[\u200B\u2060\uFEFF\u00AD\u2028\u2029\u202A-\u202E\u0000-\u0008\u000B\u000C\u000E-\u001F]")
# Devanagari ani Latin akshare ekach shabdat
MIXED_WORD = re.compile(r"[\u0900-\u097F][A-Za-z]|[A-Za-z][\u0900-\u097F]")

URL_ATTRS = {
    "a": ["href"], "link": ["href"], "script": ["src"], "img": ["src", "srcset"],
    "source": ["src", "srcset"], "iframe": ["src"], "audio": ["src"], "video": ["src", "poster"],
    "form": ["action"], "embed": ["src"], "track": ["src"], "area": ["href"],
}


# ---------------------------------------------------------------- parser
class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = []            # (tag, attr, value, line)
        self.ids = defaultdict(list)
        self.text_chunks = []     # (text, line)
        self.title = None
        self.meta_desc = False
        self.viewport = False
        self.charset = False
        self.lang = None
        self.h1_count = 0
        self.img_no_alt = []      # (src, line)
        self._skip = 0
        self._in_title = False
        self.jsonld = []          # (text, line)
        self._ld = None
        self.canonical = None

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        line = self.getpos()[0]

        if tag in ("script", "style"):
            self._skip += 1
        if tag == "script" and a.get("type", "").lower() == "application/ld+json":
            self._ld = [line, ""]
        if tag == "link" and a.get("rel", "").lower() == "canonical":
            self.canonical = a.get("href", "")
        if tag == "html":
            self.lang = a.get("lang")
        if tag == "title":
            self._in_title = True
            self.title = ""
        if tag == "h1":
            self.h1_count += 1
        if tag == "meta":
            name = a.get("name", "").lower()
            if name == "description" and a.get("content", "").strip():
                self.meta_desc = True
            if name == "viewport":
                self.viewport = True
            if "charset" in a or a.get("http-equiv", "").lower() == "content-type":
                self.charset = True
        if tag == "img" and "alt" not in a:
            self.img_no_alt.append((a.get("src", "?"), line))
        if "id" in a and a["id"].strip():
            self.ids[a["id"].strip()].append(line)
        if tag == "a" and a.get("name"):
            self.ids[a["name"].strip()].append(line)

        for attr in URL_ATTRS.get(tag, []):
            if attr in a:
                val = a[attr]
                if attr == "srcset":
                    for part in val.split(","):
                        u = part.strip().split(" ")[0]
                        if u:
                            self.refs.append((tag, attr, u, line))
                else:
                    self.refs.append((tag, attr, val, line))

    def handle_endtag(self, tag):
        if tag == "script" and self._ld is not None:
            self.jsonld.append((self._ld[1], self._ld[0]))
            self._ld = None
        if tag in ("script", "style") and self._skip:
            self._skip -= 1
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._ld is not None:
            self._ld[1] += data
        if self._in_title and self.title is not None:
            self.title += data
        if self._skip == 0 and data.strip():
            self.text_chunks.append((data, self.getpos()[0]))


# ---------------------------------------------------------------- helpers
def walk_files(root):
    html, allfiles = [], []
    for r, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            p = os.path.join(r, f)
            if os.path.abspath(p) == os.path.abspath(REPORT_FILE):
                continue
            allfiles.append(p)
            if f.lower().endswith(HTML_EXT):
                html.append(p)
    return sorted(html), allfiles


def exact_case_exists(path):
    """True jar path exist karto ani cases barobar jultat. (None, matched_real) - case mismatch."""
    path = os.path.abspath(path)
    if not os.path.exists(path):
        return False, None
    drive, rest = os.path.splitdrive(path)
    parts = [p for p in re.split(r"[\\/]", rest) if p]
    cur = drive + os.sep
    for part in parts:
        try:
            entries = os.listdir(cur)
        except OSError:
            return True, None
        if part not in entries:
            real = next((e for e in entries if e.lower() == part.lower()), None)
            return True, os.path.join(cur, real) if real else None
        cur = os.path.join(cur, part)
    return True, None


def snippet(text, pos, width=25):
    s = max(0, pos - width)
    return text[s:pos + width].replace("\n", " ").strip()


def resolve_target(src_file, ref):
    """Return (target_path | None, fragment). target None mhanje same-file anchor."""
    ref = ref.strip()
    base = ref.split("#", 1)[0].split("?", 1)[0]
    frag = ref.split("#", 1)[1] if "#" in ref else ""
    base = unquote(base)
    if not base:
        return None, frag
    if base.startswith("/"):
        target = os.path.join(ROOT_DIR, base.lstrip("/"))
    else:
        target = os.path.join(os.path.dirname(src_file), base)
    target = os.path.normpath(target)
    if os.path.isdir(target):
        for idx in INDEX_NAMES:
            cand = os.path.join(target, idx)
            if os.path.isfile(cand):
                return cand, frag
    return target, frag


# ---------------------------------------------------------------- audit
def audit_file(path, page_cache):
    res = {"errors": [], "warnings": [], "links_out": set()}

    raw = open(path, "rb").read()
    if raw.startswith(b"\xef\xbb\xbf"):
        res["warnings"].append("File madhe UTF-8 BOM aahe (kahi veli suruvatila kharaab char disto)")
    try:
        content = raw.decode("utf-8")
    except UnicodeDecodeError as e:
        res["errors"].append(f"File valid UTF-8 nahi (byte {e.start}) - encoding kharaab")
        content = raw.decode("utf-8", errors="replace")

    parser = PageParser()
    try:
        parser.feed(content)
        parser.close()
    except Exception as e:  # noqa
        res["errors"].append(f"HTML parse error: {e}")

    page_cache[path] = set(parser.ids.keys())

    # ---- links / assets
    for tag, attr, val, line in parser.refs:
        v = val.strip()
        if not v:
            if tag == "a":
                res["warnings"].append(f"L{line}: <a href=\"\"> rikama aahe")
            continue
        if v.lower().startswith(SKIP_SCHEMES):
            continue
        if v == "#" or v.startswith("{{") or v.startswith("<%") or "${" in v:
            continue

        target, frag = resolve_target(path, v)
        label = f"L{line}: <{tag} {attr}=\"{v}\">"

        if target is None:  # same-page anchor
            if frag and frag not in parser.ids and frag.lower() != "top":
                res["errors"].append(f"{label} -> anchor '#{frag}' ya page madhe nahi")
            continue

        exists, real = exact_case_exists(target)
        if not exists:
            res["errors"].append(f"{label} -> file sapadli nahi")
            continue
        if real:
            res["errors"].append(f"{label} -> CASE mismatch (real: {os.path.relpath(real, ROOT_DIR)})")
        if tag == "a" and os.path.isfile(target):
            res["links_out"].add(os.path.abspath(target))
        # anchor in other page (pass 2 madhe check hoil)
        if frag and target.lower().endswith(HTML_EXT):
            res.setdefault("anchors", []).append((line, v, os.path.abspath(target), frag))

    # ---- duplicate ids
    for i, lines in parser.ids.items():
        if CHECK_DUPLICATE_IDS and len(lines) > 1:
            res["errors"].append(f"Duplicate id=\"{i}\" (lines {', '.join(map(str, lines))})")

    # ---- garbled / foreign chars
    full_text = "\n".join(t for t, _ in parser.text_chunks)
    for rx, name in GARBLED_PATTERNS:
        hits = list(rx.finditer(full_text))
        if hits:
            ex = "; ".join(f"“{snippet(full_text, m.start())}”" for m in hits[:3])
            res["errors"].append(f"Garbled text - {name} x{len(hits)} -> {ex}")
    foreign = FOREIGN_CHARS.findall(full_text)
    if foreign:
        uniq = sorted(set(foreign))
        first = FOREIGN_CHARS.search(full_text)
        res["errors"].append(
            f"Unexpected foreign-script chars x{len(foreign)}: {' '.join(uniq[:15])}"
            f" -> “{snippet(full_text, first.start())}”")

    # ---- invisible chars
    inv = list(INVISIBLE_CHARS.finditer(full_text))
    if inv:
        codes = sorted({f"U+{ord(m.group()):04X}" for m in inv})
        res["errors"].append(f"Invisible/control chars x{len(inv)}: {' '.join(codes)} -> “{snippet(full_text, inv[0].start())}”")

    # ---- mixed Devanagari+Latin in one word (kahi legit asu shaktat, mhanun warning)
    mixed = list(MIXED_WORD.finditer(full_text))
    if mixed:
        ex = "; ".join(f"“{snippet(full_text, m.start(), 12)}”" for m in mixed[:3])
        res["warnings"].append(f"Marathi+English akshare ekach shabdat x{len(mixed)} -> {ex}")

    # ---- JSON-LD validity
    import json
    for txt, ln in parser.jsonld:
        try:
            json.loads(txt)
        except ValueError as e:
            res["errors"].append(f"L{ln}: JSON-LD invalid - {e}")

    # ---- SEO / basic structure
    if not parser.lang:
        res["warnings"].append("<html lang=\"mr\"> missing")
    if not parser.title or not parser.title.strip():
        res["warnings"].append("<title> missing kinva rikama")
    if not parser.canonical:
        res["warnings"].append("canonical link missing")
    if not parser.meta_desc:
        res["warnings"].append("meta description missing")
    if not parser.viewport:
        res["warnings"].append("meta viewport missing (mobile var problem)")
    if not parser.charset:
        res["warnings"].append("meta charset missing")
    if parser.h1_count == 0:
        res["warnings"].append("<h1> missing")
    elif parser.h1_count > 1:
        res["warnings"].append(f"<h1> {parser.h1_count} vela aahe")
    for src, line in parser.img_no_alt:
        res["warnings"].append(f"L{line}: <img src=\"{src}\"> var alt nahi")

    return res


def main():
    print(f"🔍 Scan suru: {ROOT_DIR}")
    html_files, all_files = walk_files(ROOT_DIR)
    print(f"📄 {len(html_files)} HTML files / {len(all_files)} total files sapadlya\n")

    page_cache, results = {}, {}
    for p in html_files:
        results[p] = audit_file(p, page_cache)

    # Pass 2: cross-page anchors
    for p, r in results.items():
        for line, v, target, frag in r.get("anchors", []):
            ids = page_cache.get(target)
            if ids is not None and frag not in ids and frag.lower() != "top":
                r["errors"].append(f"L{line}: link \"{v}\" -> target page madhe id '{frag}' nahi")

    # Orphan pages
    linked = set()
    for r in results.values():
        linked |= r["links_out"]
    for p, r in results.items():
        name = os.path.basename(p).lower()
        if name in INDEX_NAMES and os.path.dirname(p) == ROOT_DIR:
            continue
        if os.path.abspath(p) not in linked:
            r["warnings"].append("Orphan page - konatyahi page varun link nahi")

    # ---- report
    lines = ["=" * 60, "            SANTVANI SITE AUDIT REPORT", "=" * 60,
             f"Root : {ROOT_DIR}", f"HTML : {len(html_files)} files", ""]
    tot_err = tot_warn = bad_files = 0

    for p in html_files:
        r = results[p]
        if not r["errors"] and not r["warnings"]:
            continue
        rel = os.path.relpath(p, ROOT_DIR)
        lines.append(f"FILE: {rel}")
        if r["errors"]:
            bad_files += 1
            lines.append(f"  ❌ ERRORS ({len(r['errors'])})")
            lines += [f"     - {e}" for e in r["errors"]]
        if r["warnings"]:
            lines.append(f"  ⚠️  WARNINGS ({len(r['warnings'])})")
            lines += [f"     - {w}" for w in r["warnings"]]
        lines.append("-" * 60)
        tot_err += len(r["errors"])
        tot_warn += len(r["warnings"])
        if r["errors"]:
            print(f"❌ {rel}  ({len(r['errors'])} errors)")

    lines += ["", "SUMMARY",
              f"  Files scanned        : {len(html_files)}",
              f"  Files with errors    : {bad_files}",
              f"  Total errors         : {tot_err}",
              f"  Total warnings       : {tot_warn}"]

    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"\n✅ Audit complete! Errors: {tot_err} | Warnings: {tot_warn}")
    print(f"👉 Report: {REPORT_FILE}")
    sys.exit(1 if tot_err else 0)


if __name__ == "__main__":
    main()
