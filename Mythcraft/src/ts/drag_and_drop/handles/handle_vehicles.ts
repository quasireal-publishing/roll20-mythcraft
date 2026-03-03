const handle_vehicles = (page: CompendiumAttributes) => {
  const attrs = [
    "range",
    "ammunition",
    "reload",
    "area_of_effect",
    "helf",
    "speed",
    "hp",
    "armor_rating",
    "reflexes",
    "fortitude",
    "resist",
    "immune",
    "vulnerable",
    "damage_reduction",
    "damage_threshold",
    "action_description",
  ];

  const update = getUpdate(attrs, page);

  update.sheet_type = "siege";
  update.toggle_npc_setting = false;
  update.toggle_edit_npc_edit = false;
  update.npc_sections = "actions";
  update.section_actions = "on";

  const sections = processSection(page, ["actions"]);
  Object.assign(update, sections);

  const attackUpdate = processSkillsAndAttack(update);
  Object.assign(update, attackUpdate);

  //- Siege Tower has no actions but has a description
  if (update.action_description) {
    update["section_actions"] = "on";

    if (!update.npc_sections.includes("actions")) {
      update.npc_sections = `${update.npc_sections},actions`;
    }
  }

  setDropAttrs(update, { silent: true });

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
