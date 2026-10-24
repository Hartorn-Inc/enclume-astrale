import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from '../src/App';
import { ForgeCalculator } from '../src/components/ForgeCalculator';
import { MarketSimulator } from '../src/components/MarketSimulator';
import { AmmoAndConsumables } from '../src/components/AmmoAndConsumables';
import { GrimoireCatalog } from '../src/components/GrimoireCatalog';
import { computeAmmoQuote } from '../src/domain/forge';
import { simulateMarket } from '../src/domain/market';
import { ENCHANTMENT_CATALOG, HEALING_POTIONS } from '../src/domain/catalog';

const normalizeSpaces = (str: string): string => str.replace(/[\u202F\u00A0]/g, ' ');
const cleanHtml = (raw: string): string => normalizeSpaces(raw.replace(/<!--.*?-->/g, ''));
const formatFrPrice = (price: number): string => normalizeSpaces(`${price.toLocaleString('fr-FR')} po`);

describe('Application & UI Rendering Integrity', () => {
  it('renders the complete App component tree without errors', () => {
    const html = renderToString(<App />);
    expect(html).toContain("L&#x27;Enclume Astrale");
    expect(html).toContain('Forge &amp; Améliorations');
    expect(html).toContain('Négociation Marché (d20)');
    expect(html).toContain('Munitions &amp; Consommables');
    expect(html).toContain("Grimoire d&#x27;Enchantements");
  });

  it('includes proper accessible navigation and ARIA landmarks', () => {
    const html = renderToString(<App />);
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');
    expect(html).toContain('role="tabpanel"');
  });
});

describe('ForgeCalculator Component Rendering & Error Handling', () => {
  it.each([
    { category: 'WEAPON' as const, bonus: 1, enchantments: [] as string[], expectedPrice: formatFrPrice(1000) },
    { category: 'WEAPON' as const, bonus: 2, enchantments: [] as string[], expectedPrice: formatFrPrice(9000) },
    { category: 'WEAPON' as const, bonus: 2, enchantments: ['sournoise', 'frugale'], expectedPrice: formatFrPrice(25000) },
  ])(
    'displays correct ceiling price for category=$category bonus=$bonus: $expectedPrice',
    ({ category, bonus, enchantments, expectedPrice }) => {
      const html = renderToString(
        <ForgeCalculator
          initialCategory={category}
          initialBonus={bonus}
          initialEnchantmentIds={enchantments}
        />
      );
      const sanitized = cleanHtml(html);
      expect(sanitized).toContain(expectedPrice);
      expect(sanitized).not.toContain('Intégrité de capacité violée');
    }
  );

  it('displays capacity violation alert and blocks quote when slots exceed bonus (S > B)', () => {
    // B=1 with 'flamboyante' (2 slots) -> S=2 > B=1
    const html = renderToString(
      <ForgeCalculator
        initialCategory="WEAPON"
        initialBonus={1}
        initialEnchantmentIds={['flamboyante']}
      />
    );
    expect(html).toContain('Intégrité de capacité violée');
    expect(html).toContain('L&#x27;artisan refuse le devis');
    expect(html).not.toContain('data-testid="ceiling-price"');
  });
});

describe('MarketSimulator Component & d20 Outcomes', () => {
  it.each([
    { ceiling: 22950, roll: 1, expectedFinal: formatFrPrice(16524), hasComplication: false },
    { ceiling: 22950, roll: 3, expectedFinal: formatFrPrice(17442), hasComplication: false },
    { ceiling: 25000, roll: 15, expectedFinal: formatFrPrice(25000), hasComplication: false },
    { ceiling: 25000, roll: 18, expectedFinal: formatFrPrice(25000), hasComplication: true },
  ])(
    'simulates market roll=$roll on ceiling=$ceiling -> $expectedFinal',
    ({ ceiling, roll, expectedFinal, hasComplication }) => {
      const simulation = simulateMarket(ceiling, roll);
      expect(formatFrPrice(simulation.finalPrice)).toBe(expectedFinal);
      expect(simulation.hasComplication).toBe(hasComplication);
    }
  );

  it('renders screen reader live region (aria-live="polite") for accessible roll announcements', () => {
    const html = renderToString(<MarketSimulator ceilingPrice={10000} />);
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('data-testid="market-announcement"');
    expect(html).toContain('Prix Négocié Final');
  });
});

describe('AmmoAndConsumables Component & Ruleset Profiles', () => {
  it.each([
    { bonus: 1, qty: 10, expectedPrice: formatFrPrice(200) },
    { bonus: 2, qty: 10, expectedPrice: formatFrPrice(1800) },
  ])(
    'evaluates standard arrows bonus=$bonus qty=$qty -> $expectedPrice',
    ({ bonus, qty, expectedPrice }) => {
      const quote = computeAmmoQuote({ baseBonus: bonus, quantity: qty });
      expect(quote.isValid).toBe(true);
      if (quote.isValid) {
        expect(formatFrPrice(quote.totalPrice)).toBe(expectedPrice);
      }
    }
  );

  it.each([
    { profile: 'CLASSIC_5E' as const, rarity: 'UNCOMMON' as const, expectedPrice: formatFrPrice(500) },
    { profile: 'REVISED_2024' as const, rarity: 'UNCOMMON' as const, expectedPrice: formatFrPrice(200) },
    { profile: 'CLASSIC_5E' as const, rarity: 'RARE' as const, expectedPrice: formatFrPrice(5000) },
    { profile: 'REVISED_2024' as const, rarity: 'RARE' as const, expectedPrice: formatFrPrice(2000) },
    { profile: 'CLASSIC_5E' as const, rarity: 'VERY_RARE' as const, expectedPrice: formatFrPrice(50000) },
    { profile: 'REVISED_2024' as const, rarity: 'VERY_RARE' as const, expectedPrice: formatFrPrice(20000) },
  ])(
    'verifies healing potion rarity=$rarity with profile=$profile costs $expectedPrice',
    ({ profile, rarity, expectedPrice }) => {
      const potion = HEALING_POTIONS.find((p) => p.rarity === rarity);
      expect(formatFrPrice(potion?.prices[profile] ?? 0)).toBe(expectedPrice);
    }
  );

  it('renders potions and special consumables in table structure', () => {
    const html = renderToString(<AmmoAndConsumables ruleset="CLASSIC_5E" />);
    expect(html).toContain('Potion de soins');
    expect(html).toContain('Poudre de disparition');
    expect(html).toContain('Onguent de soin');
    expect(html).toContain('Colle universelle');
  });
});

describe('GrimoireCatalog Component & Filters', () => {
  it('renders all catalog enchantments by default', () => {
    const html = renderToString(<GrimoireCatalog />);
    for (const ench of ENCHANTMENT_CATALOG) {
      expect(html).toContain(ench.name);
    }
  });

  it('verifies slot badge representation for enchantments', () => {
    const html = renderToString(<GrimoireCatalog />);
    expect(html).toContain('1 slot');
    expect(html).toContain('2 slots');
    expect(html).toContain('3 slots');
    expect(html).toContain('4 slots');
  });
});
