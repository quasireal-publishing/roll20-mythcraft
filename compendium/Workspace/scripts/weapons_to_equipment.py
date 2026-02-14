#!/usr/bin/env python3
"""
Parse Chapter 7 Weapons.html and merge all weapons into equipment_weapons.json.
Rules:
- Only add Dancing Scimitar as weapon (skip creature stat block).
- Range, APC: exact text from HTML; empty range if missing.
- Compound damage: 1d6[blunt]+1d6[sonic] or 1d4[fire]+1d4[cold]+1d4[lightning].
- Attribute: use " or " where appropriate (e.g. "strength or dexterity").
"""

import re
import json
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
WEAPONS_HTML = WORKSPACE / "html" / "Chapter 7 Weapons.html"
EQUIPMENT_JSON = WORKSPACE / "json" / "equipment_weapons.json"


def title_case(s: str) -> str:
    """ABYSSAL BLADE -> Abyssal Blade; Hero'S -> Hero's (possessive 's)."""
    t = s.title()
    return re.sub(r"'S\b", "'s", t)


def parse_damage(damage_text: str) -> str:
    """Convert '1d8+2 sharp' or '1d6 blunt and 1d6 sonic' to 1d8+2[sharp] or 1d6[blunt]+1d6[sonic]."""
    damage_text = damage_text.strip()
    if not damage_text:
        return ""

    # "1d8+2 fire, lightning, cold, or corrosive" -> one dice, type list
    if " or " in damage_text and " and " not in damage_text:
        m = re.match(r"^(\d+d\d+(?:\+\d+)?)\s+(.+)$", damage_text)
        if m:
            return f"{m.group(1)}[{m.group(2).strip()}]"
    # Split on " and " for compound: "1d6 blunt and 1d6 sonic" or "1d4 fire, 1d4 cold, and 1d4 lightning"
    parts = re.split(r",?\s+and\s+", damage_text)
    out = []
    for part in parts:
        part = part.strip()
        # "1d4 fire" or "1d4 cold" or "1d4 lightning"
        m = re.match(r"^(\d+d\d+(?:\+\d+)?)\s+(\w+)\s*$", part)
        if m:
            dice, dtype = m.group(1), m.group(2)
            out.append(f"{dice}[{dtype}]")
        else:
            m2 = re.match(r"^(\d+d\d+(?:\+\d+)?)\s+(.+)$", part)
            if m2:
                out.append(f"{m2.group(1)}[{m2.group(2).strip()}]")
            else:
                out.append(part)
    return "+".join(out)


def attribute_from_tags(tags: str) -> str:
    """Extract attribute from tags: STR -> strength, DEX -> dexterity, CHA -> charisma; use ' or ' when applicable."""
    tags_upper = tags.upper()
    if "STR OR DEX" in tags_upper or "DEX OR STR" in tags_upper:
        return "strength or dexterity"
    if "STR WEAPON" in tags_upper and "DEX WEAPON" not in tags_upper and " OR " not in tags_upper:
        return "strength"
    if "DEX WEAPON" in tags_upper and "STR WEAPON" not in tags_upper and " OR " not in tags_upper:
        return "dexterity"
    if "CHA WEAPON" in tags_upper:
        return "charisma"
    if "STR" in tags_upper:
        return "strength"
    if "DEX" in tags_upper:
        return "dexterity"
    if "CHA" in tags_upper:
        return "charisma"
    return ""


def strip_html_to_text(html: str) -> str:
    """Rough strip of tags and decode entities for plain description."""
    text = re.sub(r"<br\s*/?>", "\n", html, flags=re.IGNORECASE)
    text = re.sub(r"</p>\s*<p[^>]*>", "\n\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"&nbsp;", " ", text, flags=re.IGNORECASE)
    text = re.sub(r" +", " ", text)
    text = re.sub(r"\n\s*\n", "\n\n", text)
    return text.strip()


def extract_weapons(html: str) -> list[dict]:
    """Parse HTML and return list of weapon dicts for Equipment."""
    weapons = []
    # Split by h3 headings (allow multiline <h3>\n  <b>NAME</b>\n</h3>)
    block_pat = re.compile(
        r"<h3(?:\s[^>]*)?>\s*<b>([^<]+)</b>\s*</h3>(.*?)(?=<h3(?:\s[^>]*)?>\s*<b>|[^\s])",
        re.DOTALL | re.IGNORECASE,
    )
    # Simpler: split on <h3><b> or <h3>\n  <b>
    parts = re.split(r"<h3[^>]*>\s*<b>([^<]+)</b>\s*</h3>", html, flags=re.IGNORECASE)
    if not parts:
        return weapons
    # parts[0] is preamble, then [name1, block1, name2, block2, ...]
    for i in range(1, len(parts), 2):
        if i + 1 >= len(parts):
            break
        name_raw = parts[i].strip()
        block = parts[i + 1]

        # Skip Dancing Scimitar creature block (Monster Level right after)
        if "Monster Level:" in block and "Dancing Scimitar" in name_raw.upper():
            continue
        # Skip ACTIONS heading as a weapon
        if name_raw.upper() == "ACTIONS":
            continue

        name_key = title_case(name_raw)

        # Tags: first <em>...</em> in block (may be multiline)
        em_match = re.search(r"<em[^>]*>(.*?)</em>", block, re.DOTALL | re.IGNORECASE)
        tags = ""
        if em_match:
            tags = re.sub(r"\s+", " ", strip_html_to_text(em_match.group(1))).strip()

        # Range: <p><b>Range: </b>X</p> or <p><b>Range:</b> X</p> — exact text
        range_match = re.search(r"<b>\s*Range:\s*</b>\s*([^<]+)", block, re.IGNORECASE)
        range_val = range_match.group(1).strip() if range_match else ""

        # APC: exact text
        apc_match = re.search(r"<b>\s*APC:\s*</b>\s*([^<]+)", block, re.IGNORECASE)
        apc_val = apc_match.group(1).strip() if apc_match else ""

        # Damage: exact text for display; we'll also produce parsed damage string
        damage_match = re.search(r"<b>\s*Damage:\s*</b>\s*([^<]+)", block, re.IGNORECASE)
        damage_raw = damage_match.group(1).strip() if damage_match else ""
        damage_parsed = parse_damage(damage_raw)

        # Description: all <p>...</p> that are not the first line (em/tags) and not Range/APC/Damage
        # We'll collect paragraphs that are description (no <b>Range, <b>APC, <b>Damage, <b>STR<br, etc.)
        content_parts = []
        desc_parts = []
        # Remove the first <p>...</p> if it's the em/tags line (may be multiline)
        rest = block
        if em_match:
            rest = re.sub(r"<p[^>]*>\s*<em[^>]*>.*?</em>(?:\s*>\s*)?\s*</p>", "", rest, count=1, flags=re.DOTALL | re.IGNORECASE)
        # Remove Range, APC, Damage lines
        rest = re.sub(r"<p>\s*<b>\s*Range:\s*</b>[^<]*</p>", "", rest, flags=re.IGNORECASE)
        rest = re.sub(r"<p>\s*<b>\s*APC:\s*</b>[^<]*</p>", "", rest, flags=re.IGNORECASE)
        rest = re.sub(r"<p>\s*<b>\s*Damage:\s*</b>[^<]*</p>", "", rest, flags=re.IGNORECASE)
        # Remove empty <p><br /></p> and lone <br />
        rest = re.sub(r"<p>\s*<br\s*/?>\s*</p>", "", rest, flags=re.IGNORECASE)
        rest = re.sub(r"<br\s*/?>\s*<br\s*/?>", "<br />", rest, flags=re.IGNORECASE)
        # Content: only description <p>...</p> blocks (no tables)
        rest = rest.strip()
        # Remove any table (shouldn't be present for weapon-only blocks)
        rest = re.sub(r"<table[^>]*>.*?</table>", "", rest, flags=re.DOTALL | re.IGNORECASE)
        # Trim up to next <h3>
        content = re.sub(r"\s*<h3[^>]*>.*", "", rest, flags=re.DOTALL | re.IGNORECASE).strip()
        description = strip_html_to_text(content)

        # Damage type: for simple "1d8+2 sharp" we have one type; for compound we store the parsed string only (no single damage_type?)
        # Existing schema has damage and damage_type. For compound, damage is the full string 1d6[blunt]+1d6[sonic]; damage_type could be first or empty.
        first_type = ""
        if "[" in damage_parsed:
            mt = re.search(r"\[(\w+)\]", damage_parsed)
            if mt:
                first_type = mt.group(1)

        attr = attribute_from_tags(tags)

        weapons.append({
            "name": name_key,
            "apc": apc_val,
            "tags": tags,
            "range": range_val,
            "damage": damage_parsed,
            "attribute": attr,
            "damage_type": first_type,
            "subcategory": "weapon",
            "content": content,
            "description": description,
        })
    return weapons


def main():
    if WEAPONS_HTML.exists() and WEAPONS_HTML.stat().st_size > 0:
        html = WEAPONS_HTML.read_text(encoding="utf-8")
    else:
        import sys
        html = sys.stdin.read()
        if not html.strip():
            print("Error: Chapter 7 Weapons.html is empty. Save the file or pipe HTML into this script.", file=sys.stderr)
            raise SystemExit(1)
    if EQUIPMENT_JSON.exists() and EQUIPMENT_JSON.stat().st_size > 0:
        equipment_data = json.loads(EQUIPMENT_JSON.read_text(encoding="utf-8"))
    else:
        equipment_data = {"pagesByCategory": {"Equipment": {}}}
    equipment = equipment_data["pagesByCategory"]["Equipment"]

    weapons = extract_weapons(html)
    for w in weapons:
        key = w.pop("name")
        # Use key as given (title case)
        equipment[key] = w

    EQUIPMENT_JSON.parent.mkdir(parents=True, exist_ok=True)
    EQUIPMENT_JSON.write_text(
        json.dumps(equipment_data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"Added/updated {len(weapons)} weapons in equipment_weapons.json")


if __name__ == "__main__":
    main()
