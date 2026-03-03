const handle_modifiers = (page: CompendiumAttributes, inventoryRow: string) => {
  const modifiers = parseJSON(page.data.modifiers);
  const update: { [key: string]: AttrValue } = {};

  modifiers.forEach((modifier: { [key: string]: string }) => {
    if (modifier.modifier) {
      const newRow = getRow("modifiers");
      update[`${newRow}_link`] = inventoryRow;
      update[`${newRow}_modifier`] = modifier.modifier;
      update[`${newRow}_source`] = page.name;
      update[`${newRow}_toggle_active`] = "on";
      update[`${newRow}_attribute`] = modifier.attribute;
      update[`${newRow}_description`] = modifier.description ?? "";
      update[`${newRow}_toggle_edit`] = false;
    } else {
      console.warn(`Modifier ${modifier.attribute} has no modifier value`);
    }
  });

  setDropAttrs(update, { silent: false });
};
