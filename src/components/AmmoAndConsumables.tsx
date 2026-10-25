import React from 'react';
import {
  calculateAmmoCraft,
  type AmmoSupplement,
} from '../domain/forge';
import {
  HEALING_POTIONS_CATALOG,
  SPECIAL_CONSUMABLES_CATALOG,
  type RulesetVersion,
} from '../domain/catalog';
import type { AppState } from '../storage';

export interface AmmoAndConsumablesProps {
  state: AppState['ammoAndConsumables'];
  onChange: (newState: AppState['ammoAndConsumables']) => void;
  onTransferToMarket: (price: number) => void;
  announce: (message: string) => void;
}

export const AmmoAndConsumables: React.FC<AmmoAndConsumablesProps> = ({
  state,
  onChange,
  onTransferToMarket,
  announce,
}) => {
  const {
    bonus,
    slots,
    quantity,
    supplements,
    ruleset,
    potionQuantities,
    specialQuantities,
  } = state;

  // Calcul du lot de munitions
  const ammoResult = calculateAmmoCraft({
    bonus,
    slots,
    quantity,
    supplements,
  });

  const toggleSupplement = (sup: AmmoSupplement) => {
    const exists = supplements.includes(sup);
    const next = exists ? supplements.filter((s) => s !== sup) : [...supplements, sup];
    onChange({ ...state, supplements: next });
  };

  // Calcul du panier de consommables
  const potionTotal = HEALING_POTIONS_CATALOG.reduce((sum, potion) => {
    const qty = potionQuantities[potion.id] || 0;
    const unitPrice = potion.prices[ruleset];
    return sum + qty * unitPrice;
  }, 0);

  const specialTotal = SPECIAL_CONSUMABLES_CATALOG.reduce((sum, item) => {
    const qty = specialQuantities[item.id] || 0;
    return sum + qty * item.price;
  }, 0);

  const consumablesGrandTotal = potionTotal + specialTotal;

  const handlePotionQtyChange = (id: string, qty: number) => {
    const safeQty = Math.max(0, qty);
    onChange({
      ...state,
      potionQuantities: { ...potionQuantities, [id]: safeQty },
    });
  };

  const handleSpecialQtyChange = (id: string, qty: number) => {
    const safeQty = Math.max(0, qty);
    onChange({
      ...state,
      specialQuantities: { ...specialQuantities, [id]: safeQty },
    });
  };

  const switchRuleset = (nextRuleset: RulesetVersion) => {
    onChange({ ...state, ruleset: nextRuleset });
    announce(`Variante de règles active : ${nextRuleset === '5e_2024' ? 'D&D 2024' : 'D&D 5e (2014)'}`);
  };

  return (
    <section aria-labelledby="ammo-section-title">
      <h2 id="ammo-section-title" className="section-title">
        🏹 Munitions Magiques &amp; Consommables Alchimiques
      </h2>

      {/* 1. Munitions Enchantées */}
      <div className="section-card">
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
          Lots de Munitions Enchantées
        </h3>
        <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Formule officielle : <code>(P_forge_arme(N) / 50) × Q + Suppléments fixes</code>.
        </p>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="ammo-bonus-select">Bonus d'altération (B) :</label>
            <select
              id="ammo-bonus-select"
              className="form-control"
              value={bonus}
              onChange={(e) => onChange({ ...state, bonus: parseInt(e.target.value, 10) })}
            >
              <option value={0}>+0</option>
              <option value={1}>+1</option>
              <option value={2}>+2</option>
              <option value={3}>+3</option>
              <option value={4}>+4</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ammo-slots-select">Slots d'enchantement (S ≤ B) :</label>
            <select
              id="ammo-slots-select"
              className="form-control"
              value={slots}
              onChange={(e) => onChange({ ...state, slots: parseInt(e.target.value, 10) })}
            >
              <option value={0}>0 slot</option>
              <option value={1}>1 slot</option>
              <option value={2}>2 slots</option>
              <option value={3}>3 slots</option>
              <option value={4}>4 slots</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ammo-quantity-input">Taille du lot (Q projectiles) :</label>
            <input
              id="ammo-quantity-input"
              type="number"
              min={1}
              step={1}
              className="form-control"
              value={quantity}
              onChange={(e) => onChange({ ...state, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
            />
          </div>
        </div>

        {/* Suppléments fixes */}
        <div style={{ marginTop: '1rem' }}>
          <label style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block', marginBottom: '0.4rem' }}>
            Suppléments fixes par unité :
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={supplements.includes('UNBREAKABLE')}
                onChange={() => toggleSupplement('UNBREAKABLE')}
              />
              Incassable (+20 po/u)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={supplements.includes('STRIKING')}
                onChange={() => toggleSupplement('STRIKING')}
              />
              Percutante (+20 po/u)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={supplements.includes('SILVERED')}
                onChange={() => toggleSupplement('SILVERED')}
              />
              Argentée (+10 po/u)
            </label>
          </div>
        </div>

        {/* Résultat Munitions */}
        {!ammoResult.isValid ? (
          <div className="alert-box alert-danger" role="alert" style={{ marginTop: '1rem' }}>
            <span>⚠️</span>
            <div>
              <strong>Capacité de munitions dépassée :</strong> {ammoResult.message}
            </div>
          </div>
        ) : (
          <div className="quote-summary" style={{ marginTop: '1rem' }} aria-label="Devis du lot de munitions">
            <div className="quote-summary-header">
              <div>
                <div className="quote-title">{`Lot de ${ammoResult.quantity} munitions +${ammoResult.bonus}`}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {`Base : ${ammoResult.basePrice.toLocaleString('fr-FR')} po | Suppléments : ${ammoResult.supplementPrice.toLocaleString('fr-FR')} po`}
                </div>
              </div>
              <div className="quote-price">{`${ammoResult.totalPrice.toLocaleString('fr-FR')} po`}</div>
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-gold"
                onClick={() => {
                  onTransferToMarket(ammoResult.totalPrice);
                  announce(`Lot de munitions (${ammoResult.totalPrice} po) envoyé au marché.`);
                }}
              >
                Négocier au Marché d20 ⚖️
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Consommables Alchimiques */}
      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
            Potions de Soins &amp; Consommables Alchimiques
          </h3>
          <div className="ruleset-switch" role="group" aria-label="Profil de règles des consommables">
            <button
              type="button"
              className={`ruleset-btn ${ruleset === '5e_2014' ? 'active' : ''}`}
              onClick={() => switchRuleset('5e_2014')}
              aria-pressed={ruleset === '5e_2014'}
            >
              5e Classique (2014)
            </button>
            <button
              type="button"
              className={`ruleset-btn ${ruleset === '5e_2024' ? 'active' : ''}`}
              onClick={() => switchRuleset('5e_2024')}
              aria-pressed={ruleset === '5e_2024'}
            >
              Variante 2024
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {HEALING_POTIONS_CATALOG.map((potion) => {
            const unitPrice = potion.prices[ruleset];
            const qty = potionQuantities[potion.id] || 0;
            return (
              <div
                key={potion.id}
                style={{
                  background: 'var(--bg-surface)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
                  {potion.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                  {`Restauration : ${potion.diceRoll} PV`}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{`${unitPrice} po`}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <label htmlFor={`potion-qty-${potion.id}`} className="sr-only">{`Quantité ${potion.name}`}</label>
                    <input
                      id={`potion-qty-${potion.id}`}
                      type="number"
                      min={0}
                      className="form-control"
                      style={{ width: '65px', padding: '0.3rem 0.5rem' }}
                      value={qty}
                      onChange={(e) => handlePotionQtyChange(potion.id, parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Consommables spéciaux */}
        <h4 style={{ margin: '1.25rem 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Consommables Spéciaux
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {SPECIAL_CONSUMABLES_CATALOG.map((item) => {
            const qty = specialQuantities[item.id] || 0;
            return (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-surface)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-purple)' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                  {item.description}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{`${item.price} po / ${item.unit}`}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <label htmlFor={`special-qty-${item.id}`} className="sr-only">{`Quantité ${item.name}`}</label>
                    <input
                      id={`special-qty-${item.id}`}
                      type="number"
                      min={0}
                      className="form-control"
                      style={{ width: '65px', padding: '0.3rem 0.5rem' }}
                      value={qty}
                      onChange={(e) => handleSpecialQtyChange(item.id, parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Consommables */}
        {consumablesGrandTotal > 0 && (
          <div className="quote-summary" style={{ marginTop: '1rem' }} aria-label="Devis total des consommables">
            <div className="quote-summary-header">
              <div>
                <div className="quote-title">{`Panier de Consommables (${ruleset === '5e_2024' ? 'Variante 2024' : '5e Classique'})`}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {`Potions : ${potionTotal.toLocaleString('fr-FR')} po | Spéciaux : ${specialTotal.toLocaleString('fr-FR')} po`}
                </div>
              </div>
              <div className="quote-price">{`${consumablesGrandTotal.toLocaleString('fr-FR')} po`}</div>
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-gold"
                onClick={() => {
                  onTransferToMarket(consumablesGrandTotal);
                  announce(`Panier de consommables (${consumablesGrandTotal} po) envoyé au marché.`);
                }}
              >
                Négocier au Marché d20 ⚖️
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
