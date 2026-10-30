# Code Google Apps Script pour Google Sheets (M357)

Voici le code complet et à jour à coller dans votre projet **Google Apps Script** pour synchroniser les inscriptions, les **ordres de passage (1 à 15)** et le **statut des sujets d'audit**.

---

## 📋 Instructions d'installation / mise à jour

1. Ouvrez votre **Google Sheet**.
2. Dans le menu supérieur, cliquez sur **Extensions** > **Apps Script**.
3. Remplacez l'intégralité du contenu de `Code.gs` par le code ci-dessous.
4. Cliquez sur **Enregistrer** (icône disquette).
5. Cliquez sur **Déployer** > **Gérer les déploiements**.
6. Cliquez sur l'icône **Crayon (Modifier)** sur votre déploiement actif :
   - Version : **Nouvelle version** (important !)
   - Cliquez sur **Déployer**.
7. L'URL du webhook reste la même que celle configurée dans `.env.local` et Vercel.

---

## 💻 Code complet pour `Code.gs`

```javascript
/**
 * Google Apps Script - Inscription des équipes & ordres de passage M357
 * Module : M357 Efficacité et Audit Énergétique (ENSA Fès)
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Si la feuille est vide, créer les en-têtes avec style
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Date d'inscription",
        "Ordre de passage",
        "Statut Sujet",
        "Thème d'audit",
        "Membre 1 (Chef d'équipe)",
        "Membre 2",
        "Membre 3",
        "Membre 4",
        "Email de contact",
        "ID Équipe"
      ]);
      
      var headerRange = sheet.getRange("A1:J1");
      headerRange.setBackground("#18211b");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    var members = data.members || [];
    var order = data.presentationOrder || data.order || "";
    var subjectStatus = data.subjectStatus || (data.hasCustomSubject ? "Proposé par l'équipe" : "En attente du professeur");
    var theme = data.theme || "";
    
    var row = [
      new Date().toLocaleString("fr-FR"),
      order ? Number(order) : "",
      subjectStatus,
      theme,
      members[0] || "",
      members[1] || "",
      members[2] || "",
      members[3] || "",
      data.email || "",
      data.id || ""
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      id: data.id,
      order: order
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ teams: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var values = sheet.getRange(1, 1, lastRow, Math.max(lastCol, 10)).getValues();
    var headerRow = values[0];
    var headers = headerRow.map(function(h) { return String(h).trim().toLowerCase(); });
    
    // Détection des colonnes
    var colOrder = -1;
    var colStatus = -1;
    var colTheme = -1;
    var colM1 = -1;
    var colM2 = -1;
    var colM3 = -1;
    var colM4 = -1;
    var colEmail = -1;
    var colId = -1;
    
    for (var h = 0; h < headers.length; h++) {
      var header = headers[h];
      if (header.indexOf("passage") !== -1 || header.indexOf("ordre") !== -1) colOrder = h;
      else if (header.indexOf("statut") !== -1) colStatus = h;
      else if (header.indexOf("thème") !== -1 || header.indexOf("theme") !== -1 || header.indexOf("sujet") !== -1) colTheme = h;
      else if (header.indexOf("membre 1") !== -1 || header.indexOf("chef") !== -1) colM1 = h;
      else if (header.indexOf("membre 2") !== -1) colM2 = h;
      else if (header.indexOf("membre 3") !== -1) colM3 = h;
      else if (header.indexOf("membre 4") !== -1) colM4 = h;
      else if (header.indexOf("email") !== -1) colEmail = h;
      else if (header.indexOf("id") !== -1) colId = h;
    }
    
    // Si format standard 10 colonnes (si pas d'en-tête explicite)
    if (colOrder === -1 && lastCol >= 9) {
      colOrder = 1;
      colStatus = 2;
      colTheme = 3;
      colM1 = 4;
      colM2 = 5;
      colM3 = 6;
      colM4 = 7;
      colEmail = 8;
      colId = 9;
    }
    
    var teams = [];
    
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      if (!row[0] && !row[1] && !row[2] && !row[3]) continue;
      
      var orderVal = null;
      var statusVal = "";
      var themeVal = "";
      var membersArr = [];
      var emailVal = "";
      var idVal = "";
      var dateVal = row[0] || "";
      
      if (colOrder !== -1 && row[colOrder] !== undefined && row[colOrder] !== "") {
        orderVal = Number(row[colOrder]);
      }
      
      if (colStatus !== -1 && row[colStatus]) {
        statusVal = String(row[colStatus]);
      }
      
      if (colTheme !== -1 && row[colTheme]) {
        themeVal = String(row[colTheme]);
      } else {
        // Ancien format 8 colonnes (Date, ID, Thème, M1, M2, M3, M4, Email)
        idVal = row[1] || "";
        themeVal = row[2] || "";
        membersArr = [row[3], row[4], row[5], row[6]].filter(Boolean);
        emailVal = row[7] || "";
      }
      
      if (colM1 !== -1) {
        membersArr = [
          colM1 !== -1 ? row[colM1] : "",
          colM2 !== -1 ? row[colM2] : "",
          colM3 !== -1 ? row[colM3] : "",
          colM4 !== -1 ? row[colM4] : ""
        ].filter(Boolean);
        emailVal = (colEmail !== -1 ? row[colEmail] : "") || "";
        idVal = (colId !== -1 ? row[colId] : "") || "";
      }
      
      var hasCustom = !statusVal.toLowerCase().includes("attente") && !themeVal.toLowerCase().includes("attente");
      
      teams.push({
        id: idVal || ("team_" + i),
        presentationOrder: (!isNaN(orderVal) && orderVal > 0) ? orderVal : null,
        subjectStatus: statusVal || (hasCustom ? "Proposé par l'équipe" : "En attente du professeur"),
        hasCustomSubject: hasCustom,
        needsSubject: !hasCustom,
        theme: themeVal,
        members: membersArr,
        email: emailVal,
        submittedAt: dateVal
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ teams: teams }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      teams: [],
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```
