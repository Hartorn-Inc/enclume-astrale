export type MarketOutcomeCategory =
  | 'EXCEPTIONAL_OPPORTUNITY'
  | 'VERY_FAVORABLE'
  | 'FAVORABLE'
  | 'STANDARD'
  | 'NOMINAL'
  | 'MINOR_COMPLICATION'
  | 'WORKSHOP_INCIDENT'
  | 'MAJOR_COMPLICATION';

export type ComplicationSeverity = 'NONE' | 'MINOR' | 'WORKSHOP_INCIDENT' | 'MAJOR';

export interface MarketSimulationResult {
  basePrice: number;
  d20Roll: number;
  multiplier: number;
  finalPrice: number;
  discountPercent: number;
  outcomeCategory: MarketOutcomeCategory;
  outcomeLabel: string;
  complicationSeverity: ComplicationSeverity;
  hasComplication: boolean;
  narrativeComplication: string;
}

export function classifyD20Roll(d20: number): {
  outcomeCategory: MarketOutcomeCategory;
  outcomeLabel: string;
  complicationSeverity: ComplicationSeverity;
  hasComplication: boolean;
  narrativeComplication: string;
} {
  if (!Number.isInteger(d20) || d20 < 1 || d20 > 20) {
    throw new Error(`Invalid d20 roll: ${d20}. Must be an integer between 1 and 20.`);
  }

  if (d20 === 1) {
    return {
      outcomeCategory: 'EXCEPTIONAL_OPPORTUNITY',
      outcomeLabel: 'Opportunité exceptionnelle',
      complicationSeverity: 'NONE',
      hasComplication: false,
      narrativeComplication:
        "Opportunité exceptionnelle : surplus d'ingrédients ou liquidation d'atelier offrant la remise maximale de 28 %.",
    };
  }

  if (d20 >= 2 && d20 <= 5) {
    return {
      outcomeCategory: 'VERY_FAVORABLE',
      outcomeLabel: 'Affaire très avantageuse',
      complicationSeverity: 'NONE',
      hasComplication: false,
      narrativeComplication:
        "Affaire très avantageuse : négociation fluide et disponibilité immédiate des forgerons.",
    };
  }

  if (d20 >= 6 && d20 <= 10) {
    return {
      outcomeCategory: 'FAVORABLE',
      outcomeLabel: 'Marché favorable',
      complicationSeverity: 'NONE',
      hasComplication: false,
      narrativeComplication:
        "Marché favorable : cours des gemmes et réactifs stabilisé à l'avantage du client.",
    };
  }

  if (d20 >= 11 && d20 <= 14) {
    return {
      outcomeCategory: 'STANDARD',
      outcomeLabel: 'Prix du cours habituel',
      complicationSeverity: 'NONE',
      hasComplication: false,
      narrativeComplication:
        "Prix du cours habituel : fluctuations ordinaires de l'économie sans incident.",
    };
  }

  if (d20 === 15) {
    return {
      outcomeCategory: 'NOMINAL',
      outcomeLabel: 'Prix plafond nominal',
      complicationSeverity: 'NONE',
      hasComplication: false,
      narrativeComplication:
        "Prix plafond nominal : exécution conforme au devis annoncé, sans aléa ni réduction.",
    };
  }

  if (d20 === 16 || d20 === 17) {
    return {
      outcomeCategory: 'MINOR_COMPLICATION',
      outcomeLabel: 'Complication mineure',
      complicationSeverity: 'MINOR',
      hasComplication: true,
      narrativeComplication:
        "Complication mineure : un composant spécifique ou un service d'artisan externe est requis avant achèvement.",
    };
  }

  if (d20 === 18 || d20 === 19) {
    return {
      outcomeCategory: 'WORKSHOP_INCIDENT',
      outcomeLabel: "Incident d'atelier",
      complicationSeverity: 'WORKSHOP_INCIDENT',
      hasComplication: true,
      narrativeComplication:
        "Incident d'atelier : imprévu d'artisanat ou surchauffe des creusets nécessitant un arbitrage ou une action immédiate du commanditaire.",
    };
  }

  return {
    outcomeCategory: 'MAJOR_COMPLICATION',
    outcomeLabel: 'Complication majeure',
    complicationSeverity: 'MAJOR',
    hasComplication: true,
    narrativeComplication:
      "Complication majeure : anomalie arcanique critique nécessitant une quête dédiée ou la faveur d'un haut mage pour finaliser l'enchantement.",
  };
}

export function simulateMarket(basePrice: number, d20Roll: number): MarketSimulationResult {
  if (typeof basePrice !== 'number' || Number.isNaN(basePrice) || basePrice < 0) {
    throw new Error(`Invalid base price: ${basePrice}. Must be a non-negative number.`);
  }

  const classification = classifyD20Roll(d20Roll);
  const multiplier = Math.min(1, (70 + 2 * d20Roll) / 100);
  const finalPrice = Math.round(basePrice * multiplier);
  const discountPercent = Math.max(0, 100 - (70 + 2 * d20Roll));

  return {
    basePrice,
    d20Roll,
    multiplier,
    finalPrice,
    discountPercent,
    ...classification,
  };
}
