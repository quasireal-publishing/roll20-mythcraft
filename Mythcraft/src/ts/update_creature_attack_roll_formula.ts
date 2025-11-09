const getCreatureAttackRollFormula = (isAttack: boolean) => {
  if (isAttack) {
    return "{{dice=[[1d20+(@{bonus})+(?{TA/TD|0}[tactical bonus])]]}} {{action=@{range} @{type}. @{bonus} vs @{defense} }} {{damage=[Damage](~repeating_actions-roll_damage)}}";
  }

  return "{{description=@{description}}}";
};

const updateCreatureAttackRollFormula = (event: EventInfo) => {
  const { sourceAttribute, newValue, sourceType } = event;

  if (sourceType !== "player") {
    return;
  }
  const row = getFieldsetRow(sourceAttribute);
  const isAttack = newValue === "on";
  const attackRollFormula = getCreatureAttackRollFormula(isAttack);

  setAttrs({
    [`${row}_roll_formula`]: attackRollFormula,
  });
};
