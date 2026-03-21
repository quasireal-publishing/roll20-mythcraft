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

    if (page.data.extra_attacks) {
      const extraAttacks = parseJSON(page.data.extra_attacks);
      extraAttacks.forEach((e: { [key: string]: string }) => {
        const extraAttackRow = getRow("attacks");
        handle_weapon(
          {
            ...page,
            name: e.name,
            data: {
              ...e,
              Category: page.data.Category,
              blobs: undefined,
              expansion: page.data.expansion,
            },
          },
          extraAttackRow,
          undefined,
        );
      });
    }
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
