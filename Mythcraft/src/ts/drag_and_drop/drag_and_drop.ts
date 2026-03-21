const dropWarning = (v: string) => {
  console.warn(
    `%c Compendium Drop Error: ${v}`,
    "color: orange; font-weight:bold",
  );
};

const dropAttrs = ["drop_name", "drop_data", "drop_content"];

const handle_drop = () => {
  getAttrs(dropAttrs, (v) => {
    if (!v.drop_name || !v.drop_data) {
      return;
    }

    const page: CompendiumAttributes = {
      name: v.drop_name,
      data: parseJSON(v.drop_data) ?? v.drop_data,
      content: v.drop_content,
    };
    const { Category } = page.data;

    console.log(
      `%c Handling drop for ${page.name}: ${Category}`,
      "color: orange;",
    );

    let handler: ((page: CompendiumAttributes) => void) | undefined;

    switch (Category) {
      case "Creatures":
        handler = handle_creature;
        break;
      case "Conditions":
        handler = handle_conditions;
        break;
      case "Backgrounds":
        handler = handle_bop;
        break;
      case "Professions":
        handler = handle_profession;
        break;
      case "Equipment":
        handler = handle_equipment;
        break;
      case "Features":
        handler = handle_feature;
        break;
      case "Lineages":
        handler = handle_lineage;
        break;
      case "Skills":
        handler = handle_skills;
        break;
      case "Spells":
        handler = handle_spell;
        break;
      case "Talents":
        handler = handle_talent;
        break;
      case "Vehicles":
        handler = handle_vehicles;
        break;
      default:
        dropWarning(`Unknown category: ${Category}`);
        handler = undefined;
    }

    if (handler) {
      try {
        handler(page);
      } catch (error) {
        console.warn(`Error handling ${Category}: ${(error as Error).message}`);
      }
    }

    setDropAttrs({
      drop_name: "",
      drop_data: "",
      drop_content: "",
      drop_category: "",
    });
  });
};

["data"].forEach((attr) => {
  on(`change:drop_${attr}`, () => {
    handle_drop();
  });
});
