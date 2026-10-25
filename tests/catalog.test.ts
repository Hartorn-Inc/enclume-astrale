import { describe, it, expect } from 'vitest';
import {
  ENCHANTMENT_CATALOG,
  SPECIAL_CONSUMABLES_CATALOG,
  findEnchantmentById,
  getEnchantmentsByCategory,
  getHealingPotionPrice,
  getHealingPotion,
  type HealingPotionRarity,
  type RulesetVersion,
} from '../src/domain/catalog';
import { calculateForgeCraft, type ItemCategory } from '../src/domain/forge';
import { simulateMarket } from '../src/domain/market';

describe('Catalogue des enchantements (ENCHANTMENT_CATALOG)', () => {
  it.each([
    {
      id: 'sournoise',
      name: 'Sournoise',
      cost: 1,
      categories: ['WEAPON'],
    },
    {
      id: 'frugale',
      name: 'Frugale',
      cost: 1,
      categories: ['WEAPON', 'WONDROUS_ITEM'],
    },
    {
      id: 'defense_elementaire',
      name: 'Défense élémentaire',
      cost: 1,
      categories: ['ARMOR_SHIELD'],
    },
    {
      id: 'gardienne',
      name: 'Gardienne',
      cost: 1,
      categories: ['ARMOR_SHIELD'],
    },
    {
      id: 'frappe_spectrale',
      name: 'Frappe spectrale',
      cost: 1,
      categories: ['WEAPON'],
    },
    {
      id: 'ardente',
      name: 'Ardente',
      cost: 2,
      categories: ['WEAPON'],
    },
    {
      id: 'sanctifiee',
      name: 'Sanctifiée',
      cost: 2,
      categories: ['WEAPON', 'ARMOR_SHIELD'],
    },
    {
      id: 'vorpaline',
      name: 'Vorpaline',
      cost: 3,
      categories: ['WEAPON'],
    },
    {
      id: 'ancrage_astral',
      name: 'Ancrage astral',
      cost: 4,
      categories: ['WEAPON', 'ARMOR_SHIELD', 'WONDROUS_ITEM'],
    },
  ])('contient l\'effet "$name" avec coût $cost slots', ({ id, name, cost, categories }) => {
    const item = findEnchantmentById(id);
    expect(item).toBeDefined();
    expect(item?.name).toBe(name);
    expect(item?.cost).toBe(cost);
    for (const cat of categories) {
      expect(item?.categories).toContain(cat);
    }
    expect(item?.description.length).toBeGreaterThan(10);
  });

  it('tous les enchantements du catalogue respectent les contraintes techniques (slots 1 à 4, descriptions)', () => {
    expect(ENCHANTMENT_CATALOG.length).toBeGreaterThanOrEqual(10);
    for (const ench of ENCHANTMENT_CATALOG) {
      expect(ench.id).toBeTruthy();
      expect(ench.name).toBeTruthy();
      expect(Number.isInteger(ench.cost)).toBe(true);
      expect(ench.cost).toBeGreaterThanOrEqual(1);
      expect(ench.cost).toBeLessThanOrEqual(4);
      expect(ench.categories.length).toBeGreaterThan(0);
      expect(ench.description.trim().length).toBeGreaterThan(10);
    }
  });

  it.each<[ItemCategory, string]>([
    ['WEAPON', 'sournoise'],
    ['ARMOR_SHIELD', 'defense_elementaire'],
    ['WONDROUS_ITEM', 'frugale'],
  ])('getEnchantmentsByCategory(%s) inclut %s', (category, expectedEnchantmentId) => {
    const results = getEnchantmentsByCategory(category);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((e) => e.id === expectedEnchantmentId)).toBe(true);
    for (const res of results) {
      expect(res.categories).toContain(category);
    }
  });

  it('findEnchantmentById renvoie undefined pour un id inexistant', () => {
    expect(findEnchantmentById('inexistant_id')).toBeUndefined();
  });
});

describe('Catalogue des consommables — Potions de soins (5e classique vs 2024)', () => {
  it.each<[HealingPotionRarity, number, number, string]>([
    ['COMMON', 50, 50, '2d4+2'],
    ['UNCOMMON', 500, 200, '4d4+4'],
    ['RARE', 5000, 2000, '8d4+8'],
    ['VERY_RARE', 50000, 20000, '10d4+20'],
  ])(
    'pour rareté %s : prix 5e 2014 = %i po, prix 5e 2024 = %i po (dés: %s)',
    (rarity, expectedPrice2014, expectedPrice2024, expectedDice) => {
      expect(getHealingPotionPrice(rarity, '5e_2014')).toBe(expectedPrice2014);
      expect(getHealingPotionPrice(rarity, '5e_2024')).toBe(expectedPrice2024);

      const potion = getHealingPotion(rarity);
      expect(potion).toBeDefined();
      expect(potion?.diceRoll).toBe(expectedDice);
      expect(potion?.prices['5e_2014']).toBe(expectedPrice2014);
      expect(potion?.prices['5e_2024']).toBe(expectedPrice2024);
    }
  );

  it('rejette les raretés ou profils de règles inconnus', () => {
    expect(() => getHealingPotionPrice('UNKNOWN' as HealingPotionRarity, '5e_2014')).toThrow(RangeError);
    expect(() => getHealingPotionPrice('COMMON', 'UNKNOWN' as RulesetVersion)).toThrow(RangeError);
  });
});

describe('Catalogue des consommables — Consommables spéciaux', () => {
  it.each([
    { id: 'dust_of_disappearance', name: 'Poudre de disparition', expectedPrice: 250 },
    { id: 'keoghtom_ointment', name: 'Onguent de soin', expectedPrice: 150 },
    { id: 'sovereign_glue', name: 'Colle universelle', expectedPrice: 2000 },
  ])('$name coûte $expectedPrice po', ({ id, expectedPrice }) => {
    const item = SPECIAL_CONSUMABLES_CATALOG.find((c) => c.id === id);
    expect(item).toBeDefined();
    expect(item?.price).toBe(expectedPrice);
    expect(item?.unit).toBeTruthy();
    expect(item?.description).toBeTruthy();
  });
});

describe('Intégration Forge + Catalogue + Marché', () => {
  it('arme +2 forgée avec Sournoise (1) + Frugale (1) depuis le catalogue évaluée sur le marché', () => {
    const sournoise = findEnchantmentById('sournoise');
    const frugale = findEnchantmentById('frugale');
    expect(sournoise).toBeDefined();
    expect(frugale).toBeDefined();

    const forgeResult = calculateForgeCraft({
      category: 'WEAPON',
      bonus: 2,
      slots: [sournoise!, frugale!],
    });

    expect(forgeResult.isValid).toBe(true);
    if (forgeResult.isValid) {
      expect(forgeResult.effectiveTier).toBe(5);
      expect(forgeResult.priceCeiling).toBe(25000);

      const marketResultNominal = simulateMarket(forgeResult.priceCeiling, 15);
      expect(marketResultNominal.finalPrice).toBe(25000);
      expect(marketResultNominal.complication.hasComplication).toBe(false);

      const marketResultIncident = simulateMarket(forgeResult.priceCeiling, 18);
      expect(marketResultIncident.finalPrice).toBe(25000);
      expect(marketResultIncident.complication.hasComplication).toBe(true);
      expect(marketResultIncident.complication.severity).toBe('WORKSHOP_INCIDENT');
    }
  });
});
