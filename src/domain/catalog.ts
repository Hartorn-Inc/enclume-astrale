import { ItemCategory } from './forge';

export interface Enchantment {
  id: string;
  name: string;
  applicableCategories: ItemCategory[];
  slotCost: number;
  description: string;
  summary: string;
}

export const ENCHANTMENTS_CATALOG: Enchantment[] = [
  {
    id: 'sneak-strike',
    name: 'Sournoise',
    applicableCategories: ['WEAPON'],
    slotCost: 1,
    description: "Canalise l'énergie cinétique pour infliger 1d6 dégâts perforants additionnels en cas d'avantage à l'attaque.",
    summary: '+1d6 aux dégâts avec avantage'
  },
  {
    id: 'frugal-edge',
    name: 'Frugale',
    applicableCategories: ['WEAPON'],
    slotCost: 1,
    description: "Alliage arcanique auto-affûtant qui réduit l'usure et accorde une relance sur un 1 naturel aux dégâts.",
    summary: 'Relance des 1 aux dégâts'
  },
  {
    id: 'elemental-burst',
    name: 'Frappe Élémentaire',
    applicableCategories: ['WEAPON'],
    slotCost: 2,
    description: "Enveloppe la lame d'un feu ou d'une foudre stable ajoutant 2d6 dégâts élémentaires par impact.",
    summary: '+2d6 dégâts élémentaires'
  },
  {
    id: 'aberrant-bane',
    name: "Fléau d'Aberration",
    applicableCategories: ['WEAPON'],
    slotCost: 1,
    description: "Vibre à l'approche des entités psioniques et confère un bonus critique accru contre le plan lointain.",
    summary: 'Critique étendu contre aberrations'
  },
  {
    id: 'vorpal-focus',
    name: 'Tranchant Astral',
    applicableCategories: ['WEAPON'],
    slotCost: 3,
    description: "Lame planaire capable de scinder la trame protectrice adverse lors d'un coup critique.",
    summary: 'Effet tranchant planaire sur critique'
  },
  {
    id: 'elemental-ward',
    name: 'Défense Élémentaire',
    applicableCategories: ['ARMOR_SHIELD'],
    slotCost: 1,
    description: "Tissage arcanique absorbant conférant une résistance passive à un élément choisi au forgeage.",
    summary: 'Résistance à un élément choisi'
  },
  {
    id: 'aegis-sentinel',
    name: 'Égide du Gardien',
    applicableCategories: ['ARMOR_SHIELD'],
    slotCost: 2,
    description: "Active un bouclier cinétique réactif réduisant de moitié les dégâts de zone une fois par repos court.",
    summary: 'Réduction de dégâts de zone'
  },
  {
    id: 'adamantine-fortress',
    name: 'Blindage Impénétrable',
    applicableCategories: ['ARMOR_SHIELD'],
    slotCost: 3,
    description: "Structure renforcée annulant totalement l'impact critique adverse transformé en coup normal.",
    summary: 'Immunité aux coups critiques'
  },
  {
    id: 'arcane-reservoir',
    name: "Résonance d'Arcane",
    applicableCategories: ['WONDROUS_ITEM'],
    slotCost: 1,
    description: 'Matrice de focalisation permettant de stocker et restituer une charge de sort mineure.',
    summary: 'Focalisateur et stockage arcanique mineur'
  },
  {
    id: 'spatial-anchor',
    name: 'Ancrage Spatial',
    applicableCategories: ['WONDROUS_ITEM'],
    slotCost: 2,
    description: 'Champ gravitique stabilisateur immunisant le porteur aux téléportations hostiles forcées.',
    summary: 'Protection contre déplacements forcés'
  }
];

export type HealingPotionRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'VERY_RARE';
export type RulesetVariant = 'CLASSIC_5E' | 'REVISED_2024';

export interface PotionDefinition {
  rarity: HealingPotionRarity;
  name: string;
  diceFormula: string;
  priceClassic: number;
  priceRevised2024: number;
  description: string;
}

export const HEALING_POTIONS: Record<HealingPotionRarity, PotionDefinition> = {
  COMMON: {
    rarity: 'COMMON',
    name: 'Potion de soins (Commune)',
    diceFormula: '2d4+2',
    priceClassic: 50,
    priceRevised2024: 50,
    description: 'Fiole de nectar rougeoyant restaurant 2d4+2 points de vie.'
  },
  UNCOMMON: {
    rarity: 'UNCOMMON',
    name: 'Potion de soins supérieurs (Peu commune)',
    diceFormula: '4d4+4',
    priceClassic: 500,
    priceRevised2024: 200,
    description: 'Infusion alchimique enrichie restaurant 4d4+4 points de vie.'
  },
  RARE: {
    rarity: 'RARE',
    name: 'Potion de soins suprêmes (Rare)',
    diceFormula: '8d4+8',
    priceClassic: 5000,
    priceRevised2024: 2000,
    description: 'Élixir distillé sous pleine lune restaurant 8d4+8 points de vie.'
  },
  VERY_RARE: {
    rarity: 'VERY_RARE',
    name: 'Potion de guérison magistrale (Très rare)',
    diceFormula: '10d4+20',
    priceClassic: 50000,
    priceRevised2024: 20000,
    description: 'Quintessence de régénération restaurant 10d4+20 points de vie.'
  }
};

export function getHealingPotionPrice(
  rarity: HealingPotionRarity,
  variant: RulesetVariant = 'CLASSIC_5E'
): number {
  const potion = HEALING_POTIONS[rarity];
  if (!potion) {
    throw new Error(`Rareté de potion inconnue : ${rarity}`);
  }
  return variant === 'REVISED_2024' ? potion.priceRevised2024 : potion.priceClassic;
}

export interface SpecialConsumable {
  id: string;
  name: string;
  price: number;
  unit: string;
  description: string;
}

export const SPECIAL_CONSUMABLES: SpecialConsumable[] = [
  {
    id: 'dust-of-disappearance',
    name: 'Poudre de disparition',
    price: 250,
    unit: 'dose',
    description: 'Poussière argentée rendant indétectable visuellement pendant une courte durée.'
  },
  {
    id: 'restorative-ointment',
    name: 'Onguent de soin',
    price: 150,
    unit: 'pot',
    description: 'Baume alchimique polyvalent soignant les blessures ou purifiant le poison.'
  },
  {
    id: 'sovereign-glue',
    name: 'Colle universelle',
    price: 2000,
    unit: 'flacon',
    description: 'Substance visqueuse assurant une adhésion définitive et quasi incassable.'
  }
];
