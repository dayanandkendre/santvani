# -*- coding: utf-8 -*-
"""
Santvani Navbar Read-Only Audit
- Scans HTML files under the folder where this script is placed.
- Does NOT modify any HTML files.
- Writes one report: navbar_audit_report.txt
"""

from pathlib import Path
import re
from collections import Counter

ROOT = Path(__file__).resolve().parent
REPORT = ROOT / "navbar_audit_report.txt"

# Text patterns are intentionally broad to handle small markup/spacing variations.
SHIV_PATTERNS = [
    re.compile(r"शिवपुराण\s*कथा\s*संग्रह", re.IGNORECASE),
    re.compile(r"shivpuran-katha-sangrah\.html", re.IGNORECASE),
]
GANESH_PATTERNS = [
    re.compile(r"गणेशपुराण\s*कथा", re.IGNORECASE),
    re.compile(r"ganeshpuran-katha", re.IGNORECASE),
]

def matches_any(text, patterns):
    return any(p.search(text) for p in patterns)

def safe_read(path):
    # Try common encodings; do not write to or alter the source file.
    for encoding in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            return path.read_text(encoding=encoding, errors="strict")
        except (UnicodeDecodeError, OSError):
            continue
    return path.read_text(encoding="utf-8", errors="replace")

def main():
    html_files = sorted(
        p for p in ROOT.rglob("*")
        if p.is_file()
        and p.suffix.lower() in {".html", ".htm"}
        and not any(part.lower() in {".git", "node_modules"} for part in p.parts)
    )

    shiv_files = []
    ganesh_files = []
    both_files = []
    menu_contexts = []
    occurrence_counts = Counter()

    for file in html_files:
        try:
            content = safe_read(file)
        except OSError as exc:
            occurrence_counts["read_errors"] += 1
            menu_contexts.append(f"READ ERROR: {file.relative_to(ROOT)} :: {exc}")
            continue

        rel = file.relative_to(ROOT).as_posix()
        has_shiv = matches_any(content, SHIV_PATTERNS)
        has_ganesh = matches_any(content, GANESH_PATTERNS)

        if has_shiv:
            shiv_files.append(rel)
        if has_ganesh:
            ganesh_files.append(rel)
        if has_shiv and has_ganesh:
            both_files.append(rel)

        # Count common signs of the same dropdown item / navbar block.
        occurrence_counts["shiv_text"] += len(re.findall(r"शिवपुराण\s*कथा\s*संग्रह", content, re.IGNORECASE))
        occurrence_counts["shiv_href"] += len(re.findall(r"shivpuran-katha-sangrah\.html", content, re.IGNORECASE))
        occurrence_counts["ganesh_text"] += len(re.findall(r"गणेशपुराण\s*कथा", content, re.IGNORECASE))
        occurrence_counts["ganesh_href"] += len(re.findall(r"ganeshpuran-katha", content, re.IGNORECASE))

        if has_shiv:
            lines = content.splitlines()
            snippets = []
            for idx, line in enumerate(lines):
                if any(p.search(line) for p in SHIV_PATTERNS):
                    start = max(0, idx - 3)
                    end = min(len(lines), idx + 4)
                    snippets.append(
                        "\n".join(f"    {j+1}: {lines[j][:240]}" for j in range(start, end))
                    )
                    if len(snippets) >= 2:
                        break
            menu_contexts.append(f"\nFILE: {rel}\n" + "\n---\n".join(snippets))

    # Quick grouping hint: detect how often the exact navbar marker appears.
    exact_dropdown_count = 0
    for file in html_files:
        try:
            content = safe_read(file)
        except OSError:
            continue
        if 'class="dropdown-menu"' in content and 'class="dropdown-toggle"' in content:
            exact_dropdown_count += 1

    lines = [
        "SANTVANI NAVBAR READ-ONLY AUDIT",
        "=" * 36,
        f"Folder scanned: {ROOT}",
        "Source files changed: NO",
        f"HTML/HTM files found: {len(html_files)}",
        f"Files containing Shiv Puran collection marker: {len(shiv_files)}",
        f"Files containing Ganesh Puran marker: {len(ganesh_files)}",
        f"Files containing both markers: {len(both_files)}",
        f"Files with generic dropdown-toggle + dropdown-menu: {exact_dropdown_count}",
        "",
        "OCCURRENCE COUNTS",
        "-" * 20,
    ]
    for key in ("shiv_text", "shiv_href", "ganesh_text", "ganesh_href", "read_errors"):
        lines.append(f"{key}: {occurrence_counts[key]}")
    lines.extend([
        "",
        "FILES WITH SHIV PURAN MARKER",
        "-" * 28,
        *(shiv_files or ["(none found)"]),
        "",
        "FILES WITH GANESH PURAN MARKER",
        "-" * 30,
        *(ganesh_files or ["(none found)"]),
        "",
        "FILES WITH BOTH MARKERS",
        "-" * 23,
        *(both_files or ["(none found)"]),
        "",
        "SHIV PURAN CODE CONTEXT (first matching snippets per file)",
        "-" * 56,
        *(menu_contexts or ["(none found)"]),
        "",
        "NOTE: This audit only searches text markers. It does not validate live URLs, canonical tags, or Google indexing.",
    ])

    REPORT.write_text("\n".join(lines), encoding="utf-8")
    print("Audit complete. Source HTML files were NOT changed.")
    print(f"HTML/HTM files scanned: {len(html_files)}")
    print(f"Files with Shiv Puran marker: {len(shiv_files)}")
    print(f"Files with Ganesh Puran marker: {len(ganesh_files)}")
    print(f"Report saved to: {REPORT}")

if __name__ == "__main__":
    main()
