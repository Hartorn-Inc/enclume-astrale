import { EnchantmentSlotEffect, ItemCategory } from './types';

export const ENCHANTMENT_CATALOG: EnchantmentSlotEffect[] = [
  {
    id: 'sneak_strike',
    name: 'Sournoise',
    slotCost: 1,
    compatibleCategories: ['weapon'],
    description: 'Canalise l’énergie dans les failles de posture de la cible, octroyant un bonus arcanique aux frappes d’opportunité.',
    prerequisiteBonus: 1,
  },
  {
    id: 'frugal_edge',
    name: 'Frugale',
    slotCost: 1,
    compatibleCategories: ['weapon'],
    description: 'Stabilisation de l’enchantement réduisant la perte d’énergie et facilitant le réarmement magique.',
    prerequisiteBonus: 1,
  },
  {
    id: 'ardent_flame',
    name: 'Flamboyante',
    slotCost: 1,
    compatibleCategories: ['weapon'],
    description: 'L’arme s’enveloppe de flammes astrales ardentes infligeant des dégâts de feu continus aux créatures touchées.',
    prerequisiteBonus: 1,
  },
  {
    id: 'thunderous_shock',
    name: 'Tonitruante',
    slotCost: 2,
    compatibleCategories: ['weapon'],
    description: 'Déclenche une déflagration sonique traumatique lors d’un coup critique ou d’une frappe chargée.',
    prerequisiteBonus: 2,
  },
  {
    id: 'guardian_ward',
    name: 'Protectrice',
    slotCost: 1,
    compatibleCategories: ['weapon', 'armor_shield'],
    description: 'Permet de transférer une fraction de l’énergie de forge vers la posture défensive du porteur.',
    prerequisiteBonus: 1,
  },
  {
    id: 'elemental_resistance',
    name: 'Résistance Élémentaire',
    slotCost: 1,
    compatibleCategories: ['armor_shield'],
    description: 'Harmonise la matrice de l’armure pour absorber un type d’énergie destructrice spécifique (feu, froid, foudre).',
    prerequisiteBonus: 1,
  },
  {
    id: 'fortification_astral',
    name: 'Fortification Astrale',
    slotCost: 2,
    compatibleCategories: ['armor_shield'],
    description: 'Renforce le cœur de l’armure pour dévier ou absorber l’impact des coups critiques dévastateurs.',
    prerequisiteBonus: 2,
  },
  {
    id: 'ethereal_step',
    name: 'Passe-Murailles Éthéré',
    slotCost: 2,
    compatibleCategories: ['standalone'],
    description: 'Dispositif autonome accordant de brèves incursions dans le plan éthéré pour franchir les obstacles matériels.',
    prerequisiteBonus: 0,
  },
  {
    id: 'spell_storing',
    name: 'Réceptacle Arcanique',
    slotCost: 2,
    compatibleCategories: ['weapon', 'armor_shield', 'standalone'],
    description: 'Enchâssis cristallin capable de stocker jusqu’à un sortilège de niveau 3 utilisable à volonté.',
    prerequisiteBonus: 2,
  },
];

export function getEnchantmentsByCategory(category: ItemCategory): EnchantmentSlotEffect[] {
  return ENCHANTMENT_CATALOG.filter((ench) => ench.compatibleCategories.includes(category));
}

export function getEnchantmentById(id: string): EnchantmentSlotEffect | undefined {
  return ENCHANTMENT_CATALOG.find((ench) => ench.id === id);
}
