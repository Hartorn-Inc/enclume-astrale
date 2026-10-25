import React from 'react';
import { simulateMarket, MarketSimulationResult } from '../domain/market';

export interface MarketState {
  basePrice: number;
  d20Roll: number;
}

interface MarketSimulatorProps {
  state: MarketState;
  onChange: (updater: (prev: MarketState) => MarketState) => void;
  onAnnounce: (message: string) => void;
}

export const MarketSimulator: React.FC<MarketSimulatorProps> = ({
  state,
  onChange,
  onAnnounce,
}) => {
  let simulation: MarketSimulationResult | null = null;
  let calculationError: string | null = null;

  try {
    if (state.basePrice >= 0 && state.d20Roll >= 1 && state.d20Roll <= 20) {
      simulation = simulateMarket(state.basePrice, state.d20Roll);
    }
  } catch (err: unknown) {
    calculationError = (err as Error).message;
  }

  const rollRandomD20 = () => {
    const newRoll = Math.floor(Math.random() * 20) + 1;
    onChange((prev) => ({ ...prev, d20Roll: newRoll }));
    try {
      const res = simulateMarket(state.basePrice, newRoll);
      const msg = `Tirage d20 = ${newRoll}. Prix négocié : ${res.finalPrice} po (${res.discountPercent}% de remise). ${res.narrativeComplication}`;
      onAnnounce(msg);
    } catch {
      // ignore
    }
  };

  const handlePriceChange = (val: number) => {
    const validVal = isNaN(val) || val < 0 ? 0 : val;
    onChange((prev) => ({ ...prev, basePrice: validVal }));
  };

  const handleD20Change = (val: number) => {
    const clamped = Math.max(1, Math.min(20, isNaN(val) ? 1 : val));
    onChange((prev) => ({ ...prev, d20Roll: clamped }));
  };

  return (
    <section aria-labelledby="market-heading" className="card">
      <header className="card-header">
        <h2 id="market-heading" className="card-title">
          Simulateur de Marché d20 &amp; Aléas d&apos;Artisanat
        </h2>
        <p className="card-description">
          P_payé = P_plafond × min(1, (70 + 2×d20) / 100). Le prix ne dépasse jamais le plafond garanti.
        </p>
      </header>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="market-base-price">Prix plafond de référence (po)</label>
          <input
            id="market-base-price"
            type="number"
            min={0}
            step={50}
            className="form-control"
            value={state.basePrice}
            onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="market-d20-slider">Valeur du dé d20 (1 à 20) : {state.d20Roll}</label>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              id="market-d20-slider"
              type="range"
              min={1}
              max={20}
              value={state.d20Roll}
              className="form-control"
              style={{ flex: 1 }}
              onChange={(e) => handleD20Change(parseInt(e.target.value, 10))}
              aria-label="Curseur de dé d20"
            />
            <input
              id="market-d20-number"
              type="number"
              min={1}
              max={20}
              className="form-control"
              style={{ width: '70px', textAlign: 'center' }}
              value={state.d20Roll}
              onChange={(e) => handleD20Change(parseInt(e.target.value, 10))}
              aria-label="Saisie manuelle d20"
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={rollRandomD20}
              aria-label="Lancer le dé d20 aléatoirement"
            >
              🎲 Lancer d20
            </button>
          </div>
        </div>
      </div>

      {calculationError && (
        <div className="alert alert-danger" role="alert">
          {calculationError}
        </div>
      )}

      {simulation && (
        <div className="quote-summary" aria-label="Résultat de la négociation d20">
          <div className="d20-display">
            <div className="d20-die" aria-label={`Résultat du dé : ${simulation.d20Roll}`}>
              {simulation.d20Roll}
            </div>
            <div>
              <span className="detail-label">Prix Négocié Final</span>
              <div className="quote-price-value">
                {simulation.finalPrice.toLocaleString('fr-FR')}
                <span className="quote-price-unit">po</span>
              </div>
              <span className="badge badge-gold">
                {simulation.discountPercent > 0
                  ? `Remise de ${simulation.discountPercent} % (${(simulation.multiplier * 100).toFixed(0)} % du plafond)`
                  : 'Plafond nominal (100 %)'}
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '280px' }}>
            <div className="detail-label" style={{ marginBottom: '0.4rem' }}>
              Résultat &amp; Impact narratif :
            </div>
            <div
              className={`alert ${
                simulation.hasComplication
                  ? simulation.complicationSeverity === 'MAJOR'
                    ? 'alert-danger'
                    : 'alert-warning'
                  : 'alert-success'
              }`}
              style={{ margin: 0 }}
            >
              <div>
                <strong>{simulation.outcomeLabel}</strong> : {simulation.narrativeComplication}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
