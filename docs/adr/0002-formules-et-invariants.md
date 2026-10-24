---
status: accepted
---
# ADR 0002 : Formules Mathématiques, Intégrité de Capacité et Arrondis

## Contexte
Le système d'artisanat repose sur une progression quadratique de l'économie magique inspirée de D&D 3.5 / 5e, tout en régulant la puissance via des slots d'enchantements.

## Décision
1. **Invariant d'intégrité de capacité** : $S \le B$ est validé strictement pour les armes et armures/boucliers. Si $S > B$, la fonction retourne un résultat invalide (`{ isValid: false, reason: 'CAPACITY_EXCEEDED' }`) et aucun devis n'est généré.
2. **Progression arcanique** : $T(B) = \frac{B(B+1)}{2}$ et $N = T(B) + S$. Pour les objets autonomes sans bonus nu ($B=0$), $N = S$.
3. **Plafond économique** : $P_{\text{plafond}} = C \cdot 1000 \cdot N^2$ avec coefficients $C = 1.00$ (armes), $C = 0.85$ (armures/boucliers), $C = 0.80$ (objets autonomes).
4. **Arrondis** : Tous les montants financiers finaux en pièces d'or sont arrondis via `Math.round`.
5. **Simulation d20** : Ratio $= \min\left(1, \frac{70 + 2 \cdot d20}{100}\right)$. Pour $d20=1$, ratio = 0.72 ; pour $d20 \ge 15$, ratio = 1.00. Les complications narratives sont déclenchées par tranches : 16–17 (mineure), 18–19 (incident d'atelier), 20 (majeure).
6. **Munitions** : Formule $P = \left(\frac{1000 \cdot N^2}{50}\right) \cdot Q + \sum(\text{suppléments} \cdot Q)$.

## Conséquences
- Conformité rigoureuse avec les exemples canoniques du cahier des charges.
- Absence de débordements ou de devis erronés sur des configurations non autorisées.