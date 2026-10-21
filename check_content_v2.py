#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Santvani HTML Content Checker — safer duplicate and text-quality report.

Run from the website root:
    python check_content_v2.py
Optional:
    python check_content_v2.py --root . --min-words 150 --block-min-words 5 --boiler 15

Important:
- This script flags candidates only. It NEVER edits HTML or devotional text.
- Long Devanagari/Sanskrit words are NOT errors by themselves.
- Common header/footer/navigation text is excluded from extracted content.
- Duplicate findings are candidates for manual review, not proof of an SEO/content issue.
"""

import argparse
import os
import re
import sys
import unicodedata
from collections import defaultdict
from html.parser import HTMLParser

SKIP_DIRS = {".git", "node_modules", ".vscode", "__pycache__", "venv", ".venv"}
SKIP_TAGS = {
    "script", "style", "noscript", "nav", "footer", "header", "form",
    "button", "select", "svg", "iframe", "head", "title"
}
BLOCK_TAGS = {
    "p", "div", "li", "ul", "ol", "br", "h1", "h2", "h3", "h4", "h5", "h6",
    "section", "article", "tr", "td", "th", "blockquote", "pre", "table",
    "main", "aside", "hr", "dd", "dt"
}
VOID_TAGS = {"br", "hr", "img", "input", "meta", "link", "area", "base", "embed",
             "source", "track", "wbr"}
META_RE = re.compile(r"<meta\b[^>]*>", re.I | re.S)
TOKEN_RE = re.compile(r"[^\s।॥|,.;:!?\"“”‘’()\[\]{}<>/\\\-–—_=+*&%$#@~`^]+")
DEV = re.compile(r"[ऀ-ॿ]")
LAT = re.compile(r"[A-Za-z]")
BAD_START = re.compile(r"^[ऀ-ःऺ-ॏ॑-ॗॢॣ]")
DOUBLE_SIGN = re.compile(r"([ा-्ँ-ः])\1")
ZERO_WIDTH = dict.fromkeys(map(ord, "\u200b\u200c\u200d\ufeff\u00a0"), " ")


class TextExtractor(HTMLParser):
    """Extract readable text while correctly handling nested excluded tags."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip_stack = []
        self.buf = []
        self.blocks = []

    def flush(self):
        text = " ".join("".join(self.buf).split())
        if text:
            self.blocks.append(text)
        self.buf = []

    def handle_starttag(self, tag, attrs):
        # While inside an excluded element, track nesting but collect no text.
        if self.skip_stack:
            if tag in SKIP_TAGS and tag not in VOID_TAGS:
                self.skip_stack.append(tag)
            return
        if tag in SKIP_TAGS and tag not in VOID_TAGS:
            self.flush()
            self.skip_stack.append(tag)
            return
        if tag in BLOCK_TAGS:
            self.flush()

    def handle_startendtag(self, tag, attrs):
        if not self.skip_stack and tag in BLOCK_TAGS:
            self.flush()

    def handle_endtag(self, tag):
        if self.skip_stack:
            # Close the matching excluded element and anything malformed inside it.
            if tag in self.skip_stack:
                idx = len(self.skip_stack) - 1 - self.skip_stack[::-1].index(tag)
                self.skip_stack = self.skip_stack[:idx]
                if not self.skip_stack:
                    self.flush()
            return
        if tag in BLOCK_TAGS:
            self.flush()

    def handle_data(self, data):
        if not self.skip_stack:
            self.buf.append(data)

    def close(self):
        super().close()
        self.flush()


def read_file(path):
    with open(path, "rb") as f:
        raw = f.read()
    for enc in ("utf-8-sig", "utf-8"):
        try:
            return raw.decode(enc)
        except UnicodeDecodeError:
            pass
    return raw.decode("utf-8", errors="replace")


def is_noindex(path):
    raw = read_file(path)
    head_end = raw.lower().find("</head>")
    head = raw if head_end == -1 else raw[:head_end]
    for tag in META_RE.findall(head):
        t = tag.lower()
        if re.search(r"name\s*=\s*[\"']?(robots|googlebot)[\"']?", t) and "noindex" in t:
            return True
    return False


def extract_blocks(path):
    parser = TextExtractor()
    try:
        parser.feed(read_file(path))
        parser.close()
    except Exception as exc:
        print(f"[!] Parse warning: {path}: {exc}", file=sys.stderr)
    return parser.blocks


def normalize(text):
    """Conservative normalization: Unicode NFC, whitespace and case only.
    Punctuation and digits are preserved to reduce false duplicate matches.
    """
    text = unicodedata.normalize("NFC", text).translate(ZERO_WIDTH).casefold()
    return " ".join(text.split())


def tokens(text):
    return re.findall(r"\S+", text)


def word_count(blocks):
    return sum(len(tokens(b)) for b in blocks)


def find_mixed(blocks):
    issues = []
    seen = set()
    for block in blocks:
        for tok in TOKEN_RE.findall(block):
            tok = tok.strip("'")
            if not tok or tok in seen:
                continue
            reason = None
            has_dev, has_lat = bool(DEV.search(tok)), bool(LAT.search(tok))
            if has_dev and has_lat:
                reason = "Devanagari + Latin characters in one token"
            elif "\ufffd" in tok:
                reason = "Replacement character (�)"
            elif has_dev and BAD_START.match(tok):
                reason = "Combining mark/matra at word start"
            elif has_dev and DOUBLE_SIGN.search(tok):
                reason = "Repeated matra/virama candidate"
            if reason:
                seen.add(tok)
                issues.append((tok, reason, block[:120]))
    return issues


def main():
    ap = argparse.ArgumentParser(description="Safer HTML content checker; does not modify files.")
    ap.add_argument("--root", default=".", help="Website root folder")
    ap.add_argument("--min-words", type=int, default=150)
    ap.add_argument("--block-min-words", type=int, default=5)
    ap.add_argument("--boiler", type=int, default=15,
                    help="Text found on this many or more pages is listed as common text")
    ap.add_argument("--out", default="duplicate_report_v2.txt")
    ap.add_argument("--ignore-noindex-all", action="store_true",
                    help="Exclude noindex pages from all checks, not just low-text check")
    args = ap.parse_args()

    root = os.path.abspath(args.root)
    files = []
    for dp, dn, fn in os.walk(root):
        dn[:] = [d for d in dn if d not in SKIP_DIRS]
        for name in fn:
            if name.lower().endswith((".html", ".htm")):
                files.append(os.path.join(dp, name))
    files.sort()
    if not files:
        print("No HTML files found. Run this script from the website root.", file=sys.stderr)
        sys.exit(1)

    print(f"Checking {len(files)} HTML files...")
    page_blocks, page_words, noindex = {}, {}, set()
    for path in files:
        rel = os.path.relpath(path, root).replace("\\", "/")
        if is_noindex(path):
            noindex.add(rel)
            if args.ignore_noindex_all:
                continue
        blocks = extract_blocks(path)
        page_blocks[rel] = blocks
        page_words[rel] = word_count(blocks)

    low = sorted((w, p) for p, w in page_words.items()
                 if w < args.min_words and p not in noindex)

    # normalized block -> page -> occurrences; preserve repeated occurrences
    index = defaultdict(lambda: defaultdict(list))
    samples = {}
    for rel, blocks in page_blocks.items():
        for block_no, block in enumerate(blocks, start=1):
            norm = normalize(block)
            if len(tokens(norm)) < args.block_min_words:
                continue
            index[norm][rel].append((block_no, block))
            samples.setdefault(norm, block)

    boiler, cross, same_file = [], [], []
    for norm, pages in index.items():
        if len(pages) >= args.boiler:
            boiler.append((norm, pages))
        elif len(pages) >= 2:
            cross.append((norm, pages))
        for page, occurrences in pages.items():
            if len(occurrences) > 1:
                same_file.append((page, len(occurrences), norm, occurrences))

    cross.sort(key=lambda item: (-len(item[1]), item[0]))
    boiler.sort(key=lambda item: (-len(item[1]), item[0]))
    same_file.sort(key=lambda item: (item[0], -item[1], item[2]))

    # Near-duplicate score based on unique meaningful blocks per page.
    pair_common = defaultdict(int)
    block_total = {
        page: len({normalize(b) for b in blocks
                   if len(tokens(normalize(b))) >= args.block_min_words})
        for page, blocks in page_blocks.items()
    }
    for norm, pages in index.items():
        if 2 <= len(pages) < args.boiler:
            page_list = sorted(pages)
            for i in range(len(page_list)):
                for j in range(i + 1, len(page_list)):
                    pair_common[(page_list[i], page_list[j])] += 1
    near = []
    for (a, b), common in pair_common.items():
        denominator = min(block_total.get(a, 0), block_total.get(b, 0))
        if denominator >= 3 and common / denominator >= 0.6:
            near.append((common / denominator, common, a, b))
    near.sort(reverse=True)

    mixed = {page: find_mixed(blocks) for page, blocks in page_blocks.items()}
    mixed = {page: items for page, items in mixed.items() if items}

    lines = [
        "=" * 76,
        "SANTVANI — CONTENT CHECK REPORT (V2)",
        "=" * 76,
        f"Total HTML files scanned : {len(files)}",
        f"Noindex pages            : {len(noindex)}",
        f"Low-text pages            : {len(low)} (< {args.min_words} words; noindex excluded)",
        f"Cross-page duplicate blocks: {len(cross)} (common text excluded at {args.boiler}+ pages)",
        f"Same-page repeated blocks : {len(same_file)}",
        f"Near-duplicate page pairs : {len(near)}",
        f"Mixed/character candidates: {sum(len(v) for v in mixed.values())} across {len(mixed)} pages",
        "",
        "IMPORTANT: Findings are review candidates, not automatic proof of an error.",
        "Do not auto-correct canonical ovi, abhang, Sanskrit, or other source text.",
        "",
        "-" * 76,
        f"1) LOW TEXT PAGES (< {args.min_words} words; noindex excluded)",
        "-" * 76,
    ]
    lines.extend([f"  {w:5d} words  {p}" for w, p in low] or ["  None found."])

    lines += ["", "-" * 76, "2) DUPLICATE BLOCKS ACROSS PAGES", "-" * 76]
    if cross:
        for norm, pages in cross:
            lines.append(f'\n  [{len(pages)} pages] "{samples[norm][:120]}"')
            for page, occurrences in sorted(pages.items()):
                lines.append(f"    - {page} ({len(occurrences)} occurrence(s))")
    else:
        lines.append("  None found.")

    lines += ["", "-" * 76, "3) REPEATED BLOCKS WITHIN THE SAME PAGE", "-" * 76]
    if same_file:
        for page, count, norm, occurrences in same_file:
            lines.append(f'  {page} -> {count} occurrences: "{samples[norm][:120]}"')
            lines.append("    Block numbers: " + ", ".join(str(n) for n, _ in occurrences))
    else:
        lines.append("  None found.")

    lines += ["", "-" * 76, "4) NEAR-DUPLICATE PAGE PAIRS (heuristic)", "-" * 76]
    if near:
        for ratio, common, a, b in near[:200]:
            lines.append(f"  {ratio*100:5.1f}% ({common} common blocks) {a} <-> {b}")
    else:
        lines.append("  None found.")

    lines += ["", "-" * 76, "5) MIXED / CHARACTER ANOMALY CANDIDATES", "-" * 76]
    if mixed:
        for page in sorted(mixed):
            lines.append(f"\n  {page} ({len(mixed[page])} candidates)")
            for token, reason, context in mixed[page]:
                lines.append(f"    '{token}' <- {reason}")
                lines.append(f"      Context: ...{context}...")
    else:
        lines.append("  None found.")

    lines += ["", "-" * 76, f"6) COMMON TEXT ({args.boiler}+ pages; likely boilerplate)", "-" * 76]
    if boiler:
        for norm, pages in boiler[:100]:
            lines.append(f'  [{len(pages)} pages] "{samples[norm][:120]}"')
    else:
        lines.append("  None found.")

    out_path = os.path.join(root, args.out)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print("\n".join(lines[:10]))
    print(f"\nFull report: {out_path}")


if __name__ == "__main__":
    main()
