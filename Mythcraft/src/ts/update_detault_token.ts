const updateDefaultToken = (values: Partial<TokenValues>, size?: string) => {
  const update = { ...values, width: 70, height: 70 };

  if (size) {
    const sizeMap: { [key: string]: number } = {
      fine: 20,
      diminutive: 28,
      tiny: 35,
      small: 50,
      medium: 70,
      large: 140,
      huge: 210,
      gargantuan: 280,
      colossal: 350,
      titan: 420,
    };

    const sizeKey = Object.keys(sizeMap).find((key) =>
      size.toLowerCase().includes(key)
    );

    const sizeValue = sizeKey ? sizeMap[sizeKey] : undefined;
    if (sizeValue) {
      update.width = sizeValue;
      update.height = sizeValue;
    }
  }

  Object.entries(update).forEach(([key, value]) => {
    if (typeof value === "boolean") {
      console.warn(
        `Token default ${key} is a boolean. Setting to 0.`,
        "color: orange; font-weight:bold"
      );
    }
  });

  setDefaultToken(update);
};
