#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
संतवाणी - Content Checker
Root folder madhe run kara:   python check_content.py
Options:
  --min-words 150        kami text (thin content) cha limit
  --block-min-words 5    duplicate tapasanyasathi kamit kami shabd
  --boiler 15            itkya (kinva jast) files madhe asel tar "common text" samja
  --root .               konta folder tapasaycha

Kay tapasto:
  1. Low text  : jya HTML madhe text kami aahe
  2. Duplicate : same ovi/abhang/paragraph dusrya page madhe kinva ekach page madhe punha
  3. Near-dup  : don page madhe jast bhag same aahe
  4. Mixed word: Marathi + English akshare ek shabdat, tutleli/chukichi akshare, chiktalele shabd
Report: duplicate_report.txt (root folder madhe tayar hoto)
"""
import argparse
import os
import re
import sys
import unicodedata
from collections import defaultdict
from html.parser import HTMLParser

SKIP_DIRS = {".git", "node_modules", ".vscode", "__pycache__", "venv", ".venv"}
SKIP_TAGS = {"script", "style", "noscript", "nav", "footer", "header", "form",
             "button", "select", "svg", "iframe", "head", "title"}
BLOCK_TAGS = {"p", "div", "li", "ul", "ol", "br", "h1", "h2", "h3", "h4", "h5", "h6",
              "section", "article", "tr", "td", "th", "blockquote", "pre", "table",
              "main", "aside", "hr", "dd", "dt", "span"}
# span ha block nahi - kharech neet kela jato (khali check)
BLOCK_TAGS.discard("span")
VOID_TAGS = {"br", "hr", "img", "input", "meta", "link"}


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip_depth = 0
        self.buf = []
        self.blocks = []

    def flush(self):
        text = " ".join("".join(self.buf).split())
        if text:
            self.blocks.append(text)
        self.buf = []

    def handle_starttag(self, tag, attrs):
        if tag in SKIP_TAGS and tag not in VOID_TAGS:
            self.flush()
            self.skip_depth += 1
            return
        if tag in BLOCK_TAGS:
            self.flush()

    def handle_endtag(self, tag):
        if tag in SKIP_TAGS and tag not in VOID_TAGS:
            if self.skip_depth > 0:
                self.skip_depth -= 1
            self.flush()
            return
        if tag in BLOCK_TAGS:
            self.flush()

    def handle_data(self, data):
        if self.skip_depth == 0:
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


def extract_blocks(path):
    parser = TextExtractor()
    try:
        parser.feed(read_file(path))
        parser.close()
    except Exception as e:
        print(f"  [!] parse error: {path}: {e}")
    return parser.blocks


ZERO_WIDTH = dict.fromkeys(map(ord, "​‌‍﻿ "), " ")


def normalize(text):
    text = unicodedata.normalize("NFC", text).translate(ZERO_WIDTH).lower()
    out = []
    for ch in text:
        cat = unicodedata.category(ch)
        if cat[0] in ("P", "S") or cat == "Nd":
            out.append(" ")
        else:
            out.append(ch)
    return " ".join("".join(out).split())


def word_count(blocks):
    return sum(len(normalize(b).split()) for b in blocks)


TOKEN_RE = re.compile(r"[^\s।॥|,.;:!?\"“”‘’()\[\]{}<>/\\\-–—_=+*&%$#@~`^]+")
DEV = re.compile(r"[ऀ-ॿ]")
LAT = re.compile(r"[A-Za-z]")
BAD_START = re.compile(r"^[ऀ-ःऺ-ॏ॑-ॗॢॣ]")
DOUBLE_SIGN = re.compile(r"([ा-्ँ-ः])\1")
LONG_DEV = 28


def find_mixed(blocks):
    issues = []
    seen = set()
    for block in blocks:
        for tok in TOKEN_RE.findall(block):
            tok = tok.strip("'")
            if not tok or tok in seen:
                continue
            reason = None
            has_dev, has_lat = DEV.search(tok), LAT.search(tok)
            if has_dev and has_lat:
                reason = "Marathi+English mix"
            elif "�" in tok:
                reason = "kharab character (�)"
            elif has_dev and BAD_START.match(tok):
                reason = "matra/jodakshar shabdachya survatila"
            elif has_dev and DOUBLE_SIGN.search(tok):
                reason = "dohri matra/virama"
            elif has_dev and len(tok) > LONG_DEV:
                reason = "khup motha shabd (shabd chiktalele?)"
            if reason:
                seen.add(tok)
                issues.append((tok, reason, block[:70]))
    return issues


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    ap.add_argument("--min-words", type=int, default=150)
    ap.add_argument("--block-min-words", type=int, default=5)
    ap.add_argument("--boiler", type=int, default=15)
    ap.add_argument("--out", default="duplicate_report.txt")
    args = ap.parse_args()

    root = os.path.abspath(args.root)
    files = []
    for dp, dn, fn in os.walk(root):
        dn[:] = [d for d in dn if d not in SKIP_DIRS]
        for f in fn:
            if f.lower().endswith((".html", ".htm")):
                files.append(os.path.join(dp, f))
    files.sort()
    if not files:
        print("HTML files sapadlya nahit. Script root folder madhe run kara.")
        sys.exit(1)

    print(f"{len(files)} HTML files tapasat aahe...")

    page_blocks = {}
    page_words = {}
    for p in files:
        rel = os.path.relpath(p, root).replace("\\", "/")
        blocks = extract_blocks(p)
        page_blocks[rel] = blocks
        page_words[rel] = word_count(blocks)

    # ---------- 1. LOW TEXT ----------
    low = sorted([(w, r) for r, w in page_words.items() if w < args.min_words])

    # ---------- 2. BLOCK DUPLICATES ----------
    index = defaultdict(lambda: defaultdict(int))   # norm -> {file: count}
    sample = {}
    for rel, blocks in page_blocks.items():
        for b in blocks:
            n = normalize(b)
            if len(n.split()) < args.block_min_words:
                continue
            index[n][rel] += 1
            sample.setdefault(n, b)

    same_file = []     # ekach page madhe punha
    cross = []         # veg-vegle pages madhe
    boiler = []
    for n, fmap in index.items():
        if len(fmap) >= args.boiler:
            boiler.append((n, fmap))
        elif len(fmap) >= 2:
            cross.append((n, fmap))
        for f, c in fmap.items():
            if c > 1 and len(fmap) < args.boiler:
                same_file.append((f, c, n))
    cross.sort(key=lambda x: (-len(x[1]), x[0]))
    same_file.sort(key=lambda x: (x[0], -x[1]))

    # ---------- 3. NEAR-DUPLICATE PAGES ----------
    pair_common = defaultdict(int)
    block_total = {r: len({normalize(b) for b in bl if len(normalize(b).split()) >= args.block_min_words})
                   for r, bl in page_blocks.items()}
    for n, fmap in index.items():
        if 2 <= len(fmap) < args.boiler:
            fl = sorted(fmap)
            for i in range(len(fl)):
                for j in range(i + 1, len(fl)):
                    pair_common[(fl[i], fl[j])] += 1
    near = []
    for (a, b), c in pair_common.items():
        m = min(block_total[a], block_total[b])
        if m >= 3 and c / m >= 0.6:
            near.append((c / m, c, a, b))
    near.sort(reverse=True)

    # ---------- 4. MIXED WORDS ----------
    mixed = {}
    for rel, blocks in page_blocks.items():
        iss = find_mixed(blocks)
        if iss:
            mixed[rel] = iss

    # ---------- REPORT ----------
    L = []
    add = L.append
    add("=" * 72)
    add("संतवाणी - CONTENT REPORT")
    add("=" * 72)
    add(f"Total HTML files      : {len(files)}")
    add(f"Low text pages        : {len(low)}  (< {args.min_words} shabd)")
    add(f"Duplicate blocks      : {len(cross)} (veg-vegle pages), {len(same_file)} (ekach page madhe)")
    add(f"Near-duplicate pages  : {len(near)}")
    add(f"Mixed/chukiche shabd  : {sum(len(v) for v in mixed.values())} ({len(mixed)} pages madhe)")
    add("")

    add("-" * 72)
    add(f"1) LOW TEXT PAGES (< {args.min_words} shabd)  - AdSense sathi dhokyache")
    add("-" * 72)
    if low:
        for w, r in low:
            add(f"  {w:5d} shabd   {r}")
    else:
        add("  kahi nahi - sagle pages madhe paratse text aahe.")
    add("")

    add("-" * 72)
    add("2) DUPLICATE ABHANG / OVI / PARAGRAPH (veg-vegle pages madhe)")
    add("-" * 72)
    if cross:
        for n, fmap in cross:
            add(f"\n  [{len(fmap)} pages]  \"{sample[n][:90]}...\"")
            for f, c in sorted(fmap.items())[:12]:
                add(f"      - {f}" + (f"  (x{c})" if c > 1 else ""))
            if len(fmap) > 12:
                add(f"      ... ajun {len(fmap) - 12} pages")
    else:
        add("  kahi nahi.")
    add("")

    add("-" * 72)
    add("3) EKACH PAGE MADHE PUNHA PUNHA AALELE TEXT")
    add("-" * 72)
    if same_file:
        for f, c, n in same_file:
            add(f"  {f}  -> {c} vela: \"{sample[n][:80]}...\"")
    else:
        add("  kahi nahi.")
    add("")

    add("-" * 72)
    add("4) NEAR-DUPLICATE PAGES (60%+ content same)")
    add("-" * 72)
    if near:
        for ratio, c, a, b in near[:100]:
            add(f"  {ratio*100:5.1f}%  ({c} blocks)  {a}   <->   {b}")
    else:
        add("  kahi nahi.")
    add("")

    add("-" * 72)
    add("5) MIXED / CHUKICHE / CHIKTALELE SHABD")
    add("-" * 72)
    if mixed:
        for rel in sorted(mixed):
            iss = mixed[rel]
            add(f"\n  {rel}  ({len(iss)} shabd)")
            for tok, reason, ctx in iss[:15]:
                add(f"      '{tok}'  <- {reason}")
                add(f"          ...{ctx}...")
            if len(iss) > 15:
                add(f"      ... ajun {len(iss) - 15} shabd")
    else:
        add("  kahi nahi.")
    add("")

    add("-" * 72)
    add(f"6) COMMON TEXT ({args.boiler}+ pages madhe same - boilerplate asu shakto)")
    add("-" * 72)
    if boiler:
        for n, fmap in sorted(boiler, key=lambda x: -len(x[1]))[:30]:
            add(f"  [{len(fmap)} pages] \"{sample[n][:90]}...\"")
    else:
        add("  kahi nahi.")

    report = "\n".join(L)
    out_path = os.path.join(root, args.out)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(report)

    print("\n".join(L[:9]))
    print(f"\nPurna report: {out_path}")


if __name__ == "__main__":
    main()