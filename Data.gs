
function fetchInpIcal(n7, id) {
  // URL d'export iCal standard d'ADE Direct INP Toulouse
  const year = new Date().getFullYear();
  const d = new Date(year+"-"+9+"-"+"01") ;
  const f = new Date((year+1)+"-"+8+"-"+"01") ;
     
  const debut = Utilities.formatDate(d, 'GMT', 'yyyy-MM-dd')
  const fin = Utilities.formatDate(f, 'GMT', 'yyyy-MM-dd')
  let response ="";
  console.log("is N7? :" + n7);
  if (n7) {
    response = UrlFetchApp.fetch("https://edt.inp-toulouse.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources="+id+"&projectId=66&calType=ical&firstDate="+debut+"&lastDate="+fin, { muteHttpExceptions: true });
    console.log(response.getContentText());
  } else {
    response = UrlFetchApp.fetch("https://edt.insa-toulouse.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources="+id+"&projectId=1&calType=ical&nbWeeks=53&displayConfigId=8&firstDate="+debut, { muteHttpExceptions: true });
  }
  
  
  if (response.getResponseCode() !== 200) {
    console.error(`Erreur HTTP ${response.getResponseCode()} lors de la récupération du flux iCal.`);
    return [];
  }

  const icsText = response.getContentText();
  return parseIcsContent(icsText);
}


/**
 * Lit la chaîne brute .ics et extrait les événements sous forme d'objets JavaScript
 */
function parseIcsContent(icsData) {
  // Gestion du dépliage des lignes iCal (les lignes longues sont coupées par \r\n suivi d'un espace)
  const unfoldedIcs = icsData.replace(/\r?\n[ \t]/g, '');
  const lines = unfoldedIcs.split(/\r?\n/);

  const events = [];
  let currentEvent = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT') {
      if (currentEvent) {
        events.push(currentEvent);
        currentEvent = null;
      }
    } else if (currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = cleanIcsText(line.substring(8));
      } else if (line.startsWith('LOCATION:')) {
        currentEvent.location = cleanIcsText(line.substring(9));
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = cleanIcsText(line.substring(12));
      } else if (line.startsWith('UID:')) {
        // Nettoyage de l'UID (retrait des espaces résiduels)
        const rawUid = line.substring(4).replace(/\s+/g, '');
        currentEvent.uid = rawUid;
        
        // Extraction de l'ID de cours numérique décodé
        currentEvent.eventId = extractEventIdFromUid(rawUid);
      } else if (line.startsWith('DTSTART') || line.startsWith('DTEND')) {
        const isStart = line.startsWith('DTSTART');
        const value = line.split(':')[1];
        const dateObj = parseIcsDate(value);
        
        if (isStart) {
          currentEvent.start = dateObj;
        } else {
          currentEvent.end = dateObj;
        }
      }
    }
  }
  // 1. Trier le tableau d'événements par ordre alphabétique de summary
  const sortedAgenda = [...events].sort((a, b) => {
    const summaryA = a.summary || '';
    const summaryB = b.summary || '';
    return summaryA.localeCompare(summaryB, 'fr', { sensitivity: 'base' });
  });


  return sortedAgenda;
}

/**
 * Décode l'UID hexadécimal d'ADE pour récupérer l'ID de cours direct (ex: "7001")
 */
function extractEventIdFromUid(uid) {
  if (!uid || !uid.startsWith("ADE604")) return uid;

  try {
    // Isoler la partie hexadécimale après le préfixe ADE604
    const hex = uid.substring(5);
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    
    // Le format décodé est "2026-2027-[ID_EVENEMENT]-[INDEX]-[RECURRENCE]"
    const parts = str.split('-');

    if (parts.length >= 4) {
      // Combine l'ID parent et l'index de séance (ex: "7011_4")
      return parts[2] + "_" + parts[3] + "_" + parts[4]; 
    }
    return str || uid;
  } catch (e) {
    return uid;
  }
}

/**
 * Convertit une chaîne de date ICS (ex: "20260908T133000Z") en objet Date JavaScript
 */
function parseIcsDate(icsDateStr) {
  if (!icsDateStr) return null;

  // Format AAAAMMJJTHHMMSSZ
  const year = parseInt(icsDateStr.substring(0, 4), 10);
  const month = parseInt(icsDateStr.substring(4, 6), 10) - 1; // 0-indexed
  const day = parseInt(icsDateStr.substring(6, 8), 10);
  const hour = parseInt(icsDateStr.substring(9, 11), 10);
  const minute = parseInt(icsDateStr.substring(11, 13), 10);
  const second = parseInt(icsDateStr.substring(13, 15), 10);

  // Conversion explicite en UTC
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

/**
 * Nettoie les caractères d'échappement iCal (\,, \;, \n)
 */
function cleanIcsText(text) {
  return text
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\n/g, '\n')
    .trim();
}

/**
 * Fonction de test
 */
function testIcal() {
  const groupId = 621; // Remplace par l'ID de ton groupe
  const agenda = fetchInpIcal(groupId);
  
  if (agenda.length > 0) {
    console.log("Exemple de premier cours trouvé :");
    console.log("Titre :", agenda[0].summary);
    console.log("Début :", agenda[0].start ? agenda[0].start.toLocaleString('fr-FR') : 'N/A');
    console.log("Fin :", agenda[0].end ? agenda[0].end.toLocaleString('fr-FR') : 'N/A');
    console.log("Salle :", agenda[0].location);
    console.log("ID :", agenda[0].eventId);
  }
}

function fetchData(){
  const year = new Date().getFullYear();
  let id = getGroupeID();
  let n7 = isN7();
  const d = new Date(year+"-"+9+"-"+"01") ;
  const f = new Date((year+1)+"-"+8+"-"+"01") ;

  if (id!=0){      
    const debut = Utilities.formatDate(d, 'GMT', 'yyyy-MM-dd')
    const fin = Utilities.formatDate(f, 'GMT', 'yyyy-MM-dd')
    console.log(debut + "et" + fin)
    //const resp = UrlFetchApp.fetch("https://planex.insa-toulouse.fr/wsAde.php?id="+id+"&start="+debut+"&end="+fin);
    // const resp = UrlFetchApp.fetch("https://edt.inp-toulouse.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=1383&projectId=66&calType=ical&firstDate=2026-08-01&lastDate=2027-07-15");
    let agenda = fetchInpIcal(0,"3736");
    console.log("fetch data :" + agenda);
    return agenda;
  }
  else {
    return null;
  }
}

function getNames(agenda) {
  let names = [];
  let a = 0;

  for (let i=0;i<agenda.length;i++){
    names[i]=agenda[i].summary;
  }
  return names;
}

// function getNames(agenda){
//   let names = [];
//   let a = 0;
//   for (let i=0;i<agenda.length;i++){
//     let part = agenda[i].title.split("-", 1).join(" ");
//     if(!names.includes(part)){
//       names[a]=part;
//       a++;
//     }
//   }
//   console.log(names);
//   return names;
// }