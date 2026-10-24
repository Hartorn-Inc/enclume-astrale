import { describe, it, expect } from 'vitest';
import {
  calculateBaseLevel,
  calculateEffectiveLevel,
  calculateForgeQuote,
  calculateUpgradeCost,
  calculateAmmunitionCeiling,
} from '../src/domain/forge';
import { AlterationBonus, ItemCategory, MunitionSupplement } from '../src/domain/types';

describe('Mathématiques fondamentales T(B) et N', () => {
  it.each([
    [0 as AlterationBonus, 0],
    [1 as AlterationBonus, 1],
    [2 as AlterationBonus, 3],
    [3 as AlterationBonus, 6],
    [4 as AlterationBonus, 10],
  ])('T(B) pour B=%i doit valoir %i', (b, expectedT) => {
    expect(calculateBaseLevel(b)).toBe(expectedT);
  });

  it.each([
    [1 as AlterationBonus, 0, 1],
    [2 as AlterationBonus, 0, 3],
    [2 as AlterationBonus, 2, 5],
    [3 as AlterationBonus, 1, 7],
    [4 as AlterationBonus, 4, 14],
  ])('N = T(B) + S pour B=%i et S=%i doit valoir %i', (b, s, expectedN) => {
    expect(calculateEffectiveLevel(b, s)).toBe(expectedN);
  });
});

describe('Calculateur de forge (devis & plafonds de prix)', () => {
  it.each([
    { category: 'weapon' as ItemCategory, b: 1 as AlterationBonus, s: 0, expectedPrice: 1000 },
    { category: 'weapon' as ItemCategory, b: 2 as AlterationBonus, s: 0, expectedPrice: 9000 },
    { category: 'weapon' as ItemCategory, b: 2 as AlterationBonus, s: 2, expectedPrice: 25000 },
    { category: 'armor_shield' as ItemCategory, b: 2 as AlterationBonus, s: 0, expectedPrice: 7650 },
    { category: 'armor_shield' as ItemCategory, b: 3 as AlterationBonus, s: 0, expectedPrice: 30600 },
    { category: 'standalone' as ItemCategory, b: 1 as AlterationBonus, s: 0, expectedPrice: 800 },
  ])(
    'calcul valide $category B=$b S=$s -> $expectedPrice po',
    ({ category, b, s, expectedPrice }) => {
      const result = calculateForgeQuote({
        category,
        alterationBonus: b,
        slots: s,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ceilingPrice).toBe(expectedPrice);
      }
    }
  );

  it('arme +2 avec Sournoise (1) + Frugale (1) donne 25 000 po (B=2, S=2, N=5)', () => {
    const result = calculateForgeQuote({
      category: 'weapon',
      alterationBonus: 2,
      slots: [
        { id: 'sneak', name: 'Sournoise', slotCost: 1 },
        { id: 'frugal', name: 'Frugale', slotCost: 1 },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slotSum).toBe(2);
      expect(result.data.effectiveLevel).toBe(5);
      expect(result.data.ceilingPrice).toBe(25000);
    }
  });

  it('règle d’intégrité S <= B : Arme +2 avec S=3 renvoie explicitement une erreur et aucun devis', () => {
    const result = calculateForgeQuote({
      category: 'weapon',
      alterationBonus: 2,
      slots: 3,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CAPACITY_EXCEEDED');
      expect(result.error.details?.maxSlotsAllowed).toBe(2);
      expect(result.error.details?.slotSum).toBe(3);
    }
  });

  it('règle d’intégrité S <= B : Arme +0 avec S=1 renvoie une erreur', () => {
    const result = calculateForgeQuote({
      category: 'weapon',
      alterationBonus: 0,
      slots: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CAPACITY_EXCEEDED');
    }
  });
});

describe('Améliorations d’objets', () => {
  it('calcule exactement : Armure +2 nue vers Armure +3 nue = 22 950 po (0.85 * (36 000 - 9 000))', () => {
    const result = calculateUpgradeCost(
      'armor_shield',
      { alterationBonus: 2, slots: 0 },
      { alterationBonus: 3, slots: 0 }
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.initialQuote.ceilingPrice).toBe(7650);
      expect(result.finalQuote.ceilingPrice).toBe(30600);
      expect(result.upgradeCost).toBe(22950);
    }
  });

  it('rejette une amélioration si le niveau final est inférieur ou égal au niveau initial', () => {
    const result = calculateUpgradeCost(
      'weapon',
      { alterationBonus: 2, slots: 1 },
      { alterationBonus: 2, slots: 1 }
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_UPGRADE');
    }
  });
});

describe('Tarification des munitions', () => {
  it.each([
    { b: 1 as AlterationBonus, qty: 10, supplements: [], expected: 200 },
    { b: 2 as AlterationBonus, qty: 10, supplements: [], expected: 1800 },
    {
      b: 1 as AlterationBonus,
      qty: 10,
      supplements: ['unbreakable' as MunitionSupplement],
      expected: 400, // (20 + 20) * 10 = 400
    },
    {
      b: 1 as AlterationBonus,
      qty: 10,
      supplements: ['unbreakable' as MunitionSupplement, 'impact' as MunitionSupplement, 'silvered' as MunitionSupplement],
      expected: 700, // (20 + 20 + 20 + 10) * 10 = 700
    },
  ])(
    'munitions B=$b, qty=$qty, supplements=$supplements -> $expected po',
    ({ b, qty, supplements, expected }) => {
      const result = calculateAmmunitionCeiling({
        alterationBonus: b,
        quantity: qty,
        supplements,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ceilingPrice).toBe(expected);
      }
    }
  );

  it('rejette les munitions dont les slots dépassent le bonus d’altération', () => {
    const result = calculateAmmunitionCeiling({
      alterationBonus: 1,
      slots: 2,
      quantity: 10,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CAPACITY_EXCEEDED');
    }
  });
});
