const processSection = (page: CompendiumAttributes, list: string[]) => {
  const update: Record<string, AttrValue> = {};
  const sections: string[] = [];

  list.forEach((section) => {
    const sectionData = page.data[section];
    if (sectionData && isDataArray(sectionData)) {
      sections.push(section);

      const processed = processDataArrays(sectionData, (data) => {
        return getUpdate(Object.keys(data), data, getRow(section));
      });

      Object.assign(update, processed);
    }
  });

  update.npc_sections = sections.join(",");

  sections.forEach((section) => {
    update[`section_${section}`] = "on";
  });

  return update;
};
