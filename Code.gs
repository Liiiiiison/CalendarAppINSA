function main(){
  //Récupérer les données
  let agenda = fetchData();
  
  //enregistre les dans un fichier sheet, trie ce que je veux voir et me renvoie mon agenda tri
  if (agenda!=null){
    let classes = filterClasses(agenda);
    //une fois que je sais lesquels je veux voir, je les importe dans calendar (s'ils n'existent pas déjà)
    createEventCalendar(classes);
  }
}
