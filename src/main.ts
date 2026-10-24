import {
  type ItemCategory,
  calculateForgeQuote,
  calculateUpgradeQuote
} from "./domain/forge.js";
import {
  simulateMarketTransaction,
  rollMarketD20,
  type MarketSimulationResult
} from "./domain/market.js";
import {
  calculateAmmunitionQuote,
  calculatePotionQuote,
  type PotionRuleVariant,
  type PotionTier
} from "./domain/consumables.js";
import {
  ENCHANTMENT_PROPERTIES,
  searchCatalog,
  type EnchantmentProperty
} from "./domain/catalog.js";

// Global UI State
interface AppState {
  forge: {
    category: ItemCategory;
    bonus: number;
    selectedEnchantmentIds: Set<string>;
    isUpgradeMode: boolean;
    initialBonus: number;
    initialSlots: number;
  };
  market: {
    ceilingPrice: number;
    d20: number;
    result?: MarketSimulationResult;
  };
  ammo: {
    quantity: number;
    bonus: number;
    unbreakable: boolean;
    forceful: boolean;
    silvered: boolean;
  };
  potionVariant: PotionRuleVariant;
  catalog: {
    query: string;
    category?: ItemCategory;
  };
}

const state: AppState = {
  forge: {
    category: "weapon",
    bonus: 2,
    selectedEnchantmentIds: new Set(["frugale"]),
    isUpgradeMode: false,
    initialBonus: 1,
    initialSlots: 0
  },
  market: {
    ceilingPrice: 25000,
    d20: 10
  },
  ammo: {
    quantity: 10,
    bonus: 1,
    unbreakable: false,
    forceful: false,
    silvered: false
  },
  potionVariant: "standard",
  catalog: {
    query: ""
  }
};

function announce(message: string): void {
  const announcer = document.getElementById("aria-announcer");
  if (announcer) {
    announcer.textContent = message;
  }
}

// Tab Switching
function initTabs(): void {
  const tabButtons = document.querySelectorAll<HTMLButtonElement>(".tab-btn");
  const panels = document.querySelectorAll<HTMLElement>(".tab-panel");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetPanelId = btn.getAttribute("aria-controls");
      if (!targetPanelId) return;

      tabButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      panels.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      const targetPanel = document.getElementById(targetPanelId);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
      announce(`Affichage de l'onglet ${btn.textContent?.trim()}`);
    });
  });
}

export function switchTab(tabId: string): void {
  const btn = document.getElementById(tabId) as HTMLButtonElement | null;
  if (btn) {
    btn.click();
  }
}

// Forge Logic
function renderForgeEnchantments(): void {
  const listEl = document.getElementById("forge-enchantment-list");
  if (!listEl) return;

  const applicableProps = ENCHANTMENT_PROPERTIES.filter(
    (prop) => prop.category === (state.forge.category === "armor_or_shield" ? "armor_or_shield" : "weapon")
  );

  listEl.innerHTML = "";

  if (state.forge.category === "autonomous_permanent") {
    listEl.innerHTML = `
      <div class="empty-state-notice" style="padding: 1rem; color: var(--text-muted); font-size: 0.85rem;">
        Les objets autonomes permanents ont un niveau N fixé dans le Grimoire sans sélection libre de slots d'armes.
      </div>
    `;
    return;
  }

  applicableProps.forEach((prop: EnchantmentProperty) => {
    const isChecked = state.forge.selectedEnchantmentIds.has(prop.id);
    const itemEl = document.createElement("label");
    itemEl.className = "enchantment-item";
    itemEl.innerHTML = `
      <input type="checkbox" value="${prop.id}" ${isChecked ? "checked" : ""} />
      <div class="enchantment-details">
        <div class="enchantment-header-line">
          <span class="enchantment-name">${prop.name}</span>
          <span class="slot-tag">${prop.slotCost} slot${prop.slotCost > 1 ? "s" : ""}</span>
        </div>
        <p class="enchantment-desc">${prop.summary}</p>
      </div>
    `;

    const checkbox = itemEl.querySelector("input");
    checkbox?.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        state.forge.selectedEnchantmentIds.add(prop.id);
      } else {
        state.forge.selectedEnchantmentIds.delete(prop.id);
      }
      updateForgeCalculations();
    });

    listEl.appendChild(itemEl);
  });
}

function updateForgeCalculations(): void {
  let totalSlots = 0;
  state.forge.selectedEnchantmentIds.forEach((id) => {
    const prop = ENCHANTMENT_PROPERTIES.find((p) => p.id === id);
    if (prop) totalSlots += prop.slotCost;
  });

  const quote = calculateForgeQuote({
    category: state.forge.category,
    bonus: state.forge.bonus,
    slots: totalSlots
  });

  // Capacity indicators
  const counterEl = document.getElementById("capacity-counter");
  const fillEl = document.getElementById("capacity-fill");
  const maxCapacity = state.forge.category === "weapon" ? state.forge.bonus : 4;
  const pct = maxCapacity > 0 ? Math.min(100, Math.round((totalSlots / maxCapacity) * 100)) : 0;

  if (counterEl) {
    counterEl.textContent = `${totalSlots} / ${maxCapacity} slot${maxCapacity > 1 ? "s" : ""}`;
  }
  if (fillEl) {
    fillEl.style.width = `${pct}%`;
    fillEl.style.background =
      state.forge.category === "weapon" && totalSlots > state.forge.bonus
        ? "var(--color-danger)"
        : "linear-gradient(90deg, var(--accent-gold), var(--accent-ember))";
  }

  // Invalid banner
  const invalidBanner = document.getElementById("forge-invalid-banner");
  const quoteBody = document.getElementById("forge-quote-body");

  if (!quote.valid) {
    if (invalidBanner) {
      invalidBanner.classList.remove("hidden");
      const msg = document.getElementById("forge-invalid-msg");
      if (msg) {
        msg.textContent = `Une arme +${state.forge.bonus} ne peut pas accueillir ${totalSlots} slots (ADR-0002 : S ≤ B). Retirez ${totalSlots - state.forge.bonus} slot(s).`;
      }
    }
    if (quoteBody) quoteBody.style.opacity = "0.5";
    return;
  }

  if (invalidBanner) invalidBanner.classList.add("hidden");
  if (quoteBody) quoteBody.style.opacity = "1";

  // Display metrics
  const baseEl = document.getElementById("quote-base-level");
  const slotsEl = document.getElementById("quote-slots");
  const effEl = document.getElementById("quote-effective-level");
  const ceilingEl = document.getElementById("quote-ceiling-price");

  if (baseEl) baseEl.textContent = String(quote.baseLevel);
  if (slotsEl) slotsEl.textContent = String(totalSlots);
  if (effEl) effEl.textContent = String(quote.effectiveLevel);
  if (ceilingEl) ceilingEl.textContent = quote.ceilingPrice.toLocaleString("fr-FR");

  // Upgrade mode calculation
  const upgradeBox = document.getElementById("upgrade-cost-box");
  const upgradeVal = document.getElementById("upgrade-cost-val");

  if (state.forge.isUpgradeMode) {
    const upgradeQuote = calculateUpgradeQuote(
      {
        category: state.forge.category,
        bonus: state.forge.initialBonus,
        slots: state.forge.initialSlots
      },
      {
        category: state.forge.category,
        bonus: state.forge.bonus,
        slots: totalSlots
      }
    );

    if (upgradeBox && upgradeVal) {
      upgradeBox.classList.remove("hidden");
      if (upgradeQuote.valid) {
        upgradeVal.textContent = `${upgradeQuote.upgradeCost.toLocaleString("fr-FR")} po`;
      } else {
        upgradeVal.textContent = "Amélioration impossible";
      }
    }
  } else if (upgradeBox) {
    upgradeBox.classList.add("hidden");
  }
}

function initForgeEvents(): void {
  const categorySelect = document.getElementById("forge-category") as HTMLSelectElement | null;
  categorySelect?.addEventListener("change", (e) => {
    state.forge.category = (e.target as HTMLSelectElement).value as ItemCategory;
    state.forge.selectedEnchantmentIds.clear();
    renderForgeEnchantments();
    updateForgeCalculations();
  });

  const bonusChips = document.querySelectorAll<HTMLButtonElement>(".bonus-chip");
  bonusChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      bonusChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const b = parseInt(chip.dataset.bonus ?? "0", 10);
      state.forge.bonus = b;
      updateForgeCalculations();
    });
  });

  const toggleUpgradeBtn = document.getElementById("toggle-upgrade-mode");
  const upgradeFields = document.getElementById("upgrade-fields");
  toggleUpgradeBtn?.addEventListener("click", () => {
    state.forge.isUpgradeMode = !state.forge.isUpgradeMode;
    upgradeFields?.classList.toggle("hidden", !state.forge.isUpgradeMode);
    updateForgeCalculations();
  });

  const initBonusSelect = document.getElementById("upgrade-initial-bonus") as HTMLSelectElement | null;
  initBonusSelect?.addEventListener("change", (e) => {
    state.forge.initialBonus = parseInt((e.target as HTMLSelectElement).value, 10);
    updateForgeCalculations();
  });

  const initSlotsInput = document.getElementById("upgrade-initial-slots") as HTMLInputElement | null;
  initSlotsInput?.addEventListener("input", (e) => {
    state.forge.initialSlots = parseInt((e.target as HTMLInputElement).value || "0", 10);
    updateForgeCalculations();
  });

  const sendToMarketBtn = document.getElementById("send-to-market-btn");
  sendToMarketBtn?.addEventListener("click", () => {
    let totalSlots = 0;
    state.forge.selectedEnchantmentIds.forEach((id) => {
      const p = ENCHANTMENT_PROPERTIES.find((item) => item.id === id);
      if (p) totalSlots += p.slotCost;
    });

    const quote = calculateForgeQuote({
      category: state.forge.category,
      bonus: state.forge.bonus,
      slots: totalSlots
    });

    if (quote.valid) {
      state.market.ceilingPrice = quote.ceilingPrice;
      const marketCeilingInput = document.getElementById("market-ceiling-input") as HTMLInputElement | null;
      if (marketCeilingInput) {
        marketCeilingInput.value = String(quote.ceilingPrice);
      }
      switchTab("tab-btn-market");
      updateMarketCalculations();
    }
  });

  renderForgeEnchantments();
  updateForgeCalculations();
}

// Market Logic
function updateMarketCalculations(): void {
  const result = simulateMarketTransaction(state.market.ceilingPrice, state.market.d20);
  state.market.result = result;

  const dieDisplay = document.getElementById("die-display");
  const outcomeTitle = document.getElementById("market-outcome-title");
  const ratioDesc = document.getElementById("market-ratio-desc");
  const finalPriceEl = document.getElementById("market-final-price");
  const savingsEl = document.getElementById("market-savings");
  const complicationCard = document.getElementById("market-complication-card");
  const complicationText = document.getElementById("complication-text");
  const complicationLevel = document.getElementById("complication-level");

  if (dieDisplay) {
    dieDisplay.textContent = String(result.d20);
    dieDisplay.setAttribute("aria-label", `Résultat du dé : ${result.d20}`);
  }

  if (outcomeTitle) outcomeTitle.textContent = result.narrativeLabel;
  if (ratioDesc) {
    ratioDesc.textContent =
      result.discountPercent > 0
        ? `Remise de ${result.discountPercent} % appliquée (taux : ${(result.ratio * 100).toFixed(0)} %)`
        : "Plafond atteint (100 %)";
  }

  if (finalPriceEl) {
    finalPriceEl.textContent = result.finalPrice.toLocaleString("fr-FR");
  }

  const saved = Math.max(0, result.ceilingPrice - result.finalPrice);
  if (savingsEl) {
    savingsEl.textContent = `${saved.toLocaleString("fr-FR")} po`;
  }

  if (complicationCard && complicationText && complicationLevel) {
    if (result.hasComplication && result.complicationDescription) {
      complicationCard.classList.remove("hidden");
      complicationLevel.textContent =
        result.d20 === 20 ? "Quête Arcanique (d20 = 20)" : result.d20 >= 18 ? "Incident d'Atelier (d20 = 18-19)" : "Composant Requis (d20 = 16-17)";
      complicationText.textContent = result.complicationDescription;
    } else {
      complicationCard.classList.add("hidden");
    }
  }

  announce(`Résultat du dé ${result.d20} : prix final ${result.finalPrice} po.`);
}

function initMarketEvents(): void {
  const ceilingInput = document.getElementById("market-ceiling-input") as HTMLInputElement | null;
  ceilingInput?.addEventListener("input", (e) => {
    state.market.ceilingPrice = Math.max(0, parseInt((e.target as HTMLInputElement).value || "0", 10));
    updateMarketCalculations();
  });

  const slider = document.getElementById("market-d20-slider") as HTMLInputElement | null;
  const numInput = document.getElementById("market-d20-number") as HTMLInputElement | null;

  slider?.addEventListener("input", (e) => {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    state.market.d20 = val;
    if (numInput) numInput.value = String(val);
    updateMarketCalculations();
  });

  numInput?.addEventListener("input", (e) => {
    const val = Math.max(1, Math.min(20, parseInt((e.target as HTMLInputElement).value || "1", 10)));
    state.market.d20 = val;
    if (slider) slider.value = String(val);
    updateMarketCalculations();
  });

  const rollBtn = document.getElementById("roll-d20-btn");
  rollBtn?.addEventListener("click", () => {
    const roll = rollMarketD20();
    state.market.d20 = roll;
    if (slider) slider.value = String(roll);
    if (numInput) numInput.value = String(roll);

    const dieDisplay = document.getElementById("die-display");
    if (dieDisplay) {
      dieDisplay.style.transform = "rotate(360deg) scale(1.1)";
      setTimeout(() => {
        dieDisplay.style.transform = "rotate(0deg) scale(1)";
      }, 200);
    }

    updateMarketCalculations();
  });

  updateMarketCalculations();
}

// Consumables Logic
function updateConsumablesCalculations(): void {
  const quote = calculateAmmunitionQuote({
    quantity: state.ammo.quantity,
    bonus: state.ammo.bonus,
    slots: 0,
    unbreakable: state.ammo.unbreakable,
    forceful: state.ammo.forceful,
    silvered: state.ammo.silvered
  });

  const unitPriceEl = document.getElementById("ammo-unit-price");
  const totalCeilingEl = document.getElementById("ammo-total-ceiling");

  if (quote.valid) {
    if (unitPriceEl) unitPriceEl.textContent = `${quote.totalUnitPrice} po / munition`;
    if (totalCeilingEl) totalCeilingEl.textContent = `${quote.ceilingPrice.toLocaleString("fr-FR")} po`;
  }

  // Update Potions
  const tiers: PotionTier[] = ["common", "uncommon", "rare", "very_rare"];
  const ids = ["price-potion-common", "price-potion-uncommon", "price-potion-rare", "price-potion-very-rare"];

  tiers.forEach((tier, idx) => {
    const potQuote = calculatePotionQuote(tier, state.potionVariant, 1);
    const el = document.getElementById(ids[idx]);
    if (el) {
      el.textContent = `${potQuote.unitPrice.toLocaleString("fr-FR")} po`;
    }
  });
}

function initConsumablesEvents(): void {
  const qtyInput = document.getElementById("ammo-quantity") as HTMLInputElement | null;
  qtyInput?.addEventListener("input", (e) => {
    state.ammo.quantity = Math.max(1, parseInt((e.target as HTMLInputElement).value || "1", 10));
    updateConsumablesCalculations();
  });

  const bonusSelect = document.getElementById("ammo-bonus") as HTMLSelectElement | null;
  bonusSelect?.addEventListener("change", (e) => {
    state.ammo.bonus = parseInt((e.target as HTMLSelectElement).value, 10);
    updateConsumablesCalculations();
  });

  const unbreakableCheck = document.getElementById("ammo-unbreakable") as HTMLInputElement | null;
  unbreakableCheck?.addEventListener("change", (e) => {
    state.ammo.unbreakable = (e.target as HTMLInputElement).checked;
    updateConsumablesCalculations();
  });

  const forcefulCheck = document.getElementById("ammo-forceful") as HTMLInputElement | null;
  forcefulCheck?.addEventListener("change", (e) => {
    state.ammo.forceful = (e.target as HTMLInputElement).checked;
    updateConsumablesCalculations();
  });

  const silveredCheck = document.getElementById("ammo-silvered") as HTMLInputElement | null;
  silveredCheck?.addEventListener("change", (e) => {
    state.ammo.silvered = (e.target as HTMLInputElement).checked;
    updateConsumablesCalculations();
  });

  const variantSelect = document.getElementById("potion-variant-toggle") as HTMLSelectElement | null;
  variantSelect?.addEventListener("change", (e) => {
    state.potionVariant = (e.target as HTMLSelectElement).value as PotionRuleVariant;
    updateConsumablesCalculations();
  });

  const sendAmmoBtn = document.getElementById("send-ammo-to-market");
  sendAmmoBtn?.addEventListener("click", () => {
    const quote = calculateAmmunitionQuote({
      quantity: state.ammo.quantity,
      bonus: state.ammo.bonus,
      slots: 0,
      unbreakable: state.ammo.unbreakable,
      forceful: state.ammo.forceful,
      silvered: state.ammo.silvered
    });

    if (quote.valid) {
      state.market.ceilingPrice = quote.ceilingPrice;
      const marketCeilingInput = document.getElementById("market-ceiling-input") as HTMLInputElement | null;
      if (marketCeilingInput) {
        marketCeilingInput.value = String(quote.ceilingPrice);
      }
      switchTab("tab-btn-market");
      updateMarketCalculations();
    }
  });

  updateConsumablesCalculations();
}

// Catalog Logic
function renderCatalog(): void {
  const grid = document.getElementById("catalog-results-grid");
  if (!grid) return;

  const entries = searchCatalog({
    query: state.catalog.query,
    category: state.catalog.category
  });

  grid.innerHTML = "";

  if (entries.length === 0) {
    grid.innerHTML = `
      <div class="empty-catalog-notice" style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted);">
        Aucun enchantement ou objet ne correspond à votre recherche.
      </div>
    `;
    return;
  }

  entries.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "catalog-card";

    const isEnchantment = entry.kind === "enchantment";
    const slotBadge = isEnchantment
      ? `<span class="slot-tag">${entry.slotCost} slot${entry.slotCost > 1 ? "s" : ""}</span>`
      : `<span class="slot-tag">Niveau N=${entry.effectiveLevel}</span>`;

    const priceBadge = !isEnchantment
      ? `<strong style="color: var(--accent-gold); font-family: var(--font-mono);">${entry.ceilingPrice.toLocaleString("fr-FR")} po</strong>`
      : "";

    card.innerHTML = `
      <div>
        <div class="catalog-card-header">
          <span class="catalog-card-title">${entry.name}</span>
          ${slotBadge}
        </div>
        <div class="catalog-card-body">
          <p>${entry.summary}</p>
          <p class="catalog-card-rules">${entry.technicalRules}</p>
        </div>
      </div>
      <div class="catalog-card-footer">
        <span class="rarity-badge ${entry.rarity}">${entry.rarity}</span>
        ${priceBadge}
      </div>
    `;

    grid.appendChild(card);
  });
}

function initCatalogEvents(): void {
  const searchInput = document.getElementById("catalog-search-input") as HTMLInputElement | null;
  searchInput?.addEventListener("input", (e) => {
    state.catalog.query = (e.target as HTMLInputElement).value;
    renderCatalog();
  });

  const chips = document.querySelectorAll<HTMLButtonElement>(".filter-chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const cat = chip.dataset.cat;
      state.catalog.category = cat === "all" ? undefined : (cat as ItemCategory);
      renderCatalog();
    });
  });

  renderCatalog();
}

// Lifecycle Init
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initForgeEvents();
  initMarketEvents();
  initConsumablesEvents();
  initCatalogEvents();
});
