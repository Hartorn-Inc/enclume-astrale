import React from 'react';
import {
  ItemCategory,
  ForgeCraftResult,
  UpgradeResult,
  calculateForgeQuote,
  calculateUpgradeQuote,
  computeEffectiveTier,
} from '../domain/forge';
import { ENCHANTMENTS_CATALOG, EnchantmentDefinition } from '../domain/catalog';

export interface ForgeState {
  mode: 'creation' | 'upgrade';
  category: ItemCategory;
  enhancementBonus: number;
  selectedEnchantmentIds: string[];
  upgradeInitialBonus: number;
  upgradeInitialEnchantmentIds: string[];
  upgradeFinalBonus: number;
  upgradeFinalEnchantmentIds: string[];
}

interface ForgeCalculatorProps {
  state: ForgeState;
  onChange: (updater: (prev: ForgeState) => ForgeState) => void;
  onSendToMarket: (price: number) => void;
}

export const ForgeCalculator: React.FC<ForgeCalculatorProps> = ({
  state,
  onChange,
  onSendToMarket,
}) => {
  const isCreation = state.mode === 'creation';

  // Applicable enchantments for current category
  const categoryEnchantments = ENCHANTMENTS_CATALOG.filter((e) =>
    e.applicableCategories.includes(state.category)
  );

  // Calculate creation quote
  const selectedCreationEnchantments = categoryEnchantments.filter((e) =>
    state.selectedEnchantmentIds.includes(e.id)
  );
  const totalCreationSlots = selectedCreationEnchantments.reduce((acc, curr) => acc + curr.slotCost, 0);

  const creationQuote: ForgeCraftResult = calculateForgeQuote({
    category: state.category,
    enhancementBonus: state.category === 'WONDROUS_ITEM' ? 0 : state.enhancementBonus,
    slots: totalCreationSlots,
  });

  // Calculate upgrade quote
  const initialEnchantments = categoryEnchantments.filter((e) =>
    state.upgradeInitialEnchantmentIds.includes(e.id)
  );
  const finalEnchantments = categoryEnchantments.filter((e) =>
    state.upgradeFinalEnchantmentIds.includes(e.id)
  );

  const initialSlots = initialEnchantments.reduce((acc, curr) => acc + curr.slotCost, 0);
  const finalSlots = finalEnchantments.reduce((acc, curr) => acc + curr.slotCost, 0);

  const upgradeQuote: UpgradeResult = calculateUpgradeQuote({
    category: state.category,
    initialEnhancementBonus: state.category === 'WONDROUS_ITEM' ? 0 : state.upgradeInitialBonus,
    initialSlots,
    finalEnhancementBonus: state.category === 'WONDROUS_ITEM' ? 0 : state.upgradeFinalBonus,
    finalSlots,
  });

  const toggleCreationEnchantment = (id: string) => {
    onChange((prev) => {
      const exists = prev.selectedEnchantmentIds.includes(id);
      const nextIds = exists
        ? prev.selectedEnchantmentIds.filter((item) => item !== id)
        : [...prev.selectedEnchantmentIds, id];
      return { ...prev, selectedEnchantmentIds: nextIds };
    });
  };

  const toggleUpgradeInitialEnchantment = (id: string) => {
    onChange((prev) => {
      const exists = prev.upgradeInitialEnchantmentIds.includes(id);
      const nextIds = exists
        ? prev.upgradeInitialEnchantmentIds.filter((item) => item !== id)
        : [...prev.upgradeInitialEnchantmentIds, id];
      return { ...prev, upgradeInitialEnchantmentIds: nextIds };
    });
  };

  const toggleUpgradeFinalEnchantment = (id: string) => {
    onChange((prev) => {
      const exists = prev.upgradeFinalEnchantmentIds.includes(id);
      const nextIds = exists
        ? prev.upgradeFinalEnchantmentIds.filter((item) => item !== id)
        : [...prev.upgradeFinalEnchantmentIds, id];
      return { ...prev, upgradeFinalEnchantmentIds: nextIds };
    });
  };

  return (
    <section aria-labelledby="forge-heading" className="card">
      <header className="card-header">
        <h2 id="forge-heading" className="card-title">
          Calculateur d&apos;Artisanat &amp; Forge Magique
        </h2>
        <p className="card-description">
          Formule canonique P = C × 1000 × N² po avec vérification stricte de capacité S ≤ B.
        </p>
      </header>

      {/* Sub tabs: Creation vs Upgrade */}
      <div className="sub-tabs" role="tablist" aria-label="Modes de calcul">
        <button
          type="button"
          role="tab"
          aria-selected={isCreation}
          className={`tab-btn ${isCreation ? 'active' : ''}`}
          onClick={() => onChange((prev) => ({ ...prev, mode: 'creation' }))}
        >
          Création neuve
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isCreation}
          className={`tab-btn ${!isCreation ? 'active' : ''}`}
          onClick={() => onChange((prev) => ({ ...prev, mode: 'upgrade' }))}
        >
          Amélioration d&apos;objet existant
        </button>
      </div>

      {/* Common Category Selection */}
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="category-select">Catégorie d&apos;objet</label>
          <select
            id="category-select"
            className="form-control"
            value={state.category}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                category: e.target.value as ItemCategory,
                selectedEnchantmentIds: [],
                upgradeInitialEnchantmentIds: [],
                upgradeFinalEnchantmentIds: [],
              }))
            }
          >
            <option value="WEAPON">Arme (Coeff. 1.00)</option>
            <option value="ARMOR_SHIELD">Armure / Bouclier (Coeff. 0.85)</option>
            <option value="WONDROUS_ITEM">Objet autonome permanent (Coeff. 0.80)</option>
          </select>
        </div>
      </div>

      {isCreation ? (
        <div className="creation-section">
          <div className="form-grid">
            {state.category !== 'WONDROUS_ITEM' ? (
              <div className="form-group">
                <label htmlFor="bonus-select">Bonus d&apos;altération nu (B)</label>
                <select
                  id="bonus-select"
                  className="form-control"
                  value={state.enhancementBonus}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      enhancementBonus: parseInt(e.target.value, 10),
                    }))
                  }
                >
                  <option value={0}>+0 (Neutre)</option>
                  <option value={1}>+1</option>
                  <option value={2}>+2</option>
                  <option value={3}>+3</option>
                  <option value={4}>+4</option>
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="wondrous-info">Bonus d&apos;altération</label>
                <input
                  id="wondrous-info"
                  type="text"
                  className="form-control"
                  value="Sans bonus nu (B = 0)"
                  disabled
                />
              </div>
            )}
          </div>

          <fieldset className="card" style={{ background: 'var(--bg-main)' }}>
            <legend style={{ fontWeight: 600, color: 'var(--accent)', padding: '0 0.5rem' }}>
              Enchantements ({totalCreationSlots} slot{totalCreationSlots > 1 ? 's' : ''} consommé{totalCreationSlots > 1 ? 's' : ''})
            </legend>
            {categoryEnchantments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Aucun enchantement spécifique catalogué pour cette catégorie.</p>
            ) : (
              <div className="enchantment-list">
                {categoryEnchantments.map((ench: EnchantmentDefinition) => {
                  const isChecked = state.selectedEnchantmentIds.includes(ench.id);
                  return (
                    <label key={ench.id} className="enchantment-item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCreationEnchantment(ench.id)}
                        aria-label={`Enchantement ${ench.name} (${ench.slotCost} slot)`}
                      />
                      <div className="enchantment-info">
                        <span className="enchantment-name">
                          {ench.name}
                          <span className="badge badge-gold">{ench.slotCost} slot{ench.slotCost > 1 ? 's' : ''}</span>
                        </span>
                        <span className="enchantment-desc">{ench.description}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>

          {/* Error Banner when Capacity Exceeded */}
          {!creationQuote.isValid && creationQuote.error === 'CAPACITY_EXCEEDED' && (
            <div className="alert alert-danger" role="alert">
              <strong>Capacité magique dépassée :</strong> La somme des slots consommés ({totalCreationSlots})
              dépasse le bonus d&apos;altération nu (+{state.enhancementBonus}). Le devis est bloqué.
            </div>
          )}

          {!creationQuote.isValid && creationQuote.error !== 'CAPACITY_EXCEEDED' && (
            <div className="alert alert-danger" role="alert">
              <strong>Configuration invalide :</strong> {creationQuote.error}
            </div>
          )}

          {/* Quote display if valid */}
          {creationQuote.isValid && (
            <div className="quote-summary" aria-label="Devis de forge calculé">
              <div>
                <span className="detail-label">Plafond de devis garanti</span>
                <div className="quote-price-value">
                  {creationQuote.ceilingPrice.toLocaleString('fr-FR')}
                  <span className="quote-price-unit">po</span>
                </div>
              </div>
              <div className="quote-details">
                <div className="detail-item">
                  <span className="detail-label">Niveau effectif (N)</span>
                  <span className="detail-value">{creationQuote.effectiveTier}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Coefficient (C)</span>
                  <span className="detail-value">{creationQuote.categoryCoefficient}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Slots utilisés</span>
                  <span className="detail-value">{totalCreationSlots} / {state.category === 'WONDROUS_ITEM' ? '∞' : state.enhancementBonus}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onSendToMarket(creationQuote.ceilingPrice)}
              >
                Envoyer au Marché d20
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="upgrade-section">
          <div className="form-grid">
            <div className="card" style={{ background: 'var(--bg-main)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--accent)' }}>État initial de l&apos;objet</h3>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="initial-bonus-select">Bonus d&apos;altération initial</label>
                <select
                  id="initial-bonus-select"
                  className="form-control"
                  value={state.upgradeInitialBonus}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      upgradeInitialBonus: parseInt(e.target.value, 10),
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
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Enchantements initiaux ({initialSlots} slots)
              </p>
              <div className="enchantment-list">
                {categoryEnchantments.map((ench) => (
                  <label key={`init-${ench.id}`} className="enchantment-item">
                    <input
                      type="checkbox"
                      checked={state.upgradeInitialEnchantmentIds.includes(ench.id)}
                      onChange={() => toggleUpgradeInitialEnchantment(ench.id)}
                    />
                    <span style={{ fontSize: '0.85rem' }}>{ench.name} ({ench.slotCost})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="card" style={{ background: 'var(--bg-main)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--accent)' }}>État final souhaité</h3>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="final-bonus-select">Bonus d&apos;altération final</label>
                <select
                  id="final-bonus-select"
                  className="form-control"
                  value={state.upgradeFinalBonus}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      upgradeFinalBonus: parseInt(e.target.value, 10),
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
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Enchantements finaux ({finalSlots} slots)
              </p>
              <div className="enchantment-list">
                {categoryEnchantments.map((ench) => (
                  <label key={`final-${ench.id}`} className="enchantment-item">
                    <input
                      type="checkbox"
                      checked={state.upgradeFinalEnchantmentIds.includes(ench.id)}
                      onChange={() => toggleUpgradeFinalEnchantment(ench.id)}
                    />
                    <span style={{ fontSize: '0.85rem' }}>{ench.name} ({ench.slotCost})</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {!upgradeQuote.isValid && (
            <div className="alert alert-danger" role="alert">
              <strong>Erreur d&apos;amélioration :</strong>{' '}
              {upgradeQuote.error === 'CAPACITY_EXCEEDED'
                ? 'Capacité magique dépassée sur l&apos;état initial ou final (S > B).'
                : upgradeQuote.error === 'INVALID_UPGRADE_TIER'
                ? 'Le palier final doit être strictement supérieur au palier initial (N_final > N_init).'
                : upgradeQuote.error}
            </div>
          )}

          {upgradeQuote.isValid && (
            <div className="quote-summary" aria-label="Devis d'amélioration calculé">
              <div>
                <span className="detail-label">Coût net de l&apos;amélioration</span>
                <div className="quote-price-value">
                  {upgradeQuote.upgradeCost.toLocaleString('fr-FR')}
                  <span className="quote-price-unit">po</span>
                </div>
              </div>
              <div className="quote-details">
                <div className="detail-item">
                  <span className="detail-label">Devis initial</span>
                  <span className="detail-value">{upgradeQuote.initialCeilingPrice.toLocaleString('fr-FR')} po</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Devis final</span>
                  <span className="detail-value">{upgradeQuote.finalCeilingPrice.toLocaleString('fr-FR')} po</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onSendToMarket(upgradeQuote.upgradeCost)}
              >
                Envoyer au Marché d20
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
