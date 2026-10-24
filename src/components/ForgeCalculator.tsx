import React, { useState } from 'react';
import {
  ItemCategory,
  computeCraftQuote,
  computeUpgradeQuote,
  ForgeCraftResult,
  UpgradeResult,
} from '../domain/forge';
import { ENCHANTMENT_CATALOG } from '../domain/catalog';

interface ForgeCalculatorProps {
  onSendToMarket?: (price: number) => void;
  initialCategory?: ItemCategory;
  initialBonus?: number;
  initialEnchantmentIds?: string[];
  onStateChange?: (state: {
    category: ItemCategory;
    baseBonus: number;
    selectedEnchantmentIds: string[];
  }) => void;
}

export const ForgeCalculator: React.FC<ForgeCalculatorProps> = ({
  onSendToMarket,
  initialCategory = 'WEAPON',
  initialBonus = 1,
  initialEnchantmentIds = [],
  onStateChange,
}) => {
  const [mode, setMode] = useState<'NEW_FORGE' | 'UPGRADE'>('NEW_FORGE');
  const [category, setCategory] = useState<ItemCategory>(initialCategory);
  const [baseBonus, setBaseBonus] = useState<number>(initialBonus);
  const [selectedEnchantmentIds, setSelectedEnchantmentIds] = useState<string[]>(
    initialEnchantmentIds
  );

  // Upgrade state
  const [initialUpgradeBonus, setInitialUpgradeBonus] = useState<number>(1);
  const [initialUpgradeSlots, setInitialUpgradeSlots] = useState<number>(0);
  const [targetUpgradeBonus, setTargetUpgradeBonus] = useState<number>(2);
  const [targetUpgradeSlots, setTargetUpgradeSlots] = useState<number>(0);

  const selectedEnchantments = ENCHANTMENT_CATALOG.filter((e) =>
    selectedEnchantmentIds.includes(e.id)
  );

  const totalSelectedSlots = selectedEnchantments.reduce(
    (sum, e) => sum + e.slotCost,
    0
  );

  const updateEnchantmentSelection = (newIds: string[]) => {
    setSelectedEnchantmentIds(newIds);
    onStateChange?.({
      category,
      baseBonus,
      selectedEnchantmentIds: newIds,
    });
  };

  const handleToggleEnchantment = (id: string) => {
    const next = selectedEnchantmentIds.includes(id)
      ? selectedEnchantmentIds.filter((item) => item !== id)
      : [...selectedEnchantmentIds, id];
    updateEnchantmentSelection(next);
  };

  const handleCategoryChange = (cat: ItemCategory) => {
    setCategory(cat);
    const newBonus = cat === 'WONDROUS_ITEM' ? 0 : baseBonus === 0 ? 1 : baseBonus;
    setBaseBonus(newBonus);
    onStateChange?.({
      category: cat,
      baseBonus: newBonus,
      selectedEnchantmentIds,
    });
  };

  const handleBonusChange = (bonus: number) => {
    setBaseBonus(bonus);
    onStateChange?.({
      category,
      baseBonus: bonus,
      selectedEnchantmentIds,
    });
  };

  const craftQuote: ForgeCraftResult = computeCraftQuote({
    category,
    baseBonus,
    slotCost: totalSelectedSlots,
  });

  const upgradeQuote: UpgradeResult = computeUpgradeQuote({
    category,
    initialBaseBonus: initialUpgradeBonus,
    initialSlotCost: initialUpgradeSlots,
    finalBaseBonus: targetUpgradeBonus,
    finalSlotCost: targetUpgradeSlots,
  });

  const isCapacityExceeded =
    category !== 'WONDROUS_ITEM' && totalSelectedSlots > baseBonus;

  return (
    <div className="forge-calculator">
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          type="button"
          className={`btn ${mode === 'NEW_FORGE' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('NEW_FORGE')}
          aria-pressed={mode === 'NEW_FORGE'}
        >
          Forge d'équipement neuf
        </button>
        <button
          type="button"
          className={`btn ${mode === 'UPGRADE' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('UPGRADE')}
          aria-pressed={mode === 'UPGRADE'}
        >
          Amélioration d'objet existant
        </button>
      </div>

      {mode === 'NEW_FORGE' ? (
        <div className="grid-2">
          <div className="card">
            <h2 className="card-title">Configuration de forge</h2>
            <div className="form-group">
              <label htmlFor="category-select" className="form-label">
                Catégorie d'équipement
              </label>
              <select
                id="category-select"
                className="form-select"
                value={category}
                onChange={(e) =>
                  handleCategoryChange(e.target.value as ItemCategory)
                }
              >
                <option value="WEAPON">Arme (Coefficient 1.00)</option>
                <option value="ARMOR_SHIELD">Armure / Bouclier (Coefficient 0.85)</option>
                <option value="WONDROUS_ITEM">
                  Objet autonome permanent (Coefficient 0.80)
                </option>
              </select>
            </div>

            {category !== 'WONDROUS_ITEM' ? (
              <div className="form-group">
                <label htmlFor="bonus-select" className="form-label">
                  Bonus d'altération nu (B)
                </label>
                <select
                  id="bonus-select"
                  className="form-select"
                  value={baseBonus}
                  onChange={(e) => handleBonusChange(Number(e.target.value))}
                >
                  <option value={0}>+0 (Objet non magique)</option>
                  <option value={1}>+1 (Altération mineure)</option>
                  <option value={2}>+2 (Altération remarquable)</option>
                  <option value={3}>+3 (Altération magistrale)</option>
                  <option value={4}>+4 (Altération légendaire)</option>
                </select>
              </div>
            ) : (
              <div className="alert alert-warning">
                <span>
                  Les objets autonomes permanents ont un bonus d'altération fixé à +0.
                  Leur puissance est uniquement régie par les slots d'enchantements.
                </span>
              </div>
            )}

            <div style={{ marginTop: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <span className="form-label">Enchantements additionnels</span>
                <span className="badge badge-arcane">
                  Slots cumulés : {totalSelectedSlots} / {category === 'WONDROUS_ITEM' ? '∞' : baseBonus}
                </span>
              </div>

              <div className="slot-list" role="group" aria-label="Sélection d'enchantements">
                {ENCHANTMENT_CATALOG.map((ench) => {
                  const isChecked = selectedEnchantmentIds.includes(ench.id);
                  return (
                    <label
                      key={ench.id}
                      className="slot-item"
                      style={{
                        borderColor: isChecked ? 'var(--color-gold)' : undefined,
                      }}
                    >
                      <div>
                        <strong>{ench.name}</strong>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {ench.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className="badge badge-gold">{`${ench.slotCost} slot${ench.slotCost > 1 ? 's' : ''}`}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleEnchantment(ench.id)}
                          aria-label={`Enchantement ${ench.name}`}
                        />
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Devis d'Artisanat Arcanique</h2>

            {isCapacityExceeded && (
              <div className="alert alert-danger" role="alert">
                <strong>Intégrité de capacité violée :</strong> La somme des slots consommés
                (S = {totalSelectedSlots}) dépasse le bonus d'altération nu (B = {baseBonus}).
                L'artisan refuse le devis.
              </div>
            )}

            {craftQuote.isValid ? (
              <div>
                <div className="price-display">
                  <span className="price-label">Prix Plafond Garanti</span>
                  <div className="price-number" data-testid="ceiling-price">
                    {`${craftQuote.ceilingPrice.toLocaleString('fr-FR')} po`}
                  </div>
                </div>

                <table className="custom-table" style={{ marginBottom: '1.25rem' }}>
                  <tbody>
                    <tr>
                      <td>Niveau économique de base T(B)</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {craftQuote.baseTier}
                      </td>
                    </tr>
                    <tr>
                      <td>Slots d'enchantement S</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {craftQuote.slotCost}
                      </td>
                    </tr>
                    <tr>
                      <td>Niveau économique effectif N</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-gold)' }}>
                        {craftQuote.effectiveTier}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {onSendToMarket && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => onSendToMarket(craftQuote.ceilingPrice)}
                  >
                    Négocier au Marché (Simulateur d20)
                  </button>
                )}
              </div>
            ) : (
              <div className="alert alert-warning">
                <span>Veuillez configurer un objet valide pour afficher le devis.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid-2">
          <div className="card">
            <h2 className="card-title">Amélioration d'objet</h2>
            <div className="form-group">
              <label htmlFor="upgrade-cat" className="form-label">Catégorie</label>
              <select
                id="upgrade-cat"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
              >
                <option value="WEAPON">Arme</option>
                <option value="ARMOR_SHIELD">Armure / Bouclier</option>
                <option value="WONDROUS_ITEM">Objet autonome</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>État initial</h4>
                <div className="form-group">
                  <label htmlFor="init-bonus" className="form-label">Bonus initial (B)</label>
                  <input
                    id="init-bonus"
                    type="number"
                    min={0}
                    max={4}
                    className="form-input"
                    value={initialUpgradeBonus}
                    onChange={(e) => setInitialUpgradeBonus(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="init-slots" className="form-label">Slots initiaux (S)</label>
                  <input
                    id="init-slots"
                    type="number"
                    min={0}
                    className="form-input"
                    value={initialUpgradeSlots}
                    onChange={(e) => setInitialUpgradeSlots(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-gold)' }}>État cible</h4>
                <div className="form-group">
                  <label htmlFor="target-bonus" className="form-label">Bonus cible (B)</label>
                  <input
                    id="target-bonus"
                    type="number"
                    min={0}
                    max={4}
                    className="form-input"
                    value={targetUpgradeBonus}
                    onChange={(e) => setTargetUpgradeBonus(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="target-slots" className="form-label">Slots cibles (S)</label>
                  <input
                    id="target-slots"
                    type="number"
                    min={0}
                    className="form-input"
                    value={targetUpgradeSlots}
                    onChange={(e) => setTargetUpgradeSlots(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Devis d'Amélioration</h2>
            {upgradeQuote.isValid ? (
              <div>
                <div className="price-display">
                  <span className="price-label">Différence de Plafond</span>
                  <div className="price-number" data-testid="upgrade-price">
                    {`${upgradeQuote.upgradePrice.toLocaleString('fr-FR')} po`}
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Passage du niveau N={upgradeQuote.initialTier} ({upgradeQuote.initialCeilingPrice.toLocaleString('fr-FR')} po) au niveau N={upgradeQuote.finalTier} ({upgradeQuote.finalCeilingPrice.toLocaleString('fr-FR')} po).
                </p>
                {onSendToMarket && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => onSendToMarket(upgradeQuote.upgradePrice)}
                  >
                    Négocier cette amélioration au Marché
                  </button>
                )}
              </div>
            ) : (
              <div className="alert alert-danger">
                <span>
                  {upgradeQuote.error === 'CAPACITY_EXCEEDED'
                    ? "Capacité dépassée : le total de slots S ne peut pas dépasser le bonus d'altération B."
                    : "L'amélioration doit aboutir à un niveau strictement supérieur au niveau d'origine."}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
