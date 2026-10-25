import React, { useState, useEffect } from 'react';
import { ItemCategory, AmmoSupplement } from './domain/forge';
import { RulesetProfile } from './domain/catalog';
import { ForgeCalculator } from './components/ForgeCalculator';
import { MarketSimulator } from './components/MarketSimulator';
import { AmmoAndConsumables } from './components/AmmoAndConsumables';
import { GrimoireCatalog } from './components/GrimoireCatalog';

export const STORAGE_KEY = 'enclume_astrale_state_v1';

export interface AppSavedState {
  forgeMode: 'CRAFT' | 'UPGRADE';
  category: ItemCategory;
  enhancementBonus: number;
  selectedEnchantmentIds: string[];
  initialBonus: number;
  initialSlots: number;
  finalBonus: number;
  finalSlots: number;
  marketPrice: number;
  d20Roll: number;
  ammoBonus: number;
  ammoQuantity: number;
  ammoSupplements: AmmoSupplement[];
  ruleset: RulesetProfile;
}

export const DEFAULT_APP_STATE: AppSavedState = {
  forgeMode: 'CRAFT',
  category: 'WEAPON',
  enhancementBonus: 1,
  selectedEnchantmentIds: [],
  initialBonus: 1,
  initialSlots: 0,
  finalBonus: 2,
  finalSlots: 0,
  marketPrice: 1000,
  d20Roll: 15,
  ammoBonus: 1,
  ammoQuantity: 10,
  ammoSupplements: [],
  ruleset: 'CLASSIC_5E',
};

export function loadStateFromStorage(): AppSavedState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_APP_STATE;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APP_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_APP_STATE, ...parsed };
  } catch {
    return DEFAULT_APP_STATE;
  }
}

export function saveStateToStorage(state: AppSavedState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export const App: React.FC = () => {
  const [state, setState] = useState<AppSavedState>(loadStateFromStorage);
  const [activeTab, setActiveTab] = useState<'FORGE' | 'MARKET' | 'AMMO' | 'GRIMOIRE'>('FORGE');

  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  const handleSendToMarket = (price: number) => {
    setState((prev) => ({ ...prev, marketPrice: price }));
    setActiveTab('MARKET');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-top">
          <h1 className="app-title">
            <span>⚒️</span> L'Enclume Astrale
          </h1>
          <span className="badge badge-info" style={{ fontSize: '0.85rem' }}>
            D&D 5e / D&D 3.5 Compatible
          </span>
        </div>
        <p className="app-subtitle">
          Calculateur arcanique, modèle de forge à slots, simulation de marché d20 et tarification des munitions.
        </p>
      </header>

      <nav className="nav-tabs" aria-label="Navigation principale">
        <button
          type="button"
          className={`nav-tab ${activeTab === 'FORGE' ? 'active' : ''}`}
          onClick={() => setActiveTab('FORGE')}
          aria-pressed={activeTab === 'FORGE'}
        >
          ⚒️ Forge & Améliorations
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'MARKET' ? 'active' : ''}`}
          onClick={() => setActiveTab('MARKET')}
          aria-pressed={activeTab === 'MARKET'}
        >
          {`🎲 Marché d20 (${state.marketPrice.toLocaleString('fr-FR')} po)`}
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'AMMO' ? 'active' : ''}`}
          onClick={() => setActiveTab('AMMO')}
          aria-pressed={activeTab === 'AMMO'}
        >
          🏹 Munitions & Consommables
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'GRIMOIRE' ? 'active' : ''}`}
          onClick={() => setActiveTab('GRIMOIRE')}
          aria-pressed={activeTab === 'GRIMOIRE'}
        >
          📜 Grimoire
        </button>
      </nav>

      <main id="main-content">
        {activeTab === 'FORGE' && (
          <ForgeCalculator
            mode={state.forgeMode}
            onModeChange={(mode) => setState((prev) => ({ ...prev, forgeMode: mode }))}
            category={state.category}
            onCategoryChange={(cat) =>
              setState((prev) => ({ ...prev, category: cat, selectedEnchantmentIds: [] }))
            }
            enhancementBonus={state.enhancementBonus}
            onBonusChange={(bonus) => setState((prev) => ({ ...prev, enhancementBonus: bonus }))}
            selectedEnchantmentIds={state.selectedEnchantmentIds}
            onEnchantmentsChange={(ids) =>
              setState((prev) => ({ ...prev, selectedEnchantmentIds: ids }))
            }
            initialBonus={state.initialBonus}
            onInitialBonusChange={(b) => setState((prev) => ({ ...prev, initialBonus: b }))}
            initialSlots={state.initialSlots}
            onInitialSlotsChange={(s) => setState((prev) => ({ ...prev, initialSlots: s }))}
            finalBonus={state.finalBonus}
            onFinalBonusChange={(b) => setState((prev) => ({ ...prev, finalBonus: b }))}
            finalSlots={state.finalSlots}
            onFinalSlotsChange={(s) => setState((prev) => ({ ...prev, finalSlots: s }))}
            onSendToMarket={handleSendToMarket}
          />
        )}

        {activeTab === 'MARKET' && (
          <MarketSimulator
            basePrice={state.marketPrice}
            onBasePriceChange={(price) => setState((prev) => ({ ...prev, marketPrice: price }))}
            d20Roll={state.d20Roll}
            onD20Change={(roll) => setState((prev) => ({ ...prev, d20Roll: roll }))}
          />
        )}

        {activeTab === 'AMMO' && (
          <AmmoAndConsumables
            ammoBonus={state.ammoBonus}
            onAmmoBonusChange={(b) => setState((prev) => ({ ...prev, ammoBonus: b }))}
            ammoQuantity={state.ammoQuantity}
            onAmmoQuantityChange={(q) => setState((prev) => ({ ...prev, ammoQuantity: q }))}
            ammoSupplements={state.ammoSupplements}
            onAmmoSupplementsChange={(supp) =>
              setState((prev) => ({ ...prev, ammoSupplements: supp }))
            }
            ruleset={state.ruleset}
            onRulesetChange={(r) => setState((prev) => ({ ...prev, ruleset: r }))}
            onSendToMarket={handleSendToMarket}
          />
        )}

        {activeTab === 'GRIMOIRE' && <GrimoireCatalog />}
      </main>
    </div>
  );
};
