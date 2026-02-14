#!/usr/bin/env python3
"""
Parse Chapter 6 - Poisons.html and write each poison into equipment_poisons.json.

Each entry has:
- tags: text of the first <em> element (e.g. "Very Rare Poison")
- description: all <em> texts ending with ".", then Application/Symptoms/Treatment as plain text
  e.g. "Very Rare Poison. Lethality: High. Transmissibility: None. Application: A creature gains..."
- content: full HTML of the poison block as a string
"""

import re
import json
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
POISONS_HTML = WORKSPACE / "html" / "Chapter 6 - Poisons.html"
EQUIPMENT_POISONS_JSON = WORKSPACE / "json" / "equipment_poisons.json"


def normalize_whitespace(s: str) -> str:
    """Collapse all whitespace to single space."""
    return re.sub(r"\s+", " ", s).strip()


def title_case(s: str) -> str:
    """BASILISK-EYE GOO -> Basilisk-Eye Goo; preserve hyphens and casing like 'Laxberry'."""
    return s.title()


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


def extract_poisons(html: str) -> list[dict]:
    """Parse HTML and return list of poison dicts (name, tags, description, content)."""
    poison_list = []
    # Split on h3; capture name from <b>...</b>
    parts = re.split(
        r"<h3[^>]*>\s*<b[^>]*>\s*([^<]+?)\s*</b\s*>\s*</h3>",
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    for i in range(1, len(parts), 2):
        if i + 1 >= len(parts):
            break
        name_raw = parts[i].strip().replace("\n", " ").replace("  ", " ")
        if not name_raw:
            continue
        block = parts[i + 1]
        # Stop at next poison's h3
        block = re.sub(r"\s*<h3[^>]*>.*", "", block, flags=re.DOTALL | re.IGNORECASE)
        block = block.strip()

        # Tags: first <em> text only
        em_first = re.search(r"<em[^>]*>(.*?)</em>", block, re.DOTALL | re.IGNORECASE)
        tags = ""
        if em_first:
            tags = normalize_whitespace(strip_html_to_text(em_first.group(1)))

        # Description: all text as one string (em phrases with ". " then rest; skip first em since it's the tag)
        em_texts = re.findall(r"<em[^>]*>(.*?)</em>", block, re.DOTALL | re.IGNORECASE)
        em_parts = []
        for raw in em_texts[1:]:  # skip first (same as tags)
            t = normalize_whitespace(strip_html_to_text(raw))
            if not t:
                continue
            if not t.endswith("."):
                t = t + "."
            em_parts.append(t)
        rest = re.sub(r"<em[^>]*>.*?</em>", "", block, flags=re.IGNORECASE)
        rest_plain = normalize_whitespace(strip_html_to_text(rest))
        description = " ".join(em_parts) + (" " + rest_plain if rest_plain else "")
        description = normalize_whitespace(description)

        poison_list.append({
            "name": title_case(name_raw),
            "tags": tags,
            "description": description,
            "content": block,
        })
    return poison_list


def main():
    if not POISONS_HTML.exists() or POISONS_HTML.stat().st_size == 0:
        print(f"Error: {POISONS_HTML} missing or empty.", file=__import__("sys").stderr)
        raise SystemExit(1)

    html = POISONS_HTML.read_text(encoding="utf-8")
    poisons = extract_poisons(html)
    if not poisons:
        print("Error: No poisons extracted.", file=__import__("sys").stderr)
        raise SystemExit(1)

    if EQUIPMENT_POISONS_JSON.exists() and EQUIPMENT_POISONS_JSON.stat().st_size > 0:
        data = json.loads(EQUIPMENT_POISONS_JSON.read_text(encoding="utf-8"))
    else:
        data = {"pagesByCategory": {"Equipment": {}}}
    equipment = data["pagesByCategory"]["Equipment"]

    for p in poisons:
        name = p.pop("name")
        equipment[name] = p

    EQUIPMENT_POISONS_JSON.parent.mkdir(parents=True, exist_ok=True)
    EQUIPMENT_POISONS_JSON.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"Wrote {len(poisons)} poisons to equipment_poisons.json")


if __name__ == "__main__":
    main()
