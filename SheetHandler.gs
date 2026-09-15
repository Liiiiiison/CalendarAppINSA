function openOrCreateSheet() {
  var filename = "MonFichierDeCoursINSA";
  var files = DriveApp.getFilesByName(filename);
  let ss;
  
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
    Logger.log("Fichier trouvé : " + ss.getUrl());
  } else {
    ss = SpreadsheetApp.create(filename);
    Logger.log("Nouveau fichier créé : " + ss.getUrl());
    
    let sheet = ss.getActiveSheet();

    sheet.getRange('A1').setValue('Choisissez votre cours');
    let plage = sheet.getRange("B1");
    let plage2 = sheet.getRange("B2:B1000");

    var classList =  ["5A_TLS_SEC","1A_S"];

    var regle = SpreadsheetApp.newDataValidation()
      .requireValueInList(classList)
      .setAllowInvalid(false)
      .build();

    plage.setDataValidation(regle);

    // var options = ["oui", "non"];
    // var regle2 = SpreadsheetApp.newDataValidation()
    //   .requireValueInList(options)
    //   .setAllowInvalid(false)
    //   .build();
    // plage2.setDataValidation(regle2);

    var rules = [];

    // Vert si "oui"
    var ruleOui = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("oui")
      .setBackground("#b6d7a8") // vert
      .setRanges([plage, plage2])
      .build();
    rules.push(ruleOui);

    // Rouge si "non"
    var ruleNon = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("non")
      .setBackground("#f4cccc") // rouge
      .setRanges([plage, plage2])
      .build();
    rules.push(ruleNon);

    // Appliquer les règles
    sheet.setConditionalFormatRules(rules);
  }
  return ss;
}


function getGroupeID(){
  let sheet = openOrCreateSheet().getActiveSheet();
  let groupeName = "default";
  groupeName = sheet.getRange("B1").getValue();
  console.log("groupe name :" + groupeName)

  try {
    switch (groupeName) {
        case "5A_TLS_SEC" : groupeId = 3757; break;
        case "1A_S" : groupeId = 2315; break;
      }
      return groupeId;
  }
  catch(e){
    console.error("No group found");
    return 0;    
  }
  
}

function isN7(){
  let sheet = openOrCreateSheet().getActiveSheet();
  let n7 = 0;
  groupName = sheet.getRange("B1").getValue();
  switch (groupName) {
      case "5A_TLS_SEC" : n7 = 1; break;
      default : n7=0; console.log("INSA group found"); break;
    }
    return n7;
}

function filterClasses(agenda) {
  // Récupérer la feuille (ou la créer)
  let ss = openOrCreateSheet();
  let sheet = ss.getActiveSheet();

  // Récupérer les noms et statuts existants
  let lastRow = sheet.getLastRow();
  let savedData = [];
  if (lastRow > 0) {
    savedData = sheet.getRange(1, 1, lastRow, 2).getValues(); // [nom, oui/non]
  }

  let names = getNames(agenda);
  
  let rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["oui", "non"], true) // true = afficher le menu
    .setAllowInvalid(false)
    .build();
  
  // Mettre à jour la feuille si un nom n'existe pas encore
  for (let i = 0; i < names.length; i++) {
    let nom = names[i];

    let found = false;

    // Cherche le nom dans la feuille
    for (let j = 0; j < savedData.length; j++) {
      if (savedData[j][0] === nom) {
        found = true;
        break;
      }
    }
    // Si le nom n'existe pas encore, on l'ajoute avec
    if (!found) {
      sheet.getRange(sheet.getLastRow()+1,1).setValue(nom);
      sheet.getRange(sheet.getLastRow(),2).setDataValidation(rule);
    }

    lastRow = sheet.getLastRow();
    savedData = [];
    if (lastRow > 0) {
      savedData = sheet.getRange(1, 1, lastRow, 2).getValues(); // [nom, oui/non]
    }
    Logger.log("Sheet Handler : " + nom);
  }

  // Recharger les données mises à jour
  lastRow = sheet.getLastRow();
  savedData = sheet.getRange(1, 1, lastRow, 2).getValues();

  // Crée un tableau des noms validés (colonne B = "oui")
  let validNames = savedData
    .filter(row => row[1].toLowerCase() === "oui")
    .map(row => row[0]);

  // Filtrer l'agenda pour ne garder que les événements dont le nom correspond à un "oui"
  let filteredAgenda = agenda.filter(ev => {
    let nomEv = ev.summary;
    return validNames.includes(nomEv);
  });

  console.log(filteredAgenda);
  return filteredAgenda;
}


