const updateAllAttacksCriticalHits = (event: EventInfo) => {
  const { newValue } = event;

  getSectionIDs("repeating_attacks", (ids) => {
    const attrs: string[] = [];
    // Build list of attributes to get
    ids.forEach((id) => {
      attrs.push(`repeating_attacks_${id}_attack_critical_hit`);
      attrs.push(`repeating_attacks_${id}_crit_range`);
    });

    // Get all the attribute values for the repeating section
    getAttrs(attrs, (values) => {
      const update: { [key: string]: string } = {};
      // If attack_critical_hit is not @{critical_hit} (global critical hit), update it
      ids.forEach((id) => {
        const attackCriticalHit =
          values[`repeating_attacks_${id}_attack_critical_hit`];
        const critRange = values[`repeating_attacks_${id}_crit_range`];

        if (critRange === "0" && attackCriticalHit === "@{critical_hit}") {
          return;
        }

        const ch = getAttacksCriticalHit(newValue, critRange);

        if (ch !== attackCriticalHit) {
          update[`repeating_attacks_${id}_attack_critical_hit`] = ch;
        }
      });

      if (Object.keys(update).length > 0) {
        setAttrs(update, { silent: true });
      }
    });
  });
};
