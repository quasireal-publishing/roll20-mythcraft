const valueCheck = (value: any) => {
  if (value > 2) return 2;
  if (value < -3) return -3;
  if (isNaN(value)) return 0;
  return value;
};

const getAttributeCap = (level: number): number => {
  if (level < 1) throw new Error("Level must be at least 1.");
  return Math.ceil(level / 2) + 1;
};

type CharacterAttributes = Record<AttributeKey, number>;

/**
 * At character creation:
 * - You start with 5 Attribute Points.
 * - Positive values cost that many points.
 * - Negative values (-1, -2, -3) *grant* points (each -1 gives +1 point).
 */
const computeAttributePointUsage = (
  attrs: CharacterAttributes,
  basePool: number = 5,
) => {
  let spent = 0;
  let gainedFromNegatives = 0;

  for (const key of Object.keys(attrs) as AttributeKey[]) {
    const value = attrs[key];

    if (value > 0) {
      spent += value;
    } else if (value < 0) {
      gainedFromNegatives += -value; // -(-3) = +3 points gained
    }
  }

  const totalPool = basePool + gainedFromNegatives;
  const remaining = totalPool - spent;

  return { spent, gainedFromNegatives, totalPool, remaining };
};

/**
 * Validate an attribute assignment against:
 * - Attribute cap based on level
 * - Attribute point pool (5 + points from negatives)
 */
interface AttributeValidationResult {
  ok: boolean;
  errors: string[];
  cap: number;
  points: ReturnType<typeof computeAttributePointUsage>;
}

const validateAttributes = (
  level: number,
  attrs: CharacterAttributes,
): AttributeValidationResult => {
  const errors: string[] = [];
  const cap = getAttributeCap(level);
  const points = computeAttributePointUsage(attrs);

  // Cap check
  for (const key of Object.keys(attrs) as AttributeKey[]) {
    const value = attrs[key];
    if (value > cap) {
      errors.push(
        `${key} (${value}) exceeds the cap of +${cap} for level ${level}.`,
      );
    }
  }

  // Point pool check
  if (points.remaining < 0) {
    errors.push(
      `You have overspent Attribute Points: spent ${points.spent} with a pool of ${points.totalPool}.`,
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    cap,
    points,
  };
};

/**
 * LUCK rules:
 * - Luck Points: ⌊LUCK / 2⌋ rerolls per rest (if LUCK > 0)
 * - If LUCK < 0: cannot crit and subtract LUCK from every d20 roll.
 * - If LUCK ≥ 1: add LUCK to critical damage.
 * - Crit range:
 *   - base: 20
 *   - if LUCK ≥ 6: 19–20
 *   - if LUCK ≥ 12: 18–20 (max 16–20 per rules)
 */
export interface LuckStats {
  luckPoints: number;
  canCrit: boolean;
  critDamageBonus: number; // added to crit damage if LUCK >= 1
  critRangeStart: number; // e.g. 20 = only 20 crits, 19 = 19–20, etc.
  d20ModifierFromLuck: number; // negative if LUCK < 0, else 0
}

export function getLuckStats(luck: number): LuckStats {
  const luckPoints = luck > 0 ? Math.floor(luck / 2) : 0;
  const canCrit = luck >= 0;
  const critDamageBonus = luck >= 1 ? luck : 0;
  const d20ModifierFromLuck = luck < 0 ? luck : 0;

  let critRangeStart = 20;
  if (luck >= 12) {
    critRangeStart = 18;
  } else if (luck >= 6) {
    critRangeStart = 19;
  }

  // The rules mention max 16–20, but we never go beyond 18 here.
  return {
    luckPoints,
    canCrit,
    critDamageBonus,
    critRangeStart,
    d20ModifierFromLuck,
  };
}

/**
 * Coordination (COR) → Action Points (AP):
 * - Base AP: 3
 * - For every 2 points of COR, you gain +1 AP.
 * - If COR is -1 or -2, you lose 1 AP.
 * - If COR is -3, you lose 2 AP.
 */
export interface ActionPointStats {
  baseAP: number;
  bonusFromCor: number;
  totalAP: number;
}

export function getActionPoints(cor: number): ActionPointStats {
  const baseAP = 3;
  let bonusFromCor = 0;

  if (cor >= 0) {
    bonusFromCor = Math.floor(cor / 2); // +1 AP per 2 COR
  } else if (cor === -1 || cor === -2) {
    bonusFromCor = -1;
  } else if (cor <= -3) {
    bonusFromCor = -2;
  }

  const totalAP = baseAP + bonusFromCor;

  return { baseAP, bonusFromCor, totalAP };
}

attributes.forEach((attr) => {
  on(`mancerchange:${attr}`, (event) => {
    const charmancerData = getCharmancerData();
    const { values } = charmancerData.attributes;

    console.log(values);

    const attrs: CharacterAttributes = {} as CharacterAttributes;

    attributes.forEach((attribute) => {
      attrs[attribute] = values[attribute]
        ? parseInteger(values[attribute])
        : 0;
    });

    const level = 1;

    const validation = validateAttributes(level, attrs);
    if (!validation.ok) {
      console.error("Invalid attributes:", validation.errors);
    }

    const luckStats = getLuckStats(attrs["luck"]);
    const apStats = getActionPoints(attrs["coordination"]);
    console.log({ validation, luckStats, apStats });

    console.log({ validation });
  });
});

const updateAttribute = (attribute: string, change: number) => {
  const charmancerData = getCharmancerData();
  const value = charmancerData.attributes.values[attribute];
  const int = valueCheck(parseInteger(value) + change);
  setAttrs({ [attribute]: int });
};

on("clicked:decrease_attribute", (event) => {
  const attribute = event.htmlAttributes.value;
  updateAttribute(attribute, -1);
});

on("clicked:increase_attribute", (event) => {
  const attribute = event.htmlAttributes.value;
  updateAttribute(attribute, 1);
});
