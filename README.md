# Ce que je mange — PWA

Journal de repas + hydratation, installable sur le téléphone comme une vraie app.
Un seul dossier statique, aucune base de données, aucun backend.

## Mettre en ligne (5 minutes)

**Option A — Netlify Drop (le plus rapide, pas de compte obligatoire pour tester)**
1. Va sur https://app.netlify.com/drop
2. Glisse le dossier entier (ou le fichier `.zip`) dans la page.
3. Netlify te rend une URL en `https://…netlify.app`. C'est fini.

**Option B — GitHub Pages**
1. Nouveau dépôt, pousse les fichiers à la racine.
2. Settings → Pages → Source : `main` / `/ (root)`.
3. L'URL arrive en une minute.

**Option C — Vercel**
`npx vercel --prod` depuis le dossier.

HTTPS est obligatoire pour que le service worker et l'installation marchent.
Les trois options le fournissent. En local, `http://localhost` marche aussi
(`python3 -m http.server`), mais pas une IP locale en http.

## Installer sur le téléphone

- **Android / Chrome** : ouvre l'URL → menu ⋮ → « Installer l'application » ou
  « Ajouter à l'écran d'accueil ».
- **iPhone / Safari** : bouton Partager → « Sur l'écran d'accueil ».

Elle s'ouvre ensuite en plein écran, avec son icône, sans barre de navigateur.

## Code-barres : ce qui marche où

`BarcodeDetector` est disponible sur Chrome / Edge Android et desktop. Sur
iPhone (Safari, et tout navigateur iOS), il n'existe pas : l'app bascule alors
sur la saisie des chiffres du code à la main, qui interroge la même base.

La caméra exige HTTPS, donc l'app hébergée, pas un fichier ouvert en `file://`.
Au premier scan le navigateur demande l'autorisation caméra.

Si un produit manque dans Open Food Facts, tu peux l'ajouter toi-même sur
https://fr.openfoodfacts.org — base collaborative, sous licence ouverte.

## Clé API (pour la photo et les menus)

L'app marche sans clé : saisie manuelle des calories, suivi d'eau, historique.
Pour l'analyse de photo et le générateur de menus, il faut une clé API Anthropic.

1. https://console.anthropic.com → API Keys → Create Key.
2. Dans l'app : onglet **Réglages** → colle la clé → **Enregistrer la clé** →
   **Tester la connexion**.

La clé est stockée dans le `localStorage` de ton navigateur, sur ton téléphone
uniquement. Elle n'est pas dans le code source : même si l'URL du site est
publique, personne d'autre n'a ta clé. Les requêtes partent directement du
téléphone vers `api.anthropic.com` (en-tête
`anthropic-dangerous-direct-browser-access`), sans passer par un serveur à toi.

Si un jour tu partages l'URL avec quelqu'un, il devra mettre sa propre clé.
Tarifs : https://claude.com/pricing — une photo redimensionnée en 1024 px
consomme très peu de tokens.

## Ce que fait l'app

- Objectifs de repas **pilotés par le jour de la semaine** :
  lundi/mercredi = schéma « jour du matin », mardi/jeudi/vendredi = schéma
  « après-midi » (brunch unique, pas de déjeuner), week-end = répartition libre.
  Modifiable dans `SCHEMAS` en haut du `<script>`.
- **Scan de code-barres** (onglet Journal → `+` → Code-barres) : lecture via
  l'API `BarcodeDetector` du navigateur, puis recherche sur Open Food Facts.
  Les valeurs viennent de l'étiquette du fabricant, pas d'une estimation.
  Choix de la quantité en grammes ou « 1 portion » si l'étiquette la donne.
  Les produits scannés sont gardés en local : un re-scan marche hors ligne.
  Pas de clé ni de compte pour cette partie.
- Ajout d'un repas par photo, par description, ou à la main.
- Reprise en un tap des repas déjà enregistrés pour ce créneau.
- Suivi de l'eau : verres cliquables, boutons rapides, objectif réglable.
- Générateur de menus à partir de ce qu'il y a dans le frigo, calé sur les
  calories restantes, contrainte « 10 minutes max, pas de vraie cuisine ».
- Export / import JSON des données.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | toute l'app (HTML + CSS + JS) |
| `manifest.webmanifest` | nom, icônes, mode plein écran |
| `sw.js` | service worker, fonctionnement hors ligne |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | icônes |

Après une modification de `index.html`, change `var CACHE = "cqjm-v1"` en
`"cqjm-v2"` dans `sw.js`, sinon le téléphone continue de servir l'ancienne
version depuis le cache.
