# Sondage réunion mariage

Site de sondage (Next.js 15 + Supabase) pour savoir qui sera présent à la réunion.

## Fonctionnement

- `/` : la personne saisit son prénom et son nom, puis choisit : présent(e), absent(e) ou à confirmer.
- Chaque envoi crée **une nouvelle ligne** dans la table `reponses`. Si quelqu'un répond "à confirmer" puis revient, une seconde ligne avec le même nom et prénom apparaît.
- `/admin` : protégé par mot de passe. Affiche les totaux (dernière réponse de chaque personne) et l'historique complet (les anciennes réponses sont grisées).

## Installation

1. Créer un projet Supabase et exécuter `supabase/schema.sql` dans le SQL editor.
2. Copier `.env.example` en `.env.local` et remplir :
   - `NEXT_PUBLIC_SUPABASE_URL` : URL du projet
   - `SUPABASE_SERVICE_ROLE_KEY` : clé service_role (serveur uniquement)
   - `ADMIN_PASSWORD` : mot de passe de la partie admin
   - `ADMIN_SECRET` : longue phrase aléatoire (signature du cookie)
3. `npm install` puis `npm run dev`.

## Déploiement Vercel

Importer le projet, ajouter les 4 variables d'environnement, déployer. Le lien public est la racine du site, l'admin est sur `/admin`.

## Sécurité

- La table a la RLS activée sans policy : seule la clé service_role (côté serveur) peut lire et écrire.
- La clé service_role n'est jamais envoyée au navigateur.
- Les pages sont en `noindex`.
