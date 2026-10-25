import React, { useState, useId } from 'react';
import { ENCHANTMENT_CATALOG } from '../domain/catalog';
import { ItemCategory } from '../domain/forge';

export const GrimoireCatalog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ItemCategory>('ALL');
  const [slotFilter, setSlotFilter] = useState<'ALL' | number>('ALL');

  const searchId = useId();
  const categoryFilterId = useId();
  const slotFilterId = useId();

  const filteredEnchantments = ENCHANTMENT_CATALOG.filter((ench) => {
    const matchesCategory =
      categoryFilter === 'ALL' || ench.applicableCategories.includes(categoryFilter);
    const matchesSlot = slotFilter === 'ALL' || ench.slots === slotFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ench.name.toLowerCase().includes(q) ||
      ench.description.toLowerCase().includes(q);
    return matchesCategory && matchesSlot && matchesSearch;
  });

  const formatCategory = (cat: ItemCategory) => {
    switch (cat) {
      case 'WEAPON':
        return 'Arme';
      case 'ARMOR_SHIELD':
        return 'Armure / Bouclier';
      case 'WONDROUS_ITEM':
        return 'Objet Autonome';
    }
  };

  return (
    <section className="card" aria-labelledby="grimoire-heading">
      <h2 id="grimoire-heading" className="card-title">
        📜 Grimoire des Enchantements Arcaniques
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Consultez l'encyclopédie des enchantements calibrés en slots d'harmonisation.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <label htmlFor={searchId} className="form-label">
            Rechercher un effet
          </label>
          <input
            id={searchId}
            type="search"
            className="form-input"
            placeholder="Ex : Sournoise, bouclier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor={categoryFilterId} className="form-label">
            Filtrer par catégorie
          </label>
          <select
            id={categoryFilterId}
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'ALL' | ItemCategory)}
          >
            <option value="ALL">Toutes les catégories</option>
            <option value="WEAPON">Armes</option>
            <option value="ARMOR_SHIELD">Armures / Boucliers</option>
            <option value="WONDROUS_ITEM">Objets Autonomes</option>
          </select>
        </div>

        <div>
          <label htmlFor={slotFilterId} className="form-label">
            Filtrer par coût en slots
          </label>
          <select
            id={slotFilterId}
            className="form-select"
            value={slotFilter}
            onChange={(e) =>
              setSlotFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
            }
          >
            <option value="ALL">Tous les slots</option>
            <option value={1}>1 slot</option>
            <option value={2}>2 slots</option>
            <option value={3}>3 slots</option>
            <option value={4}>4 slots</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
        {filteredEnchantments.length} enchantement(s) trouvé(s)
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {filteredEnchantments.map((ench) => (
          <article
            key={ench.id}
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary-light)' }}>
                {ench.name}
              </h3>
              <span className="enchantment-badge">{ench.slots} {ench.slots > 1 ? 'slots' : 'slot'}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {ench.applicableCategories.map((c) => (
                <span key={c} className="badge badge-info">
                  {formatCategory(c)}
                </span>
              ))}
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              {ench.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};
