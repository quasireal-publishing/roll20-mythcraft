const processSkillsAndAttack = (updateAttrs: Record<string, AttrValue>) => {
  const update: Record<string, AttrValue> = {};

  Object.entries({ ...updateAttrs }).forEach(([key, value]) => {
    const row = getFieldsetRow(key);

    if (key.endsWith("_defense")) {
      update[`${row}_toggle_action_attack`] = "on";

      update[`${row}_roll_formula`] = getCreatureAttackRollFormula(true, {
        includeDice: true,
        includeDefense: !!update[`${row}_defense`],
        includeDamage: !!update[`${row}_damage`],
        includeEffect: !!update[`${row}_effect`],
      });
      return;
    }

    if (key.endsWith("_modifier")) {
      const int = parseInteger(`${value}`);
      update[`${row}_modifier`] = int > 0 ? `+${int}` : `${value}`;
    }

    if (key.endsWith("_attribute")) {
      update[`${row}_attribute`] = `@{${value}}`;

      const abbr = getAttributeAbbreviation(`${value}`);
      update[`${row}_attribute_abbreviation`] = `(${abbr})`;
      return;
    }
  });

  return update;
};
