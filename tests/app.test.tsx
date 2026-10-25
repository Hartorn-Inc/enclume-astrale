import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { App, DEFAULT_APP_STATE, STORAGE_KEY, loadStoredState, AppStoredState } from '../src/App';
import { ForgeCalculator } from '../src/components/ForgeCalculator';
import { MarketSimulator } from '../src/components/MarketSimulator';
import { AmmoAndConsumables } from '../src/components/AmmoAndConsumables';
import { GrimoireCatalog } from '../src/components/GrimoireCatalog';

// Mock localStorage
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, val: string) => {
    mockStorage[key] = val;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    for (const k of Object.keys(mockStorage)) {
      delete mockStorage[k];
    }
  }),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('App Component & Root Rendering', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('renders base structure with header, tabs, and aria-live status', () => {
    const html = renderToString(<App />);
    expect(html).toContain("L&#x27;Enclume Astrale");
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Forge &amp; Améliorations');
    expect(html).toContain('Simulateur Marché d20');
    expect(html).toContain('Munitions &amp; Consommables');
    expect(html).toContain('Grimoire d&#x27;Enchantements');
  });

  it('persists and recovers state from localStorage', () => {
    const customState: AppStoredState = {
      ...DEFAULT_APP_STATE,
      activeTab: 'market',
      marketState: { basePrice: 42000, d20Roll: 18 },
    };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(customState));
    const loaded = loadStoredState();
    expect(loaded.activeTab).toBe('market');
    expect(loaded.marketState.basePrice).toBe(42000);
    expect(loaded.marketState.d20Roll).toBe(18);
  });
});

describe('ForgeCalculator — Acceptance Criteria & Limits', () => {
  const dummyOnChange = vi.fn();
  const dummyOnMarket = vi.fn();

  it.each([
    ['Arme +1 nue = 1 000 po', 'WEAPON', 1, [], '1 000', true],
    ['Arme +2 nue = 9 000 po', 'WEAPON', 2, [], '9 000', true],
    ['Arme +2 avec Sournoise (1) + Frugale (1) = 25 000 po', 'WEAPON', 2, ['sournoise', 'frugale'], '25 000', true],
    ['Armure +1 nue = 850 po', 'ARMOR_SHIELD', 1, [], '850', true],
    ['Armure +2 nue = 7 650 po', 'ARMOR_SHIELD', 2, [], '7 650', true],
    ['Objet autonome 1 slot = 800 po', 'WONDROUS_ITEM', 0, ['focalisation-tellurique'], '800', true],
  ] as const)(
    'renders quote correctly for %s',
    (_label, category, bonus, enchantments, expectedPriceStr, shouldBeValid) => {
      const html = renderToString(
        <ForgeCalculator
          state={{
            mode: 'creation',
            category,
            enhancementBonus: bonus,
            selectedEnchantmentIds: [...enchantments],
            upgradeInitialBonus: 1,
            upgradeInitialEnchantmentIds: [],
            upgradeFinalBonus: 2,
            upgradeFinalEnchantmentIds: [],
          }}
          onChange={dummyOnChange}
          onSendToMarket={dummyOnMarket}
        />
      );

      if (shouldBeValid) {
        expect(html.replace(/\s/g, ' ')).toContain(expectedPriceStr.replace(/\s/g, ' '));
        expect(html).not.toContain('Capacité magique dépassée');
      }
    }
  );

  it('displays immediate error warning and blocks quote when S > B', () => {
    // Arme +1 avec Choc Foudroyant (slot cost 2) -> S=2 > B=1
    const html = renderToString(
      <ForgeCalculator
        state={{
          mode: 'creation',
          category: 'WEAPON',
          enhancementBonus: 1,
          selectedEnchantmentIds: ['choc-foudroyant'],
          upgradeInitialBonus: 1,
          upgradeInitialEnchantmentIds: [],
          upgradeFinalBonus: 2,
          upgradeFinalEnchantmentIds: [],
        }}
        onChange={dummyOnChange}
        onSendToMarket={dummyOnMarket}
      />
    );

    expect(html).toContain('Capacité magique dépassée');
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('Plafond de devis garanti');
  });

  it('renders upgrade mode properly for Armure +2 to +3 = 22 950 po', () => {
    const html = renderToString(
      <ForgeCalculator
        state={{
          mode: 'upgrade',
          category: 'ARMOR_SHIELD',
          enhancementBonus: 1,
          selectedEnchantmentIds: [],
          upgradeInitialBonus: 2,
          upgradeInitialEnchantmentIds: [],
          upgradeFinalBonus: 3,
          upgradeFinalEnchantmentIds: [],
        }}
        onChange={dummyOnChange}
        onSendToMarket={dummyOnMarket}
      />
    );

    expect(html.replace(/\s/g, ' ')).toContain('22 950'.replace(/\s/g, ' '));
    expect(html).toContain('Coût net de l&#x27;amélioration');
  });
});

describe('MarketSimulator — Acceptance Criteria', () => {
  const dummyOnChange = vi.fn();
  const dummyOnAnnounce = vi.fn();

  it.each([
    [22950, 1, '16 524', 'Opportunité exceptionnelle', 'Remise de 28 %'],
    [22950, 3, '17 442', 'Affaire très avantageuse', 'Remise de 24 %'],
    [25000, 15, '25 000', 'Prix plafond nominal', 'Plafond nominal (100 %)'],
    [25000, 18, '25 000', "Incident d&#x27;atelier", 'Plafond nominal (100 %)'],
    [25000, 20, '25 000', 'Complication majeure', 'Plafond nominal (100 %)'],
  ] as const)(
    'for basePrice=%i and d20=%i displays price %s with outcome %s',
    (basePrice, d20, expectedPrice, expectedOutcome, expectedBadge) => {
      const html = renderToString(
        <MarketSimulator
          state={{ basePrice, d20Roll: d20 }}
          onChange={dummyOnChange}
          onAnnounce={dummyOnAnnounce}
        />
      );

      expect(html.replace(/\s/g, ' ')).toContain(expectedPrice.replace(/\s/g, ' '));
      expect(html).toContain(expectedOutcome);
      expect(html).toContain(expectedBadge);
    }
  );
});

describe('AmmoAndConsumables — Acceptance Criteria', () => {
  const dummyOnAmmoChange = vi.fn();
  const dummyOnConsumablesChange = vi.fn();
  const dummyOnMarket = vi.fn();

  it.each([
    ['10 flèches +1 (200 po)', 1, 0, 10, [], '200'],
    ['10 flèches +2 (1 800 po)', 2, 0, 10, [], '1 800'],
    ['10 flèches +1 avec Incassable = 200 + 200 = 400 po', 1, 0, 10, ['UNBREAKABLE'], '400'],
    ['10 flèches +1 avec Percutante + Argentée = 500 po', 1, 0, 10, ['PIERCING', 'SILVERED'], '500'],
  ] as const)(
    'computes ammo price accurately for %s',
    (_label, bonus, slots, quantity, supplements, expectedPrice) => {
      const html = renderToString(
        <AmmoAndConsumables
          ammoState={{
            enhancementBonus: bonus,
            slots,
            quantity,
            supplements: [...supplements],
          }}
          consumablesState={{
            ruleset: 'CLASSIC_5E',
            potionQuantities: {},
            specialQuantities: {},
          }}
          onAmmoChange={dummyOnAmmoChange}
          onConsumablesChange={dummyOnConsumablesChange}
          onSendToMarket={dummyOnMarket}
        />
      );

      expect(html.replace(/\s/g, ' ')).toContain(expectedPrice.replace(/\s/g, ' '));
    }
  );

  it('toggles D&D 2024 revised prices for healing potions', () => {
    const normalize = (s: string) => s.replace(/<!--.*?-->/g, '').replace(/[\s\u202F\u00A0]/g, ' ');
    const htmlClassic = renderToString(
      <AmmoAndConsumables
        ammoState={{ enhancementBonus: 1, slots: 0, quantity: 10, supplements: [] }}
        consumablesState={{ ruleset: 'CLASSIC_5E', potionQuantities: {}, specialQuantities: {} }}
        onAmmoChange={dummyOnAmmoChange}
        onConsumablesChange={dummyOnConsumablesChange}
        onSendToMarket={dummyOnMarket}
      />
    );
    expect(normalize(htmlClassic)).toContain('500 po'); // Uncommon classic
    expect(normalize(htmlClassic)).toContain('5 000 po'); // Rare classic

    const htmlRevised = renderToString(
      <AmmoAndConsumables
        ammoState={{ enhancementBonus: 1, slots: 0, quantity: 10, supplements: [] }}
        consumablesState={{ ruleset: 'REVISED_2024', potionQuantities: {}, specialQuantities: {} }}
        onAmmoChange={dummyOnAmmoChange}
        onConsumablesChange={dummyOnConsumablesChange}
        onSendToMarket={dummyOnMarket}
      />
    );
    expect(normalize(htmlRevised)).toContain('200 po'); // Uncommon revised
    expect(normalize(htmlRevised)).toContain('2 000 po'); // Rare revised
  });
});

describe('GrimoireCatalog', () => {
  it('renders all catalog enchantments by default with slot costs', () => {
    const html = renderToString(<GrimoireCatalog />);
    expect(html).toContain('Sournoise');
    expect(html).toContain('Frugale');
    expect(html).toContain('Lame Ardente');
    expect(html).toContain('Défense Élémentaire');
    expect(html).toContain('Choc Foudroyant');
    expect(html).toContain('Gardienne Arcanique');
    expect(html).toContain('Focalisation Tellurique');
    expect(html).toContain('Frappe Spectrale');
    expect(html).toContain('Bastion Inviolable');
    expect(html).toContain('Résonance Astrale');
  });
});
