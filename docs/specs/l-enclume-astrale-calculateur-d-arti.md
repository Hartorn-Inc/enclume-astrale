# Spécification Technique Complète — L'Enclume Astrale

## 1. Introduction et Objectifs
L'Enclume Astrale est une application web monopage (SPA) responsive permettant de calculer le coût économique d'artisanat d'objets magiques pour D&D 5e et D&D 3.5, de simuler la négociation de marché via un d20 garanti sans dépassement de plafond, et d'administrer les munitions et consommables alchimiques avec profils commutables (5e classique vs 2024).

## 2. Modèle Métier & Formules Mathématiques

### 2.1 Variables et Coefficients
- $B \in \{0, 1, 2, 3, 4\}$ : Bonus nu.
- Effets d'enchantement : chaque effet possède un coût en slots $s_i \ge 1$.
- $S = \sum s_i$ : Somme des slots d'effets actifs.
- Catégories et coefficients ($C$) :
  - `WEAPON` : $C = 1.00$
  - `ARMOR_SHIELD` : $C = 0.85$
  - `WONDROUS_ITEM` : $C = 0.80$ ($B=0$ obligatoire)

### 2.2 Règle d'Intégrité de Capacité
Pour toute arme, armure ou bouclier :
$$S \le B$$
Si $S > B$, la forge est impossible et renvoie une erreur explicite `CAPACITY_EXCEEDED` sans calcul de prix.

### 2.3 Calculs des Niveaux et Plafonds
- Niveau de base : $T(B) = \frac{B(B+1)}{2}$
- Niveau effectif : $N = T(B) + S$
- Plafond annoncé : $P_{\text{plafond}} = \text{Math.round}(C \cdot 1000 \cdot N^2)$

### 2.4 Améliorations
Si $N_{\text{final}} > N_{\text{init}}$ :
$$P_{\text{amélioration}} = P_{\text{plafond}}(N_{\text{final}}) - P_{\text{plafond}}(N_{\text{init}})$$
Si $N_{\text{final}} \le N_{\text{init}}$, l'opération est refusée (`INVALID_UPGRADE_TIER`).

### 2.5 Simulation de Marché d20
Formule du ratio de prix payé :
$$\text{ratio}(d20) = \min\left(1.0, \frac{70 + 2 \cdot d20}{100}\right)$$
$$P_{\text{payé}} = \text{Math.round}(P_{\text{plafond}} \cdot \text{ratio}(d20))$$

Complications narratives :
- $d20 = 1$ : Remise maximale de 28 % (prix = 72 %), aubaine du marché.
- $d20 \in [2, 5]$ : Affaire très avantageuse (74 % – 80 %).
- $d20 \in [6, 10]$ : Marché favorable (82 % – 90 %).
- $d20 \in [11, 14]$ : Prix du cours habituel (92 % – 98 %).
- $d20 = 15$ : Plafond nominal (100 %), aucune complication.
- $d20 \in [16, 17]$ : Plafond nominal (100 %), Complication mineure (composant spécifique ou service requis).
- $d20 \in [18, 19]$ : Plafond nominal (100 %), Incident d'atelier (dégât mineur, délai ou aléa d'artisanat).
- $d20 = 20$ : Plafond nominal (100 %), Complication majeure (quête arcanique ou pacte d'artisan requis).

### 2.6 Munitions et Consommables
- **Munitions** : $P_{\text{munitions}} = \text{Math.round}\left(\left(\frac{1000 \cdot N^2}{50}\right) \cdot Q\right) + \sum(\text{suppléments} \cdot Q)$
  - Incassable : +20 po / unité
  - Percutante : +20 po / unité
  - Argentée : +10 po / unité
- **Potions de soin** :
  - Commune : 50 po
  - Peu commune : 500 po (Classique) / 200 po (2024)
  - Rare : 5 000 po (Classique) / 2 000 po (2024)
  - Très rare : 50 000 po (Classique) / 20 000 po (2024)
- **Consommables spéciaux** :
  - Poudre de disparition : 250 po / dose
  - Onguent de soin : 150 po
  - Colle universelle : 2 000 po

## 3. Vecteurs de Test de Référence (Golden Cases)
1. Arme $B=1, S=0 \Rightarrow N=1 \Rightarrow P = 1\,000$ po.
2. Arme $B=2, S=0 \Rightarrow N=3 \Rightarrow P = 9\,000$ po.
3. Arme $B=2$, Sournoise (1) + Frugale (1) ($S=2$) $\Rightarrow N=5 \Rightarrow P = 25\,000$ po.
4. Arme $B=2, S=3 \Rightarrow$ Invalide ($S > B$).
5. Armure $B=2$ vers $B=3$ : $0.85 \cdot (36\,000 - 9\,000) = 22\,950$ po.
6. Marché sur $22\,950$ po :
   - $d20 = 1 \Rightarrow 22\,950 \cdot 0.72 = 16\,524$ po.
   - $d20 = 3 \Rightarrow 22\,950 \cdot 0.76 = 17\,442$ po.
7. Marché sur $25\,000$ po :
   - $d20 = 15 \Rightarrow 25\,000$ po (aucun incident).
   - $d20 = 18 \Rightarrow 25\,000$ po (incident d'atelier).
8. Munitions :
   - 10 flèches $+1$ ($N=1$) : $\frac{1000}{50} \cdot 10 = 200$ po.
   - 10 flèches $+2$ ($N=3$) : $\frac{9000}{50} \cdot 10 = 1\,800$ po.