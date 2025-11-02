on("clicked:launch_charactermancer", () => {
  startCharactermancer("start");
});

// Automatically launch the charactermancer when opening a new sheet for development
on("sheet:opened", () => {
  startCharactermancer("start");
});

[
  "start",
  "lineage",
  "attributes",
  "stats",
  "background",
  "profession",
  "talent",
  "review",
].forEach((step) => {
  on(`clicked:charactermancer_${step}`, () => {
    startCharactermancer(step);
  });
});

on("mancer:cancel", (event) => {
  console.log("Cancel charactermancer", event);
  //deleteCharmancerData([<pages>], <Callback>)
});

on("mancerfinish:name", (event) => {
  console.log("Finished charactermancer with name:", event);
});

on("page:lineage", () => {
  console.log("%c Lineage page opened", "color: cyan; font-weight: bold;");
});

on("page:review", () => {
  console.log("%c Review page opened", "color: cyan; font-weight: bold;");
  const charmancerData = getCharmancerData();
  console.log("Charmancer:", charmancerData);
});

on("page:final", () => {
  finishCharactermancer();
});

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
