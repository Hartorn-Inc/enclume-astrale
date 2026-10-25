import React, { useState } from 'react';
import { ItemCategory } from '../domain/forge';
import { ENCHANTMENTS_CATALOG, EnchantmentDefinition } from '../domain/catalog';

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  WEAPON: 'Armes',
  ARMOR_SHIELD: 'Armures & Boucliers',
  WONDROUS_ITEM: 'Objets Autonomes',
};

export const GrimoireCatalog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ItemCategory>('ALL');
  const [slotFilter, setSlotFilter] = useState<number | 'ALL'>('ALL');

  const filtered = ENCHANTMENTS_CATALOG.filter((item: EnchantmentDefinition) => {
    if (categoryFilter !== 'ALL' && !item.applicableCategories.includes(categoryFilter)) {
      return false;
    }
    if (slotFilter !== 'ALL' && item.slotCost !== slotFilter) {
      return false;
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesDesc = item.description.toLowerCase().includes(q);
      return matchesName || matchesDesc;
    }
    return true;
  });

  return (
    <section aria-labelledby="grimoire-heading" className="card">
      <header className="card-header">
        <h2 id="grimoire-heading" className="card-title">
          Grimoire d&apos;Enchantements Arcaniques
        </h2>
        <p className="card-description">
          Consultation des enchantements par catégorie, mot-clé et coût en slots de forge.
        </p>
      </header>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="grimoire-search">Recherche par mot-clé</label>
          <input
            id="grimoire-search"
            type="search"
            className="form-control"
            placeholder="Ex: feu, résonance, parade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="grimoire-cat-filter">Catégorie d&apos;équipement</label>
          <select
            id="grimoire-cat-filter"
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
          <label htmlFor="grimoire-slot-filter">Coût en slots</label>
          <select
            id="grimoire-slot-filter"
            className="form-control"
            value={slotFilter}
            onChange={(e) => {
              const val = e.target.value;
              setSlotFilter(val === 'ALL' ? 'ALL' : parseInt(val, 10));
            }}
          >
            <option value="ALL">Tous les coûts</option>
            <option value="1">1 slot</option>
            <option value="2">2 slots</option>
            <option value="3">3 slots</option>
            <option value="4">4 slots</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {filtered.length} enchantement{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
      </div>

      <div className="enchantment-list">
        {filtered.map((item) => (
          <article key={item.id} className="card" style={{ background: 'var(--bg-main)', margin: 0 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--accent)', fontWeight: 600 }}>{item.name}</h3>
              <span className="badge badge-gold">{item.slotCost} slot{item.slotCost > 1 ? 's' : ''}</span>
            </header>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
              {item.applicableCategories.map((cat) => (
                <span key={cat} className="badge">
                  {CATEGORY_LABELS[cat]}
                </span>
              ))}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
