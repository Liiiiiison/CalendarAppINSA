# CalendarAppINSA

Petit projet Google Apps Script pour récupérer l'emploi du temps ADE (utilisé par l'INSA Toulouse, l'ENSEIGHT et Toulouse-Capitole entre autres), idéal pour les étudiants en aménagement d'études.

## Note

Pour l'instant, seuls quelques emplois du temps sont intégrés dans le code. Rendez-vous à la section **« Ajouter un groupe »** pour trouver la démarche permettant d'ajouter le vôtre.

Attention : le script n'a été testé que pour l'N7, l'INSA et l'université Toulouse-Capitole. Il devrait marcher pour d'autres universités mais ce n'est pas garanti. S'il y a des bugs, vous pouvez essayer de les résoudre vous-même ou nous demander de l'aide :D

Aussi, le script est plus optimal pour l'INSA et l'N7 dont les requêtes ADE sont en clair dans l'URL.

Si vous vous êtes trompés dans les cours que vous vouliez suivre, supprimez l'agenda erroné, corrigez le google sheets et relancez l'exécution.

## Comment ça marche ?

La première chose à faire est de vous rendre sur Google Apps Script : [script.google.com](https://script.google.com/home).

1. Créez votre projet et importez tous les fichiers situés dans ce dépôt.
2. Cliquez sur le **« + »** à côté de **Services**, puis ajoutez les API **Google Calendar** et **Google Sheets**.
3. Ajoutez votre groupe s'il n'est pas déjà mis.
4. Dans le fichier `Code.gs`, à la ligne 4, mettez le(s) nom(s) du ou des groupes dont vous voulez avoir l'agenda. Le nom doit correspondre à un des groupes ajoutés à l'étape 3.
5. Lancez l'exécution du fichier `Code.gs` une première fois. Un code d'erreur va s'afficher : **c'est normal**. Un fichier Google Sheets a été créé. Vous devriez y voir apparaître vos cours, triés par ordre alphabétique.
6. Si vous suivez l'ensemble des cours, cochez **« Oui »** en face de chaque cours. Sinon, ne sélectionnez que ceux que vous souhaitez voir apparaître dans Google Calendar.
7. Une fois tous vos cours cochés, revenez dans Apps Script et relancez l'exécution une deuxième fois. Un ou plusieurs agendas devraient se créer dans Google Agenda et les cours devraient y apparaître.
8. Allez dans le menu **Déclencheurs** (4ᵉ icône), puis créez-en un nouveau qui exécute la fonction `main` tous les jours ou toutes les heures, selon votre convenance.
9. C'est terminé ! 👍

## Ajouter un groupe

### Pour l'N7 ou l'INSA

Pour ajouter votre propre groupe, rendez-vous sur ADE et cherchez votre emploi du temps :

1. Cliquez sur l'icône d'exportation :
   <img width="544" height="979" alt="CalendarApp" src="https://github.com/user-attachments/assets/c966c55a-7a54-44d5-9fcb-2f7eb3b87ec1" />
2. Cliquez sur **« Générer l'URL »**. Vous devriez obtenir une URL sous la forme suivante :
   `https://edt.insa-toulouse.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=2434&projectId=1&calType=ical&nbWeeks=53&displayConfigId=8&firstDate=2026-08-01`  
   Récupérez le nombre situé après `resources=` (dans l'exemple : **2434** pour les `2_MIC_A1`). C'est votre ID de groupe.
3. Dans le script, ouvrez le fichier `Code.gs` et rendez-vous à la ligne 29. Ajoutez une ligne `case`dans le bloc `switch` avec le même format que les autres lignes `case`: `case "votre_groupe" : univ="votre_univ"; groupId="votre_ID_de_groupe"; break;`
4. Une fois ces étapes effectuées, vous pouvez reprendre la procédure décrite ci-dessus !

### Pour une autre université

Pour ajouter votre propre groupe, rendez-vous sur ADE et cherchez votre emploi du temps :

1. Générez une url à partir de votre emploi du temps. Assurez-vous qu'elle couvre toute l'année (ou toute la période que vous souhaitez).
2. Dans le script, ouvrez le fichier `Code.gs` et allez à la suite de la ligne 42. Ajoutez un bloc `case` avec le même format que les autres blocs `case`:
   `case "votre_groupe" : {
      univ="votre_univ";
      url="votre_url";
      break;
   }`
4. Une fois ces étapes effectuées, vous pouvez reprendre la procédure décrite ci-dessus !
