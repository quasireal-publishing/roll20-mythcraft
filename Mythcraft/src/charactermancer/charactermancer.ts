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
  const data = getCharmancerData();
  console.log("Lineage data:", data);
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
    const { appearance, base_speed, height, lifespan, size, weight } =
      page.data;
    console.log("Lineage data:", page); // Handle the retrieved data

    const show: string[] = [];
    const hide: string[] = [];

    const LINEAGE_ATTRIBUTES = [
      "appearance",
      "height",
      "lifespan",
      "size",
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

    setAttrs({
      appearance: appearance || "",
      speed: base_speed || "",
      height: height || "",
      lifespan: lifespan || "",
      size: size || "",
      weight: weight || "",
      lineage: page.name || "",
    });

    console.log(show, hide);

    //deleteCharmancerData([<pages>], <Callback>)
  });
});
