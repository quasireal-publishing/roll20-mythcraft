const valueCheck = (value: any) {
    if (value > 2) return 2;
    if (value < -3) return -3;
    if (isNaN(value)) return 0;
    return value;
}

attributes.forEach((attr) => {
  on(`mancerchange:${attr}`, (event) => {
    //5 points to assign
    // can take - 1, -2, or -3 to as extra points
    // cap is -3, to +3

    console.log(event);
    const { sourceAttribute, newValue } = event;
    const value = parseInteger(newValue);
    const charmancerData = getCharmancerData();
    const { values } = charmancerData.attributes;

    console.log("Attribute values:", values);

    //go through all the key value parts in Values and sum them
    let pointsAvailable = 5;
    for (const key in values) {
      const int = parseInteger(values[key]);

      if (int > 0) {
        pointsAvailable -= int;
      } else if (int < 0) {
        pointsAvailable += Math.abs(int);
      }
    }

    console.table({ pointsAvailable });
  });
});

const updateAttribute = (attribute: string, change: number) => {
    const charmancerData = getCharmancerData();
    const value = charmancerData.attributes.values[attribute]
    const int = valueCheck(parseInteger(value) + change);
    setAttrs({[attribute]: int});
}



on("clicked:decrease_attribute", (event) => {
    const attribute = event.htmlAttributes.value
    updateAttribute(attribute, -1);
});

on("clicked:increase_attribute", (event) => {
    const attribute = event.htmlAttributes.value
    updateAttribute(attribute, 1);
});
