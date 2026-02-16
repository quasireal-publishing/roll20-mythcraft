const versionOneThree = () => {
  const fieldsToUpdate = ["repeating_actions"];
  fieldsToUpdate.forEach((fieldset) => {
    getSectionIDs(fieldset, (ids) => {
      const bonuses = ids.map((id) => `${fieldset}_${id}_bonus`);
      getAttrs(bonuses, (values) => {
        const updates: Attrs = {};
        bonuses.forEach((bonus) => {
          const modifier = bonus.replace("bonus", "modifier");
          updates[modifier] = values[bonus] || "0";
        });
        setAttrs(updates);
      });
    });
  });
};
