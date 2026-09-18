# CalendarAppINSA

Petit projet Google Apps Script pour récupérer l'emploi du temps de l'INSA et gérer les aménagements.

## Note
Pour l'instant, seuls les emplois du temps des **1A SHN** et des **5A_TLS_SEC** sont intégrés dans le code. Rendez-vous à la section **« Ajouter un groupe »** pour trouver la démarche permettant d'ajouter le vôtre.

Vous pouvez modifier le nom des fichiers à la ligne 2 de chaque *handler* (pour créer plusieurs agendas, par exemple).

Si vous vous êtes trompés dans les cours que vous vouliez suivre, supprimez l'agenda erroné, corrigez le google sheets et relancez l'exécution.

## Comment ça marche ?

La première chose à faire est de vous rendre sur Google Apps Script : [script.google.com](https://script.google.com/home).

1. Créez votre projet et importez tous les fichiers situés dans ce dépôt (le plus simple est de les copier-coller directement à la main dans Google App Script, en conservant les noms).
2. Cliquez sur le **« + »** à côté de **Services**, puis ajoutez les API **Google Calendar** et **Google Sheets**.
3. Lancez l'exécution du fichier `Code` une première fois. Un code d'erreur va s'afficher : **c'est normal**. Un fichier Google Sheets a été créé et attend qu'un groupe soit sélectionné dans la cellule **A2**.
4. Choisissez votre groupe, puis relancez l'exécution.
5. Vous devriez voir apparaître vos cours dans Google Sheets, triés par ordre alphabétique.
6. Si vous suivez l'ensemble des cours, cochez **« Oui »** en face de chaque cours. Sinon, ne sélectionnez que ceux que vous souhaitez voir apparaître dans Google Calendar.
7. Une fois tous vos cours cochés, revenez dans Apps Script et relancez l'exécution une troisième fois. Un agenda devrait se créer dans Google Agenda et les cours y apparaître (par ordre alphabétique et non chronologique).
8. Allez dans le menu **Déclencheurs** (4ᵉ icône), puis créez-en un nouveau qui exécute la fonction `main` **UNE SEULE FOIS PAR JOUR, A UNE PLAGE HORAIRE QEU VOUS CHOISISSEZ AU HASARD** cela évitera du tuer les serveurs d'ADE si beaucoup de personnes font une requête.
9. C'est terminé ! 👍

## Ajouter un groupe

Pour ajouter votre propre groupe, rendez-vous sur ADE et cherchez votre emploi du temps :

1. Cliquez sur l'icône d'exportation :
   <img width="544" height="979" alt="CalendarApp" src="https://github.com/user-attachments/assets/c966c55a-7a54-44d5-9fcb-2f7eb3b87ec1" />
2. Cliquez sur **« Générer l'URL »**. Vous devriez obtenir une URL sous la forme suivante :
   `https://edt.insa-toulouse.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=2434&projectId=1&calType=ical&nbWeeks=53&displayConfigId=8&firstDate=2026-08-01`  
   Récupérez le nombre situé après `resources=` (dans l'exemple : **2434** pour les `2_MIC_A1`).
3. Dans le script, ouvrez le fichier `sheetHandler` et ajoutez le nom souhaité pour votre groupe dans la liste à la **ligne 19**. Conservez ce même nom pour l'ajouter également à la **ligne 86**. Copiez-collez la **ligne 85**, modifiez le nom avec celui que vous avez choisi, puis remplacez l'ID par celui que vous venez de récupérer.
4. Une fois ces étapes effectuées, vous pouvez lancer la procédure décrite ci-dessus !
