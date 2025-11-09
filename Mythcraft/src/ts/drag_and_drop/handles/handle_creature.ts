const handle_creature = (page: CompendiumAttributes) => {
  //This will only handle top level attributes, not repeating sections (arrays with objects)
  //Add more attributes as needed.
  const attrs = [
    "action_description",
    "anticipation",
    "armor_rating",
    "awareness",
    "charisma",
    "description",
    "dexterity",
    "dr",
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
  update.toggle_creature_setting = false;
  update.toggle_edit_creature_edit = false;

  const creature_sections: string[] = [];

  const isDataArray = (data: unknown): data is string | string[] =>
    Array.isArray(data) || (typeof data === "string" && data.startsWith("["));

  const sections = ["skills", "features", "actions", "reactions", "spells"];

  sections.forEach((section) => {
    const sectionData = page.data[section];
    if (sectionData && isDataArray(sectionData)) {
      creature_sections.push(section);

      const processed = processDataArrays(sectionData, (data) => {
        return getUpdate(Object.keys(data), data, getRow(section));
      });

      Object.assign(update, processed);
    }
  });

  update.creature_sections = creature_sections.join(",");

  console.log(`%c Creature Drop for ${page.name}`, "color: orange;");

  //Attacks need special handling
  const attackActions: string[] = [];
  Object.keys(update).forEach((key) => {
    if (
      key.startsWith("repeating_actions_") &&
      (key.endsWith("_damage") ||
        key.endsWith("_damage_average") ||
        key.endsWith("_modifier"))
    ) {
      const repeatingRow = getFieldsetRow(key);
      !attackActions.includes(repeatingRow) && attackActions.push(repeatingRow);
    }
  });

  //Attacks need toggle_action_attack and roll template for attacks
  attackActions.forEach((row) => {
    update[`${row}_toggle_action_attack`] = "on";
    update[`${row}_roll_formula`] = getCreatureAttackRollFormula(true);
  });

  Object.entries(update).forEach(([key, value]) => {
    const repeatingRow = getFieldsetRow(key);

    if (key.startsWith("repeating_skills_") && key.endsWith("_attribute")) {
      update[`${repeatingRow}_attribute`] = `@{${value}}`;
      update[`${repeatingRow}_attribute_abbreviation`] =
        getAttributeAbbreviation(`${value}`);

      if (typeof value === "string" && attributes.includes(value)) {
        const numbers = [
          page.data[value],
          page.data[`${repeatingRow}_modifier`],
        ];
        const ints = numbers.map((attr) => parseInteger(`${attr ?? "0"}`));
        const sum = sumIntegers(ints);
        update[`${repeatingRow}_bonus`] = sum > 0 ? `+${sum}` : `${sum}`;
      }
    }

    if (key.startsWith("repeating_skills_") && key.endsWith("_modifier")) {
      const int = parseInteger(`${value ?? "0"}`);
      update[`${repeatingRow}_modifier`] = int > 0 ? `+${int}` : `${int}`;
    }
  });

  //Familiars do not have the derived attributes so the sheetworkers need to calculate them
  const hasDefenses = defenses.some((attr) => page.data[attr]);
  const silent = hasDefenses ? true : false;

  console.log(update);

  try {
    setAttrs(update, { silent });
  } catch (e) {
    dropWarning(`Error setting attributes for ${page.name}: ${e}`);
  }
};
