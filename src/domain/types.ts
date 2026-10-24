export type AlterationBonus = 0 | 1 | 2 | 3 | 4;

export type ItemCategory = 'weapon' | 'armor_shield' | 'standalone';

export interface EnchantmentSlotEffect {
  id: string;
  name: string;
  slotCost: number;
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
  code: 'CAPACITY_EXCEEDED' | 'INVALID_LEVEL' | 'INVALID_UPGRADE';
  message: string;
  details?: {
    alterationBonus?: AlterationBonus;
    slotSum?: number;
    maxSlotsAllowed?: number;
    initialLevel?: number;
    finalLevel?: number;
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
