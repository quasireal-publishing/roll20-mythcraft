const versionOneSeven = () => {
  getAttrs(["creature_sections"], (values) => {
    setAttrs({ npc_sections: values.creature_sections });
  });
};
