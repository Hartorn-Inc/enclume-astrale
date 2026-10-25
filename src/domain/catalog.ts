import { ItemCategory } from './forge';

export interface Enchantment {
  id: string;
  name: string;
  applicableCategories: ItemCategory[];
  slots: 1 | 2 | 3 | 4;
  description: string;
}

export type RulesetProfile = 'CLASSIC_5E' | 'REVISED_2024';

export type HealingPotionTier = 'COMMON' | 'UNCOMMON' | 'RARE' | 'VERY_RARE';

export interface HealingPotionDefinition {
  tier: HealingPotionTier;
  name: string;
  diceFormula: string;
  priceClassic: number;
  price2024: number;
}

export interface SpecialConsumable {
  id: string;
  name: string;
  price: number;
  description: string;
}

export const ENCHANTMENT_CATALOG: readonly Enchantment[] = [
  {
    id: 'sournoise',
    name: 'Sournoise',
    applicableCategories: ['WEAPON'],
    slots: 1,
    description: 'Canalise les frappes furtives, infligeant un surcroît de dégâts perçants lors des attaques avec avantage.',
  },
  {
    id: 'frugale',
    name: 'Frugale',
    applicableCategories: ['WEAPON'],
    slots: 1,
    description: 'Harmonise les réserves cinétiques pour préserver les munitions et réduire la consommation arcanique.',
  },
  {
    id: 'tranchant-spectral',
    name: 'Tranchant spectral',
    applicableCategories: ['WEAPON'],
    slots: 2,
    description: 'La lame ignore une partie de l armure physique en manifestant une résonance éthérée.',
  },
  {
    id: 'frappe-foudroyante',
    name: 'Frappe foudroyante',
    applicableCategories: ['WEAPON'],
    slots: 3,
    description: 'Déclenche une décharge de foudre arcanique sur un coup critique, aveuglant la cible.',
  },
  {
    id: 'vorpale-astrale',
    name: 'Vorpale astrale',
    applicableCategories: ['WEAPON'],
    slots: 4,
    description: 'Une énergie de distorsion pure capable de sectionner les liens d essence vitale.',
  },
  {
    id: 'rempart-etanche',
    name: 'Rempart étanche',
    applicableCategories: ['ARMOR_SHIELD'],
    slots: 1,
    description: 'Scelle les jointures de la défense contre les émanations gazeuses, acides et aquatiques.',
  },
  {
    id: 'defense-elementaire',
    name: 'Défense élémentaire',
    applicableCategories: ['ARMOR_SHIELD'],
    slots: 2,
    description: 'Confère une résistance modulable aux attaques d énergie élémentaire (feu, froid ou électricité).',
  },
  {
    id: 'garde-arcanique',
    name: 'Garde arcanique',
    applicableCategories: ['ARMOR_SHIELD'],
    slots: 3,
    description: 'Génère une barrière prismatique absorbant les projectiles magiques et sorts de force.',
  },
  {
    id: 'fortresse-inebranlable',
    name: 'Forteresse inébranlable',
    applicableCategories: ['ARMOR_SHIELD'],
    slots: 4,
    description: 'Ancre le porteur au plan matériel, immunisant contre les renversements et téléportations forcées.',
  },
  {
    id: 'focalisateur-dimensionnel',
    name: 'Focalisateur dimensionnel',
    applicableCategories: ['WONDROUS_ITEM'],
    slots: 2,
    description: 'Élargit la portée et la précision des manipulations magiques autonomes de l objet.',
  },
  {
    id: 'condensateur-ethere',
    name: 'Condensateur éthéré',
    applicableCategories: ['WONDROUS_ITEM'],
    slots: 3,
    description: 'Stocke une charge d énergie arcanique renouvelable pour alimenter les effets autonomes.',
  },
];

export const HEALING_POTIONS: Record<HealingPotionTier, HealingPotionDefinition> = {
  COMMON: {
    tier: 'COMMON',
    name: 'Potion de soins standard',
    diceFormula: '2d4+2',
    priceClassic: 50,
    price2024: 50,
  },
  UNCOMMON: {
    tier: 'UNCOMMON',
    name: 'Potion de soins supérieure',
    diceFormula: '4d4+4',
    priceClassic: 500,
    price2024: 200,
  },
  RARE: {
    tier: 'RARE',
    name: 'Potion de soins suprême',
    diceFormula: '8d4+8',
    priceClassic: 5000,
    price2024: 2000,
  },
  VERY_RARE: {
    tier: 'VERY_RARE',
    name: 'Potion de soins magistrale',
    diceFormula: '10d4+20',
    priceClassic: 50000,
    price2024: 20000,
  },
};

export const SPECIAL_CONSUMABLES: readonly SpecialConsumable[] = [
  {
    id: 'poudre-disparition',
    name: 'Poudre de disparition',
    price: 250,
    description: 'Une pincée rend les cibles affectées invisibles pendant une brève période.',
  },
  {
    id: 'onguent-soin',
    name: 'Onguent de soin',
    price: 150,
    description: 'Pâte alchimique régénératrice pour neutraliser les toxines et refermer les plaies.',
  },
  {
    id: 'colle-universelle',
    name: 'Colle universelle',
    price: 2000,
    description: 'Adhésif d une puissance arcanique irréversible capable de souder tout matériau.',
  },
];

export function getEnchantmentById(id: string): Enchantment | undefined {
  return ENCHANTMENT_CATALOG.find((ench) => ench.id === id);
}

export function getEnchantmentsByCategory(category: ItemCategory): Enchantment[] {
  return ENCHANTMENT_CATALOG.filter((ench) => ench.applicableCategories.includes(category));
}

export function getHealingPotionPrice(tier: HealingPotionTier, ruleset: RulesetProfile): number {
  const potion = HEALING_POTIONS[tier];
  if (!potion) {
    throw new Error(`Tier de potion inconnu : ${tier}`);
  }
  return ruleset === 'REVISED_2024' ? potion.price2024 : potion.priceClassic;
}

export function getSpecialConsumableById(id: string): SpecialConsumable | undefined {
  return SPECIAL_CONSUMABLES.find((item) => item.id === id);
}
