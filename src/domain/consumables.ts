import {
  PotionHealingDefinition,
  PotionRarity,
  SpecialConsumableDefinition,
  ConsumablePricingRuleset,
} from './types';

export const HEALING_POTIONS: PotionHealingDefinition[] = [
  {
    id: 'potion_healing_common',
    rarity: 'common',
    name: 'Potion de soins (Commune)',
    diceFormula: '2d4+2',
    priceStandard: 50,
    priceVariant2024: 50,
  },
  {
    id: 'potion_healing_uncommon',
    rarity: 'uncommon',
    name: 'Potion de soins supérieurs (Peu commune)',
    diceFormula: '4d4+4',
    priceStandard: 500,
    priceVariant2024: 200,
  },
  {
    id: 'potion_healing_rare',
    rarity: 'rare',
    name: 'Potion de soins suprêmes (Rare)',
    diceFormula: '8d4+8',
    priceStandard: 5000,
    priceVariant2024: 2000,
  },
  {
    id: 'potion_healing_very_rare',
    rarity: 'very_rare',
    name: 'Potion de soins suprêmes absolue (Très rare)',
    diceFormula: '10d4+20',
    priceStandard: 50000,
    priceVariant2024: 20000,
  },
];

export const SPECIAL_CONSUMABLES: SpecialConsumableDefinition[] = [
  {
    id: 'dust_of_disappearance',
    name: 'Poudre de disparition',
    description: 'Une pincée de cette fine poussière rend le sujet invisible ainsi que son équipement pendant 2d4 minutes.',
    unitPrice: 250,
    unitLabel: 'dose',
  },
  {
    id: 'keoghtoms_ointment',
    name: 'Onguent de soin',
    description: 'Pâte alchimique capable de guérir les blessures légères, neutraliser le poison ou dissiper une maladie.',
    unitPrice: 150,
    unitLabel: 'pot',
  },
  {
    id: 'sovereign_glue',
    name: 'Colle universelle',
    description: 'Adhésif d’une ténacité absolue liant deux surfaces de manière permanente une fois catalysé.',
    unitPrice: 2000,
    unitLabel: 'flacon',
  },
];

export function getHealingPotionPrice(
  rarity: PotionRarity,
  ruleset: ConsumablePricingRuleset = 'standard_5e'
): number {
  const potion = HEALING_POTIONS.find((p) => p.rarity === rarity);
  if (!potion) {
    throw new Error(`Rareté de potion inconnue : ${rarity}`);
  }
  return ruleset === 'variant_2024' ? potion.priceVariant2024 : potion.priceStandard;
}

export function calculateHealingPotionBatchCost(
  rarity: PotionRarity,
  quantity: number,
  ruleset: ConsumablePricingRuleset = 'standard_5e'
): number {
  const unitPrice = getHealingPotionPrice(rarity, ruleset);
  return unitPrice * Math.max(0, Math.floor(quantity));
}

export function calculateSpecialConsumableCost(id: string, quantity: number): number {
  const consumable = SPECIAL_CONSUMABLES.find((item) => item.id === id);
  if (!consumable) {
    throw new Error(`Consommable spécial introuvable : ${id}`);
  }
  return consumable.unitPrice * Math.max(0, Math.floor(quantity));
}
