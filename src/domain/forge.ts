/**
 * L'Enclume Astrale — Domaine de forge arcanique et d'économie magique
 */

export type ItemCategory = 'WEAPON' | 'ARMOR_SHIELD' | 'WONDROUS_ITEM';

export const CATEGORY_COEFFICIENTS: Record<ItemCategory, number> = {
  WEAPON: 1.0,
  ARMOR_SHIELD: 0.85,
  WONDROUS_ITEM: 0.8,
};

export const AMMO_SUPPLEMENTS = {
  UNBREAKABLE: 20,
  PIERCING: 20,
  SILVERED: 10,
} as const;

export type AmmoSupplementType = keyof typeof AMMO_SUPPLEMENTS;

export interface EnchantmentSlot {
  id?: string;
  name?: string;
  slots: number;
}

export interface ForgeCraftRequest {
  category: ItemCategory;
  bonus: number;
  slots?: number;
  enchantments?: EnchantmentSlot[];
}

export type ForgeCraftErrorCode =
  | 'CAPACITY_EXCEEDED'
  | 'INVALID_BONUS'
  | 'WONDROUS_CANNOT_HAVE_BONUS'
  | 'INVALID_UPGRADE_TIER'
  | 'INVALID_QUANTITY';

export interface ForgeCraftSuccess {
  isValid: true;
  category: ItemCategory;
  bonus: number;
  totalSlots: number;
  effectiveTier: number;
  baseCost: number;
  ceilingPrice: number;
}

export interface ForgeCraftFailure {
  isValid: false;
  error: ForgeCraftErrorCode;
  message?: string;
}

export type ForgeCraftResult = ForgeCraftSuccess | ForgeCraftFailure;

export interface UpgradeRequest {
  category: ItemCategory;
  initialBonus?: number;
  initialSlots?: number;
  initialTier?: number;
  finalBonus?: number;
  finalSlots?: number;
  finalTier?: number;
}

export interface UpgradeSuccess {
  isValid: true;
  category: ItemCategory;
  initialEffectiveTier: number;
  finalEffectiveTier: number;
  initialCeilingPrice: number;
  finalCeilingPrice: number;
  upgradeCost: number;
}

export interface UpgradeFailure {
  isValid: false;
  error: ForgeCraftErrorCode;
  message?: string;
}

export type UpgradeResult = UpgradeSuccess | UpgradeFailure;

export interface AmmoSupplementItem {
  name?: string;
  costPerUnit: number;
}

export type AmmoSupplementInput =
  | AmmoSupplementType
  | number
  | AmmoSupplementItem;

export interface AmmoCraftRequest {
  bonus: number;
  slots?: number;
  quantity: number;
  supplements?: AmmoSupplementInput[];
}

export interface AmmoCraftSuccess {
  isValid: true;
  bonus: number;
  slots: number;
  effectiveTier: number;
  quantity: number;
  unitBasePrice: number;
  supplementsCostTotal: number;
  totalCeilingPrice: number;
}

export interface AmmoCraftFailure {
  isValid: false;
  error: ForgeCraftErrorCode;
  message?: string;
}

export type AmmoCraftResult = AmmoCraftSuccess | AmmoCraftFailure;

/**
 * Calcule le niveau économique de base T(B) = B * (B + 1) / 2
 * B doit appartenir à {0, 1, 2, 3, 4}
 */
export function computeBaseTier(bonus: number): number {
  if (!Number.isInteger(bonus) || bonus < 0 || bonus > 4) {
    throw new Error(`Invalid bonus: ${bonus}. Must be an integer between 0 and 4.`);
  }
  return (bonus * (bonus + 1)) / 2;
}

/**
 * Calcule le niveau économique effectif N = T(B) + S
 */
export function computeEffectiveTier(bonus: number, slots: number): number {
  if (!Number.isInteger(slots) || slots < 0) {
    throw new Error(`Invalid slots: ${slots}. Must be a non-negative integer.`);
  }
  return computeBaseTier(bonus) + slots;
}

/**
 * Calcule le prix plafond garanti en po : P_plafond = Math.round(C * 1000 * N^2)
 */
export function computeCeilingPrice(category: ItemCategory, effectiveTier: number): number {
  const coef = CATEGORY_COEFFICIENTS[category];
  if (coef === undefined) {
    throw new Error(`Unknown category: ${category}`);
  }
  if (!Number.isInteger(effectiveTier) || effectiveTier < 0) {
    throw new Error(`Invalid effective tier: ${effectiveTier}`);
  }
  return Math.round(coef * 1000 * effectiveTier ** 2);
}

/**
 * Effectue le calcul complet de forge d'un objet en appliquant les règles de capacité
 */
export function computeForgeCraft(request: ForgeCraftRequest): ForgeCraftResult {
  const { category, bonus } = request;

  if (!Number.isInteger(bonus) || bonus < 0 || bonus > 4) {
    return { isValid: false, error: 'INVALID_BONUS' };
  }

  const totalSlots =
    request.slots !== undefined
      ? request.slots
      : (request.enchantments ?? []).reduce((acc, curr) => acc + curr.slots, 0);

  if (!Number.isInteger(totalSlots) || totalSlots < 0) {
    return { isValid: false, error: 'CAPACITY_EXCEEDED' };
  }

  if (category === 'WONDROUS_ITEM') {
    if (bonus !== 0) {
      return { isValid: false, error: 'WONDROUS_CANNOT_HAVE_BONUS' };
    }
    const effectiveTier = totalSlots;
    const ceilingPrice = computeCeilingPrice('WONDROUS_ITEM', effectiveTier);
    return {
      isValid: true,
      category,
      bonus,
      totalSlots,
      effectiveTier,
      baseCost: ceilingPrice,
      ceilingPrice,
    };
  }

  // Règle d'intégrité de capacité pour WEAPON et ARMOR_SHIELD : S <= B
  if (totalSlots > bonus) {
    return { isValid: false, error: 'CAPACITY_EXCEEDED' };
  }

  const effectiveTier = computeEffectiveTier(bonus, totalSlots);
  const ceilingPrice = computeCeilingPrice(category, effectiveTier);

  return {
    isValid: true,
    category,
    bonus,
    totalSlots,
    effectiveTier,
    baseCost: ceilingPrice,
    ceilingPrice,
  };
}

/**
 * Calcule le coût d'amélioration d'un objet existant
 * P_amélioration = P_plafond(N_final) - P_plafond(N_init) avec N_final > N_init
 */
export function computeUpgradeCraft(request: UpgradeRequest): UpgradeResult {
  const { category } = request;

  let initialTier: number;
  let finalTier: number;

  if (request.initialTier !== undefined) {
    initialTier = request.initialTier;
  } else {
    const b = request.initialBonus ?? 0;
    const s = request.initialSlots ?? 0;
    if (category === 'WONDROUS_ITEM' && b !== 0) {
      return { isValid: false, error: 'WONDROUS_CANNOT_HAVE_BONUS' };
    }
    if ((category === 'WEAPON' || category === 'ARMOR_SHIELD') && s > b) {
      return { isValid: false, error: 'CAPACITY_EXCEEDED' };
    }
    if (!Number.isInteger(b) || b < 0 || b > 4) {
      return { isValid: false, error: 'INVALID_BONUS' };
    }
    initialTier = category === 'WONDROUS_ITEM' ? s : computeEffectiveTier(b, s);
  }

  if (request.finalTier !== undefined) {
    finalTier = request.finalTier;
  } else {
    const b = request.finalBonus ?? 0;
    const s = request.finalSlots ?? 0;
    if (category === 'WONDROUS_ITEM' && b !== 0) {
      return { isValid: false, error: 'WONDROUS_CANNOT_HAVE_BONUS' };
    }
    if ((category === 'WEAPON' || category === 'ARMOR_SHIELD') && s > b) {
      return { isValid: false, error: 'CAPACITY_EXCEEDED' };
    }
    if (!Number.isInteger(b) || b < 0 || b > 4) {
      return { isValid: false, error: 'INVALID_BONUS' };
    }
    finalTier = category === 'WONDROUS_ITEM' ? s : computeEffectiveTier(b, s);
  }

  if (!Number.isInteger(initialTier) || !Number.isInteger(finalTier) || finalTier <= initialTier) {
    return { isValid: false, error: 'INVALID_UPGRADE_TIER' };
  }

  const initialCeilingPrice = computeCeilingPrice(category, initialTier);
  const finalCeilingPrice = computeCeilingPrice(category, finalTier);
  const upgradeCost = finalCeilingPrice - initialCeilingPrice;

  return {
    isValid: true,
    category,
    initialEffectiveTier: initialTier,
    finalEffectiveTier: finalTier,
    initialCeilingPrice,
    finalCeilingPrice,
    upgradeCost,
  };
}

/**
 * Calcule le devis pour un lot de munitions magiques
 * P = Math.round((1000 * N^2 / 50) * Q) + sum(supplements * Q)
 */
export function computeAmmoCraft(request: AmmoCraftRequest): AmmoCraftResult {
  const { bonus, quantity } = request;
  const slots = request.slots ?? 0;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { isValid: false, error: 'INVALID_QUANTITY' };
  }

  if (!Number.isInteger(bonus) || bonus < 0 || bonus > 4) {
    return { isValid: false, error: 'INVALID_BONUS' };
  }

  if (slots > bonus || slots < 0) {
    return { isValid: false, error: 'CAPACITY_EXCEEDED' };
  }

  const effectiveTier = computeEffectiveTier(bonus, slots);
  const unitBasePrice = Math.round((1000 * effectiveTier ** 2) / 50);
  const baseBatchPrice = unitBasePrice * quantity;

  let suppUnitCost = 0;
  if (request.supplements && request.supplements.length > 0) {
    for (const supp of request.supplements) {
      if (typeof supp === 'string') {
        if (supp in AMMO_SUPPLEMENTS) {
          suppUnitCost += AMMO_SUPPLEMENTS[supp as AmmoSupplementType];
        }
      } else if (typeof supp === 'number') {
        suppUnitCost += supp;
      } else if (typeof supp === 'object' && supp !== null && 'costPerUnit' in supp) {
        suppUnitCost += supp.costPerUnit;
      }
    }
  }

  const supplementsCostTotal = suppUnitCost * quantity;
  const totalCeilingPrice = baseBatchPrice + supplementsCostTotal;

  return {
    isValid: true,
    bonus,
    slots,
    effectiveTier,
    quantity,
    unitBasePrice,
    supplementsCostTotal,
    totalCeilingPrice,
  };
}
