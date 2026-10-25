import React, { useId, useState } from 'react';
import {
  computeAmmoQuote,
  AmmoSupplement,
  AmmoCraftResult,
  AMMO_SUPPLEMENT_COSTS,
} from '../domain/forge';
import {
  RulesetProfile,
  HEALING_POTIONS,
  SPECIAL_CONSUMABLES,
  getHealingPotionPrice,
  HealingPotionTier,
} from '../domain/catalog';

export interface AmmoAndConsumablesProps {
  ammoBonus: number;
  onAmmoBonusChange: (bonus: number) => void;
  ammoQuantity: number;
  onAmmoQuantityChange: (qty: number) => void;
  ammoSupplements: AmmoSupplement[];
  onAmmoSupplementsChange: (supplements: AmmoSupplement[]) => void;
  ruleset: RulesetProfile;
  onRulesetChange: (ruleset: RulesetProfile) => void;
  onSendToMarket: (price: number) => void;
}

export const AmmoAndConsumables: React.FC<AmmoAndConsumablesProps> = ({
  ammoBonus,
  onAmmoBonusChange,
  ammoQuantity,
  onAmmoQuantityChange,
  ammoSupplements,
  onAmmoSupplementsChange,
  ruleset,
  onRulesetChange,
  onSendToMarket,
}) => {
  const bonusId = useId();
  const quantityId = useId();
  const rulesetId = useId();

  const [potionQuantities, setPotionQuantities] = useState<Record<HealingPotionTier, number>>({
    COMMON: 0,
    UNCOMMON: 0,
    RARE: 0,
    VERY_RARE: 0,
  });

  const [specialQuantities, setSpecialQuantities] = useState<Record<string, number>>({
    'poudre-disparition': 0,
    'onguent-soin': 0,
    'colle-universelle': 0,
  });

  const toggleSupplement = (supp: AmmoSupplement) => {
    if (ammoSupplements.includes(supp)) {
      onAmmoSupplementsChange(ammoSupplements.filter((s) => s !== supp));
    } else {
      onAmmoSupplementsChange([...ammoSupplements, supp]);
    }
  };

  const ammoResult: AmmoCraftResult = computeAmmoQuote({
    enhancementBonus: ammoBonus,
    slots: 0,
    quantity: ammoQuantity,
    supplements: ammoSupplements,
  });

  const totalPotionCost = (Object.keys(HEALING_POTIONS) as HealingPotionTier[]).reduce(
    (sum, tier) => sum + (potionQuantities[tier] || 0) * getHealingPotionPrice(tier, ruleset),
    0
  );

  const totalSpecialCost = SPECIAL_CONSUMABLES.reduce(
    (sum, item) => sum + (specialQuantities[item.id] || 0) * item.price,
    0
  );

  const totalConsumablesCost = totalPotionCost + totalSpecialCost;

  return (
    <section className="card" aria-labelledby="ammo-consumables-heading">
      <h2 id="ammo-consumables-heading" className="card-title">
        🏹 Munitions Magiques & Consommables Alchimiques
      </h2>

      <div className="grid-2">
        {/* Colonne Munitions */}
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary-light)', marginBottom: '0.75rem' }}>
            Lots de Munitions Enchantées
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Tarif unitaire : <code>(P_forge(N) / 50) × Q + suppléments</code>
          </p>

          <div className="form-group">
            <label htmlFor={bonusId} className="form-label">
              Bonus d'altération du lot (B : 0 à 4)
            </label>
            <select
              id={bonusId}
              className="form-select"
              value={ammoBonus}
              onChange={(e) => onAmmoBonusChange(Number(e.target.value))}
            >
              <option value={0}>Ordinaire (+0)</option>
              <option value={1}>Magique +1</option>
              <option value={2}>Magique +2</option>
              <option value={3}>Magique +3</option>
              <option value={4}>Magique +4</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor={quantityId} className="form-label">
              Quantité de munitions (Q)
            </label>
            <input
              id={quantityId}
              type="number"
              min={1}
              step={5}
              className="form-input"
              value={ammoQuantity}
              onChange={(e) => onAmmoQuantityChange(Math.max(1, parseInt(e.target.value || '1', 10)))}
            />
          </div>

          <fieldset className="form-group" style={{ border: 'none', padding: 0 }}>
            <legend className="form-label">Options et Façonnages Spéciaux</legend>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={ammoSupplements.includes('INCASSABLE')}
                  onChange={() => toggleSupplement('INCASSABLE')}
                />
                Incassable (+{AMMO_SUPPLEMENT_COSTS.INCASSABLE} po/u)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={ammoSupplements.includes('PERCUTANTE')}
                  onChange={() => toggleSupplement('PERCUTANTE')}
                />
                Percutante (+{AMMO_SUPPLEMENT_COSTS.PERCUTANTE} po/u)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={ammoSupplements.includes('ARGENTEE')}
                  onChange={() => toggleSupplement('ARGENTEE')}
                />
                Argentée (+{AMMO_SUPPLEMENT_COSTS.ARGENTEE} po/u)
              </label>
            </div>
          </fieldset>

          {ammoResult.isValid && ammoResult.ceilingPrice !== undefined ? (
            <div className="quote-summary" style={{ marginTop: '1rem' }}>
              <div className="quote-grid">
                <div className="quote-item">
                  <span className="quote-label">Niveau effectif (N)</span>
                  <span className="quote-value">{ammoResult.effectiveTier}</span>
                </div>
                <div className="quote-item">
                  <span className="quote-label">{`Prix du lot (${ammoQuantity} u.)`}</span>
                  <span className="quote-value-highlight">
                    {`${ammoResult.ceilingPrice.toLocaleString('fr-FR')} po`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onSendToMarket(ammoResult.ceilingPrice!)}
              >
                📊 Négocier le lot au marché
              </button>
            </div>
          ) : (
            <div className="alert alert-error" role="alert">
              Erreur dans les paramètres de munitions.
            </div>
          )}
        </div>

        {/* Colonne Consommables & Potions */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary-light)' }}>
              Potions & Alchimie
            </h3>
            <div>
              <label htmlFor={rulesetId} className="sr-only">Règles D&D</label>
              <select
                id={rulesetId}
                className="form-select"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                value={ruleset}
                onChange={(e) => onRulesetChange(e.target.value as RulesetProfile)}
              >
                <option value="CLASSIC_5E">D&D 5e Classique</option>
                <option value="REVISED_2024">D&D 2024 Révisé</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table" aria-label="Catalogue des potions de soins">
              <thead>
                <tr>
                  <th>Potion</th>
                  <th>Effet</th>
                  <th>Prix unit.</th>
                  <th>Qté</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(HEALING_POTIONS) as HealingPotionTier[]).map((tier) => {
                  const def = HEALING_POTIONS[tier];
                  const price = getHealingPotionPrice(tier, ruleset);
                  return (
                    <tr key={tier}>
                      <td>{def.name}</td>
                      <td><code>{def.diceFormula}</code></td>
                      <td>{`${price.toLocaleString('fr-FR')} po`}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          style={{ width: '60px', padding: '0.2rem 0.4rem', background: 'var(--color-surface-elevated)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                          value={potionQuantities[tier]}
                          aria-label={`Quantité de ${def.name}`}
                          onChange={(e) =>
                            setPotionQuantities({
                              ...potionQuantities,
                              [tier]: Math.max(0, parseInt(e.target.value || '0', 10)),
                            })
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="table-responsive" style={{ marginTop: '1rem' }}>
            <table className="data-table" aria-label="Consommables spéciaux">
              <thead>
                <tr>
                  <th>Consommable</th>
                  <th>Prix</th>
                  <th>Qté</th>
                </tr>
              </thead>
              <tbody>
                {SPECIAL_CONSUMABLES.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{`${item.price.toLocaleString('fr-FR')} po`}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        style={{ width: '60px', padding: '0.2rem 0.4rem', background: 'var(--color-surface-elevated)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                        value={specialQuantities[item.id] || 0}
                        aria-label={`Quantité de ${item.name}`}
                        onChange={(e) =>
                          setSpecialQuantities({
                            ...specialQuantities,
                            [item.id]: Math.max(0, parseInt(e.target.value || '0', 10)),
                          })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="quote-summary" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="quote-label">Total Consommables :</span>
              <span className="quote-value-highlight">
                {`${totalConsumablesCost.toLocaleString('fr-FR')} po`}
              </span>
            </div>
            {totalConsumablesCost > 0 && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.75rem', width: '100%' }}
                onClick={() => onSendToMarket(totalConsumablesCost)}
              >
                📊 Négocier les consommables au marché
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
