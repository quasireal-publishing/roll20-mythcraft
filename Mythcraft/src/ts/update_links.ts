const updateLinks = (event: EventInfo) => {
  const { sourceAttribute, removedInfo } = event;
  const update: { [key: string]: string } = {};

  if (removedInfo) {
    const effectedLink = removedInfo[`${sourceAttribute}_link`] + "_link";
    getAttrs([`${effectedLink}`], (values) => {
      const link = values[`${effectedLink}`];
      if (link) {
        update[`${effectedLink}`] = "";
        setAttrs(update, { silent: true });
      }
    });
  }
};
