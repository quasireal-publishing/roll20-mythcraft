const getUpdate = (
  attrs: string[],
  page: CompendiumAttributes | Partial<CompendiumAttributes>,
  repeatingRow?: string,
) => {
  let update: { [key: string]: AttrValue } = {};

  attrs.forEach((attr) => {
    const sheetAttr = repeatingRow ? `${repeatingRow}_${attr}` : attr;

    const pageValue = (page as Record<string, unknown>)[attr];
    const dataValue = (page.data as Record<string, unknown>)?.[attr];

    if (pageValue === undefined && dataValue === undefined) {
      return;
    }

    update[sheetAttr] = roll20Attribute(
      attr,
      (pageValue as AttrValue) ?? (dataValue as AttrValue),
    );
  });

  if (repeatingRow) {
    update[`${repeatingRow}_toggle_edit`] = false;
  }

  return update;
};
