const versionOneTwo = () => {
  getAttrs(["initiative_bonus"], (v) => {
    const parsedInt = parseInt(v.initiative_bonus || "0", 10);

    if (parsedInt > 0) {
      const newRowId = generateRowID();
      const row = `repeating_modifiers_${newRowId}`;
      setAttrs({
        [`${row}_attribute`]: "initiative",
        [`${row}_modifier`]: v.initiative_bonus || "0",
        [`${row}_toggle_active`]: "on",
        [`${row}_source`]: "version 1.2",
        [`${row}_toggle_edit`]: false,
        [`${row}_description`]:
          "Migrated from initiative bonus input in combat tab.",
      });
    }
  });
};
