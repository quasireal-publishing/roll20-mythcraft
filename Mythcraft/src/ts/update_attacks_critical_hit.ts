const updateAttacksCriticalHit = (event: EventInfo) => {
  getAttrs(["critical_hit"], (values) => {
    const { sourceAttribute, newValue } = event;
    const row = getFieldsetRow(sourceAttribute);
    const critical_hit = values.critical_hit;
    const ch = getAttacksCriticalHit(critical_hit, newValue);

    setAttrs({
      [`${row}_attack_critical_hit`]: ch,
    });
  });
};
