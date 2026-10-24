import { describe, it, expect } from "vitest";
import {
  ENCHANTMENT_PROPERTIES,
  REFERENCE_AUTONOMOUS_ITEMS,
  searchCatalog,
  findEnchantmentById,
  findAutonomousItemById
} from "../src/domain/catalog.js";

describe("ENCHANTMENT_PROPERTIES", () => {
  it("includes Frugale and Sournoise with exactly 1 slot cost", () => {
    const frugale = findEnchantmentById("frugale");
    expect(frugale).toBeDefined();
    expect(frugale?.slotCost).toBe(1);
    expect(frugale?.category).toBe("weapon");

    const sournoise = findEnchantmentById("sournoise");
    expect(sournoise).toBeDefined();
    expect(sournoise?.slotCost).toBe(1);
    expect(sournoise?.category).toBe("weapon");
  });

  it("contains both weapon and armor enchantments", () => {
    const weaponProps = ENCHANTMENT_PROPERTIES.filter((p) => p.category === "weapon");
    const armorProps = ENCHANTMENT_PROPERTIES.filter((p) => p.category === "armor_or_shield");
    expect(weaponProps.length).toBeGreaterThanOrEqual(5);
    expect(armorProps.length).toBeGreaterThanOrEqual(3);
  });
});

describe("REFERENCE_AUTONOMOUS_ITEMS", () => {
  it("contains 10 calibrated autonomous items matching C=0.80 pricing", () => {
    expect(REFERENCE_AUTONOMOUS_ITEMS.length).toBe(10);
    for (const item of REFERENCE_AUTONOMOUS_ITEMS) {
      const expectedCeiling = Math.round(0.8 * 1000 * item.effectiveLevel * item.effectiveLevel);
      expect(item.ceilingPrice).toBe(expectedCeiling);
    }
  });

  it.each([
    { id: "cape-displacement", key: "displacement_cloak", expectedLevel: 2, expectedCeiling: 3200 },
    { id: "spell-storing-ring", key: "ring_of_spell_storing", expectedLevel: 2, expectedCeiling: 3200 },
    { id: "folding-boat", key: "folding_boat", expectedLevel: 2, expectedCeiling: 3200 },
    { id: "bag-of-holding", key: "bag_of_holding", expectedLevel: 1, expectedCeiling: 800 },
    { id: "celestial-regeneration-ring", key: "celestial_regeneration_ring", expectedLevel: 6, expectedCeiling: 28800 }
  ])("calibrates reference item $id accurately", ({ key, expectedLevel, expectedCeiling }) => {
    const item = findAutonomousItemById(key);
    expect(item).toBeDefined();
    expect(item?.effectiveLevel).toBe(expectedLevel);
    expect(item?.ceilingPrice).toBe(expectedCeiling);
  });
});

describe("searchCatalog", () => {
  it.each([
    { id: "query-frugale", query: "frugale", expectedMinResults: 1 },
    { id: "query-case-insensitive", query: "SOURNOISE", expectedMinResults: 1 },
    { id: "filter-by-weapon", query: "", category: "weapon" as const, expectedMinResults: 5 },
    { id: "filter-by-autonomous", query: "", category: "autonomous_permanent" as const, expectedMinResults: 10 }
  ])("filters catalog according to criteria for $id", ({ query, category, expectedMinResults }) => {
    const results = searchCatalog({ query, category });
    expect(results.length).toBeGreaterThanOrEqual(expectedMinResults);
  });
});
