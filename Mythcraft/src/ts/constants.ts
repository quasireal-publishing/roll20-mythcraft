type AttributeKey =
  | "strength"
  | "dexterity"
  | "endurance"
  | "awareness"
  | "intellect"
  | "charisma"
  | "luck"
  | "coordination";

const mentalAttributes: AttributeKey[] = ["awareness", "intellect", "charisma"];
const metaphysicAttributes: AttributeKey[] = ["luck", "coordination"];
const physicalAttributes: AttributeKey[] = [
  "strength",
  "dexterity",
  "endurance",
];

const attributes: AttributeKey[] = [
  ...mentalAttributes,
  ...metaphysicAttributes,
  ...physicalAttributes,
];

const action_points = [
  "coordination",
  "action_points_base",
  "action_points_modifier",
];

const hit_points = ["endurance", "hit_points_base", "level"];
const critical_attributes = [
  "critical_hit",
  "luck",
  "critical_hit_base",
  "critical_hit_modifier",
];
const critical_fail_attributes = [
  "critical_fail",
  "critical_fail_base",
  "critical_fail_modifier",
];

// Defenses
const armor_rating = ["armor_rating_base", "armor_rating_modifier"];
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

const initiative = ["initiative_base", "initiative_bonus", "awareness"];

const modifiers = [...defenses, "action_points", "initiative", "armor_rating"];
