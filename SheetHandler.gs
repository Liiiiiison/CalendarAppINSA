function openOrCreateSheet(groupName) {
  let year = getStartYear();
  var filename = "Calendar_INSA_" + year + "-" + (year+1);
  var files = DriveApp.getFilesByName(filename);
  let ss;
  let sheet;
  
  //Open or create the spreadsheet file
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
    console.info("Opening spreadsheet : " + ss.getUrl());

    //get or create the sheet for the group
    sheet = ss.getSheetByName(groupName);
    if (sheet != null) {
      console.info("Opening group " + groupName + " sheet.");
      return sheet;
    } else {
      console.info("Creating group " + groupName + " sheet.");
      sheet = ss.insertSheet(groupName);
    }

  } else {
    ss = SpreadsheetApp.create(filename);
    console.info("New spreadsheet created : " + ss.getUrl());
    console.info("Creating group " + groupName + " sheet.");
    sheet = ss.getActiveSheet();
    sheet.setName(groupName);
  }

  // Mise en forme

  sheet.getRange('A1').setValue('Groupe');
  sheet.getRange('B1').setValue(groupName);

  let plage = sheet.getRange("B1");
  let plage2 = sheet.getRange("B2:B1000");

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

  return sheet;
}

function filterClasses(groupName, agenda) {
  // Récupérer la feuille (ou la créer)
  let sheet = openOrCreateSheet(groupName);

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
  
  console.info("Extracting classes from " + (names.length-1) + " ADE calendar events.");
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
      lastRow = lastRow + 1;
      let values = sheet.getRange(lastRow, 1, 1, 2).getValues();
      savedData.push(values[0]);
    }
  }

  // Recharger les données mises à jour
  lastRow = sheet.getLastRow();
  savedData = sheet.getRange(1, 1, lastRow, 2).getValues();

  //Look if there's unchecked data
  let invalidChoices = savedData
    .filter(row => row[1] === "");
  console.log(invalidChoices);
  if (invalidChoices.length > 0) {
    console.error("There are " + invalidChoices.length + " classes with no indication.\nPlease indicate the classes you want at " + sheet.getParent().getUrl() );
  } 

  // Crée un tableau des noms validés (colonne B = "oui")
  let validNames = savedData
    .filter(row => row[1].toLowerCase() === "oui")
    .map(row => row[0]);

  // Filtrer l'agenda pour ne garder que les événements dont le nom correspond à un "oui"
  let filteredAgenda = agenda.filter(ev => {
    let nomEv = ev.summary;
    return validNames.includes(nomEv);
  });

  console.info("Agenda filtered.");
  return filteredAgenda;
}


