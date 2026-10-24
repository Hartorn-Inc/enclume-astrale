import { describe, it, expect } from 'vitest';
import {
  computeBaseTier,
  computeEffectiveTier,
  computeCraftPrice,
  computeUpgradePrice,
  computeAmmoPrice,
  ForgeCraftRequest,
  UpgradeRequest,
  AmmoCraftRequest
} from '../src/domain/forge';

describe('computeBaseTier', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 3],
    [3, 6],
    [4, 10]
  ])('produit T(%i) = %i selon la suite triangulaire', (bonus, expected) => {
    expect(computeBaseTier(bonus)).toBe(expected);
  });

  it.each([-1, 5, 2.5, NaN])('lève une exception pour un bonus hors borne ou invalide: %s', (invalidBonus) => {
    expect(() => computeBaseTier(invalidBonus as number)).toThrow();
  });
});

describe('computeEffectiveTier', () => {
  it.each([
    [0, 0, 0],
    [1, 0, 1],
    [1, 1, 2],
    [2, 0, 3],
    [2, 2, 5],
    [3, 3, 9],
    [4, 4, 14]
  ])('calcule T(%i) + %i = %i', (bonus, slots, expected) => {
    expect(computeEffectiveTier(bonus, slots)).toBe(expected);
  });
});

describe('computeCraftPrice — CDC Golden Test Cases', () => {
  it('calcule une Arme +1 nue à 1 000 po (B=1, S=0, N=1)', () => {
    const req: ForgeCraftRequest = { category: 'WEAPON', bonus: 1, slotsConsumed: 0 };
    const res = computeCraftPrice(req);
    expect(res).toEqual({
      isValid: true,
      baseTier: 1,
      effectiveTier: 1,
      categoryCoefficient: 1.0,
      maxPrice: 1000
    });
  });

  it('calcule une Arme +2 nue à 9 000 po (B=2, S=0, N=3)', () => {
    const req: ForgeCraftRequest = { category: 'WEAPON', bonus: 2, slotsConsumed: 0 };
    const res = computeCraftPrice(req);
    expect(res).toEqual({
      isValid: true,
      baseTier: 3,
      effectiveTier: 3,
      categoryCoefficient: 1.0,
      maxPrice: 9000
    });
  });

  it('calcule une Arme +2 avec Sournoise (1) + Frugale (1) = S=2 à 25 000 po (B=2, S=2, N=5)', () => {
    const req: ForgeCraftRequest = { category: 'WEAPON', bonus: 2, slotsConsumed: 2 };
    const res = computeCraftPrice(req);
    expect(res).toEqual({
      isValid: true,
      baseTier: 3,
      effectiveTier: 5,
      categoryCoefficient: 1.0,
      maxPrice: 25000
    });
  });

  it('rejette une Arme +2 avec S=3 car S > B (CAPACITY_EXCEEDED)', () => {
    const req: ForgeCraftRequest = { category: 'WEAPON', bonus: 2, slotsConsumed: 3 };
    const res = computeCraftPrice(req);
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('CAPACITY_EXCEEDED');
  });

  it.each([
    ['WEAPON' as const, 1, 2],
    ['ARMOR_SHIELD' as const, 2, 3],
    ['ARMOR_SHIELD' as const, 0, 1]
  ])('rejette strictement la surcharge de capacité pour %s (B=%i, S=%i)', (category, bonus, slots) => {
    const res = computeCraftPrice({ category, bonus, slotsConsumed: slots });
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('CAPACITY_EXCEEDED');
  });

  it('applique le coefficient 0.85 pour ARMOR_SHIELD', () => {
    // B=2, S=0 -> N=3 -> 0.85 * 1000 * 9 = 7650 po
    const res = computeCraftPrice({ category: 'ARMOR_SHIELD', bonus: 2, slotsConsumed: 0 });
    expect(res.isValid).toBe(true);
    expect(res.effectiveTier).toBe(3);
    expect(res.maxPrice).toBe(7650);
  });

  it('gère WONDROUS_ITEM avec B=0 et N=S (coefficient 0.80)', () => {
    // B=0, S=3 -> N=3 -> 0.80 * 1000 * 9 = 7200 po
    const res = computeCraftPrice({ category: 'WONDROUS_ITEM', bonus: 0, slotsConsumed: 3 });
    expect(res).toEqual({
      isValid: true,
      baseTier: 0,
      effectiveTier: 3,
      categoryCoefficient: 0.80,
      maxPrice: 7200
    });
  });

  it('rejette un WONDROUS_ITEM avec un bonus B > 0', () => {
    const res = computeCraftPrice({ category: 'WONDROUS_ITEM', bonus: 1, slotsConsumed: 1 });
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('WONDROUS_ITEM_CANNOT_HAVE_BONUS');
  });

  it('rejette les slots négatifs', () => {
    const res = computeCraftPrice({ category: 'WEAPON', bonus: 2, slotsConsumed: -1 });
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('NEGATIVE_SLOTS');
  });
});

describe('computeUpgradePrice', () => {
  it('calcule la transition Armure +2 nue vers +3 nue à 22 950 po (CDC Golden Case)', () => {
    const req: UpgradeRequest = {
      category: 'ARMOR_SHIELD',
      initialBonus: 2,
      initialSlots: 0,
      targetBonus: 3,
      targetSlots: 0
    };
    const res = computeUpgradePrice(req);
    expect(res).toEqual({
      isValid: true,
      initialTier: 3,
      targetTier: 6,
      initialMaxPrice: 7650,
      targetMaxPrice: 30600,
      upgradeCost: 22950
    });
  });

  it('rejette si le niveau cible est inférieur ou égal au niveau initial', () => {
    const req: UpgradeRequest = {
      category: 'WEAPON',
      initialBonus: 2,
      initialSlots: 0,
      targetBonus: 1,
      targetSlots: 1
    };
    const res = computeUpgradePrice(req);
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('TARGET_TIER_MUST_BE_GREATER');
  });

  it('rejette si l état initial est invalide (capacité dépassée)', () => {
    const req: UpgradeRequest = {
      category: 'WEAPON',
      initialBonus: 1,
      initialSlots: 2,
      targetBonus: 2,
      targetSlots: 2
    };
    const res = computeUpgradePrice(req);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('INITIAL_STATE_INVALID');
  });

  it('rejette si l état cible est invalide (capacité dépassée)', () => {
    const req: UpgradeRequest = {
      category: 'WEAPON',
      initialBonus: 1,
      initialSlots: 0,
      targetBonus: 2,
      targetSlots: 3
    };
    const res = computeUpgradePrice(req);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('TARGET_STATE_INVALID');
  });
});

describe('computeAmmoPrice — CDC Golden Test Cases', () => {
  it('calcule 10 flèches +1 (N=1) à 200 po', () => {
    const req: AmmoCraftRequest = {
      bonus: 1,
      slotsConsumed: 0,
      quantity: 10
    };
    const res = computeAmmoPrice(req);
    expect(res).toEqual({
      isValid: true,
      effectiveTier: 1,
      baseUnitCost: 20,
      supplementsUnitCost: 0,
      totalPrice: 200,
      quantity: 10
    });
  });

  it('calcule 10 flèches +2 (N=3) à 1 800 po', () => {
    const req: AmmoCraftRequest = {
      bonus: 2,
      slotsConsumed: 0,
      quantity: 10
    };
    const res = computeAmmoPrice(req);
    expect(res).toEqual({
      isValid: true,
      effectiveTier: 3,
      baseUnitCost: 180,
      supplementsUnitCost: 0,
      totalPrice: 1800,
      quantity: 10
    });
  });

  it('ajoute correctement les suppléments Incassable (+20), Percutante (+20), Argentée (+10)', () => {
    const req: AmmoCraftRequest = {
      bonus: 1,
      slotsConsumed: 0,
      quantity: 10,
      supplements: ['UNBREAKABLE', 'SILVERED']
    };
    // base = 20 * 10 = 200 po
    // suppléments = (20 + 10) * 10 = 300 po
    // total = 500 po
    const res = computeAmmoPrice(req);
    expect(res.isValid).toBe(true);
    expect(res.baseUnitCost).toBe(20);
    expect(res.supplementsUnitCost).toBe(30);
    expect(res.totalPrice).toBe(500);
  });

  it.each([0, -5, 1.5])('rejette une quantité de munitions invalide: %s', (invalidQty) => {
    const req: AmmoCraftRequest = {
      bonus: 1,
      slotsConsumed: 0,
      quantity: invalidQty
    };
    const res = computeAmmoPrice(req);
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('INVALID_QUANTITY');
  });

  it('rejette les munitions si la capacité en slots est dépassée', () => {
    const req: AmmoCraftRequest = {
      bonus: 1,
      slotsConsumed: 2,
      quantity: 20
    };
    const res = computeAmmoPrice(req);
    expect(res.isValid).toBe(false);
    expect(res.error).toBe('CAPACITY_EXCEEDED');
  });
});
