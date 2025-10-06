const handle_creature = (page: CompendiumAttributes) => {
  //Add more attributes as needed. This will only handle top level attributes, not repeating sections (arrays with objects)
  const attrs = ["awareness", "charisma"];
  const update = getUpdate(attrs, page);

  update["character_name"] = page.name;

  //Write a repeating sections (arrays with objects) similar to this.
  if (page.data.features && Array.isArray(page.data.features)) {
    page.data.features.forEach(
      (feature: { name: string; description: string }) => {
        const featureRow = getRow("features");
        update[`${featureRow}_name`] = feature.name;
        update[`${featureRow}_description`] = feature.description;
      }
    );
  }

  try {
    setAttrs(update, { silent: true });
  } catch (e) {
    dropWarning(`Error setting attributes: ${e}`);
  }
};
