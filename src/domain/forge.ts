export type ItemCategory = 'WEAPON' | 'ARMOR_SHIELD' | 'WONDROUS_ITEM';

export type AmmoSupplement = 'UNBREAKABLE' | 'STRIKING' | 'SILVERED';

export const CATEGORY_COEFFICIENTS: Readonly<Record<ItemCategory, number>> = {
  WEAPON: 1.0,
  ARMOR_SHIELD: 0.85,
  WONDROUS_ITEM: 0.8,
};

export const AMMO_SUPPLEMENT_COSTS: Readonly<Record<AmmoSupplement, number>> = {
  UNBREAKABLE: 20,
  STRIKING: 20,
  SILVERED: 10,
};

export interface EnchantmentSlot {
  id?: string;
  name: string;
  cost: number;
  description?: string;
}

export type SlotInput = number | EnchantmentSlot;

export function resolveSlots(slots?: number | (SlotInput)[]): number {
  if (slots === undefined || slots === null) {
    return 0;
  }
  if (typeof slots === 'number') {
    return slots;
  }
  if (Array.isArray(slots)) {
    return slots.reduce<number>((sum, item) => {
      if (typeof item === 'number') {
        return sum + item;
      }
      if (typeof item === 'object' && item !== null && typeof item.cost === 'number') {
        return sum + item.cost;
      }
      return sum;
    }, 0);
  }
  return 0;
}

export function computeBaseTier(bonus: number): number {
  if (!Number.isInteger(bonus) || bonus < 0 || bonus > 4) {
    throw new RangeError(
      `Bonus d'altération invalide: ${bonus}. Le bonus B doit être un entier compris entre 0 et 4.`
    );
  }
  return (bonus * (bonus + 1)) / 2;
}

export function computeEffectiveTier(bonus: number, slots: number): number {
  if (!Number.isInteger(slots) || slots < 0) {
    throw new RangeError(
      `Nombre de slots invalide: ${slots}. Les slots doivent être un entier positif ou nul.`
    );
  }
  return computeBaseTier(bonus) + slots;
}

export function calculatePriceCeiling(category: ItemCategory, effectiveTier: number): number {
  const coefficient = CATEGORY_COEFFICIENTS[category];
  if (coefficient === undefined) {
    throw new RangeError(`Catégorie d'objet inconnue: ${category}`);
  }
  if (!Number.isInteger(effectiveTier) || effectiveTier < 0) {
    throw new RangeError(
      `Le niveau effectif N doit être un entier positif ou nul, reçu: ${effectiveTier}`
    );
  }
  return Math.round(coefficient * 1000 * effectiveTier ** 2);
}

export interface ForgeCraftRequest {
  category: ItemCategory;
  bonus: number;
  slots?: number | (SlotInput)[];
}

export interface ForgeCraftSuccess {
  isValid: true;
  category: ItemCategory;
  bonus: number;
  slotsUsed: number;
  baseTier: number;
  effectiveTier: number;
  priceCeiling: number;
}

export interface ForgeCraftFailure {
  isValid: false;
  error: 'CAPACITY_EXCEEDED' | 'INVALID_BONUS' | 'INVALID_CATEGORY' | 'NEGATIVE_SLOTS';
  message: string;
}

export type ForgeCraftResult = ForgeCraftSuccess | ForgeCraftFailure;

export function calculateForgeCraft(request: ForgeCraftRequest): ForgeCraftResult {
  if (!CATEGORY_COEFFICIENTS[request.category]) {
    return {
      isValid: false,
      error: 'INVALID_CATEGORY',
      message: `Catégorie d'objet invalide : ${request.category}.`,
    };
  }

  const slots = resolveSlots(request.slots);
  if (slots < 0 || !Number.isInteger(slots)) {
    return {
      isValid: false,
      error: 'NEGATIVE_SLOTS',
      message: `Le nombre de slots d'enchantement doit être un entier positif ou nul. Reçu: ${slots}.`,
    };
  }

  if (request.category === 'WONDROUS_ITEM') {
    if (request.bonus !== 0) {
      return {
        isValid: false,
        error: 'INVALID_BONUS',
        message: `Les objets autonomes (WONDROUS_ITEM) requièrent un bonus d'altération nul (B=0). Reçu: ${request.bonus}.`,
      };
    }
    const effectiveTier = slots;
    const priceCeiling = calculatePriceCeiling('WONDROUS_ITEM', effectiveTier);
    return {
      isValid: true,
      category: 'WONDROUS_ITEM',
      bonus: 0,
      slotsUsed: slots,
      baseTier: 0,
      effectiveTier,
      priceCeiling,
    };
  }

  if (!Number.isInteger(request.bonus) || request.bonus < 0 || request.bonus > 4) {
    return {
      isValid: false,
      error: 'INVALID_BONUS',
      message: `Le bonus d'altération nu B doit être compris entre 0 et 4. Reçu: ${request.bonus}.`,
    };
  }

  if (slots > request.bonus) {
    return {
      isValid: false,
      error: 'CAPACITY_EXCEEDED',
      message: `Capacité dépassée : ${slots} slots demandés pour un bonus d'altération de +${request.bonus} (maximum autorisé: ${request.bonus}).`,
    };
  }

  const baseTier = computeBaseTier(request.bonus);
  const effectiveTier = baseTier + slots;
  const priceCeiling = calculatePriceCeiling(request.category, effectiveTier);

  return {
    isValid: true,
    category: request.category,
    bonus: request.bonus,
    slotsUsed: slots,
    baseTier,
    effectiveTier,
    priceCeiling,
  };
}

export interface UpgradeRequest {
  category: ItemCategory;
  initialBonus: number;
  initialSlots?: number | (SlotInput)[];
  targetBonus: number;
  targetSlots?: number | (SlotInput)[];
}

export interface UpgradeSuccess {
  isValid: true;
  category: ItemCategory;
  initialTier: number;
  targetTier: number;
  initialPriceCeiling: number;
  targetPriceCeiling: number;
  upgradeCost: number;
}

export interface UpgradeFailure {
  isValid: false;
  error: 'INVALID_UPGRADE_TIER' | 'CAPACITY_EXCEEDED' | 'INVALID_BONUS' | 'INVALID_CATEGORY' | 'NEGATIVE_SLOTS';
  message: string;
}

export type UpgradeResult = UpgradeSuccess | UpgradeFailure;

export function calculateUpgrade(request: UpgradeRequest): UpgradeResult {
  const initialResult = calculateForgeCraft({
    category: request.category,
    bonus: request.initialBonus,
    slots: request.initialSlots,
  });
  if (!initialResult.isValid) {
    return {
      isValid: false,
      error: initialResult.error,
      message: `Objet initial invalide : ${initialResult.message}`,
    };
  }

  const targetResult = calculateForgeCraft({
    category: request.category,
    bonus: request.targetBonus,
    slots: request.targetSlots,
  });
  if (!targetResult.isValid) {
    return {
      isValid: false,
      error: targetResult.error,
      message: `Objet cible invalide : ${targetResult.message}`,
    };
  }

  if (targetResult.effectiveTier <= initialResult.effectiveTier) {
    return {
      isValid: false,
      error: 'INVALID_UPGRADE_TIER',
      message: `Le niveau effectif cible (${targetResult.effectiveTier}) doit être strictement supérieur au niveau initial (${initialResult.effectiveTier}).`,
    };
  }

  const upgradeCost = targetResult.priceCeiling - initialResult.priceCeiling;
  return {
    isValid: true,
    category: request.category,
    initialTier: initialResult.effectiveTier,
    targetTier: targetResult.effectiveTier,
    initialPriceCeiling: initialResult.priceCeiling,
    targetPriceCeiling: targetResult.priceCeiling,
    upgradeCost,
  };
}

export interface AmmoCraftRequest {
  bonus: number;
  slots?: number | (SlotInput)[];
  quantity: number;
  supplements?: (AmmoSupplement | number)[];
}

export interface AmmoCraftSuccess {
  isValid: true;
  bonus: number;
  slotsUsed: number;
  effectiveTier: number;
  quantity: number;
  basePrice: number;
  supplementPrice: number;
  totalPrice: number;
}

export interface AmmoCraftFailure {
  isValid: false;
  error: 'CAPACITY_EXCEEDED' | 'INVALID_BONUS' | 'INVALID_QUANTITY' | 'NEGATIVE_SLOTS';
  message: string;
}

export type AmmoCraftResult = AmmoCraftSuccess | AmmoCraftFailure;

export function calculateAmmoCraft(request: AmmoCraftRequest): AmmoCraftResult {
  if (!Number.isInteger(request.quantity) || request.quantity <= 0) {
    return {
      isValid: false,
      error: 'INVALID_QUANTITY',
      message: `La taille de lot de munitions doit être un entier strictement positif. Reçu: ${request.quantity}.`,
    };
  }

  if (!Number.isInteger(request.bonus) || request.bonus < 0 || request.bonus > 4) {
    return {
      isValid: false,
      error: 'INVALID_BONUS',
      message: `Le bonus d'altération nu B doit être compris entre 0 et 4. Reçu: ${request.bonus}.`,
    };
  }

  const slots = resolveSlots(request.slots);
  if (slots < 0 || !Number.isInteger(slots)) {
    return {
      isValid: false,
      error: 'NEGATIVE_SLOTS',
      message: `Le nombre de slots d'enchantement doit être un entier positif ou nul. Reçu: ${slots}.`,
    };
  }

  if (slots > request.bonus) {
    return {
      isValid: false,
      error: 'CAPACITY_EXCEEDED',
      message: `Capacité dépassée : ${slots} slots demandés pour des munitions au bonus de +${request.bonus} (maximum autorisé: ${request.bonus}).`,
    };
  }

  const baseTier = computeBaseTier(request.bonus);
  const effectiveTier = baseTier + slots;

  const basePrice = Math.round(((1000 * effectiveTier ** 2) / 50) * request.quantity);

  let unitSupplement = 0;
  if (request.supplements && request.supplements.length > 0) {
    for (const sup of request.supplements) {
      if (typeof sup === 'number') {
        unitSupplement += sup > 0 ? sup : 0;
      } else if (sup in AMMO_SUPPLEMENT_COSTS) {
        unitSupplement += AMMO_SUPPLEMENT_COSTS[sup];
      }
    }
  }

  const supplementPrice = unitSupplement * request.quantity;
  const totalPrice = basePrice + supplementPrice;

  return {
    isValid: true,
    bonus: request.bonus,
    slotsUsed: slots,
    effectiveTier,
    quantity: request.quantity,
    basePrice,
    supplementPrice,
    totalPrice,
  };
}
