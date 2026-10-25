export type MarketOutcomeCategory =
  | 'EXCEPTIONAL_OPPORTUNITY'
  | 'VERY_ADVANTAGEOUS'
  | 'FAVORABLE_MARKET'
  | 'STANDARD_RATE'
  | 'NOMINAL_CEILING'
  | 'MINOR_COMPLICATION'
  | 'WORKSHOP_INCIDENT'
  | 'MAJOR_COMPLICATION';

export type ComplicationSeverity = 'NONE' | 'MINOR' | 'WORKSHOP_INCIDENT' | 'MAJOR';

export interface MarketComplication {
  hasComplication: boolean;
  severity: ComplicationSeverity;
  label: string;
  description: string;
}

export interface MarketSimulationResult {
  basePrice: number;
  d20Roll: number;
  priceRatio: number;
  discountRate: number;
  finalPrice: number;
  savedAmount: number;
  category: MarketOutcomeCategory;
  categoryLabel: string;
  complication: MarketComplication;
}

export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export function resolveMarketOutcome(d20Roll: number): {
  category: MarketOutcomeCategory;
  categoryLabel: string;
  complication: MarketComplication;
} {
  if (!Number.isInteger(d20Roll) || d20Roll < 1 || d20Roll > 20) {
    throw new RangeError(
      `Résultat de d20 invalide: ${d20Roll}. Le jet de d20 doit être un entier compris entre 1 et 20.`
    );
  }

  if (d20Roll === 1) {
    return {
      category: 'EXCEPTIONAL_OPPORTUNITY',
      categoryLabel: 'Opportunité exceptionnelle',
      complication: {
        hasComplication: false,
        severity: 'NONE',
        label: 'Aucun incident',
        description: 'Opportunité exceptionnelle : remise maximale de 28 % accordée sur le cours.',
      },
    };
  }

  if (d20Roll >= 2 && d20Roll <= 5) {
    return {
      category: 'VERY_ADVANTAGEOUS',
      categoryLabel: 'Affaire très avantageuse',
      complication: {
        hasComplication: false,
        severity: 'NONE',
        label: 'Aucun incident',
        description: 'Affaire très avantageuse : négociation particulièrement favorable sans accroc.',
      },
    };
  }

  if (d20Roll >= 6 && d20Roll <= 10) {
    return {
      category: 'FAVORABLE_MARKET',
      categoryLabel: 'Marché favorable',
      complication: {
        hasComplication: false,
        severity: 'NONE',
        label: 'Aucun incident',
        description: "Marché favorable : composants obtenus à des conditions d'approvisionnement avantageuses.",
      },
    };
  }

  if (d20Roll >= 11 && d20Roll <= 14) {
    return {
      category: 'STANDARD_RATE',
      categoryLabel: 'Prix du cours habituel',
      complication: {
        hasComplication: false,
        severity: 'NONE',
        label: 'Aucun incident',
        description: 'Prix du cours habituel : transaction standard aux tarifs du marché ordinaire.',
      },
    };
  }

  if (d20Roll === 15) {
    return {
      category: 'NOMINAL_CEILING',
      categoryLabel: 'Prix plafond nominal',
      complication: {
        hasComplication: false,
        severity: 'NONE',
        label: 'Aucun incident',
        description: "Prix plafond nominal atteint sans complication ni incident d'artisanat.",
      },
    };
  }

  if (d20Roll >= 16 && d20Roll <= 17) {
    return {
      category: 'MINOR_COMPLICATION',
      categoryLabel: 'Complication mineure',
      complication: {
        hasComplication: true,
        severity: 'MINOR',
        label: 'Complication mineure',
        description: 'Composant spécifique ou service requis pour mener à bien la forge.',
      },
    };
  }

  if (d20Roll >= 18 && d20Roll <= 19) {
    return {
      category: 'WORKSHOP_INCIDENT',
      categoryLabel: "Incident d'atelier",
      complication: {
        hasComplication: true,
        severity: 'WORKSHOP_INCIDENT',
        label: "Incident d'atelier",
        description: "Aléa d'artisanat nécessitant l'action du joueur pour stabiliser le foyer de forge.",
      },
    };
  }

  return {
    category: 'MAJOR_COMPLICATION',
    categoryLabel: 'Complication majeure',
    complication: {
      hasComplication: true,
      severity: 'MAJOR',
      label: 'Complication majeure',
      description: "Quête arcanique ou faveur de haut rang requise pour sceller l'enchantement.",
    },
  };
}

export function simulateMarket(basePrice: number, d20Roll: number): MarketSimulationResult {
  if (typeof basePrice !== 'number' || !Number.isFinite(basePrice) || basePrice < 0) {
    throw new RangeError(
      `Prix de base invalide: ${basePrice}. Le prix de base doit être un nombre fini supérieur ou égal à 0.`
    );
  }

  const outcome = resolveMarketOutcome(d20Roll);

  // Formule CDC : P_payé = P_plafond * min(1, (70 + 2 * d20) / 100)
  const rawRatio = (70 + 2 * d20Roll) / 100;
  const priceRatio = Math.min(1, Math.round(rawRatio * 100) / 100);
  const discountRate = Math.max(0, Math.round((1 - priceRatio) * 100) / 100);

  const calculated = Math.round(basePrice * Math.min(1, rawRatio));
  const finalPrice = Math.min(basePrice, Math.max(0, calculated));
  const savedAmount = basePrice - finalPrice;

  return {
    basePrice,
    d20Roll,
    priceRatio,
    discountRate,
    finalPrice,
    savedAmount,
    category: outcome.category,
    categoryLabel: outcome.categoryLabel,
    complication: outcome.complication,
  };
}
