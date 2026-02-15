#!/usr/bin/env python3
"""
Apply branding color to h2, h3, and h4 headers that do NOT contain an anchor (<a>).
Adds style="color: rgb(23, 67, 69);" to the opening tag (or merges into existing style).
"""
import sys
from pathlib import Path

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("This script requires BeautifulSoup4. Install with: pip install beautifulsoup4", file=sys.stderr)
    sys.exit(1)

BRANDING_COLOR = "color: rgb(23, 67, 69);"


def apply_branding_to_headers(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag_name in ("h2", "h3", "h4"):
        for tag in soup.find_all(tag_name):
            if tag.find("a") is not None:
                continue
            existing = tag.get("style") or ""
            if "color:" in existing and "rgb(23, 67, 69)" in existing:
                continue
            if existing.strip():
                new_style = existing.rstrip("; ") + "; " + BRANDING_COLOR
            else:
                new_style = BRANDING_COLOR
            tag["style"] = new_style
    return str(soup)


def main():
    if len(sys.argv) < 2:
        print("Usage: python apply_header_branding.py <file.html | folder>", file=sys.stderr)
        sys.exit(1)

    path_arg = Path(sys.argv[1])
    if not path_arg.exists():
        print(f"Not found: {path_arg}", file=sys.stderr)
        sys.exit(1)

    if path_arg.is_file():
        html_files = [path_arg] if path_arg.suffix.lower() == ".html" else []
        if not html_files:
            print(f"Not an HTML file: {path_arg}", file=sys.stderr)
            sys.exit(1)
    else:
        html_files = sorted(path_arg.glob("*.html"))
        if not html_files:
            print(f"No .html files found in {path_arg}", file=sys.stderr)
            sys.exit(1)

    for path in html_files:
        try:
            html = path.read_text(encoding="utf-8")
            updated = apply_branding_to_headers(html)
            if updated != html:
                path.write_text(updated, encoding="utf-8")
                print(f"Updated: {path.name}")
        except Exception as e:
            print(f"Error processing {path.name}: {e}", file=sys.stderr)

    print(f"Done. Processed {len(html_files)} file(s).")


if __name__ == "__main__":
    main()
