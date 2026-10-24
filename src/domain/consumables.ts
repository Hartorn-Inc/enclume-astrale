import { calculateForgeQuote } from "./forge.js";

export interface AmmunitionConfig {
  readonly quantity: number;
  readonly bonus: number;
  readonly slots: number;
  readonly unbreakable?: boolean;
  readonly forceful?: boolean;
  readonly silvered?: boolean;
}

export interface AmmunitionQuoteResult {
  readonly valid: boolean;
  readonly error?: string;
  readonly quantity: number;
  readonly magicBaseUnitPrice: number;
  readonly utilityFixedUnitPrice: number;
  readonly totalUnitPrice: number;
  readonly ceilingPrice: number;
}

export type PotionTier = "common" | "uncommon" | "rare" | "very_rare";
export type PotionRuleVariant = "standard" | "dnd_2024";

export interface PotionPriceTier {
  readonly healing: string;
  readonly standard: number;
  readonly dnd_2024: number;
}

export const POTION_HEALING_TIERS: Readonly<Record<PotionTier, PotionPriceTier>> = {
  common: { healing: "2d4 + 2", standard: 50, dnd_2024: 50 },
  uncommon: { healing: "4d4 + 4", standard: 500, dnd_2024: 200 },
  rare: { healing: "8d4 + 8", standard: 5000, dnd_2024: 2000 },
  very_rare: { healing: "10d4 + 20", standard: 50000, dnd_2024: 20000 }
};

export interface PotionQuoteResult {
  readonly tier: PotionTier;
  readonly variant: PotionRuleVariant;
  readonly healing: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly totalPrice: number;
}

export interface SpecialConsumableItem {
  readonly key: string;
  readonly name: string;
  readonly unitPrice: number;
  readonly description: string;
}

export const SPECIAL_CONSUMABLES: Readonly<Record<string, SpecialConsumableItem>> = {
  vanishing_dust: {
    key: "vanishing_dust",
    name: "Poudre de disparition",
    unitPrice: 250,
    description: "Confère l'invisibilité à une cible pendant 2d4 minutes ou jusqu'à une attaque."
  },
  healing_salve: {
    key: "healing_salve",
    name: "Onguent de soin",
    unitPrice: 150,
    description: "Restaure 2d8 + 2 points de vie et neutralise les toxines mineures."
  },
  sovereign_glue: {
    key: "sovereign_glue",
    name: "Colle universelle",
    unitPrice: 2000,
    description: "Adhésif prodigieux scellant de manière quasi-indestructible toute matière."
  }
};

export function calculateAmmunitionQuote(config: AmmunitionConfig): AmmunitionQuoteResult {
  const { quantity, bonus, slots, unbreakable, forceful, silvered } = config;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return {
      valid: false,
      error: "INVALID_QUANTITY",
      quantity: 0,
      magicBaseUnitPrice: 0,
      utilityFixedUnitPrice: 0,
      totalUnitPrice: 0,
      ceilingPrice: 0
    };
  }

  let magicBaseUnitPrice = 0;
  if (bonus > 0 || slots > 0) {
    const weaponQuote = calculateForgeQuote({
      category: "weapon",
      bonus,
      slots
    });

    if (!weaponQuote.valid) {
      return {
        valid: false,
        error: weaponQuote.error ?? "INVALID_MAGIC_AMMUNITION",
        quantity,
        magicBaseUnitPrice: 0,
        utilityFixedUnitPrice: 0,
        totalUnitPrice: 0,
        ceilingPrice: 0
      };
    }

    magicBaseUnitPrice = weaponQuote.ceilingPrice / 50;
  }

  let utilityFixedUnitPrice = 0;
  if (unbreakable) utilityFixedUnitPrice += 20;
  if (forceful) utilityFixedUnitPrice += 20;
  if (silvered) utilityFixedUnitPrice += 10;

  const totalUnitPrice = magicBaseUnitPrice + utilityFixedUnitPrice;
  const ceilingPrice = Math.round(totalUnitPrice * quantity);

  return {
    valid: true,
    quantity,
    magicBaseUnitPrice,
    utilityFixedUnitPrice,
    totalUnitPrice,
    ceilingPrice
  };
}

export function calculatePotionQuote(
  tier: PotionTier,
  variant: PotionRuleVariant = "standard",
  quantity = 1
): PotionQuoteResult {
  const safeQty = Math.max(1, Math.floor(quantity));
  const tierConfig = POTION_HEALING_TIERS[tier] ?? POTION_HEALING_TIERS.common;
  const unitPrice = variant === "dnd_2024" ? tierConfig.dnd_2024 : tierConfig.standard;

  return {
    tier,
    variant,
    healing: tierConfig.healing,
    quantity: safeQty,
    unitPrice,
    totalPrice: unitPrice * safeQty
  };
}

export function calculateSpecialConsumableQuote(
  key: string,
  quantity = 1
): { valid: boolean; item?: SpecialConsumableItem; quantity: number; totalPrice: number } {
  const item = SPECIAL_CONSUMABLES[key];
  if (!item) {
    return { valid: false, quantity: 0, totalPrice: 0 };
  }

  const safeQty = Math.max(1, Math.floor(quantity));
  return {
    valid: true,
    item,
    quantity: safeQty,
    totalPrice: item.unitPrice * safeQty
  };
}
