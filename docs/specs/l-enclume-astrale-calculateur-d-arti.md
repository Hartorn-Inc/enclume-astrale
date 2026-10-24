# Spécification Technique & Fonctionnelle — L'Enclume Astrale

## 1. Vue d'Ensemble & Objectifs
L'application **L'Enclume Astrale** fournit un moteur d'arbitrage et de calcul d'artisanat magique fidèle aux mécaniques combinées D&D 5e et 3.5 tout en garantissant une totale conformité légale par réécriture technique générique.

## 2. Modèle Mathématique Formel

### 2.1 Paramètres et Types d'Entrée
- Catégorie $K \in \{\text{'weapon'}, \text{'armor_shield'}, \text{'wonder_item'}\}$
  - $C(\text{'weapon'}) = 1.00$
  - $C(\text{'armor_shield'}) = 0.85$
  - $C(\text{'wonder_item'}) = 0.80$
- Bonus d'altération $B \in \{0, 1, 2, 3, 4\}$
- Slots d'enchantements $S = \sum_{i=1}^k s_i$ où $s_i \ge 1$

### 2.2 Invariant d'Intégrité
$$\forall K \in \{\text{'weapon'}, \text{'armor_shield'}\}, \quad S \le B$$
Si $S > B$, la fonction de calcul retourne un statut invalide avec message d'erreur explicite et refuse toute émission de devis.
Pour $K = \text{'wonder_item'}$, $B = 0$ et $S \ge 0$.

### 2.3 Calculs de Niveaux et Plafonds
- Niveau de base : $T(B) = \frac{B(B + 1)}{2}$
- Niveau économique effectif : $N = T(B) + S$
- Plafond annoncé : $P_{plafond} = \text{Math.round}(C \times 1000 \times N^2)$
- Coût d'amélioration : $P_{upgrade} = \max(0, P_{plafond}(N_{final}) - P_{plafond}(N_{init}))$

### 2.4 Simulation de Marché sous Plafond Garanti
Pour tout tirage $d20 \in [1, 20]$ :
$$P_{payé} = \text{Math.round}\left(P_{plafond} \times \min\left(1, \frac{70 + 2 \times d20}{100}\right)\right)$$

Table des événements associés :
| Jet $d20$ | Multiplicateur | Remise | Statut Marché | Complication |
|---|---|---|---|---|
| 1 | 72% | 28% | Opportunité exceptionnelle | Aucune |
| 2–5 | 74%–80% | 26%–20% | Affaire très avantageuse | Aucune |
| 6–10 | 82%–90% | 18%–10% | Marché favorable | Aucune |
| 11–14 | 92%–98% | 8%–2% | Prix du cours habituel | Aucune |
| 15 | 100% | 0% | Prix plafond nominal | Aucune |
| 16–17 | 100% | 0% | Prix plafond | Complication mineure (ingrédient ou faveur requise) |
| 18–19 | 100% | 0% | Prix plafond | Incident d'atelier (défaut d'alliage, intervention requise) |
| 20 | 100% | 0% | Prix plafond | Complication majeure (quête arcanique nécessaire) |

### 2.5 Munitions & Consommables
- Plafond d'un lot de $Q$ munitions pour un niveau effectif $N$ :
  $$P_{munitions} = \text{Math.round}\left(\frac{P_{plafond\_arme}(N)}{50}\right) \times Q + Q \times \sum \text{suppléments}$$
  Suppléments unitaires :
  - Incassable : +20 po
  - Percutante : +20 po
  - Argentée : +10 po
- Potions de soins (commutable classique 5e / variante 2024) :
  - Commune (2d4+2) : 50 po
  - Peu commune (4d4+4) : 500 po (Variante : 200 po)
  - Rare (8d4+8) : 5 000 po (Variante : 2 000 po)
  - Très rare (10d4+20) : 50 000 po (Variante : 20 000 po)
- Consommables spéciaux :
  - Poudre de disparition : 250 po / dose
  - Onguent de soin : 150 po
  - Colle universelle : 2 000 po