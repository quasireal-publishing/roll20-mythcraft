const versionOneOne = () => {
  const fieldsToUpdate = ["repeating_attacks", "repeating_skills"];
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

  getAttrs(["awareness", "initiative_bonus"], (v) => {
    setAttrs({ initiative: v.initiative_bonus + v.awareness });
  });
};
