export type MarketOutcomeCategory =
  | 'EXCEPTIONAL_OPPORTUNITY'
  | 'VERY_ADVANTAGEOUS'
  | 'FAVORABLE'
  | 'STANDARD'
  | 'NOMINAL'
  | 'MINOR_COMPLICATION'
  | 'WORKSHOP_INCIDENT'
  | 'MAJOR_COMPLICATION';

export interface MarketSimulationResult {
  d20Roll: number;
  basePrice: number;
  rateMultiplier: number;
  discountPercentage: number;
  finalPrice: number;
  category: MarketOutcomeCategory;
  title: string;
  narrativeDescription: string;
  hasComplication: boolean;
  complicationDetails?: string;
}

interface MarketOutcomeMeta {
  category: MarketOutcomeCategory;
  title: string;
  narrativeDescription: string;
  hasComplication: boolean;
  complicationDetails?: string;
}

export function classifyD20Roll(d20: number): MarketOutcomeMeta {
  if (d20 === 1) {
    return {
      category: 'EXCEPTIONAL_OPPORTUNITY',
      title: 'Opportunité exceptionnelle',
      narrativeDescription:
        "Alignement astral rarissime ou artisan sous contrat d'honneur : remise maximale de 28 % sur le plafond garanti.",
      hasComplication: false,
    };
  }
  if (d20 >= 2 && d20 <= 5) {
    return {
      category: 'VERY_ADVANTAGEOUS',
      title: 'Affaire très avantageuse',
      narrativeDescription:
        'Négociation fructueuse et surplus de matériaux bruts réduisant sensiblement le coût de forge.',
      hasComplication: false,
    };
  }
  if (d20 >= 6 && d20 <= 10) {
    return {
      category: 'FAVORABLE',
      title: 'Marché favorable',
      narrativeDescription:
        "Conditions d'atelier optimales et cours des poudres arcaniques sous la moyenne du marché.",
      hasComplication: false,
    };
  }
  if (d20 >= 11 && d20 <= 14) {
    return {
      category: 'STANDARD',
      title: 'Prix du cours habituel',
      narrativeDescription:
        'Tarifs ordinaires de la guilde des forgerons sans aléa ni réduction notable.',
      hasComplication: false,
    };
  }
  if (d20 === 15) {
    return {
      category: 'NOMINAL',
      title: 'Prix plafond nominal (sans incident)',
      narrativeDescription:
        "Le prix atteint le plafond garanti de l'atelier sans le dépasser. Aucun incident n'est survenu.",
      hasComplication: false,
    };
  }
  if (d20 >= 16 && d20 <= 17) {
    return {
      category: 'MINOR_COMPLICATION',
      title: 'Complication mineure',
      narrativeDescription:
        "Le plafond est atteint et un composant exotique ou un service d'escorte est requis par la forge.",
      hasComplication: true,
      complicationDetails: 'Composant spécifique ou service requis',
    };
  }
  if (d20 >= 18 && d20 <= 19) {
    return {
      category: 'WORKSHOP_INCIDENT',
      title: "Incident d'atelier",
      narrativeDescription:
        "Une instabilité dans le creuset arcanique impose l'intervention directe du client pour purifier le rituel.",
      hasComplication: true,
      complicationDetails: "Aléa d'artisanat nécessitant l'action du joueur",
    };
  }
  if (d20 === 20) {
    return {
      category: 'MAJOR_COMPLICATION',
      title: 'Complication majeure',
      narrativeDescription:
        "Rupture de confinement magique ou jalousie corporative : une quête arcanique ou une faveur politique de haut rang est exigée pour achever l'objet.",
      hasComplication: true,
      complicationDetails: 'Quête arcanique ou faveur de haut rang requise',
    };
  }

  throw new RangeError(`Tirage d20 invalide : ${d20}. La valeur doit être un entier entre 1 et 20.`);
}

export function simulateMarket(basePrice: number, d20Roll: number): MarketSimulationResult {
  if (!Number.isInteger(d20Roll) || d20Roll < 1 || d20Roll > 20) {
    throw new RangeError(`Tirage d20 invalide : ${d20Roll}. Attendu : entier compris entre 1 et 20.`);
  }
  if (basePrice < 0 || !Number.isFinite(basePrice)) {
    throw new RangeError(`Prix de base invalide : ${basePrice}.`);
  }

  const rawRate = (70 + 2 * d20Roll) / 100;
  const rateMultiplier = Math.min(1, Math.round(rawRate * 100) / 100);
  const discountPercentage = Math.round((1 - rateMultiplier) * 100);

  const finalPrice = Math.round(basePrice * rateMultiplier);
  const meta = classifyD20Roll(d20Roll);

  return {
    d20Roll,
    basePrice,
    rateMultiplier,
    discountPercentage,
    finalPrice,
    category: meta.category,
    title: meta.title,
    narrativeDescription: meta.narrativeDescription,
    hasComplication: meta.hasComplication,
    complicationDetails: meta.complicationDetails,
  };
}
