# 2. Capacité stricte des armes en slots d'effets (S ≤ B)

## Contexte
L'adaptation des enchantements issus de D&D 3.5 vers D&D 5e posait le risque d'une accumulation excessive d'effets magiques sur des armes à faible altération. Une confusion existait entre le niveau économique triangulaire `T(B)` et le réceptacle physique de magie disponible sur l'arme.

## Décision
Nous fixons la règle d'intégrité de forge : le nombre total de slots d'effets `S` cumulés sur une arme ne peut jamais dépasser son bonus d'altération réel `B` (`S ≤ B`). Une arme +2 dispose au maximum de 2 slots, et une arme +1 d'un seul slot.
Tout devis ou configuration tentant d'affecter `S > B` est strictement invalide et refusé par le moteur de calcul.

## Conséquences
- Les propriétés comme *Frugale* et *Sournoise* sont calibrées unitairement à 1 slot pour D&D 5e.
- Un arc +2 avec Frugale (1) et Sournoise (1) est valide (`S = 2 ≤ 2`, `N = 3 + 2 = 5`, 25 000 po).
- Un arc +2 avec 3 effets à 1 slot est bloqué par validation structurelle.
