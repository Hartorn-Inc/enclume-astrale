import React, { useId } from 'react';
import {
  ItemCategory,
  computeForgeQuote,
  computeUpgrade,
  ForgeCraftResult,
  UpgradeResult,
} from '../domain/forge';
import { ENCHANTMENT_CATALOG } from '../domain/catalog';

export interface ForgeCalculatorProps {
  mode: 'CRAFT' | 'UPGRADE';
  onModeChange: (mode: 'CRAFT' | 'UPGRADE') => void;
  category: ItemCategory;
  onCategoryChange: (cat: ItemCategory) => void;
  enhancementBonus: number;
  onBonusChange: (bonus: number) => void;
  selectedEnchantmentIds: string[];
  onEnchantmentsChange: (ids: string[]) => void;
  // Upgrade mode
  initialBonus: number;
  onInitialBonusChange: (bonus: number) => void;
  initialSlots: number;
  onInitialSlotsChange: (slots: number) => void;
  finalBonus: number;
  onFinalBonusChange: (bonus: number) => void;
  finalSlots: number;
  onFinalSlotsChange: (slots: number) => void;
  // Send to market
  onSendToMarket: (price: number) => void;
}

export const ForgeCalculator: React.FC<ForgeCalculatorProps> = ({
  mode,
  onModeChange,
  category,
  onCategoryChange,
  enhancementBonus,
  onBonusChange,
  selectedEnchantmentIds,
  onEnchantmentsChange,
  initialBonus,
  onInitialBonusChange,
  initialSlots,
  onInitialSlotsChange,
  finalBonus,
  onFinalBonusChange,
  finalSlots,
  onFinalSlotsChange,
  onSendToMarket,
}) => {
  const categoryId = useId();
  const bonusId = useId();
  const initialBonusId = useId();
  const initialSlotsId = useId();
  const finalBonusId = useId();
  const finalSlotsId = useId();

  const categoryEnchantments = ENCHANTMENT_CATALOG.filter((e) =>
    e.applicableCategories.includes(category)
  );

  const totalCraftSlots = selectedEnchantmentIds.reduce((sum, id) => {
    const ench = ENCHANTMENT_CATALOG.find((e) => e.id === id);
    return sum + (ench ? ench.slots : 0);
  }, 0);

  const craftResult: ForgeCraftResult = computeForgeQuote({
    category,
    enhancementBonus: category === 'WONDROUS_ITEM' ? 0 : enhancementBonus,
    slots: totalCraftSlots,
  });

  const upgradeResult: UpgradeResult = computeUpgrade({
    category,
    initialEnhancementBonus: category === 'WONDROUS_ITEM' ? 0 : initialBonus,
    initialSlots,
    finalEnhancementBonus: category === 'WONDROUS_ITEM' ? 0 : finalBonus,
    finalSlots,
  });

  const toggleEnchantment = (id: string) => {
    if (selectedEnchantmentIds.includes(id)) {
      onEnchantmentsChange(selectedEnchantmentIds.filter((item) => item !== id));
    } else {
      onEnchantmentsChange([...selectedEnchantmentIds, id]);
    }
  };

  return (
    <section className="card" aria-labelledby="forge-calculator-heading">
      <div className="app-header-top">
        <h2 id="forge-calculator-heading" className="card-title">
          ⚒️ Calculateur de Forge & Amélioration
        </h2>
        <div role="group" aria-label="Mode de calcul de forge" style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'CRAFT' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onModeChange('CRAFT')}
            aria-pressed={mode === 'CRAFT'}
          >
            Forge Nouvelle
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'UPGRADE' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onModeChange('UPGRADE')}
            aria-pressed={mode === 'UPGRADE'}
          >
            Amélioration
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor={categoryId} className="form-label">
          Catégorie d'objet
        </label>
        <select
          id={categoryId}
          className="form-select"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as ItemCategory)}
        >
          <option value="WEAPON">Arme (Coeff 1.00)</option>
          <option value="ARMOR_SHIELD">Armure / Bouclier (Coeff 0.85)</option>
          <option value="WONDROUS_ITEM">Autre objet autonome permanent (Coeff 0.80)</option>
        </select>
      </div>

      {mode === 'CRAFT' ? (
        <div className="craft-mode">
          {category !== 'WONDROUS_ITEM' && (
            <div className="form-group">
              <label htmlFor={bonusId} className="form-label">
                Bonus d'altération (B : 0 à 4)
              </label>
              <select
                id={bonusId}
                className="form-select"
                value={enhancementBonus}
                onChange={(e) => onBonusChange(Number(e.target.value))}
              >
                <option value={0}>Bonus +0</option>
                <option value={1}>Bonus +1</option>
                <option value={2}>Bonus +2</option>
                <option value={3}>Bonus +3</option>
                <option value={4}>Bonus +4</option>
              </select>
            </div>
          )}

          <fieldset className="form-group" style={{ border: 'none', padding: 0 }}>
            <legend className="form-label">
              Enchantements arcaniques (Slots consommés : {totalCraftSlots}
              {category !== 'WONDROUS_ITEM' ? ` / Max ${enhancementBonus}` : ''})
            </legend>

            {categoryEnchantments.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Aucun enchantement spécifique pour cette catégorie.</p>
            ) : (
              <div className="enchantment-list">
                {categoryEnchantments.map((ench) => {
                  const isChecked = selectedEnchantmentIds.includes(ench.id);
                  return (
                    <label key={ench.id} className="enchantment-item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleEnchantment(ench.id)}
                        style={{ marginTop: '0.2rem' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: isChecked ? 'var(--color-primary-light)' : 'inherit' }}>
                            {ench.name}
                          </strong>
                          <span className="enchantment-badge">{`${ench.slots} ${ench.slots > 1 ? 'slots' : 'slot'}`}</span>
                        </div>
                        <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                          {ench.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>

          {category !== 'WONDROUS_ITEM' && totalCraftSlots > enhancementBonus && (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span>
              <div>
                <strong>Capacité arcanique dépassée :</strong> La somme des slots ({totalCraftSlots}) ne peut excéder le bonus d'altération (+{enhancementBonus}). Devis bloqué.
              </div>
            </div>
          )}

          {craftResult.isValid && craftResult.ceilingPrice !== undefined ? (
            <div className="quote-summary">
              <div className="quote-grid">
                <div className="quote-item">
                  <span className="quote-label">Niveau effectif (N)</span>
                  <span className="quote-value">{craftResult.effectiveTier}</span>
                </div>
                <div className="quote-item">
                  <span className="quote-label">Base économique T(B)</span>
                  <span className="quote-value">{craftResult.baseTier}</span>
                </div>
                <div className="quote-item">
                  <span className="quote-label">Prix Plafond Annoncé</span>
                  <span className="quote-value-highlight">{`${craftResult.ceilingPrice.toLocaleString('fr-FR')} po`}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onSendToMarket(craftResult.ceilingPrice!)}
              >
                📊 Simuler la négociation marché (d20)
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="upgrade-mode">
          <div className="grid-2">
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-primary-light)' }}>
                État Initial
              </h3>
              {category !== 'WONDROUS_ITEM' && (
                <div className="form-group">
                  <label htmlFor={initialBonusId} className="form-label">
                    Bonus initial (B_init)
                  </label>
                  <select
                    id={initialBonusId}
                    className="form-select"
                    value={initialBonus}
                    onChange={(e) => onInitialBonusChange(Number(e.target.value))}
                  >
                    <option value={0}>Bonus +0</option>
                    <option value={1}>Bonus +1</option>
                    <option value={2}>Bonus +2</option>
                    <option value={3}>Bonus +3</option>
                    <option value={4}>Bonus +4</option>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label htmlFor={initialSlotsId} className="form-label">
                  Slots initiaux (S_init)
                </label>
                <input
                  id={initialSlotsId}
                  type="number"
                  min={0}
                  max={category === 'WONDROUS_ITEM' ? 10 : initialBonus}
                  className="form-input"
                  value={initialSlots}
                  onChange={(e) => onInitialSlotsChange(Math.max(0, parseInt(e.target.value || '0', 10)))}
                />
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-primary-light)' }}>
                État Final Souhaité
              </h3>
              {category !== 'WONDROUS_ITEM' && (
                <div className="form-group">
                  <label htmlFor={finalBonusId} className="form-label">
                    Bonus final (B_final)
                  </label>
                  <select
                    id={finalBonusId}
                    className="form-select"
                    value={finalBonus}
                    onChange={(e) => onFinalBonusChange(Number(e.target.value))}
                  >
                    <option value={0}>Bonus +0</option>
                    <option value={1}>Bonus +1</option>
                    <option value={2}>Bonus +2</option>
                    <option value={3}>Bonus +3</option>
                    <option value={4}>Bonus +4</option>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label htmlFor={finalSlotsId} className="form-label">
                  Slots finaux (S_final)
                </label>
                <input
                  id={finalSlotsId}
                  type="number"
                  min={0}
                  max={category === 'WONDROUS_ITEM' ? 10 : finalBonus}
                  className="form-input"
                  value={finalSlots}
                  onChange={(e) => onFinalSlotsChange(Math.max(0, parseInt(e.target.value || '0', 10)))}
                />
              </div>
            </div>
          </div>

          {!upgradeResult.isValid && (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span>
              <div>
                <strong>Erreur d'amélioration :</strong>{' '}
                {upgradeResult.error === 'CAPACITY_EXCEEDED'
                  ? 'Capacité arcanique dépassée (Slots > Bonus).'
                  : upgradeResult.error === 'FINAL_TIER_NOT_GREATER'
                  ? "Le niveau économique final doit être strictement supérieur à l'état initial."
                  : 'Configuration invalide.'}
              </div>
            </div>
          )}

          {upgradeResult.isValid && upgradeResult.upgradePrice !== undefined && (
            <div className="quote-summary">
              <div className="quote-grid">
                <div className="quote-item">
                  <span className="quote-label">Plafond Initial</span>
                  <span className="quote-value">{`${upgradeResult.initialCeilingPrice?.toLocaleString('fr-FR')} po`}</span>
                </div>
                <div className="quote-item">
                  <span className="quote-label">Plafond Final</span>
                  <span className="quote-value">{`${upgradeResult.finalCeilingPrice?.toLocaleString('fr-FR')} po`}</span>
                </div>
                <div className="quote-item">
                  <span className="quote-label">Coût Amélioration</span>
                  <span className="quote-value-highlight">{`${upgradeResult.upgradePrice.toLocaleString('fr-FR')} po`}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onSendToMarket(upgradeResult.upgradePrice!)}
              >
                📊 Simuler la négociation marché (d20)
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
