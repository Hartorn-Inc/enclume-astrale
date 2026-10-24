---
status: accepted
---
# ADR 0003 : Stratégie de Test TDD, Accessibilité et Gestion d'État

## Contexte
L'application doit être utilisable en pleine session de jeu par les maîtres du jeu et les joueurs, garantissant une ergonomie immédiate, un contraste élevé (thème sombre) et une accessibilité WCAG 2.1 AA.

## Décision
1. **Cycle TDD** : Développement guidé par les tests avec Vitest en amont de toute implémentation UI, couvrant tous les cas limites (bonus nuls, plafonds max, dépassement de slots, amélioration avec $N_{\text{final}} \le N_{\text{init}}$, lots de munitions).
2. **Accessibilité (a11y)** : Thème sombre à fort contraste (ratio $\ge 4.5:1$), balises sémantiques, gestion du focus clavier, et annonces des résultats de simulation via une zone `aria-live="polite"`.
3. **Gestion d'état UI** : État réactif léger avec mémorisation locale (`localStorage`) pour conserver le dernier devis et la configuration choisie.

## Conséquences
- Fiabilité garantie par les tests unitaires et de composants.
- Confort d'utilisation optimal sur mobile et desktop.