/**
 * Va chercher le calendrier iCal sur l'ADE correspondant
 */
function fetchIcal(groupName) {
  const url = getUrl(groupName);

  let response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) {
    console.error(`HTTP error ${response.getResponseCode()} when fetching iCal stream.`);
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
  let today = new Date();
  let ignore = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (ignore === true) {
      //ignore les évènements antérieurs à today
      if (line === 'END:VEVENT') {
        ignore = false;
      }
    }
     else if (line === 'BEGIN:VEVENT') {
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
        if (dateObj < today) {
          ignore = true;
        }
        
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
    const parts = str.split('-');
    
    if (parts.length === 4) {
      // Format de l'insa : INSA2627-[ID_EVENEMENT]-[INDEX]-[RECURRENCE]
      return parts[1] + "_" + parts[2] + "_" + parts[3];
    } else if (parts.length === 5){
      //Format de l'n7 : 2026-2027-[ID_EVENEMENT]-[INDEX]-[RECURRENCE]
      // ou de l'ut capitole : ADEPROD_2026-2027-[ID_EVENEMENT]-[INDEX]-[RECURRENCE]
      return parts[2] + "_" + parts[3] + "_" + parts[4]; 
    }

    console.log("Unrecognized format : " + str);
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
  const groupId = 2315; // Remplace par l'ID de ton groupe
  const agenda = fetchIcal(0,groupId);
  
  if (agenda.length > 0) {
    console.log("Exemple de premier cours trouvé :");
    console.log("Titre :", agenda[0].summary);
    console.log("Début :", agenda[0].start ? agenda[0].start.toLocaleString('fr-FR') : 'N/A');
    console.log("Fin :", agenda[0].end ? agenda[0].end.toLocaleString('fr-FR') : 'N/A');
    console.log("Salle :", agenda[0].location);
    console.log("ID :", agenda[0].eventId);
  }
}

/**
 *  De aout à décembre, donne l'année actuelle.
 *  De janvier à juillet, donne l'année précédente.
 */

function getStartYear() {
  let month = new Date().getMonth();
  if (month > 7) {
    return new Date().getFullYear();
  } else {
    return new Date().getFullYear() - 1 ;
  }
}

/**
 * Donne la date de début et de fin au bon format
 */
function getDateRange() {
  const year = getStartYear();
  let d = new Date(year+"-"+9+"-"+"01") ;
  let now = new Date();
  if (now.getMonth() >= 9) {
    d = now;
  }

  const end = new Date((year+1)+"-"+8+"-"+"01") ;

  return [d, end];
}

/**
 * Retiens juste les noms des évenements
 */
function getNames(agenda) {
  let names = [];

  for (let i=0;i<agenda.length;i++){
    names[i]=agenda[i].summary;
  }
  return names;
}

