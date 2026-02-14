#!/usr/bin/env python3
"""
Parse Chapter 10 - Creatures.html and write each creature to creatures_chapter_10.json.

Structure follows creature_vampire.json: string fields + features/actions/reactions as
arrays of objects. Adds content key with the full HTML between this creature's h2 and the next.
"""

import re
import json
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
CREATURES_HTML = WORKSPACE / "html" / "Chapter 10 - Creatures.html"
CREATURES_JSON = WORKSPACE / "json" / "creatures_chapter_10.json"


def strip_html(html: str) -> str:
    text = re.sub(r"<br\s*/?>", " ", html, flags=re.IGNORECASE)
    text = re.sub(r"&nbsp;", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_creatures(html: str) -> list[dict]:
    # Split only on <h2>...</h2> so we get [before, name1, block1, name2, block2, ...]
    parts = re.split(
        r"<h2[^>]*>\s*<b[^>]*>\s*([^<]+?)\s*</b>\s*</h2>",
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    creatures = []
    for i in range(1, len(parts), 2):
        if i + 1 >= len(parts):
            break
        name_raw = parts[i].strip().replace("\n", " ").strip()
        if not name_raw:
            continue
        block = parts[i + 1]
        # Stop at next h2
        block = re.sub(r"\s*<h2[^>]*>.*", "", block, flags=re.DOTALL | re.IGNORECASE)
        block = block.strip()

        # Skip non-creature sections (e.g. RESOLUTION)
        if "Monster Level" not in block and "Hit Points" not in block:
            continue

        name = name_raw.title()
        content = block

        # Level: <p><em>Monster Level: N</em></p>
        level_m = re.search(r"<p>\s*<em>\s*Monster Level:\s*(\d+)\s*</em>\s*</p>", block, re.IGNORECASE)
        level = level_m.group(1) if level_m else ""

        # Size/tags: second <p><em>...</em></p> (first is Monster Level)
        size_ems = re.findall(r"<p>\s*<em>\s*([^<]+?)\s*</em>\s*</p>", block, re.IGNORECASE)
        size_tags = strip_html(size_ems[1]) if len(size_ems) > 1 else ""
        size = ""
        tags = ""
        if size_tags:
            parts_st = size_tags.split(".", 1)
            size = parts_st[0].strip() if parts_st else ""
            tags = parts_st[1].strip() if len(parts_st) > 1 else ""

        # Stats from table: <td><b>STR<br /></b>-1 or <b>INT</b>...<p>2</p>, and Ref: 13 in <p>
        def table_stat(attr: str) -> str:
            m = re.search(
                rf"<td>\s*<b>\s*{re.escape(attr)}(?:\s*<br\s*/?>)?\s*</b>\s*([-\d]+)",
                block,
                re.IGNORECASE,
            )
            if m:
                return m.group(1).strip()
            m = re.search(
                rf"<td>\s*<b>\s*{re.escape(attr)}\s*</b>[\s\S]*?<p>\s*([-\d]+)\s*</p>",
                block,
                re.IGNORECASE,
            )
            return m.group(1).strip() if m else ""

        def table_defense(attr: str) -> str:
            m = re.search(rf"<p>\s*{re.escape(attr)}:\s*(\d+)\s*</p>", block, re.IGNORECASE)
            return m.group(1) if m else ""

        strength = table_stat("STR")
        dexterity = table_stat("DEX")
        endurance = table_stat("END")
        awareness = table_stat("AWR")
        intellect = table_stat("INT")
        charisma = table_stat("CHA")
        reflexes = table_defense("Ref")
        fortitude = table_defense("Fort")
        anticipation = table_defense("Ant")
        logic = table_defense("Log")
        willpower = table_defense("Will")

        # Hit Points, Armor Rating, Speed
        hp_m = re.search(r"<b>\s*Hit Points\s*</b>\s*(\d+)", block, re.IGNORECASE)
        ar_m = re.search(r"<b>\s*Armor Rating\s*</b>\s*(\d+)", block, re.IGNORECASE)
        speed_m = re.search(r"<b>\s*Speed\s*</b>\s*([^<]+?)(?:<br|</p>)", block, re.IGNORECASE)
        hp = hp_m.group(1) if hp_m else ""
        armor_rating = ar_m.group(1) if ar_m else ""
        speed = strip_html(speed_m.group(1)) if speed_m else ""

        def p_bold(label: str) -> str:
            m = re.search(
                rf"<p>\s*<b>\s*{re.escape(label)}\s*</b>\s*([^<]*(?:<[^/][^>]*>[^<]*)*)\s*</p>",
                block,
                re.IGNORECASE,
            )
            return strip_html(m.group(1)) if m else ""

        immune = p_bold("Immune")
        vulnerable = p_bold("Vulnerable")
        resist = p_bold("Resist")
        dr = p_bold("DR")
        senses = p_bold("Senses")
        traits = p_bold("Traits")
        skills = p_bold("Skills")

        # Action description: paragraph after ACTIONS that is italic (turn description)
        action_desc_m = re.search(
            r"<p>\s*ACTIONS\s*</p>[\s\S]*?<p>\s*<em>([\s\S]*?)</em>\s*</p>",
            block,
            re.IGNORECASE,
        )
        action_description = strip_html(action_desc_m.group(1)) if action_desc_m else ""

        # Features: between FEATURES and ACTIONS, each <p><b>Name. </b>desc</p>
        features = []
        feat_section = re.search(
            r"<p>\s*FEATURES?\s*</p>([\s\S]*?)<p>\s*ACTIONS?\s*</p>",
            block,
            re.IGNORECASE,
        )
        if feat_section:
            feat_text = feat_section.group(1)
            for m in re.finditer(r"<p>\s*<b>\s*([^<]+?)\s*\.\s*</b>\s*([\s\S]*?)\s*</p>", feat_text, re.IGNORECASE):
                features.append({
                    "name": strip_html(m.group(1)),
                    "description": strip_html(m.group(2)),
                })

        # Actions: between ACTIONS and REACTIONS (or next h2 if no REACTIONS)
        actions = []
        act_section = re.search(
            r"<p>\s*ACTIONS?\s*</p>([\s\S]*?)(?:<p>\s*REACTIONS\s*</p>|<h2[^>]*>)",
            block,
            re.IGNORECASE,
        )
        if act_section:
            act_text = act_section.group(1)
            for m in re.finditer(r"<p>\s*<b>\s*([^<]+?)\s*\.\s*</b>\s*([\s\S]*?)\s*</p>", act_text, re.IGNORECASE):
                action_name = strip_html(m.group(1))
                inner = m.group(2)
                effect = strip_html(inner)
                obj = {"name": action_name, "effect": effect}
                # Optional: range, type, modifier, defense, damage, damage_type
                type_m = re.search(r"<em>\s*([^<]+?)\s*</em>", inner, re.IGNORECASE)
                if type_m:
                    obj["type"] = strip_html(type_m.group(1))
                hit_m = re.search(r"<b>\s*Hit:\s*</b>\s*([^<]+)", inner, re.IGNORECASE)
                if hit_m:
                    obj["damage"] = strip_html(hit_m.group(1))
                vs_m = re.search(r"\+\d+\s+vs\s+([^.<]+)", inner, re.IGNORECASE)
                if vs_m:
                    obj["defense"] = strip_html(vs_m.group(1))
                    mod_m = re.search(r"\+(\d+)\s+vs", inner)
                    if mod_m:
                        obj["modifier"] = mod_m.group(1)
                range_m = re.search(r"(?:Ranged|Reach|Thrown)\s+\d+\s*ft", inner, re.IGNORECASE)
                if range_m:
                    obj["range"] = strip_html(range_m.group(0))
                actions.append(obj)

        # Reactions: after REACTIONS until next <p>ALL CAPS</p> or end
        reactions = []
        react_section = re.search(
            r"<p>\s*REACTIONS\s*</p>([\s\S]*)",
            block,
            re.IGNORECASE,
        )
        if react_section:
            react_text = react_section.group(1)
            react_text = re.sub(r"<h2[^>]*>.*", "", react_text, flags=re.DOTALL | re.IGNORECASE)
            for m in re.finditer(r"<p>\s*<b>\s*([^<]+?)\s*\.\s*</b>\s*([\s\S]*?)\s*</p>", react_text, re.IGNORECASE):
                reactions.append({
                    "name": strip_html(m.group(1)),
                    "description": strip_html(m.group(2)),
                })

        creature = {
            "name": name,
            "description": "",
            "category": "Creatures",
            "level": level,
            "size": size,
            "tags": tags,
            "token": "",
            "hp": hp,
            "armor_rating": armor_rating,
            "dr": dr,
            "immune": immune,
            "resist": resist,
            "vulnerable": vulnerable,
            "speed": speed,
            "senses": senses,
            "traits": traits,
            "strength": strength,
            "dexterity": dexterity,
            "endurance": endurance,
            "anticipation": anticipation,
            "reflexes": reflexes,
            "awareness": awareness,
            "intellect": intellect,
            "logic": logic,
            "willpower": willpower,
            "charisma": charisma,
            "fortitude": fortitude,
            "action_description": action_description,
            "features": features,
            "actions": actions,
            "reactions": reactions,
            "content": content,
        }
        if skills:
            creature["skills"] = skills
        creatures.append(creature)
    return creatures


def main():
    if not CREATURES_HTML.exists():
        print(f"Error: {CREATURES_HTML} not found.", file=__import__("sys").stderr)
        raise SystemExit(1)

    html = CREATURES_HTML.read_text(encoding="utf-8")
    creature_list = extract_creatures(html)
    if not creature_list:
        print("Error: No creatures extracted.", file=__import__("sys").stderr)
        raise SystemExit(1)

    data = {"pagesByCategory": {"Creatures": {}}}
    for c in creature_list:
        name = c.pop("name")
        data["pagesByCategory"]["Creatures"][name] = c

    CREATURES_JSON.parent.mkdir(parents=True, exist_ok=True)
    CREATURES_JSON.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"Wrote {len(creature_list)} creatures to {CREATURES_JSON.name}")


if __name__ == "__main__":
    main()
