import React from 'react';
import {
  calculateForgeCraft,
  calculateUpgrade,
  type ItemCategory,
} from '../domain/forge';
import {
  getEnchantmentsByCategory,
  findEnchantmentById,
} from '../domain/catalog';
import type { AppState } from '../storage';

export interface ForgeCalculatorProps {
  forgeState: AppState['forge'];
  onChange: (newState: AppState['forge']) => void;
  onTransferToMarket: (price: number) => void;
  announce: (message: string) => void;
}

export const ForgeCalculator: React.FC<ForgeCalculatorProps> = ({
  forgeState,
  onChange,
  onTransferToMarket,
  announce,
}) => {
  const {
    category,
    bonus,
    selectedEnchantmentIds,
    isUpgradeMode,
    upgradeInitialBonus,
    upgradeInitialSlots,
    upgradeTargetBonus,
    upgradeTargetSlots,
  } = forgeState;

  // Calcul du devis de création directe en filtrant strictement par catégorie active pour éliminer les slots fantômes
  const selectedEnchantments = selectedEnchantmentIds
    .map((id) => findEnchantmentById(id))
    .filter((e): e is NonNullable<typeof e> => e !== undefined && e.categories.includes(category));

  const totalDirectSlots = selectedEnchantments.reduce((sum, e) => sum + e.cost, 0);

  const craftResult = calculateForgeCraft({
    category,
    bonus,
    slots: totalDirectSlots,
  });

  // Calcul du devis d'amélioration
  const upgradeResult = calculateUpgrade({
    category,
    initialBonus: upgradeInitialBonus,
    initialSlots: upgradeInitialSlots,
    targetBonus: upgradeTargetBonus,
    targetSlots: upgradeTargetSlots,
  });

  // Enchantements disponibles pour la catégorie en cours
  const availableEnchantments = getEnchantmentsByCategory(category);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as ItemCategory;
    const nextBonus = newCategory === 'WONDROUS_ITEM' ? 0 : bonus === 0 ? 1 : bonus;
    // Nettoyer les enchantements incompatibles
    const validIds = selectedEnchantmentIds.filter((id) => {
      const ench = findEnchantmentById(id);
      return ench?.categories.includes(newCategory);
    });
    onChange({
      ...forgeState,
      category: newCategory,
      bonus: nextBonus,
      selectedEnchantmentIds: validIds,
    });
    announce(`Catégorie modifiée : ${newCategory}`);
  };

  const handleBonusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBonus = parseInt(e.target.value, 10);
    onChange({
      ...forgeState,
      bonus: newBonus,
    });
    announce(`Bonus d'altération réglé à +${newBonus}`);
  };

  const toggleEnchantment = (id: string) => {
    const exists = selectedEnchantmentIds.includes(id);
    const nextIds = exists
      ? selectedEnchantmentIds.filter((x) => x !== id)
      : [...selectedEnchantmentIds, id];
    onChange({
      ...forgeState,
      selectedEnchantmentIds: nextIds,
    });
  };

  return (
    <section aria-labelledby="forge-section-title">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 id="forge-section-title" className="section-title" style={{ margin: 0 }}>
          ⚒️ Forge Arcanique &amp; Améliorations
        </h2>
        <div className="ruleset-switch" role="group" aria-label="Mode de forge">
          <button
            type="button"
            className={`ruleset-btn ${!isUpgradeMode ? 'active' : ''}`}
            onClick={() => onChange({ ...forgeState, isUpgradeMode: false })}
            aria-pressed={!isUpgradeMode}
          >
            Création d'équipement
          </button>
          <button
            type="button"
            className={`ruleset-btn ${isUpgradeMode ? 'active' : ''}`}
            onClick={() => onChange({ ...forgeState, isUpgradeMode: true })}
            aria-pressed={isUpgradeMode}
          >
            Amélioration existante
          </button>
        </div>
      </div>

      {!isUpgradeMode ? (
        <div className="section-card">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="forge-category-select">Catégorie d'objet :</label>
              <select
                id="forge-category-select"
                className="form-control"
                value={category}
                onChange={handleCategoryChange}
              >
                <option value="WEAPON">Arme (Coeff: 1.00)</option>
                <option value="ARMOR_SHIELD">Armure / Bouclier (Coeff: 0.85)</option>
                <option value="WONDROUS_ITEM">Autre objet autonome (Coeff: 0.80)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="forge-bonus-select">
                Bonus d'altération nu (B) : {category === 'WONDROUS_ITEM' && '(Bloqué à +0)'}
              </label>
              <select
                id="forge-bonus-select"
                className="form-control"
                value={bonus}
                onChange={handleBonusChange}
                disabled={category === 'WONDROUS_ITEM'}
              >
                <option value={0}>+0</option>
                <option value={1}>+1</option>
                <option value={2}>+2</option>
                <option value={3}>+3</option>
                <option value={4}>+4</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <label style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              {`Enchantements arcaniques disponibles (Capacité max : ${category === 'WONDROUS_ITEM' ? 'Illimitée' : `${bonus} slot(s)`}) :`}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
              {availableEnchantments.map((ench) => {
                const isChecked = selectedEnchantmentIds.includes(ench.id);
                return (
                  <label
                    key={ench.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isChecked ? 'var(--bg-surface-highlight)' : 'var(--bg-surface)',
                      border: `1px solid ${isChecked ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleEnchantment(ench.id)}
                      id={`ench-checkbox-${ench.id}`}
                    />
                    <span>
                      <strong>{ench.name}</strong>{` (${ench.cost} slot${ench.cost > 1 ? 's' : ''})`}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Résultat du devis ou Alerte d'erreur */}
          {!craftResult.isValid ? (
            <div className="alert-box alert-danger" role="alert">
              <span>⚠️</span>
              <div>
                <strong>Erreur de conformité de forge :</strong> {craftResult.message}
                <div style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
                  {`Le devis est bloqué tant que la somme des slots (S=${totalDirectSlots}) dépasse le bonus (B=${bonus}).`}
                </div>
              </div>
            </div>
          ) : (
            <div className="quote-summary" aria-label="Devis de forge arcanique">
              <div className="quote-summary-header">
                <div>
                  <div className="quote-title">Prix Plafond Annoncé Garanti</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Formule : C × 1 000 × N² po
                  </div>
                </div>
                <div className="quote-price">{`${craftResult.priceCeiling.toLocaleString('fr-FR')} po`}</div>
              </div>
              <div className="quote-details">
                <div>{`Bonus nu (B) : `}<strong>{`+${craftResult.bonus}`}</strong></div>
                <div>{`Niveau de base T(B) : `}<strong>{craftResult.baseTier}</strong></div>
                <div>{`Slots utilisés (S) : `}<strong>{craftResult.slotsUsed}</strong></div>
                <div>{`Niveau effectif (N) : `}<strong>{craftResult.effectiveTier}</strong></div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={() => {
                    onTransferToMarket(craftResult.priceCeiling);
                    announce(`Devis de ${craftResult.priceCeiling} po transféré vers le Marché d20.`);
                  }}
                >
                  Négocier au Marché d20 ⚖️
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Module d'amélioration */
        <div className="section-card">
          <p style={{ marginTop: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            L'amélioration d'un objet magique existant est facturée à la stricte différence des prix plafonds :
            <code> P_amélioration = P_plafond(N_final) - P_plafond(N_init)</code>.
          </p>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="upgrade-cat-select">Catégorie :</label>
              <select
                id="upgrade-cat-select"
                className="form-control"
                value={category}
                onChange={handleCategoryChange}
              >
                <option value="WEAPON">Arme</option>
                <option value="ARMOR_SHIELD">Armure / Bouclier</option>
                <option value="WONDROUS_ITEM">Autre objet autonome</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="upgrade-init-bonus">Bonus initial (B_init) :</label>
              <input
                id="upgrade-init-bonus"
                type="number"
                min={0}
                max={4}
                className="form-control"
                value={upgradeInitialBonus}
                onChange={(e) => onChange({ ...forgeState, upgradeInitialBonus: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="upgrade-init-slots">Slots initiaux (S_init) :</label>
              <input
                id="upgrade-init-slots"
                type="number"
                min={0}
                max={4}
                className="form-control"
                value={upgradeInitialSlots}
                onChange={(e) => onChange({ ...forgeState, upgradeInitialSlots: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="upgrade-target-bonus">Bonus cible (B_cible) :</label>
              <input
                id="upgrade-target-bonus"
                type="number"
                min={0}
                max={4}
                className="form-control"
                value={upgradeTargetBonus}
                onChange={(e) => onChange({ ...forgeState, upgradeTargetBonus: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="upgrade-target-slots">Slots cibles (S_cible) :</label>
              <input
                id="upgrade-target-slots"
                type="number"
                min={0}
                max={4}
                className="form-control"
                value={upgradeTargetSlots}
                onChange={(e) => onChange({ ...forgeState, upgradeTargetSlots: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>

          {!upgradeResult.isValid ? (
            <div className="alert-box alert-danger" role="alert" style={{ marginTop: '1rem' }}>
              <span>⚠️</span>
              <div>
                <strong>Amélioration invalide :</strong> {upgradeResult.message}
              </div>
            </div>
          ) : (
            <div className="quote-summary" aria-label="Devis d'amélioration">
              <div className="quote-summary-header">
                <div>
                  <div className="quote-title">Coût d'Amélioration Garanti</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {`Niveau ${upgradeResult.initialTier} (${upgradeResult.initialPriceCeiling.toLocaleString('fr-FR')} po) ➔ Niveau ${upgradeResult.targetTier} (${upgradeResult.targetPriceCeiling.toLocaleString('fr-FR')} po)`}
                  </div>
                </div>
                <div className="quote-price">{`${upgradeResult.upgradeCost.toLocaleString('fr-FR')} po`}</div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={() => {
                    onTransferToMarket(upgradeResult.upgradeCost);
                    announce(`Amélioration de ${upgradeResult.upgradeCost} po transférée vers le Marché d20.`);
                  }}
                >
                  Négocier cette amélioration au Marché d20 ⚖️
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
