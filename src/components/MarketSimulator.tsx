import React, { useState } from 'react';
import { simulateMarket, MarketSimulationResult } from '../domain/market';

interface MarketSimulatorProps {
  ceilingPrice: number;
  onPriceChange?: (price: number) => void;
}

export const MarketSimulator: React.FC<MarketSimulatorProps> = ({
  ceilingPrice,
  onPriceChange,
}) => {
  const [currentCeiling, setCurrentCeiling] = useState<number>(ceilingPrice);
  const [d20Input, setD20Input] = useState<number>(10);
  const [lastResult, setLastResult] = useState<MarketSimulationResult | null>(() => {
    try {
      return simulateMarket(ceilingPrice, 10);
    } catch {
      return null;
    }
  });
  const [announcement, setAnnouncement] = useState<string>('');

  const executeRoll = (roll: number, priceToUse = currentCeiling) => {
    if (roll < 1 || roll > 20 || priceToUse < 0) return;
    const res = simulateMarket(priceToUse, roll);
    setLastResult(res);
    setD20Input(roll);
    const text = `Tirage d20: ${res.d20Roll}. Prix payé: ${res.finalPrice} po (${res.discountPercentage}% de réduction). Statut: ${res.title}.`;
    setAnnouncement(text);
  };

  const handleRollDice = () => {
    const randomRoll = Math.floor(Math.random() * 20) + 1;
    executeRoll(randomRoll);
  };

  const handleManualRollChange = (val: number) => {
    const clamped = Math.max(1, Math.min(20, Math.floor(val) || 1));
    executeRoll(clamped);
  };

  const handleCeilingChange = (newVal: number) => {
    const safeVal = Math.max(0, newVal || 0);
    setCurrentCeiling(safeVal);
    onPriceChange?.(safeVal);
    if (lastResult) {
      executeRoll(d20Input, safeVal);
    }
  };

  return (
    <div className="market-simulator">
      <div className="sr-only" aria-live="polite" data-testid="market-announcement">
        {announcement}
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="card-title">Paramètres de Négociation</h2>

          <div className="form-group">
            <label htmlFor="market-ceiling-input" className="form-label">
              Prix Plafond Garanti de Référence (po)
            </label>
            <input
              id="market-ceiling-input"
              type="number"
              min={0}
              className="form-input"
              value={currentCeiling}
              onChange={(e) => handleCeilingChange(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="d20-input" className="form-label">
              Valeur du dé (d20 : 1 à 20)
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                id="d20-input"
                type="number"
                min={1}
                max={20}
                className="form-input"
                style={{ width: '90px' }}
                value={d20Input}
                onChange={(e) => handleManualRollChange(Number(e.target.value))}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRollDice}
                data-testid="roll-dice-btn"
              >
                🎲 Lancer le d20
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <span className="form-label">Raccourcis de tirage rapide :</span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {[1, 3, 5, 10, 15, 18, 20].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                  onClick={() => executeRoll(v)}
                >
                  d20 = {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Résultat du Marché</h2>

          {lastResult ? (
            <div>
              <div className="price-display">
                <span className="price-label">
                  Prix Négocié Final (Tirage : {lastResult.d20Roll})
                </span>
                <div className="price-number" data-testid="final-price">
                  {`${lastResult.finalPrice.toLocaleString('fr-FR')} po`}
                </div>
                <div style={{ color: 'var(--color-gold)', fontWeight: 600, marginTop: '0.3rem' }}>
                  {lastResult.discountPercentage > 0
                    ? `${lastResult.discountPercentage} % de remise (${Math.round((lastResult.rateMultiplier) * 100)} % du plafond)`
                    : '100 % du plafond garanti'}
                </div>
              </div>

              <div
                className={`alert ${lastResult.hasComplication ? 'alert-warning' : 'alert-success'}`}
              >
                <div>
                  <strong>{lastResult.title}</strong>
                  <p style={{ marginTop: '0.3rem' }}>{lastResult.narrativeDescription}</p>
                  {lastResult.complicationDetails && (
                    <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                      ⚠️ Aléa : {lastResult.complicationDetails}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning">
              <span>Saisissez un prix plafond valide pour simuler la transaction.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
