const updateAttributeModifier = ({
  sourceAttribute,
  previousValue,
  removedInfo,
}: EventInfo) => {
  const rowId = getFieldsetRow(sourceAttribute);

  console.table({
    sourceAttribute,
    previousValue,
    removedInfo,
    rowId,
  });

  getSectionIDs("repeating_modifiers", (ids) => {
    const attrs: string[] = [];

    // Get all the attributes for the repeating section
    ids.forEach((id) => {
      attrs.push(`repeating_modifiers_${id}_attribute`);
      attrs.push(`repeating_modifiers_${id}_modifier`);
      attrs.push(`repeating_modifiers_${id}_toggle_active`);
    });

    // Get all the attribute values for the repeating section
    getAttrs(attrs, (v) => {
      const update: { [key: string]: number } = {};

      // Get of list of attributes that are active and have a modifier
      const activeIds = ids.filter((id) => {
        return (
          v[`repeating_modifiers_${id}_toggle_active`] === "on" &&
          v[`repeating_modifiers_${id}_modifier`] !== "0" &&
          v[`repeating_modifiers_${id}_modifier`] !== "" &&
          v[`repeating_modifiers_${id}_modifier`] !== undefined
        );
      });

      const getAttributeSum = (attribute: string) => {
        //Get rows that match the attribute
        const attributeModifiers = activeIds.filter((id) => {
          return v[`repeating_modifiers_${id}_attribute`] === attribute;
        });

        const integers = attributeModifiers.map((id) => {
          return parseInt(v[`repeating_modifiers_${id}_modifier`] || "0", 10);
        });

        return sumIntegers(integers);
      };

      const attribute =
        removedInfo && removedInfo[`${sourceAttribute}_attribute`]
          ? removedInfo[`${sourceAttribute}_attribute`]
          : v[`${rowId}_attribute`];

      if (attribute === "initiative") {
        // Roll20 will not trigger onChange events for initiative_modifier so we use initiative_bonus instead
        update["initiative_bonus"] = getAttributeSum("initiative");
      } else {
        update[`${attribute}_modifier`] = getAttributeSum(attribute.toString());
      }

      // If the attribute has changed, update the previous attribute as well
      if (previousValue && modifiers.includes(previousValue)) {
        update[`${previousValue}_modifier`] = getAttributeSum(previousValue);
      }

      console.log(update);

      setAttrs(update);
    });
  });
};
