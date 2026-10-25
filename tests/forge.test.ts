import { describe, it, expect } from 'vitest';
import {
  computeBaseTier,
  computeEffectiveTier,
  calculateForgeQuote,
  calculateUpgradeQuote,
  calculateAmmoQuote,
  ForgeCraftRequest,
  UpgradeRequest,
  AmmoCraftRequest,
} from '../src/domain/forge';

describe('computeBaseTier', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 3],
    [3, 6],
    [4, 10],
  ])('should compute T(%i) = %i', (bonus, expectedTier) => {
    expect(computeBaseTier(bonus)).toBe(expectedTier);
  });

  it.each([-1, 5, 2.5, Number.NaN])('should throw on invalid bonus %p', (invalidBonus) => {
    expect(() => computeBaseTier(invalidBonus)).toThrow();
  });
});

describe('computeEffectiveTier', () => {
  it.each([
    [0, 0, 0],
    [1, 0, 1],
    [1, 1, 2],
    [2, 0, 3],
    [2, 1, 4],
    [2, 2, 5],
    [3, 3, 9],
    [4, 4, 14],
  ])('for B=%i, S=%i should return N=%i', (bonus, slots, expectedN) => {
    expect(computeEffectiveTier(bonus, slots)).toBe(expectedN);
  });
});

describe('calculateForgeQuote — Golden CDC Cases & Limits', () => {
  const goldenCases: Array<[string, ForgeCraftRequest, { isValid: boolean; price?: number; tier?: number; error?: string }]> = [
    [
      'Arme +1 nue (1 000 po)',
      { category: 'WEAPON', enhancementBonus: 1, slots: 0 },
      { isValid: true, price: 1000, tier: 1 },
    ],
    [
      'Arme +2 nue (9 000 po)',
      { category: 'WEAPON', enhancementBonus: 2, slots: 0 },
      { isValid: true, price: 9000, tier: 3 },
    ],
    [
      'Arme +2 avec Sournoise (1) + Frugale (1) = 25 000 po (N=5)',
      {
        category: 'WEAPON',
        enhancementBonus: 2,
        enchantments: [
          { name: 'Sournoise', slots: 1 },
          { name: 'Frugale', slots: 1 },
        ],
      },
      { isValid: true, price: 25000, tier: 5 },
    ],
    [
      'Arme +2 avec 3 slots = INVALID (rejet explicite CAPACITY_EXCEEDED)',
      {
        category: 'WEAPON',
        enhancementBonus: 2,
        slots: 3,
      },
      { isValid: false, error: 'CAPACITY_EXCEEDED' },
    ],
    [
      'Armure +1 nue (850 po = 0.85 * 1000 * 1^2)',
      { category: 'ARMOR_SHIELD', enhancementBonus: 1, slots: 0 },
      { isValid: true, price: 850, tier: 1 },
    ],
    [
      'Armure +2 nue (7 650 po = 0.85 * 1000 * 3^2)',
      { category: 'ARMOR_SHIELD', enhancementBonus: 2, slots: 0 },
      { isValid: true, price: 7650, tier: 3 },
    ],
    [
      'Armure +3 nue (30 600 po = 0.85 * 1000 * 6^2)',
      { category: 'ARMOR_SHIELD', enhancementBonus: 3, slots: 0 },
      { isValid: true, price: 30600, tier: 6 },
    ],
    [
      'Armure +2 avec 3 slots = INVALID (rejet explicite CAPACITY_EXCEEDED)',
      { category: 'ARMOR_SHIELD', enhancementBonus: 2, slots: 3 },
      { isValid: false, error: 'CAPACITY_EXCEEDED' },
    ],
    [
      'Objet merveilleux autonome avec S=1 (800 po = 0.80 * 1000 * 1^2)',
      { category: 'WONDROUS_ITEM', enhancementBonus: 0, slots: 1 },
      { isValid: true, price: 800, tier: 1 },
    ],
    [
      'Objet merveilleux autonome avec S=3 (7 200 po = 0.80 * 1000 * 3^2)',
      { category: 'WONDROUS_ITEM', enhancementBonus: 0, slots: 3 },
      { isValid: true, price: 7200, tier: 3 },
    ],
    [
      'Objet merveilleux avec B > 0 = INVALID (WONDROUS_BONUS_NOT_ZERO)',
      { category: 'WONDROUS_ITEM', enhancementBonus: 1, slots: 1 },
      { isValid: false, error: 'WONDROUS_BONUS_NOT_ZERO' },
    ],
    [
      'Arme avec bonus négatif = INVALID_BONUS',
      { category: 'WEAPON', enhancementBonus: -1, slots: 0 },
      { isValid: false, error: 'INVALID_BONUS' },
    ],
    [
      'Arme avec bonus > 4 = INVALID_BONUS',
      { category: 'WEAPON', enhancementBonus: 5, slots: 0 },
      { isValid: false, error: 'INVALID_BONUS' },
    ],
    [
      'Arme avec slots négatifs = INVALID_SLOTS',
      { category: 'WEAPON', enhancementBonus: 2, slots: -1 },
      { isValid: false, error: 'INVALID_SLOTS' },
    ],
  ];

  it.each(goldenCases)('%s', (_, request, expected) => {
    const result = calculateForgeQuote(request);
    if (expected.isValid) {
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.ceilingPrice).toBe(expected.price);
        expect(result.effectiveTier).toBe(expected.tier);
      }
    } else {
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.error).toBe(expected.error);
      }
    }
  });
});

describe('calculateUpgradeQuote', () => {
  const upgradeCases: Array<[string, UpgradeRequest, { isValid: boolean; upgradeCost?: number; error?: string }]> = [
    [
      'Armure +2 nue vers +3 nue = 0.85 * (36000 - 9000) = 22 950 po',
      {
        category: 'ARMOR_SHIELD',
        initialEnhancementBonus: 2,
        initialSlots: 0,
        finalEnhancementBonus: 3,
        finalSlots: 0,
      },
      { isValid: true, upgradeCost: 22950 },
    ],
    [
      'Arme +1 nue (1000) vers Arme +2 nue (9000) = 8 000 po',
      {
        category: 'WEAPON',
        initialEnhancementBonus: 1,
        initialSlots: 0,
        finalEnhancementBonus: 2,
        finalSlots: 0,
      },
      { isValid: true, upgradeCost: 8000 },
    ],
    [
      'Amélioration vers même palier (N_final = N_init) = rejet INVALID_UPGRADE_TIER',
      {
        category: 'WEAPON',
        initialEnhancementBonus: 1,
        initialSlots: 0,
        finalEnhancementBonus: 1,
        finalSlots: 0,
      },
      { isValid: false, error: 'INVALID_UPGRADE_TIER' },
    ],
    [
      'Régression de palier (N_final < N_init) = rejet INVALID_UPGRADE_TIER',
      {
        category: 'WEAPON',
        initialEnhancementBonus: 2,
        initialSlots: 0,
        finalEnhancementBonus: 1,
        finalSlots: 0,
      },
      { isValid: false, error: 'INVALID_UPGRADE_TIER' },
    ],
    [
      'Amélioration avec capacité finale dépassée = rejet CAPACITY_EXCEEDED',
      {
        category: 'WEAPON',
        initialEnhancementBonus: 1,
        initialSlots: 0,
        finalEnhancementBonus: 2,
        finalSlots: 3,
      },
      { isValid: false, error: 'CAPACITY_EXCEEDED' },
    ],
  ];

  it.each(upgradeCases)('%s', (_, request, expected) => {
    const result = calculateUpgradeQuote(request);
    if (expected.isValid) {
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.upgradeCost).toBe(expected.upgradeCost);
      }
    } else {
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.error).toBe(expected.error);
      }
    }
  });
});

describe('calculateAmmoQuote', () => {
  const ammoCases: Array<[string, AmmoCraftRequest, { isValid: boolean; totalPrice?: number; error?: string }]> = [
    [
      '10 flèches +1 (200 po) : (1000 / 50) * 10',
      { enhancementBonus: 1, slots: 0, quantity: 10 },
      { isValid: true, totalPrice: 200 },
    ],
    [
      '10 flèches +2 (1 800 po) : (9000 / 50) * 10',
      { enhancementBonus: 2, slots: 0, quantity: 10 },
      { isValid: true, totalPrice: 1800 },
    ],
    [
      '50 flèches +1 (1 000 po)',
      { enhancementBonus: 1, slots: 0, quantity: 50 },
      { isValid: true, totalPrice: 1000 },
    ],
    [
      '10 flèches +1 avec supplément Incassable (+20 po/u) = 200 + 200 = 400 po',
      {
        enhancementBonus: 1,
        slots: 0,
        quantity: 10,
        supplements: ['UNBREAKABLE'],
      },
      { isValid: true, totalPrice: 400 },
    ],
    [
      '10 flèches +1 avec Percutante (+20) et Argentée (+10) = 200 + 300 = 500 po',
      {
        enhancementBonus: 1,
        slots: 0,
        quantity: 10,
        supplements: ['PIERCING', 'SILVERED'],
      },
      { isValid: true, totalPrice: 500 },
    ],
    [
      'Munitions avec S > B = rejet CAPACITY_EXCEEDED',
      { enhancementBonus: 1, slots: 2, quantity: 10 },
      { isValid: false, error: 'CAPACITY_EXCEEDED' },
    ],
    [
      'Quantité invalide (0) = rejet INVALID_QUANTITY',
      { enhancementBonus: 1, slots: 0, quantity: 0 },
      { isValid: false, error: 'INVALID_QUANTITY' },
    ],
    [
      'Quantité négative (-5) = rejet INVALID_QUANTITY',
      { enhancementBonus: 1, slots: 0, quantity: -5 },
      { isValid: false, error: 'INVALID_QUANTITY' },
    ],
    [
      'Bonus invalide (> 4) = rejet INVALID_BONUS',
      { enhancementBonus: 5, slots: 0, quantity: 10 },
      { isValid: false, error: 'INVALID_BONUS' },
    ],
  ];

  it.each(ammoCases)('%s', (_, request, expected) => {
    const result = calculateAmmoQuote(request);
    if (expected.isValid) {
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.totalPrice).toBe(expected.totalPrice);
      }
    } else {
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.error).toBe(expected.error);
      }
    }
  });
});
