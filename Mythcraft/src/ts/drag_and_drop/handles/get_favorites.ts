const getFavorites = (page: CompendiumAttributes) => {
  const JSON = parseJSON(page.data.favorites);
  let update: { [key: string]: AttrValue } = {};

  JSON.forEach((e: { [key: string]: string }) => {
    const row = getRow("favorites");
    update[`${row}_name`] = `${e.name}`;
    update[`${row}_description`] = e.description;
    update[`${row}_tags`] = e.tags;
    update[`${row}_toggle_edit`] = false;
  });

  return update;
};
