import React from 'react';
import {
  simulateMarket,
  rollD20,
  type MarketOutcomeCategory,
} from '../domain/market';
import type { AppState } from '../storage';

export interface MarketSimulatorProps {
  marketState: AppState['market'];
  onChange: (newState: AppState['market']) => void;
  announce: (message: string) => void;
}

export const MarketSimulator: React.FC<MarketSimulatorProps> = ({
  marketState,
  onChange,
  announce,
}) => {
  const { basePrice, d20Roll } = marketState;

  // Borner strictement entre 1 et 20 pour éviter un crash
  const safeRoll = Math.max(1, Math.min(20, Math.floor(d20Roll) || 15));
  const safeBasePrice = Math.max(0, Math.floor(basePrice) || 0);

  const simulation = simulateMarket(safeBasePrice, safeRoll);

  const handleRollRandom = () => {
    const newRoll = rollD20();
    // Calcul synchrone pour garantir une annonce vocale aria-live rigoureusement synchronisée avec le jet
    const newSimulation = simulateMarket(safeBasePrice, newRoll);
    onChange({ ...marketState, d20Roll: newRoll });
    announce(`Jet de d20 effectué : ${newRoll}. Catégorie : ${newSimulation.categoryLabel}. Prix payé : ${newSimulation.finalPrice} pièces d'or.`);
  };

  const handleManualRollChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.max(1, Math.min(20, parsed));
      onChange({ ...marketState, d20Roll: clamped });
    }
  };

  const getCategoryBadgeClass = (category: MarketOutcomeCategory) => {
    switch (category) {
      case 'EXCEPTIONAL_OPPORTUNITY':
      case 'VERY_ADVANTAGEOUS':
      case 'FAVORABLE_MARKET':
        return 'badge-cyan';
      case 'STANDARD_RATE':
      case 'NOMINAL_CEILING':
        return 'badge-gold';
      case 'MINOR_COMPLICATION':
      case 'WORKSHOP_INCIDENT':
      case 'MAJOR_COMPLICATION':
        return 'badge-purple';
      default:
        return 'badge-gold';
    }
  };

  return (
    <section aria-labelledby="market-section-title">
      <h2 id="market-section-title" className="section-title">
        🎲 Simulateur de Marché &amp; Négociation d20
      </h2>

      <div className="section-card">
        <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Le d20 modélise la tension du marché arcanique. Le prix payé est garanti strictement inférieur ou égal
          au plafond annoncé (<code>P_payé ≤ P_plafond</code>).
        </p>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="market-base-price">Prix Plafond Garanti de Référence (po) :</label>
            <input
              id="market-base-price"
              type="number"
              min={0}
              step={50}
              className="form-control"
              value={basePrice}
              onChange={(e) =>
                onChange({
                  ...marketState,
                  basePrice: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="market-d20-input">Valeur du dé d20 (1 à 20) :</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="market-d20-input"
                type="number"
                min={1}
                max={20}
                className="form-control"
                value={safeRoll}
                onChange={handleManualRollChange}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRollRandom}
                aria-label="Lancer un d20 aléatoire"
              >
                Lancer le d20 🎲
              </button>
            </div>
          </div>
        </div>

        {/* Raccourcis de tirage d20 */}
        <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Préréglages :</span>
          {[1, 3, 5, 10, 15, 18, 20].map((presetRoll) => (
            <button
              key={presetRoll}
              type="button"
              className={`btn btn-outline btn-small ${safeRoll === presetRoll ? 'active' : ''}`}
              onClick={() => onChange({ ...marketState, d20Roll: presetRoll })}
              style={{ padding: '0.2rem 0.5rem' }}
            >
              {`d20 = ${presetRoll}`}
            </button>
          ))}
        </div>

        {/* Panneau de Résultat de Marché */}
        <div className="quote-summary" aria-label="Résultat de la simulation de marché" style={{ marginTop: '1.25rem' }}>
          <div className="quote-summary-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${getCategoryBadgeClass(simulation.category)}`}>
                  {simulation.categoryLabel}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {`(d20 = ${simulation.d20Roll} ➔ Ratio : ${Math.round(simulation.priceRatio * 100)} %)`}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {simulation.discountRate > 0 ? (
                  <span style={{ color: 'var(--accent-cyan)' }}>
                    {`Remise obtenue : `}<strong>{`${Math.round(simulation.discountRate * 100)} %`}</strong>{` (Économie : ${simulation.savedAmount.toLocaleString('fr-FR')} po)`}
                  </span>
                ) : (
                  <span>Plafond nominal sans remise tarifaire</span>
                )}
              </div>
            </div>
            <div className="quote-price">{`${simulation.finalPrice.toLocaleString('fr-FR')} po`}</div>
          </div>

          {/* Complication narrative */}
          {simulation.complication.hasComplication ? (
            <div className="alert-box alert-warning" role="status" style={{ margin: '0.75rem 0 0 0' }}>
              <span>⚡</span>
              <div>
                <strong>{`${simulation.complication.label} : `}</strong>{simulation.complication.description}
              </div>
            </div>
          ) : (
            <div className="alert-box alert-success" role="status" style={{ margin: '0.75rem 0 0 0', padding: '0.6rem 0.8rem' }}>
              <span>✓</span>
              <div style={{ fontSize: '0.85rem' }}>
                {simulation.complication.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
