import React, { useState } from 'react';
import {
  AlterationBonus,
  ItemCategory,
  ForgeQuote,
} from '../domain/types';
import {
  calculateForgeQuote,
  calculateUpgradeCost,
} from '../domain/forge';
import { ENCHANTMENT_CATALOG } from '../domain/catalog';

interface ForgeCalculatorProps {
  onSaveQuote?: (quote: ForgeQuote, label: string) => void;
}

export const ForgeCalculator: React.FC<ForgeCalculatorProps> = ({ onSaveQuote }) => {
  const [mode, setMode] = useState<'new' | 'upgrade'>('new');
  const [category, setCategory] = useState<ItemCategory>('weapon');
  const [alterationBonus, setAlterationBonus] = useState<AlterationBonus>(1);
  const [selectedEnchantmentIds, setSelectedEnchantmentIds] = useState<string[]>([]);

  // Champs pour amélioration d'objet
  const [upgradeInitBonus, setUpgradeInitBonus] = useState<AlterationBonus>(1);
  const [upgradeInitSlots, setUpgradeInitSlots] = useState<number>(0);
  const [upgradeFinalBonus, setUpgradeFinalBonus] = useState<AlterationBonus>(2);
  const [upgradeFinalSlots, setUpgradeFinalSlots] = useState<number>(0);

  // Enchantements compatibles avec la catégorie sélectionnée
  const availableEnchantments = ENCHANTMENT_CATALOG.filter((e) =>
    e.compatibleCategories.includes(category)
  );

  const selectedEffects = ENCHANTMENT_CATALOG.filter((e) =>
    selectedEnchantmentIds.includes(e.id)
  );
  const slotSum = selectedEffects.reduce((sum, e) => sum + e.slotCost, 0);

  // Garde-fou temps réel S <= B pour les armes
  const isCapacityViolated = category === 'weapon' && slotSum > alterationBonus;

  // Calcul du devis actuel en mode nouveau
  const quoteResult = isCapacityViolated
    ? null
    : calculateForgeQuote({
        category,
        alterationBonus,
        slots: selectedEffects,
      });

  // Calcul devis amélioration
  const upgradeResult =
    mode === 'upgrade'
      ? calculateUpgradeCost(
          category,
          { alterationBonus: upgradeInitBonus, slots: upgradeInitSlots },
          { alterationBonus: upgradeFinalBonus, slots: upgradeFinalSlots }
        )
      : null;

  const toggleEnchantment = (id: string) => {
    setSelectedEnchantmentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (quoteResult && quoteResult.success && onSaveQuote) {
      const catName =
        category === 'weapon'
          ? 'Arme'
          : category === 'armor_shield'
          ? 'Armure / Bouclier'
          : 'Objet Autonome';
      const label = `${catName} +${alterationBonus} (${selectedEffects.map((e) => e.name).join(', ') || 'Nue'})`;
      onSaveQuote(quoteResult.data, label);
    }
  };

  return (
    <section className="grid-cols-2" aria-labelledby="forge-calc-title">
      <div className="card">
        <h2 id="forge-calc-title" className="card-title">
          Atelier d'Artisanat & Économie de Forge
        </h2>

        <div className="form-group">
          <label className="form-label" htmlFor="forge-mode-select">
            Mode d'artisanat
          </label>
          <select
            id="forge-mode-select"
            className="form-select"
            value={mode}
            onChange={(e) => setMode(e.target.value as 'new' | 'upgrade')}
          >
            <option value="new">Création d'un nouvel objet magique</option>
            <option value="upgrade">Amélioration d'un équipement existant</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="category-select">
            Catégorie d'objet magique
          </label>
          <select
            id="category-select"
            className="form-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as ItemCategory);
              setSelectedEnchantmentIds([]);
            }}
          >
            <option value="weapon">Arme (Coefficient 1.00)</option>
            <option value="armor_shield">Armure / Bouclier (Coefficient 0.85)</option>
            <option value="standalone">Autre objet autonome permanent (Coefficient 0.80)</option>
          </select>
        </div>

        {mode === 'new' ? (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="bonus-select">
                Bonus d'altération nu (B)
              </label>
              <select
                id="bonus-select"
                className="form-select"
                value={alterationBonus}
                onChange={(e) =>
                  setAlterationBonus(Number(e.target.value) as AlterationBonus)
                }
              >
                <option value={0}>+0 (Objet sans bonus d'altération)</option>
                <option value={1}>+1 (Niveau arcanique de base T=1)</option>
                <option value={2}>+2 (Niveau arcanique de base T=3)</option>
                <option value={3}>+3 (Niveau arcanique de base T=6)</option>
                <option value={4}>+4 (Niveau arcanique de base T=10)</option>
              </select>
              <p className="form-hint">
                Pour une arme, la capacité maximale d'effets en slots est strictement bornée par B (S &le; B).
              </p>
            </div>

            <div className="form-group">
              <span className="form-label">Enchantements applicables (Slots S)</span>
              <div className="checkbox-group" role="group" aria-label="Enchantements">
                {availableEnchantments.map((ench) => {
                  const isChecked = selectedEnchantmentIds.includes(ench.id);
                  return (
                    <label key={ench.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleEnchantment(ench.id)}
                        aria-label={`${ench.name} (+${ench.slotCost} slots)`}
                      />
                      <div>
                        <strong>{ench.name}</strong> (+{ench.slotCost} slot{ench.slotCost > 1 ? 's' : ''})
                        <div className="form-hint">{ench.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="upgrade-form">
            <div className="form-group">
              <label className="form-label" htmlFor="upgrade-init-bonus">
                Niveau initial : Bonus d'altération B
              </label>
              <select
                id="upgrade-init-bonus"
                className="form-select"
                value={upgradeInitBonus}
                onChange={(e) =>
                  setUpgradeInitBonus(Number(e.target.value) as AlterationBonus)
                }
              >
                <option value={0}>+0</option>
                <option value={1}>+1</option>
                <option value={2}>+2</option>
                <option value={3}>+3</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="upgrade-init-slots">
                Niveau initial : Somme des slots (S)
              </label>
              <input
                id="upgrade-init-slots"
                type="number"
                className="form-input"
                min={0}
                max={4}
                value={upgradeInitSlots}
                onChange={(e) => setUpgradeInitSlots(Math.max(0, Number(e.target.value)))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="upgrade-final-bonus">
                Niveau ciblé : Bonus d'altération B
              </label>
              <select
                id="upgrade-final-bonus"
                className="form-select"
                value={upgradeFinalBonus}
                onChange={(e) =>
                  setUpgradeFinalBonus(Number(e.target.value) as AlterationBonus)
                }
              >
                <option value={1}>+1</option>
                <option value={2}>+2</option>
                <option value={3}>+3</option>
                <option value={4}>+4</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="upgrade-final-slots">
                Niveau ciblé : Somme des slots (S)
              </label>
              <input
                id="upgrade-final-slots"
                type="number"
                className="form-input"
                min={0}
                max={4}
                value={upgradeFinalSlots}
                onChange={(e) => setUpgradeFinalSlots(Math.max(0, Number(e.target.value)))}
              />
            </div>
          </div>
        )}
      </div>

      <div className="card quote-display" aria-live="polite">
        <h3 className="card-title">Devis d'Artisanat & Spécifications</h3>

        {mode === 'new' && isCapacityViolated && (
          <div className="alert alert-danger" role="alert" data-testid="capacity-error">
            <strong>Intégrité arcanique violée (S &le; B) :</strong> Une arme dotée d'un bonus +{alterationBonus}
            ne peut pas contenir plus de {alterationBonus} slot(s). Actuellement : {slotSum} slots.
            Aucun devis ne peut être produit.
          </div>
        )}

        {mode === 'new' && quoteResult && quoteResult.success && (
          <div className="quote-summary" data-testid="forge-quote-success">
            <div>Plafond de Devis Garanti :</div>
            <div className="quote-price">{quoteResult.data.ceilingPrice.toLocaleString('fr-FR')} po</div>

            <div className="quote-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Base T(B)</span>
                <span className="breakdown-value">{quoteResult.data.baseLevel}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Slots (S)</span>
                <span className="breakdown-value">{quoteResult.data.slotSum}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Niveau effectif (N)</span>
                <span className="breakdown-value">{quoteResult.data.effectiveLevel}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Coefficient (C)</span>
                <span className="breakdown-value">{quoteResult.data.coefficient.toFixed(2)}</span>
              </div>
            </div>

            {onSaveQuote && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: '1.25rem', width: '100%' }}
                onClick={handleSave}
              >
                Mémoriser ce devis dans le registre
              </button>
            )}
          </div>
        )}

        {mode === 'upgrade' && upgradeResult && (
          <div>
            {!upgradeResult.success ? (
              <div className="alert alert-danger" role="alert" data-testid="upgrade-error">
                {upgradeResult.error.message}
              </div>
            ) : (
              <div className="quote-summary" data-testid="upgrade-quote-success">
                <div>Coût d'Amélioration Arcanique :</div>
                <div className="quote-price">{upgradeResult.upgradeCost.toLocaleString('fr-FR')} po</div>
                <p className="form-hint" style={{ marginTop: '0.5rem' }}>
                  Différence de valeur entre l'état initial ({upgradeResult.initialQuote.ceilingPrice.toLocaleString('fr-FR')} po) et l'état parachevé ({upgradeResult.finalQuote.ceilingPrice.toLocaleString('fr-FR')} po).
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
