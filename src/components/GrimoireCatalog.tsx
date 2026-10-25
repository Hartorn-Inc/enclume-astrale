import React, { useState } from 'react';
import {
  ENCHANTMENT_CATALOG,
  type EnchantmentDefinition,
} from '../domain/catalog';
import type { ItemCategory } from '../domain/forge';

export interface GrimoireCatalogProps {
  onSelectEnchantment?: (id: string, category: ItemCategory) => void;
  selectedIds?: string[];
}

export const GrimoireCatalog: React.FC<GrimoireCatalogProps> = ({
  onSelectEnchantment,
  selectedIds = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ItemCategory>('ALL');
  const [slotFilter, setSlotFilter] = useState<number | 'ALL'>('ALL');

  const filteredEnchantments: EnchantmentDefinition[] = ENCHANTMENT_CATALOG.filter((ench) => {
    if (categoryFilter !== 'ALL' && !ench.categories.includes(categoryFilter)) {
      return false;
    }
    if (slotFilter !== 'ALL' && ench.cost !== slotFilter) {
      return false;
    }
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      const matchesName = ench.name.toLowerCase().includes(query);
      const matchesDesc = ench.description.toLowerCase().includes(query);
      if (!matchesName && !matchesDesc) {
        return false;
      }
    }
    return true;
  });

  return (
    <section aria-labelledby="grimoire-section-title">
      <h2 id="grimoire-section-title" className="section-title">
        📜 Grimoire des Enchantements Arcaniques
      </h2>

      <div className="section-card">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="grimoire-search">Recherche par nom ou mot-clé :</label>
            <input
              id="grimoire-search"
              type="search"
              className="form-control"
              placeholder="Ex : Vorpaline, armure, feu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="grimoire-category-filter">Filtrer par catégorie :</label>
            <select
              id="grimoire-category-filter"
              className="form-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'ALL' | ItemCategory)}
            >
              <option value="ALL">Toutes les catégories</option>
              <option value="WEAPON">Armes</option>
              <option value="ARMOR_SHIELD">Armures / Boucliers</option>
              <option value="WONDROUS_ITEM">Objets autonomes</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="grimoire-slot-filter">Coût en slots :</label>
            <select
              id="grimoire-slot-filter"
              className="form-control"
              value={slotFilter.toString()}
              onChange={(e) => {
                const val = e.target.value;
                setSlotFilter(val === 'ALL' ? 'ALL' : parseInt(val, 10));
              }}
            >
              <option value="ALL">Tous les coûts (1 à 4 slots)</option>
              <option value="1">1 slot</option>
              <option value="2">2 slots</option>
              <option value="3">3 slots</option>
              <option value="4">4 slots</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {`${filteredEnchantments.length} enchantement${filteredEnchantments.length > 1 ? 's' : ''} trouvé${filteredEnchantments.length > 1 ? 's' : ''}.`}
        </div>
      </div>

      <div className="grimoire-grid">
        {filteredEnchantments.map((ench) => {
          const isSelected = selectedIds.includes(ench.id);
          return (
            <article key={ench.id} className="grimoire-card" aria-labelledby={`ench-title-${ench.id}`}>
              <div>
                <div className="grimoire-card-header">
                  <h3 id={`ench-title-${ench.id}`}>{ench.name}</h3>
                  <span className="badge badge-gold">{`${ench.cost} slot${ench.cost > 1 ? 's' : ''}`}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
                  {ench.categories.map((cat) => (
                    <span key={cat} className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                      {cat === 'WEAPON' ? 'Arme' : cat === 'ARMOR_SHIELD' ? 'Armure / Bouclier' : 'Autonome'}
                    </span>
                  ))}
                </div>
                <p>{ench.description}</p>
              </div>

              {onSelectEnchantment && (
                <button
                  type="button"
                  className={`btn btn-small ${isSelected ? 'btn-gold' : 'btn-outline'}`}
                  onClick={() => onSelectEnchantment(ench.id, ench.categories[0])}
                  style={{ width: '100%' }}
                >
                  {isSelected ? '✓ Équipé dans la Forge' : 'Équiper dans la Forge'}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};
