const addSpellAttack = (row: string, page: CompendiumAttributes) => {
  const attackRow = getRow("attacks");
  const attackAttr = [
    "name",
    "damage",
    "damage_type",
    "range",
    "tags",
    "apc",
    "description",
  ];
  const updateAttack = getUpdate(attackAttr, page, attackRow);
  updateAttack[`${attackRow}_link`] = row;

  getAttrs(
    ["spellcasting_ability", "primary_source"],
    ({ spellcasting_ability, primary_source }) => {
      updateAttack[`${attackRow}_attribute`] = spellcasting_ability;
      updateAttack[`${attackRow}_attribute_abbreviation`] =
        getAttributeAbbreviation(spellcasting_ability);

      const rollFormula = getRollFormula(
        primary_source === page.data.source.toString().toLowerCase()
      );

      updateAttack[`${attackRow}_roll_formula`] = rollFormula;
      updateAttack[`${row}_roll_formula`] = rollFormula;

      setDropAttrs(updateAttack);
    }
  );

  return attackRow;
};
