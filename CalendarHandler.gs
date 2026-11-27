function getOrCreateGroupCalendar(groupName) {
  let name = "Cours_" + groupName;
  let calendars = CalendarApp.getCalendarsByName(name);

  if (calendars.length > 0) {
    console.info("Agenda already exists : " + calendars[0].getId());
    return calendars[0];
  } else {
    let calendar = CalendarApp.createCalendar(name, {
      summary: name,
      timeZone: Session.getScriptTimeZone()
    });
    console.info("New agenda created : " + calendar.getId());
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

function createEventCalendar(agenda, groupName) {
  // Récupère le calendrier
  let calendar = getOrCreateGroupCalendar(groupName);
  const year = getStartYear();
  const start = new Date(year, 7, 23, 0, 0); //23 aout (attention dates JS)
  const end = new Date((year+1), 7, 23, 0, 0);
  let events = calendar.getEvents(start, end);

  let untouched = 0;
  let created = 0;
  let moved = 0;

  // For each event, choose to create it, move it or don't touch it
  for (let i=0;i<agenda.length;i++) {
    let classes = agenda[i] ;
    let event = events.find(ev => ev.getDescription().includes("MY_ID=" + classes.eventId)); 
    if (!event) {
      let newEvent = calendar.createEvent(classes.summary, classes.start, classes.end);
      newEvent.setDescription(classes.description + "\n\nMY_ID=" + classes.eventId);
      newEvent.setLocation(classes.location);
      created ++;
    } else {
      let isRight = event.getStartTime().getTime()===classes.start.getTime() && event.getEndTime().getTime()===classes.end.getTime();
      if (isRight){
        untouched ++;
      } else {
        let newEvent = calendar.createEvent(classes.summary, classes.start, classes.end);
        newEvent.setDescription(classes.description + "\n\nMY_ID=" + classes.eventId);
        newEvent.setLocation(classes.location);
        console.log("Event " + classes.summary + " moved from " + event.getStartTime() + " to " + classes.start);
        event.deleteEvent();
        moved ++;
      }
    }
  }

  console.info(created + " events created. " + moved + " events moved. " + untouched + " events untouched.")
}