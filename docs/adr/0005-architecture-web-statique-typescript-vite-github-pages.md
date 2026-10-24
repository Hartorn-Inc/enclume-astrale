# 5. Architecture web statique TypeScript / Vite et hébergement GitHub Pages

## Contexte
L'application « L'Enclume Astrale » est destinée à être consultée par des joueurs et maîtres du jeu sur table ou en ligne, sur mobile comme sur ordinateur portable, sans dépendance vis-à-vis d'un serveur applicatif ou d'une base de données distante.

## Décision
Nous choisissons une architecture Single-Page Application (SPA) en TypeScript strict sans framework lourd, propulsée par Vite pour le bundling moderne et le typage statique rigoureux.
Le déploiement est automatisé via GitHub Pages grâce à GitHub Actions sur la branche `main` (ou prévisualisations sur `gh-pages`).
Les données de référence (catalogue d'enchantements, barèmes, objets) sont stockées sous forme de modules TypeScript typés immuables, garantissant un fonctionnement 100 % hors-ligne après chargement.

## Conséquences
- Performance maximale (temps de chargement quasi-instantané, bundle < 100 Ko).
- Maintenance simplifiée sans dette de framework externe.
- Tests unitaires et d'intégration automatisés avec Vitest assurant une couverture TDD complète.
