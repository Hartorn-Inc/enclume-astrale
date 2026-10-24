import { describe, it, expect } from 'vitest';
import {
  simulateMarket,
  classifyRoll,
  MarketTier,
  ComplicationSeverity
} from '../src/domain/market';
import {
  ENCHANTMENTS_CATALOG,
  HEALING_POTIONS,
  SPECIAL_CONSUMABLES,
  getHealingPotionPrice
} from '../src/domain/catalog';

describe('simulateMarket — CDC Golden Test Cases', () => {
  it('d20 = 1 sur 22 950 po donne 16 524 po (72 %)', () => {
    const res = simulateMarket(22950, 1);
    expect(res.rate).toBe(0.72);
    expect(res.paidPrice).toBe(16524);
    expect(res.discountAmount).toBe(22950 - 16524);
    expect(res.hasComplication).toBe(false);
    expect(res.tier).toBe('EXCEPTIONAL_DEAL');
  });

  it('d20 = 3 sur 22 950 po donne 17 442 po (76 %)', () => {
    const res = simulateMarket(22950, 3);
    expect(res.rate).toBe(0.76);
    expect(res.paidPrice).toBe(17442);
    expect(res.discountAmount).toBe(22950 - 17442);
    expect(res.hasComplication).toBe(false);
    expect(res.tier).toBe('VERY_ADVANTAGEOUS');
  });

  it('d20 = 15 sur 25 000 po donne 25 000 po (100 %, aucun incident)', () => {
    const res = simulateMarket(25000, 15);
    expect(res.rate).toBe(1.0);
    expect(res.paidPrice).toBe(25000);
    expect(res.discountAmount).toBe(0);
    expect(res.hasComplication).toBe(false);
    expect(res.tier).toBe('NOMINAL');
  });

  it("d20 = 18 sur 25 000 po donne 25 000 po (100 %, incident d'atelier)", () => {
    const res = simulateMarket(25000, 18);
    expect(res.rate).toBe(1.0);
    expect(res.paidPrice).toBe(25000);
    expect(res.discountAmount).toBe(0);
    expect(res.hasComplication).toBe(true);
    expect(res.tier).toBe('WORKSHOP_INCIDENT');
    expect(res.complicationSeverity).toBe('WORKSHOP');
    expect(res.complicationDescription).toBeDefined();
  });
});

describe('simulateMarket — Plafond garanti & Exhaustivité des 20 jets', () => {
  const d20ExpectedGrid: Array<[number, number, MarketTier, ComplicationSeverity]> = [
    [1, 0.72, 'EXCEPTIONAL_DEAL', 'NONE'],
    [2, 0.74, 'VERY_ADVANTAGEOUS', 'NONE'],
    [3, 0.76, 'VERY_ADVANTAGEOUS', 'NONE'],
    [4, 0.78, 'VERY_ADVANTAGEOUS', 'NONE'],
    [5, 0.80, 'VERY_ADVANTAGEOUS', 'NONE'],
    [6, 0.82, 'FAVORABLE', 'NONE'],
    [7, 0.84, 'FAVORABLE', 'NONE'],
    [8, 0.86, 'FAVORABLE', 'NONE'],
    [9, 0.88, 'FAVORABLE', 'NONE'],
    [10, 0.90, 'FAVORABLE', 'NONE'],
    [11, 0.92, 'REGULAR_PRICE', 'NONE'],
    [12, 0.94, 'REGULAR_PRICE', 'NONE'],
    [13, 0.96, 'REGULAR_PRICE', 'NONE'],
    [14, 0.98, 'REGULAR_PRICE', 'NONE'],
    [15, 1.00, 'NOMINAL', 'NONE'],
    [16, 1.00, 'MINOR_COMPLICATION', 'MINOR'],
    [17, 1.00, 'MINOR_COMPLICATION', 'MINOR'],
    [18, 1.00, 'WORKSHOP_INCIDENT', 'WORKSHOP'],
    [19, 1.00, 'WORKSHOP_INCIDENT', 'WORKSHOP'],
    [20, 1.00, 'MAJOR_COMPLICATION', 'MAJOR']
  ];

  it.each(d20ExpectedGrid)(
    'd20=%i applique le taux %s, le palier %s et sévérité %s sans dépasser le plafond',
    (d20, expectedRate, expectedTier, expectedSeverity) => {
      const basePrice = 10000;
      const res = simulateMarket(basePrice, d20);

      expect(res.rate).toBeCloseTo(expectedRate, 4);
      expect(res.tier).toBe(expectedTier);
      expect(res.complicationSeverity).toBe(expectedSeverity);
      expect(res.paidPrice).toBeLessThanOrEqual(basePrice);
      expect(res.paidPrice).toBe(Math.round(basePrice * expectedRate));

      if (expectedSeverity === 'NONE') {
        expect(res.hasComplication).toBe(false);
        expect(res.complicationDescription).toBeUndefined();
      } else {
        expect(res.hasComplication).toBe(true);
        expect(res.complicationDescription).toBeTruthy();
      }
    }
  );

  it.each([0, 21, -1, 12.5, NaN])('rejette un jet d20 invalide : %s', (invalidD20) => {
    expect(() => simulateMarket(1000, invalidD20 as number)).toThrow();
  });

  it.each([-100, NaN, -0.5])('rejette un prix de base négatif ou non fini : %s', (invalidPrice) => {
    expect(() => simulateMarket(invalidPrice as number, 10)).toThrow();
  });

  it('gère correctement un prix de base à 0 po', () => {
    const res = simulateMarket(0, 1);
    expect(res.paidPrice).toBe(0);
    expect(res.discountAmount).toBe(0);
  });
});

describe('classifyRoll direct checks', () => {
  it('lève une exception pour un tirage invalide', () => {
    expect(() => classifyRoll(25)).toThrow(/hors bornes/);
  });
});

describe('Catalog — Grimoire & Enchantements', () => {
  it('contient au moins 8 enchantements couvrant armes, armures et objets autonomes', () => {
    expect(ENCHANTMENTS_CATALOG.length).toBeGreaterThanOrEqual(8);
  });

  it.each([
    ['sneak-strike', 'Sournoise', 1, 'WEAPON'],
    ['frugal-edge', 'Frugale', 1, 'WEAPON'],
    ['elemental-ward', 'Défense Élémentaire', 1, 'ARMOR_SHIELD'],
    ['arcane-reservoir', "Résonance d'Arcane", 1, 'WONDROUS_ITEM']
  ])('inclut lenchantement %s (%s, coût %i)', (id, name, slotCost, expectedCat) => {
    const enc = ENCHANTMENTS_CATALOG.find((e) => e.id === id);
    expect(enc).toBeDefined();
    expect(enc?.name).toBe(name);
    expect(enc?.slotCost).toBe(slotCost);
    expect(enc?.applicableCategories).toContain(expectedCat);
  });

  it('garantit que tous les enchantements ont un coût en slot valide (1 à 4)', () => {
    for (const enc of ENCHANTMENTS_CATALOG) {
      expect(enc.slotCost).toBeGreaterThanOrEqual(1);
      expect(enc.slotCost).toBeLessThanOrEqual(4);
      expect(enc.applicableCategories.length).toBeGreaterThan(0);
    }
  });
});

describe('Catalog — Potions & Consommables alchimiques', () => {
  it.each([
    ['COMMON', 'CLASSIC_5E', 50],
    ['COMMON', 'REVISED_2024', 50],
    ['UNCOMMON', 'CLASSIC_5E', 500],
    ['UNCOMMON', 'REVISED_2024', 200],
    ['RARE', 'CLASSIC_5E', 5000],
    ['RARE', 'REVISED_2024', 2000],
    ['VERY_RARE', 'CLASSIC_5E', 50000],
    ['VERY_RARE', 'REVISED_2024', 20000]
  ] as const)(
    'retourne le barème exact pour la potion %s en variante %s : %i po',
    (rarity, variant, expectedPrice) => {
      expect(getHealingPotionPrice(rarity, variant)).toBe(expectedPrice);
    }
  );

  it('définit les consommables spéciaux attendus avec leurs prix exacts', () => {
    const dust = SPECIAL_CONSUMABLES.find((c) => c.name === 'Poudre de disparition');
    const ointment = SPECIAL_CONSUMABLES.find((c) => c.name === 'Onguent de soin');
    const glue = SPECIAL_CONSUMABLES.find((c) => c.name === 'Colle universelle');

    expect(dust).toBeDefined();
    expect(dust?.price).toBe(250);

    expect(ointment).toBeDefined();
    expect(ointment?.price).toBe(150);

    expect(glue).toBeDefined();
    expect(glue?.price).toBe(2000);
  });
});
