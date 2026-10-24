import React, { useState } from 'react';
import { MarketSimulationResult } from '../domain/types';
import { simulateMarketD20 } from '../domain/market';

interface MarketSimulatorProps {
  defaultCeilingPrice?: number;
}

export const MarketSimulator: React.FC<MarketSimulatorProps> = ({
  defaultCeilingPrice = 25000,
}) => {
  const [ceilingPrice, setCeilingPrice] = useState<number>(defaultCeilingPrice);
  const [d20Input, setD20Input] = useState<number>(10);
  const [result, setResult] = useState<MarketSimulationResult | null>(() =>
    simulateMarketD20(defaultCeilingPrice, 10)
  );

  const handleSimulate = (roll: number) => {
    try {
      const sim = simulateMarketD20(ceilingPrice, roll);
      setResult(sim);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRollDice = () => {
    const randomRoll = Math.floor(Math.random() * 20) + 1;
    setD20Input(randomRoll);
    handleSimulate(randomRoll);
  };

  return (
    <section className="grid-cols-2" aria-labelledby="market-sim-title">
      <div className="card">
        <h2 id="market-sim-title" className="card-title">
          Simulation de Marché & Négociation d20
        </h2>
        <p className="form-hint" style={{ marginBottom: '1rem' }}>
          Règle du Plafond Garanti : le joueur ne paie jamais plus que le devis annoncé (P_payé &le; P_plafond). Un bon jet (1 à 14) confère une remise jusqu'à 28%. Un jet élevé (16 à 20) n'augmente pas le prix mais déclenche une complication narrative.
        </p>

        <div className="form-group">
          <label className="form-label" htmlFor="market-ceiling-input">
            Prix Plafond Annoncé (po)
          </label>
          <input
            id="market-ceiling-input"
            type="number"
            className="form-input"
            min={1}
            value={ceilingPrice}
            onChange={(e) => {
              const val = Math.max(1, Number(e.target.value));
              setCeilingPrice(val);
              if (d20Input >= 1 && d20Input <= 20) {
                setResult(simulateMarketD20(val, d20Input));
              }
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="d20-manual-input">
            Tirage du d20 (1 à 20)
          </label>
          <input
            id="d20-manual-input"
            type="number"
            className="form-input"
            min={1}
            max={20}
            value={d20Input}
            onChange={(e) => {
              const val = Number(e.target.value);
              setD20Input(val);
              if (val >= 1 && val <= 20) {
                handleSimulate(val);
              }
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleRollDice}
            aria-label="Lancer le dé d20 de marché"
          >
            Lancer le d20 aléatoire
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSimulate(d20Input)}
            disabled={d20Input < 1 || d20Input > 20}
          >
            Appliquer le jet manuel
          </button>
        </div>
      </div>

      <div className="card" aria-live="polite">
        <h3 className="card-title">Résultat de la Négociation</h3>

        {result && (
          <div data-testid="market-result-panel">
            <div className="quote-summary">
              <div>Prix Final Négocié (Plafond garanti) :</div>
              <div className="quote-price" data-testid="market-final-price">
                {result.finalPrice.toLocaleString('fr-FR')} po
              </div>

              <div className="quote-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-label">Résultat d20</span>
                  <span className="breakdown-value" data-testid="market-d20-val">{result.d20}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Ratio appliqué</span>
                  <span className="breakdown-value">{(result.priceRatio * 100).toFixed(0)} %</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Remise accordée</span>
                  <span className="breakdown-value">{(result.discountRate * 100).toFixed(0)} %</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Plafond garanti</span>
                  <span className="breakdown-value">{result.ceilingPrice.toLocaleString('fr-FR')} po</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <div className="form-label">Évaluation du Marché :</div>
              <p style={{ fontWeight: 600, color: 'var(--text-gold)' }}>
                {result.categoryLabel}
              </p>
            </div>

            {result.complicationTitle && (
              <div className="alert alert-danger" style={{ marginTop: '1rem' }} data-testid="market-complication">
                <strong>{result.complicationTitle}</strong>
                <p style={{ marginTop: '0.25rem' }}>{result.complicationDescription}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
