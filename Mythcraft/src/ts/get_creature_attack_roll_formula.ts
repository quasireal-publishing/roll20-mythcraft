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
