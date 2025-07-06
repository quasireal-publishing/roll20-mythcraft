const handle_talent = (page: CompendiumAttributes) => {
  const attrs = ["name", "description", "level", "prerequisites"];
  const row = getRow("talents");
  const update = getUpdate(attrs, page, row);

  update[`${row}_tags`] = `${page.data.stack}, ${page.data.track}`;

  if (page.data.reactive) {
    const reactiveRow = getRow("reactive-actions");
    const reactiveAttrs = ["name", "description", "ap"];
    const reactiveUpdate = getUpdate(reactiveAttrs, page, reactiveRow);

    Object.assign(update, reactiveUpdate);

    update[`${reactiveRow}_toggle_edit`] = false;
    update[`${reactiveRow}_link`] = row;
    update[`${row}_link`] = reactiveRow;
  }

  setDropAttrs(update);
};
