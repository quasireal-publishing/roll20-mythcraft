const roll20Attribute = (attr: string, value: AttrValue) => {
  const selectAttributes = ["attribute", "damage_attribute"];

  // Selects need to reference the Roll20 Attribute as a value
  const isAttribute = (attributes as string[]).includes(
    `${value}`.toLowerCase(),
  );

  if (
    selectAttributes.includes(attr) &&
    isAttribute &&
    typeof value === "string"
  ) {
    return `@{${createAttributeName(value)}}`;
  }

  return value;
};
