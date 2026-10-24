# L'Enclume Astrale — Système de Design & Principes UX/UI

Système de design et conventions visuelles pour l'application web statique « L'Enclume Astrale », outil d'artisanat arcanique et de commerce magique (D&D 5e / D&D 3.5).

## 1. Direction Artistique & Thème Cosmique/Forge

L'identité visuelle évoque une forge céleste et arcanique : acier sombre, bronze chaud, braise mystique, reflets astraux dorés et bleu nuit profond.

### Palette de Jetons CSS (Design Tokens)

```css
:root {
  /* Arrière-plans & Surfaces */
  --bg-cosmos: #0c0f17;
  --bg-surface: #141926;
  --bg-surface-elevated: #1b2234;
  --bg-surface-overlay: #232c42;
  
  /* Bordures & Séparateurs */
  --border-subtle: #2a344d;
  --border-prominent: #43537a;
  --border-focus: #e5a93b;
  
  /* Textes & Contraste (conforme WCAG 2.1 AA >= 4.5:1) */
  --text-primary: #f0f4fc;
  --text-secondary: #a3b1cc;
  --text-muted: #74839f;
  --text-inverse: #0c0f17;
  
  /* Accents d'enchantement & Statuts */
  --accent-gold: #f5b73d;
  --accent-gold-hover: #e09f2b;
  --accent-bronze: #c87a3e;
  --accent-ember: #e65c36;
  --accent-astral: #5e81f4;
  --accent-astral-glow: rgba(94, 129, 244, 0.25);
  
  /* Sémantique métier */
  --color-success: #2ecc71;
  --color-warning: #f39c12;
  --color-danger: #e74c3c;
  --color-info: #3498db;
  
  /* Typographie */
  --font-heading: 'Cinzel', 'MedievalSharp', 'Georgia', serif;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Espacements & Rayons */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  --shadow-card: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 16px rgba(245, 183, 61, 0.2);
}
```

## 2. Principes Fondamentaux d'Accessibilité (WCAG 2.1 AA)

1. **Rapport de contraste strict** : tout texte standard bénéficie d'un contraste supérieur ou égal à 4,5:1 contre son fond ; le texte agrandi (≥ 18pt ou 14pt gras) respecte au moins 3:0:1.
2. **Navigation intégrale au clavier** : focus visible matérialisé par un anneau doré `--border-focus` (outline 2px solid avec offset de 2px) sur tous les éléments interactifs.
3. **Balises sémantiques et ARIA** :
   - Structure sémantique claire : `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`.
   - Attributs `aria-label`, `aria-describedby` et `aria-invalid` sur tous les champs de calcul et de sélection.
   - Régions en direct (`aria-live="polite"`) pour annoncer les mises à jour de devis et les résultats de tirages de marché.
4. **Indépendance des couleurs** : aucune information critique (invalidation de slots, incident de fabrication) n'est communiquée exclusivement par la couleur ; une icône explicite et un texte descriptif accompagnent chaque message d'état.

## 3. États Obligatoires des Composants

Conformément au standard Impeccable, chaque vue et composant interactif implémente rigoureusement ses 4 états :
1. **État Normal (Idle)** : affichage net et lisible des données.
2. **État Actif / Interaction (Focus, Hover, Active)** : feedback immédiat avec transition fluide (150ms).
3. **État Invalide / Erreur (Invalid / Error)** : encadrement `--color-danger`, message explicatif avec code sémantique (ex: dépassement de slots `S > B`).
4. **État Vide / Neutre (Empty state)** : invitation explicite à l'action pour guider l'utilisateur lorsqu'aucun objet ou enchantement n'est encore sélectionné.

## 4. Adaptabilité Mobile & Responsive Layout

- **Approche Mobile-First** : grille flexible CSS Grid / Flexbox s'adaptant des smartphones (320px) aux écrans larges (1440px+).
- **Zéro débordement horizontal** (`overflow-x: hidden` contrôlé).
- **Zones tactiles confortables** : cibles de clic d'au moins 44×44px sur mobile.
- **Organisation en onglets / panneaux** :
  - *Atelier de Forge* : configurateur d'armes, armures, boucliers et sélection de slots.
  - *Comptoir du Marché* : simulateur de tirage d20 avec remises et complications narratives.
  - *Armurerie de Munitions & Consommables* : calculateur de lots de flèches et potions.
  - *Grimoire des Enchantements* : catalogue d'effets magiques répertoriés avec filtres de rareté.
