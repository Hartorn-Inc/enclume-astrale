import React from 'react';
import {
  calculateAmmoQuote,
  AmmoCraftResult,
  AmmoSupplementType,
  AMMO_SUPPLEMENT_COSTS,
} from '../domain/forge';
import {
  RulesetProfile,
  HEALING_POTIONS_CATALOG,
  SPECIAL_CONSUMABLES,
  getHealingPotionPrice,
} from '../domain/catalog';

export interface AmmoState {
  enhancementBonus: number;
  slots: number;
  quantity: number;
  supplements: AmmoSupplementType[];
}

export interface ConsumablesState {
  ruleset: RulesetProfile;
  potionQuantities: Record<string, number>;
  specialQuantities: Record<string, number>;
}

interface AmmoAndConsumablesProps {
  ammoState: AmmoState;
  consumablesState: ConsumablesState;
  onAmmoChange: (updater: (prev: AmmoState) => AmmoState) => void;
  onConsumablesChange: (updater: (prev: ConsumablesState) => ConsumablesState) => void;
  onSendToMarket: (price: number) => void;
}

export const AmmoAndConsumables: React.FC<AmmoAndConsumablesProps> = ({
  ammoState,
  consumablesState,
  onAmmoChange,
  onConsumablesChange,
  onSendToMarket,
}) => {
  const ammoQuote: AmmoCraftResult = calculateAmmoQuote({
    enhancementBonus: ammoState.enhancementBonus,
    slots: ammoState.slots,
    quantity: ammoState.quantity,
    supplements: ammoState.supplements,
  });

  const toggleSupplement = (type: AmmoSupplementType) => {
    onAmmoChange((prev) => {
      const exists = prev.supplements.includes(type);
      const next = exists ? prev.supplements.filter((s) => s !== type) : [...prev.supplements, type];
      return { ...prev, supplements: next };
    });
  };

  // Calculate total consumables price
  const totalPotionsPrice = HEALING_POTIONS_CATALOG.reduce((acc, potion) => {
    const qty = consumablesState.potionQuantities[potion.id] || 0;
    const unitPrice = getHealingPotionPrice(potion.id, consumablesState.ruleset);
    return acc + qty * unitPrice;
  }, 0);

  const totalSpecialPrice = SPECIAL_CONSUMABLES.reduce((acc, item) => {
    const qty = consumablesState.specialQuantities[item.id] || 0;
    return acc + qty * item.price;
  }, 0);

  const totalConsumablesPrice = totalPotionsPrice + totalSpecialPrice;

  return (
    <div className="ammo-consumables-container">
      {/* 1. Munitions Enchantées */}
      <section aria-labelledby="ammo-heading" className="card">
        <header className="card-header">
          <h2 id="ammo-heading" className="card-title">
            Munitions Magiques par Lots
          </h2>
          <p className="card-description">
            Formule de lot : P = (P_forge_arme(N) / 50) × Q + suppléments fixes par unité.
          </p>
        </header>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="ammo-bonus-select">Bonus d&apos;altération (B)</label>
            <select
              id="ammo-bonus-select"
              className="form-control"
              value={ammoState.enhancementBonus}
              onChange={(e) =>
                onAmmoChange((prev) => ({
                  ...prev,
                  enhancementBonus: parseInt(e.target.value, 10),
                }))
              }
            >
              <option value={0}>+0</option>
              <option value={1}>+1</option>
              <option value={2}>+2</option>
              <option value={3}>+3</option>
              <option value={4}>+4</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ammo-slots-select">Slots d&apos;enchantement (S)</label>
            <select
              id="ammo-slots-select"
              className="form-control"
              value={ammoState.slots}
              onChange={(e) =>
                onAmmoChange((prev) => ({
                  ...prev,
                  slots: parseInt(e.target.value, 10),
                }))
              }
            >
              <option value={0}>0 slot</option>
              <option value={1}>1 slot</option>
              <option value={2}>2 slots</option>
              <option value={3}>3 slots</option>
              <option value={4}>4 slots</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ammo-qty-input">Taille du lot (Quantité)</label>
            <input
              id="ammo-qty-input"
              type="number"
              min={1}
              step={1}
              className="form-control"
              value={ammoState.quantity}
              onChange={(e) =>
                onAmmoChange((prev) => ({
                  ...prev,
                  quantity: parseInt(e.target.value, 10) || 1,
                }))
              }
            />
          </div>
        </div>

        {/* Supplements checkboxes */}
        <fieldset className="card" style={{ background: 'var(--bg-main)' }}>
          <legend style={{ fontWeight: 600, color: 'var(--accent)', padding: '0 0.5rem' }}>
            Suppléments par projectile
          </legend>
          <div className="enchantment-list">
            <label className="enchantment-item">
              <input
                type="checkbox"
                checked={ammoState.supplements.includes('UNBREAKABLE')}
                onChange={() => toggleSupplement('UNBREAKABLE')}
              />
              <div className="enchantment-info">
                <span className="enchantment-name">
                  Incassable
                  <span className="badge badge-gold">+{AMMO_SUPPLEMENT_COSTS.UNBREAKABLE} po / u</span>
                </span>
                <span className="enchantment-desc">Ne se brise jamais lors des impacts normaux</span>
              </div>
            </label>

            <label className="enchantment-item">
              <input
                type="checkbox"
                checked={ammoState.supplements.includes('PIERCING')}
                onChange={() => toggleSupplement('PIERCING')}
              />
              <div className="enchantment-info">
                <span className="enchantment-name">
                  Percutante
                  <span className="badge badge-gold">+{AMMO_SUPPLEMENT_COSTS.PIERCING} po / u</span>
                </span>
                <span className="enchantment-desc">Pointe renforcée perçant armures et écailles lourdes</span>
              </div>
            </label>

            <label className="enchantment-item">
              <input
                type="checkbox"
                checked={ammoState.supplements.includes('SILVERED')}
                onChange={() => toggleSupplement('SILVERED')}
              />
              <div className="enchantment-info">
                <span className="enchantment-name">
                  Argentée
                  <span className="badge badge-gold">+{AMMO_SUPPLEMENT_COSTS.SILVERED} po / u</span>
                </span>
                <span className="enchantment-desc">Feuille d&apos;argent pure pour contourner les résistances</span>
              </div>
            </label>
          </div>
        </fieldset>

        {!ammoQuote.isValid && (
          <div className="alert alert-danger" role="alert">
            <strong>Erreur de chiffrage de munitions :</strong>{' '}
            {ammoQuote.error === 'CAPACITY_EXCEEDED'
              ? 'Les slots dépassent le bonus nu (S > B).'
              : ammoQuote.error}
          </div>
        )}

        {ammoQuote.isValid && (
          <div className="quote-summary" aria-label="Devis munitions">
            <div>
              <span className="detail-label">Prix total du lot ({ammoState.quantity} unités)</span>
              <div className="quote-price-value">
                {ammoQuote.totalPrice.toLocaleString('fr-FR')}
                <span className="quote-price-unit">po</span>
              </div>
            </div>
            <div className="quote-details">
              <div className="detail-item">
                <span className="detail-label">Prix unitaire de base</span>
                <span className="detail-value">{`${ammoQuote.unitBasePrice} po / u`}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Niveau effectif (N)</span>
                <span className="detail-value">{ammoQuote.effectiveTier}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onSendToMarket(ammoQuote.totalPrice)}
            >
              Envoyer au Marché d20
            </button>
          </div>
        )}
      </section>

      {/* 2. Consommables Alchimiques */}
      <section aria-labelledby="consumables-heading" className="card">
        <header className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 id="consumables-heading" className="card-title">
              Consommables Alchimiques &amp; Potions de Soins
            </h2>
            <p className="card-description">
              Tarification officielle commutable D&amp;D 5e Classique ou D&amp;D 2024 Révisé.
            </p>
          </div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="ruleset-select" style={{ margin: 0 }}>Règles :</label>
            <select
              id="ruleset-select"
              className="form-control"
              value={consumablesState.ruleset}
              onChange={(e) =>
                onConsumablesChange((prev) => ({
                  ...prev,
                  ruleset: e.target.value as RulesetProfile,
                }))
              }
            >
              <option value="CLASSIC_5E">D&amp;D 5e Classique</option>
              <option value="REVISED_2024">D&amp;D 2024 Révisé</option>
            </select>
          </div>
        </header>

        <div className="table-wrapper card" style={{ background: 'var(--bg-main)', marginBottom: '1.5rem' }}>
          <table className="data-table" aria-label="Catalogue des potions de soins">
            <thead>
              <tr>
                <th>Potion</th>
                <th>Rareté &amp; Soins</th>
                <th>Prix unitaire</th>
                <th>Quantité</th>
                <th>Sous-total</th>
              </tr>
            </thead>
            <tbody>
              {HEALING_POTIONS_CATALOG.map((potion) => {
                const unitPrice = getHealingPotionPrice(potion.id, consumablesState.ruleset);
                const qty = consumablesState.potionQuantities[potion.id] || 0;
                const subtotal = qty * unitPrice;
                return (
                  <tr key={potion.id}>
                    <td>
                      <strong>{potion.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{potion.description}</div>
                    </td>
                    <td>
                      <span className="badge badge-gold">{potion.diceFormula}</span>
                    </td>
                    <td>{`${unitPrice.toLocaleString('fr-FR')} po`}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        className="form-control"
                        style={{ width: '70px' }}
                        value={qty}
                        aria-label={`Quantité pour ${potion.name}`}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10) || 0;
                          onConsumablesChange((prev) => ({
                            ...prev,
                            potionQuantities: { ...prev.potionQuantities, [potion.id]: Math.max(0, v) },
                          }));
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{`${subtotal.toLocaleString('fr-FR')} po`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="table-wrapper card" style={{ background: 'var(--bg-main)' }}>
          <table className="data-table" aria-label="Consommables spéciaux">
            <thead>
              <tr>
                <th>Objet Spécial</th>
                <th>Effet</th>
                <th>Prix unitaire</th>
                <th>Quantité</th>
                <th>Sous-total</th>
              </tr>
            </thead>
            <tbody>
              {SPECIAL_CONSUMABLES.map((item) => {
                const qty = consumablesState.specialQuantities[item.id] || 0;
                const subtotal = qty * item.price;
                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <span className="badge" style={{ marginLeft: '0.5rem' }}>{item.unit}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.description}</td>
                    <td>{`${item.price.toLocaleString('fr-FR')} po`}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        className="form-control"
                        style={{ width: '70px' }}
                        value={qty}
                        aria-label={`Quantité pour ${item.name}`}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10) || 0;
                          onConsumablesChange((prev) => ({
                            ...prev,
                            specialQuantities: { ...prev.specialQuantities, [item.id]: Math.max(0, v) },
                          }));
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{`${subtotal.toLocaleString('fr-FR')} po`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalConsumablesPrice > 0 && (
          <div className="quote-summary" style={{ marginTop: '1.25rem' }} aria-label="Panier alchimique">
            <div>
              <span className="detail-label">Total du lot de consommables</span>
              <div className="quote-price-value">
                {totalConsumablesPrice.toLocaleString('fr-FR')}
                <span className="quote-price-unit">po</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onSendToMarket(totalConsumablesPrice)}
            >
              Négocier au Marché d20
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
