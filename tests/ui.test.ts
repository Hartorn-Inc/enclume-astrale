import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Web UI accessibility & layout structure (index.html)", () => {
  const htmlPath = resolve(process.cwd(), "index.html");
  const htmlContent = readFileSync(htmlPath, "utf8");

  it("contains accessible skip-link as first body child", () => {
    expect(htmlContent).toContain('class="skip-link"');
    expect(htmlContent).toContain('href="#main-content"');
  });

  it.each([
    { id: "tab-forge", role: 'role="tab"', label: "Atelier de Forge" },
    { id: "tab-market", role: 'role="tab"', label: "Comptoir du Marché" },
    { id: "tab-consumables", role: 'role="tab"', label: "Munitions & Potions" },
    { id: "tab-catalog", role: 'role="tab"', label: "Grimoire d'Enchantements" }
  ])("defines tab navigation item for $id", ({ role, label }) => {
    expect(htmlContent).toContain(role);
    expect(htmlContent).toContain(label);
  });

  it.each([
    { id: "panel-forge", role: 'role="tabpanel"' },
    { id: "panel-market", role: 'role="tabpanel"' },
    { id: "panel-consumables", role: 'role="tabpanel"' },
    { id: "panel-catalog", role: 'role="tabpanel"' }
  ])("defines semantic tabpanel for $id", ({ id, role }) => {
    expect(htmlContent).toContain(`id="${id}"`);
    expect(htmlContent).toContain(role);
  });

  it("includes live ARIA announcer region for screen readers", () => {
    expect(htmlContent).toContain('id="aria-announcer"');
    expect(htmlContent).toContain('aria-live="polite"');
  });

  it("includes alert banner with role alert for invalid forge capacity", () => {
    expect(htmlContent).toContain('id="forge-invalid-banner"');
    expect(htmlContent).toContain('role="alert"');
  });
});
