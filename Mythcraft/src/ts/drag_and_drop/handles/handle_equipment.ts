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
              expansion: page.data.expansion,
            },
          },
          extraAttackRow,
          undefined,
        );
      });
    }

    if (page.data.reactive_actions) {
      const reactiveActions = getReactiveActions(page);
      Object.assign(update, reactiveActions);
    }
  }

  if (page.data.modifiers) {
    handle_modifiers(page, row);
  }

  if (page.data.trackables) {
    const trackables = getTrackables(page);
    Object.assign(update, trackables);
  }

  if (page.data.favorites) {
    const favorites = getFavorites(page);
    Object.assign(update, favorites);
  }

  const linksString = links.join(",");
  update[`${row}_link`] = linksString;

  setDropAttrs(update);
};
