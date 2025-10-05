on("sheet:opened", () => {
  // setAttrs({ latest_versioning_upgrade: 3.2 }); //used for testing versioning
  getAttrs(["version"], (v) => {
    versioning(parseFloat(v.version) || 1);
  });
});

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

const versioning = async (version: number) => {
  const updateMessage = (v: number) =>
    console.log(
      `%c Sheet is updating to ${v}`,
      "color: orange; font-weight:bold"
    );

  switch (true) {
    case version < 1:
      versioning(1);
      updateMessage(1);
      break;
    case version < 1.1:
      updateMessage(1.1);
      versionOneOne();
      versioning(1.1);
      break;
    case version < 1.2:
      updateMessage(1.2);
      versionOneTwo();
      versioning(1.2);
      break;
    default:
      console.log(
        `%c Sheet is update to date.`,
        "color: green; font-weight:bold"
      );
      setAttrs({ version });
  }
};
