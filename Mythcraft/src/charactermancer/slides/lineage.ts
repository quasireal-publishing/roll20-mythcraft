on("mancerchange:lineage", (event) => {
  const pageName = event.newValue.includes("?expansion")
    ? event.newValue.split("?")[0]
    : event.newValue;
  changeCompendiumPage("sheet-iframe", pageName);

  getCompendiumPage(pageName, (page: CompendiumAttributes) => {
    const show: string[] = [];
    const hide: string[] = [];

    const LINEAGE_ATTRIBUTES = [
      "appearance",
      "height",
      "lifespan",
      "size",
      "speed",
      "weight",
    ];

    LINEAGE_ATTRIBUTES.forEach((attr) => {
      if (page.data[attr]) {
        show.push(`sheet-choice-${attr}`);
      } else {
        hide.push(`sheet-choice-${attr}`);
      }
    });

    show.length && showChoices(show);
    hide.length && hideChoices(hide);

    setAttrs({ name: page.name }, { silent: true });
  });
});
