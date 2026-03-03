const handle_modifiers = (page: CompendiumAttributes, inventoryRow: string) => {
  const modifiers = parseJSON(page.data.modifiers);
  const update: { [key: string]: string | number | boolean } = {};

  modifiers.forEach((modifier: { [key: string]: string }) => {
    if (modifier.modifier) {
      const modifiersRow = getRow("modifiers");
      update[`${modifiersRow}_link`] = inventoryRow;
      update[`${modifiersRow}_modifier`] = modifier.modifier;
      update[`${modifiersRow}_source`] = page.name;
      update[`${modifiersRow}_toggle_active`] = "on";
      update[`${modifiersRow}_attribute`] = modifier.attribute;
      update[`${modifiersRow}_description`] = modifier.description ?? "";
      update[`${modifiersRow}_toggle_edit`] = false;
    } else {
      console.warn(`Modifier ${modifier.attribute} has no modifier value`);
    }
  });

  setDropAttrs(update, { silent: false });
};
