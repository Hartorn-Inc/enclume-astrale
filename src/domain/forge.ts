export type ItemCategory = "weapon" | "armor_or_shield" | "autonomous_permanent";

export const CATEGORY_COEFFICIENTS: Readonly<Record<ItemCategory, number>> = {
  weapon: 1.0,
  armor_or_shield: 0.85,
  autonomous_permanent: 0.8
};

export interface ForgeItemInput {
  readonly category: ItemCategory;
  readonly bonus: number;
  readonly slots: number;
}

export interface ForgeQuoteResult {
  readonly valid: boolean;
  readonly error?: string;
  readonly baseLevel: number;
  readonly effectiveLevel: number;
  readonly ceilingPrice: number;
}

export interface UpgradeQuoteResult {
  readonly valid: boolean;
  readonly error?: string;
  readonly initialPrice: number;
  readonly targetPrice: number;
  readonly upgradeCost: number;
}

export function calculateBaseTriangularLevel(bonus: number): number {
  if (bonus <= 0) return 0;
  return Math.floor((bonus * (bonus + 1)) / 2);
}

export function calculateForgeQuote(input: ForgeItemInput): ForgeQuoteResult {
  const { category, bonus, slots } = input;

  if (category === "weapon" && slots > bonus) {
    return {
      valid: false,
      error: "SLOTS_EXCEED_BONUS_CAPACITY",
      baseLevel: calculateBaseTriangularLevel(bonus),
      effectiveLevel: 0,
      ceilingPrice: 0
    };
  }

  const baseLevel = calculateBaseTriangularLevel(bonus);
  const effectiveLevel = baseLevel + Math.max(0, slots);
  const coeff = CATEGORY_COEFFICIENTS[category] ?? 1.0;
  const ceilingPrice = Math.round(coeff * 1000 * effectiveLevel * effectiveLevel);

  return {
    valid: true,
    baseLevel,
    effectiveLevel,
    ceilingPrice
  };
}

export function calculateUpgradeQuote(
  initial: ForgeItemInput,
  target: ForgeItemInput
): UpgradeQuoteResult {
  const initialQuote = calculateForgeQuote(initial);
  if (!initialQuote.valid) {
    return {
      valid: false,
      error: "INVALID_INITIAL_ITEM",
      initialPrice: 0,
      targetPrice: 0,
      upgradeCost: 0
    };
  }

  const targetQuote = calculateForgeQuote(target);
  if (!targetQuote.valid) {
    return {
      valid: false,
      error: targetQuote.error ?? "INVALID_TARGET_ITEM",
      initialPrice: initialQuote.ceilingPrice,
      targetPrice: 0,
      upgradeCost: 0
    };
  }

  if (targetQuote.ceilingPrice <= initialQuote.ceilingPrice) {
    return {
      valid: false,
      error: "DOWNGRADE_OR_SAME_LEVEL_FORBIDDEN",
      initialPrice: initialQuote.ceilingPrice,
      targetPrice: targetQuote.ceilingPrice,
      upgradeCost: 0
    };
  }

  return {
    valid: true,
    initialPrice: initialQuote.ceilingPrice,
    targetPrice: targetQuote.ceilingPrice,
    upgradeCost: targetQuote.ceilingPrice - initialQuote.ceilingPrice
  };
}
