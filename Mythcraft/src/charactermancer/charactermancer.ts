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
});

on("mancerfinish:name", (event) => {
  console.log("Finished charactermancer with name:", event);
});

on("page:lineage", () => {
  console.log("%c Lineage page opened", "color: blue; font-weight: bold;");
});

on("page:final", () => {
  finishCharactermancer();
});

on("mancerchange:lineage", (event) => {
  //Lineages:Deep Dwarf?expansion=34979
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

    const { lineage } = getCharmancerData();
    const { values } = lineage ?? {};
    const update: Record<string, any> = {
      lineage: page.name,
    };

    console.log("Page Data:", page.data);
    console.log("Charmancer Values:", values);

    //loop through the key value pairs of values

    Object.entries(page.data).forEach(([key, value]) => {
      if (update[key] || !LINEAGE_ATTRIBUTES.includes(key)) {
        return;
      }

      update[key] = page.data[key];
    });

    console.log("Updating lineage with:", update);

    setAttrs(update);

    //console.log(show, hide);

    //deleteCharmancerData([<pages>], <Callback>)
  });
});
