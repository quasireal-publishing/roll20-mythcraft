const handle_trackables = (page: CompendiumAttributes, row: string) => {
  const attrs = ["name", "value"];
  const JSON = parseJSON(page.data.trackables);
  const update: { [key: string]: AttrValue } = {};

  JSON.forEach((trackable: { [key: string]: string }) => {
    const newRow = getRow("trackables");
    update[`${newRow}_name`] = `${page.name} ${trackable.name}`;
    update[`${newRow}_value`] = trackable.value;
    update[`${newRow}_value_max`] = trackable.value;
  });

  setDropAttrs(update);
};
