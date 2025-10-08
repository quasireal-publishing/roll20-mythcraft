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
    //Array attrs
    "resist",
    "immune",
    "vulnerable",
    "traits"
  ];
  const update = getUpdate(attrs, page);

  update["character_name"] = page.name;

  if (page.data.skills && Array.isArray(page.data.skills)) {
    page.data.skills.forEach(
      (skill: { name: string; attribute: string; bonus: string }) => {
        const skillRow = getRow("skills");
        update[`${skillRow}_name`] = skill.name;
        update[`${skillRow}_attribue`] = skill.attribute;
        update[`${skillRow}_bonus`] = skill.bonus;
      }
    )
  }
  if (page.data.features && Array.isArray(page.data.features)) {
    page.data.features.forEach(
      (feature: { name: string; description: string }) => {
        const featureRow = getRow("features");
        update[`${featureRow}_name`] = feature.name;
        update[`${featureRow}_description`] = feature.description;
      }
    );
  }
  if (page.data.actions && Array.isArray(page.data.actions)) {
    page.data.actions.forEach(
      (action: { name: string; range: string; type: string; bonus: string; defense: string; description: string }) => {
        const actionRow = getRow("actions");
        update[`${actionRow}_name`] = action.name;
        update[`${actionRow}_range`] = action.range;
        update[`${actionRow}_type`] = action.type;
        update[`${actionRow}_bonus`] = action.bonus;
        update[`${actionRow}_defense`] = action.defense;
        update[`${actionRow}_description`] = action.description;
      }
    )
  }

  try {
    setAttrs(update, { silent: true });
  } catch (e) {
    dropWarning(`Error setting attributes for ${page.name}: ${e}`);
  }
};
