export type EnchantmentCategory = 'WEAPON' | 'ARMOR' | 'SHIELD' | 'FOCUS';

export interface EnchantmentDefinition {
  id: string;
  name: string;
  targetCategories: EnchantmentCategory[];
  slotCost: 1 | 2 | 3 | 4;
  description: string;
  loreEffect: string;
}

export type RulesetProfile = 'CLASSIC_5E' | 'REVISED_2024';

export type HealingPotionRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'VERY_RARE';

export interface HealingPotionDefinition {
  id: string;
  rarity: HealingPotionRarity;
  name: string;
  healingFormula: string;
  prices: Record<RulesetProfile, number>;
}

export interface SpecialConsumableDefinition {
  id: string;
  name: string;
  unit: string;
  price: number;
  description: string;
}

export const ENCHANTMENT_CATALOG: EnchantmentDefinition[] = [
  {
    id: 'sournoise',
    name: 'Sournoise',
    targetCategories: ['WEAPON'],
    slotCost: 1,
    description: "Permet d'asséner des frappes insidieuses exploitant la moindre faille.",
    loreEffect: '+1d6 de dégâts de précision si la cible est déstabilisée ou prise par surprise.',
  },
  {
    id: 'frugale',
    name: 'Frugale',
    targetCategories: ['WEAPON'],
    slotCost: 1,
    description: "Canalise l'énergie avec parcimonie, réduisant l'usure magique.",
    loreEffect: "Ne consomme pas de munition ordinaire lorsqu'une frappe touche sa cible.",
  },
  {
    id: 'defense_elementaire',
    name: 'Défense élémentaire',
    targetCategories: ['ARMOR', 'SHIELD'],
    slotCost: 1,
    description: 'Armure imprégnée absorbant les variations thermiques et électriques extrêmes.',
    loreEffect: 'Confère une résistance modulable contre le feu, le froid ou la foudre (au choix au repos court).',
  },
  {
    id: 'gardienne_spectrale',
    name: 'Gardienne spectrale',
    targetCategories: ['ARMOR', 'SHIELD'],
    slotCost: 2,
    description: 'Déploie une aura protectrice dérivant les assauts physiques majeurs.',
    loreEffect: 'Réduit de 3 tous les dégâts contondants, perforants et tranchants subis.',
  },
  {
    id: 'flamboyante',
    name: 'Flamboyante',
    targetCategories: ['WEAPON'],
    slotCost: 2,
    description: 'Une couronne de flammes arcaniques enveloppe la lame au combat.',
    loreEffect: '+1d6 dégâts de feu continus sur chaque coup porté.',
  },
  {
    id: 'focalisation_arcanique',
    name: 'Focalisation arcanique',
    targetCategories: ['FOCUS'],
    slotCost: 2,
    description: 'Harmonise les flux de magie brute traversant le catalysateur.',
    loreEffect: "Augmente de +1 le DD de sauvegarde des sorts lancés par l'utilisateur.",
  },
  {
    id: 'vorpale_attenuee',
    name: 'Vorpale atténuée',
    targetCategories: ['WEAPON'],
    slotCost: 3,
    description: "Tranchant aiguisé à l'échelle atomique capable de sectionner l'essence arcanique.",
    loreEffect: 'Sur un coup critique naturel, inflige un supplément massif de 4d8 dégâts tranchants.',
  },
  {
    id: 'bastion_inviolable',
    name: 'Bastion inviolable',
    targetCategories: ['ARMOR', 'SHIELD'],
    slotCost: 3,
    description: 'Barrière de force presque impénétrable repoussant les assauts magiques.',
    loreEffect: "Avantage permanent aux jets de sauvegarde contre les sorts et effets d'évocation.",
  },
  {
    id: 'maitrise_astrale',
    name: 'Maîtrise astrale',
    targetCategories: ['WEAPON', 'ARMOR', 'FOCUS'],
    slotCost: 4,
    description: 'Connexion directe avec le plan astral offrant un contrôle total du champ de bataille.',
    loreEffect: "Permet de lancer Porte dimensionnelle une fois par aurore sans composante matérielle.",
  },
];

export const HEALING_POTIONS: HealingPotionDefinition[] = [
  {
    id: 'potion_soin_commune',
    rarity: 'COMMON',
    name: 'Potion de soins',
    healingFormula: '2d4 + 2',
    prices: {
      CLASSIC_5E: 50,
      REVISED_2024: 50,
    },
  },
  {
    id: 'potion_soin_peu_commune',
    rarity: 'UNCOMMON',
    name: 'Potion de soins supérieurs',
    healingFormula: '4d4 + 4',
    prices: {
      CLASSIC_5E: 500,
      REVISED_2024: 200,
    },
  },
  {
    id: 'potion_soin_rare',
    rarity: 'RARE',
    name: 'Potion de soins suprêmes',
    healingFormula: '8d4 + 8',
    prices: {
      CLASSIC_5E: 5000,
      REVISED_2024: 2000,
    },
  },
  {
    id: 'potion_soin_tres_rare',
    rarity: 'VERY_RARE',
    name: 'Potion de soins magistrale',
    healingFormula: '10d4 + 20',
    prices: {
      CLASSIC_5E: 50000,
      REVISED_2024: 20000,
    },
  },
];

export const SPECIAL_CONSUMABLES: SpecialConsumableDefinition[] = [
  {
    id: 'poudre_disparition',
    name: 'Poudre de disparition',
    unit: 'dose',
    price: 250,
    description: "Permet de rendre invisible créatures et objets saupoudrés pour une brève durée.",
  },
  {
    id: 'onguent_soin',
    name: 'Onguent de soin',
    unit: 'pot',
    price: 150,
    description: 'Substance médicinale arcanique restaurant 2d8+2 pv ou neutralisant un poison ou une maladie.',
  },
  {
    id: 'colle_universelle',
    name: 'Colle universelle',
    unit: 'flacon',
    price: 2000,
    description: 'Adhésif d’une force légendaire scellant définitivement presque toute matière.',
  },
];

export function getHealingPotionPrice(
  rarity: HealingPotionRarity,
  profile: RulesetProfile = 'CLASSIC_5E'
): number {
  const potion = HEALING_POTIONS.find((p) => p.rarity === rarity);
  if (!potion) {
    throw new Error(`Potion de rareté inconnue : ${rarity}`);
  }
  return potion.prices[profile];
}

export function getEnchantmentById(id: string): EnchantmentDefinition | undefined {
  return ENCHANTMENT_CATALOG.find((e) => e.id === id);
}
