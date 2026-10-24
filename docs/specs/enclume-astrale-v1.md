# Spécification Fonctionnelle & Technique — L'Enclume Astrale v1.0.0

## 1. Vision du Produit & Objet du Système

**L'Enclume Astrale** est une application web statique responsive pour D&D 5e / D&D 3.5 dédiée à :
1. La configuration et le calcul du coût de forge magique pour armes, armures, boucliers et objets autonomes.
2. La simulation de marché via un tirage de d20 calculant le prix négocié sous un plafond garanti, avec déclenchement de complications narratives en cas de difficultés d'artisanat.
3. La tarification des munitions magiques par lots et des consommables alchimiques (potions, poudres).
4. La consultation d'un grimoire d'enchantements adapté à D&D 5e avec consommation en slots.

Le système respecte strictement la propriété intellectuelle : le lore narratif protégé est réécrit de manière technique et générique, tout en conservant l'exactitude des formules mathématiques et des caractéristiques de jeu.

---

## 2. Modèle Mathématique & Règles de Forge

### 2.1 Éléments d'Entrée
- `B ∈ {0, 1, 2, 3, 4}` : Bonus d'altération nu.
- Effets d'enchantement sélectionnés : ensemble $\{e_1, e_2, \dots, e_k\}$ où chaque effet consomme un coût en slots $s_i \in \mathbb{N}_{\ge 1}$.
- `S = \sum s_i` : Somme des slots d'effets consommés.
- Catégorie d'objet :
  - **Arme** : Coefficient $C = 1{,}00$
  - **Armure / Bouclier** : Coefficient $C = 0{,}85$
  - **Autre objet autonome permanent** : Coefficient $C = 0{,}80$

### 2.2 Règle d'Intégrité de Capacité
Pour toute arme dotée d'un bonus d'altération $B$, la capacité maximale est strictement bornée par $B$ :
$$\mathbf{S \le B}$$
Une arme ayant $S > B$ est déclarée **invalide** par le système et ne produit aucun devis.

### 2.3 Calcul du Niveau Économique & du Plafond de Devis
1. **Niveau économique de base** :
   $$T(B) = \frac{B \times (B + 1)}{2}$$
   - $B = 1 \implies T(1) = 1$
   - $B = 2 \implies T(2) = 3$
   - $B = 3 \implies T(3) = 6$
   - $B = 4 \implies T(4) = 10$
2. **Niveau économique effectif** :
   $$N = T(B) + S$$
3. **Prix Plafond Annoncé** :
   $$P_{\text{plafond}} = C \times 1\,000 \times N^2 \text{ po}$$

### 2.4 Améliorations d'Objets Existants
L'amélioration d'un objet passant d'un niveau initial $N_{\text{init}}$ à un niveau final $N_{\text{final}}$ (avec $N_{\text{final}} > N_{\text{init}}$) coûte la différence des plafonds :
$$P_{\text{amélioration}} = P_{\text{plafond}}(N_{\text{final}}) - P_{\text{plafond}}(N_{\text{init}})$$

---

## 3. Variabilité du Marché & Simulation d20

### 3.1 Règle du Prix Plafond Garanti
Le prix payé par le joueur ne peut **jamais** dépasser le plafond annoncé ($P_{\text{payé}} \le P_{\text{plafond}}$).

### 3.2 Formule du d20
$$P_{\text{payé}} = P_{\text{plafond}} \times \min\left(1 \,;\, \frac{70 + 2 \times d20}{100}\right)$$

### 3.3 Grille d'Interprétation des Tirages
| Résultat d20 | Ratio du plafond | Type de résultat | Conséquence |
|---|---:|---|---|
| 1 | 72 % | Opportunité exceptionnelle | Remise maximale de 28 % |
| 2–5 | 74 % – 80 % | Affaire très avantageuse | Remise marchande |
| 6–10 | 82 % – 90 % | Marché favorable | Remise standard |
| 11–14 | 92 % – 98 % | Prix du cours habituel | Remise légère |
| 15 | 100 % | Prix plafond nominal | Transaction sans incident |
| 16–17 | 100 % | Complication mineure | Composant spécifique ou service requis |
| 18–19 | 100 % | Incident d'atelier | Aléa d'artisanat nécessitant l'action du joueur |
| 20 | 100 % | Complication majeure | Quête arcanique ou faveur de haut rang requise |

---

## 4. Munitions Enchantées & Consommables

### 4.1 Munitions Enchantées
$$P_{\text{plafond, munitions}} = \left(\frac{P_{\text{forge, arme}}(N)}{50}\right) \times Q$$
Où $Q$ est la taille du lot de munitions.
- 10 flèches +1 ($N=1$, 1 000 po base) : $(1\,000 / 50) \times 10 = 200 \text{ po}$.
- 10 flèches +2 ($N=3$, 9 000 po base) : $(9\,000 / 50) \times 10 = 1\,800 \text{ po}$.
- Suppléments fixes : Incassable (+20 po / unité), Percutante (+20 po / unité), Argentage (+10 po / unité).

### 4.2 Consommables Alchimiques
- Potions de soins (barème classique D&D 5e) :
  - Commune (2d4+2) : 50 po
  - Peu commune (4d4+4) : 500 po (variante 2024 : 200 po)
  - Rare (8d4+8) : 5 000 po (variante 2024 : 2 000 po)
  - Très rare (10d4+20) : 50 000 po (variante 2024 : 20 000 po)
- Consommables spéciaux : Poudre de disparition (250 po / dose), Onguent de soin (150 po), Colle universelle (2 000 po).

---

## 5. Critères d'Acceptation & Plan de Tests (TDD)

1. **Calculateur de Forge** :
   - Arme +1 nue = 1 000 po ($B=1, S=0, N=1$).
   - Arme +2 nue = 9 000 po ($B=2, S=0, N=3$).
   - Arme +2 avec Sournoise (1) + Frugale (1) = 25 000 po ($B=2, S=2, N=5$).
   - Arme +2 avec 3 slots = INVALID (rejet explicite).
   - Armure +2 nue vers +3 nue = $0{,}85 \times (36\,000 - 9\,000) = 22\,950 \text{ po}$.
2. **Simulateur d20** :
   - d20 = 1 sur 22 950 po = 16 524 po (72 %).
   - d20 = 3 sur 22 950 po = 17 442 po (76 %).
   - d20 = 15 sur 25 000 po = 25 000 po (100 %, aucun incident).
   - d20 = 18 sur 25 000 po = 25 000 po (100 %, incident d'atelier).
3. **Munitions & Consommables** :
   - 10 flèches +1 = 200 po.
   - 10 flèches +2 = 1 800 po.
4. **Accessibilité & Responsive** :
   - Zéro violation WCAG 2.1 AA sur les contrastes, la navigation clavier et les annonces ARIA live.
