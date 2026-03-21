const handle_equipment = (page: CompendiumAttributes) => {
  const attrs = ["name", "description", "cost", "tags"];
  const row = getRow("inventory");
  const update = getUpdate(attrs, page, row);

  update[`${row}_qty`] = page.data.quantity ? page.data.quantity : 1;

  const links = [];

  if (page.data.subcategory === "weapon") {
    const attackRow = getRow("attacks");
    links.push(attackRow);
    handle_weapon(page, attackRow, row);
  }

  if (page.data.modifiers) {
    handle_modifiers(page, row);
  }

  if (page.data.trackables) {
    handle_trackables(page, row);
  }

  const linksString = links.join(",");
  update[`${row}_link`] = linksString;

  setDropAttrs(update);
};
