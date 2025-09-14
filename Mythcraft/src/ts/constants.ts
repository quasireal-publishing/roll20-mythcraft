//Set variables, traits, and other attributes

const mentalAttributes = ["awareness", "intellect", "charisma"];
const metaphysicAttributes = ["luck", "coordination"];
const physicalAttributes = ["strength", "dexterity", "endurance"];

const attributes = [
  ...mentalAttributes,
  ...metaphysicAttributes,
  ...physicalAttributes,
];

const action_points = ["coordination", "action_points_base"];
const hit_points = ["endurance", "hit_points_base", "level"];
const critical_attributes = ["critical_range", "luck", "critical_range_base"];
// Defenses
const armor_rating = ["armor_rating_base"];
const anticipation = [
  "anticipation_base",
  "anticipation_modifier",
  "awareness",
];
const fortitude = ["fortitude_base", "fortitude_modifier", "endurance"];
const logic = ["logic_base", "logic_modifier", "intellect"];
const reflexes = ["reflexes_base", "reflexes_modifier", "dexterity"];
const willpower = ["willpower_base", "willpower_modifier", "charisma"];

const defenses = [
  "anticipation",
  "fortitude",
  "logic",
  "reflexes",
  "willpower",
];

const initiative = ["awareness", "initiative_modifier"];
