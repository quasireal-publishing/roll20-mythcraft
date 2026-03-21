const roll20Attribute = (attr: string, value: AttrValue) => {
  // Selects need to reference the Roll20 Attribute as a value
  if ((attributes as string[]).includes(attr) && typeof value === "string") {
    return `@{${createAttributeName(value)}}`;
  }

  return value;
};
