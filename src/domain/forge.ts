export type ItemCategory = 'WEAPON' | 'ARMOR_SHIELD' | 'WONDROUS_ITEM';

export type EnchantmentSlot = number;

export type AmmoSupplement = 'INCASSABLE' | 'PERCUTANTE' | 'ARGENTEE';

export const AMMO_SUPPLEMENT_COSTS: Record<AmmoSupplement, number> = {
  INCASSABLE: 20,
  PERCUTANTE: 20,
  ARGENTEE: 10,
};

export const CATEGORY_COEFFICIENTS: Record<ItemCategory, number> = {
  WEAPON: 1.0,
  ARMOR_SHIELD: 0.85,
  WONDROUS_ITEM: 0.8,
};

export type ForgeErrorCode =
  | 'CAPACITY_EXCEEDED'
  | 'WONDROUS_ITEM_CANNOT_HAVE_BONUS'
  | 'INVALID_BONUS'
  | 'INVALID_SLOTS';

export interface ForgeCraftRequest {
  category: ItemCategory;
  enhancementBonus: number;
  slots: EnchantmentSlot;
}

export interface ForgeCraftResult {
  isValid: boolean;
  error?: ForgeErrorCode;
  baseTier?: number;
  effectiveTier?: number;
  ceilingPrice?: number;
}

export type UpgradeErrorCode =
  | 'INVALID_INITIAL_ITEM'
  | 'INVALID_FINAL_ITEM'
  | 'FINAL_TIER_NOT_GREATER'
  | 'CAPACITY_EXCEEDED';

export interface UpgradeRequest {
  category: ItemCategory;
  initialEnhancementBonus: number;
  initialSlots: EnchantmentSlot;
  finalEnhancementBonus: number;
  finalSlots: EnchantmentSlot;
}

export interface UpgradeResult {
  isValid: boolean;
  error?: UpgradeErrorCode;
  initialCeilingPrice?: number;
  finalCeilingPrice?: number;
  upgradePrice?: number;
}

export type AmmoErrorCode =
  | 'CAPACITY_EXCEEDED'
  | 'INVALID_QUANTITY'
  | 'INVALID_BONUS'
  | 'INVALID_SLOTS';

export interface AmmoCraftRequest {
  enhancementBonus: number;
  slots?: EnchantmentSlot;
  quantity: number;
  supplements?: AmmoSupplement[];
}

export interface AmmoCraftResult {
  isValid: boolean;
  error?: AmmoErrorCode;
  effectiveTier?: number;
  ceilingPrice?: number;
}

export function computeBaseTier(bonus: number): number {
  if (!Number.isInteger(bonus) || bonus < 0) {
    throw new Error(`Bonus must be a non-negative integer, got: ${bonus}`);
  }
  return (bonus * (bonus + 1)) / 2;
}

export function computeEffectiveTier(bonus: number, slots: EnchantmentSlot): number {
  if (!Number.isInteger(slots) || slots < 0) {
    throw new Error(`Slots must be a non-negative integer, got: ${slots}`);
  }
  return computeBaseTier(bonus) + slots;
}

export function computeForgeQuote(request: ForgeCraftRequest): ForgeCraftResult {
  const { category, enhancementBonus, slots } = request;

  if (!Number.isInteger(enhancementBonus) || enhancementBonus < 0) {
    return { isValid: false, error: 'INVALID_BONUS' };
  }

  if (!Number.isInteger(slots) || slots < 0) {
    return { isValid: false, error: 'INVALID_SLOTS' };
  }

  if (category === 'WONDROUS_ITEM') {
    if (enhancementBonus !== 0) {
      return { isValid: false, error: 'WONDROUS_ITEM_CANNOT_HAVE_BONUS' };
    }
    const effectiveTier = slots;
    const coefficient = CATEGORY_COEFFICIENTS[category];
    const ceilingPrice = Math.round(coefficient * 1000 * effectiveTier * effectiveTier);
    return {
      isValid: true,
      baseTier: 0,
      effectiveTier,
      ceilingPrice,
    };
  }

  if (slots > enhancementBonus) {
    return { isValid: false, error: 'CAPACITY_EXCEEDED' };
  }

  const baseTier = computeBaseTier(enhancementBonus);
  const effectiveTier = baseTier + slots;
  const coefficient = CATEGORY_COEFFICIENTS[category];
  const ceilingPrice = Math.round(coefficient * 1000 * effectiveTier * effectiveTier);

  return {
    isValid: true,
    baseTier,
    effectiveTier,
    ceilingPrice,
  };
}

export const computeForgeCraft = computeForgeQuote;

export function computeUpgrade(request: UpgradeRequest): UpgradeResult {
  const initialQuote = computeForgeQuote({
    category: request.category,
    enhancementBonus: request.initialEnhancementBonus,
    slots: request.initialSlots,
  });

  if (!initialQuote.isValid) {
    return {
      isValid: false,
      error: initialQuote.error === 'CAPACITY_EXCEEDED' ? 'CAPACITY_EXCEEDED' : 'INVALID_INITIAL_ITEM',
    };
  }

  const finalQuote = computeForgeQuote({
    category: request.category,
    enhancementBonus: request.finalEnhancementBonus,
    slots: request.finalSlots,
  });

  if (!finalQuote.isValid) {
    return {
      isValid: false,
      error: finalQuote.error === 'CAPACITY_EXCEEDED' ? 'CAPACITY_EXCEEDED' : 'INVALID_FINAL_ITEM',
    };
  }

  if (finalQuote.effectiveTier! <= initialQuote.effectiveTier!) {
    return { isValid: false, error: 'FINAL_TIER_NOT_GREATER' };
  }

  const initialCeilingPrice = initialQuote.ceilingPrice!;
  const finalCeilingPrice = finalQuote.ceilingPrice!;
  const upgradePrice = finalCeilingPrice - initialCeilingPrice;

  return {
    isValid: true,
    initialCeilingPrice,
    finalCeilingPrice,
    upgradePrice,
  };
}

export const computeUpgradeQuote = computeUpgrade;

export function computeAmmoQuote(request: AmmoCraftRequest): AmmoCraftResult {
  const slots = request.slots ?? 0;
  const { enhancementBonus, quantity, supplements = [] } = request;

  if (!Number.isInteger(enhancementBonus) || enhancementBonus < 0) {
    return { isValid: false, error: 'INVALID_BONUS' };
  }

  if (!Number.isInteger(slots) || slots < 0) {
    return { isValid: false, error: 'INVALID_SLOTS' };
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { isValid: false, error: 'INVALID_QUANTITY' };
  }

  if (slots > enhancementBonus) {
    return { isValid: false, error: 'CAPACITY_EXCEEDED' };
  }

  const effectiveTier = computeEffectiveTier(enhancementBonus, slots);
  const weaponBasePrice = 1000 * effectiveTier * effectiveTier;
  const baseAmmoPrice = Math.round((weaponBasePrice / 50) * quantity);

  const supplementUnitCost = supplements.reduce(
    (sum, supp) => sum + (AMMO_SUPPLEMENT_COSTS[supp] ?? 0),
    0,
  );
  const totalSupplementCost = supplementUnitCost * quantity;
  const ceilingPrice = baseAmmoPrice + totalSupplementCost;

  return {
    isValid: true,
    effectiveTier,
    ceilingPrice,
  };
}

export const computeAmmoCraft = computeAmmoQuote;
