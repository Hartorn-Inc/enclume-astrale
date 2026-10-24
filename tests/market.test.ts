import { describe, expect, it } from 'vitest';
import {
  simulateMarket,
  classifyD20Roll,
  MarketOutcomeCategory,
} from '../src/domain/market';
import {
  ENCHANTMENT_CATALOG,
  HEALING_POTIONS,
  SPECIAL_CONSUMABLES,
  getHealingPotionPrice,
  getEnchantmentById,
} from '../src/domain/catalog';

describe('Market d20 Simulation — Golden Test Cases', () => {
  it('d20 = 1 sur 22 950 po -> 16 524 po (72 %, Opportunité exceptionnelle)', () => {
    const result = simulateMarket(22950, 1);
    expect(result.finalPrice).toBe(16524);
    expect(result.rateMultiplier).toBe(0.72);
    expect(result.discountPercentage).toBe(28);
    expect(result.category).toBe('EXCEPTIONAL_OPPORTUNITY');
    expect(result.hasComplication).toBe(false);
  });

  it('d20 = 3 sur 22 950 po -> 17 442 po (76 %, Affaire très avantageuse)', () => {
    const result = simulateMarket(22950, 3);
    expect(result.finalPrice).toBe(17442);
    expect(result.rateMultiplier).toBe(0.76);
    expect(result.discountPercentage).toBe(24);
    expect(result.category).toBe('VERY_ADVANTAGEOUS');
    expect(result.hasComplication).toBe(false);
  });

  it('d20 = 15 sur 25 000 po -> 25 000 po (100 %, Nominal, aucun incident)', () => {
    const result = simulateMarket(25000, 15);
    expect(result.finalPrice).toBe(25000);
    expect(result.rateMultiplier).toBe(1.0);
    expect(result.discountPercentage).toBe(0);
    expect(result.category).toBe('NOMINAL');
    expect(result.hasComplication).toBe(false);
  });

  it("d20 = 18 sur 25 000 po -> 25 000 po (100 %, Incident d'atelier)", () => {
    const result = simulateMarket(25000, 18);
    expect(result.finalPrice).toBe(25000);
    expect(result.rateMultiplier).toBe(1.0);
    expect(result.discountPercentage).toBe(0);
    expect(result.category).toBe('WORKSHOP_INCIDENT');
    expect(result.hasComplication).toBe(true);
    expect(result.complicationDetails).toBe("Aléa d'artisanat nécessitant l'action du joueur");
  });
});

describe('Market d20 Simulation — Full Range & Categories (d20 from 1 to 20)', () => {
  const rollExpectations: Array<{
    roll: number;
    rate: number;
    category: MarketOutcomeCategory;
    hasComplication: boolean;
  }> = [
    { roll: 1, rate: 0.72, category: 'EXCEPTIONAL_OPPORTUNITY', hasComplication: false },
    { roll: 2, rate: 0.74, category: 'VERY_ADVANTAGEOUS', hasComplication: false },
    { roll: 3, rate: 0.76, category: 'VERY_ADVANTAGEOUS', hasComplication: false },
    { roll: 4, rate: 0.78, category: 'VERY_ADVANTAGEOUS', hasComplication: false },
    { roll: 5, rate: 0.8, category: 'VERY_ADVANTAGEOUS', hasComplication: false },
    { roll: 6, rate: 0.82, category: 'FAVORABLE', hasComplication: false },
    { roll: 7, rate: 0.84, category: 'FAVORABLE', hasComplication: false },
    { roll: 8, rate: 0.86, category: 'FAVORABLE', hasComplication: false },
    { roll: 9, rate: 0.88, category: 'FAVORABLE', hasComplication: false },
    { roll: 10, rate: 0.9, category: 'FAVORABLE', hasComplication: false },
    { roll: 11, rate: 0.92, category: 'STANDARD', hasComplication: false },
    { roll: 12, rate: 0.94, category: 'STANDARD', hasComplication: false },
    { roll: 13, rate: 0.96, category: 'STANDARD', hasComplication: false },
    { roll: 14, rate: 0.98, category: 'STANDARD', hasComplication: false },
    { roll: 15, rate: 1.0, category: 'NOMINAL', hasComplication: false },
    { roll: 16, rate: 1.0, category: 'MINOR_COMPLICATION', hasComplication: true },
    { roll: 17, rate: 1.0, category: 'MINOR_COMPLICATION', hasComplication: true },
    { roll: 18, rate: 1.0, category: 'WORKSHOP_INCIDENT', hasComplication: true },
    { roll: 19, rate: 1.0, category: 'WORKSHOP_INCIDENT', hasComplication: true },
    { roll: 20, rate: 1.0, category: 'MAJOR_COMPLICATION', hasComplication: true },
  ];

  it.each(rollExpectations)(
    'roll $roll: multiplier $rate, category $category, hasComplication=$hasComplication',
    ({ roll, rate, category, hasComplication }) => {
      const result = simulateMarket(10000, roll);
      expect(result.rateMultiplier).toBe(rate);
      expect(result.finalPrice).toBe(Math.round(10000 * rate));
      expect(result.category).toBe(category);
      expect(result.hasComplication).toBe(hasComplication);
      // Ensure ceiling is guaranteed
      expect(result.finalPrice).toBeLessThanOrEqual(result.basePrice);
    }
  );

  it('verifies d20 = 16-17 minor complication message', () => {
    const r16 = simulateMarket(5000, 16);
    expect(r16.complicationDetails).toBe('Composant spécifique ou service requis');
  });

  it('verifies d20 = 20 major complication message', () => {
    const r20 = simulateMarket(5000, 20);
    expect(r20.complicationDetails).toBe('Quête arcanique ou faveur de haut rang requise');
  });

  it.each([0, -1, 21, 2.5, NaN])('rejects invalid d20 value: %s', (invalidRoll) => {
    expect(() => simulateMarket(1000, invalidRoll)).toThrow(RangeError);
  });

  it('rejects invalid base price', () => {
    expect(() => simulateMarket(-50, 10)).toThrow(RangeError);
  });
});

describe('classifyD20Roll bounds', () => {
  it('throws for out-of-bounds roll', () => {
    expect(() => classifyD20Roll(0)).toThrow(RangeError);
    expect(() => classifyD20Roll(21)).toThrow(RangeError);
  });
});

describe('Enchantment Catalog', () => {
  it('contains expected standard enchantments with target categories and slot costs (1 to 4)', () => {
    expect(ENCHANTMENT_CATALOG.length).toBeGreaterThanOrEqual(5);
    for (const ench of ENCHANTMENT_CATALOG) {
      expect(ench.id).toBeDefined();
      expect(ench.name).toBeDefined();
      expect(ench.slotCost).toBeGreaterThanOrEqual(1);
      expect(ench.slotCost).toBeLessThanOrEqual(4);
      expect(ench.targetCategories.length).toBeGreaterThan(0);
    }
  });

  it('finds Sournoise (slot 1, WEAPON) and Frugale (slot 1, WEAPON)', () => {
    const sournoise = getEnchantmentById('sournoise');
    expect(sournoise).toBeDefined();
    expect(sournoise?.slotCost).toBe(1);
    expect(sournoise?.targetCategories).toContain('WEAPON');

    const frugale = getEnchantmentById('frugale');
    expect(frugale).toBeDefined();
    expect(frugale?.slotCost).toBe(1);
    expect(frugale?.targetCategories).toContain('WEAPON');
  });

  it('returns undefined for non-existent enchantment', () => {
    expect(getEnchantmentById('inexistant')).toBeUndefined();
  });
});

describe('Consumables Catalog & D&D 5e Classic vs 2024 Switch', () => {
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
    'potion %s under profile %s costs %i po',
    (rarity, profile, expectedPrice) => {
      expect(getHealingPotionPrice(rarity, profile)).toBe(expectedPrice);
    }
  );

  it('lists special consumables with exact prices', () => {
    const poudre = SPECIAL_CONSUMABLES.find((c) => c.id === 'poudre_disparition');
    expect(poudre?.price).toBe(250);

    const onguent = SPECIAL_CONSUMABLES.find((c) => c.id === 'onguent_soin');
    expect(onguent?.price).toBe(150);

    const colle = SPECIAL_CONSUMABLES.find((c) => c.id === 'colle_universelle');
    expect(colle?.price).toBe(2000);
  });

  it('throws when requesting price for unknown potion tier', () => {
    expect(() =>
      getHealingPotionPrice('LEGENDARY' as unknown as 'COMMON', 'CLASSIC_5E')
    ).toThrow();
  });
});
