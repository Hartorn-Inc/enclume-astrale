export type ItemCategory = 'WEAPON' | 'ARMOR_SHIELD' | 'WONDROUS_ITEM';

export type AmmoSupplement = 'UNBREAKABLE' | 'IMPACT' | 'SILVERED';

export const AMMO_SUPPLEMENT_COSTS: Record<AmmoSupplement, number> = {
  UNBREAKABLE: 20,
  IMPACT: 20,
  SILVERED: 10,
};

export const CATEGORY_COEFFICIENTS: Record<ItemCategory, number> = {
  WEAPON: 1.0,
  ARMOR_SHIELD: 0.85,
  WONDROUS_ITEM: 0.8,
};

export interface EnchantmentSlot {
  id: string;
  name: string;
  slotCost: number;
  description?: string;
}

export interface ForgeCraftRequest {
  category: ItemCategory;
  baseBonus: number;
  slotCost: number;
}

export type ForgeCraftError =
  | 'CAPACITY_EXCEEDED'
  | 'INVALID_BASE_BONUS'
  | 'INVALID_SLOT_COST'
  | 'WONDROUS_ITEM_NO_BASE_BONUS';

export type ForgeCraftResult =
  | {
      isValid: true;
      category: ItemCategory;
      baseBonus: number;
      slotCost: number;
      baseTier: number;
      effectiveTier: number;
      ceilingPrice: number;
    }
  | {
      isValid: false;
      error: ForgeCraftError;
    };

export interface UpgradeRequest {
  category: ItemCategory;
  initialBaseBonus: number;
  initialSlotCost: number;
  finalBaseBonus: number;
  finalSlotCost: number;
}

export type UpgradeError = ForgeCraftError | 'INVALID_UPGRADE_TIER';

export type UpgradeResult =
  | {
      isValid: true;
      category: ItemCategory;
      initialTier: number;
      finalTier: number;
      initialCeilingPrice: number;
      finalCeilingPrice: number;
      upgradePrice: number;
    }
  | {
      isValid: false;
      error: UpgradeError;
    };

export interface AmmoCraftRequest {
  baseBonus: number;
  slotCost?: number;
  quantity: number;
  supplements?: AmmoSupplement[];
}

export type AmmoCraftResult =
  | {
      isValid: true;
      effectiveTier: number;
      quantity: number;
      baseUnitCost: number;
      supplementsUnitCost: number;
      totalPrice: number;
    }
  | {
      isValid: false;
      error: ForgeCraftError | 'INVALID_QUANTITY';
    };

export function computeBaseTier(baseBonus: number): number {
  if (!Number.isInteger(baseBonus) || baseBonus < 0 || baseBonus > 4) {
    throw new RangeError(
      `Bonus d'altération invalide: ${baseBonus}. La valeur doit être un entier compris entre 0 et 4.`
    );
  }
  return (baseBonus * (baseBonus + 1)) / 2;
}

export function computeEffectiveTier(baseBonus: number, slotCost: number): number {
  return computeBaseTier(baseBonus) + slotCost;
}

export function computeCeilingPrice(category: ItemCategory, effectiveTier: number): number {
  const coefficient = CATEGORY_COEFFICIENTS[category];
  return Math.round(coefficient * 1000 * effectiveTier * effectiveTier);
}

export function sumEnchantmentSlots(slots: EnchantmentSlot[]): number {
  return slots.reduce((acc, slot) => acc + slot.slotCost, 0);
}

export function computeCraftQuote(request: ForgeCraftRequest): ForgeCraftResult {
  const { category, baseBonus, slotCost } = request;

  if (!Number.isInteger(baseBonus) || baseBonus < 0 || baseBonus > 4) {
    return { isValid: false, error: 'INVALID_BASE_BONUS' };
  }

  if (!Number.isInteger(slotCost) || slotCost < 0) {
    return { isValid: false, error: 'INVALID_SLOT_COST' };
  }

  if (category === 'WONDROUS_ITEM') {
    if (baseBonus !== 0) {
      return { isValid: false, error: 'WONDROUS_ITEM_NO_BASE_BONUS' };
    }
    const effectiveTier = slotCost;
    const ceilingPrice = computeCeilingPrice(category, effectiveTier);
    return {
      isValid: true,
      category,
      baseBonus: 0,
      slotCost,
      baseTier: 0,
      effectiveTier,
      ceilingPrice,
    };
  }

  if (slotCost > baseBonus) {
    return { isValid: false, error: 'CAPACITY_EXCEEDED' };
  }

  const baseTier = computeBaseTier(baseBonus);
  const effectiveTier = baseTier + slotCost;
  const ceilingPrice = computeCeilingPrice(category, effectiveTier);

  return {
    isValid: true,
    category,
    baseBonus,
    slotCost,
    baseTier,
    effectiveTier,
    ceilingPrice,
  };
}

export function computeUpgradeQuote(request: UpgradeRequest): UpgradeResult {
  const initialQuote = computeCraftQuote({
    category: request.category,
    baseBonus: request.initialBaseBonus,
    slotCost: request.initialSlotCost,
  });

  if (!initialQuote.isValid) {
    return { isValid: false, error: initialQuote.error };
  }

  const finalQuote = computeCraftQuote({
    category: request.category,
    baseBonus: request.finalBaseBonus,
    slotCost: request.finalSlotCost,
  });

  if (!finalQuote.isValid) {
    return { isValid: false, error: finalQuote.error };
  }

  if (finalQuote.effectiveTier <= initialQuote.effectiveTier) {
    return { isValid: false, error: 'INVALID_UPGRADE_TIER' };
  }

  const upgradePrice = finalQuote.ceilingPrice - initialQuote.ceilingPrice;

  return {
    isValid: true,
    category: request.category,
    initialTier: initialQuote.effectiveTier,
    finalTier: finalQuote.effectiveTier,
    initialCeilingPrice: initialQuote.ceilingPrice,
    finalCeilingPrice: finalQuote.ceilingPrice,
    upgradePrice,
  };
}

export function computeAmmoQuote(request: AmmoCraftRequest): AmmoCraftResult {
  const { baseBonus, slotCost = 0, quantity, supplements = [] } = request;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { isValid: false, error: 'INVALID_QUANTITY' };
  }

  const weaponValidation = computeCraftQuote({
    category: 'WEAPON',
    baseBonus,
    slotCost,
  });

  if (!weaponValidation.isValid) {
    return { isValid: false, error: weaponValidation.error };
  }

  const effectiveTier = weaponValidation.effectiveTier;
  const baseWeaponCeiling = computeCeilingPrice('WEAPON', effectiveTier);
  const baseUnitCost = baseWeaponCeiling / 50;
  const supplementsUnitCost = supplements.reduce(
    (sum, supp) => sum + (AMMO_SUPPLEMENT_COSTS[supp] ?? 0),
    0
  );

  const totalPrice = Math.round(
    (baseWeaponCeiling / 50) * quantity + supplementsUnitCost * quantity
  );

  return {
    isValid: true,
    effectiveTier,
    quantity,
    baseUnitCost,
    supplementsUnitCost,
    totalPrice,
  };
}
