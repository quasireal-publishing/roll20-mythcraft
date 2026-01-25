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

  //Skills & Attacks need special handling
  Object.entries({ ...update }).forEach(([key, value]) => {
    const row = getFieldsetRow(key);

    if (key.endsWith("_defense")) {
      update[`${row}_toggle_action_attack`] = "on";

      update[`${row}_roll_formula`] = getCreatureAttackRollFormula(true, {
        includeDice: true,
        includeDefense: !!update[`${row}_defense`],
        includeDamage: !!update[`${row}_damage`],
        includeEffect: !!update[`${row}_effect`],
      });
      return;
    }

    if (key.endsWith("_modifier")) {
      const int = parseInteger(`${value}`);
      update[`${row}_modifier`] = int > 0 ? `+${int}` : `${value}`;
    }

    if (key.endsWith("_attribute")) {
      update[`${row}_attribute`] = `@{${value}}`;

      const abbr = getAttributeAbbreviation(`${value}`);
      update[`${row}_attribute_abbreviation`] = `(${abbr})`;
      return;
    }
  });

  update.hp_max = update.hp || 0;

  //Familiars do not have the derived attributes so the sheetworkers need to calculate them
  const hasDefenses = defenses.some((attr) => page.data[attr]);
  const silent = hasDefenses ? true : false;

  setDropAttrs(update, { silent });

  //update token defaults
  const hp = typeof update.hp === "boolean" ? 0 : update.hp;
  const armorRating =
    typeof update.armor_rating === "boolean" ? 0 : update.armor_rating;

  const tokenDefaults = {
    bar1_value: hp,
    bar1_max: hp,
    bar2_value: armorRating,
    height: 70,
    width: 70,
  };

  if (page.data["size"]) {
    const sizeMap: { [key: string]: number } = {
      fine: 20,
      diminutive: 28,
      tiny: 35,
      small: 50,
      medium: 70,
      large: 105,
      huge: 140,
      gargantuan: 210,
      colossal: 280,
      titan: 350,
    };

    const sizeKey = Object.keys(sizeMap).find((key) =>
      page.data["size"].toLowerCase().includes(key)
    );
    const sizeValue = sizeKey ? sizeMap[sizeKey] : undefined;
    if (sizeValue) {
      tokenDefaults.width = sizeValue;
      tokenDefaults.height = sizeValue;
    }
  }

  Object.entries(tokenDefaults).forEach(([key, value]) => {
    if (typeof value === "boolean") {
      console.warn(
        `Token default ${key} is a boolean. Setting to 0.`,
        "color: orange; font-weight:bold"
      );
    }
  });

  setDefaultToken(tokenDefaults);
};
