import type { ItemCategory, AmmoSupplement } from './domain/forge';
import type { RulesetVersion } from './domain/catalog';

export interface AppState {
  activeTab: 'forge' | 'market' | 'ammo' | 'grimoire';
  forge: {
    category: ItemCategory;
    bonus: number;
    selectedEnchantmentIds: string[];
    isUpgradeMode: boolean;
    upgradeInitialBonus: number;
    upgradeInitialSlots: number;
    upgradeTargetBonus: number;
    upgradeTargetSlots: number;
  };
  market: {
    basePrice: number;
    d20Roll: number;
  };
  ammoAndConsumables: {
    bonus: number;
    slots: number;
    quantity: number;
    supplements: AmmoSupplement[];
    ruleset: RulesetVersion;
    potionQuantities: Record<string, number>;
    specialQuantities: Record<string, number>;
  };
}

export const STORAGE_KEY = 'enclume_astrale_state_v1';

export const DEFAULT_APP_STATE: AppState = {
  activeTab: 'forge',
  forge: {
    category: 'WEAPON',
    bonus: 1,
    selectedEnchantmentIds: [],
    isUpgradeMode: false,
    upgradeInitialBonus: 1,
    upgradeInitialSlots: 0,
    upgradeTargetBonus: 2,
    upgradeTargetSlots: 0,
  },
  market: {
    basePrice: 1000,
    d20Roll: 15,
  },
  ammoAndConsumables: {
    bonus: 1,
    slots: 0,
    quantity: 10,
    supplements: [],
    ruleset: '5e_2014',
    potionQuantities: {
      potion_healing_common: 0,
      potion_healing_uncommon: 0,
      potion_healing_rare: 0,
      potion_healing_very_rare: 0,
    },
    specialQuantities: {
      dust_of_disappearance: 0,
      keoghtom_ointment: 0,
      sovereign_glue: 0,
    },
  },
};

export function loadStoredState(): AppState {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return DEFAULT_APP_STATE;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APP_STATE;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_APP_STATE;
    }

    const forgeRaw = parsed.forge && typeof parsed.forge === 'object' ? parsed.forge : {};
    const ammoRaw =
      parsed.ammoAndConsumables && typeof parsed.ammoAndConsumables === 'object'
        ? parsed.ammoAndConsumables
        : {};

    return {
      ...DEFAULT_APP_STATE,
      ...parsed,
      forge: {
        ...DEFAULT_APP_STATE.forge,
        ...forgeRaw,
        selectedEnchantmentIds: Array.isArray(forgeRaw.selectedEnchantmentIds)
          ? forgeRaw.selectedEnchantmentIds
          : DEFAULT_APP_STATE.forge.selectedEnchantmentIds,
      },
      market: {
        ...DEFAULT_APP_STATE.market,
        ...(parsed.market && typeof parsed.market === 'object' ? parsed.market : {}),
      },
      ammoAndConsumables: {
        ...DEFAULT_APP_STATE.ammoAndConsumables,
        ...ammoRaw,
        supplements: Array.isArray(ammoRaw.supplements)
          ? ammoRaw.supplements
          : DEFAULT_APP_STATE.ammoAndConsumables.supplements,
        potionQuantities: {
          ...DEFAULT_APP_STATE.ammoAndConsumables.potionQuantities,
          ...(ammoRaw.potionQuantities && typeof ammoRaw.potionQuantities === 'object'
            ? ammoRaw.potionQuantities
            : {}),
        },
        specialQuantities: {
          ...DEFAULT_APP_STATE.ammoAndConsumables.specialQuantities,
          ...(ammoRaw.specialQuantities && typeof ammoRaw.specialQuantities === 'object'
            ? ammoRaw.specialQuantities
            : {}),
        },
      },
    };
  } catch {
    return DEFAULT_APP_STATE;
  }
}

export function saveStoredState(state: AppState): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
