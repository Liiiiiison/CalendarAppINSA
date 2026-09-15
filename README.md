# CalendarAppINSA
Petit projet google script pour récupérer l'emploi du temps de l'insa et gérer les aménagements
## Note
Pour l'instant, il n'y a que l'emploi du temps des 1A SHN et des 5A_TLS_SEC qui sont dans le code, allez à la section "Ajouter un groupe" pour trouver la démarche pour ajouter le vôtre.
J'essaierai d'améliorer l'utilisation pour les cours de l'INSA, l'INP de Toulouse n'utilisant pas les mêmes formats, l'affichage est bien plus organisé que pour l'INSA.
## Comment ça marche ?
La première chose à faire est de se rendre sur google app script : https://script.google.com/home.
1. Créez votre projet et importer tous les fichiers que vous trouverez dans ce repo. 
2. Cliquez sur le "+" de Services et ajoutez les API de Google Calendar et de Google Sheets.
3. Lancer l'éxecution du fichier Code une première fois, un code d'erreur va s'afficher : c'est normal. Un fichier Google Sheets a été créé et il attend qu'un groupe soit sélectionné dans la case A2.
4. Choisissez votre groupe et relancer l'éxecution.
5. Vous devriez voir apparaître vos cours tranquillement dans google Sheets par ordre alphabétique
6. Si vous suivez l'ensemble des cours, cochez oui en face de tous les cours, sinon ne sélectionnez que ceux que vous voulez voir apparaître sur Google Calendar.
7. Une fois tout vos cours cochés, revenez dans App Script et relancez une 3e fois l'exécution, un agenda devrait se créer dans Google Agenda et les cours devrait apparaître tranquillement (par ordre alphabétique, pas chronologique).
8. Allez dans le menu déclencheur, (4e icône), créez en un nouveau qui exécute la fonction main, tous les jours ou toutes les heures, à votre convenance.
9. Normalement vous avez réussi ! 👍

## Ajouter un groupe

Pour ajouter votre propre groupe, rendez-vous sur ADE et allez chercher votre emploi du temps.
1. Cliquez sur l'icône export
   <img width="544" height="979" alt="CalendarApp" src="https://github.com/user-attachments/assets/c966c55a-7a54-44d5-9fcb-2f7eb3b87ec1" />
2. Cliquez sur "Génerer l'url". Vous devriez avoir un url de la forme suivant : https://edt.insa-toulouse.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=2434&projectId=1&calType=ical&nbWeeks=53&displayConfigId=8&firstDate=2026-08-01
   Récuperez le nombre après "resources=", dans l'exemple 2434 (pour les 2_MIC_A1).
3. Rendez-vous sur le script, dans le sheetHandler, ajoutez le nom que vous souhaitez avoir pour votre groupe dan la liste ligne 19. Conservez le même nom pour l'ajouter également ligne 79. Copiez-collez la ligne 78, modifiez le nom avec celui que vous avez choisi et modifiez l'id avec celui que vous avez récuperé.
4. Après ça, vous pouvez lancer la procédure décrite au-dessus !
