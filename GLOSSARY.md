# Glossaire — L'Enclume Astrale

- **Bonus d'altération nu ($B$)** : Valeur intrinsèque de renforcement magique d'une arme, armure ou bouclier, appartenant à l'ensemble `{0, 1, 2, 3, 4}`.
- **Coût en slots ($s_i$)** : Poids d'enchantement associé à un effet magique particulier ($s_i \ge 1$).
- **Somme des slots ($S$)** : Total cumulé des slots consommés par les enchantements actifs sur un objet ($S = \sum s_i$).
- **Règle d'Intégrité de Capacité** : Invariant strict imposant que pour toute arme ou armure dotée d'un bonus d'altération $B$, le total des slots $S$ ne dépasse jamais $B$ ($S \le B$). Tout dépassement rend la configuration invalide sans devis possible.
- **Niveau économique de base ($T(B)$)** : Fonction triangulaire $T(B) = \frac{B(B+1)}{2}$ calculant le poids économique du bonus nu ($T(0)=0, T(1)=1, T(2)=3, T(3)=6, T(4)=10$).
- **Niveau économique effectif ($N$)** : Valeur combinée du niveau de base et des slots d'enchantement ($N = T(B) + S$). Pour un objet autonome permanent sans bonus nu, $B = 0$ et $N = S$.
- **Coefficient de catégorie ($C$)** : Facteur de pondération appliqué au calcul du prix plafond :
  - Arme : $C = 1.00$
  - Armure / Bouclier : $C = 0.85$
  - Autre objet autonome permanent : $C = 0.80$
- **Prix Plafond Annoncé ($P_{plafond}$)** : Coût maximum garanti en pièces d'or ($po$), calculé selon la formule $P_{plafond} = C \times 1000 \times N^2$, arrondi à l'entier le plus proche (`Math.round`).
- **Amélioration d'objet ($P_{amélioration}$)** : Coût de transition d'un niveau économique initial $N_{init}$ vers un niveau final $N_{final}$, égal à $P_{plafond}(N_{final}) - P_{plafond}(N_{init})$.
- **Simulation de marché d20** : Modèle de négociation sous plafond garanti appliquant un facteur de réduction basé sur un jet de dé virtuel à 20 faces ($d20 \in [1, 20]$) : $P_{payé} = P_{plafond} \times \min\left(1, \frac{70 + 2 \times d20}{100}\right)$.
- **Complication d'artisanat** : Aléa narratif survenant lors d'un tirage élevé au d20 ($16-20$) sans surcoût financier par rapport au plafond mais imposant des réquisitions narratives (composant, incident, quête arcanique).
- **Munitions magiques par lot ($Q$)** : Système de tarification unitaire fractionnaire basé sur un cinquantième du prix plafond d'arme équivalente : $P_{plafond\_munitions} = \left(\frac{P_{forge\_arme}(N)}{50}\right) \times Q$, avec suppléments fixes unitaires cumulables (Incassable +20 po, Percutante +20 po, Argentée +10 po).
- **Consommables alchimiques** : Potions de soins et substances spéciales tarifées selon une grille commutable (D&D 5e standard vs Variante révisée 2024).