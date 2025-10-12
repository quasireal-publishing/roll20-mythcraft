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

on("page:importer", () => {
  // setAttrs({ builder: "Chummer" });
  // setCharmancerText({
  //   directions: chummerDirections,
  // });
});
