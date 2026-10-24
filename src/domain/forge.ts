import {
  AlterationBonus,
  ItemCategory,
  EnchantmentSlotEffect,
  ForgeRequest,
  ForgeResult,
  ForgeQuote,
  ForgeError,
  MunitionRequest,
  MunitionResult,
  MunitionSupplement,
} from './types';

export const CATEGORY_COEFFICIENTS: Record<ItemCategory, number> = {
  weapon: 1.0,
  armor_shield: 0.85,
  standalone: 0.8,
};

export const MUNITION_SUPPLEMENT_PRICES: Record<MunitionSupplement, number> = {
  unbreakable: 20,
  impact: 20,
  silvered: 10,
};

export function resolveSlotSum(slots?: number | EnchantmentSlotEffect[]): number {
  if (!slots) return 0;
  if (typeof slots === 'number') {
    return Math.max(0, Math.floor(slots));
  }
  return slots.reduce((total, effect) => total + Math.max(0, effect.slotCost), 0);
}

export function calculateBaseLevel(b: AlterationBonus): number {
  return (b * (b + 1)) / 2;
}

export function calculateEffectiveLevel(b: AlterationBonus, slotSum: number): number {
  return calculateBaseLevel(b) + slotSum;
}

export function calculateCeilingFromLevel(category: ItemCategory, effectiveLevel: number): number {
  const coefficient = CATEGORY_COEFFICIENTS[category];
  return Math.round(coefficient * 1000 * Math.pow(effectiveLevel, 2));
}

export function calculateForgeQuote(request: ForgeRequest): ForgeResult {
  const { category, alterationBonus, slots } = request;
  const slotSum = resolveSlotSum(slots);

  if (category === 'weapon' && slotSum > alterationBonus) {
    const error: ForgeError = {
      code: 'CAPACITY_EXCEEDED',
      message: `Intégrité violée : pour une arme dotée d'un bonus +${alterationBonus}, la capacité en slots est strictement bornée par B (${alterationBonus} max, reçu ${slotSum}).`,
      details: {
        alterationBonus,
        slotSum,
        maxSlotsAllowed: alterationBonus,
      },
    };
    return { success: false, error };
  }

  const baseLevel = calculateBaseLevel(alterationBonus);
  const effectiveLevel = calculateEffectiveLevel(alterationBonus, slotSum);
  const coefficient = CATEGORY_COEFFICIENTS[category];
  const ceilingPrice = calculateCeilingFromLevel(category, effectiveLevel);

  const quote: ForgeQuote = {
    category,
    alterationBonus,
    slotSum,
    baseLevel,
    effectiveLevel,
    coefficient,
    ceilingPrice,
  };

  return { success: true, data: quote };
}

export function calculateUpgradeCost(
  category: ItemCategory,
  initialConfig: { alterationBonus: AlterationBonus; slots?: number | EnchantmentSlotEffect[] },
  finalConfig: { alterationBonus: AlterationBonus; slots?: number | EnchantmentSlotEffect[] }
): { success: true; upgradeCost: number; initialQuote: ForgeQuote; finalQuote: ForgeQuote } | { success: false; error: ForgeError } {
  const initialResult = calculateForgeQuote({ category, ...initialConfig });
  if (!initialResult.success) {
    return initialResult;
  }

  const finalResult = calculateForgeQuote({ category, ...finalConfig });
  if (!finalResult.success) {
    return finalResult;
  }

  const initialQuote = initialResult.data;
  const finalQuote = finalResult.data;

  if (finalQuote.effectiveLevel <= initialQuote.effectiveLevel) {
    return {
      success: false,
      error: {
        code: 'INVALID_UPGRADE',
        message: `Le niveau effectif final (${finalQuote.effectiveLevel}) doit être strictement supérieur au niveau initial (${initialQuote.effectiveLevel}).`,
        details: {
          initialLevel: initialQuote.effectiveLevel,
          finalLevel: finalQuote.effectiveLevel,
        },
      },
    };
  }

  const upgradeCost = finalQuote.ceilingPrice - initialQuote.ceilingPrice;
  return {
    success: true,
    upgradeCost,
    initialQuote,
    finalQuote,
  };
}

export function calculateAmmunitionCeiling(request: MunitionRequest): MunitionResult {
  const { alterationBonus, slots, quantity, supplements = [] } = request;
  const slotSum = resolveSlotSum(slots);

  if (slotSum > alterationBonus) {
    return {
      success: false,
      error: {
        code: 'CAPACITY_EXCEEDED',
        message: `Intégrité violée pour munitions : slots (${slotSum}) > bonus d'altération (+${alterationBonus}).`,
        details: {
          alterationBonus,
          slotSum,
          maxSlotsAllowed: alterationBonus,
        },
      },
    };
  }

  const effectiveLevel = calculateEffectiveLevel(alterationBonus, slotSum);
  const baseWeaponCeiling = calculateCeilingFromLevel('weapon', effectiveLevel);
  const unitCeilingPrice = baseWeaponCeiling / 50;

  const supplementCostPerUnit = supplements.reduce(
    (sum, supp) => sum + (MUNITION_SUPPLEMENT_PRICES[supp] ?? 0),
    0
  );

  const totalPerUnit = unitCeilingPrice + supplementCostPerUnit;
  const ceilingPrice = Math.round(totalPerUnit * Math.max(0, quantity));

  return {
    success: true,
    data: {
      alterationBonus,
      slotSum,
      effectiveLevel,
      baseWeaponCeiling,
      unitCeilingPrice,
      supplementCostPerUnit,
      quantity,
      ceilingPrice,
    },
  };
}
