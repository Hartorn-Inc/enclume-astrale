import React, { useId } from 'react';
import { simulateMarket, MarketSimulationResult } from '../domain/market';

export interface MarketSimulatorProps {
  basePrice: number;
  onBasePriceChange: (price: number) => void;
  d20Roll: number;
  onD20Change: (roll: number) => void;
}

export const MarketSimulator: React.FC<MarketSimulatorProps> = ({
  basePrice,
  onBasePriceChange,
  d20Roll,
  onD20Change,
}) => {
  const basePriceId = useId();
  const d20InputId = useId();

  let simulationResult: MarketSimulationResult | null = null;
  let simulationError: string | null = null;

  if (basePrice < 0) {
    simulationError = 'Le prix plafond doit être supérieur ou égal à zéro.';
  } else if (d20Roll < 1 || d20Roll > 20) {
    simulationError = 'Le tirage d20 doit être compris entre 1 et 20.';
  } else {
    try {
      simulationResult = simulateMarket(basePrice, d20Roll);
    } catch (err: unknown) {
      simulationError = err instanceof Error ? err.message : 'Erreur de simulation.';
    }
  }

  const handleRollDice = () => {
    const randomRoll = Math.floor(Math.random() * 20) + 1;
    onD20Change(randomRoll);
  };

  return (
    <section className="card" aria-labelledby="market-simulator-heading">
      <h2 id="market-simulator-heading" className="card-title">
        🎲 Simulation du Marché & Négociation d20
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Règle d'or : Le prix payé ne dépasse <strong>jamais</strong> le plafond garanti (P_payé ≤ P_plafond).
      </p>

      <div className="grid-2">
        <div className="form-group">
          <label htmlFor={basePriceId} className="form-label">
            Prix Plafond Annoncé (po)
          </label>
          <input
            id={basePriceId}
            type="number"
            min={0}
            step={10}
            className="form-input"
            value={basePrice}
            onChange={(e) => onBasePriceChange(Math.max(0, parseInt(e.target.value || '0', 10)))}
          />
        </div>

        <div className="form-group">
          <label htmlFor={d20InputId} className="form-label">
            Tirage du d20 (1 à 20)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              id={d20InputId}
              type="number"
              min={1}
              max={20}
              className="form-input"
              style={{ maxWidth: '100px' }}
              value={d20Roll}
              onChange={(e) => {
                const val = parseInt(e.target.value || '1', 10);
                onD20Change(Math.min(20, Math.max(1, val)));
              }}
            />
            <button type="button" className="btn btn-secondary" onClick={handleRollDice}>
              🎲 Lancer le d20
            </button>
          </div>
        </div>
      </div>

      {simulationError && (
        <div className="alert alert-error" role="alert">
          {simulationError}
        </div>
      )}

      {simulationResult && (
        <div className="quote-summary">
          <div className="quote-grid">
            <div className="quote-item">
              <span className="quote-label">Tirage d20</span>
              <span className="quote-value">{`${simulationResult.d20Roll} / 20`}</span>
            </div>
            <div className="quote-item">
              <span className="quote-label">Pourcentage appliqué</span>
              <span className="quote-value">
                {simulationResult.percentageApplied} %{' '}
                <span style={{ fontSize: '0.85rem', color: 'var(--color-success)' }}>
                  (-{Math.round(simulationResult.discountRate * 100)} %)
                </span>
              </span>
            </div>
            <div className="quote-item">
              <span className="quote-label">Prix Négocié Final</span>
              <span className="quote-value-highlight">
                {`${simulationResult.finalPrice.toLocaleString('fr-FR')} po`}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge ${simulationResult.hasIncident ? 'badge-incident' : 'badge-success'}`}>
              {simulationResult.category}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {simulationResult.statusLabel}
            </span>
          </div>

          {simulationResult.incidentDescription && (
            <div className="alert alert-error" style={{ marginTop: '1rem', marginBottom: 0 }} role="alert">
              <span>⚡</span>
              <div>
                <strong>Complication Narrative :</strong> {simulationResult.incidentDescription}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Région aria-live pour l'accessibilité vocale */}
      <div className="sr-only" aria-live="polite" role="status">
        {simulationResult
          ? `Tirage d20 : ${simulationResult.d20Roll}. Prix négocié : ${simulationResult.finalPrice} pièces d'or. ${simulationResult.statusLabel}.`
          : ''}
      </div>
    </section>
  );
};
