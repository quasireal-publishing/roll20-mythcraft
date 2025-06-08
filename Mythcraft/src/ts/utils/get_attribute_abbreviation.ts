const getAttributeAbbreviation = (attribute: string): string => {
  if (attribute === "luck") {
    return attribute;
  }

  if (attribute.charAt(0) === "@") {
    // If Attribute is @{...}. Remove the @{}
    attribute = attribute.substring(2, attribute.length - 1);
  }

  const abbreviation = attribute.substring(0, 3);

  // Awareness first 3 letters are "awa" but abbreviation is "awr"
  if (attribute === "awareness") {
    const key = getTranslationByKey(abbreviation);

    if (key) {
      return key;
    } else {
      console.warn(`Key not found for awareness abbreviation: ${abbreviation}`);
    }
  }

  return abbreviation;
};
