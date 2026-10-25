export type ItemCategory = 'WEAPON' | 'ARMOR_SHIELD' | 'WONDROUS_ITEM';

export const CATEGORY_COEFFICIENTS: Record<ItemCategory, number> = {
  WEAPON: 1.0,
  ARMOR_SHIELD: 0.85,
  WONDROUS_ITEM: 0.8,
};

export interface EnchantmentSlot {
  id?: string;
  name: string;
  slots: number;
}

export type ForgeCraftError =
  | 'CAPACITY_EXCEEDED'
  | 'INVALID_BONUS'
  | 'INVALID_SLOTS'
  | 'WONDROUS_BONUS_NOT_ZERO';

export interface ForgeCraftRequest {
  category: ItemCategory;
  enhancementBonus: number;
  slots?: number;
  enchantments?: EnchantmentSlot[];
}

export interface ForgeCraftSuccess {
  isValid: true;
  effectiveTier: number;
  ceilingPrice: number;
  categoryCoefficient: number;
}

export interface ForgeCraftFailure {
  isValid: false;
  error: ForgeCraftError;
}

export type ForgeCraftResult = ForgeCraftSuccess | ForgeCraftFailure;

export interface UpgradeRequest {
  category: ItemCategory;
  initialEnhancementBonus: number;
  initialSlots?: number;
  initialEnchantments?: EnchantmentSlot[];
  finalEnhancementBonus: number;
  finalSlots?: number;
  finalEnchantments?: EnchantmentSlot[];
}

export interface UpgradeSuccess {
  isValid: true;
  initialCeilingPrice: number;
  finalCeilingPrice: number;
  upgradeCost: number;
}

export interface UpgradeFailure {
  isValid: false;
  error: 'INVALID_UPGRADE_TIER' | ForgeCraftError;
}

export type UpgradeResult = UpgradeSuccess | UpgradeFailure;

export type AmmoSupplementType = 'UNBREAKABLE' | 'PIERCING' | 'SILVERED';

export const AMMO_SUPPLEMENT_COSTS: Record<AmmoSupplementType, number> = {
  UNBREAKABLE: 20,
  PIERCING: 20,
  SILVERED: 10,
};

export interface AmmoCraftRequest {
  enhancementBonus: number;
  slots?: number;
  enchantments?: EnchantmentSlot[];
  quantity: number;
  supplements?: (AmmoSupplementType | number)[];
  supplementCostPerUnit?: number;
}

export interface AmmoCraftSuccess {
  isValid: true;
  effectiveTier: number;
  unitBasePrice: number;
  totalPrice: number;
}

export interface AmmoCraftFailure {
  isValid: false;
  error: 'CAPACITY_EXCEEDED' | 'INVALID_BONUS' | 'INVALID_SLOTS' | 'INVALID_QUANTITY';
}

export type AmmoCraftResult = AmmoCraftSuccess | AmmoCraftFailure;

export function computeBaseTier(bonus: number): number {
  if (!Number.isInteger(bonus) || bonus < 0 || bonus > 4) {
    throw new Error(`Invalid enhancement bonus: ${bonus}. Must be an integer between 0 and 4.`);
  }
  return (bonus * (bonus + 1)) / 2;
}

export function computeEffectiveTier(bonus: number, slots: number = 0): number {
  return computeBaseTier(bonus) + slots;
}

export function resolveTotalSlots(directSlots?: number, enchantments?: EnchantmentSlot[]): number {
  const listSlots = enchantments?.reduce((acc, curr) => acc + (curr.slots || 0), 0) ?? 0;
  return (directSlots ?? 0) + listSlots;
}

export function calculateForgeQuote(request: ForgeCraftRequest): ForgeCraftResult {
  const slots = resolveTotalSlots(request.slots, request.enchantments);
  if (!Number.isInteger(slots) || slots < 0) {
    return { isValid: false, error: 'INVALID_SLOTS' };
  }

  if (request.category === 'WONDROUS_ITEM') {
    if (request.enhancementBonus !== 0) {
      return { isValid: false, error: 'WONDROUS_BONUS_NOT_ZERO' };
    }
    const effectiveTier = slots;
    const coefficient = CATEGORY_COEFFICIENTS.WONDROUS_ITEM;
    const ceilingPrice = Math.round(coefficient * 1000 * (effectiveTier ** 2));
    return {
      isValid: true,
      effectiveTier,
      ceilingPrice,
      categoryCoefficient: coefficient,
    };
  }

  if (!Number.isInteger(request.enhancementBonus) || request.enhancementBonus < 0 || request.enhancementBonus > 4) {
    return { isValid: false, error: 'INVALID_BONUS' };
  }

  if (slots > request.enhancementBonus) {
    return { isValid: false, error: 'CAPACITY_EXCEEDED' };
  }

  const effectiveTier = computeEffectiveTier(request.enhancementBonus, slots);
  const coefficient = CATEGORY_COEFFICIENTS[request.category];
  const ceilingPrice = Math.round(coefficient * 1000 * (effectiveTier ** 2));

  return {
    isValid: true,
    effectiveTier,
    ceilingPrice,
    categoryCoefficient: coefficient,
  };
}

export function calculateUpgradeQuote(request: UpgradeRequest): UpgradeResult {
  const initialQuote = calculateForgeQuote({
    category: request.category,
    enhancementBonus: request.initialEnhancementBonus,
    slots: request.initialSlots,
    enchantments: request.initialEnchantments,
  });

  if (!initialQuote.isValid) {
    return initialQuote;
  }

  const finalQuote = calculateForgeQuote({
    category: request.category,
    enhancementBonus: request.finalEnhancementBonus,
    slots: request.finalSlots,
    enchantments: request.finalEnchantments,
  });

  if (!finalQuote.isValid) {
    return finalQuote;
  }

  if (finalQuote.effectiveTier <= initialQuote.effectiveTier) {
    return { isValid: false, error: 'INVALID_UPGRADE_TIER' };
  }

  const upgradeCost = finalQuote.ceilingPrice - initialQuote.ceilingPrice;

  return {
    isValid: true,
    initialCeilingPrice: initialQuote.ceilingPrice,
    finalCeilingPrice: finalQuote.ceilingPrice,
    upgradeCost,
  };
}

export function calculateAmmoQuote(request: AmmoCraftRequest): AmmoCraftResult {
  if (!Number.isInteger(request.quantity) || request.quantity <= 0) {
    return { isValid: false, error: 'INVALID_QUANTITY' };
  }

  if (!Number.isInteger(request.enhancementBonus) || request.enhancementBonus < 0 || request.enhancementBonus > 4) {
    return { isValid: false, error: 'INVALID_BONUS' };
  }

  const slots = resolveTotalSlots(request.slots, request.enchantments);
  if (!Number.isInteger(slots) || slots < 0) {
    return { isValid: false, error: 'INVALID_SLOTS' };
  }

  if (slots > request.enhancementBonus) {
    return { isValid: false, error: 'CAPACITY_EXCEEDED' };
  }

  const effectiveTier = computeEffectiveTier(request.enhancementBonus, slots);
  const unitBasePrice = (1000 * (effectiveTier ** 2)) / 50;

  let unitSupplementCost = request.supplementCostPerUnit ?? 0;
  if (request.supplements && request.supplements.length > 0) {
    for (const sup of request.supplements) {
      if (typeof sup === 'string') {
        unitSupplementCost += AMMO_SUPPLEMENT_COSTS[sup] ?? 0;
      } else if (typeof sup === 'number') {
        unitSupplementCost += sup;
      }
    }
  }

  const totalSupplementCost = unitSupplementCost * request.quantity;
  const totalPrice = Math.round(unitBasePrice * request.quantity) + totalSupplementCost;

  return {
    isValid: true,
    effectiveTier,
    unitBasePrice,
    totalPrice,
  };
}
