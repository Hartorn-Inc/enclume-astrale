import { describe, it, expect } from "vitest";
import {
  simulateMarketTransaction,
  calculateMarketRatio,
  rollMarketD20,
  type MarketOutcomeType
} from "../src/domain/market.js";

describe("calculateMarketRatio", () => {
  it.each([
    { id: "roll-1-minimal-ratio-72", d20: 1, expectedRatio: 0.72 },
    { id: "roll-3-ratio-76", d20: 3, expectedRatio: 0.76 },
    { id: "roll-5-ratio-80", d20: 5, expectedRatio: 0.8 },
    { id: "roll-10-ratio-90", d20: 10, expectedRatio: 0.9 },
    { id: "roll-14-ratio-98", d20: 14, expectedRatio: 0.98 },
    { id: "roll-15-exact-ceiling-100", d20: 15, expectedRatio: 1.0 },
    { id: "roll-16-capped-at-100", d20: 16, expectedRatio: 1.0 },
    { id: "roll-18-capped-at-100", d20: 18, expectedRatio: 1.0 },
    { id: "roll-20-capped-at-100", d20: 20, expectedRatio: 1.0 }
  ])("calculates ratio according to min(1, (70 + 2*d20)/100) for $id", ({ d20, expectedRatio }) => {
    expect(calculateMarketRatio(d20)).toBeCloseTo(expectedRatio, 4);
  });
});

describe("simulateMarketTransaction", () => {
  it.each([
    {
      id: "roll-1-exceptional-discount-22950",
      ceilingPrice: 22950,
      d20: 1,
      expectedFinalPrice: 16524,
      expectedHasComplication: false,
      expectedOutcome: "exceptional_deal" as MarketOutcomeType
    },
    {
      id: "roll-3-historical-armor-quote-22950",
      ceilingPrice: 22950,
      d20: 3,
      expectedFinalPrice: 17442,
      expectedHasComplication: false,
      expectedOutcome: "exceptional_deal" as MarketOutcomeType
    },
    {
      id: "roll-15-nominal-ceiling-25000",
      ceilingPrice: 25000,
      d20: 15,
      expectedFinalPrice: 25000,
      expectedHasComplication: false,
      expectedOutcome: "nominal_ceiling" as MarketOutcomeType
    },
    {
      id: "roll-16-specific-component-25000",
      ceilingPrice: 25000,
      d20: 16,
      expectedFinalPrice: 25000,
      expectedHasComplication: true,
      expectedOutcome: "specific_component_required" as MarketOutcomeType
    },
    {
      id: "roll-18-workshop-incident-25000",
      ceilingPrice: 25000,
      d20: 18,
      expectedFinalPrice: 25000,
      expectedHasComplication: true,
      expectedOutcome: "workshop_incident" as MarketOutcomeType
    },
    {
      id: "roll-20-major-complication-quest-25000",
      ceilingPrice: 25000,
      d20: 20,
      expectedFinalPrice: 25000,
      expectedHasComplication: true,
      expectedOutcome: "major_complication" as MarketOutcomeType
    }
  ])("simulates transaction accurately for $id", ({
    ceilingPrice,
    d20,
    expectedFinalPrice,
    expectedHasComplication,
    expectedOutcome
  }) => {
    const result = simulateMarketTransaction(ceilingPrice, d20);
    expect(result.finalPrice).toBe(expectedFinalPrice);
    expect(result.hasComplication).toBe(expectedHasComplication);
    expect(result.outcomeType).toBe(expectedOutcome);
    expect(result.finalPrice).toBeLessThanOrEqual(ceilingPrice);
  });

  it("clamps invalid d20 inputs strictly to [1..20]", () => {
    const under = simulateMarketTransaction(1000, -5);
    expect(under.d20).toBe(1);
    expect(under.finalPrice).toBe(720);

    const over = simulateMarketTransaction(1000, 99);
    expect(over.d20).toBe(20);
    expect(over.finalPrice).toBe(1000);
    expect(over.hasComplication).toBe(true);
  });

  it("handles random generator producing valid rolls between 1 and 20", () => {
    for (let i = 0; i < 50; i++) {
      const roll = rollMarketD20();
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(20);
    }
  });
});
