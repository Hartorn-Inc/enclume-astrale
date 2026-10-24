import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from '../src/App';
import { ForgeCalculator } from '../src/components/ForgeCalculator';
import { MarketSimulator } from '../src/components/MarketSimulator';
import { MunitionsConsumables } from '../src/components/MunitionsConsumables';
import { GrimoireCatalog } from '../src/components/GrimoireCatalog';

// Mock localStorage en environnement node
class MemoryLocalStorage {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

const originalLocalStorage = globalThis.localStorage;

beforeEach(() => {
  globalThis.localStorage = new MemoryLocalStorage() as unknown as Storage;
});

afterEach(() => {
  globalThis.localStorage = originalLocalStorage;
});

describe('Application globale L\'Enclume Astrale & Navigation', () => {
  it('génère le HTML initial avec le titre de marque et les 4 onglets', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("L&#x27;Enclume Astrale");
    expect(html).toContain('Calculateur de Forge');
    expect(html).toContain('Simulateur de Marché (d20)');
    expect(html).toContain('Munitions &amp; Consommables');
    expect(html).toContain("Grimoire d&#x27;Enchantements");
  });

  it('affiche le calculateur de forge par défaut', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("Atelier d&#x27;Artisanat &amp; Économie de Forge");
    expect(html).toContain('Plafond de Devis Garanti :');
  });
});

describe('Composant ForgeCalculator — Intégrité S <= B et devis', () => {
  it('affiche le prix pour une arme +1 nue (1 000 po)', () => {
    const html = renderToStaticMarkup(<ForgeCalculator />);
    expect(html).toContain('1&nbsp;000 po');
  });

  it.each([
    ['weapon', 'Arme (Coefficient 1.00)'],
    ['armor_shield', 'Armure / Bouclier (Coefficient 0.85)'],
    ['standalone', 'Autre objet autonome permanent (Coefficient 0.80)'],
  ])('propose la categorie %s avec libellé %s', (_cat, label) => {
    const html = renderToStaticMarkup(<ForgeCalculator />);
    expect(html).toContain(label);
  });
});

describe('Composant MarketSimulator — Règle du d20 et complications', () => {
  it.each([
    [1000, 'Prix Plafond Annoncé (po)'],
    [25000, 'Résultat de la Négociation'],
  ])('initialise le simulateur avec plafond %i', (ceiling, expectedContent) => {
    const html = renderToStaticMarkup(<MarketSimulator defaultCeilingPrice={ceiling} />);
    expect(html).toContain(expectedContent);
  });
});

describe('Composant MunitionsConsumables — Lots et switch de règle', () => {
  it('affiche le switch D&D 5e Standard vs Révision 2024', () => {
    const html = renderToStaticMarkup(<MunitionsConsumables />);
    expect(html).toContain('D&amp;D 5e Standard');
    expect(html).toContain('Révision 2024');
    expect(html).toContain('Forge de Munitions Enchantées');
    expect(html).toContain('Alchimie &amp; Dispensaire de Soins');
  });
});

describe('Composant GrimoireCatalog — Filtrage et liste de sorts', () => {
  it('énumère les enchantements du catalogue', () => {
    const html = renderToStaticMarkup(<GrimoireCatalog />);
    expect(html).toContain('Sournoise');
    expect(html).toContain('Frugale');
    expect(html).toContain('Flamboyante');
    expect(html).toContain('Tonitruante');
    expect(html).toContain('Fortification Astrale');
  });
});

describe('Persistance localStorage', () => {
  it('charge sans erreur un historique préalablement sauvegardé en localStorage', () => {
    const mockHistory = [
      {
        id: 'test-1',
        date: '01/01/2025 12:00',
        label: 'Épée +2 avec Sournoise',
        ceilingPrice: 25000,
      },
    ];
    globalThis.localStorage.setItem('astral_anvil_saved_quotes_v1', JSON.stringify(mockHistory));

    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('Registre Local des Devis Récents (1)');
    expect(html).toContain('Épée +2 avec Sournoise');
    expect(html).toContain('25&nbsp;000 po');
  });
});
