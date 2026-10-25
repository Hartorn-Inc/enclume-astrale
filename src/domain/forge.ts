export type ItemCategory = 'WEAPON' | 'ARMOR_SHIELD' | 'WONDROUS_ITEM';

export const CATEGORY_COEFFICIENTS: Record<ItemCategory, number> = {
  WEAPON: 1.0,
  ARMOR_SHIELD: 0.85,
  WONDROUS_ITEM: 0.80,
};

export interface EnchantmentSlot {
  id: string;
  name: string;
  slotCost: number;
}

export interface ForgeCraftRequest {
  category: ItemCategory;
  alterationBonus: number;
  slotsCost?: number;
  enchantments?: EnchantmentSlot[];
}

export type ForgeCraftErrorCode =
  | 'CAPACITY_EXCEEDED'
  | 'INVALID_ALTERATION_BONUS'
  | 'INVALID_SLOTS_COST'
  | 'WONDROUS_ITEM_BONUS_NOT_ALLOWED'
  | 'INVALID_PARAMETERS';

export type ForgeCraftResult =
  | {
      isValid: true;
      category: ItemCategory;
      alterationBonus: number;
      slotsCost: number;
      effectiveTier: number;
      pricePlafond: number;
    }
  | {
      isValid: false;
      error: ForgeCraftErrorCode;
      message: string;
    };

export interface UpgradeRequest {
  category: ItemCategory;
  initialTier: number;
  finalTier: number;
}

export type UpgradeErrorCode = 'INVALID_TIER_RANGE' | 'INVALID_PARAMETERS';

export type UpgradeResult =
  | {
      isValid: true;
      category: ItemCategory;
      initialTier: number;
      finalTier: number;
      initialPrice: number;
      finalPrice: number;
      upgradePrice: number;
    }
  | {
      isValid: false;
      error: UpgradeErrorCode;
      message: string;
    };

export interface AmmoCraftRequest {
  effectiveTier: number;
  quantity: number;
  supplements?: number[];
  supplementPerUnit?: number;
}

export type AmmoErrorCode = 'INVALID_QUANTITY' | 'INVALID_EFFECTIVE_TIER';

export type AmmoCraftResult =
  | {
      isValid: true;
      effectiveTier: number;
      quantity: number;
      baseBatchPrice: number;
      supplementsPrice: number;
      totalPrice: number;
    }
  | {
      isValid: false;
      error: AmmoErrorCode;
      message: string;
    };

/**
 * Niveau économique de base T(B) = B * (B + 1) / 2
 * Borné par B ∈ {0, 1, 2, 3, 4}
 */
export function computeBaseTier(alterationBonus: number): number {
  if (!Number.isInteger(alterationBonus) || alterationBonus < 0 || alterationBonus > 4) {
    throw new Error(`Invalid alteration bonus: ${alterationBonus}. Must be an integer between 0 and 4.`);
  }
  return (alterationBonus * (alterationBonus + 1)) / 2;
}

/**
 * Niveau économique effectif N = T(B) + S
 */
export function computeEffectiveTier(alterationBonus: number, slotsCost: number): number {
  if (!Number.isInteger(slotsCost) || slotsCost < 0) {
    throw new Error(`Invalid slots cost: ${slotsCost}. Must be a non-negative integer.`);
  }
  return computeBaseTier(alterationBonus) + slotsCost;
}

/**
 * Calcul du prix plafond pour un niveau effectif et une catégorie donnés
 * P_plafond = Math.round(C * 1000 * N^2)
 */
export function computeTierPrice(category: ItemCategory, effectiveTier: number): number {
  if (!Number.isInteger(effectiveTier) || effectiveTier < 0) {
    throw new Error(`Invalid effective tier: ${effectiveTier}. Must be a non-negative integer.`);
  }
  const coefficient = CATEGORY_COEFFICIENTS[category];
  if (coefficient === undefined) {
    throw new Error(`Unsupported category: ${category}`);
  }
  return Math.round(coefficient * 1000 * Math.pow(effectiveTier, 2));
}

/**
 * Calcul et validation d'un devis de forge
 */
export function calculateForgeCraft(request: ForgeCraftRequest): ForgeCraftResult {
  const { category, alterationBonus } = request;

  if (!Number.isInteger(alterationBonus) || alterationBonus < 0 || alterationBonus > 4) {
    return {
      isValid: false,
      error: 'INVALID_ALTERATION_BONUS',
      message: `Alteration bonus must be an integer between 0 and 4 (received ${alterationBonus}).`,
    };
  }

  let slotsCost = request.slotsCost ?? 0;
  if (request.enchantments && request.enchantments.length > 0) {
    const sumEnchantments = request.enchantments.reduce((sum, item) => sum + item.slotCost, 0);
    slotsCost = request.slotsCost !== undefined ? request.slotsCost : sumEnchantments;
  }

  if (!Number.isInteger(slotsCost) || slotsCost < 0) {
    return {
      isValid: false,
      error: 'INVALID_SLOTS_COST',
      message: `Slots cost must be a non-negative integer (received ${slotsCost}).`,
    };
  }

  if (category === 'WONDROUS_ITEM') {
    if (alterationBonus !== 0) {
      return {
        isValid: false,
        error: 'WONDROUS_ITEM_BONUS_NOT_ALLOWED',
        message: 'Wondrous items cannot possess an alteration bonus (B must be 0).',
      };
    }
    const effectiveTier = slotsCost;
    const pricePlafond = computeTierPrice(category, effectiveTier);
    return {
      isValid: true,
      category,
      alterationBonus: 0,
      slotsCost,
      effectiveTier,
      pricePlafond,
    };
  }

  // WEAPON et ARMOR_SHIELD respectent la règle d'intégrité de capacité : S <= B
  if (slotsCost > alterationBonus) {
    return {
      isValid: false,
      error: 'CAPACITY_EXCEEDED',
      message: `Enchantment slots cost (${slotsCost}) cannot exceed alteration bonus (${alterationBonus}).`,
    };
  }

  const effectiveTier = computeEffectiveTier(alterationBonus, slotsCost);
  const pricePlafond = computeTierPrice(category, effectiveTier);

  return {
    isValid: true,
    category,
    alterationBonus,
    slotsCost,
    effectiveTier,
    pricePlafond,
  };
}

/**
 * Calcul d'amélioration d'objet magique
 * P_amélioration = P_plafond(N_final) - P_plafond(N_init)
 */
export function calculateUpgrade(request: UpgradeRequest): UpgradeResult {
  const { category, initialTier, finalTier } = request;

  if (!Number.isInteger(initialTier) || initialTier < 0 || !Number.isInteger(finalTier) || finalTier < 0) {
    return {
      isValid: false,
      error: 'INVALID_PARAMETERS',
      message: 'Initial and final tiers must be non-negative integers.',
    };
  }

  if (finalTier <= initialTier) {
    return {
      isValid: false,
      error: 'INVALID_TIER_RANGE',
      message: `Final tier (${finalTier}) must be strictly greater than initial tier (${initialTier}).`,
    };
  }

  const initialPrice = computeTierPrice(category, initialTier);
  const finalPrice = computeTierPrice(category, finalTier);
  const upgradePrice = finalPrice - initialPrice;

  return {
    isValid: true,
    category,
    initialTier,
    finalTier,
    initialPrice,
    finalPrice,
    upgradePrice,
  };
}

/**
 * Calcul du prix pour un lot de munitions enchantées
 * P = Math.round((1000 * N^2 / 50) * Q) + sum(supplements * Q)
 */
export function calculateAmmoCraft(request: AmmoCraftRequest): AmmoCraftResult {
  const { effectiveTier, quantity, supplements = [], supplementPerUnit = 0 } = request;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return {
      isValid: false,
      error: 'INVALID_QUANTITY',
      message: `Ammo batch quantity must be a positive integer (received ${quantity}).`,
    };
  }

  if (!Number.isInteger(effectiveTier) || effectiveTier <= 0) {
    return {
      isValid: false,
      error: 'INVALID_EFFECTIVE_TIER',
      message: `Effective tier must be a positive integer (received ${effectiveTier}).`,
    };
  }

  const weaponFullForgePrice = 1000 * Math.pow(effectiveTier, 2);
  const baseBatchPrice = Math.round((weaponFullForgePrice / 50) * quantity);
  const perUnitSupplementTotal = supplementPerUnit + supplements.reduce((acc, s) => acc + s, 0);
  const supplementsPrice = Math.round(perUnitSupplementTotal * quantity);
  const totalPrice = baseBatchPrice + supplementsPrice;

  return {
    isValid: true,
    effectiveTier,
    quantity,
    baseBatchPrice,
    supplementsPrice,
    totalPrice,
  };
}
