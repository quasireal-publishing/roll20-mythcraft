const updateCriticalRange = (attributes: Attributes) => {
  getAttrs(attributes, (values) => {
    const { luck, critical_hit_base, critical_hit, critical_hit_modifier } =
      parseIntegers(values);

    if (luck < 0) {
      //Luck < 0 never Critically Hit
      setAttrs({
        critical_hit: 0, // Reset to default
      });
      return;
    }

    let hit = critical_hit_base;

    if (luck >= 12) {
      hit = critical_hit_base - 2;
    } else if (luck >= 6 && luck <= 11) {
      hit = critical_hit_base - 1;
    }

    hit = hit + critical_hit_modifier;

    // Should always be between 16 and 20
    const cr = hit < 16 ? 16 : hit > 20 ? 20 : hit;

    if (cr !== critical_hit) {
      setAttrs({
        critical_hit: `>${cr}`,
      });
    }
  });
};
