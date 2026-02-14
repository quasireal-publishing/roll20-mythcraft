#!/usr/bin/env python3
"""
Parse Chapter 6 - Siege Weapons.html and write each siege weapon into siege.json.

- content: full HTML between this weapon's h2 and the next h2 (exclusive of the h2 tags).
- Other keys follow the example in siege.json: description, ammunition, reload,
  area_of_effect, helf, speed, hp, armor_rating, reflexes, fortitude, resist, immune,
  damage_reduction, damage_threshold, subcategory, actions.
"""

import re
import json
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
SIEGE_HTML = WORKSPACE / "html" / "Chapter 6 - Siege Weapons.html"
SIEGE_JSON = WORKSPACE / "html" / "siege.json"


def strip_html(html: str) -> str:
    text = re.sub(r"<br\s*/?>", " ", html, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def get_stat(block: str, label: str) -> str:
    """Get value from <p><b>Label:</b> value</p> or <p><b>Label</b> value</p>."""
    m = re.search(
        rf"<p>\s*<b>\s*{re.escape(label)}\s*:?\s*</b>\s*([^<]*)</p>",
        block,
        re.IGNORECASE,
    )
    return strip_html(m.group(1)) if m else ""


def extract_siege_weapons(html: str) -> list[dict]:
    parts = re.split(
        r"<h2[^>]*>\s*<b[^>]*>\s*([^<]+?)\s*</b>\s*</h2>",
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    weapons = []
    for i in range(1, len(parts), 2):
        if i + 1 >= len(parts):
            break
        name_raw = parts[i].strip().replace("\n", " ")
        if not name_raw:
            continue
        block = parts[i + 1]
        block = re.sub(r"\s*<h2[^>]*>.*", "", block, flags=re.DOTALL | re.IGNORECASE)
        block = block.strip()
        name = name_raw.title()

        # content = full HTML between h2 tags
        content = block

        # Description: first <p> that is not a stat line (stat lines have <b>Label:</b> or <b>Label</b> at start)
        first_p = re.match(r"\s*<p>\s*(.*?)\s*</p>", block, re.DOTALL | re.IGNORECASE)
        if first_p:
            inner = first_p.group(1)
            if not re.match(r"\s*<b>\s*(?:Range|Ammunition|Reload|AOE|Heft|Speed|HP|AR|REF|FORT|Resist|Immune|DR|DT|Vulnerable)\s*", inner, re.IGNORECASE):
                description = strip_html(inner)
            else:
                description = ""
        else:
            description = ""

        ammunition = get_stat(block, "Ammunition")
        reload = get_stat(block, "Reload")
        area_of_effect = get_stat(block, "AOE")
        heft = get_stat(block, "Heft")
        speed = get_stat(block, "Speed")
        hp = get_stat(block, "HP")
        ar = get_stat(block, "AR")
        ref = get_stat(block, "REF")
        fort = get_stat(block, "FORT")
        resist = get_stat(block, "Resist")
        immune = get_stat(block, "Immune")
        dr = get_stat(block, "DR")
        dt = get_stat(block, "DT")
        range_val = get_stat(block, "Range")

        # Action: last non-stat <p> (attack or drawbridge text)
        action_paras = re.findall(r"<p>\s*(.*?)\s*</p>", block, re.DOTALL | re.IGNORECASE)
        effect = ""
        damage = ""
        damage_type = ""
        defense = "AR"
        stat_labels = r"Range|Ammunition|Reload|AOE|Heft|Speed|HP|AR|REF|FORT|Resist|Immune|DR|DT|Vulnerable"
        for p in reversed(action_paras):
            if re.search(rf"<b>\s*(?:{stat_labels})\s*:?\s*</b>", p, re.IGNORECASE):
                continue
            effect = strip_html(p)
            if not effect:
                continue
            if "vs the FORT" in p or "vs FORT" in p.upper():
                defense = "FORT"
            else:
                defense = "AR"
            hit_m = re.search(r"<b>\s*Hit:\s*</b>\s*(\d+d\d+)\s*(\w+)", p, re.IGNORECASE)
            if hit_m:
                damage = hit_m.group(1)
                damage_type = hit_m.group(2).lower()
            break

        actions = [
            {
                "name": "Attack",
                "range": range_val or "",
                "type": "Siege Weapon",
                "defense": defense,
                "damage": damage,
                "damage_type": damage_type,
                "effect": effect,
            }
        ]

        weapons.append({
            "name": name,
            "description": description,
            "ammunition": ammunition,
            "reload": reload,
            "area_of_effect": area_of_effect,
            "helf": heft,
            "speed": speed,
            "hp": hp,
            "armor_rating": ar,
            "reflexes": ref,
            "fortitude": fort,
            "resist": resist,
            "immune": immune,
            "damage_reduction": dr,
            "damage_threshold": dt,
            "subcategory": "siege",
            "actions": actions,
            "content": content,
        })
    return weapons


def main():
    if not SIEGE_HTML.exists():
        print(f"Error: {SIEGE_HTML} not found.", file=__import__("sys").stderr)
        raise SystemExit(1)

    html = SIEGE_HTML.read_text(encoding="utf-8")
    weapons = extract_siege_weapons(html)
    if not weapons:
        print("Error: No siege weapons extracted.", file=__import__("sys").stderr)
        raise SystemExit(1)

    if SIEGE_JSON.exists() and SIEGE_JSON.read_text(encoding="utf-8").strip():
        data = json.loads(SIEGE_JSON.read_text(encoding="utf-8"))
    else:
        data = {"pagesByCategory": {"Siege": {}}}

    creature = data["pagesByCategory"]["Siege"]
    for w in weapons:
        name = w.pop("name")
        creature[name] = w

    SIEGE_JSON.parent.mkdir(parents=True, exist_ok=True)
    SIEGE_JSON.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"Wrote {len(weapons)} siege weapons to {SIEGE_JSON.name}")


if __name__ == "__main__":
    main()
