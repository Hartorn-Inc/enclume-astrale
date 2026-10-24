---
status: accepted
---
# ADR 0001 : Architecture découplée et Modèle de Domaine Pur pour L'Enclume Astrale

## Contexte
L'Enclume Astrale est un outil web interactif d'artisanat arcanique et de calcul économique pour les maîtres de jeu et joueurs de D&D 5e et 3.5. L'application doit supporter des calculs de forge précis, une simulation d20, la tarification de munitions et consommables, ainsi qu'une interface réactive et accessible.

## Décision
1. L'application est développée sous une architecture à domaine pur (Pure Domain Model) entièrement découplé de la vue web.
2. Le noyau mathématique et les règles métier résident dans `src/domain/` sans aucune dépendance envers le DOM, React ou Vite.
3. TypeScript strict (`strict: true`, `noImplicitAny: true`, types union stricts) est appliqué à l'ensemble du projet.
4. La vue est construite avec Vite, React et CSS modulaire sombre conforme WCAG 2.1 AA.
5. La persistance des configurations favorites s'effectue dans `localStorage` via une couche de sérialisation typée.

## Conséquences
- Les fonctions de calcul sont testables à 100% en isolation complète sous Vitest.
- Remplacement ou migration possible de la couche d'interface sans impacter l'exactitude des règles de forge.