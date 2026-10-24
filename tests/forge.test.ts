import { describe, it, expect } from "vitest";
import {
  calculateForgeQuote,
  calculateUpgradeQuote,
  calculateBaseTriangularLevel,
  type ItemCategory
} from "../src/domain/forge.js";

describe("calculateBaseTriangularLevel", () => {
  it.each([
    { id: "bonus-0-zero-base", bonus: 0, expected: 0 },
    { id: "bonus-1-triangular-1", bonus: 1, expected: 1 },
    { id: "bonus-2-triangular-3", bonus: 2, expected: 3 },
    { id: "bonus-3-triangular-6", bonus: 3, expected: 6 },
    { id: "bonus-4-triangular-10", bonus: 4, expected: 10 }
  ])("computes T(B) for $id", ({ bonus, expected }) => {
    expect(calculateBaseTriangularLevel(bonus)).toBe(expected);
  });
});

describe("calculateForgeQuote", () => {
  it.each([
    {
      id: "weapon-plus-1-bare",
      input: { category: "weapon" as ItemCategory, bonus: 1, slots: 0 },
      expected: { valid: true, baseLevel: 1, effectiveLevel: 1, ceilingPrice: 1000 }
    },
    {
      id: "weapon-plus-2-bare",
      input: { category: "weapon" as ItemCategory, bonus: 2, slots: 0 },
      expected: { valid: true, baseLevel: 3, effectiveLevel: 3, ceilingPrice: 9000 }
    },
    {
      id: "weapon-plus-2-two-slots-frugale-sournoise",
      input: { category: "weapon" as ItemCategory, bonus: 2, slots: 2 },
      expected: { valid: true, baseLevel: 3, effectiveLevel: 5, ceilingPrice: 25000 }
    },
    {
      id: "weapon-plus-3-bare",
      input: { category: "weapon" as ItemCategory, bonus: 3, slots: 0 },
      expected: { valid: true, baseLevel: 6, effectiveLevel: 6, ceilingPrice: 36000 }
    },
    {
      id: "weapon-plus-4-bare",
      input: { category: "weapon" as ItemCategory, bonus: 4, slots: 0 },
      expected: { valid: true, baseLevel: 10, effectiveLevel: 10, ceilingPrice: 100000 }
    },
    {
      id: "armor-plus-2-bare",
      input: { category: "armor_or_shield" as ItemCategory, bonus: 2, slots: 0 },
      expected: { valid: true, baseLevel: 3, effectiveLevel: 3, ceilingPrice: 7650 }
    },
    {
      id: "armor-plus-3-bare",
      input: { category: "armor_or_shield" as ItemCategory, bonus: 3, slots: 0 },
      expected: { valid: true, baseLevel: 6, effectiveLevel: 6, ceilingPrice: 30600 }
    },
    {
      id: "autonomous-item-level-1",
      input: { category: "autonomous_permanent" as ItemCategory, bonus: 0, slots: 1 },
      expected: { valid: true, baseLevel: 0, effectiveLevel: 1, ceilingPrice: 800 }
    },
    {
      id: "autonomous-item-level-5",
      input: { category: "autonomous_permanent" as ItemCategory, bonus: 0, slots: 5 },
      expected: { valid: true, baseLevel: 0, effectiveLevel: 5, ceilingPrice: 20000 }
    }
  ])("calculates quote accurately for $id", ({ input, expected }) => {
    const result = calculateForgeQuote(input);
    expect(result.valid).toBe(expected.valid);
    expect(result.baseLevel).toBe(expected.baseLevel);
    expect(result.effectiveLevel).toBe(expected.effectiveLevel);
    expect(result.ceilingPrice).toBe(expected.ceilingPrice);
  });

  it.each([
    {
      id: "weapon-plus-1-with-2-slots-exceeds-capacity",
      input: { category: "weapon" as ItemCategory, bonus: 1, slots: 2 }
    },
    {
      id: "weapon-plus-2-with-3-slots-exceeds-capacity",
      input: { category: "weapon" as ItemCategory, bonus: 2, slots: 3 }
    }
  ])("rejects configuration violating capacity for $id", ({ input }) => {
    const result = calculateForgeQuote(input);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("SLOTS_EXCEED_BONUS_CAPACITY");
    expect(result.ceilingPrice).toBe(0);
  });
});

describe("calculateUpgradeQuote", () => {
  it.each([
    {
      id: "weapon-plus-1-to-plus-2",
      initial: { category: "weapon" as ItemCategory, bonus: 1, slots: 0 },
      target: { category: "weapon" as ItemCategory, bonus: 2, slots: 0 },
      expectedCost: 8000
    },
    {
      id: "weapon-plus-1-add-1-slot",
      initial: { category: "weapon" as ItemCategory, bonus: 1, slots: 0 },
      target: { category: "weapon" as ItemCategory, bonus: 1, slots: 1 },
      expectedCost: 3000
    },
    {
      id: "armor-plus-2-bare-to-plus-3-bare",
      initial: { category: "armor_or_shield" as ItemCategory, bonus: 2, slots: 0 },
      target: { category: "armor_or_shield" as ItemCategory, bonus: 3, slots: 0 },
      expectedCost: 22950
    }
  ])("calculates upgrade cost difference for $id", ({ initial, target, expectedCost }) => {
    const result = calculateUpgradeQuote(initial, target);
    expect(result.valid).toBe(true);
    expect(result.upgradeCost).toBe(expectedCost);
  });

  it.each([
    {
      id: "invalid-target-slots-exceed-bonus",
      initial: { category: "weapon" as ItemCategory, bonus: 2, slots: 0 },
      target: { category: "weapon" as ItemCategory, bonus: 2, slots: 3 }
    },
    {
      id: "downgrade-not-permitted",
      initial: { category: "weapon" as ItemCategory, bonus: 2, slots: 0 },
      target: { category: "weapon" as ItemCategory, bonus: 1, slots: 0 }
    }
  ])("rejects invalid upgrade requests for $id", ({ initial, target }) => {
    const result = calculateUpgradeQuote(initial, target);
    expect(result.valid).toBe(false);
  });
});
