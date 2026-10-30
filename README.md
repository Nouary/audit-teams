# M357 : Efficacité et Audit Énergétique - Inscription des équipes

Application web permettant aux équipes (3 ou 4 étudiants) de s'inscrire en choisissant leur thème d'audit. Les données sont automatiquement enregistrées dans **Google Sheets**, avec une page d'administration (`/admin`) pour consulter les inscriptions et exporter la liste au format Excel `.xlsx`.

---

## 📁 Structure du projet

- `pages/index.js` — Formulaire public d'inscription (`/`)
- `pages/admin.js` — Dashboard administrateur protégé par mot de passe (`/admin`)
- `pages/api/submit.js` — Enregistre une nouvelle équipe dans Google Sheets
- `pages/api/teams.js` — Récupère la liste des équipes depuis Google Sheets
- `pages/api/export.js` — Génère et télécharge le fichier `.xlsx` formaté
- `lib/sheets.js` — Gestionnaire de connexion à Google Sheets (avec mode local hors-ligne automatique)

---

## 📊 Colonnes créées dans Google Sheets

| Colonne A | Colonne B | Colonne C | Colonne D | Colonne E | Colonne F | Colonne G | Colonne H |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Date d'inscription** | **ID Equipe** | **Thème** | **Membre 1** | **Membre 2** | **Membre 3** | **Membre 4** | **Email de contact** |

---

## ⚙️ Configuration de Google Sheets

Vous pouvez connecter Google Sheets de **deux manières** (au choix) :

### Option 1 : Compte de Service Google Cloud (Recommandé)

1. **Créer une feuille Google Sheets** :
   - Rendez-vous sur [sheets.new](https://sheets.new).
   - Récupérez l'identifiant dans l'URL : `https://docs.google.com/spreadsheets/d/`**`<VOTRE_SHEET_ID>`**`/edit`.

2. **Créer un compte de service Google Cloud** :
   - Allez sur [Google Cloud Console](https://console.cloud.google.com/).
   - Activez l'API **Google Sheets API** (APIs & Services > Enable APIs).
   - Créez un compte de service (IAM & Admin > Service Accounts > Create Service Account).
   - Créez une clé au format JSON (Keys > Add Key > Create new key > JSON) et téléchargez-la.

3. **Partager la feuille Google Sheets** :
   - Ouvrez votre Google Sheet et cliquez sur **Partager**.
   - Ajoutez l'adresse email du compte de service (ex: `service-account@projet.iam.gserviceaccount.com`) avec le rôle **Éditeur**.

4. **Variables d'environnement** :
   Dans `.env.local` (ou dans Vercel > Settings > Environment Variables) :
   ```env
   GOOGLE_SHEET_ID=votre_sheet_id
   GOOGLE_CLIENT_EMAIL=votre_email_service_account
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ADMIN_PASSWORD=choisissez_un_mot_de_passe
   ```

---

### Option 2 : Google Apps Script Webhook (Sans compte Google Cloud)

Si vous ne souhaitez pas créer de projet Google Cloud :

1. Ouvrez votre feuille Google Sheets.
2. Cliquez sur **Extensions** > **Apps Script**.
3. Remplacez le code existant par le script suivant :
   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     if (sheet.getLastRow() === 0) {
       sheet.appendRow(["Date d'inscription", "ID Equipe", "Thème", "Membre 1", "Membre 2", "Membre 3", "Membre 4", "Email de contact"]);
     }
     var data = JSON.parse(e.postData.contents);
     sheet.appendRow([
       new Date().toLocaleString("fr-FR"),
       data.id,
       data.theme,
       data.members[0] || "",
       data.members[1] || "",
       data.members[2] || "",
       data.members[3] || "",
       data.email || ""
     ]);
     return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
   }

   function doGet(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var rows = sheet.getDataRange().getValues();
     var teams = [];
     for (var i = 1; i < rows.length; i++) {
       var r = rows[i];
       teams.push({
         submittedAt: r[0],
         id: r[1],
         theme: r[2],
         members: [r[3], r[4], r[5], r[6]].filter(Boolean),
         email: r[7]
       });
     }
     return ContentService.createTextOutput(JSON.stringify({ teams: teams })).setMimeType(ContentService.MimeType.JSON);
   }
   ```
4. Cliquez sur **Déployer** > **Nouveau déploiement**.
5. Type : **Application Web**.
   - Exécuter en tant que : **Moi**.
   - Qui a accès : **Tout le monde** (Anyone).
6. Copiez l'URL fournie et configurez-la dans votre `.env.local` :
   ```env
   GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
   ADMIN_PASSWORD=choisissez_un_mot_de_passe
   ```

---

## 💻 Test en local

```bash
npm install
npm run dev
```

> **Remarque** : Si aucune clé Google Sheets n'est renseignée dans `.env.local`, l'application active automatiquement un mode local de secours et stocke temporairement les soumissions dans un fichier local pour vous permettre de tester immédiatement à l'adresse [http://localhost:3000](http://localhost:3000).

---

## 🚀 Déploiement sur Vercel

1. Rendez-vous sur [vercel.com](https://vercel.com) et connectez votre compte GitHub.
2. Importez le dépôt `audit-teams`.
3. Renseignez les variables d'environnement (`GOOGLE_SHEET_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` ou `GOOGLE_SHEET_WEBHOOK_URL`, ainsi que `ADMIN_PASSWORD`).
4. Cliquez sur **Deploy**.
