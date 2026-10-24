---
status: accepted
---
# ADR 0002 : Formulation mathématique exacte, invariants d'intégrité et gestion des arrondis

## Contexte
Le système d'artisanat repose sur un barème quadratique pondéré et un invariant de robustesse : $S \le B$ pour armes, armures et boucliers. Il convient de formaliser la tolérance d'erreur, le typage des résultats et le traitement des cas invalides.

## Décision
1. **Invariant $S \le B$** : Toute tentative de calcul pour une arme ou armure où $S > B$ retourne un résultat explicite `{ valid: false, error: 'CAPACITY_EXCEEDED', maxAllowedSlots: B, currentSlots: S }` et aucun prix plafond n'est émis.
2. **Objets autonomes** : Pour les objets autonomes permanents ($C = 0.80$), $B = 0$ et $N = S$.
3. **Fonction de progression** : $T(B) = \frac{B(B+1)}{2}$. Niveau effectif $N = T(B) + S$. Prix plafond $P_{plafond} = \text{Math.round}(C \times 1000 \times N^2)$.
4. **Amélioration** : $P_{amélioration} = \max(0, P_{plafond}(N_{final}) - P_{plafond}(N_{init}))$.
5. **Arrondi** : Tous les montants en pièces d'or ($po$) sont arrondis avec `Math.round()` au terme du produit pour éviter l'accumulation d'erreurs en virgule flottante.
6. **Simulation d20** : Le facteur multiplicateur est $\min(1, (70 + 2 \times d20)/100)$ pour $d20 \in [1, 20]$.

## Conséquences
- Cohérence absolue avec les exemples canoniques (ex: Arme +2 Sournoise + Frugale = 25 000 po ; Armure +2 vers +3 = 22 950 po ; d20=1 donne 16 524 po).
- Aucune ambiguïté dans l'affichage des erreurs à l'utilisateur.