import { ItemCategory } from './forge';

export interface EnchantmentDefinition {
  id: string;
  name: string;
  applicableCategories: ItemCategory[];
  slotCost: number;
  description: string;
}

export const ENCHANTMENTS_CATALOG: readonly EnchantmentDefinition[] = [
  {
    id: 'sournoise',
    name: 'Sournoise',
    applicableCategories: ['WEAPON'],
    slotCost: 1,
    description: "Canalise les frappes opportunistes : inflige 1d6 de dégâts arcaniques supplémentaires lors d'une attaque avec avantage.",
  },
  {
    id: 'frugale',
    name: 'Frugale',
    applicableCategories: ['WEAPON'],
    slotCost: 1,
    description: 'Stabilisation énergétique : réduit de moitié la consommation de munitions ou recycle automatiquement les projectiles non brisés.',
  },
  {
    id: 'lame-ardente',
    name: 'Lame Ardente',
    applicableCategories: ['WEAPON'],
    slotCost: 1,
    description: 'Enchantement pyrique : ajoute 1d6 dégâts de feu continus à chaque frappe confirmée.',
  },
  {
    id: 'defense-elementaire',
    name: 'Défense Élémentaire',
    applicableCategories: ['ARMOR_SHIELD'],
    slotCost: 1,
    description: "Trame réfractaire : confère une résistance passive contre un élément primaire choisi lors de l'artisanat.",
  },
  {
    id: 'choc-foudroyant',
    name: 'Choc Foudroyant',
    applicableCategories: ['WEAPON'],
    slotCost: 2,
    description: "Décharge cinétique : inflige 2d6 dégâts de foudre et force une cible de taille moyenne ou inférieure à tester l'équilibre.",
  },
  {
    id: 'gardienne-arcanique',
    name: 'Gardienne Arcanique',
    applicableCategories: ['ARMOR_SHIELD'],
    slotCost: 2,
    description: 'Champ de réverbération : dévie les projectiles magiques et octroie un bonus de parade protecteur.',
  },
  {
    id: 'focalisation-tellurique',
    name: 'Focalisation Tellurique',
    applicableCategories: ['WONDROUS_ITEM'],
    slotCost: 1,
    description: 'Harmonisation avec les courants profonds : stabilise les rituels et renforce la canalisation arcanique de base.',
  },
  {
    id: 'frappe-spectrale',
    name: 'Frappe Spectrale',
    applicableCategories: ['WEAPON'],
    slotCost: 3,
    description: 'Déphasage astral : ignore partiellement les armures matérielles et atteint le plan éthéré sans déperdition.',
  },
  {
    id: 'bastion-inviolable',
    name: 'Bastion Inviolable',
    applicableCategories: ['ARMOR_SHIELD'],
    slotCost: 4,
    description: 'Ancrage de réalité absolue : érige une barrière impénétrable repoussant sorts majeurs et assauts physiques destructeurs.',
  },
  {
    id: 'resonance-astrale',
    name: 'Résonance Astrale',
    applicableCategories: ['WONDROUS_ITEM'],
    slotCost: 3,
    description: 'Ouverture dimensionnelle canalisée : permet le stockage transdimensionnel sécurisé et la communication astrale.',
  },
];

export type RulesetProfile = 'CLASSIC_5E' | 'REVISED_2024';

export type HealingPotionRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'VERY_RARE';

export interface HealingPotionDefinition {
  id: HealingPotionRarity;
  name: string;
  diceFormula: string;
  classic5ePrice: number;
  revised2024Price: number;
  description: string;
}

export const HEALING_POTIONS_CATALOG: readonly HealingPotionDefinition[] = [
  {
    id: 'COMMON',
    name: 'Potion de soins commune',
    diceFormula: '2d4 + 2',
    classic5ePrice: 50,
    revised2024Price: 50,
    description: 'Breuvage basique restaurant instantanément une vitalité légère.',
  },
  {
    id: 'UNCOMMON',
    name: 'Potion de soins supérieure (Peu commune)',
    diceFormula: '4d4 + 4',
    classic5ePrice: 500,
    revised2024Price: 200,
    description: 'Infusion alchimique avancée cicatrisant les blessures de combat régulières.',
  },
  {
    id: 'RARE',
    name: 'Potion de soins suprême (Rare)',
    diceFormula: '8d4 + 8',
    classic5ePrice: 5000,
    revised2024Price: 2000,
    description: 'Élixir puissant refermant les fractures et régénérant les tissus graves.',
  },
  {
    id: 'VERY_RARE',
    name: 'Potion de soins magistrale (Très rare)',
    diceFormula: '10d4 + 20',
    classic5ePrice: 50000,
    revised2024Price: 20000,
    description: 'Quintessence médicinale rétablissant un héros au seuil du trépas.',
  },
];

export interface SpecialConsumableDefinition {
  id: string;
  name: string;
  price: number;
  unit: string;
  description: string;
}

export const SPECIAL_CONSUMABLES: readonly SpecialConsumableDefinition[] = [
  {
    id: 'dust-of-disappearance',
    name: 'Poudre de disparition',
    price: 250,
    unit: 'dose',
    description: 'Poussière fine occultant temporairement la présence visuelle et auditive du sujet.',
  },
  {
    id: 'keoghtoms-ointment',
    name: 'Onguent de soin',
    price: 150,
    unit: 'pot (dose)',
    description: 'Baume apaisant neutralisant les toxines, guérissant les maladies et soignant les plaies.',
  },
  {
    id: 'sovereign-glue',
    name: 'Colle universelle',
    price: 2000,
    unit: 'flacon',
    description: 'Substance d adhérence absolue reliant définitivement deux surfaces solides.',
  },
];

export function getHealingPotionPrice(
  rarity: HealingPotionRarity,
  ruleset: RulesetProfile = 'CLASSIC_5E'
): number {
  const potion = HEALING_POTIONS_CATALOG.find((p) => p.id === rarity);
  if (!potion) {
    throw new Error(`Unknown healing potion rarity: ${rarity}`);
  }
  return ruleset === 'REVISED_2024' ? potion.revised2024Price : potion.classic5ePrice;
}

export function getEnchantmentById(id: string): EnchantmentDefinition | undefined {
  return ENCHANTMENTS_CATALOG.find((item) => item.id === id);
}

export function getEnchantmentsByCategory(category: ItemCategory): EnchantmentDefinition[] {
  return ENCHANTMENTS_CATALOG.filter((item) => item.applicableCategories.includes(category));
}
