import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../src/App';
import { ForgeCalculator } from '../src/components/ForgeCalculator';
import { MarketSimulator } from '../src/components/MarketSimulator';
import { AmmoAndConsumables } from '../src/components/AmmoAndConsumables';
import { GrimoireCatalog } from '../src/components/GrimoireCatalog';
import {
  DEFAULT_APP_STATE,
  STORAGE_KEY,
  loadStoredState,
  saveStoredState,
  type AppState,
} from '../src/storage';
import {
  type ItemCategory,
} from '../src/domain/forge';
import { simulateMarket } from '../src/domain/market';

// Mock localStorage en environnement de test Node
const localStorageStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => localStorageStore[key] ?? null,
  setItem: (key: string, value: string) => {
    localStorageStore[key] = value;
  },
  removeItem: (key: string) => {
    delete localStorageStore[key];
  },
  clear: () => {
    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key]);
  },
  key: (index: number) => Object.keys(localStorageStore)[index] ?? null,
  length: 0,
};

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
} else {
  (globalThis as unknown as { localStorage: typeof mockLocalStorage }).localStorage = mockLocalStorage;
  (globalThis as unknown as { window: { localStorage: typeof mockLocalStorage } }).window = {
    localStorage: mockLocalStorage,
  };
}

beforeEach(() => {
  mockLocalStorage.clear();
});

describe('Ticket #27 — Rendu global de l\'application L\'Enclume Astrale', () => {
  it('affiche le titre principal et les 4 onglets de navigation accessibles', () => {
    const html = renderToString(<App />);
    expect(html).toContain("L&#x27;Enclume Astrale");
    expect(html).toContain('role="tablist"');
    expect(html).toContain('tab-forge');
    expect(html).toContain('tab-market');
    expect(html).toContain('tab-ammo');
    expect(html).toContain('tab-grimoire');
  });

  it('contient la région aria-live pour les annonces vocales accessibles (WCAG 2.1 AA)', () => {
    const html = renderToString(<App />);
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-atomic="true"');
    expect(html).toContain('id="a11y-announcements"');
  });
});

describe('Ticket #27 — Calculateur de Forge (ForgeCalculator) & Golden Tests CDC', () => {
  it.each([
    {
      name: 'Arme +1 nue (B=1, S=0) = 1 000 po',
      category: 'WEAPON' as ItemCategory,
      bonus: 1,
      slots: [] as string[],
      expectedPrice: (1000).toLocaleString('fr-FR'),
    },
    {
      name: 'Arme +2 nue (B=2, S=0) = 9 000 po',
      category: 'WEAPON' as ItemCategory,
      bonus: 2,
      slots: [] as string[],
      expectedPrice: (9000).toLocaleString('fr-FR'),
    },
    {
      name: 'Arme +2 avec Sournoise (1) + Frugale (1) = 25 000 po',
      category: 'WEAPON' as ItemCategory,
      bonus: 2,
      slots: ['sournoise', 'frugale'],
      expectedPrice: (25000).toLocaleString('fr-FR'),
    },
  ])('$name', ({ category, bonus, slots, expectedPrice }) => {
    const forgeState: AppState['forge'] = {
      category,
      bonus,
      selectedEnchantmentIds: slots,
      isUpgradeMode: false,
      upgradeInitialBonus: 1,
      upgradeInitialSlots: 0,
      upgradeTargetBonus: 2,
      upgradeTargetSlots: 0,
    };

    const html = renderToString(
      <ForgeCalculator
        forgeState={forgeState}
        onChange={() => {}}
        onTransferToMarket={() => {}}
        announce={() => {}}
      />
    );

    // Vérifier la présence du prix formaté en po
    expect(html).toContain(expectedPrice);
    expect(html).toContain('Prix Plafond Annoncé Garanti');
  });

  it.each([
    { category: 'WEAPON' as ItemCategory, bonus: 2, slots: ['vorpaline'] /* 3 slots */ },
    { category: 'WEAPON' as ItemCategory, bonus: 1, slots: ['ardente'] /* 2 slots */ },
    { category: 'ARMOR_SHIELD' as ItemCategory, bonus: 1, slots: ['sanctifiee'] /* 2 slots */ },
  ])('affiche une alerte d\'erreur et bloque le devis quand S > B ($category, B=$bonus, slots=$slots)', ({ category, bonus, slots }) => {
    const forgeState: AppState['forge'] = {
      category,
      bonus,
      selectedEnchantmentIds: slots,
      isUpgradeMode: false,
      upgradeInitialBonus: 1,
      upgradeInitialSlots: 0,
      upgradeTargetBonus: 2,
      upgradeTargetSlots: 0,
    };

    const html = renderToString(
      <ForgeCalculator
        forgeState={forgeState}
        onChange={() => {}}
        onTransferToMarket={() => {}}
        announce={() => {}}
      />
    );

    // Doit contenir le conteneur alert d'erreur et bloquer le prix garanti
    expect(html).toContain('role="alert"');
    expect(html).toContain('Erreur de conformité de forge');
    expect(html).toContain('Le devis est bloqué');
  });

  it('calcule correctement l\'amélioration d\'équipement (Armure +2 nue vers +3 nue = 22 950 po)', () => {
    const forgeState: AppState['forge'] = {
      category: 'ARMOR_SHIELD',
      bonus: 2,
      selectedEnchantmentIds: [],
      isUpgradeMode: true,
      upgradeInitialBonus: 2,
      upgradeInitialSlots: 0,
      upgradeTargetBonus: 3,
      upgradeTargetSlots: 0,
    };

    const html = renderToString(
      <ForgeCalculator
        forgeState={forgeState}
        onChange={() => {}}
        onTransferToMarket={() => {}}
        announce={() => {}}
      />
    );

    expect(html).toContain(`${(22950).toLocaleString('fr-FR')} po`);
    expect(html).toContain('Coût d&#x27;Amélioration Garanti');
  });
});

describe('Ticket #27 — Simulateur de Marché d20 (MarketSimulator)', () => {
  it.each([
    {
      name: 'd20 = 1 sur 22 950 po (72 %, 16 524 po, aucun incident)',
      basePrice: 22950,
      d20Roll: 1,
      expectedPrice: `${(16524).toLocaleString('fr-FR')} po`,
      expectedCategory: 'Opportunité exceptionnelle',
      hasComplication: false,
    },
    {
      name: 'd20 = 3 sur 22 950 po (76 %, 17 442 po, aucun incident)',
      basePrice: 22950,
      d20Roll: 3,
      expectedPrice: `${(17442).toLocaleString('fr-FR')} po`,
      expectedCategory: 'Affaire très avantageuse',
      hasComplication: false,
    },
    {
      name: 'd20 = 15 sur 25 000 po (100 %, nominal sans incident)',
      basePrice: 25000,
      d20Roll: 15,
      expectedPrice: `${(25000).toLocaleString('fr-FR')} po`,
      expectedCategory: 'Prix plafond nominal',
      hasComplication: false,
    },
    {
      name: 'd20 = 18 sur 25 000 po (100 %, incident d\'atelier)',
      basePrice: 25000,
      d20Roll: 18,
      expectedPrice: `${(25000).toLocaleString('fr-FR')} po`,
      expectedCategory: "Incident d&#x27;atelier",
      hasComplication: true,
    },
  ])('$name', ({ basePrice, d20Roll, expectedPrice, expectedCategory, hasComplication }) => {
    const marketState = { basePrice, d20Roll };
    const html = renderToString(
      <MarketSimulator
        marketState={marketState}
        onChange={() => {}}
        announce={() => {}}
      />
    );

    expect(html).toContain(expectedPrice);
    expect(html).toContain(expectedCategory);
    if (hasComplication) {
      expect(html).toContain('alert-warning');
    } else {
      expect(html).toContain('alert-success');
    }
  });

  it('respecte strictement la règle du prix plafond garanti (P_payé <= P_base) sur l\'ensemble des tirages 1 à 20', () => {
    const basePrice = 30000;
    for (let roll = 1; roll <= 20; roll++) {
      const result = simulateMarket(basePrice, roll);
      expect(result.finalPrice).toBeLessThanOrEqual(basePrice);
    }
  });
});

describe('Ticket #27 — Module Munitions & Consommables (AmmoAndConsumables)', () => {
  it.each([
    {
      name: '10 flèches +1 = 200 po',
      bonus: 1,
      slots: 0,
      quantity: 10,
      supplements: [],
      expectedPrice: '200 po',
    },
    {
      name: '10 flèches +2 = 1 800 po',
      bonus: 2,
      slots: 0,
      quantity: 10,
      supplements: [],
      expectedPrice: `${(1800).toLocaleString('fr-FR')} po`,
    },
    {
      name: '10 flèches +1 avec Incassable (+20 po/u) = 400 po',
      bonus: 1,
      slots: 0,
      quantity: 10,
      supplements: ['UNBREAKABLE' as const],
      expectedPrice: '400 po',
    },
  ])('$name', ({ bonus, slots, quantity, supplements, expectedPrice }) => {
    const state: AppState['ammoAndConsumables'] = {
      bonus,
      slots,
      quantity,
      supplements,
      ruleset: '5e_2014',
      potionQuantities: {},
      specialQuantities: {},
    };

    const html = renderToString(
      <AmmoAndConsumables
        state={state}
        onChange={() => {}}
        onTransferToMarket={() => {}}
        announce={() => {}}
      />
    );

    expect(html).toContain(expectedPrice);
  });

  it.each([
    { ruleset: '5e_2014' as const, expectedPotionUncommonPrice: '500 po' },
    { ruleset: '5e_2024' as const, expectedPotionUncommonPrice: '200 po' },
  ])('bascule correctement les prix des potions de soins selon le profil ($ruleset)', ({ ruleset, expectedPotionUncommonPrice }) => {
    const state: AppState['ammoAndConsumables'] = {
      bonus: 1,
      slots: 0,
      quantity: 10,
      supplements: [],
      ruleset,
      potionQuantities: { potion_healing_uncommon: 1 },
      specialQuantities: {},
    };

    const html = renderToString(
      <AmmoAndConsumables
        state={state}
        onChange={() => {}}
        onTransferToMarket={() => {}}
        announce={() => {}}
      />
    );

    expect(html).toContain(expectedPotionUncommonPrice);
  });
});

describe('Ticket #27 — Grimoire des Enchantements (GrimoireCatalog)', () => {
  it('affiche les enchantements du catalogue et leurs badges de slots', () => {
    const html = renderToString(
      <GrimoireCatalog
        selectedIds={['sournoise']}
        onSelectEnchantment={() => {}}
      />
    );

    expect(html).toContain('Sournoise');
    expect(html).toContain('Vorpaline');
    expect(html).toContain('1 slot');
    expect(html).toContain('3 slots');
  });
});

describe('Ticket #27 — Persistance dans localStorage (storage.ts)', () => {
  it('sauvegarde et recharge fidèlement l\'état applicatif', () => {
    const customState: AppState = {
      ...DEFAULT_APP_STATE,
      activeTab: 'market',
      forge: {
        ...DEFAULT_APP_STATE.forge,
        bonus: 3,
        selectedEnchantmentIds: ['sournoise'],
      },
      market: {
        basePrice: 25000,
        d20Roll: 18,
      },
    };

    const saved = saveStoredState(customState);
    expect(saved).toBe(true);
    expect(mockLocalStorage.getItem(STORAGE_KEY)).toBeTruthy();

    const loaded = loadStoredState();
    expect(loaded.activeTab).toBe('market');
    expect(loaded.forge.bonus).toBe(3);
    expect(loaded.forge.selectedEnchantmentIds).toContain('sournoise');
    expect(loaded.market.basePrice).toBe(25000);
    expect(loaded.market.d20Roll).toBe(18);
  });

  it('retourne DEFAULT_APP_STATE en cas de localStorage vide ou de données corrompues', () => {
    mockLocalStorage.clear();
    expect(loadStoredState()).toEqual(DEFAULT_APP_STATE);

    mockLocalStorage.setItem(STORAGE_KEY, '{ invalid json');
    expect(loadStoredState()).toEqual(DEFAULT_APP_STATE);
  });
});
