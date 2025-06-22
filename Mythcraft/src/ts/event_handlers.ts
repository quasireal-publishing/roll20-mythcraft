// [anticipation, fortitude, logic, reflexes, willpower].forEach(
//   (scoreAttributes) => {
//     scoreAttributes.forEach((attr) => {
//       on(`change:${attr}`, () => {
//         getAttrs(scoreAttributes, (values) => {
//           const sum = sumIntegers(Object.values(parseIntegers(values)));
//           const name = scoreAttributes
//             .find((e) => e.includes("base"))
//             .replace("_base", "");
//           setAttrs({ [name]: sum });
//         });
//       });
//     });
//   }
// );


["attacks", "spells"].forEach((fieldset) => {
  on(`change:repeating_${fieldset}`, (event) => {
    const { sourceAttribute, newValue } = event;
    if(sourceAttribute.includes("link")) {	
      return;
    }

    const attr = getFieldsetAttr(sourceAttribute);
    
    getAttrs([`repeating_${fieldset}_link`], (values) => {
      const linkedRow = values[`repeating_${fieldset}_link`];
      if (linkedRow) {
        const update: Attrs = {
          [`${linkedRow}_${attr}`]: newValue,
        };
      setAttrs(update, { silent: true });
      }
    });
  });

["attacks", "skills"].forEach((fieldset) => {
  on(`change:repeating_${fieldset}:attribute`, (event) => {
    const { sourceAttribute, newValue } = event;
    const repeatingRow = getFieldsetRow(sourceAttribute);

    // Attribute will be @{...}. Remove the @{}
    const abbreviation = getAttributeAbbreviation(newValue);

    setAttrs({ [`${repeatingRow}_attribute_abbreviation`]: abbreviation });
  });
});

const favoriteAttributes = ["name", "tags", "description"];

["abilities", "favorites", "talents"].forEach((fieldset) => {
  favoriteAttributes.forEach((attr) => {
    on(`change:repeating_${fieldset}:${attr}`, (event) => {
      const { newValue } = event;

      getAttrs([`repeating_${fieldset}_link`], (values) => {
        const favoriteRow = values[`repeating_${fieldset}_link`];
        if (favoriteRow) {
          const update: Attrs = {
            [`${favoriteRow}_${attr}`]: newValue,
          };
          setAttrs(update, { silent: true });
        }
      });
    });
  });

  on(`change:repeating_${fieldset}:toggle_favorite`, (event) => {
    const { sourceAttribute, newValue } = event;
    const abilitiesRow = getFieldsetRow(sourceAttribute);
    const isFavorite = newValue === "true";

    if (isFavorite) {
      getAttrs(
        [
          `${abilitiesRow}_description`,
          `${abilitiesRow}_link`,
          `${abilitiesRow}_name`,
          `${abilitiesRow}_tags`,
        ],
        (values) => {
          const favoriteRow = getRow("favorites");
          const update = {
            [`${favoriteRow}_description`]:
              values[`${abilitiesRow}_description`],
            [`${favoriteRow}_link`]: abilitiesRow,
            [`${favoriteRow}_name`]: values[`${abilitiesRow}_name`],
            [`${favoriteRow}_tags`]: values[`${abilitiesRow}_tags`],
            [`${favoriteRow}_toggle_edit`]: false,
            [`${abilitiesRow}_link`]: favoriteRow,
          };

          setAttrs(update, { silent: true });
        }
      );
    } else {
      getAttrs([`${abilitiesRow}_link`], (values) => {
        const favoriteRow = values[`${abilitiesRow}_link`];
        removeRepeatingRow(favoriteRow);
      });
    }
  });
});

["attacks", "inventory"].forEach((fieldset) => {
  on(`change:repeating_${fieldset}:name`, (event) => {
    const { newValue } = event;
    getAttrs([`repeating_${fieldset}_link`], (values) => {
      const row = values[`repeating_${fieldset}_link`];
      if (row) {
        const update: Attrs = {
          [`${row}_name`]: newValue,
        };
        setAttrs(update, { silent: true });
      }
    });
  });
});
