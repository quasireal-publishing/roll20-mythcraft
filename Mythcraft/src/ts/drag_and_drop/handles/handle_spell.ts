const getRollFormula = (isPrimarySource: boolean, isSpellCard?: boolean) => {
  if (isSpellCard) {
    return "{{description=@{description}}}";
  }

  let abilityModifier = "@{spellcasting_ability}";

  if (!isPrimarySource) {
    abilityModifier = `ceil(${abilityModifier}/2)`;
  }

  return `{{dice=[[1d20+${abilityModifier}[ability]+(@{bonus}[bonus])+(?{TA/TD|0})[tactical bonus]+(@{luck_negative_modifier}[negative luck modifier])cs>@{critical_range}]]}} {{damage=[Damage](~repeating_spells-roll_damage)}} {{description=@{description}}}`;
};

const handle_spell = (page: CompendiumAttributes) => {
  const attrs = [
    "apc",
    "description",
    "focus",
    "name",
    "spc",
    "type",
    "damage",
    "damage_type",
    "upcharge",
    "range",
    "duration",
    "cast_time",
    "prerequisites",
    "recharge",
  ];

  const row = getRow("spells");
  const update = getUpdate(attrs, page, row);
  const source = page.data.source.toString().toLowerCase();

  if (page.data.damage) {
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

        const rollFormula = getRollFormula(primary_source === source);

        updateAttack[`${attackRow}_roll_formula`] = rollFormula;
        updateAttack[`${row}_roll_formula`] = rollFormula;

        setDropAttrs(updateAttack);
      }
    );

    update[`${row}_link`] = attackRow;
  }
  if (page.data?.function_note) {
    update[
      `${row}_function`
    ] = `${page.data.function} (${page.data.function_note})`;
  }

  if (page.data?.liturgy_apc) {
    update[`${row}_apc`] = `${page.data.liturgy_apc} (liturgy apc)`;
  }

  if (page.data?.liturgy_spc) {
    update[`${row}_spc`] = `${page.data.liturgy_spc} (liturgy spc)`;
  }

  if (page.data?.requires && page.data?.materials) {
    update[
      `${row}_requires`
    ] = `${page.data?.requires} (${page.data.materials})`;
  } else if (page.data?.requires) {
    update[`${row}_requires`] = `${page.data?.requires}`;
  } else if (page.data?.materials) {
    update[`${row}_requires`] = `${page.data?.materials}`;
  }

  let tags = `${page.data.source} ${page.data.type}, ${page.data.function}`;
  if (page.data?.function_note) {
    tags += `, ${page.data.function_note}`;
  }

  if (page.data.source) {
    update[`${row}_source`] = source;
  }

  update[`${row}_tags`] = tags;

  setDropAttrs(update);
};
