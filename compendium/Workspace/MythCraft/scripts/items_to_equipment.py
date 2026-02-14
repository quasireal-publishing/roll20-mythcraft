#!/usr/bin/env python3
"""
Parse Chapter 7 Items.html and Chapter 7 Potions.html and merge all items
into equipment_items.json.

Each entry has:
- tags: from first <p><em>...</em></p> (e.g. "Necklace, Common, Essence 10")
- description: plain text of the full block (tags + body)
- content: HTML of the full block (tags paragraph + br + description/tables)
"""

import re
import json
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
ITEMS_HTML = WORKSPACE / "html" / "Chapter 7 Items.html"
POTIONS_HTML = WORKSPACE / "html" / "Chapter 7 Potions.html"
EQUIPMENT_JSON = WORKSPACE / "json" / "equipment_items.json"


def title_case(s: str) -> str:
    """AMULET OF THIRST -> Amulet of Thirst; possessive 's preserved."""
    t = s.title()
    return re.sub(r"'S\b", "'s", t)


def strip_html_to_text(html: str) -> str:
    """Rough strip of tags for plain text."""
    text = re.sub(r"<br\s*/?>", "\n", html, flags=re.IGNORECASE)
    text = re.sub(r"</p>\s*<p[^>]*>", "\n\n", text, flags=re.IGNORECASE)
    text = re.sub(r"</td>\s*<td[^>]*>", " | ", text, flags=re.IGNORECASE)
    text = re.sub(r"<tr[^>]*>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"&nbsp;", " ", text, flags=re.IGNORECASE)
    text = re.sub(r" +", " ", text)
    text = re.sub(r"\n\s*\n", "\n\n", text)
    return text.strip()


def extract_items(html: str) -> list[dict]:
    """Parse HTML and return list of item dicts (name, tags, description, content)."""
    item_list = []
    # Split on h3; capture name from <b>...</b>. Handles multiline and inline h3.
    parts = re.split(
        r"<h3[^>]*>\s*<b[^>]*>\s*([^<]+?)\s*</b\s*>\s*</h3>",
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    # parts[0] = before first h3, parts[1]=name1, parts[2]=block1, parts[3]=name2, ...
    for i in range(1, len(parts), 2):
        if i + 1 >= len(parts):
            break
        name_raw = parts[i].strip().replace("\n", " ").replace("  ", " ")
        if not name_raw:
            continue
        # Skip duplicate FLUTE OF THE GRAVECALLER (appears twice in Items.html)
        if name_raw == "FLUTE OF THE GRAVECALLER" and any(
            x.get("name") == title_case(name_raw) for x in item_list
        ):
            continue
        block = parts[i + 1]

        # Trim block: stop at next <h3 (start of next item)
        block = re.sub(r"\s*<h3[^>]*>.*", "", block, flags=re.DOTALL | re.IGNORECASE)
        block = block.strip()

        # Tags: first <p><em>...</em></p>
        em_match = re.search(r"<p[^>]*>\s*<em[^>]*>(.*?)</em>\s*</p>", block, re.DOTALL | re.IGNORECASE)
        tags = ""
        if em_match:
            tags = strip_html_to_text(em_match.group(1)).strip()
            tags = re.sub(r"\s+", " ", tags)

        # content: full block HTML (tags line + everything after)
        content = block

        # description: plain text of body only (exclude tags line)
        block_no_tags = re.sub(
            r"<p[^>]*>\s*<em[^>]*>.*?</em>\s*</p>\s*",
            "",
            block,
            count=1,
            flags=re.DOTALL | re.IGNORECASE,
        )
        block_no_tags = re.sub(r"^(?:\s*<br\s*/?>)*\s*", "", block_no_tags.strip())
        description = strip_html_to_text(block_no_tags)

        item_list.append({
            "name": title_case(name_raw),
            "tags": tags,
            "description": description,
            "content": content,
        })
    return item_list


def main():
    all_items = []

    for path in (ITEMS_HTML, POTIONS_HTML):
        if path.exists() and path.stat().st_size > 0:
            html = path.read_text(encoding="utf-8")
            items = extract_items(html)
            all_items.extend(items)
        else:
            print(f"Warning: {path.name} missing or empty, skipping.", file=__import__("sys").stderr)

    if not all_items:
        print("Error: No items extracted. Ensure Items.html and/or Potions.html have content.", file=__import__("sys").stderr)
        raise SystemExit(1)

    # Load or create JSON
    if EQUIPMENT_JSON.exists() and EQUIPMENT_JSON.stat().st_size > 0:
        equipment_data = json.loads(EQUIPMENT_JSON.read_text(encoding="utf-8"))
    else:
        equipment_data = {"pagesByCategory": {"Equipment": {}}}
    equipment = equipment_data["pagesByCategory"]["Equipment"]

    new_keys = set()
    for item in all_items:
        key = item.pop("name")
        new_keys.add(key)
        equipment[key] = item

    # Remove obsolete keys that differ only by possessive 'S
    for old_key in list(equipment.keys()):
        if old_key not in new_keys and old_key.replace("'S ", "'s ") in new_keys:
            del equipment[old_key]

    EQUIPMENT_JSON.parent.mkdir(parents=True, exist_ok=True)
    EQUIPMENT_JSON.write_text(
        json.dumps(equipment_data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"Added/updated {len(all_items)} entries in equipment_items.json")


if __name__ == "__main__":
    main()
