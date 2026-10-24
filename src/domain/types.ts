export type AlterationBonus = 0 | 1 | 2 | 3 | 4;

export type ItemCategory = 'weapon' | 'armor_shield' | 'standalone';

export interface EnchantmentSlotEffect {
  id: string;
  name: string;
  slotCost: number;
  compatibleCategories: ItemCategory[];
  description: string;
  prerequisiteBonus?: AlterationBonus;
}

export interface ForgeRequest {
  category: ItemCategory;
  alterationBonus: AlterationBonus;
  slots?: number | EnchantmentSlotEffect[];
}

export interface ForgeQuote {
  category: ItemCategory;
  alterationBonus: AlterationBonus;
  slotSum: number;
  baseLevel: number;
  effectiveLevel: number;
  coefficient: number;
  ceilingPrice: number;
}

export interface ForgeError {
  code: 'CAPACITY_EXCEEDED' | 'INVALID_LEVEL' | 'INVALID_UPGRADE' | 'INVALID_D20';
  message: string;
  details?: {
    alterationBonus?: AlterationBonus;
    slotSum?: number;
    maxSlotsAllowed?: number;
    initialLevel?: number;
    finalLevel?: number;
    d20Roll?: number;
  };
}

export type ForgeResult = 
  | { success: true; data: ForgeQuote }
  | { success: false; error: ForgeError };

export type MunitionSupplement = 'unbreakable' | 'impact' | 'silvered';

export interface MunitionRequest {
  alterationBonus: AlterationBonus;
  slots?: number | EnchantmentSlotEffect[];
  quantity: number;
  supplements?: MunitionSupplement[];
}

export interface MunitionQuote {
  alterationBonus: AlterationBonus;
  slotSum: number;
  effectiveLevel: number;
  baseWeaponCeiling: number;
  unitCeilingPrice: number;
  supplementCostPerUnit: number;
  quantity: number;
  ceilingPrice: number;
}

export type MunitionResult =
  | { success: true; data: MunitionQuote }
  | { success: false; error: ForgeError };

export type MarketRollCategory =
  | 'exceptional_deal'
  | 'very_advantageous'
  | 'favorable_market'
  | 'standard_market'
  | 'nominal_ceiling'
  | 'minor_complication'
  | 'workshop_incident'
  | 'major_complication';

export interface MarketSimulationResult {
  d20: number;
  ceilingPrice: number;
  discountRate: number; // e.g. 0.28 for 28% discount
  priceRatio: number; // e.g. 0.72
  finalPrice: number;
  category: MarketRollCategory;
  categoryLabel: string;
  complicationTitle: string | null;
  complicationDescription: string | null;
}

export type ConsumablePricingRuleset = 'standard_5e' | 'variant_2024';

export type PotionRarity = 'common' | 'uncommon' | 'rare' | 'very_rare';

export interface PotionHealingDefinition {
  id: string;
  rarity: PotionRarity;
  name: string;
  diceFormula: string;
  priceStandard: number;
  priceVariant2024: number;
}

export interface SpecialConsumableDefinition {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  unitLabel: string;
}
