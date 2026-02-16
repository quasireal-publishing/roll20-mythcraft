const updateCreatureAttackRollFormula = (event: EventInfo) => {
  const { sourceAttribute, newValue, sourceType } = event;

  if (sourceType !== "player") {
    return;
  }
  const row = getFieldsetRow(sourceAttribute);
  const isAttack = newValue === "on";

  if (!isAttack) {
    setAttrs({
      [`${row}_roll_formula`]: getCreatureAttackRollFormula(false),
    });
    return;
  }

  getAttrs([`${row}_damage`], (values) => {
    const hasDamage = values[`${row}_damage`];

    const attackRollFormula = getCreatureAttackRollFormula(true, {
      includeDice: true,
      includeDefense: true,
      includeDamage: !!hasDamage,
    });

    setAttrs({
      [`${row}_roll_formula`]: attackRollFormula,
    });
  });
};
