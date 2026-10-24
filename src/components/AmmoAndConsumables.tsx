import React, { useState } from 'react';
import {
  computeAmmoQuote,
  AmmoSupplement,
  AMMO_SUPPLEMENT_COSTS,
} from '../domain/forge';
import {
  HEALING_POTIONS,
  SPECIAL_CONSUMABLES,
  RulesetProfile,
} from '../domain/catalog';

interface AmmoAndConsumablesProps {
  ruleset?: RulesetProfile;
  onRulesetChange?: (r: RulesetProfile) => void;
  onSendToMarket?: (price: number) => void;
}

export const AmmoAndConsumables: React.FC<AmmoAndConsumablesProps> = ({
  ruleset = 'CLASSIC_5E',
  onRulesetChange,
  onSendToMarket,
}) => {
  const [currentRuleset, setCurrentRuleset] = useState<RulesetProfile>(ruleset);
  const [ammoBonus, setAmmoBonus] = useState<number>(1);
  const [ammoQuantity, setAmmoQuantity] = useState<number>(10);
  const [selectedSupplements, setSelectedSupplements] = useState<AmmoSupplement[]>([]);

  const handleRulesetToggle = (newRuleset: RulesetProfile) => {
    setCurrentRuleset(newRuleset);
    onRulesetChange?.(newRuleset);
  };

  const toggleSupplement = (supp: AmmoSupplement) => {
    setSelectedSupplements((prev) =>
      prev.includes(supp) ? prev.filter((s) => s !== supp) : [...prev, supp]
    );
  };

  const ammoQuote = computeAmmoQuote({
    baseBonus: ammoBonus,
    quantity: ammoQuantity,
    supplements: selectedSupplements,
  });

  return (
    <div className="ammo-and-consumables">
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="card-title" style={{ marginBottom: 0 }}>Profil de Règles Économiques</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Basculez entre le barème classique D&D 5e et la révision D&D 2024 pour les potions.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={`btn ${currentRuleset === 'CLASSIC_5E' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleRulesetToggle('CLASSIC_5E')}
              aria-pressed={currentRuleset === 'CLASSIC_5E'}
            >
              5e Classique
            </button>
            <button
              type="button"
              className={`btn ${currentRuleset === 'REVISED_2024' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleRulesetToggle('REVISED_2024')}
              aria-pressed={currentRuleset === 'REVISED_2024'}
            >
              Variante 2024
            </button>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Munitions Magiques */}
        <div className="card">
          <h2 className="card-title">Munitions Magiques par Lots</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Tarification unitaire calculée selon la formule officielle : (Forge de l'arme / 50) + options.
          </p>

          <div className="form-group">
            <label htmlFor="ammo-bonus" className="form-label">
              Bonus d'altération du projectile
            </label>
            <select
              id="ammo-bonus"
              className="form-select"
              value={ammoBonus}
              onChange={(e) => setAmmoBonus(Number(e.target.value))}
            >
              <option value="0">+0 Ordinaire</option>
              <option value="1">+1 (1 000 po base)</option>
              <option value="2">+2 (9 000 po base)</option>
              <option value="3">+3 (36 000 po base)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ammo-qty" className="form-label">
              Taille du lot (Quantité)
            </label>
            <input
              id="ammo-qty"
              type="number"
              min={1}
              className="form-input"
              value={ammoQuantity}
              onChange={(e) => setAmmoQuantity(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>

          <div className="form-group">
            <span className="form-label">Options et suppléments par unité :</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.4rem' }}>
              {(['UNBREAKABLE', 'IMPACT', 'SILVERED'] as AmmoSupplement[]).map((supp) => {
                const names: Record<AmmoSupplement, string> = {
                  UNBREAKABLE: 'Incassable (+20 po/u)',
                  IMPACT: 'Percutante (+20 po/u)',
                  SILVERED: 'Argentée (+10 po/u)',
                };
                const isChecked = selectedSupplements.includes(supp);
                return (
                  <label key={supp} className="slot-item">
                    <span>{names[supp]}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSupplement(supp)}
                      aria-label={names[supp]}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {ammoQuote.isValid ? (
            <div style={{ marginTop: '1.25rem' }}>
              <div className="price-display">
                <span className="price-label">Prix Total du Lot</span>
                <div className="price-number" data-testid="ammo-total-price">
                  {`${ammoQuote.totalPrice.toLocaleString('fr-FR')} po`}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {ammoQuote.baseUnitCost + ammoQuote.supplementsUnitCost} po / unité pour {ammoQuantity} projectile(s)
                </p>
              </div>
              {onSendToMarket && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => onSendToMarket(ammoQuote.totalPrice)}
                >
                  Négocier ce lot au Marché
                </button>
              )}
            </div>
          ) : (
            <div className="alert alert-danger">
              <span>Paramètres de munitions invalides.</span>
            </div>
          )}
        </div>

        {/* Consommables Alchimiques */}
        <div className="card">
          <h2 className="card-title">Consommables & Potions de Soin</h2>

          <div className="table-wrapper" style={{ marginBottom: '1.25rem' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Potion</th>
                  <th>Soin</th>
                  <th style={{ textAlign: 'right' }}>Prix ({currentRuleset === 'CLASSIC_5E' ? '5e' : '2024'})</th>
                </tr>
              </thead>
              <tbody>
                {HEALING_POTIONS.map((potion) => (
                  <tr key={potion.id}>
                    <td>
                      <strong>{potion.name}</strong>
                    </td>
                    <td>{potion.healingFormula}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-gold)' }}>
                      {`${potion.prices[currentRuleset].toLocaleString('fr-FR')} po`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="card-title" style={{ fontSize: '1.05rem', marginTop: '1rem' }}>
            Consommables Spéciaux
          </h3>
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Objet</th>
                  <th>Unité</th>
                  <th style={{ textAlign: 'right' }}>Prix</th>
                </tr>
              </thead>
              <tbody>
                {SPECIAL_CONSUMABLES.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {item.description}
                      </p>
                    </td>
                    <td>{item.unit}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-gold)' }}>
                      {`${item.price.toLocaleString('fr-FR')} po`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
