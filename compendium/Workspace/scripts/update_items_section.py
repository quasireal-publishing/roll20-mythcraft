#!/usr/bin/env python3
"""Replace ITEMS section in Chapter 7. html with only linked h3 headings."""
import re
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
HTML_FILE = WORKSPACE / "html" / "Chapter 7. html"


def name_to_slug(name: str) -> str:
    """AMULET OF THIRST -> Amulet%20of%20Thirst (title case, %20 for spaces)."""
    words = name.strip().split()
    title = " ".join(w.capitalize() for w in words)
    return title.replace(" ", "%20")


def main():
    text = HTML_FILE.read_text(encoding="utf-8")

    # Find ITEMS section: from <h2> ITEMS </h2> to <h2>POTIONS</h2>
    start_marker = "<h2>\n  <b>ITEMS</b>\n</h2>"
    end_marker = "<h2><b>POTIONS</b></h2>"
    start = text.find(start_marker)
    end = text.find(end_marker)
    if start == -1 or end == -1:
        raise SystemExit("Could not find ITEMS or POTIONS section")

    section = text[start:end]
    # Extract all <h3>...</h3> and get text inside <b>...</b>
    # Pattern: <h3> (maybe newlines) <b> (maybe newlines) NAME </b>
    names = []
    for m in re.finditer(
        r"<h3>\s*<b[^>]*>\s*([^<]+?)\s*</b\s*>",
        section,
        re.IGNORECASE | re.DOTALL,
    ):
        name = m.group(1).strip().replace("\n", " ").replace("  ", " ")
        if not name:
            continue
        # Skip duplicate FLUTE OF THE GRAVECALLER (appears twice in source)
        if name == "FLUTE OF THE GRAVECALLER" and names and names[-1] == "FLUTE OF THE GRAVECALLER":
            continue
        names.append(name)

    # Build new section: h2 + one linked h3 per name
    lines = [
        "<h2>",
        "  <b>ITEMS</b>",
        "</h2>",
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

    new_section = "\n".join(lines) + "\n\n"
    new_text = text[:start] + new_section + text[end:]
    HTML_FILE.write_text(new_text, encoding="utf-8")
    print(f"Replaced ITEMS section with {len(names)} linked headings.")


if __name__ == "__main__":
    main()
