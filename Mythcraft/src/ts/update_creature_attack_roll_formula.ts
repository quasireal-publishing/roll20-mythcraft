const getCreatureAttackRollFormula = (
  isAttack: boolean = false,
  options: {
    includeDamage?: boolean;
    includeDefense?: boolean;
    includeDice?: boolean;
    includeEffect?: boolean;
  } = {
    includeDamage: true,
    includeDefense: true,
    includeDice: true,
    includeEffect: true,
  }
) => {
  const dice = "{{dice=[[1d20+(@{modifier})+(?{TA/TD|0}[tactical bonus])]]}}";
  const defense = "{{action=@{range} @{type}. @{modifier} vs @{defense} }}";
  const damage = "{{damage=[Damage](~repeating_actions-roll_damage)}}";
  const effect = "{{effect=[Effect](~repeating_actions-roll_effect)}}";
  const description = "{{description=@{description}}}";

  if (isAttack) {
    //build the string based on the options that are true
    let formula = "";

    if (options.includeDice) {
      formula += `${dice}`;
    }
    if (options.includeDefense) {
      formula += ` ${defense}`;
    }
    if (options.includeDamage) {
      formula += ` ${damage}`;
    }
    if (options.includeEffect) {
      formula += ` ${effect}`;
    }
    return formula.trim();
  }

  return description;
};

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
