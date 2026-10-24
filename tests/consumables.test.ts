import { describe, it, expect } from "vitest";
import {
  calculateAmmunitionQuote,
  calculatePotionQuote,
  calculateSpecialConsumableQuote,
  type AmmunitionConfig,
  type PotionTier,
  type PotionRuleVariant
} from "../src/domain/consumables.js";

describe("calculateAmmunitionQuote", () => {
  it.each([
    {
      id: "ten-arrows-plus-1",
      config: { quantity: 10, bonus: 1, slots: 0 },
      expectedCeiling: 200
    },
    {
      id: "ten-arrows-plus-2",
      config: { quantity: 10, bonus: 2, slots: 0 },
      expectedCeiling: 1800
    },
    {
      id: "ten-arrows-plus-3",
      config: { quantity: 10, bonus: 3, slots: 0 },
      expectedCeiling: 7200
    },
    {
      id: "twenty-unbreakable-arrows-no-magic",
      config: { quantity: 20, bonus: 0, slots: 0, unbreakable: true },
      expectedCeiling: 400
    },
    {
      id: "ten-silvered-plus-1-unbreakable-arrows-composite",
      config: { quantity: 10, bonus: 1, slots: 0, silvered: true, unbreakable: true },
      expectedCeiling: 500
    },
    {
      id: "ten-forceful-arrows",
      config: { quantity: 10, bonus: 0, slots: 0, forceful: true },
      expectedCeiling: 200
    }
  ])("calculates ammunition batch ceiling accurately for $id", ({ config, expectedCeiling }) => {
    const result = calculateAmmunitionQuote(config as AmmunitionConfig);
    expect(result.valid).toBe(true);
    expect(result.ceilingPrice).toBe(expectedCeiling);
  });

  it("rejects invalid ammunition quantity or bonus", () => {
    const zeroQty = calculateAmmunitionQuote({ quantity: 0, bonus: 1, slots: 0 });
    expect(zeroQty.valid).toBe(false);
    expect(zeroQty.error).toBe("INVALID_QUANTITY");

    const capacityExceeded = calculateAmmunitionQuote({ quantity: 10, bonus: 1, slots: 2 });
    expect(capacityExceeded.valid).toBe(false);
    expect(capacityExceeded.error).toBe("SLOTS_EXCEED_BONUS_CAPACITY");
  });
});

describe("calculatePotionQuote", () => {
  it.each([
    {
      id: "healing-common-standard",
      tier: "common" as PotionTier,
      variant: "standard" as PotionRuleVariant,
      expectedPrice: 50
    },
    {
      id: "healing-uncommon-standard",
      tier: "uncommon" as PotionTier,
      variant: "standard" as PotionRuleVariant,
      expectedPrice: 500
    },
    {
      id: "healing-uncommon-2024",
      tier: "uncommon" as PotionTier,
      variant: "dnd_2024" as PotionRuleVariant,
      expectedPrice: 200
    },
    {
      id: "healing-rare-standard",
      tier: "rare" as PotionTier,
      variant: "standard" as PotionRuleVariant,
      expectedPrice: 5000
    },
    {
      id: "healing-rare-2024",
      tier: "rare" as PotionTier,
      variant: "dnd_2024" as PotionRuleVariant,
      expectedPrice: 2000
    },
    {
      id: "healing-very-rare-standard",
      tier: "very_rare" as PotionTier,
      variant: "standard" as PotionRuleVariant,
      expectedPrice: 50000
    },
    {
      id: "healing-very-rare-2024",
      tier: "very_rare" as PotionTier,
      variant: "dnd_2024" as PotionRuleVariant,
      expectedPrice: 20000
    }
  ])("prices healing potion accurately for $id", ({ tier, variant, expectedPrice }) => {
    const result = calculatePotionQuote(tier, variant, 1);
    expect(result.unitPrice).toBe(expectedPrice);
    expect(result.totalPrice).toBe(expectedPrice);
  });
});

describe("calculateSpecialConsumableQuote", () => {
  it.each([
    { id: "vanishing-dust", key: "vanishing_dust", quantity: 2, expectedTotal: 500 },
    { id: "healing-salve", key: "healing_salve", quantity: 3, expectedTotal: 450 },
    { id: "sovereign-glue", key: "sovereign_glue", quantity: 1, expectedTotal: 2000 }
  ])("calculates specialty consumable quote for $id", ({ key, quantity, expectedTotal }) => {
    const result = calculateSpecialConsumableQuote(key, quantity);
    expect(result.valid).toBe(true);
    expect(result.totalPrice).toBe(expectedTotal);
  });
});
