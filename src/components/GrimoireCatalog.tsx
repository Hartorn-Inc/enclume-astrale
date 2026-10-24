import React, { useState } from 'react';
import { ItemCategory } from '../domain/types';
import { ENCHANTMENT_CATALOG } from '../domain/catalog';

export const GrimoireCatalog: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<ItemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEnchantments = ENCHANTMENT_CATALOG.filter((ench) => {
    const matchesCategory =
      filterCategory === 'all' || ench.compatibleCategories.includes(filterCategory);
    const matchesSearch =
      ench.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ench.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section aria-labelledby="grimoire-title">
      <div className="card">
        <h2 id="grimoire-title" className="card-title">
          Grimoire d'Enchantements & Répertoire de Slots
        </h2>
        <p className="form-hint" style={{ marginBottom: '1.5rem' }}>
          Chaque enchantement consomme des slots d'artisanat (S). Pour les armes, le total des slots ne peut jamais excéder le bonus d'altération (S &le; B).
        </p>

        <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="grimoire-filter-cat">
              Filtrer par catégorie compatible
            </label>
            <select
              id="grimoire-filter-cat"
              className="form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as ItemCategory | 'all')}
            >
              <option value="all">Toutes les catégories</option>
              <option value="weapon">Armes</option>
              <option value="armor_shield">Armures & Boucliers</option>
              <option value="standalone">Objets autonomes</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="grimoire-search">
              Rechercher par nom ou effet
            </label>
            <input
              id="grimoire-search"
              type="search"
              className="form-input"
              placeholder="Ex: Sournoise, flammes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
          data-testid="grimoire-list"
        >
          {filteredEnchantments.map((ench) => (
            <div
              key={ench.id}
              className="card"
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ color: 'var(--text-gold)', fontSize: '1.1rem' }}>{ench.name}</h3>
                <span
                  style={{
                    background: 'var(--bg-primary)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {ench.slotCost} slot{ench.slotCost > 1 ? 's' : ''}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.6rem 0' }}>
                {ench.description}
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)' }}>
                Compatible : {ench.compatibleCategories.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
