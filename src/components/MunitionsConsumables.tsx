import React, { useState } from 'react';
import {
  AlterationBonus,
  ConsumablePricingRuleset,
  MunitionSupplement,
  PotionRarity,
} from '../domain/types';
import {
  calculateAmmunitionCeiling,
  MUNITION_SUPPLEMENT_PRICES,
} from '../domain/forge';
import {
  HEALING_POTIONS,
  SPECIAL_CONSUMABLES,
  calculateHealingPotionBatchCost,
  calculateSpecialConsumableCost,
} from '../domain/consumables';

export const MunitionsConsumables: React.FC = () => {
  const [ruleset, setRuleset] = useState<ConsumablePricingRuleset>('standard_5e');
  
  // Munitions
  const [munitionBonus, setMunitionBonus] = useState<AlterationBonus>(1);
  const [munitionQuantity, setMunitionQuantity] = useState<number>(10);
  const [selectedSupplements, setSelectedSupplements] = useState<MunitionSupplement[]>([]);

  // Potions & Consommables
  const [selectedPotionRarity, setSelectedPotionRarity] = useState<PotionRarity>('uncommon');
  const [potionQuantity, setPotionQuantity] = useState<number>(1);
  const [selectedSpecialId, setSelectedSpecialId] = useState<string>('dust_of_disappearance');
  const [specialQuantity, setSpecialQuantity] = useState<number>(1);

  const munitionResult = calculateAmmunitionCeiling({
    alterationBonus: munitionBonus,
    quantity: munitionQuantity,
    supplements: selectedSupplements,
  });

  const potionCost = calculateHealingPotionBatchCost(
    selectedPotionRarity,
    potionQuantity,
    ruleset
  );

  const specialCost = calculateSpecialConsumableCost(selectedSpecialId, specialQuantity);

  const toggleSupplement = (supp: MunitionSupplement) => {
    setSelectedSupplements((prev) =>
      prev.includes(supp) ? prev.filter((s) => s !== supp) : [...prev, supp]
    );
  };

  return (
    <section aria-labelledby="munitions-consumables-title">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 id="munitions-consumables-title" className="card-title" style={{ margin: 0, border: 'none' }}>
          Munitions & Consommables Alchimiques
        </h2>
        <div className="ruleset-toggle" role="radiogroup" aria-label="Règles de tarification des soins">
          <button
            type="button"
            className={`ruleset-btn ${ruleset === 'standard_5e' ? 'active' : ''}`}
            onClick={() => setRuleset('standard_5e')}
            role="radio"
            aria-checked={ruleset === 'standard_5e'}
          >
            D&D 5e Standard
          </button>
          <button
            type="button"
            className={`ruleset-btn ${ruleset === 'variant_2024' ? 'active' : ''}`}
            onClick={() => setRuleset('variant_2024')}
            role="radio"
            aria-checked={ruleset === 'variant_2024'}
          >
            Révision 2024
          </button>
        </div>
      </div>

      <div className="grid-cols-2">
        {/* Colonne Munitions */}
        <div className="card">
          <h3 className="card-title">Forge de Munitions Enchantées</h3>
          <p className="form-hint" style={{ marginBottom: '1rem' }}>
            Formule de lot : P_plafond = (P_forge_arme / 50) &times; Quantité + Suppléments unitaires.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="munition-bonus-select">
              Bonus d'altération de la munition
            </label>
            <select
              id="munition-bonus-select"
              className="form-select"
              value={munitionBonus}
              onChange={(e) => setMunitionBonus(Number(e.target.value) as AlterationBonus)}
            >
              <option value={1}>+1 (Base 1 000 po)</option>
              <option value={2}>+2 (Base 9 000 po)</option>
              <option value={3}>+3 (Base 36 000 po)</option>
              <option value={4}>+4 (Base 100 000 po)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="munition-qty-input">
              Taille du lot (Nombre de munitions)
            </label>
            <input
              id="munition-qty-input"
              type="number"
              className="form-input"
              min={1}
              value={munitionQuantity}
              onChange={(e) => setMunitionQuantity(Math.max(1, Number(e.target.value)))}
            />
          </div>

          <div className="form-group">
            <span className="form-label">Propriétés et revêtements d'appoint</span>
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedSupplements.includes('unbreakable')}
                  onChange={() => toggleSupplement('unbreakable')}
                />
                <span>Incassable (+{MUNITION_SUPPLEMENT_PRICES.unbreakable} po / unité)</span>
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedSupplements.includes('impact')}
                  onChange={() => toggleSupplement('impact')}
                />
                <span>Percutante (+{MUNITION_SUPPLEMENT_PRICES.impact} po / unité)</span>
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedSupplements.includes('silvered')}
                  onChange={() => toggleSupplement('silvered')}
                />
                <span>Argentée (+{MUNITION_SUPPLEMENT_PRICES.silvered} po / unité)</span>
              </label>
            </div>
          </div>

          {munitionResult.success && (
            <div className="quote-summary" data-testid="munition-quote-result">
              <div>Plafond du lot de munitions :</div>
              <div className="quote-price">
                {munitionResult.data.ceilingPrice.toLocaleString('fr-FR')} po
              </div>
              <div className="quote-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-label">Prix unitaire</span>
                  <span className="breakdown-value">
                    {munitionResult.data.unitCeilingPrice + munitionResult.data.supplementCostPerUnit} po
                  </span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Quantité</span>
                  <span className="breakdown-value">{munitionResult.data.quantity}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne Consommables Alchimiques */}
        <div className="card">
          <h3 className="card-title">Alchimie & Dispensaire de Soins</h3>

          <div className="form-group">
            <label className="form-label" htmlFor="potion-select">
              Potion de soins (Règle active : {ruleset === 'variant_2024' ? '2024' : 'Standard 5e'})
            </label>
            <select
              id="potion-select"
              className="form-select"
              value={selectedPotionRarity}
              onChange={(e) => setSelectedPotionRarity(e.target.value as PotionRarity)}
            >
              {HEALING_POTIONS.map((pot) => {
                const unitPrice = ruleset === 'variant_2024' ? pot.priceVariant2024 : pot.priceStandard;
                return (
                  <option key={pot.id} value={pot.rarity}>
                    {pot.name} [{pot.diceFormula}] — {unitPrice} po
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="potion-qty-input">
              Nombre de potions
            </label>
            <input
              id="potion-qty-input"
              type="number"
              className="form-input"
              min={1}
              value={potionQuantity}
              onChange={(e) => setPotionQuantity(Math.max(1, Number(e.target.value)))}
            />
          </div>

          <div className="quote-summary" style={{ marginBottom: '1.5rem' }} data-testid="potion-quote-result">
            <div>Coût du lot de potions :</div>
            <div className="quote-price">{potionCost.toLocaleString('fr-FR')} po</div>
          </div>

          <h4 className="card-title" style={{ fontSize: '1.1rem' }}>Préparations Alchimiques Spéciales</h4>

          <div className="form-group">
            <label className="form-label" htmlFor="special-select">
              Préparation arcanique
            </label>
            <select
              id="special-select"
              className="form-select"
              value={selectedSpecialId}
              onChange={(e) => setSelectedSpecialId(e.target.value)}
            >
              {SPECIAL_CONSUMABLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.unitPrice} po / {item.unitLabel})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="special-qty-input">
              Quantité
            </label>
            <input
              id="special-qty-input"
              type="number"
              className="form-input"
              min={1}
              value={specialQuantity}
              onChange={(e) => setSpecialQuantity(Math.max(1, Number(e.target.value)))}
            />
          </div>

          <div className="quote-summary" data-testid="special-quote-result">
            <div>Coût total :</div>
            <div className="quote-price">{specialCost.toLocaleString('fr-FR')} po</div>
          </div>
        </div>
      </div>
    </section>
  );
};
