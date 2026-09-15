function getOrCreateMesCoursCalendar() {
  let name = "MesCoursTestINSA";
  let calendars = CalendarApp.getCalendarsByName(name);

  if (calendars.length > 0) {
    Logger.log("Agenda déjà existant : " + calendars[0].getId());
    return calendars[0];
  } else {
    let calendar = CalendarApp.createCalendar(name, {
      summary: name,
      timeZone: Session.getScriptTimeZone()
    });
    Logger.log("Nouvel agenda créé : " + calendar.getId());
    return calendar;
  }
}

function parsePlanexDate(str) {
  // str = "20250909T093000"
  let year   = parseInt(str.slice(0, 4));
  let month  = parseInt(str.slice(4, 6)) - 1; // mois JS 0-based
  let day    = parseInt(str.slice(6, 8));
  let hour   = parseInt(str.slice(9, 11));
  let minute = parseInt(str.slice(11, 13));
  let second = parseInt(str.slice(13, 15));

  return new Date(year, month, day, hour, minute, second);
}

function createEventCalendar(agenda) {
  // Récupère le calendrier
  let calendar = getOrCreateMesCoursCalendar();
  let year = new Date().getFullYear();
  let start = new Date(year, 7, 23, 0, 0); //23 aout (attention dates JS)
  let end = new Date((year+1), 7, 23, 0, 0);
  let events = calendar.getEvents(start, end);
  // Vérifie si un événement avec cet ID existe déjà (stocké dans la description)
 
  for (let i=0;i<agenda.length;i++) {
    let classes = agenda[i] ;
    let event = events.find(ev => ev.getDescription().includes("MY_ID=" + classes.eventId)); 
    console.log(classes.eventId);
    if (!event) {
      let newEvent = calendar.createEvent(classes.summary, classes.start, classes.end);
      newEvent.setDescription("MY_ID=" + classes.eventId + " LOCATION =" + classes.location);
    } else {
      console.log("Classes start : " + classes.start);
      console.log("Get Start Event : " + event.getStartTime());
      let isRight = event.getStartTime().getTime()===classes.start.getTime() && event.getEndTime().getTime()===classes.end.getTime();
      console.log(isRight);
      if (isRight){
        Logger.log("Événement déjà existant pour " + classes.eventId);}
      else {
        let newEvent = calendar.createEvent(classes.summary, classes.start, classes.end);
        newEvent.setDescription("MY_ID =" + classes.eventId + " LOCATION ="+classes.location);
        event.deleteEvent();
      }
    }
  }
}
