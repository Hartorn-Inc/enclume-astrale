# Historique des échanges — forge magique et achat d'objets D&D 5e

**Périmètre :** discussion ayant abouti aux versions du classeur incluses dans ce dossier.  
**État :** au 24 octobre 2026.  
**Méthode :** propos de l'utilisateur retranscrits à partir des messages accessibles ; réponses de l'assistant **synthétisées**, et non reproduites intégralement comme un export natif. Aucune reconstruction des tirages d'origine n'est présentée comme certaine.

## 1. Mise au propre du tableur

**Utilisateur :** « Aide moi à mettre au propre cela (forge magique et achat d'item) ».

**Analyse proposée :** distinguer les règles de forge, les demandes d'objets, les décisions du MJ, le suivi des achats et les prix réellement négociés. Ne pas écraser les prix historiques. Un classeur de travail a été créé avec des feuilles de guide, de barème, de devis, de demandes, de suivi financier, d'arbitrages MJ et des copies des six feuilles de la source.

**Livrable intermédiaire :** `Forge_magique_et_achats_DnD5.xlsx`.

## 2. Nature des « slots » et héritage D&D 3.5

**Utilisateur :** « Dans l'idée, le nombre de slot correspond à  +x en level, rapport à dnd 3.5 (cd Gemmaline par exemple) ».

**Interprétation explorée :** le coût d'une propriété pouvait être exprimé sous la forme d'un bonus équivalent (+1, +2…), mais le barème original comporte des paliers de bonus d'altération non linéaires.

**Observation dans la feuille `Règles` de l'original :**

| Bonus d'altération | Prix nu d'une arme | Niveau économique de base |
|---|---:|---:|
| +1 | 1 000 po | 1 |
| +2 | 9 000 po | 3 |
| +3 | 36 000 po | 6 |
| +4 | 100 000 po | 10 |

La progression est triangulaire : `T(B) = B × (B+1) / 2`.

## 3. Équivalence maison de Frugale

**Utilisateur :** « Hmm, non, je pense que frugale comptait pour +1 (équilibrage avec dnd5 et dbd3.5) ».

**Décision confirmée :** *Frugale* consomme **1 slot** dans la règle maison, quelle que soit son équivalence dans D&D 3.5. *Sournoise* consomme également 1 slot dans l'exemple cité. Il faut adapter les effets issus de Gemmaline à D&D 5e, non recopier automatiquement leurs valeurs en D&D 3.5.

**Exemple :** arc +2, Sournoise et Frugale = niveau de base 3 + 1 + 1 = 5, donc plafond de référence 25 000 po.

**Livrable intermédiaire :** `Forge_magique_et_achats_DnD5_corrige.xlsx` (onglet Enchantements).

## 4. Capacité maximale de l'objet

**Utilisateur :** « De tt façon, une arme + 2 ne pourrait pas avoir 3 slots, uniquement 2 par construction. »

**Décision confirmée :** une arme +B peut posséder au maximum B slots d'effets. Le niveau de coût triangulaire **ne représente pas** le nombre de slots disponibles.

| Arme | Slots maximum | Niveau économique de base |
|---|---:|---:|
| +1 | 1 | 1 |
| +2 | 2 | 3 |
| +3 | 3 | 6 |
| +4 | 4 | 10 |

Un arc +2 avec trois propriétés consommant chacune 1 slot est **invalide** ; l'arc +2 Sournoise/Frugale est valide et a un coût de référence de 25 000 po.

**Livrable intermédiaire :** `Forge_magique_et_achats_DnD5_slots_corriges.xlsx`.

## 5. Variabilité des prix : d20 + constante

**Utilisateur :** « Je ne me souvient plus comment je faisais pour exprimer le prix en variation (je simulais des tirage de d20 + une somme fixe pour avoir des variations, y compris pour les achats ce qui représentent la variabilité du marché etc) Ca serait possible de "fit" une formule proche à côté ? Ou as tu des idées ? »

**Pistes envisagées :**

1. Ajuster le prix des achats à l'intérieur d'une fourchette de rareté : `P = P_min + (d20−1) × (P_max−P_min)/19`.
2. Faire varier les devis de forge autour du prix théorique : `P = P_base × (70+3d20)/100` (soit 73 à 130 %).
3. Tester ces hypothèses sur des prix historiques, par exemple Cape de déplacement 2 117 po, Anneau de stockage 3 140 / 4 012 / 4 312 po, Bateau pliable 3 996 po et un devis d'armure autour de 17 500 po.

**Réserve :** il s'agissait de modèles ajustés pour se rapprocher des montants observés, **pas de la formule historique démontrée**. Ces propositions acceptaient parfois un prix supérieur à la référence et ont ensuite été supplantées par un principe de plafond.

**Livrable intermédiaire :** `Forge_magique_et_achats_DnD5_variation_marche.xlsx` (simulation conservée pour comparaison).

## 6. Plafond annoncé, coût réel et incidents

**Utilisateur :** « Dans l'idée, les niveaux de pouvoir des items doivent être alignés sur les prix des armes avec les slots On doit toujours indiqué un prix maximum, mais ensuite le coûte réel est different (pas plus élevé que le max attendu) ou alors, on pourrait le transformer en "besoin d'un matériau précis" / incident nécessitant une action du joueur ».

**Principe confirmé :** un objet magique doit avoir un niveau de pouvoir comparable à l'échelle de la forge, et le prix **ne dépasse jamais le plafond annoncé**. Les dépassements de difficulté se traduisent en contraintes narratives (matériau rare, faveur, incident, quête), plutôt qu'en surcoût non annoncé.

**Modèle de simulation proposé par l'assistant :**

`P_réel = P_plafond × min(1 ; (70+2d20)/100)`.

- Jet 1–14 : 72 à 98 % du plafond.
- Jet 15 : 100 % du plafond sans complication.
- Jet 16–17 : 100 % et matériau/service nécessaire.
- Jet 18–19 : 100 % et incident nécessitant une action.
- Jet 20 : 100 % et complication majeure/opportunité d'aventure.

**Statut :** formule et seuils **proposés**, non explicitement validés à ce stade. En particulier, la fréquence des incidents (25 % des transactions) reste un choix de conception.

**Livrable intermédiaire :** `Forge_magique_DnD5_plafonds_incidents.xlsx`.

## 7. Flèches, potions et autres consommables

**Utilisateur :** « Regarde le prix des flèches, potions etc ».

**Observation :** le document original contient des demandes de lots de flèches et, dans l'onglet Nono, des potions de soins à 50 / 500 / 5 000 / 50 000 po. Les consommables ne se valorisent pas forcément comme les objets permanents.

**Solutions proposées, pas encore approuvées :**

- Munitions magiques : appliquer `prix de forge de référence ÷ 50 × quantité`, inspiré du traitement des lots de munitions en D&D 3.5.
- Flèches +1/+2/+3, par 10 : respectivement 200 / 1 800 / 7 200 po selon cette adaptation maison.
- Flèches incassables et percutantes : supplément forfaitaire exploratoire de 20 po par unité ; coût à valider.
- Dix flèches d'argent +1 incassables : exemple chiffré **proposé** à 500 po (200 + 100 + 200), non acté.
- Potions : une alternative issue des prix D&D 2024 a été évoquée (50 / 200 / 2 000 / 20 000 po pour les quatre paliers de soin) au lieu des valeurs historiques ; aucune modification définitive n'a été validée.
- Consommables autonomes : potentiel barème dédié, et non coût permanent complet.
- Poudre de disparition : référence évoquée de 200 po par dose, face à une valeur historique de 250 po dans le fichier ; arbitrage requis.

## 8. Demande d'export

**Utilisateur :** « export dans un zip : - tous les documents d'origine - les discussions, les solutions envisagées - un CR ».

**Réponse :** la présente archive réunit le fichier source conservé sans modification, toutes les versions de travail présentes dans la session, les aperçus disponibles, l'historique structuré des échanges, les solutions comparées et le compte rendu.

## Précautions sur le statut de ces notes

- **Décisions fermes :** +B = B slots maximum ; Frugale = 1 slot ; progression des niveaux économiques telle que le fichier source ; prix plafond impératif ; incident narratif plutôt que dépassement de plafond.
- **Propositions :** formule précise du d20, probabilités de complications, méthode des objets autonomes, prix des consommables, suppléments utilitaires sur munitions.
- **Historique :** les tarifs déjà négociés ou notés dans le fichier source ne doivent pas être remplacés automatiquement par les nouvelles simulations.
