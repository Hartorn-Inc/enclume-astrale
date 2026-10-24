import { MarketRollCategory, MarketSimulationResult } from './types';

interface RollBracket {
  min: number;
  max: number;
  category: MarketRollCategory;
  label: string;
  complicationTitle: string | null;
  complicationDescription: string | null;
}

const ROLL_BRACKETS: RollBracket[] = [
  {
    min: 1,
    max: 1,
    category: 'exceptional_deal',
    label: 'Opportunité exceptionnelle (remise maximale)',
    complicationTitle: null,
    complicationDescription: null,
  },
  {
    min: 2,
    max: 5,
    category: 'very_advantageous',
    label: 'Affaire très avantageuse',
    complicationTitle: null,
    complicationDescription: null,
  },
  {
    min: 6,
    max: 10,
    category: 'favorable_market',
    label: 'Marché favorable',
    complicationTitle: null,
    complicationDescription: null,
  },
  {
    min: 11,
    max: 14,
    category: 'standard_market',
    label: 'Prix du cours habituel',
    complicationTitle: null,
    complicationDescription: null,
  },
  {
    min: 15,
    max: 15,
    category: 'nominal_ceiling',
    label: 'Prix plafond nominal (aucun incident)',
    complicationTitle: null,
    complicationDescription: null,
  },
  {
    min: 16,
    max: 17,
    category: 'minor_complication',
    label: 'Complication mineure',
    complicationTitle: 'Approvisionnement complexe ou service requis',
    complicationDescription: 'L’artisan a besoin d’un composant d’appoint rare ou d’un service diplomatique local avant de parachever l’œuvre au prix garanti.',
  },
  {
    min: 18,
    max: 19,
    category: 'workshop_incident',
    label: 'Incident d’atelier',
    complicationTitle: 'Aléa d’artisanat arcanique',
    complicationDescription: 'Une instabilité du creuset nécessite une intervention ou une purification rituelle rapide par les commanditaires.',
  },
  {
    min: 20,
    max: 20,
    category: 'major_complication',
    label: 'Complication majeure',
    complicationTitle: 'Quête arcanique ou faveur de haut rang requise',
    complicationDescription: 'Le sceau d’enchantement a révélé une divergence primordiale : seul un catalyseur mythique issu d’une quête permettra de sceller le chef-d’œuvre.',
  },
];

export function simulateMarketD20(ceilingPrice: number, d20Roll: number): MarketSimulationResult {
  if (!Number.isInteger(d20Roll) || d20Roll < 1 || d20Roll > 20) {
    throw new Error(`Tirage d20 invalide : ${d20Roll}. Le résultat doit être un entier compris entre 1 et 20.`);
  }

  const safeCeiling = Math.max(0, Math.round(ceilingPrice));
  const computedRatio = (70 + 2 * d20Roll) / 100;
  const priceRatio = Math.min(1, computedRatio);
  const discountRate = Math.max(0, Number((1 - priceRatio).toFixed(4)));
  const finalPrice = Math.round(safeCeiling * priceRatio);

  const bracket = ROLL_BRACKETS.find((b) => d20Roll >= b.min && d20Roll <= b.max)!;

  return {
    d20: d20Roll,
    ceilingPrice: safeCeiling,
    discountRate,
    priceRatio,
    finalPrice,
    category: bracket.category,
    categoryLabel: bracket.label,
    complicationTitle: bracket.complicationTitle,
    complicationDescription: bracket.complicationDescription,
  };
}
