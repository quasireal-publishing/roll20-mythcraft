const getAttributeAbbreviation = (attribute: string) => {
  if (attribute.includes("none") || attribute.includes("0")) {
    return "-";
  }

  if (attribute.includes("luck")) {
    return "luck";
  }

  if (attribute.includes("awareness")) {
    return "awr";
  }

  if (attribute.includes("coordination")) {
    return "cor";
  }

  if (attribute.charAt(0) === "@") {
    // If Attribute is @{...}. Remove the @{}
    attribute = attribute.substring(2, attribute.length - 1);
  }

  const abbreviation = attribute.substring(0, 3);

  return abbreviation;
};
