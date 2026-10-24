# ⚒ L'Enclume Astrale

Application web statique responsive d'artisanat arcanique et d'économie des objets magiques pour **D&D 5e / D&D 3.5**, déployée sur **GitHub Pages**.

🔗 **Application en ligne :** [https://hartorn-inc.github.io/enclume-astrale/](https://hartorn-inc.github.io/enclume-astrale/)

---

## 🌟 Fonctionnalités

1. **Atelier de Forge Arcanique**
   - Calculateur quadratique exact : `P_plafond = C × 1 000 × N² po`, avec niveau triangulaire `T(B) = B(B+1)/2` et `N = T(B) + S`.
   - Coefficients par catégorie : Armes (1,00), Armures & Boucliers (0,85), Objets autonomes permanents (0,80).
   - Validation stricte de capacité : une arme +B dispose au maximum de **B slots d'effets** (`S ≤ B`). Tout dépassement est bloqué.
   - Mode amélioration : calcul du surcoût par différence positive de plafonds.

2. **Comptoir du Marché aux d20**
   - Simulateur de négociation : `P_payé = P_plafond × min(1 ; (70 + 2×d20)/100)`.
   - **Plafond garanti absolu** : le prix ne dépasse jamais le montant annoncé (`P_payé ≤ P_plafond`).
   - Complications narratives pour `d20 ≥ 16` : besoin d'un matériau rare, incident d'atelier ou quête d'artisan sans majoration monétaire.

3. **Armurerie de Munitions & Consommables**
   - Munitions magiques : calcul par lot au prorata de 1/50e du prix de forge permanent équivalent.
   - Forfaits utilitaires fixes : Incassable (+20 po/u), Percutante (+20 po/u), Argentée (+10 po/u).
   - Potions de soins : barème classique D&D 5e et variante D&D 2024 commutable.
   - Consommables d'artisanat : Poudre de disparition, Onguent de soin, Colle universelle.

4. **Grimoire des Enchantements & Objets de Référence**
   - Catalogue de propriétés avec coût en slots (Frugale = 1, Sournoise = 1, Flammes stellaires = 1, etc.).
   - 10 objets autonomes étalonnés sur l'échelle de niveau N.
   - Recherche en temps réel et filtres par catégorie et rareté.

---

## 📐 Conformité & Architecture

- **Propriété Intellectuelle** : Formules mathématiques et caractéristiques techniques authentiques issues des classeurs de conception ; lore et désignations narratives réécrits sous la marque « L'Enclume Astrale ».
- **Accessibilité (WCAG 2.1 AA)** : Thème sombre à fort contraste (≥ 4.5:1), navigation clavier intégrale avec anneau de focus visible, balises sémantiques et annonces vocales `aria-live`.
- **Framework Public EPURE** : Workflows réutilisables épinglés sur `v1.0.0` (`d5d9dd770ee20c6ab1ec586b6f5ba30072e25d99`).

---

## 🛠 Commandes de Développement

```bash
# Installation des dépendances
npm install

# Exécution des tests unitaires et d'intégration (Vitest)
npm test

# Vérification du typage statique
npm run typecheck

# Compilation de production (Vite)
npm run build

# Prévisualisation locale
npm run preview
```
