import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  App,
  loadStateFromStorage,
  saveStateToStorage,
  DEFAULT_APP_STATE,
  STORAGE_KEY,
} from '../src/App';
import { ForgeCalculator } from '../src/components/ForgeCalculator';
import { MarketSimulator } from '../src/components/MarketSimulator';
import { AmmoAndConsumables } from '../src/components/AmmoAndConsumables';
import { GrimoireCatalog } from '../src/components/GrimoireCatalog';
import { ItemCategory } from '../src/domain/forge';

// Mock localStorage for test environment
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(globalThis, 'window', {
  value: { localStorage: localStorageMock },
  writable: true,
});

beforeEach(() => {
  localStorageMock.clear();
});

describe('App Component - Main Rendering & Accessibility', () => {
  it('renders the application shell without throwing', () => {
    const html = renderToString(<App />);
    expect(html).toContain("L&#x27;Enclume Astrale");
    expect(html).toContain('Calculateur de Forge');
    expect(html).toContain('role="group"');
    expect(html).toContain('nav-tabs');
  });

  it('contains accessible navigation and landmark attributes', () => {
    const html = renderToString(<App />);
    expect(html).toContain('aria-label="Navigation principale"');
    expect(html).toContain('id="main-content"');
  });
});
describe('LocalStorage Persistence', () => {
  it('returns default state when storage is empty', () => {
    const state = loadStateFromStorage();
    expect(state).toEqual(DEFAULT_APP_STATE);
  });

  it.each([
    {
      name: 'Weapon +2 with Sournoise',
      saved: {
        ...DEFAULT_APP_STATE,
        category: 'WEAPON' as ItemCategory,
        enhancementBonus: 2,
        selectedEnchantmentIds: ['sournoise'],
        marketPrice: 15000,
      },
    },
    {
      name: 'Armor +3 with 2024 ruleset',
      saved: {
        ...DEFAULT_APP_STATE,
        category: 'ARMOR_SHIELD' as ItemCategory,
        enhancementBonus: 3,
        ruleset: 'REVISED_2024' as const,
        marketPrice: 30600,
      },
    },
  ])('persists and reloads state accurately: $name', ({ saved }) => {
    saveStateToStorage(saved);
    const loaded = loadStateFromStorage();
    expect(loaded).toEqual(saved);
  });

  it('handles corrupt JSON in localStorage gracefully', () => {
    localStorageMock.setItem(STORAGE_KEY, '{ invalid_json ]');
    const state = loadStateFromStorage();
    expect(state).toEqual(DEFAULT_APP_STATE);
  });
});

describe('ForgeCalculator - Crafting Golden acceptance tests', () => {
  it.each([
    {
      desc: 'Arme +1 nue = 1 000 po',
      category: 'WEAPON' as ItemCategory,
      enhancementBonus: 1,
      enchantments: [] as string[],
      expectedPrice: `${(1000).toLocaleString('fr-FR')} po`,
    },
    {
      desc: 'Arme +2 nue = 9 000 po',
      category: 'WEAPON' as ItemCategory,
      enhancementBonus: 2,
      enchantments: [] as string[],
      expectedPrice: `${(9000).toLocaleString('fr-FR')} po`,
    },
    {
      desc: 'Arme +2 avec Sournoise (1) + Frugale (1) = 25 000 po',
      category: 'WEAPON' as ItemCategory,
      enhancementBonus: 2,
      enchantments: ['sournoise', 'frugale'],
      expectedPrice: `${(25000).toLocaleString('fr-FR')} po`,
    },
    {
      desc: 'Armure +2 nue = 7 650 po',
      category: 'ARMOR_SHIELD' as ItemCategory,
      enhancementBonus: 2,
      enchantments: [] as string[],
      expectedPrice: `${(7650).toLocaleString('fr-FR')} po`,
    },
  ])('$desc', ({ category, enhancementBonus, enchantments, expectedPrice }) => {
    const html = renderToString(
      <ForgeCalculator
        mode="CRAFT"
        onModeChange={() => {}}
        category={category}
        onCategoryChange={() => {}}
        enhancementBonus={enhancementBonus}
        onBonusChange={() => {}}
        selectedEnchantmentIds={enchantments}
        onEnchantmentsChange={() => {}}
        initialBonus={1}
        onInitialBonusChange={() => {}}
        initialSlots={0}
        onInitialSlotsChange={() => {}}
        finalBonus={2}
        onFinalBonusChange={() => {}}
        finalSlots={0}
        onFinalSlotsChange={() => {}}
        onSendToMarket={() => {}}
      />
    );

    expect(html).toContain(expectedPrice);
    expect(html).not.toContain('Capacité arcanique dépassée');
  });

  it('displays capacity exceeded warning and blocks quote when S > B', () => {
    // Arme +1 avec 2 enchantements à 1 slot = 2 slots > 1
    const html = renderToString(
      <ForgeCalculator
        mode="CRAFT"
        onModeChange={() => {}}
        category="WEAPON"
        onCategoryChange={() => {}}
        enhancementBonus={1}
        onBonusChange={() => {}}
        selectedEnchantmentIds={['sournoise', 'frugale']}
        onEnchantmentsChange={() => {}}
        initialBonus={1}
        onInitialBonusChange={() => {}}
        initialSlots={0}
        onInitialSlotsChange={() => {}}
        finalBonus={2}
        onFinalBonusChange={() => {}}
        finalSlots={0}
        onFinalSlotsChange={() => {}}
        onSendToMarket={() => {}}
      />
    );

    expect(html).toContain('Capacité arcanique dépassée');
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('Prix Plafond Annoncé');
  });
});

describe('ForgeCalculator - Upgrade mode', () => {
  it('calculates upgrade Armure +2 nue vers +3 nue = 22 950 po', () => {
    const html = renderToString(
      <ForgeCalculator
        mode="UPGRADE"
        onModeChange={() => {}}
        category="ARMOR_SHIELD"
        onCategoryChange={() => {}}
        enhancementBonus={2}
        onBonusChange={() => {}}
        selectedEnchantmentIds={[]}
        onEnchantmentsChange={() => {}}
        initialBonus={2}
        onInitialBonusChange={() => {}}
        initialSlots={0}
        onInitialSlotsChange={() => {}}
        finalBonus={3}
        onFinalBonusChange={() => {}}
        finalSlots={0}
        onFinalSlotsChange={() => {}}
        onSendToMarket={() => {}}
      />
    );

    expect(html).toContain(`${(22950).toLocaleString('fr-FR')} po`);
    expect(html).toContain('Coût Amélioration');
  });

  it('displays error when final tier <= initial tier', () => {
    const html = renderToString(
      <ForgeCalculator
        mode="UPGRADE"
        onModeChange={() => {}}
        category="WEAPON"
        onCategoryChange={() => {}}
        enhancementBonus={2}
        onBonusChange={() => {}}
        selectedEnchantmentIds={[]}
        onEnchantmentsChange={() => {}}
        initialBonus={2}
        onInitialBonusChange={() => {}}
        initialSlots={0}
        onInitialSlotsChange={() => {}}
        finalBonus={2}
        onFinalBonusChange={() => {}}
        finalSlots={0}
        onFinalSlotsChange={() => {}}
        onSendToMarket={() => {}}
      />
    );

    expect(html).toContain('Le niveau économique final doit être strictement supérieur');
  });
});

describe('MarketSimulator Component', () => {
  it.each([
    {
      d20: 1,
      basePrice: 22950,
      expectedPrice: `${(16524).toLocaleString('fr-FR')} po`,
      expectedStatus: 'Opportunité exceptionnelle',
      hasIncident: false,
    },
    {
      d20: 3,
      basePrice: 22950,
      expectedPrice: `${(17442).toLocaleString('fr-FR')} po`,
      expectedStatus: 'Affaire très avantageuse',
      hasIncident: false,
    },
    {
      d20: 15,
      basePrice: 25000,
      expectedPrice: `${(25000).toLocaleString('fr-FR')} po`,
      expectedStatus: 'Prix plafond nominal',
      hasIncident: false,
    },
    {
      d20: 18,
      basePrice: 25000,
      expectedPrice: `${(25000).toLocaleString('fr-FR')} po`,
      expectedStatus: "Incident d&#x27;atelier",
      hasIncident: true,
    },
    {
      d20: 20,
      basePrice: 25000,
      expectedPrice: `${(25000).toLocaleString('fr-FR')} po`,
      expectedStatus: 'Complication majeure',
      hasIncident: true,
    },
  ])('evaluates d20=$d20 on price=$basePrice', ({ d20, basePrice, expectedPrice, expectedStatus, hasIncident }) => {
    const html = renderToString(
      <MarketSimulator
        basePrice={basePrice}
        onBasePriceChange={() => {}}
        d20Roll={d20}
        onD20Change={() => {}}
      />
    );

    expect(html).toContain(expectedPrice);
    expect(html).toContain(expectedStatus);
    expect(html).toContain('aria-live="polite"');
    if (hasIncident) {
      expect(html).toContain('Complication Narrative');
    }
  });
});

describe('AmmoAndConsumables Component', () => {
  it.each([
    { bonus: 1, qty: 10, supplements: [], expected: `${(200).toLocaleString('fr-FR')} po` },
    { bonus: 2, qty: 10, supplements: [], expected: `${(1800).toLocaleString('fr-FR')} po` },
  ])('calculates ammo quote for bonus=$bonus, qty=$qty -> $expected', ({ bonus, qty, supplements, expected }) => {
    const html = renderToString(
      <AmmoAndConsumables
        ammoBonus={bonus}
        onAmmoBonusChange={() => {}}
        ammoQuantity={qty}
        onAmmoQuantityChange={() => {}}
        ammoSupplements={supplements}
        onAmmoSupplementsChange={() => {}}
        ruleset="CLASSIC_5E"
        onRulesetChange={() => {}}
        onSendToMarket={() => {}}
      />
    );

    expect(html).toContain(expected);
  });

  it('displays classic vs 2024 revised prices for healing potions', () => {
    const htmlClassic = renderToString(
      <AmmoAndConsumables
        ammoBonus={1}
        onAmmoBonusChange={() => {}}
        ammoQuantity={10}
        onAmmoQuantityChange={() => {}}
        ammoSupplements={[]}
        onAmmoSupplementsChange={() => {}}
        ruleset="CLASSIC_5E"
        onRulesetChange={() => {}}
        onSendToMarket={() => {}}
      />
    );
    expect(htmlClassic).toContain('500 po'); // Superior potion in 5e

    const html2024 = renderToString(
      <AmmoAndConsumables
        ammoBonus={1}
        onAmmoBonusChange={() => {}}
        ammoQuantity={10}
        onAmmoQuantityChange={() => {}}
        ammoSupplements={[]}
        onAmmoSupplementsChange={() => {}}
        ruleset="REVISED_2024"
        onRulesetChange={() => {}}
        onSendToMarket={() => {}}
      />
    );
    expect(html2024).toContain('200 po'); // Superior potion in 2024 revised
  });
});

describe('GrimoireCatalog Component', () => {
  it('renders catalogue of enchantments with slots and categories', () => {
    const html = renderToString(<GrimoireCatalog />);
    expect(html).toContain('Sournoise');
    expect(html).toContain('Tranchant spectral');
    expect(html).toContain('Rempart étanche');
    expect(html).toContain('Focalisateur dimensionnel');
    expect(html).toContain('enchantement(s) trouvé(s)');
  });
});
