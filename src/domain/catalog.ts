import { type ItemCategory, calculateForgeQuote } from "./forge.js";

export type EnchantmentRarity = "common" | "uncommon" | "rare" | "very_rare" | "legendary";

export interface EnchantmentProperty {
  readonly id: string;
  readonly name: string;
  readonly category: "weapon" | "armor_or_shield";
  readonly slotCost: number;
  readonly rarity: EnchantmentRarity;
  readonly summary: string;
  readonly technicalRules: string;
}

export interface AutonomousMagicItem {
  readonly id: string;
  readonly name: string;
  readonly category: "autonomous_permanent";
  readonly effectiveLevel: number;
  readonly rarity: EnchantmentRarity;
  readonly ceilingPrice: number;
  readonly summary: string;
  readonly technicalRules: string;
}

export type CatalogEntry =
  | (EnchantmentProperty & { readonly kind: "enchantment" })
  | (AutonomousMagicItem & { readonly kind: "autonomous_item" });

export const ENCHANTMENT_PROPERTIES: readonly EnchantmentProperty[] = [
  {
    id: "frugale",
    name: "Frugale",
    category: "weapon",
    slotCost: 1,
    rarity: "uncommon",
    summary: "Régénère ou conserve les projectiles tirés.",
    technicalRules:
      "Toute munition non-magique tirée est automatiquement régénérée dans le carquois après résolution de l'attaque. Équilibrage maison D&D 5e fixé à 1 slot."
  },
  {
    id: "sournoise",
    name: "Sournoise",
    category: "weapon",
    slotCost: 1,
    rarity: "uncommon",
    summary: "Augmente les dégâts lors des attaques avec avantage ou surprise.",
    technicalRules:
      "Ajoute 1d6 points de dégâts supplémentaires aux attaques réussies bénéficiant de l'avantage ou de l'effet d'attaque sournoise. Équilibrage maison D&D 5e fixé à 1 slot."
  },
  {
    id: "flammes_stellaires",
    name: "Flammes stellaires",
    category: "weapon",
    slotCost: 1,
    rarity: "rare",
    summary: "Inflige des dégâts de feu arcanique supplémentaires.",
    technicalRules:
      "L'arme s'embrase sur commande d'une flamme blanche astrale, infligeant 1d6 points de dégâts de feu supplémentaires à chaque coup au but."
  },
  {
    id: "givre_astral",
    name: "Givre astral",
    category: "weapon",
    slotCost: 1,
    rarity: "rare",
    summary: "Inflige des dégâts de froid et ralentit la cible.",
    technicalRules:
      "Ajoute 1d6 dégâts de froid ; sur un coup critique, la vitesse de déplacement de la cible est réduite de 3 mètres jusqu'au début de son prochain tour."
  },
  {
    id: "foudre_celeste",
    name: "Foudre céleste",
    category: "weapon",
    slotCost: 1,
    rarity: "rare",
    summary: "Décharge des arcs électriques sur la cible.",
    technicalRules:
      "Ajoute 1d6 dégâts d'électricité à chaque impact réussi. Les cibles portant une armure métallique subissent un désavantage sur leurs sauvegardes associées."
  },
  {
    id: "vorpalite",
    name: "Vorpalité",
    category: "weapon",
    slotCost: 2,
    rarity: "legendary",
    summary: "Porte des coups tranchants décapitants dévastateurs.",
    technicalRules:
      "Sur un 20 naturel au jet d'attaque contre une créature pourvue d'une tête, la créature est décapitée si sa taille le permet ou subit 6d8 dégâts tranchants supplémentaires."
  },
  {
    id: "dansante",
    name: "Dansante",
    category: "weapon",
    slotCost: 2,
    rarity: "very_rare",
    summary: "L'arme vole et combat de façon autonome.",
    technicalRules:
      "Par une action bonus, l'arme est projetée dans les airs et attaque indépendamment une cible à portée pendant 4 rounds consécutifs avant de revenir dans la main."
  },
  {
    id: "fortification",
    name: "Fortification",
    category: "armor_or_shield",
    slotCost: 1,
    rarity: "rare",
    summary: "Immunise le porteur contre les coups critiques.",
    technicalRules:
      "Tout coup critique porté contre le porteur de l'armure ou du bouclier est automatiquement requalifié en coup normal sans dégâts doublés."
  },
  {
    id: "ombre",
    name: "Ombre arcanique",
    category: "armor_or_shield",
    slotCost: 1,
    rarity: "uncommon",
    summary: "Amortit les bruits et fond la silhouette dans la pénombre.",
    technicalRules:
      "Confère un bonus de +5 aux tests de Discrétion (Dextérité) et annule le désavantage habituel infligé par les armures moyennes ou lourdes."
  },
  {
    id: "resistance_elementaire",
    name: "Résistance élémentaire",
    category: "armor_or_shield",
    slotCost: 1,
    rarity: "rare",
    summary: "Protège contre un type d'énergie arcanique choisi.",
    technicalRules:
      "Le porteur bénéficie d'une résistance permanente à un type de dégâts déterminé lors du forgeage (Feu, Froid, Foudre, Acide ou Poison)."
  },
  {
    id: "invulnerabilite",
    name: "Invulnérabilité astrale",
    category: "armor_or_shield",
    slotCost: 2,
    rarity: "very_rare",
    summary: "Réduit les dégâts physiques subis.",
    technicalRules:
      "Réduit de 3 points tous les dégâts contondants, perforants et tranchants non-magiques infligés au porteur."
  }
];

export const REFERENCE_AUTONOMOUS_ITEMS: readonly AutonomousMagicItem[] = [
  {
    id: "bag_of_holding",
    name: "Sac sans fond",
    category: "autonomous_permanent",
    effectiveLevel: 1,
    rarity: "uncommon",
    ceilingPrice: calculateForgeQuote({ category: "autonomous_permanent", bonus: 0, slots: 1 }).ceilingPrice,
    summary: "Contenant extradimensionnel stockant jusqu'à 250 kg.",
    technicalRules: "Espace intérieur extradimensionnel de 1,80 m³ sans encombrement externe."
  },
  {
    id: "boots_of_levitation",
    name: "Bottes de lévitation",
    category: "autonomous_permanent",
    effectiveLevel: 1,
    rarity: "uncommon",
    ceilingPrice: calculateForgeQuote({ category: "autonomous_permanent", bonus: 0, slots: 1 }).ceilingPrice,
    summary: "Permet de léviter verticalement à volonté.",
    technicalRules: "Permet de lancer Lévitation sur soi-même à volonté sans dépense d'emplacement de sort."
  },
  {
    id: "displacement_cloak",
    name: "Cape de déplacement",
    category: "autonomous_permanent",
    effectiveLevel: 2,
    rarity: "rare",
    ceilingPrice: calculateForgeQuote({ category: "autonomous_permanent", bonus: 0, slots: 2 }).ceilingPrice,
    summary: "Projette une illusion optique décalant l'image du porteur.",
    technicalRules: "Toutes les créatures subissent un désavantage sur leurs jets d'attaque contre le porteur."
  },
  {
    id: "ring_of_spell_storing",
    name: "Anneau de stockage de sorts",
    category: "autonomous_permanent",
    effectiveLevel: 2,
    rarity: "rare",
    ceilingPrice: calculateForgeQuote({ category: "autonomous_permanent", bonus: 0, slots: 2 }).ceilingPrice,
    summary: "Conserve jusqu'à 5 niveaux de sorts prêts à être libérés.",
    technicalRules: "Tout lanceur de sorts peut y insuffler des sorts jusqu'à concurrence de 5 niveaux cumulés."
  },
  {
    id: "folding_boat",
    name: "Bateau pliable",
    category: "autonomous_permanent",
    effectiveLevel: 2,
    rarity: "rare",
    ceilingPrice: calculateForgeQuote({ category: "autonomous_permanent", bonus: 0, slots: 2 }).ceilingPrice,
    summary: "Boîte en bois se déployant en barque ou navire ponté.",
    technicalRules: "Prend sur mot de commande la forme d'un canot pour 4 passagers ou d'un navire de 7 mètres."
  },
  {
    id: "amulet_of_health",
    name: "Amulette de santé",
    category: "autonomous_permanent",
    effectiveLevel: 3,
    rarity: "rare",
    ceilingPrice: calculateForgeQuote({ category: "autonomous_permanent", bonus: 0, slots: 3 }).ceilingPrice,
    summary: "Fixe la valeur de Constitution du porteur à 19.",
    technicalRules: "Tant qu'elle est portée avec harmonisation, la Constitution est de 19 si elle était inférieure."
  },
  {
    id: "belt_of_hill_giant_strength",
    name: "Ceinturon de force de géant",
    category: "autonomous_permanent",
    effectiveLevel: 4,
    rarity: "rare",
    ceilingPrice: calculateForgeQuote({ category: "autonomous_permanent", bonus: 0, slots: 4 }).ceilingPrice,
    summary: "Élève la Force du porteur à 21.",
    technicalRules: "Fixe la valeur de Force à 21 lors de l'harmonisation."
  },
  {
    id: "wings_of_flying",
    name: "Ailes de vol",
    category: "autonomous_permanent",
    effectiveLevel: 4,
    rarity: "rare",
    ceilingPrice: calculateForgeQuote({ category: "autonomous_permanent", bonus: 0, slots: 4 }).ceilingPrice,
    summary: "Manteau se transformant en ailes de chauve-souris ou d'oiseau.",
    technicalRules: "Confère une vitesse de vol de 18 mètres pendant 1 heure toutes les 1d12 heures."
  },
  {
    id: "cloak_of_shadow_mastery",
    name: "Cape du maître des ombres",
    category: "autonomous_permanent",
    effectiveLevel: 5,
    rarity: "very_rare",
    ceilingPrice: calculateForgeQuote({ category: "autonomous_permanent", bonus: 0, slots: 5 }).ceilingPrice,
    summary: "Permet de traverser le plan de l'Ombre et de se téléporter.",
    technicalRules: "Permet de se téléporter d'ombre en ombre jusqu'à 36 mètres et confère l'invisibilité dans la pénombre."
  },
  {
    id: "celestial_regeneration_ring",
    name: "Anneau de régénération céleste",
    category: "autonomous_permanent",
    effectiveLevel: 6,
    rarity: "very_rare",
    ceilingPrice: calculateForgeQuote({ category: "autonomous_permanent", bonus: 0, slots: 6 }).ceilingPrice,
    summary: "Restaure en continu les points de vie et répare les blessures.",
    technicalRules: "Régénère 1d6 points de vie toutes les 10 minutes tant que le porteur a au moins 1 point de vie."
  }
];

export function findEnchantmentById(id: string): EnchantmentProperty | undefined {
  return ENCHANTMENT_PROPERTIES.find((p) => p.id === id);
}

export function findAutonomousItemById(id: string): AutonomousMagicItem | undefined {
  return REFERENCE_AUTONOMOUS_ITEMS.find((item) => item.id === id);
}

export interface CatalogSearchParams {
  readonly query?: string;
  readonly category?: ItemCategory;
  readonly rarity?: EnchantmentRarity;
}

export function searchCatalog(params: CatalogSearchParams): readonly CatalogEntry[] {
  const query = (params.query ?? "").trim().toLowerCase();
  const category = params.category;
  const rarity = params.rarity;

  const results: CatalogEntry[] = [];

  for (const prop of ENCHANTMENT_PROPERTIES) {
    if (category && prop.category !== category) continue;
    if (rarity && prop.rarity !== rarity) continue;

    if (
      !query ||
      prop.name.toLowerCase().includes(query) ||
      prop.summary.toLowerCase().includes(query) ||
      prop.technicalRules.toLowerCase().includes(query)
    ) {
      results.push({ ...prop, kind: "enchantment" });
    }
  }

  for (const item of REFERENCE_AUTONOMOUS_ITEMS) {
    if (category && item.category !== category) continue;
    if (rarity && item.rarity !== rarity) continue;

    if (
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.technicalRules.toLowerCase().includes(query)
    ) {
      results.push({ ...item, kind: "autonomous_item" });
    }
  }

  return results;
}
