import React, { useState, useEffect } from 'react';
import { ForgeCalculator } from './components/ForgeCalculator';
import { MarketSimulator } from './components/MarketSimulator';
import { AmmoAndConsumables } from './components/AmmoAndConsumables';
import { GrimoireCatalog } from './components/GrimoireCatalog';
import { ItemCategory } from './domain/forge';
import { RulesetProfile, EnchantmentDefinition } from './domain/catalog';

export type ActiveTab = 'FORGE' | 'MARKET' | 'AMMO' | 'GRIMOIRE';

interface PersistedState {
  category: ItemCategory;
  baseBonus: number;
  selectedEnchantmentIds: string[];
  ruleset: RulesetProfile;
  marketPrice: number;
}

const STORAGE_KEY = 'ENCLUME_ASTRALE_STATE_V1';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('FORGE');
  const [marketPrice, setMarketPrice] = useState<number>(1000);
  const [ruleset, setRuleset] = useState<RulesetProfile>('CLASSIC_5E');
  const [forgeState, setForgeState] = useState<{
    category: ItemCategory;
    baseBonus: number;
    selectedEnchantmentIds: string[];
  }>({ category: 'WEAPON', baseBonus: 1, selectedEnchantmentIds: [] });

  // Load saved state from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: PersistedState = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            if (parsed.category) {
              setForgeState({
                category: parsed.category,
                baseBonus: parsed.baseBonus ?? 1,
                selectedEnchantmentIds: parsed.selectedEnchantmentIds ?? [],
              });
            }
            if (parsed.ruleset) setRuleset(parsed.ruleset);
            if (parsed.marketPrice) setMarketPrice(parsed.marketPrice);
          }
        }
      }
    } catch {
      // fallback to default
    }
  }, []);

  // Save state to localStorage
  const persistState = (newForge = forgeState, newRuleset = ruleset, newPrice = marketPrice) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const payload: PersistedState = {
          category: newForge.category,
          baseBonus: newForge.baseBonus,
          selectedEnchantmentIds: newForge.selectedEnchantmentIds,
          ruleset: newRuleset,
          marketPrice: newPrice,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    } catch {
      // ignore localstorage errors
    }
  };

  const handleSendToMarket = (price: number) => {
    setMarketPrice(price);
    persistState(forgeState, ruleset, price);
    setActiveTab('MARKET');
  };

  const handleForgeStateChange = (newForge: typeof forgeState) => {
    setForgeState(newForge);
    persistState(newForge, ruleset, marketPrice);
  };

  const handleRulesetChange = (newRuleset: RulesetProfile) => {
    setRuleset(newRuleset);
    persistState(forgeState, newRuleset, marketPrice);
  };

  const handleSelectEnchantmentFromCatalog = (ench: EnchantmentDefinition) => {
    if (!forgeState.selectedEnchantmentIds.includes(ench.id)) {
      const updated = {
        ...forgeState,
        selectedEnchantmentIds: [...forgeState.selectedEnchantmentIds, ench.id],
      };
      setForgeState(updated);
      persistState(updated, ruleset, marketPrice);
    }
    setActiveTab('FORGE');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1 className="brand-title">L'Enclume Astrale</h1>
          <p className="brand-subtitle">
            Artisanat Arcanique, Variabilité d20 & Économie Magique (D&D 5e / 3.5)
          </p>
        </div>
        <div className="header-actions">
          <span className="ruleset-badge">
            Règles : {ruleset === 'CLASSIC_5E' ? '5e Classique' : 'Variante 2024'}
          </span>
        </div>
      </header>

      <nav className="nav-tabs" role="tablist" aria-label="Navigation principale">
        <button
          type="button"
          role="tab"
          id="tab-forge"
          aria-selected={activeTab === 'FORGE'}
          aria-controls="panel-forge"
          className={`nav-tab-btn ${activeTab === 'FORGE' ? 'active' : ''}`}
          onClick={() => setActiveTab('FORGE')}
        >
          ⚒️ Forge & Améliorations
        </button>
        <button
          type="button"
          role="tab"
          id="tab-market"
          aria-selected={activeTab === 'MARKET'}
          aria-controls="panel-market"
          className={`nav-tab-btn ${activeTab === 'MARKET' ? 'active' : ''}`}
          onClick={() => setActiveTab('MARKET')}
        >
          🎲 Négociation Marché (d20)
        </button>
        <button
          type="button"
          role="tab"
          id="tab-ammo"
          aria-selected={activeTab === 'AMMO'}
          aria-controls="panel-ammo"
          className={`nav-tab-btn ${activeTab === 'AMMO' ? 'active' : ''}`}
          onClick={() => setActiveTab('AMMO')}
        >
          🏹 Munitions & Consommables
        </button>
        <button
          type="button"
          role="tab"
          id="tab-grimoire"
          aria-selected={activeTab === 'GRIMOIRE'}
          aria-controls="panel-grimoire"
          className={`nav-tab-btn ${activeTab === 'GRIMOIRE' ? 'active' : ''}`}
          onClick={() => setActiveTab('GRIMOIRE')}
        >
          📜 Grimoire d'Enchantements
        </button>
      </nav>

      <main>
        {activeTab === 'FORGE' && (
          <section id="panel-forge" role="tabpanel" aria-labelledby="tab-forge">
            <ForgeCalculator
              initialCategory={forgeState.category}
              initialBonus={forgeState.baseBonus}
              initialEnchantmentIds={forgeState.selectedEnchantmentIds}
              onStateChange={handleForgeStateChange}
              onSendToMarket={handleSendToMarket}
            />
          </section>
        )}

        {activeTab === 'MARKET' && (
          <section id="panel-market" role="tabpanel" aria-labelledby="tab-market">
            <MarketSimulator
              ceilingPrice={marketPrice}
              onPriceChange={(p) => {
                setMarketPrice(p);
                persistState(forgeState, ruleset, p);
              }}
            />
          </section>
        )}

        {activeTab === 'AMMO' && (
          <section id="panel-ammo" role="tabpanel" aria-labelledby="tab-ammo">
            <AmmoAndConsumables
              ruleset={ruleset}
              onRulesetChange={handleRulesetChange}
              onSendToMarket={handleSendToMarket}
            />
          </section>
        )}

        {activeTab === 'GRIMOIRE' && (
          <section id="panel-grimoire" role="tabpanel" aria-labelledby="tab-grimoire">
            <GrimoireCatalog onSelectEnchantment={handleSelectEnchantmentFromCatalog} />
          </section>
        )}
      </main>
    </div>
  );
};
export default App;
