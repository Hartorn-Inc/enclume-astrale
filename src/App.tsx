import React, { useState, useEffect } from 'react';
import { ForgeCalculator } from './components/ForgeCalculator';
import { MarketSimulator } from './components/MarketSimulator';
import { MunitionsConsumables } from './components/MunitionsConsumables';
import { GrimoireCatalog } from './components/GrimoireCatalog';
import { ForgeQuote } from './domain/types';

type ActiveTab = 'forge' | 'market' | 'munitions' | 'grimoire';

interface SavedQuoteRecord {
  id: string;
  date: string;
  label: string;
  ceilingPrice: number;
}

const STORAGE_KEY = 'astral_anvil_saved_quotes_v1';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('forge');
  const [savedQuotes, setSavedQuotes] = useState<SavedQuoteRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedQuotes));
    } catch (err) {
      console.error('Erreur écriture localStorage', err);
    }
  }, [savedQuotes]);

  const handleSaveQuote = (quote: ForgeQuote, label: string) => {
    const newRecord: SavedQuoteRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toLocaleDateString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      label,
      ceilingPrice: quote.ceilingPrice,
    };
    setSavedQuotes((prev) => [newRecord, ...prev.slice(0, 9)]);
  };

  const handleClearHistory = () => {
    setSavedQuotes([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="brand-title">L'Enclume Astrale</h1>
        <p className="brand-subtitle">
          Calculateur d'Artisanat Arcanique & Simulateur d'Économie Magique (D&D 5e / D&D 3.5)
        </p>
      </header>

      <nav className="nav-tabs" aria-label="Navigation principale">
        <button
          type="button"
          className={`nav-tab ${activeTab === 'forge' ? 'active' : ''}`}
          onClick={() => setActiveTab('forge')}
          aria-selected={activeTab === 'forge'}
          role="tab"
        >
          Calculateur de Forge
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
          aria-selected={activeTab === 'market'}
          role="tab"
        >
          Simulateur de Marché (d20)
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'munitions' ? 'active' : ''}`}
          onClick={() => setActiveTab('munitions')}
          aria-selected={activeTab === 'munitions'}
          role="tab"
        >
          Munitions & Consommables
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'grimoire' ? 'active' : ''}`}
          onClick={() => setActiveTab('grimoire')}
          aria-selected={activeTab === 'grimoire'}
          role="tab"
        >
          Grimoire d'Enchantements
        </button>
      </nav>

      <main className="tab-panel">
        {activeTab === 'forge' && <ForgeCalculator onSaveQuote={handleSaveQuote} />}
        {activeTab === 'market' && (
          <MarketSimulator
            defaultCeilingPrice={savedQuotes.length > 0 ? savedQuotes[0].ceilingPrice : 25000}
          />
        )}
        {activeTab === 'munitions' && <MunitionsConsumables />}
        {activeTab === 'grimoire' && <GrimoireCatalog />}
      </main>

      {savedQuotes.length > 0 && (
        <section className="card" style={{ marginTop: '2.5rem' }} aria-labelledby="history-title">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 id="history-title" className="card-title" style={{ margin: 0, border: 'none' }}>
              Registre Local des Devis Récents ({savedQuotes.length})
            </h2>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
              onClick={handleClearHistory}
            >
              Effacer le registre
            </button>
          </div>
          <ul className="history-list" data-testid="saved-quotes-list">
            {savedQuotes.map((item) => (
              <li key={item.id} className="history-item">
                <span className="history-item-desc">{item.label}</span>
                <span className="history-item-price">
                  {item.ceilingPrice.toLocaleString('fr-FR')} po
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
