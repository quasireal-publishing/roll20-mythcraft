on("clicked:launch_charactermancer", () => {
  startCharactermancer("start");
});

// Automatically launch the charactermancer when opening a new sheet for development
//- Remove or comment before release
/* on("sheet:opened", () => {
  startCharactermancer("start");
}); */

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

on("page:attributes", () => {
  console.log("%c Attributes page opened", "color: cyan; font-weight: bold;");
});

on("page:review", () => {
  console.log("%c Review page opened", "color: cyan; font-weight: bold;");
  const charmancerData = getCharmancerData();
  console.log("Charmancer:", charmancerData);
});

on("page:final", () => {
  finishCharactermancer();
});
