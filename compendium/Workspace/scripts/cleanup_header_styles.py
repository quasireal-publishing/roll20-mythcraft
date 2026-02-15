#!/usr/bin/env python3
"""
Remove font/size styling from p and header elements. For h2, h3, h4 keep only
the branding color: style="color: rgb(23, 67, 69);". Remove style entirely from <p>.
"""
import sys
from pathlib import Path

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("This script requires BeautifulSoup4. Install with: pip install beautifulsoup4", file=sys.stderr)
    sys.exit(1)

BRANDING_COLOR = "color: rgb(23, 67, 69);"


def cleanup_styles(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")

    # p: remove style entirely
    for tag in soup.find_all("p"):
        if tag.get("style") is not None:
            del tag["style"]

    # h2, h3, h4: keep only the color
    for tag_name in ("h2", "h3", "h4"):
        for tag in soup.find_all(tag_name):
            has_anchor = tag.find("a") is not None
            if has_anchor:
                if tag.get("style") is not None:
                    del tag["style"]
            else:
                tag["style"] = BRANDING_COLOR

    return str(soup)


def main():
    # Default to html folder next to this script's parent (Workspace/html)
    default_dir = Path(__file__).parent.parent / "html"
    html_dir = default_dir if default_dir.exists() else Path(__file__).parent
    if len(sys.argv) > 1:
        html_dir = Path(sys.argv[1])

    html_files = sorted(html_dir.glob("*.html"))
    if not html_files:
        print(f"No .html files found in {html_dir}", file=sys.stderr)
        sys.exit(1)

    for path in html_files:
        try:
            html = path.read_text(encoding="utf-8")
            updated = cleanup_styles(html)
            if updated != html:
                path.write_text(updated, encoding="utf-8")
                print(f"Updated: {path.name}")
        except Exception as e:
            print(f"Error processing {path.name}: {e}", file=sys.stderr)

    print(f"Done. Processed {len(html_files)} file(s).")


if __name__ == "__main__":
    main()
