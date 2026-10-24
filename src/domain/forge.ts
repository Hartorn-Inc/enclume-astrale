export type ItemCategory = 'WEAPON' | 'ARMOR_SHIELD' | 'WONDROUS_ITEM';

export type EnchantmentSlot = number;

export type AmmoSupplement = 'UNBREAKABLE' | 'IMPACT' | 'SILVERED';

export const CATEGORY_COEFFICIENTS: Record<ItemCategory, number> = {
  WEAPON: 1.0,
  ARMOR_SHIELD: 0.85,
  WONDROUS_ITEM: 0.80
};

export const AMMO_SUPPLEMENT_COSTS: Record<AmmoSupplement, number> = {
  UNBREAKABLE: 20,
  IMPACT: 20,
  SILVERED: 10
};

export interface ForgeCraftRequest {
  category: ItemCategory;
  bonus: number;
  slotsConsumed: number;
  name?: string;
}

export interface ForgeCraftResult {
  isValid: boolean;
  error?: 'INVALID_BONUS' | 'CAPACITY_EXCEEDED' | 'WONDROUS_ITEM_CANNOT_HAVE_BONUS' | 'NEGATIVE_SLOTS';
  baseTier?: number;
  effectiveTier?: number;
  maxPrice?: number;
  categoryCoefficient?: number;
}

export interface UpgradeRequest {
  category: ItemCategory;
  initialBonus: number;
  initialSlots: number;
  targetBonus: number;
  targetSlots: number;
}

export interface UpgradeCraftResult {
  isValid: boolean;
  error?: string;
  initialTier?: number;
  targetTier?: number;
  initialMaxPrice?: number;
  targetMaxPrice?: number;
  upgradeCost?: number;
}

export interface AmmoCraftRequest {
  bonus: number;
  slotsConsumed: number;
  quantity: number;
  supplements?: AmmoSupplement[];
}

export interface AmmoCraftResult {
  isValid: boolean;
  error?: 'INVALID_BONUS' | 'CAPACITY_EXCEEDED' | 'INVALID_QUANTITY' | 'NEGATIVE_SLOTS';
  effectiveTier?: number;
  baseUnitCost?: number;
  supplementsUnitCost?: number;
  totalPrice?: number;
  quantity?: number;
}

export function computeBaseTier(bonus: number): number {
  if (!Number.isInteger(bonus) || bonus < 0 || bonus > 4) {
    throw new Error(`Bonus d'altération invalide: ${bonus}. Attendu: entier entre 0 et 4.`);
  }
  return (bonus * (bonus + 1)) / 2;
}

export function computeEffectiveTier(bonus: number, slotsConsumed: number): number {
  return computeBaseTier(bonus) + slotsConsumed;
}

export function computeCraftPrice(request: ForgeCraftRequest): ForgeCraftResult {
  const { category, bonus, slotsConsumed } = request;

  if (!Number.isInteger(bonus) || bonus < 0 || bonus > 4) {
    return { isValid: false, error: 'INVALID_BONUS' };
  }

  if (!Number.isInteger(slotsConsumed) || slotsConsumed < 0) {
    return { isValid: false, error: 'NEGATIVE_SLOTS' };
  }

  if (category === 'WONDROUS_ITEM') {
    if (bonus !== 0) {
      return { isValid: false, error: 'WONDROUS_ITEM_CANNOT_HAVE_BONUS' };
    }
    const effectiveTier = slotsConsumed;
    const categoryCoefficient = CATEGORY_COEFFICIENTS.WONDROUS_ITEM;
    const maxPrice = Math.round(categoryCoefficient * 1000 * Math.pow(effectiveTier, 2));
    return {
      isValid: true,
      baseTier: 0,
      effectiveTier,
      categoryCoefficient,
      maxPrice
    };
  }

  if (slotsConsumed > bonus) {
    return { isValid: false, error: 'CAPACITY_EXCEEDED' };
  }

  const baseTier = computeBaseTier(bonus);
  const effectiveTier = baseTier + slotsConsumed;
  const categoryCoefficient = CATEGORY_COEFFICIENTS[category];
  const maxPrice = Math.round(categoryCoefficient * 1000 * Math.pow(effectiveTier, 2));

  return {
    isValid: true,
    baseTier,
    effectiveTier,
    categoryCoefficient,
    maxPrice
  };
}

export function computeUpgradePrice(request: UpgradeRequest): UpgradeCraftResult {
  const { category, initialBonus, initialSlots, targetBonus, targetSlots } = request;

  const initialResult = computeCraftPrice({
    category,
    bonus: initialBonus,
    slotsConsumed: initialSlots
  });

  if (!initialResult.isValid) {
    return {
      isValid: false,
      error: `INITIAL_STATE_INVALID: ${initialResult.error}`
    };
  }

  const targetResult = computeCraftPrice({
    category,
    bonus: targetBonus,
    slotsConsumed: targetSlots
  });

  if (!targetResult.isValid) {
    return {
      isValid: false,
      error: `TARGET_STATE_INVALID: ${targetResult.error}`
    };
  }

  const initialTier = initialResult.effectiveTier!;
  const targetTier = targetResult.effectiveTier!;

  if (targetTier <= initialTier) {
    return {
      isValid: false,
      error: 'TARGET_TIER_MUST_BE_GREATER'
    };
  }

  const initialMaxPrice = initialResult.maxPrice!;
  const targetMaxPrice = targetResult.maxPrice!;
  const upgradeCost = targetMaxPrice - initialMaxPrice;

  return {
    isValid: true,
    initialTier,
    targetTier,
    initialMaxPrice,
    targetMaxPrice,
    upgradeCost
  };
}

export function computeAmmoPrice(request: AmmoCraftRequest): AmmoCraftResult {
  const { bonus, slotsConsumed, quantity, supplements = [] } = request;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { isValid: false, error: 'INVALID_QUANTITY' };
  }

  if (!Number.isInteger(bonus) || bonus < 0 || bonus > 4) {
    return { isValid: false, error: 'INVALID_BONUS' };
  }

  if (!Number.isInteger(slotsConsumed) || slotsConsumed < 0) {
    return { isValid: false, error: 'NEGATIVE_SLOTS' };
  }

  if (slotsConsumed > bonus) {
    return { isValid: false, error: 'CAPACITY_EXCEEDED' };
  }

  const effectiveTier = computeEffectiveTier(bonus, slotsConsumed);
  const weaponForgeEquivalent = 1000 * Math.pow(effectiveTier, 2);
  const baseUnitCost = weaponForgeEquivalent / 50;

  const supplementsUnitCost = supplements.reduce((acc, supp) => {
    return acc + (AMMO_SUPPLEMENT_COSTS[supp] ?? 0);
  }, 0);

  const totalBaseCost = Math.round(baseUnitCost * quantity);
  const totalSupplementsCost = supplementsUnitCost * quantity;
  const totalPrice = totalBaseCost + totalSupplementsCost;

  return {
    isValid: true,
    effectiveTier,
    baseUnitCost,
    supplementsUnitCost,
    totalPrice,
    quantity
  };
}
