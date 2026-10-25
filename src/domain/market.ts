export type MarketOutcomeCategory =
  | 'EXCEPTIONAL_OPPORTUNITY'
  | 'VERY_ADVANTAGEOUS'
  | 'FAVORABLE_MARKET'
  | 'NORMAL_MARKET'
  | 'NOMINAL_PRICE'
  | 'MINOR_COMPLICATION'
  | 'WORKSHOP_INCIDENT'
  | 'MAJOR_COMPLICATION';

export interface MarketSimulationResult {
  d20Roll: number;
  basePrice: number;
  finalPrice: number;
  discountRate: number;
  percentageApplied: number;
  hasIncident: boolean;
  incidentDescription?: string;
  statusLabel: string;
  category: MarketOutcomeCategory;
}

interface RollClassification {
  category: MarketOutcomeCategory;
  statusLabel: string;
  hasIncident: boolean;
  incidentDescription?: string;
}

export function classifyD20Roll(d20: number): RollClassification {
  if (d20 === 1) {
    return {
      category: 'EXCEPTIONAL_OPPORTUNITY',
      statusLabel: 'Opportunité exceptionnelle (remise maximale de 28 %)',
      hasIncident: false,
    };
  }

  if (d20 >= 2 && d20 <= 5) {
    return {
      category: 'VERY_ADVANTAGEOUS',
      statusLabel: 'Affaire très avantageuse',
      hasIncident: false,
    };
  }

  if (d20 >= 6 && d20 <= 10) {
    return {
      category: 'FAVORABLE_MARKET',
      statusLabel: 'Marché favorable',
      hasIncident: false,
    };
  }

  if (d20 >= 11 && d20 <= 14) {
    return {
      category: 'NORMAL_MARKET',
      statusLabel: 'Prix du cours habituel',
      hasIncident: false,
    };
  }

  if (d20 === 15) {
    return {
      category: 'NOMINAL_PRICE',
      statusLabel: 'Prix plafond nominal (sans incident)',
      hasIncident: false,
    };
  }

  if (d20 >= 16 && d20 <= 17) {
    return {
      category: 'MINOR_COMPLICATION',
      statusLabel: 'Complication mineure (composant spécifique ou service requis)',
      hasIncident: true,
      incidentDescription: 'Composant spécifique rare ou service artisanal requis avant livraison.',
    };
  }

  if (d20 >= 18 && d20 <= 19) {
    return {
      category: 'WORKSHOP_INCIDENT',
      statusLabel: "Incident d'atelier (aléa d'artisanat nécessitant l'action du joueur)",
      hasIncident: true,
      incidentDescription: "Aléa critique à l'atelier d'enchantement nécessitant l'intervention du joueur.",
    };
  }

  if (d20 === 20) {
    return {
      category: 'MAJOR_COMPLICATION',
      statusLabel: 'Complication majeure (quête arcanique ou faveur de haut rang requise)',
      hasIncident: true,
      incidentDescription: 'Quête arcanique périlleuse ou faveur politique majeure requise pour sceller la forge.',
    };
  }

  throw new Error(`Le tirage d20 doit être un entier compris entre 1 et 20. Reçu: ${d20}`);
}

export function simulateMarket(basePrice: number, d20Roll: number): MarketSimulationResult {
  if (!Number.isFinite(basePrice) || basePrice < 0) {
    throw new Error(`Le prix de base doit être un nombre positif ou nul. Reçu: ${basePrice}`);
  }

  if (!Number.isInteger(d20Roll) || d20Roll < 1 || d20Roll > 20) {
    throw new Error(`Le tirage d20 doit être un entier entre 1 et 20. Reçu: ${d20Roll}`);
  }

  const rawPercentage = 70 + 2 * d20Roll;
  const percentageApplied = Math.min(100, rawPercentage);
  const multiplier = Math.min(1, rawPercentage / 100);
  const finalPrice = Math.round(basePrice * multiplier);

  if (finalPrice > basePrice) {
    throw new Error(`Violation de l invariant : P_payé (${finalPrice}) ne peut excéder P_plafond (${basePrice})`);
  }

  const discountRate = Math.round((1 - percentageApplied / 100) * 100) / 100;
  const classification = classifyD20Roll(d20Roll);

  return {
    d20Roll,
    basePrice,
    finalPrice,
    discountRate,
    percentageApplied,
    hasIncident: classification.hasIncident,
    incidentDescription: classification.incidentDescription,
    statusLabel: classification.statusLabel,
    category: classification.category,
  };
}
