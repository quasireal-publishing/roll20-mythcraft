#!/usr/bin/env python3
"""Replace POTIONS section in Chapter 7. html with only linked h3 headings."""
import re
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
HTML_FILE = WORKSPACE / "html" / "Chapter 7. html"


def name_to_slug(name: str) -> str:
    """CLEARBLOOD ELIXIR -> Clearbood%20Elixir (title case, %20 for spaces)."""
    words = name.strip().split()
    title = " ".join(w.capitalize() for w in words)
    return title.replace(" ", "%20")


def main():
    text = HTML_FILE.read_text(encoding="utf-8")

    # POTIONS section: from <h2><b>POTIONS</b></h2> to end of file
    start_marker = "<h2><b>POTIONS</b></h2>"
    start = text.find(start_marker)
    if start == -1:
        raise SystemExit("Could not find POTIONS section")
    end = len(text)
    section = text[start:end]

    # Extract all <h3>...</h3> and get text inside <b>...</b>
    names = []
    for m in re.finditer(
        r"<h3>\s*<b[^>]*>\s*([^<]+?)\s*</b\s*>",
        section,
        re.IGNORECASE | re.DOTALL,
    ):
        name = m.group(1).strip().replace("\n", " ").replace("  ", " ")
        if not name:
            continue
        names.append(name)

    # Build new section: h2 + one linked h3 per name (same format as weapons/armor)
    lines = [
        "<h2><b>POTIONS</b></h2>",
    ]
    for name in names:
        slug = name_to_slug(name)
        lines.extend([
            "<h3>",
            "  <b",
            "    ><a",
            f'      href="https://app.roll20.net/compendium/mythcraft/Equipment:{slug}"',
            '      target="_blank"',
            f"      >{name}</a",
            "    ></b",
            "  >",
            "</h3>",
        ])

    new_section = "\n".join(lines) + "\n"
    new_text = text[:start] + new_section
    HTML_FILE.write_text(new_text, encoding="utf-8")
    print(f"Replaced POTIONS section with {len(names)} linked headings.")


if __name__ == "__main__":
    main()
