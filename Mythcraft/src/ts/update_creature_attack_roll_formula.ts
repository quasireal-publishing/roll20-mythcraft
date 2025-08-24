const updateCreatureAttackRollFormula = (event: EventInfo) => {
  const { sourceAttribute, newValue, sourceType } = event;

  if (sourceType !== "player") {
    return;
  }

  const row = getFieldsetRow(sourceAttribute);
  const isAttack = newValue === "on";

  console.table({
    row,
    newValue,
  });

  if (isAttack) {
    const update = {
      [`${row}_roll_formula`]:
        "{{dice=[[1d20+${tactical}]]}} {{action=Reach @{reach} @{type}. @{bonus} }} {{damage=[Damage](~repeating_actions-roll_damage)}}",
    };
    setAttrs(update);
    return;
  }

  setAttrs({
    [`${row}_roll_formula`]: "{{description=@{description}}}",
  });
};
