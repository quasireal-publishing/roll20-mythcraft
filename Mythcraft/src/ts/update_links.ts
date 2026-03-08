const updateLinks = (event: EventInfo) => {
  const { sourceAttribute, removedInfo } = event;
  const update: { [key: string]: string } = {};

  if (removedInfo) {
    const effectedLink = removedInfo[`${sourceAttribute}_link`] + "_link";
    getAttrs([`${effectedLink}`], (values) => {
      const link = values[`${effectedLink}`];

      console.table({
        trigger: sourceAttribute,
        effectedLink: effectedLink,
        updateThisLink: link,
      });

      if (link) {
        update[`${effectedLink}`] = "";
        setAttrs(update, { silent: true });
      }
    });
  }
};
