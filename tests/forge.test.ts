import { describe, it, expect } from 'vitest';
import {
  computeBaseTier,
  computeEffectiveTier,
  calculatePriceCeiling,
  calculateForgeCraft,
  calculateUpgrade,
  calculateAmmoCraft,
  resolveSlots,
  type ItemCategory,
  type EnchantmentSlot,
} from '../src/domain/forge';

describe('Fonction computeBaseTier(B)', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 3],
    [3, 6],
    [4, 10],
  ])('pour B = %i, T(B) vaut %i', (bonus, expectedTier) => {
    expect(computeBaseTier(bonus)).toBe(expectedTier);
  });

  it.each([
    -1,
    5,
    10,
    1.5,
    -0.1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ])('rejette avec RangeError la valeur invalide B = %s', (invalidBonus) => {
    expect(() => computeBaseTier(invalidBonus)).toThrow(RangeError);
  });
});

describe('Fonction computeEffectiveTier(B, S)', () => {
  it.each([
    [0, 0, 0],
    [1, 0, 1],
    [1, 1, 2],
    [2, 0, 3],
    [2, 1, 4],
    [2, 2, 5],
    [3, 0, 6],
    [3, 2, 8],
    [3, 3, 9],
    [4, 0, 10],
    [4, 4, 14],
  ])('avec B = %i et S = %i, N vaut %i', (bonus, slots, expectedEffectiveTier) => {
    expect(computeEffectiveTier(bonus, slots)).toBe(expectedEffectiveTier);
  });

  it.each([
    [1, -1],
    [2, -5],
    [2, 1.5],
  ])('rejette avec RangeError les slots invalides (B = %i, S = %s)', (bonus, invalidSlots) => {
    expect(() => computeEffectiveTier(bonus, invalidSlots)).toThrow(RangeError);
  });
});

describe('Fonction calculatePriceCeiling(C, N)', () => {
  it.each<[ItemCategory, number, number]>([
    ['WEAPON', 0, 0],
    ['WEAPON', 1, 1000],
    ['WEAPON', 2, 4000],
    ['WEAPON', 3, 9000],
    ['WEAPON', 4, 16000],
    ['WEAPON', 5, 25000],
    ['ARMOR_SHIELD', 1, 850],
    ['ARMOR_SHIELD', 3, 7650],
    ['ARMOR_SHIELD', 6, 30600],
    ['WONDROUS_ITEM', 0, 0],
    ['WONDROUS_ITEM', 1, 800],
    ['WONDROUS_ITEM', 2, 3200],
    ['WONDROUS_ITEM', 3, 7200],
    ['WONDROUS_ITEM', 4, 12800],
    ['WONDROUS_ITEM', 5, 20000],
  ])('calcule le plafond pour %s avec N = %i => %i po', (category, tier, expectedPrice) => {
    expect(calculatePriceCeiling(category, tier)).toBe(expectedPrice);
  });

  it.each([
    ['WEAPON' as ItemCategory, -1],
    ['ARMOR_SHIELD' as ItemCategory, -2],
  ])('rejette les niveaux effectifs négatifs (%s, N = %i)', (category, tier) => {
    expect(() => calculatePriceCeiling(category, tier)).toThrow(RangeError);
  });
});

describe('Fonction resolveSlots', () => {
  it.each([
    [undefined, 0],
    [null, 0],
    [0, 0],
    [3, 3],
    [[], 0],
    [[1, 2], 3],
  ])('résout correctement l\'entrée %p vers %i slots', (input, expected) => {
    expect(resolveSlots(input as unknown as number)).toBe(expected);
  });

  it.each([
    [[{ cost: 1, name: 'Sournoise' }, { cost: 1, name: 'Frugale' }], 2],
    [[{ cost: 2, name: 'Vorpaline' }, 1], 3],
  ])('résout les listes mixtes ou d\'objets EnchantmentSlot', (input, expected) => {
    expect(resolveSlots(input)).toBe(expected);
  });
});

describe('calculateForgeCraft — Cas de référence (CDC Golden Tests)', () => {
  it.each([
    {
      name: 'Arme +1 nue',
      request: { category: 'WEAPON' as ItemCategory, bonus: 1, slots: 0 },
      expected: { isValid: true, effectiveTier: 1, priceCeiling: 1000 },
    },
    {
      name: 'Arme +2 nue',
      request: { category: 'WEAPON' as ItemCategory, bonus: 2, slots: 0 },
      expected: { isValid: true, effectiveTier: 3, priceCeiling: 9000 },
    },
    {
      name: 'Arme +2 avec Sournoise (1) + Frugale (1) = 2 slots',
      request: { category: 'WEAPON' as ItemCategory, bonus: 2, slots: 2 },
      expected: { isValid: true, effectiveTier: 5, priceCeiling: 25000 },
    },
    {
      name: 'Arme +2 avec tableau d\'objets slots (1+1)',
      request: {
        category: 'WEAPON' as ItemCategory,
        bonus: 2,
        slots: [
          { name: 'Sournoise', cost: 1 },
          { name: 'Frugale', cost: 1 },
        ] as EnchantmentSlot[],
      },
      expected: { isValid: true, effectiveTier: 5, priceCeiling: 25000 },
    },
    {
      name: 'Armure +2 nue',
      request: { category: 'ARMOR_SHIELD' as ItemCategory, bonus: 2, slots: 0 },
      expected: { isValid: true, effectiveTier: 3, priceCeiling: 7650 },
    },
    {
      name: 'Armure +3 nue',
      request: { category: 'ARMOR_SHIELD' as ItemCategory, bonus: 3, slots: 0 },
      expected: { isValid: true, effectiveTier: 6, priceCeiling: 30600 },
    },
    {
      name: 'Objet merveilleux autonome avec S=1',
      request: { category: 'WONDROUS_ITEM' as ItemCategory, bonus: 0, slots: 1 },
      expected: { isValid: true, effectiveTier: 1, priceCeiling: 800 },
    },
    {
      name: 'Objet merveilleux autonome avec S=3',
      request: { category: 'WONDROUS_ITEM' as ItemCategory, bonus: 0, slots: 3 },
      expected: { isValid: true, effectiveTier: 3, priceCeiling: 7200 },
    },
  ])('$name', ({ request, expected }) => {
    const result = calculateForgeCraft(request);
    expect(result.isValid).toBe(expected.isValid);
    if (result.isValid) {
      expect(result.effectiveTier).toBe(expected.effectiveTier);
      expect(result.priceCeiling).toBe(expected.priceCeiling);
    }
  });
});

describe('calculateForgeCraft — Contrôle d\'intégrité de capacité (S > B)', () => {
  it.each([
    ['WEAPON' as ItemCategory, 2, 3],
    ['WEAPON' as ItemCategory, 1, 2],
    ['WEAPON' as ItemCategory, 0, 1],
    ['ARMOR_SHIELD' as ItemCategory, 0, 1],
    ['ARMOR_SHIELD' as ItemCategory, 1, 2],
    ['ARMOR_SHIELD' as ItemCategory, 2, 3],
    ['ARMOR_SHIELD' as ItemCategory, 3, 5],
  ])('rejette %s avec B = %i et S = %i (CAPACITY_EXCEEDED)', (category, bonus, slots) => {
    const result = calculateForgeCraft({ category, bonus, slots });
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.error).toBe('CAPACITY_EXCEEDED');
    }
  });
});

describe('calculateForgeCraft — Règles WONDROUS_ITEM', () => {
  it.each([1, 2, 3, 4])(
    'rejette WONDROUS_ITEM avec B = %i != 0 (INVALID_BONUS)',
    (invalidBonus) => {
      const result = calculateForgeCraft({
        category: 'WONDROUS_ITEM',
        bonus: invalidBonus,
        slots: 1,
      });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.error).toBe('INVALID_BONUS');
      }
    }
  );

  it.each([
    [0, 0, 0],
    [1, 1, 800],
    [2, 2, 3200],
    [3, 3, 7200],
  ])('accepte WONDROUS_ITEM avec B=0 et S=%i => N=%i, P=%i po', (slots, expectedTier, expectedPrice) => {
    const result = calculateForgeCraft({
      category: 'WONDROUS_ITEM',
      bonus: 0,
      slots,
    });
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.effectiveTier).toBe(expectedTier);
      expect(result.priceCeiling).toBe(expectedPrice);
    }
  });
});

describe('calculateForgeCraft — Validation des entrées invalides', () => {
  it.each([
    ['UNKNOWN' as ItemCategory, 1, 0, 'INVALID_CATEGORY'],
    ['WEAPON' as ItemCategory, -1, 0, 'INVALID_BONUS'],
    ['WEAPON' as ItemCategory, 5, 0, 'INVALID_BONUS'],
    ['WEAPON' as ItemCategory, 2, -1, 'NEGATIVE_SLOTS'],
  ])('identifie l\'erreur pour category=%s, B=%s, S=%s => %s', (category, bonus, slots, expectedError) => {
    const result = calculateForgeCraft({ category, bonus, slots });
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.error).toBe(expectedError);
    }
  });
});

describe('calculateUpgrade — Golden test cases et calculs valides', () => {
  it.each([
    {
      name: 'Armure +2 nue vers +3 nue (CDC golden case: 22950 po)',
      request: {
        category: 'ARMOR_SHIELD' as ItemCategory,
        initialBonus: 2,
        initialSlots: 0,
        targetBonus: 3,
        targetSlots: 0,
      },
      expected: {
        isValid: true,
        initialTier: 3,
        targetTier: 6,
        initialPriceCeiling: 7650,
        targetPriceCeiling: 30600,
        upgradeCost: 22950,
      },
    },
    {
      name: 'Arme +1 nue vers +2 nue',
      request: {
        category: 'WEAPON' as ItemCategory,
        initialBonus: 1,
        initialSlots: 0,
        targetBonus: 2,
        targetSlots: 0,
      },
      expected: {
        isValid: true,
        initialTier: 1,
        targetTier: 3,
        initialPriceCeiling: 1000,
        targetPriceCeiling: 9000,
        upgradeCost: 8000,
      },
    },
    {
      name: 'Arme +1 nue vers +2 avec 2 slots (N: 1 -> 5)',
      request: {
        category: 'WEAPON' as ItemCategory,
        initialBonus: 1,
        initialSlots: 0,
        targetBonus: 2,
        targetSlots: 2,
      },
      expected: {
        isValid: true,
        initialTier: 1,
        targetTier: 5,
        initialPriceCeiling: 1000,
        targetPriceCeiling: 25000,
        upgradeCost: 24000,
      },
    },
    {
      name: 'Objet autonome merveilleux de S=1 vers S=3',
      request: {
        category: 'WONDROUS_ITEM' as ItemCategory,
        initialBonus: 0,
        initialSlots: 1,
        targetBonus: 0,
        targetSlots: 3,
      },
      expected: {
        isValid: true,
        initialTier: 1,
        targetTier: 3,
        initialPriceCeiling: 800,
        targetPriceCeiling: 7200,
        upgradeCost: 6400,
      },
    },
  ])('$name', ({ request, expected }) => {
    const result = calculateUpgrade(request);
    expect(result.isValid).toBe(expected.isValid);
    if (result.isValid) {
      expect(result.initialTier).toBe(expected.initialTier);
      expect(result.targetTier).toBe(expected.targetTier);
      expect(result.initialPriceCeiling).toBe(expected.initialPriceCeiling);
      expect(result.targetPriceCeiling).toBe(expected.targetPriceCeiling);
      expect(result.upgradeCost).toBe(expected.upgradeCost);
    }
  });
});

describe('calculateUpgrade — Rejet si N_final <= N_init ou invalidité', () => {
  it.each([
    {
      desc: 'Même niveau (Arme +2 vers Arme +2 sans ajout)',
      request: {
        category: 'WEAPON' as ItemCategory,
        initialBonus: 2,
        initialSlots: 0,
        targetBonus: 2,
        targetSlots: 0,
      },
      expectedError: 'INVALID_UPGRADE_TIER',
    },
    {
      desc: 'Rétrogradation (Arme +2 vers Arme +1)',
      request: {
        category: 'WEAPON' as ItemCategory,
        initialBonus: 2,
        initialSlots: 0,
        targetBonus: 1,
        targetSlots: 0,
      },
      expectedError: 'INVALID_UPGRADE_TIER',
    },
    {
      desc: 'Cible avec capacité dépassée (Arme +2 vers +2 avec 3 slots)',
      request: {
        category: 'WEAPON' as ItemCategory,
        initialBonus: 2,
        initialSlots: 0,
        targetBonus: 2,
        targetSlots: 3,
      },
      expectedError: 'CAPACITY_EXCEEDED',
    },
    {
      desc: 'Initial avec capacité dépassée',
      request: {
        category: 'WEAPON' as ItemCategory,
        initialBonus: 1,
        initialSlots: 2,
        targetBonus: 2,
        targetSlots: 0,
      },
      expectedError: 'CAPACITY_EXCEEDED',
    },
  ])('$desc échoue avec $expectedError', ({ request, expectedError }) => {
    const result = calculateUpgrade(request);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.error).toBe(expectedError);
    }
  });
});

describe('calculateAmmoCraft — Cas nominaux et Golden test cases', () => {
  it.each([
    {
      desc: '10 flèches +1 (CDC golden case: 200 po)',
      request: { bonus: 1, quantity: 10 },
      expected: { effectiveTier: 1, basePrice: 200, supplementPrice: 0, totalPrice: 200 },
    },
    {
      desc: '10 flèches +2 (CDC golden case: 1800 po)',
      request: { bonus: 2, quantity: 10 },
      expected: { effectiveTier: 3, basePrice: 1800, supplementPrice: 0, totalPrice: 1800 },
    },
    {
      desc: '50 flèches +1 (lot complet: 1000 po)',
      request: { bonus: 1, quantity: 50 },
      expected: { effectiveTier: 1, basePrice: 1000, supplementPrice: 0, totalPrice: 1000 },
    },
    {
      desc: '20 flèches +2 (3600 po)',
      request: { bonus: 2, quantity: 20 },
      expected: { effectiveTier: 3, basePrice: 3600, supplementPrice: 0, totalPrice: 3600 },
    },
    {
      desc: '10 flèches +2 avec 1 slot (N=3+1=4)',
      request: { bonus: 2, slots: 1, quantity: 10 },
      expected: { effectiveTier: 4, basePrice: 3200, supplementPrice: 0, totalPrice: 3200 },
    },
  ])('$desc', ({ request, expected }) => {
    const result = calculateAmmoCraft(request);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.effectiveTier).toBe(expected.effectiveTier);
      expect(result.basePrice).toBe(expected.basePrice);
      expect(result.supplementPrice).toBe(expected.supplementPrice);
      expect(result.totalPrice).toBe(expected.totalPrice);
    }
  });
});

describe('calculateAmmoCraft — Suppléments fixes et personnalisés', () => {
  it.each([
    {
      desc: '10 flèches +1 avec Incassable (+20 po/u)',
      request: { bonus: 1, quantity: 10, supplements: ['UNBREAKABLE' as const] },
      expectedSupplement: 200,
      expectedTotal: 400,
    },
    {
      desc: '10 flèches +1 avec Percutante (+20 po/u)',
      request: { bonus: 1, quantity: 10, supplements: ['STRIKING' as const] },
      expectedSupplement: 200,
      expectedTotal: 400,
    },
    {
      desc: '10 flèches +1 avec Argentée (+10 po/u)',
      request: { bonus: 1, quantity: 10, supplements: ['SILVERED' as const] },
      expectedSupplement: 100,
      expectedTotal: 300,
    },
    {
      desc: '10 flèches +1 avec Percutante + Argentée (+30 po/u)',
      request: { bonus: 1, quantity: 10, supplements: ['STRIKING' as const, 'SILVERED' as const] },
      expectedSupplement: 300,
      expectedTotal: 500,
    },
    {
      desc: '10 flèches +2 avec les 3 suppléments (+50 po/u)',
      request: {
        bonus: 2,
        quantity: 10,
        supplements: ['UNBREAKABLE' as const, 'STRIKING' as const, 'SILVERED' as const],
      },
      expectedSupplement: 500,
      expectedTotal: 2300,
    },
    {
      desc: '20 flèches +1 avec supplément numérique libre (+15 po/u)',
      request: { bonus: 1, quantity: 20, supplements: [15] },
      expectedSupplement: 300,
      expectedTotal: 700,
    },
  ])('$desc', ({ request, expectedSupplement, expectedTotal }) => {
    const result = calculateAmmoCraft(request);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.supplementPrice).toBe(expectedSupplement);
      expect(result.totalPrice).toBe(expectedTotal);
    }
  });
});

describe('calculateAmmoCraft — Cas d\'erreur et limites', () => {
  it.each([
    {
      desc: 'Quantité nulle',
      request: { bonus: 1, quantity: 0 },
      expectedError: 'INVALID_QUANTITY',
    },
    {
      desc: 'Quantité négative',
      request: { bonus: 1, quantity: -5 },
      expectedError: 'INVALID_QUANTITY',
    },
    {
      desc: 'Quantité fractionnaire',
      request: { bonus: 1, quantity: 2.5 },
      expectedError: 'INVALID_QUANTITY',
    },
    {
      desc: 'Bonus négatif',
      request: { bonus: -1, quantity: 10 },
      expectedError: 'INVALID_BONUS',
    },
    {
      desc: 'Bonus supérieur à 4',
      request: { bonus: 5, quantity: 10 },
      expectedError: 'INVALID_BONUS',
    },
    {
      desc: 'Capacité dépassée (B=1, S=2)',
      request: { bonus: 1, slots: 2, quantity: 10 },
      expectedError: 'CAPACITY_EXCEEDED',
    },
    {
      desc: 'Slots négatifs',
      request: { bonus: 1, slots: -1, quantity: 10 },
      expectedError: 'NEGATIVE_SLOTS',
    },
  ])('$desc échoue avec $expectedError', ({ request, expectedError }) => {
    const result = calculateAmmoCraft(request);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.error).toBe(expectedError);
    }
  });
});
