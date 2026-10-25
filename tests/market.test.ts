import { describe, it, expect } from 'vitest';
import {
  simulateMarket,
  classifyD20Roll,
  MarketOutcomeCategory,
  ComplicationSeverity,
} from '../src/domain/market';
import {
  ENCHANTMENTS_CATALOG,
  HEALING_POTIONS_CATALOG,
  SPECIAL_CONSUMABLES,
  getHealingPotionPrice,
  getEnchantmentById,
  getEnchantmentsByCategory,
} from '../src/domain/catalog';

describe('simulateMarket — Golden CDC Cases', () => {
  it('d20 = 1 sur 22 950 po donne 16 524 po (72 %, opportunité exceptionnelle)', () => {
    const res = simulateMarket(22950, 1);
    expect(res.finalPrice).toBe(16524);
    expect(res.multiplier).toBe(0.72);
    expect(res.discountPercent).toBe(28);
    expect(res.outcomeCategory).toBe('EXCEPTIONAL_OPPORTUNITY');
    expect(res.hasComplication).toBe(false);
    expect(res.complicationSeverity).toBe('NONE');
  });

  it('d20 = 3 sur 22 950 po donne 17 442 po (76 %, affaire très avantageuse)', () => {
    const res = simulateMarket(22950, 3);
    expect(res.finalPrice).toBe(17442);
    expect(res.multiplier).toBe(0.76);
    expect(res.discountPercent).toBe(24);
    expect(res.outcomeCategory).toBe('VERY_FAVORABLE');
    expect(res.hasComplication).toBe(false);
  });

  it('d20 = 15 sur 25 000 po donne 25 000 po (100 %, nominal sans complication)', () => {
    const res = simulateMarket(25000, 15);
    expect(res.finalPrice).toBe(25000);
    expect(res.multiplier).toBe(1.0);
    expect(res.discountPercent).toBe(0);
    expect(res.outcomeCategory).toBe('NOMINAL');
    expect(res.hasComplication).toBe(false);
    expect(res.complicationSeverity).toBe('NONE');
  });

  it("d20 = 18 sur 25 000 po donne 25 000 po (100 %, incident d'atelier)", () => {
    const res = simulateMarket(25000, 18);
    expect(res.finalPrice).toBe(25000);
    expect(res.multiplier).toBe(1.0);
    expect(res.discountPercent).toBe(0);
    expect(res.outcomeCategory).toBe('WORKSHOP_INCIDENT');
    expect(res.hasComplication).toBe(true);
    expect(res.complicationSeverity).toBe('WORKSHOP_INCIDENT');
    expect(res.narrativeComplication).toContain("Incident d'atelier");
  });
});

describe('simulateMarket — Full d20 scale parameterization (1 to 20)', () => {
  const fullD20Cases: Array<[
    number, // d20
    number, // expectedMultiplier
    number, // expectedDiscount
    MarketOutcomeCategory,
    ComplicationSeverity,
    boolean // hasComplication
  ]> = [
    [1, 0.72, 28, 'EXCEPTIONAL_OPPORTUNITY', 'NONE', false],
    [2, 0.74, 26, 'VERY_FAVORABLE', 'NONE', false],
    [3, 0.76, 24, 'VERY_FAVORABLE', 'NONE', false],
    [4, 0.78, 22, 'VERY_FAVORABLE', 'NONE', false],
    [5, 0.80, 20, 'VERY_FAVORABLE', 'NONE', false],
    [6, 0.82, 18, 'FAVORABLE', 'NONE', false],
    [7, 0.84, 16, 'FAVORABLE', 'NONE', false],
    [8, 0.86, 14, 'FAVORABLE', 'NONE', false],
    [9, 0.88, 12, 'FAVORABLE', 'NONE', false],
    [10, 0.90, 10, 'FAVORABLE', 'NONE', false],
    [11, 0.92, 8, 'STANDARD', 'NONE', false],
    [12, 0.94, 6, 'STANDARD', 'NONE', false],
    [13, 0.96, 4, 'STANDARD', 'NONE', false],
    [14, 0.98, 2, 'STANDARD', 'NONE', false],
    [15, 1.0, 0, 'NOMINAL', 'NONE', false],
    [16, 1.0, 0, 'MINOR_COMPLICATION', 'MINOR', true],
    [17, 1.0, 0, 'MINOR_COMPLICATION', 'MINOR', true],
    [18, 1.0, 0, 'WORKSHOP_INCIDENT', 'WORKSHOP_INCIDENT', true],
    [19, 1.0, 0, 'WORKSHOP_INCIDENT', 'WORKSHOP_INCIDENT', true],
    [20, 1.0, 0, 'MAJOR_COMPLICATION', 'MAJOR', true],
  ];

  it.each(fullD20Cases)(
    'd20=%i -> multiplier=%f, discount=%i%%, category=%s, complication=%s',
    (d20, expectedMultiplier, expectedDiscount, category, severity, hasComplication) => {
      const result = simulateMarket(10000, d20);
      expect(result.multiplier).toBeCloseTo(expectedMultiplier, 5);
      expect(result.discountPercent).toBe(expectedDiscount);
      expect(result.outcomeCategory).toBe(category);
      expect(result.complicationSeverity).toBe(severity);
      expect(result.hasComplication).toBe(hasComplication);
      expect(result.finalPrice).toBe(Math.round(10000 * expectedMultiplier));
      expect(result.finalPrice).toBeLessThanOrEqual(10000);
    }
  );
});

describe('simulateMarket & classifyD20Roll — Input validation and bounds', () => {
  it.each([-5, 0, 21, 100, 3.5, Number.NaN])(
    'should throw error for invalid d20 roll %p',
    (invalidD20) => {
      expect(() => classifyD20Roll(invalidD20)).toThrow();
      expect(() => simulateMarket(1000, invalidD20)).toThrow();
    }
  );

  it.each([-1, -100, Number.NaN])('should throw error for invalid basePrice %p', (invalidPrice) => {
    expect(() => simulateMarket(invalidPrice, 10)).toThrow();
  });

  it('guarantees P_payé never exceeds basePrice even on d20 >= 15', () => {
    for (let d20 = 1; d20 <= 20; d20++) {
      const result = simulateMarket(12345, d20);
      expect(result.finalPrice).toBeLessThanOrEqual(12345);
    }
  });
});

describe('catalog — Grimoire of enchantments', () => {
  it('contains expected core enchantments with valid slot costs (1 to 4)', () => {
    expect(ENCHANTMENTS_CATALOG.length).toBeGreaterThanOrEqual(8);
    for (const ench of ENCHANTMENTS_CATALOG) {
      expect(ench.id).toBeDefined();
      expect(ench.name).toBeDefined();
      expect(ench.slotCost).toBeGreaterThanOrEqual(1);
      expect(ench.slotCost).toBeLessThanOrEqual(4);
      expect(ench.description.length).toBeGreaterThan(10);
      expect(ench.applicableCategories.length).toBeGreaterThan(0);
    }
  });

  it('finds Sournoise (cost 1, WEAPON) and Frugale (cost 1, WEAPON)', () => {
    const sournoise = getEnchantmentById('sournoise');
    expect(sournoise).toBeDefined();
    expect(sournoise?.slotCost).toBe(1);
    expect(sournoise?.applicableCategories).toContain('WEAPON');

    const frugale = getEnchantmentById('frugale');
    expect(frugale).toBeDefined();
    expect(frugale?.slotCost).toBe(1);
    expect(frugale?.applicableCategories).toContain('WEAPON');
  });

  it('filters enchantments by category properly', () => {
    const weapons = getEnchantmentsByCategory('WEAPON');
    expect(weapons.every((w) => w.applicableCategories.includes('WEAPON'))).toBe(true);
    expect(weapons.some((w) => w.id === 'sournoise')).toBe(true);

    const armors = getEnchantmentsByCategory('ARMOR_SHIELD');
    expect(armors.some((a) => a.id === 'defense-elementaire')).toBe(true);

    const wondrous = getEnchantmentsByCategory('WONDROUS_ITEM');
    expect(wondrous.some((i) => i.id === 'focalisation-tellurique')).toBe(true);
  });
});

describe('catalog — Consumables and Ruleset switch (Classic 5e vs Revised 2024)', () => {
  it.each([
    ['COMMON', 'CLASSIC_5E', 50],
    ['COMMON', 'REVISED_2024', 50],
    ['UNCOMMON', 'CLASSIC_5E', 500],
    ['UNCOMMON', 'REVISED_2024', 200],
    ['RARE', 'CLASSIC_5E', 5000],
    ['RARE', 'REVISED_2024', 2000],
    ['VERY_RARE', 'CLASSIC_5E', 50000],
    ['VERY_RARE', 'REVISED_2024', 20000],
  ] as const)(
    'healing potion %s under %s costs %i po',
    (rarity, ruleset, expectedPrice) => {
      expect(getHealingPotionPrice(rarity, ruleset)).toBe(expectedPrice);
    }
  );

  it('contains all 4 healing potions with matching dice formulas', () => {
    expect(HEALING_POTIONS_CATALOG).toHaveLength(4);
    const common = HEALING_POTIONS_CATALOG.find((p) => p.id === 'COMMON');
    const uncommon = HEALING_POTIONS_CATALOG.find((p) => p.id === 'UNCOMMON');
    const rare = HEALING_POTIONS_CATALOG.find((p) => p.id === 'RARE');
    const veryRare = HEALING_POTIONS_CATALOG.find((p) => p.id === 'VERY_RARE');

    expect(common?.diceFormula).toBe('2d4 + 2');
    expect(uncommon?.diceFormula).toBe('4d4 + 4');
    expect(rare?.diceFormula).toBe('8d4 + 8');
    expect(veryRare?.diceFormula).toBe('10d4 + 20');
  });

  it('provides special consumables at exact canonical prices', () => {
    expect(SPECIAL_CONSUMABLES).toEqual([
      {
        id: 'dust-of-disappearance',
        name: 'Poudre de disparition',
        price: 250,
        unit: 'dose',
        description: expect.any(String),
      },
      {
        id: 'keoghtoms-ointment',
        name: 'Onguent de soin',
        price: 150,
        unit: 'pot (dose)',
        description: expect.any(String),
      },
      {
        id: 'sovereign-glue',
        name: 'Colle universelle',
        price: 2000,
        unit: 'flacon',
        description: expect.any(String),
      },
    ]);
  });
});
