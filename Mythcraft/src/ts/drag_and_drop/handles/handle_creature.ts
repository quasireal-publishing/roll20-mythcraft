const handle_creature = (page: CompendiumAttributes) => {
  console.log(`%c Creature Drop for ${page.name}`, "color: orange;");

  const attrs = [
    "action_description",
    "anticipation",
    "armor_rating",
    "awareness",
    "charisma",
    "description",
    "dexterity",
    "damage_reduction",
    "damage_threshold",
    "endurance",
    "fortitude",
    "hp",
    "immune",
    "intellect",
    "level",
    "logic",
    "name",
    "reflexes",
    "resist",
    "senses",
    "size",
    "speed",
    "strength",
    "tags",
    "traits",
    "vulnerable",
    "willpower",
  ];
  const update = getUpdate(attrs, page);

  update.character_name = page.name;
  update.sheet_type = "creature";
  update.toggle_npc_setting = false;
  update.toggle_edit_npc_edit = false;

  const sections = processSection(page, [
    "skills",
    "features",
    "actions",
    "reactions",
    "spells",
  ]);
  Object.assign(update, sections);

  //Skills & Attacks need special handling for attribute abbreviations and roll formulas
  const attackUpdate = processSkillsAndAttack(update);
  Object.assign(update, attackUpdate);

  update.hp_max = update.hp || 0;

  //Familiars do not have the derived attributes so the sheetworkers need to calculate them
  const hasDefenses = defenses.some((attr) => page.data[attr]);
  const silent = hasDefenses ? true : false;

  console.table(update);

  setDropAttrs(update, { silent });

  //update token defaults
  const hp = typeof update.hp === "boolean" ? 0 : update.hp;
  const armorRating =
    typeof update.armor_rating === "boolean" ? 0 : update.armor_rating;

  const tokenDefaults = {
    bar1_value: hp,
    bar1_max: hp,
    bar2_value: armorRating,
  };

  updateDefaultToken(tokenDefaults, page.data["size"]);
};
