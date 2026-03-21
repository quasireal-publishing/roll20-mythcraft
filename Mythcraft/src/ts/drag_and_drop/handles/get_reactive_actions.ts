const getReactiveActions = (page: CompendiumAttributes) => {
  const JSON = parseJSON(page.data.reactive_actions);
  let update: { [key: string]: AttrValue } = {};

  JSON.forEach((action: { [key: string]: string }) => {
    const row = getRow("reactive-actions");
    update[`${row}_name`] = `${action.name}`;
    update[`${row}_description`] = action.description;
    update[`${row}_ap`] = action.ap;
    update[`${row}_toggle_edit`] = false;
  });

  return update;
};
