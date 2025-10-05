const updateCriticalFailRange = (attributes: Attributes) => {
  getAttrs(attributes, (values) => {
    const { critical_fail_base, critical_fail, critical_fail_modifier } =
      parseIntegers(values);

    const range = critical_fail_base + critical_fail_modifier;

    const cr = range < 1 ? 1 : range;

    if (cr !== critical_fail) {
      setAttrs({
        critical_fail: `<${cr}`,
      });
    }
  });
};
