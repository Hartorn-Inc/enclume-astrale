---
status: accepted
---
# ADR 0003 : Stratégie TDD, Accessibilité et Structure UI

## Contexte
L'application doit garantir une fiabilité mathématique irréprochable et fournir une ergonomie optimale pour une utilisation sur table de jeu (desktop, tablette, mobile), de nuit (thème sombre) et avec lecteurs d'écran.

## Décision
1. **Développement piloté par les tests (TDD)** : Chaque ticket débute par la définition des tests unitaires Vitest avec cas limites et tables de vérité avant l'implémentation du code métier.
2. **Accessibilité (a11y)** : Contraste supérieur à 4.5:1 sur l'ensemble de l'interface sombre, attributs `aria-live="polite"` pour les résultats de simulation de dé et de calcul, navigation complète au clavier (`tabindex`, focus visible).
3. **Organisation des modules UI** :
   - Onglet 1 : Forge d'armes, armures et objets autonomes (avec sélecteur d'amélioration).
   - Onglet 2 : Simulateur de marché d20 (jet manuel ou aléatoire, détail des remises et complications narratives).
   - Onglet 3 : Munitions et Consommables alchimiques (variante 5e / 2024).
   - Onglet 4 : Grimoire des enchantements (filtrable par catégorie et coût en slots).

## Conséquences
- Couverture de test unitaire supérieure à 95% sur le domaine.
- Expérience utilisateur fluide et accessible en conformité avec les critères d'acceptation du cahier des charges.