on("sheet:opened", () => {
  // setAttrs({ latest_versioning_upgrade: 3.2 }); //used for testing versioning
  getAttrs(["version"], (v) => {
    versioning(parseFloat(v.version) || 1);
  });
});

const versioning = async (version: number) => {
  const updateMessage = (v: number) =>
    console.log(
      `%c Sheet is updating to ${v}`,
      "color: orange; font-weight:bold"
    );

  switch (true) {
    case version < 1:
      versioning(1);
      updateMessage(1);
      break;
    case version < 1.1:
      updateMessage(1.1);
      versionOneOne();
      versioning(1.1);
      break;
    case version < 1.2:
      updateMessage(1.2);
      versionOneTwo();
      versioning(1.2);
      break;
    case version < 1.21:
      updateMessage(1.21);
      versionOneTwoOne();
      versioning(1.21);
      break;
    case version < 1.3:
      updateMessage(1.3);
      versionOneThree();
      versioning(1.3);
      break;
    default:
      console.log(
        `%c Sheet is update to date.`,
        "color: green; font-weight:bold"
      );
      setAttrs({ version });
  }
};
