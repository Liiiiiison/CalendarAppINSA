function main(){

  // USER INPUT: Please list all the groups you are in this year
  let groups = ["4IR_A2", "5SDBD_A2"];

  for (let i = 0; i < groups.length; i ++) {
    console.info("group name : " + groups[i]);

    //Récupérer les données
    let agenda = fetchIcal(groups[i]);
    
    //les enregistre dans un fichier sheet, trie ce que je veux voir et me renvoie mon agenda trié
    if (agenda!=null){
      let classes = filterClasses(groups[i], agenda);

      if (classes.length > 0) {
        //une fois que je sais lesquels je veux voir, je les importe dans calendar (s'ils n'existent pas déjà)
        createEventCalendar(classes, groups[i]);
      } else {
        console.info("Please indicate on the sheet the classes you take in group " + groups[i]);
      }
    }
  }
}

function getUrl(groupName) {
  try {
    switch (groupName) {
        case "5A_TLS_SEC" : univ="n7"; groupId = 3757; break;
        case "1A_S" : univ="insa"; groupId = 2315; break;
        case "4IR_A2" : univ="insa"; groupId = 3737; break;
        case "5SDBD_A2" : univ="insa"; groupId = 3772; break;
        case "L1Droit_DFDAS" : {
          univ="capitol";
          url = "https://ade25-edt.ut-capitole.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=f46f6d9dc69db125b01f750c9f58a254b08cef1767fef8fb282fb837176eb0117958dda4d63323c0bd47f4aa6121aced4f7e4e7b81efb967d8a30a13c87a158256debb5269fb68e2cdd12f25e4ef0966e60440c0124b0ef1baf2f17b9d3409a4,1";
          break;
        }
      }
  }
  catch(e){
    console.error("No group found");
    return 0;    
  }

  switch (univ) {
    case "n7" : {
      const [startDate, endDate] = getDateRange();
      const start = Utilities.formatDate(startDate, 'GMT', 'yyyy-MM-dd');
      const end = Utilities.formatDate(endDate, 'GMT', 'yyyy-MM-dd');
      return "https://edt.inp-toulouse.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources="+groupId+"&projectId=66&calType=ical&firstDate="+start+"&lastDate="+end;
    }
      
    case "insa" : {
      const [startDate, endDate] = getDateRange();
      const start = Utilities.formatDate(startDate, 'GMT', 'yyyy-MM-dd');

      //Calculate the number of weeks
      const msPerWeek = 1000 * 60 * 60 * 24 * 7;
      const diff = Math.abs(startDate - endDate);
      const nbWeeks = Math.ceil(diff / msPerWeek);
      
      return "https://edt.insa-toulouse.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources="+groupId+"&projectId=1&calType=ical&nbWeeks="+nbWeeks+"&displayConfigId=8&firstDate="+start;
    }

    default : return url;
  }
}
