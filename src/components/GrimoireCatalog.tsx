import React, { useState } from 'react';
import {
  ENCHANTMENT_CATALOG,
  EnchantmentCategory,
  EnchantmentDefinition,
} from '../domain/catalog';

interface GrimoireCatalogProps {
  onSelectEnchantment?: (ench: EnchantmentDefinition) => void;
}

export const GrimoireCatalog: React.FC<GrimoireCatalogProps> = ({
  onSelectEnchantment,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [slotCostFilter, setSlotCostFilter] = useState<string>('ALL');

  const filtered = ENCHANTMENT_CATALOG.filter((item) => {
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(query);
      const matchesDesc = item.description.toLowerCase().includes(query);
      const matchesLore = item.loreEffect.toLowerCase().includes(query);
      if (!matchesName && !matchesDesc && !matchesLore) return false;
    }

    if (categoryFilter !== 'ALL') {
      if (!item.targetCategories.includes(categoryFilter as EnchantmentCategory)) {
        return false;
      }
    }

    if (slotCostFilter !== 'ALL') {
      if (item.slotCost !== Number(slotCostFilter)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="grimoire-catalog">
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="card-title">Filtres du Grimoire</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="search-input" className="form-label">
              Recherche par mot-clé
            </label>
            <input
              id="search-input"
              type="text"
              className="form-input"
              placeholder="Ex: Sournoise, feu, défense..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="filter-category" className="form-label">
              Catégorie cible
            </label>
            <select
              id="filter-category"
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">Toutes les catégories</option>
              <option value="WEAPON">Armes</option>
              <option value="ARMOR">Armures</option>
              <option value="SHIELD">Boucliers</option>
              <option value="FOCUS">Focalisateurs</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="filter-slot" className="form-label">
              Coût en Slots
            </label>
            <select
              id="filter-slot"
              className="form-select"
              value={slotCostFilter}
              onChange={(e) => setSlotCostFilter(e.target.value)}
            >
              <option value="ALL">Tous les coûts</option>
              <option value="1">1 Slot</option>
              <option value="2">2 Slots</option>
              <option value="3">3 Slots</option>
              <option value="4">4 Slots</option>
            </select>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {filtered.map((item) => (
          <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', fontSize: '1.15rem' }}>
                  {item.name}
                </h3>
                <span className="badge badge-gold">{`${item.slotCost} slot${item.slotCost > 1 ? 's' : ''}`}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {item.targetCategories.map((cat) => (
                  <span key={cat} className="badge badge-arcane">
                    {cat}
                  </span>
                ))}
              </div>

              <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                {item.description}
              </p>

              <div
                style={{
                  background: 'var(--color-bg-surface-elevated)',
                  padding: '0.6rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  borderLeft: '3px solid var(--color-gold)',
                }}
              >
                <strong>Effet d'atelier : </strong>
                <span>{item.loreEffect}</span>
              </div>
            </div>

            {onSelectEnchantment && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: '1rem', width: '100%' }}
                onClick={() => onSelectEnchantment(item)}
              >
                Ajouter au calculateur
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
