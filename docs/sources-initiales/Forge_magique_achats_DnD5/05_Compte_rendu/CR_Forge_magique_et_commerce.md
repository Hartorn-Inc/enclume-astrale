# Compte rendu — économie de la forge magique et des achats

**Projet :** D&D 5e — économie des objets magiques  
**Cadre :** règles maison inspirées des enchantements de D&D 3.5 (notamment Gemmaline), rééquilibrées pour D&D 5e  
**Date du CR :** 24 octobre 2026  
**Objet :** consolider le fonctionnement de la forge, la tarification, les variations de marché et les consommables.

## Synthèse exécutive

La forge est le référentiel économique de départ pour les armes, armures et objets magiques permanents. Le prix suit une échelle quadratique de niveaux économiques. Le bonus réel d'une arme détermine le nombre maximal de slots de propriétés : **une arme +2 dispose de deux slots, pas de trois**. Les effets historiques issus de D&D 3.5 doivent être **réévalués** ; dans l'exemple traité, *Frugale* et *Sournoise* valent chacun 1 slot. Les objets autonomes doivent être rapprochés de cette échelle de puissance.

Le prix communiqué au joueur est toujours un **plafond**. Le montant réellement demandé peut être inférieur ; si la création ou le marché devient défavorable, le surplus de difficulté se traduit en **matériau, service ou incident narratif**, sans dépasser le montant promis. Une formule de simulation d20 a été proposée ; ses paramètres restent à confirmer. Les potions, munitions et autres consommables justifient un traitement distinct, encore ouvert à arbitrage.

## 1. Décisions et exigences confirmées

1. **Barème historique préservé** : progression du coût de base correspondant aux niveaux économiques 1, 3, 6, 10 pour les armes +1, +2, +3, +4.
2. **Slots limités par le bonus d'altération réel** : slots maximum = B. Le niveau économique triangulaire ne modifie pas cette capacité.
3. **Équivalence maison** : Frugale = 1 slot ; Sournoise = 1 slot dans l'exemple validé, sans import systématique des niveaux d'enchantement D&D 3.5.
4. **Prix par défaut au plafond** : un devis maximum est annoncé avant paiement ou fabrication.
5. **Aucun dépassement** : le prix payé ne peut être supérieur au plafond annoncé.
6. **Coûts narratifs possibles** : matériau spécifique, événement de fabrication, incident à résoudre, faveur ou action du joueur.
7. **Alignement de puissance** : les autres objets magiques doivent être classés sur une échelle cohérente avec les armes et leurs slots.

## 2. Règles de calcul consolidées

Pour une arme :

- `B` : bonus d'altération (+1, +2, etc.).
- `S` : somme de slots consommés par les effets (0 à B).
- `T(B) = B×(B+1)/2` : niveau économique du bonus d'altération nu.
- `N = T(B)+S`.
- `P_plafond = 1 000×N²` po.

Dans les règles du fichier source, l'armure / le bouclier utilisent un coefficient **0,85** et les autres objets un coefficient **0,80**. Pour les objets autonomes, le niveau `N` est attribué directement après comparaison avec des enchantements d'armes. Ce dernier mode d'attribution est une **piste de travail** : l'équilibrage de chaque type d'objet reste à construire.

**Améliorations :** prendre la différence de prix de référence entre le niveau final et le niveau initial ; appliquer ensuite le système de marché au seul coût de la prestation si tel est le devis annoncé.

## 3. Exemples chiffrés

| Cas | Calcul | Résultat |
|---|---|---:|
| Arme +1 nue | `1 000×1²` | 1 000 po |
| Arme +2 nue | `1 000×3²` | 9 000 po |
| Arme +2 Sournoise + Frugale | `B=2, S=2, N=3+2=5` | 25 000 po |
| Ajouter 1 effet à +1 | `4 000−1 000` | 3 000 po |
| Passer une arme +1 à +2 | `9 000−1 000` | 8 000 po |
| Passer une armure +2 nue à +3 nue | `0,85×(36 000−9 000)` | 22 950 po |
| Devis d'armure ci-dessus, d20=3 (simulation) | `22 950×76 %` | 17 442 po |

Une arme +2 avec **3 slots consommés** reste **invalide**, même si une valeur mathématique pourrait être calculée.

## 4. Prix variables et événements (proposition non validée)

**Formule proposée :** `P_payé = P_plafond × min(1 ; (70 + 2×d20) / 100)`.

**Interprétation :** un résultat faible favorise le joueur ; à partir de 15, le prix atteint le plafond ; à partir de 16, la difficulté excédentaire devient un événement de jeu. Les fourchettes détaillées figurent dans `04_Discussions/02_Solutions_envisagees_et_arbitrages.md`.

Cette mécanique n'est **pas** la formule d'origine retrouvée avec certitude. Elle a été élaborée pour satisfaire la nouvelle exigence d'un prix maximum intangible. Elle remplace, si elle est adoptée, une ancienne simulation permettant jusqu'à 130 % du prix de base.

## 5. Potions, flèches et consommables

**Constat du classeur de départ :** potions de soin à 50 / 500 / 5 000 / 50 000 po selon le palier. On trouve aussi les demandes de flèches argentées +1 incassables, flèches incassables, flèches percutantes, poudre de disparition, onguent de soin et colle universelle.

**Alternatives encore ouvertes :**

- **Potions de soin :** les prix 50 / 200 / 2 000 / 20 000 po ont été proposés comme alternative inspirée de D&D 2024 ; décision non prise.
- **Munitions :** diviser le prix de forge magique par 50, puis multiplier par la taille du lot. Exemple : 10 flèches +1 = 200 po et 10 flèches +2 = 1 800 po.
- **Qualités utilitaires :** coût fixe supplémentaire étudié pour Incassable / Percutante (20 po par flèche dans la discussion), sans validation.
- **Poudre de disparition :** 250 po dans le fichier d'origine, 200 po proposé ; à trancher.
- **Autres consommables :** établir un classement par puissance, nombre de charges et fréquence de réutilisation ; ne pas imposer automatiquement le tarif d'un objet permanent.

## 6. Points restant à arbitrer

| Priorité | Sujet | Décision attendue |
|---|---|---|
| Haute | Formule du d20 | Amplitude des remises, probabilité d'incident, tirage par lot ou par objet |
| Haute | Catalogue d'enchantements | Coût en slots et effets D&D 5e (combat / défense / utilitaire) |
| Haute | Objets autonomes | Grille de comparaison des niveaux N, rareté et disponibilité |
| Haute | Potions | Plafonds de prix par catégorie, y compris hors soins |
| Haute | Munitions | Division par 50, cumul des effets, Incassable et récupération |
| Moyenne | Incidents | Table d'événements graduée, coût inclus dans le plafond |
| Moyenne | Revente | Décote et tirage de marché applicables aux objets des joueurs |
| Moyenne | Disponibilité locale | Ville, artisan, capacité, délai, disponibilité des matériaux |
| Moyenne | Formules et suivi | Tests de cohérence dans le tableur après décision de règles |

## 7. Prochaines actions recommandées

1. **Décider des règles de référence** : fixer un tableau de dix objets emblématiques, leur niveau N, et leur plafond.
2. **Valider le d20** : confirmer ou ajuster le couple « remise de 72–98 % / complications à 100 % » ; tester un lot simple, une forge +2 et un objet très rare.
3. **Conclure le chapitre consommables** : potions de soins, poudre, flèches +1/+2/+3, flèches utilitaires ; écrire une règle de cumul.
4. **Stabiliser le classeur** : conserver des colonnes différentes pour plafond, jet, prix final et complication ; bloquer les slots illégaux.
5. **Publier une fiche joueur** (règles de prix et commande) et une fiche MJ (équilibrage, événements, concessions et historique).

## 8. Traçabilité des sources

- **Source historique inchangée** : `01_Source_originale/Objets Magiques.xlsx`.
- **Dernier classeur de travail disponible** : `02_Versions_de_travail/Forge_magique_DnD5_plafonds_incidents.xlsx`.
- **Autres versions** : dans `02_Versions_de_travail/` ; elles montrent l'évolution des hypothèses, pas plusieurs règles simultanément applicables.
- **Historique des échanges** : `04_Discussions/01_Historique_des_echanges.md`.
- **Options et statuts de décision** : `04_Discussions/02_Solutions_envisagees_et_arbitrages.md`.

> Le CR n'entérine pas les prix des consommables ni la formule de d20 : ces éléments restent explicitement **proposés**. Les données et devis historiques sont préservés sans recalcul rétroactif.
