import type { ItemCategory } from './forge';

export type RulesetVersion = '5e_2014' | '5e_2024';

export type HealingPotionRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'VERY_RARE';

export interface EnchantmentDefinition {
  id: string;
  name: string;
  cost: number;
  categories: readonly ItemCategory[];
  description: string;
}

export interface HealingPotionDefinition {
  id: string;
  name: string;
  rarity: HealingPotionRarity;
  diceRoll: string;
  prices: Readonly<Record<RulesetVersion, number>>;
  description: string;
}

export interface SpecialConsumableDefinition {
  id: string;
  name: string;
  price: number;
  unit: string;
  description: string;
}

export const ENCHANTMENT_CATALOG: readonly EnchantmentDefinition[] = [
  {
    id: 'sournoise',
    name: 'Sournoise',
    cost: 1,
    categories: ['WEAPON'],
    description: "Augmente la létalité des frappes d'opportunité et d'embuscade (+1d6 dégâts en cas d'avantage ou de surprise).",
  },
  {
    id: 'frugale',
    name: 'Frugale',
    cost: 1,
    categories: ['WEAPON', 'WONDROUS_ITEM'],
    description: "Préserve l'énergie arcanique interne en réduisant la dépense de charges ou de munitions consommées.",
  },
  {
    id: 'defense_elementaire',
    name: 'Défense élémentaire',
    cost: 1,
    categories: ['ARMOR_SHIELD'],
    description: "Atténue les flux d'énergie destructrice (résistance modulable feu, froid, foudre ou acide).",
  },
  {
    id: 'gardienne',
    name: 'Gardienne',
    cost: 1,
    categories: ['ARMOR_SHIELD'],
    description: "Renforce la posture défensive en offrant un bonus de parade réactif contre les coups critiques.",
  },
  {
    id: 'frappe_spectrale',
    name: 'Frappe spectrale',
    cost: 1,
    categories: ['WEAPON'],
    description: "Permet de toucher sans pénalité les créatures éthérées, immatérielles ou protégées par distorsion phasique.",
  },
  {
    id: 'ardente',
    name: 'Ardente',
    cost: 2,
    categories: ['WEAPON'],
    description: "Embrase la surface d'un feu arcanique persistant infligeant +1d6 dégâts de feu continus.",
  },
  {
    id: 'sanctifiee',
    name: 'Sanctifiée',
    cost: 2,
    categories: ['WEAPON', 'ARMOR_SHIELD'],
    description: "Bénie par les puissances de l'ordre, repoussant les abominations d'outre-monde et contrant la nécrose.",
  },
  {
    id: 'aceree',
    name: 'Acérée',
    cost: 2,
    categories: ['WEAPON'],
    description: "Aiguise le fil de l'arme jusqu'à un alignement parfait, étendant la plage de menace critique.",
  },
  {
    id: 'bastion_arcanique',
    name: 'Bastion arcanique',
    cost: 2,
    categories: ['ARMOR_SHIELD'],
    description: "Déploie une matrice de dissipation résonante absorbant les sorts offensifs de faible magnitude.",
  },
  {
    id: 'vorpaline',
    name: 'Vorpaline',
    cost: 3,
    categories: ['WEAPON'],
    description: "Sur un coup critique naturel dévastateur, inflige des traumatismes majeurs pouvant sectionner net un membre vulnérable.",
  },
  {
    id: 'reflexion_egide',
    name: "Réflexion d'égide",
    cost: 3,
    categories: ['ARMOR_SHIELD'],
    description: "Détourne les projectiles magiques et faisceaux ciblés vers leur émetteur d'origine lors d'une parade.",
  },
  {
    id: 'ancrage_astral',
    name: 'Ancrage astral',
    cost: 4,
    categories: ['WEAPON', 'ARMOR_SHIELD', 'WONDROUS_ITEM'],
    description: "Verrouille les lignes arcaniques dimensionnelles, neutralisant les sauts téléportés hostiles dans la zone.",
  },
];

export const HEALING_POTIONS_CATALOG: readonly HealingPotionDefinition[] = [
  {
    id: 'potion_healing_common',
    name: 'Potion de soins (Commune)',
    rarity: 'COMMON',
    diceRoll: '2d4+2',
    prices: {
      '5e_2014': 50,
      '5e_2024': 50,
    },
    description: 'Breuvage revigorant restaurant 2d4+2 points de vie lorsqu’il est ingéré.',
  },
  {
    id: 'potion_healing_uncommon',
    name: 'Potion de soins supérieurs (Peu commune)',
    rarity: 'UNCOMMON',
    diceRoll: '4d4+4',
    prices: {
      '5e_2014': 500,
      '5e_2024': 200,
    },
    description: 'Élixir thérapeutique restaurant 4d4+4 points de vie lorsqu’il est ingéré.',
  },
  {
    id: 'potion_healing_rare',
    name: 'Potion de soins majeurs (Rare)',
    rarity: 'RARE',
    diceRoll: '8d4+8',
    prices: {
      '5e_2014': 5000,
      '5e_2024': 2000,
    },
    description: 'Philtre puissant restaurant 8d4+8 points de vie lorsqu’il est ingéré.',
  },
  {
    id: 'potion_healing_very_rare',
    name: 'Potion de soins suprêmes (Très rare)',
    rarity: 'VERY_RARE',
    diceRoll: '10d4+20',
    prices: {
      '5e_2014': 50000,
      '5e_2024': 20000,
    },
    description: 'Panacée arcanique suprême restaurant 10d4+20 points de vie lorsqu’elle est ingérée.',
  },
];

export const SPECIAL_CONSUMABLES_CATALOG: readonly SpecialConsumableDefinition[] = [
  {
    id: 'dust_of_disappearance',
    name: 'Poudre de disparition',
    price: 250,
    unit: 'dose',
    description: 'Poudre cristalline rendant les cibles saupoudrées totalement invisibles durant 2d4 minutes.',
  },
  {
    id: 'keoghtom_ointment',
    name: 'Onguent de soin',
    price: 150,
    unit: 'dose',
    description: 'Substance médicinale arcanique restaurant 1d8+2 points de vie ou neutralisant poisons et maladies.',
  },
  {
    id: 'sovereign_glue',
    name: 'Colle universelle',
    price: 2000,
    unit: 'flacon',
    description: 'Adhésif alchimique indissoluble soudant définitivement toute surface de contact.',
  },
];

export function findEnchantmentById(id: string): EnchantmentDefinition | undefined {
  return ENCHANTMENT_CATALOG.find((e) => e.id === id);
}

export function getEnchantmentsByCategory(category: ItemCategory): EnchantmentDefinition[] {
  return ENCHANTMENT_CATALOG.filter((e) => e.categories.includes(category));
}

export function getHealingPotionPrice(
  rarity: HealingPotionRarity,
  ruleset: RulesetVersion = '5e_2014'
): number {
  const potion = HEALING_POTIONS_CATALOG.find((p) => p.rarity === rarity);
  if (!potion) {
    throw new RangeError(`Rareté de potion de soins inconnue : ${rarity}`);
  }
  const price = potion.prices[ruleset];
  if (price === undefined) {
    throw new RangeError(`Profil de règles inconnu : ${ruleset}`);
  }
  return price;
}

export function getHealingPotion(rarity: HealingPotionRarity): HealingPotionDefinition | undefined {
  return HEALING_POTIONS_CATALOG.find((p) => p.rarity === rarity);
}
