# GLOSSAIRE — L'Enclume Astrale

- **Bonus d'altération nu ($B$)** : Valeur numérique intrinsèque d'amélioration magique d'un équipement ($B \in \{0, 1, 2, 3, 4\}$). Pour les armes, armures et boucliers, il s'agit du bonus direct aux jets d'attaque/dégâts ou à la classe d'armure. Pour les objets autonomes permanents n'ayant pas de bonus direct, $B = 0$.
- **Coût en slots ($s_i$) & Consommation totale ($S$)** : Chaque propriété magique ou enchantement spécifique requiert une charge d'enchantement mesurée en slots entiers ($s_i \ge 1$). $S = \sum s_i$ représente la somme totale des slots alloués à l'objet.
- **Règle d'intégrité de capacité** : Règle fondamentale de stabilité arcanique imposant $S \le B$ pour toute arme, armure ou bouclier. Tout objet violant cette contrainte ($S > B$) entre en résonance instable et est rejeté comme invalide (aucun devis produit).
- **Niveau économique de base ($T(B)$)** : Suite triangulaire calculée selon $T(B) = \frac{B \cdot (B + 1)}{2}$. Échelonne le poids économique intrinsèque du bonus brut ($T(0)=0, T(1)=1, T(2)=3, T(3)=6, T(4)=10$).
- **Niveau économique effectif ($N$)** : Indice synthétique de puissance arcanique $N = T(B) + S$. Pour un objet autonome ($B=0$), $N = S$.
- **Coefficient de catégorie ($C$)** : Facteur de calibrage économique selon le type d'équipement :
  - Arme : $C = 1.00$
  - Armure / Bouclier : $C = 0.85$
  - Autre objet autonome permanent : $C = 0.80$
- **Prix Plafond Annoncé ($P_{\text{plafond}}$)** : Formule quadratique $P_{\text{plafond}} = C \cdot 1000 \cdot N^2$ exprimée en pièces d'or (po), arrondie à l'entier le plus proche via `Math.round`.
- **Amélioration d'objet** : Opération consistant à porter un objet d'un niveau $N_{\text{init}}$ à $N_{\text{final}}$ ($N_{\text{final}} > N_{\text{init}}$). Le surcoût est $P_{\text{amélioration}} = P_{\text{plafond}}(N_{\text{final}}) - P_{\text{plafond}}(N_{\text{init}})$.
- **Simulation de marché (d20)** : Mécanisme d'aléa économique calculant le prix négocié $P_{\text{payé}} = \text{round}\left(P_{\text{plafond}} \cdot \min\left(1, \frac{70 + 2 \cdot d20}{100}\right)\right)$, garantissant que $P_{\text{payé}} \le P_{\text{plafond}}$, et déclenchant des complications narratives pour $d20 \ge 16$.
- **Lots de munitions enchantées** : Tarification unitaire dérivée d'une arme équivalente divisée par 50 : $P_{\text{plafond\_munitions}} = \left(\frac{P_{\text{forge\_arme}}(N)}{50}\right) \cdot Q$, avec suppléments fixes par unité (ex: Incassable +20 po, Percutante +20 po, Argentée +10 po).
- **Variante D&D 2024 vs 5e classique** : Profil économique commutable pour les consommables de soins (Peu commune 500 po vs 200 po, Rare 5 000 po vs 2 000 po, Très rare 50 000 po vs 20 000 po).