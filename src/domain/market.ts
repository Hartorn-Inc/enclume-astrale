export type MarketTier =
  | 'EXCEPTIONAL_DEAL'
  | 'VERY_ADVANTAGEOUS'
  | 'FAVORABLE'
  | 'REGULAR_PRICE'
  | 'NOMINAL'
  | 'MINOR_COMPLICATION'
  | 'WORKSHOP_INCIDENT'
  | 'MAJOR_COMPLICATION';

export type ComplicationSeverity = 'NONE' | 'MINOR' | 'WORKSHOP' | 'MAJOR';

export interface MarketSimulationResult {
  d20: number;
  basePrice: number;
  rate: number;
  paidPrice: number;
  discountAmount: number;
  tier: MarketTier;
  label: string;
  hasComplication: boolean;
  complicationSeverity: ComplicationSeverity;
  complicationDescription?: string;
}

export interface RollCategoryDefinition {
  tier: MarketTier;
  label: string;
  severity: ComplicationSeverity;
  complicationDescription?: string;
}

export function classifyRoll(d20: number): RollCategoryDefinition {
  if (d20 === 1) {
    return {
      tier: 'EXCEPTIONAL_DEAL',
      label: 'Opportunité exceptionnelle (remise de 28 %)',
      severity: 'NONE'
    };
  }
  if (d20 >= 2 && d20 <= 5) {
    return {
      tier: 'VERY_ADVANTAGEOUS',
      label: 'Affaire très avantageuse',
      severity: 'NONE'
    };
  }
  if (d20 >= 6 && d20 <= 10) {
    return {
      tier: 'FAVORABLE',
      label: 'Marché favorable',
      severity: 'NONE'
    };
  }
  if (d20 >= 11 && d20 <= 14) {
    return {
      tier: 'REGULAR_PRICE',
      label: 'Prix du cours habituel',
      severity: 'NONE'
    };
  }
  if (d20 === 15) {
    return {
      tier: 'NOMINAL',
      label: 'Prix plafond nominal (sans incident)',
      severity: 'NONE'
    };
  }
  if (d20 === 16 || d20 === 17) {
    return {
      tier: 'MINOR_COMPLICATION',
      label: 'Complication mineure',
      severity: 'MINOR',
      complicationDescription: "L'artisan requiert un composant spécifique ou un service local pour finaliser l'enchantement."
    };
  }
  if (d20 === 18 || d20 === 19) {
    return {
      tier: 'WORKSHOP_INCIDENT',
      label: "Incident d'atelier",
      severity: 'WORKSHOP',
      complicationDescription: "Une déstabilisation du creuset arcanique réclame l'intervention ou une ressource d'appoint du client."
    };
  }
  if (d20 === 20) {
    return {
      tier: 'MAJOR_COMPLICATION',
      label: 'Complication majeure',
      severity: 'MAJOR',
      complicationDescription: "Rupture de confinement magique : une quête arcanique ou une faveur de haut rang est exigée pour achever la forge."
    };
  }

  throw new Error(`Résultat de d20 hors bornes: ${d20}. Attendu : entier entre 1 et 20.`);
}

export function simulateMarket(basePrice: number, d20Roll: number): MarketSimulationResult {
  if (!Number.isFinite(basePrice) || basePrice < 0) {
    throw new Error(`Prix de base invalide : ${basePrice}. Doit être un nombre positif.`);
  }

  if (!Number.isInteger(d20Roll) || d20Roll < 1 || d20Roll > 20) {
    throw new Error(`Résultat de d20 invalide : ${d20Roll}. Attendu : entier entre 1 et 20.`);
  }

  const rollDefinition = classifyRoll(d20Roll);
  const rawFactor = (70 + 2 * d20Roll) / 100;
  const rate = Math.min(1.0, Math.round(rawFactor * 100) / 100);

  const rawPaid = basePrice * Math.min(1.0, (70 + 2 * d20Roll) / 100);
  const paidPrice = Math.min(basePrice, Math.round(rawPaid));
  const discountAmount = Math.max(0, basePrice - paidPrice);

  const hasComplication = rollDefinition.severity !== 'NONE';

  return {
    d20: d20Roll,
    basePrice,
    rate,
    paidPrice,
    discountAmount,
    tier: rollDefinition.tier,
    label: rollDefinition.label,
    hasComplication,
    complicationSeverity: rollDefinition.severity,
    complicationDescription: rollDefinition.complicationDescription
  };
}
