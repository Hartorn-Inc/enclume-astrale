# Solutions étudiées et arbitrages — économie des objets magiques

Ce document sépare les **règles de base déjà présentes**, les **décisions de conception exprimées** et les **hypothèses de l'assistant à valider**.

## A. Architecture économique

| Question | Solution | État | Motif / limite |
|---|---|---|---|
| Barème des armes | `1 000 × (T(B)+S)^2`, avec `T(B)=B(B+1)/2` | **Conservé d'après l'original** | Reproduit les lignes du barème source. |
| Capacité des armes | `S ≤ B` ; un effet consomme un nombre de slots maison | **Confirmé** | Empêche une +2 d'avoir trois slots. |
| Frugale | Coûte 1 slot, même si l'équivalence D&D 3.5 est différente | **Confirmé** | Équilibrage propre à D&D 5e. |
| Sournoise | Coûte 1 slot dans l'exemple de l'arc | **Confirmé dans cet exemple** | Ne fixe pas automatiquement les autres effets. |
| Armures et boucliers | Coefficient 0,85 du prix arme | **Présent dans la source** | Vérifier les exceptions futures. |
| Autres objets | Coefficient 0,80 du prix arme | **Présent dans la source, questionné** | Les objets non armés doivent recevoir un niveau de puissance comparable. |
| Amélioration | Payer la différence de plafonds entre ancien et nouveau niveau | **Présent dans la source** | À distinguer du paiement final après aléa. |
| Rareté | Sert surtout à la disponibilité, la puissance est déterminée par N | **Proposé** | Pas d'équivalence rareté→N universelle encore validée. |

`B` = bonus d'altération réel, `S` = slots d'effets consommés, `N = T(B)+S` = niveau économique pour une arme.

## B. Variabilité de marché : comparaison des modèles

| Modèle | Formule | Avantages | Limites | Statut |
|---|---|---|---|---|
| Prix linéaire dans fourchette de rareté | `Pmin + (d20−1)×(Pmax−Pmin)/19` | Pratique pour achats simples ; 20 paliers | Ne garantit pas cohérence avec le niveau de forge | **Ancienne piste, écartée comme socle** |
| Forge fluctuant autour de la référence | `Pbase×(70+3d20)/100` | Permet un ajustement proche de devis historiques | Peut dépasser le prix attendu jusqu'à 130 % | **Ancienne piste, contraire au plafond exigé** |
| Plafond + remise + événement | `Pmax×min(1;(70+2d20)/100)` | Compatible avec un prix maximum annoncé ; d20 facile à utiliser | Distribution et incidence des événements non validées | **Piste de travail privilégiée** |
| Prix fixe et incidents seulement | `P = Pmax`, jet uniquement narratif | Simplicité comptable | Ne reproduit pas l'idée d'un vrai prix variable | **Alternative possible** |
| Prix en deux dés (marché / complication) | Un jet détermine remise, l'autre détermine difficulté | Dissocie négociation et aventure | Plus lourd ; à calibrer pour éviter trop d'incidents | **Alternative possible** |

### Variante actuellement proposée avec un d20

| Résultat d20 | Coût en % du plafond | Conséquence |
|---|---:|---|
| 1–5 | 72–80 % | Affaire avantageuse |
| 6–10 | 82–90 % | Marché favorable |
| 11–14 | 92–98 % | Prix normal |
| 15 | 100 % | Prix plafond, rien d'autre |
| 16–17 | 100 % | Matériau spécifique ou service requis |
| 18–19 | 100 % | Incident nécessitant une action |
| 20 | 100 % | Quête ou complication importante |

**Attention :** ce tableau est une recommandation de design, pas une décision de l'utilisateur. Le MJ peut choisir une distribution asymétrique ou deux jets indépendants.

### Traitement des complications

- Une complication ne peut **jamais majorer** la somme exigée au-delà du plafond.
- Le matériau à acheter, s'il est réellement acheté, doit entrer dans le plafond financier.
- S'il doit être obtenu en jeu, la contrepartie est du temps, un risque, une quête ou un service, pas nécessairement des po supplémentaires.
- Les contraintes majeures doivent être proportionnées à la puissance de l'objet et à l'intérêt narratif ; éviter une quête pour chaque potion.
- Pour une commande de plusieurs objets ordinaires, faire un jet par lot peut éviter une inflation d'incidents.

## C. Barème des objets non-armés

**Piste :** attribuer à chaque objet autonome un niveau économique `N` selon sa puissance comparée aux enchantements d'armes. Calcul de son prix plafond avec la même formule quadratique et `C=0,80` si applicable.

| N | Arme équivalente | Autre objet permanent (C=0,80) |
|---:|---:|---:|
| 1 | 1 000 po | 800 po |
| 2 | 4 000 po | 3 200 po |
| 3 | 9 000 po | 7 200 po |
| 4 | 16 000 po | 12 800 po |
| 5 | 25 000 po | 20 000 po |
| 6 | 36 000 po | 28 800 po |

**À décider :** méthode permettant d'attribuer N, effets atypiques, objets à charges rechargeables, objets maudits, bonus de CA, objets de très grande utilité hors combat, durée et recharge.

## D. Consommables : propositions comparées

### Potions de soin

| Effet | Prix relevé dans l'original | Plafond 2024 évoqué dans la discussion | Décision |
|---|---:|---:|---|
| 2d4+2 | 50 po | 50 po | À confirmer |
| 4d4+4 | 500 po | 200 po | À arbitrer |
| 8d4+8 | 5 000 po | 2 000 po | À arbitrer |
| 10d4+20 | 50 000 po | 20 000 po | À arbitrer |

Les colonnes ne doivent pas être confondues : la première provient du document de départ ; la seconde restitue une **proposition issue de la discussion**, dont les références réglementaires devraient être revérifiées avant publication d'une règle finale.

### Munitions

Option étudiée :

`Plafond d'un lot = (prix de forge de la puissance équivalente / 50) × nombre de munitions`.

| Lot | Plafond proposé |
|---|---:|
| 10 flèches +1 | 200 po |
| 10 flèches +2 | 1 800 po |
| 10 flèches +3 | 7 200 po |
| 20 flèches incassables | 400 po (forfait proposé) |
| 10 flèches percutantes | 200 po (forfait proposé) |
| 10 flèches argent +1 incassables | 500 po (exemple composite proposé) |

**Points ouverts :** argentage par lot ou par unité ; consommation de l'effet +1 ; statut d'Incassable sur une munition dont la magie s'épuise ; comptabilité des flèches récupérées ; propriété utilitaire à coût fixe ou véritable slot ; éventuel prix de fabrication inférieur au prix marchand.

### Autres consommables

- Poudre de disparition : 250 po est noté dans le fichier original ; 200 po par dose a été proposé dans la discussion.
- Onguent de soin, colle universelle et autres objets à usage limité : **pas de barème final validé**.
- Faire varier le prix **par lot** plutôt que multiplier les jets et événements mineurs.

## E. Contraintes de l'outil de suivi

1. Conserver les feuilles originales telles quelles et les distinguer clairement des copies de travail.
2. Distinguer `prix théorique / plafond`, `jet`, `prix négocié`, `coût de l'amélioration`, `prix payé`, `statut` et `incident`.
3. Empêcher un devis de forge lorsque `slots consommés > bonus d'altération`.
4. Conserver les prix historiques et leurs différences sans réécrire rétroactivement les transactions.
5. Marquer les niveaux d'objets et propriétés non évalués comme **à arbitrer**, pas comme « 0 » par défaut.
6. Éviter les recalculs aléatoires automatiques qui changent les devis en rouvrant le tableur ; saisir un d20 fixe par transaction.
7. Tester systématiquement les cas +1, +2, +3, les améliorations et les lots de munitions.

## F. Critères de validation à soumettre au MJ

- [ ] Validation de la formule de coût `70+2d20`, du minimum à 72 % et des seuils d'incident.
- [ ] Validation de l'échelle N pour les objets autonomes, avec 10 objets de référence.
- [ ] Décision sur les tarifs des quatre potions de soins.
- [ ] Décision sur l'unité de coût des munitions magiques (`÷50`) et le cumul de propriétés.
- [ ] Décision sur les propriétés « Incassable », « Percutante » et l'argentage.
- [ ] Décision sur la gestion des prix de vente/revente (différents du coût d'achat).
- [ ] Décision sur la disponibilité et le délai d'approvisionnement selon les villes/régions.
