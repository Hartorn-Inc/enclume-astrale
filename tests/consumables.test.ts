import { describe, it, expect } from 'vitest';
import {
  HEALING_POTIONS,
  SPECIAL_CONSUMABLES,
  getHealingPotionPrice,
  calculateHealingPotionBatchCost,
  calculateSpecialConsumableCost,
} from '../src/domain/consumables';
import { getEnchantmentsByCategory, getEnchantmentById } from '../src/domain/catalog';
import { PotionRarity, ItemCategory } from '../src/domain/types';

describe('Catalogue des potions de soins & switch 5e standard vs 2024', () => {
  it.each([
    ['common' as PotionRarity, 'standard_5e' as const, 50],
    ['common' as PotionRarity, 'variant_2024' as const, 50],
    ['uncommon' as PotionRarity, 'standard_5e' as const, 500],
    ['uncommon' as PotionRarity, 'variant_2024' as const, 200],
    ['rare' as PotionRarity, 'standard_5e' as const, 5000],
    ['rare' as PotionRarity, 'variant_2024' as const, 2000],
    ['very_rare' as PotionRarity, 'standard_5e' as const, 50000],
    ['very_rare' as PotionRarity, 'variant_2024' as const, 20000],
  ])('potion %s sous %s coûte %i po', (rarity, ruleset, expectedPrice) => {
    expect(getHealingPotionPrice(rarity, ruleset)).toBe(expectedPrice);
  });

  it('calcule le coût de lots de potions avec quantité variable', () => {
    // 5 potions peu communes en variante 2024 = 5 * 200 = 1 000 po
    expect(calculateHealingPotionBatchCost('uncommon', 5, 'variant_2024')).toBe(1000);
    // 3 potions rares en 5e standard = 3 * 5000 = 15 000 po
    expect(calculateHealingPotionBatchCost('rare', 3, 'standard_5e')).toBe(15000);
  });

  it('vérifie les 4 formules de dés des potions', () => {
    expect(HEALING_POTIONS.find((p) => p.rarity === 'common')?.diceFormula).toBe('2d4+2');
    expect(HEALING_POTIONS.find((p) => p.rarity === 'uncommon')?.diceFormula).toBe('4d4+4');
    expect(HEALING_POTIONS.find((p) => p.rarity === 'rare')?.diceFormula).toBe('8d4+8');
    expect(HEALING_POTIONS.find((p) => p.rarity === 'very_rare')?.diceFormula).toBe('10d4+20');
  });
});

describe('Consommables spéciaux', () => {
  it.each([
    ['dust_of_disappearance', 1, 250],
    ['dust_of_disappearance', 4, 1000],
    ['keoghtoms_ointment', 1, 150],
    ['keoghtoms_ointment', 2, 300],
    ['sovereign_glue', 1, 2000],
  ])('consommable %s x %i = %i po', (id, qty, expected) => {
    expect(calculateSpecialConsumableCost(id, qty)).toBe(expected);
  });

  it('lève une exception si l id est inconnu', () => {
    expect(() => calculateSpecialConsumableCost('unknown_item', 1)).toThrow();
  });
});

describe('Grimoire d enchantements & compatibilités', () => {
  it('fournit Sournoise (1 slot) et Frugale (1 slot) pour armes', () => {
    const sneak = getEnchantmentById('sneak_strike');
    expect(sneak).toBeDefined();
    expect(sneak?.slotCost).toBe(1);
    expect(sneak?.compatibleCategories).toContain('weapon');

    const frugal = getEnchantmentById('frugal_edge');
    expect(frugal).toBeDefined();
    expect(frugal?.slotCost).toBe(1);
    expect(frugal?.compatibleCategories).toContain('weapon');
  });

  it.each([
    ['weapon' as ItemCategory, 1],
    ['armor_shield' as ItemCategory, 1],
    ['standalone' as ItemCategory, 1],
  ])('la categorie %s possède des enchantements compatibles', (category) => {
    const list = getEnchantmentsByCategory(category);
    expect(list.length).toBeGreaterThanOrEqual(1);
    list.forEach((item) => {
      expect(item.compatibleCategories).toContain(category);
      expect(item.slotCost).toBeGreaterThanOrEqual(1);
    });
  });
});
