import { describe, it, expect } from 'vitest';
import { simulateMarket, classifyD20Roll, MarketOutcomeCategory } from '../src/domain/market';
import {
  ENCHANTMENT_CATALOG,
  HEALING_POTIONS,
  SPECIAL_CONSUMABLES,
  getEnchantmentById,
  getEnchantmentsByCategory,
  getHealingPotionPrice,
  getSpecialConsumableById,
  HealingPotionTier,
  RulesetProfile,
} from '../src/domain/catalog';

describe('Market Simulation d20 grid & formulas', () => {
  it.each([
    { d20: 1, expectedPercent: 72, expectedCategory: 'EXCEPTIONAL_OPPORTUNITY' as MarketOutcomeCategory, hasIncident: false },
    { d20: 2, expectedPercent: 74, expectedCategory: 'VERY_ADVANTAGEOUS' as MarketOutcomeCategory, hasIncident: false },
    { d20: 3, expectedPercent: 76, expectedCategory: 'VERY_ADVANTAGEOUS' as MarketOutcomeCategory, hasIncident: false },
    { d20: 4, expectedPercent: 78, expectedCategory: 'VERY_ADVANTAGEOUS' as MarketOutcomeCategory, hasIncident: false },
    { d20: 5, expectedPercent: 80, expectedCategory: 'VERY_ADVANTAGEOUS' as MarketOutcomeCategory, hasIncident: false },
    { d20: 6, expectedPercent: 82, expectedCategory: 'FAVORABLE_MARKET' as MarketOutcomeCategory, hasIncident: false },
    { d20: 7, expectedPercent: 84, expectedCategory: 'FAVORABLE_MARKET' as MarketOutcomeCategory, hasIncident: false },
    { d20: 8, expectedPercent: 86, expectedCategory: 'FAVORABLE_MARKET' as MarketOutcomeCategory, hasIncident: false },
    { d20: 9, expectedPercent: 88, expectedCategory: 'FAVORABLE_MARKET' as MarketOutcomeCategory, hasIncident: false },
    { d20: 10, expectedPercent: 90, expectedCategory: 'FAVORABLE_MARKET' as MarketOutcomeCategory, hasIncident: false },
    { d20: 11, expectedPercent: 92, expectedCategory: 'NORMAL_MARKET' as MarketOutcomeCategory, hasIncident: false },
    { d20: 12, expectedPercent: 94, expectedCategory: 'NORMAL_MARKET' as MarketOutcomeCategory, hasIncident: false },
    { d20: 13, expectedPercent: 96, expectedCategory: 'NORMAL_MARKET' as MarketOutcomeCategory, hasIncident: false },
    { d20: 14, expectedPercent: 98, expectedCategory: 'NORMAL_MARKET' as MarketOutcomeCategory, hasIncident: false },
    { d20: 15, expectedPercent: 100, expectedCategory: 'NOMINAL_PRICE' as MarketOutcomeCategory, hasIncident: false },
    { d20: 16, expectedPercent: 100, expectedCategory: 'MINOR_COMPLICATION' as MarketOutcomeCategory, hasIncident: true },
    { d20: 17, expectedPercent: 100, expectedCategory: 'MINOR_COMPLICATION' as MarketOutcomeCategory, hasIncident: true },
    { d20: 18, expectedPercent: 100, expectedCategory: 'WORKSHOP_INCIDENT' as MarketOutcomeCategory, hasIncident: true },
    { d20: 19, expectedPercent: 100, expectedCategory: 'WORKSHOP_INCIDENT' as MarketOutcomeCategory, hasIncident: true },
    { d20: 20, expectedPercent: 100, expectedCategory: 'MAJOR_COMPLICATION' as MarketOutcomeCategory, hasIncident: true },
  ])('should evaluate d20=$d20 to $expectedPercent% ($expectedCategory)', ({
    d20,
    expectedPercent,
    expectedCategory,
    hasIncident,
  }) => {
    const classification = classifyD20Roll(d20);
    expect(classification.category).toBe(expectedCategory);
    expect(classification.hasIncident).toBe(hasIncident);

    const result = simulateMarket(10000, d20);
    expect(result.percentageApplied).toBe(expectedPercent);
    expect(result.finalPrice).toBe(10000 * (expectedPercent / 100));
    expect(result.hasIncident).toBe(hasIncident);
    expect(result.finalPrice).toBeLessThanOrEqual(result.basePrice);
  });
});

describe('Market Simulation Golden Acceptance Tests', () => {
  it('d20 = 1 sur 22950 po = 16524 po (72 %)', () => {
    const res = simulateMarket(22950, 1);
    expect(res.finalPrice).toBe(16524);
    expect(res.percentageApplied).toBe(72);
    expect(res.discountRate).toBe(0.28);
    expect(res.hasIncident).toBe(false);
  });

  it('d20 = 3 sur 22950 po = 17442 po (76 %)', () => {
    const res = simulateMarket(22950, 3);
    expect(res.finalPrice).toBe(17442);
    expect(res.percentageApplied).toBe(76);
    expect(res.discountRate).toBe(0.24);
    expect(res.hasIncident).toBe(false);
  });

  it('d20 = 15 sur 25000 po = 25000 po (100 %, aucun incident)', () => {
    const res = simulateMarket(25000, 15);
    expect(res.finalPrice).toBe(25000);
    expect(res.percentageApplied).toBe(100);
    expect(res.discountRate).toBe(0.0);
    expect(res.hasIncident).toBe(false);
    expect(res.incidentDescription).toBeUndefined();
  });

  it('d20 = 18 sur 25000 po = 25000 po (100 %, incident d atelier)', () => {
    const res = simulateMarket(25000, 18);
    expect(res.finalPrice).toBe(25000);
    expect(res.percentageApplied).toBe(100);
    expect(res.discountRate).toBe(0.0);
    expect(res.hasIncident).toBe(true);
    expect(res.category).toBe('WORKSHOP_INCIDENT');
    expect(res.incidentDescription).toBeDefined();
  });

  it('d20 = 20 sur 25000 po = 25000 po (100 %, complication majeure)', () => {
    const res = simulateMarket(25000, 20);
    expect(res.finalPrice).toBe(25000);
    expect(res.percentageApplied).toBe(100);
    expect(res.hasIncident).toBe(true);
    expect(res.category).toBe('MAJOR_COMPLICATION');
    expect(res.incidentDescription).toBeDefined();
  });
});

describe('Market Simulation validation and boundary errors', () => {
  it.each([0, 21, -1, 1.5, NaN, Infinity])('rejects invalid d20 rolls: %s', (invalidRoll) => {
    expect(() => simulateMarket(1000, invalidRoll)).toThrow();
  });

  it.each([-1, -500, NaN, Infinity])('rejects invalid base price: %s', (invalidPrice) => {
    expect(() => simulateMarket(invalidPrice, 10)).toThrow();
  });

  it('handles zero base price correctly', () => {
    const res = simulateMarket(0, 10);
    expect(res.finalPrice).toBe(0);
  });
});

describe('Catalog - Enchantments grimoire', () => {
  it('includes classic effects such as Sournoise (cost 1) and Frugale (cost 1)', () => {
    const sournoise = getEnchantmentById('sournoise');
    expect(sournoise).toBeDefined();
    expect(sournoise?.slots).toBe(1);
    expect(sournoise?.applicableCategories).toContain('WEAPON');

    const frugale = getEnchantmentById('frugale');
    expect(frugale).toBeDefined();
    expect(frugale?.slots).toBe(1);
    expect(frugale?.applicableCategories).toContain('WEAPON');
  });

  it('includes defense enchantments for armor and shield', () => {
    const defense = getEnchantmentById('defense-elementaire');
    expect(defense).toBeDefined();
    expect(defense?.slots).toBe(2);
    expect(defense?.applicableCategories).toContain('ARMOR_SHIELD');
  });

  it('filters enchantments accurately by category', () => {
    const weaponEnchantments = getEnchantmentsByCategory('WEAPON');
    expect(weaponEnchantments.length).toBeGreaterThan(0);
    expect(weaponEnchantments.every((e) => e.applicableCategories.includes('WEAPON'))).toBe(true);

    const armorEnchantments = getEnchantmentsByCategory('ARMOR_SHIELD');
    expect(armorEnchantments.length).toBeGreaterThan(0);
    expect(armorEnchantments.every((e) => e.applicableCategories.includes('ARMOR_SHIELD'))).toBe(true);

    const wondrousEnchantments = getEnchantmentsByCategory('WONDROUS_ITEM');
    expect(wondrousEnchantments.length).toBeGreaterThan(0);
    expect(wondrousEnchantments.every((e) => e.applicableCategories.includes('WONDROUS_ITEM'))).toBe(true);
  });

  it('ensures all enchantments have slots between 1 and 4 and non-empty description', () => {
    for (const ench of ENCHANTMENT_CATALOG) {
      expect(ench.slots).toBeGreaterThanOrEqual(1);
      expect(ench.slots).toBeLessThanOrEqual(4);
      expect(ench.description.trim().length).toBeGreaterThan(10);
      expect(ench.name.trim().length).toBeGreaterThan(2);
    }
  });
});

describe('Catalog - Consumables and ruleset profile switching', () => {
  it.each([
    { tier: 'COMMON' as HealingPotionTier, ruleset: 'CLASSIC_5E' as RulesetProfile, expectedPrice: 50 },
    { tier: 'COMMON' as HealingPotionTier, ruleset: 'REVISED_2024' as RulesetProfile, expectedPrice: 50 },
    { tier: 'UNCOMMON' as HealingPotionTier, ruleset: 'CLASSIC_5E' as RulesetProfile, expectedPrice: 500 },
    { tier: 'UNCOMMON' as HealingPotionTier, ruleset: 'REVISED_2024' as RulesetProfile, expectedPrice: 200 },
    { tier: 'RARE' as HealingPotionTier, ruleset: 'CLASSIC_5E' as RulesetProfile, expectedPrice: 5000 },
    { tier: 'RARE' as HealingPotionTier, ruleset: 'REVISED_2024' as RulesetProfile, expectedPrice: 2000 },
    { tier: 'VERY_RARE' as HealingPotionTier, ruleset: 'CLASSIC_5E' as RulesetProfile, expectedPrice: 50000 },
    { tier: 'VERY_RARE' as HealingPotionTier, ruleset: 'REVISED_2024' as RulesetProfile, expectedPrice: 20000 },
  ])('healing potion $tier under $ruleset is $expectedPrice po', ({ tier, ruleset, expectedPrice }) => {
    expect(getHealingPotionPrice(tier, ruleset)).toBe(expectedPrice);
    expect(HEALING_POTIONS[tier].diceFormula).toBeDefined();
  });

  it.each([
    { id: 'poudre-disparition', expectedPrice: 250 },
    { id: 'onguent-soin', expectedPrice: 150 },
    { id: 'colle-universelle', expectedPrice: 2000 },
  ])('special consumable $id has price $expectedPrice po', ({ id, expectedPrice }) => {
    const item = getSpecialConsumableById(id);
    expect(item).toBeDefined();
    expect(item?.price).toBe(expectedPrice);
  });

  it('verifies special consumables catalog completeness', () => {
    expect(SPECIAL_CONSUMABLES.length).toBe(3);
  });
});
