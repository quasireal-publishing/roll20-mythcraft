#!/usr/bin/env python3
"""
Parse Chapter 7 Armor.html and merge all armor into equipment_armor.json.

Each armor entry has:
- tags: from <em> line (e.g. "Armor, Medium, Uncommon, Essence 15")
- type: extracted from tags (medium, light, heavy, shield) for convenience
- base: from <p><b>Base: </b>...</p> — included as first line in description and in content
- content: HTML with Base line then description paragraphs
- description: plain text with "Base: <name>" as first line, then description
- subcategory: "armor"
"""

import re
import json
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
ARMOR_HTML = WORKSPACE / "html" / "Chapter 7 Armor.html"
EQUIPMENT_JSON = WORKSPACE / "json" / "equipment_armor.json"


def title_case(s: str) -> str:
    """ACIDWALKER'S ARMOR -> Acidwalker's Armor; preserve apostrophes and possessive 's."""
    t = s.title()
    return re.sub(r"'S\b", "'s", t)  # Acidwalker'S -> Acidwalker's


def strip_html_to_text(html: str) -> str:
    """Rough strip of tags for plain text."""
    text = re.sub(r"<br\s*/?>", "\n", html, flags=re.IGNORECASE)
    text = re.sub(r"</p>\s*<p[^>]*>", "\n\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"&nbsp;", " ", text, flags=re.IGNORECASE)
    text = re.sub(r" +", " ", text)
    text = re.sub(r"\n\s*\n", "\n\n", text)
    return text.strip()


def type_from_tags(tags: str) -> str:
    """Extract armor type from tags: Armor, Medium -> medium; Armor, Shield -> shield."""
    tags_upper = tags.upper()
    if "ARMOR, SHIELD" in tags_upper or ", SHIELD," in tags_upper:
        return "shield"
    if "ARMOR, MEDIUM" in tags_upper or ", MEDIUM," in tags_upper:
        return "medium"
    if "ARMOR, LIGHT" in tags_upper or ", LIGHT," in tags_upper:
        return "light"
    if "ARMOR, HEAVY" in tags_upper or ", HEAVY," in tags_upper:
        return "heavy"
    return ""


def extract_armor(html: str) -> list[dict]:
    """Parse HTML and return list of armor dicts for Equipment."""
    armor_list = []
    parts = re.split(r"<h3[^>]*>\s*<b>([^<]+)</b>\s*</h3>", html, flags=re.IGNORECASE)
    if not parts:
        return armor_list

    for i in range(1, len(parts), 2):
        if i + 1 >= len(parts):
            break
        name_raw = parts[i].strip()
        block = parts[i + 1]

        name_key = title_case(name_raw)

        # Tags: first <em>...</em> in block (may be multiline)
        em_match = re.search(r"<em[^>]*>(.*?)</em>", block, re.DOTALL | re.IGNORECASE)
        tags = ""
        if em_match:
            tags = re.sub(r"\s+", " ", strip_html_to_text(em_match.group(1))).strip()

        # Base: <p><b>Base: </b>X</p> or <p><b>Base:</b> X</p>
        base_match = re.search(r"<b>\s*Base:\s*</b>\s*([^<]+)", block, re.IGNORECASE)
        base_val = base_match.group(1).strip() if base_match else ""

        # Remove tags paragraph and Base line from block to get description only
        rest = block
        if em_match:
            rest = re.sub(
                r"<p[^>]*>\s*<em[^>]*>.*?</em>(?:\s*>\s*)?\s*</p>",
                "",
                rest,
                count=1,
                flags=re.DOTALL | re.IGNORECASE,
            )
        rest = re.sub(r"<p>\s*<b>\s*Base:\s*</b>[^<]*</p>", "", rest, flags=re.IGNORECASE)
        rest = re.sub(r"<p>\s*<br\s*/?>\s*</p>", "", rest, flags=re.IGNORECASE)
        rest = re.sub(r"<br\s*/?>\s*<br\s*/?>", "<br />", rest, flags=re.IGNORECASE)
        # Remove empty <p><em> </em></p> (e.g. Lucky Cutoff Vest)
        rest = re.sub(r"<p>\s*<em[^>]*>\s*</em>\s*</p>", "", rest, flags=re.IGNORECASE)
        rest = rest.strip()
        rest = re.sub(r"\s*<h3[^>]*>.*", "", rest, flags=re.DOTALL | re.IGNORECASE).strip()

        # content: Base line (HTML) + <br /> + description paragraphs
        base_html = f'<p><b>Base: </b>{base_val}</p>' if base_val else ""
        if base_html and rest:
            content = base_html + "<br />" + rest
        else:
            content = base_html or rest

        # description: "Base: Scale Mail.\n\nThe black scales..." (first line = Base, then plain text)
        desc_body = strip_html_to_text(rest)
        if base_val and desc_body:
            description = f"Base: {base_val}.\n\n{desc_body}"
        elif base_val:
            description = f"Base: {base_val}."
        else:
            description = desc_body

        type_val = type_from_tags(tags)

        armor_list.append({
            "name": name_key,
            "tags": tags,
            "type": type_val,
            "base": base_val,
            "subcategory": "armor",
            "content": content,
            "description": description,
        })
    return armor_list


def main():
    if ARMOR_HTML.exists() and ARMOR_HTML.stat().st_size > 0:
        html = ARMOR_HTML.read_text(encoding="utf-8")
    else:
        import sys
        html = sys.stdin.read()
        if not html.strip():
            print(
                "Error: Chapter 7 Armor.html is empty. Save the file or pipe HTML into this script.",
                file=sys.stderr,
            )
            raise SystemExit(1)

    equipment_data = json.loads(EQUIPMENT_JSON.read_text(encoding="utf-8"))
    equipment = equipment_data["pagesByCategory"]["Equipment"]

    armor_items = extract_armor(html)
    new_keys = set()
    for item in armor_items:
        key = item.pop("name")
        new_keys.add(key)
        equipment[key] = item

    # Remove obsolete keys that differ only by possessive 'S (e.g. Acidwalker'S -> Acidwalker's)
    for old_key in list(equipment.keys()):
        if old_key not in new_keys and old_key.replace("'S ", "'s ") in new_keys:
            del equipment[old_key]

    EQUIPMENT_JSON.write_text(
        json.dumps(equipment_data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"Added/updated {len(armor_items)} armor entries in equipment_armor.json")


if __name__ == "__main__":
    main()
