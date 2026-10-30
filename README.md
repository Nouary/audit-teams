# M357 : Efficacite et Audit Energetique - Inscription des equipes

Formulaire web pour que les equipes (3 ou 4 personnes) s'inscrivent avec leur
theme, + page admin pour consulter la liste et telecharger un fichier Excel
a partager avec le prof.

## Structure
- `pages/index.js` — formulaire public (/)
- `pages/admin.js` — page admin protegee par mot de passe (/admin)
- `pages/api/submit.js` — enregistre une equipe
- `pages/api/teams.js` — liste les equipes (admin)
- `pages/api/export.js` — genere et telecharge le fichier .xlsx (admin)

Les donnees sont stockees dans **Vercel KV** (base cle-valeur gratuite, native
a Vercel), donc rien a configurer cote base de donnees classique.

## 1. Pousser le projet sur GitHub

```bash
cd audit-teams
git init
git add .
git commit -m "Formulaire inscription equipes audit"
git branch -M main
git remote add origin https://github.com/<ton-user>/audit-teams.git
git push -u origin main
```

(Cree d'abord un repo vide sur GitHub avec le meme nom, sans README ni
.gitignore pour eviter les conflits.)

## 2. Deployer sur Vercel

1. Va sur https://vercel.com, connecte-toi avec GitHub.
2. "Add New..." → "Project" → importe le repo `audit-teams`.
3. Laisse les reglages par defaut (Framework: Next.js) → **Deploy**.

## 3. Ajouter la base Vercel KV

1. Dans le dashboard du projet sur Vercel → onglet **Storage**.
2. **Create Database** → choisis **KV** (Redis) → nomme-la par ex. `teams-kv`.
3. Connecte-la a ton projet quand c'est propose (bouton "Connect Project").
   Vercel ajoute automatiquement les variables `KV_REST_API_URL` et
   `KV_REST_API_TOKEN` dans les Environment Variables du projet.

## 4. Ajouter le mot de passe admin

1. Dans le projet Vercel → **Settings** → **Environment Variables**.
2. Ajoute `ADMIN_PASSWORD` = choisis un mot de passe (ex: `audit2026`).
3. **Redeploy** le projet (Deployments → ... → Redeploy) pour que la variable
   soit prise en compte.

## 5. Utilisation

- Partage le lien `https://ton-projet.vercel.app/` aux etudiants pour
  qu'ils remplissent le formulaire.
- Toi, va sur `https://ton-projet.vercel.app/admin`, entre le mot de passe,
  clique "Afficher les equipes" pour verifier, puis "Telecharger Excel"
  pour recuperer le fichier `.xlsx` a envoyer au prof.

## Test en local (optionnel)

```bash
npm install
# cree un fichier .env.local avec KV_REST_API_URL, KV_REST_API_TOKEN
# (copie-les depuis Vercel > Storage > ta KV > onglet .env.local)
# + ADMIN_PASSWORD=ton-mdp
npm run dev
```
