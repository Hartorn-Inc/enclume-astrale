---
status: accepted
---
# ADR 0001 : Architecture découplée et Modèle de Domaine Pur pour L'Enclume Astrale

## Contexte
L'Enclume Astrale doit fournir un système fiable de calcul de forge, de tarification de munitions et de simulation de marché pour D&D 5e / 3.5. Le projet requiert une grande maintenabilité, une testabilité unitaire totale et une interface utilisateur réactive.

## Décision
1. Découpage strict entre le noyau de logique métier (`src/domain/`) et l'interface utilisateur (`src/ui/` ou composants React/DOM).
2. Le domaine métier est implémenté en TypeScript strict, sans aucune dépendance au DOM, au framework graphique ou à des bibliothèques externes non standard.
3. Stack technique : Node.js LTS, Vite, TypeScript strict, Vitest pour les tests unitaires et d'intégration, et React pour la couche de présentation responsive accessible (WCAG 2.1 AA).

## Conséquences
- Les fonctions de calcul sont 100 % déterministes et facilement auditables via Vitest.
- Évolution facilitée des règles arcaniques ou intégration potentielle dans d'autres outils (CLI, bot Discord, VTT) sans réécriture.