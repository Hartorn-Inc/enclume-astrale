import React, { useState, useEffect } from 'react';
import { ForgeCalculator, ForgeState } from './components/ForgeCalculator';
import { MarketSimulator, MarketState } from './components/MarketSimulator';
import { AmmoAndConsumables, AmmoState, ConsumablesState } from './components/AmmoAndConsumables';
import { GrimoireCatalog } from './components/GrimoireCatalog';

export type ActiveTab = 'forge' | 'market' | 'ammo' | 'grimoire';

export interface AppStoredState {
  activeTab: ActiveTab;
  forgeState: ForgeState;
  marketState: MarketState;
  ammoState: AmmoState;
  consumablesState: ConsumablesState;
}

export const STORAGE_KEY = 'enclume_astrale_state_v1';

export const DEFAULT_APP_STATE: AppStoredState = {
  activeTab: 'forge',
  forgeState: {
    mode: 'creation',
    category: 'WEAPON',
    enhancementBonus: 1,
    selectedEnchantmentIds: [],
    upgradeInitialBonus: 1,
    upgradeInitialEnchantmentIds: [],
    upgradeFinalBonus: 2,
    upgradeFinalEnchantmentIds: [],
  },
  marketState: {
    basePrice: 1000,
    d20Roll: 10,
  },
  ammoState: {
    enhancementBonus: 1,
    slots: 0,
    quantity: 10,
    supplements: [],
  },
  consumablesState: {
    ruleset: 'CLASSIC_5E',
    potionQuantities: {},
    specialQuantities: {},
  },
};

function getLocalStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return null;
}

export function loadStoredState(): AppStoredState {
  const storage = getLocalStorage();
  if (!storage) {
    return DEFAULT_APP_STATE;
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_APP_STATE, ...parsed };
    }
  } catch {
    // fallback on error
  }
  return DEFAULT_APP_STATE;
}

export const App: React.FC = () => {
  const [state, setState] = useState<AppStoredState>(loadStoredState);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  useEffect(() => {
    const storage = getLocalStorage();
    if (storage) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // ignore quota
      }
    }
  }, [state]);

  const handleTabChange = (tab: ActiveTab) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  const handleSendToMarket = (price: number) => {
    setState((prev) => ({
      ...prev,
      activeTab: 'market',
      marketState: { ...prev.marketState, basePrice: price },
    }));
    setLiveAnnouncement(`Prix de ${price} po transféré au simulateur de marché.`);
  };

  const handleResetState = () => {
    setState(DEFAULT_APP_STATE);
    setLiveAnnouncement('Session réinitialisée aux valeurs par défaut.');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-brand">
          <span className="header-icon" role="img" aria-label="Enclume Astrale">⚒️</span>
          <div>
            <h1 className="header-title">L&apos;Enclume Astrale</h1>
            <p className="header-subtitle">Calculateur d&apos;artisanat arcanique &amp; économie d20 (D&amp;D 5e / 3.5)</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleResetState}
            title="Réinitialiser les paramètres sauvegardés"
          >
            🔄 Réinitialiser session
          </button>
        </div>
      </header>

      {/* Global accessible live region for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="aria-live-announcer"
      >
        {liveAnnouncement}
      </div>

      {/* Main navigation */}
      <nav className="nav-tabs" aria-label="Navigation principale de l'application">
        <button
          type="button"
          className={`tab-btn ${state.activeTab === 'forge' ? 'active' : ''}`}
          onClick={() => handleTabChange('forge')}
          aria-current={state.activeTab === 'forge' ? 'page' : undefined}
        >
          ⚒️ Forge &amp; Améliorations
        </button>
        <button
          type="button"
          className={`tab-btn ${state.activeTab === 'market' ? 'active' : ''}`}
          onClick={() => handleTabChange('market')}
          aria-current={state.activeTab === 'market' ? 'page' : undefined}
        >
          🎲 Simulateur Marché d20
        </button>
        <button
          type="button"
          className={`tab-btn ${state.activeTab === 'ammo' ? 'active' : ''}`}
          onClick={() => handleTabChange('ammo')}
          aria-current={state.activeTab === 'ammo' ? 'page' : undefined}
        >
          🏹 Munitions &amp; Consommables
        </button>
        <button
          type="button"
          className={`tab-btn ${state.activeTab === 'grimoire' ? 'active' : ''}`}
          onClick={() => handleTabChange('grimoire')}
          aria-current={state.activeTab === 'grimoire' ? 'page' : undefined}
        >
          📖 Grimoire d&apos;Enchantements
        </button>
      </nav>

      {/* View router */}
      <main>
        {state.activeTab === 'forge' &&
          <ForgeCalculator
            state={state.forgeState}
            onChange={(updater) =>
              setState((prev) => ({ ...prev, forgeState: updater(prev.forgeState) }))
            }
            onSendToMarket={handleSendToMarket}
          />
        }

        {state.activeTab === 'market' && (
          <MarketSimulator
            state={state.marketState}
            onChange={(updater) =>
              setState((prev) => ({ ...prev, marketState: updater(prev.marketState) }))
            }
            onAnnounce={setLiveAnnouncement}
          />
        )}

        {state.activeTab === 'ammo' && (
          <AmmoAndConsumables
            ammoState={state.ammoState}
            consumablesState={state.consumablesState}
            onAmmoChange={(updater) =>
              setState((prev) => ({ ...prev, ammoState: updater(prev.ammoState) }))
            }
            onConsumablesChange={(updater) =>
              setState((prev) => ({
                ...prev,
                consumablesState: updater(prev.consumablesState),
              }))
            }
            onSendToMarket={handleSendToMarket}
          />
        )}

        {state.activeTab === 'grimoire' && <GrimoireCatalog />}
      </main>
    </div>
  );
};
