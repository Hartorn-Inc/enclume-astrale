import React, { useState, useEffect } from 'react';
import {
  loadStoredState,
  saveStoredState,
  DEFAULT_APP_STATE,
  type AppState,
} from './storage';
import { ForgeCalculator } from './components/ForgeCalculator';
import { MarketSimulator } from './components/MarketSimulator';
import { AmmoAndConsumables } from './components/AmmoAndConsumables';
import { GrimoireCatalog } from './components/GrimoireCatalog';
import { findEnchantmentById } from './domain/catalog';
import type { ItemCategory } from './domain/forge';

/**
 * Applique l'équipement ou le déséquipement d'un enchantement dans la forge
 * en préservant la catégorie active si compatible, en nettoyant les slots fantômes
 * et en réajustant le bonus nu B en cas de transition de catégorie.
 */
export function applyEnchantmentToggle(
  currentForge: AppState['forge'],
  enchId: string,
  fallbackCategory?: ItemCategory
): AppState['forge'] {
  const currentIds = currentForge.selectedEnchantmentIds;
  const isEquipped = currentIds.includes(enchId);

  // 1) Déséquipement : retirer enchId sans modifier la catégorie ni le bonus nu
  if (isEquipped) {
    return {
      ...currentForge,
      selectedEnchantmentIds: currentIds.filter((x) => x !== enchId),
    };
  }

  // 2) Équipement : préserver la catégorie courante si elle est supportée par l'enchantement
  const ench = findEnchantmentById(enchId);
  const currentCategory = currentForge.category;
  const isCurrentCategorySupported = ench ? ench.categories.includes(currentCategory) : false;

  const targetCategory: ItemCategory = isCurrentCategorySupported
    ? currentCategory
    : (ench ? ench.categories[0] : (fallbackCategory ?? currentCategory));

  const categoryChanged = targetCategory !== currentCategory;

  // 3) En cas de changement de catégorie, purger les IDs d'enchantements incompatibles avec la cible
  const baseIds = categoryChanged
    ? currentIds.filter((id) => {
        const def = findEnchantmentById(id);
        return def ? def.categories.includes(targetCategory) : false;
      })
    : currentIds;

  const nextIds = [...baseIds, enchId];

  // 4) Ajustement du bonus nu B pour respecter les invariants de domaine
  let nextBonus = currentForge.bonus;
  if (categoryChanged) {
    if (targetCategory === 'WONDROUS_ITEM') {
      nextBonus = 0;
    } else if (currentForge.bonus === 0) {
      nextBonus = 1;
    }
  }

  return {
    ...currentForge,
    category: targetCategory,
    bonus: nextBonus,
    selectedEnchantmentIds: nextIds,
  };
}

export const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => loadStoredState());
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistance automatique dans localStorage
  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  const announce = (message: string) => {
    setLiveAnnouncement(message);
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 4000);
  };

  const handleTransferToMarket = (price: number) => {
    setState((prev) => ({
      ...prev,
      activeTab: 'market',
      market: {
        ...prev.market,
        basePrice: price,
      },
    }));
    announce(`Prix plafond de ${price.toLocaleString('fr-FR')} po transféré vers le Marché d20.`);
  };

  const handleReset = () => {
    setState(DEFAULT_APP_STATE);
    announce("Sélections de forge réinitialisées à l'état par défaut.");
  };

  return (
    <div className="app-root">
      {/* Région aria-live pour l'accessibilité vocale */}
      <div
        id="a11y-announcements"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>

      {/* Toast visuel temporaire */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            color: 'var(--accent-cyan)',
            border: '1px solid var(--accent-cyan)',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 9999,
            fontSize: '0.85rem',
          }}
          role="status"
        >
          {toastMessage}
        </div>
      )}

      {/* En-tête de l'application */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <h1>⚒️ L'Enclume Astrale</h1>
            <p>Calculateur d'artisanat arcanique &amp; d'économie des objets magiques (D&amp;D 5e / 3.5)</p>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="btn btn-outline btn-small"
              onClick={handleReset}
              aria-label="Réinitialiser toutes les sélections"
            >
              🔄 Réinitialiser
            </button>
          </div>
        </div>

        {/* Navigation Accessible par Onglets */}
        <nav className="nav-tabs" role="tablist" aria-label="Sections principales de l'application">
          <button
            type="button"
            role="tab"
            id="tab-forge"
            className="nav-tab-btn"
            aria-selected={state.activeTab === 'forge'}
            aria-controls="tabpanel-forge"
            onClick={() => setState({ ...state, activeTab: 'forge' })}
          >
            ⚒️ Forge &amp; Amélioration
          </button>
          <button
            type="button"
            role="tab"
            id="tab-market"
            className="nav-tab-btn"
            aria-selected={state.activeTab === 'market'}
            aria-controls="tabpanel-market"
            onClick={() => setState({ ...state, activeTab: 'market' })}
          >
            🎲 Marché &amp; d20
          </button>
          <button
            type="button"
            role="tab"
            id="tab-ammo"
            className="nav-tab-btn"
            aria-selected={state.activeTab === 'ammo'}
            aria-controls="tabpanel-ammo"
            onClick={() => setState({ ...state, activeTab: 'ammo' })}
          >
            🏹 Munitions &amp; Potions
          </button>
          <button
            type="button"
            role="tab"
            id="tab-grimoire"
            className="nav-tab-btn"
            aria-selected={state.activeTab === 'grimoire'}
            aria-controls="tabpanel-grimoire"
            onClick={() => setState({ ...state, activeTab: 'grimoire' })}
          >
            📜 Grimoire
          </button>
        </nav>
      </header>

      {/* Contenu principal des onglets */}
      <main className="app-main">
        {state.activeTab === 'forge' && (
          <div
            role="tabpanel"
            id="tabpanel-forge"
            aria-labelledby="tab-forge"
            className="tab-panel"
          >
            <ForgeCalculator
              forgeState={state.forge}
              onChange={(forge) => setState({ ...state, forge })}
              onTransferToMarket={handleTransferToMarket}
              announce={announce}
            />
          </div>
        )}

        {state.activeTab === 'market' && (
          <div
            role="tabpanel"
            id="tabpanel-market"
            aria-labelledby="tab-market"
            className="tab-panel"
          >
            <MarketSimulator
              marketState={state.market}
              onChange={(market) => setState({ ...state, market })}
              announce={announce}
            />
          </div>
        )}

        {state.activeTab === 'ammo' && (
          <div
            role="tabpanel"
            id="tabpanel-ammo"
            aria-labelledby="tab-ammo"
            className="tab-panel"
          >
            <AmmoAndConsumables
              state={state.ammoAndConsumables}
              onChange={(ammoAndConsumables) => setState({ ...state, ammoAndConsumables })}
              onTransferToMarket={handleTransferToMarket}
              announce={announce}
            />
          </div>
        )}

        {state.activeTab === 'grimoire' && (
          <div
            role="tabpanel"
            id="tabpanel-grimoire"
            aria-labelledby="tab-grimoire"
            className="tab-panel"
          >
            <GrimoireCatalog
              selectedIds={state.forge.selectedEnchantmentIds}
              onSelectEnchantment={(enchId, cat) => {
                const nextForge = applyEnchantmentToggle(state.forge, enchId, cat);
                setState({
                  ...state,
                  forge: nextForge,
                });
                announce(`Enchantement ${enchId} mis à jour dans la forge.`);
              }}
            />
          </div>
        )}
      </main>

      {/* Pied de page technique & légal */}
      <footer className="app-footer">
        <p>
          <strong>L'Enclume Astrale</strong> — Modèle mathématique : <code>N = T(B) + S</code>, <code>P_plafond = C × 1 000 × N²</code>.
        </p>
        <p>
          Conforme aux règles D&amp;D 5e / D&amp;D 3.5. Termes génériques respectant la propriété intellectuelle.
        </p>
      </footer>
    </div>
  );
};
