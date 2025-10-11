const handle_creature = (page: CompendiumAttributes) => {
  //This will only handle top level attributes, not repeating sections (arrays with objects)
  //Add more attributes as needed.
  const attrs = [
    "name",
    "description",
    "level",
    "size",
    "strength",
    "dexterity",
    "endurance",
    "awareness",
    "intellect",
    "charisma",
    "reflexes",
    "fortitude",
    "anticipation",
    "logic",
    "willpower",
    "hit_points",
    "armor_rating",
    "speed",
    "dr",
    "senses",
    "action_description",
    "resist",
    "immune",
    "vulnerable",
    "traits",
  ];
  const update = getUpdate(attrs, page);

  update.character_name = page.name;

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

  update.sheet_type = "creature";
  update.creature_sections = creature_sections.join(",");
  update.toggle_creature_setting = false;
  update.toggle_edit_creature_edit = false;

  try {
    setAttrs(update, { silent: true });
  } catch (e) {
    dropWarning(`Error setting attributes for ${page.name}: ${e}`);
  }
};
