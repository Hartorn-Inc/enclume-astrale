export type MarketOutcomeType =
  | "exceptional_deal"
  | "favorable_market"
  | "standard_market"
  | "slight_discount"
  | "nominal_ceiling"
  | "specific_component_required"
  | "workshop_incident"
  | "major_complication";

export interface MarketSimulationResult {
  readonly d20: number;
  readonly ceilingPrice: number;
  readonly ratio: number;
  readonly discountPercent: number;
  readonly finalPrice: number;
  readonly outcomeType: MarketOutcomeType;
  readonly hasComplication: boolean;
  readonly narrativeLabel: string;
  readonly complicationDescription?: string;
}

export function rollMarketD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export function calculateMarketRatio(d20: number): number {
  const clamped = Math.max(1, Math.min(20, Math.floor(d20)));
  const percentage = Math.min(100, 70 + 2 * clamped);
  return percentage / 100;
}

export function simulateMarketTransaction(
  ceilingPrice: number,
  rawD20?: number
): MarketSimulationResult {
  const d20 = rawD20 !== undefined ? Math.max(1, Math.min(20, Math.floor(rawD20))) : rollMarketD20();
  const ratio = calculateMarketRatio(d20);
  const discountPercent = Math.round((1 - ratio) * 100);
  const finalPrice = Math.min(ceilingPrice, Math.round(ceilingPrice * ratio));

  let outcomeType: MarketOutcomeType;
  let hasComplication = false;
  let narrativeLabel = "";
  let complicationDescription: string | undefined;

  if (d20 === 1) {
    outcomeType = "exceptional_deal";
    narrativeLabel = "Affaire exceptionnelle (-28 %)";
  } else if (d20 <= 5) {
    outcomeType = "exceptional_deal";
    narrativeLabel = `Marché très avantageux (-${discountPercent} %)`;
  } else if (d20 <= 10) {
    outcomeType = "favorable_market";
    narrativeLabel = `Marché favorable (-${discountPercent} %)`;
  } else if (d20 <= 14) {
    outcomeType = "standard_market";
    narrativeLabel = `Cours habituel (-${discountPercent} %)`;
  } else if (d20 === 15) {
    outcomeType = "nominal_ceiling";
    narrativeLabel = "Plafond nominal (100 %, aucun aléa)";
  } else if (d20 <= 17) {
    outcomeType = "specific_component_required";
    hasComplication = true;
    narrativeLabel = "Complication : composant rare ou faveur d'artisan requis";
    complicationDescription =
      "La forge exige un matériau brut spécifique (minerai stellaire, sève d'arbre-monde) ou un service préalable sans surcoût financier.";
  } else if (d20 <= 19) {
    outcomeType = "workshop_incident";
    hasComplication = true;
    narrativeLabel = "Incident d'atelier : intervention nécessaire";
    complicationDescription =
      "Un incident arcanique perturbe le façonnage (fusion instable, rune réfractaire). Une action ou un délai supplémentaire est nécessaire pour stabiliser l'enchantement.";
  } else {
    outcomeType = "major_complication";
    hasComplication = true;
    narrativeLabel = "Complication majeure : quête arcanique initiée";
    complicationDescription =
      "Le rituel requiert une étincelle élémentaire ou l'intervention d'un maître forgeron astral. Une opportunité d'aventure s'ouvre pour achever l'artefact.";
  }

  return {
    d20,
    ceilingPrice,
    ratio,
    discountPercent,
    finalPrice,
    outcomeType,
    hasComplication,
    narrativeLabel,
    complicationDescription
  };
}
