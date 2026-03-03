const versionOneSeven = () => {
  getAttrs(["creature_sections", "dr", "dt"], (values) => {
    setAttrs({
      npc_sections: values.creature_sections,
      damage_reduction: values.dr,
      damage_threshold: values.dt,
    });
  });
};
