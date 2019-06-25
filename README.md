## Lancement :
initialisation et chargement des dépendances : 

`$> npm install`

pour lancer :  

`$> npm start`

pour lancer les tests:  

`$> npm start`

## Démarche : 

Ma démarche est la suivante : Jai besoin de parser la data du html. Pour celà j'ai 3 niveaux d'abstraction possibles : 
- la regexp dans le texte en tant que tel: une solution très simple mais sans doute assez fragile et qui plus est, les regexp sont peu user firndly et n'exploitent pas la structure du html. 
- un parser custom du htlm en objet js : permet de coupler la simplicité et la main mise sur la solution tout en exloitant la structure du html, mais trouver une bonne manière de parser peut être hardu
- laisser un browser créer un DOM pour faciliter l'exploitaton de la donnée : de loin la solution la plus user fiendly mais sans doute aussi la plus gourmande en ressources. Plus tard j'ai réalisé que certains modules permettent de créer un dom et d'utiliser le xpath pour y trouver des éléments, mais les quelques tests effectués ne m'on pas permis de trouver des modules parfaitement fonctionnels sur les fonctionalités demandées. Ceci étant, c'est là clairement la voie à suivre pour alléger le projet. 

J'ai décidé de partir sur cette dernière solution et d'utiliser puppeteer qui tourne sur un navigateur headless pour gagner en performance.

En suite j'ai essayé de créer un système d'instruction (cf instruction.json) se voulant aussi exhaustif que possible pour donner une solution plus élégante et plus facile à modifier qu'un script. Mis à part les dates des tickets de train (des structures répétées à l'interieur de chaines de carractère, alors que pupeteer ne supporte pas toutes les fonctions de string de xpath), j'estime que c'est relativement robuste.



## Nota bene :
Il me semble qu'il y a un souci dans le json demandé, en effet, lors du dernier retour, 4 passagés de 26 à 59 ans sont référencés alors que dans le html, seuls 2 sont de cette tranche d'age lorsque les 2 autres sont de jeunes enfants. J'ai donc ris la liberté de modifier le fichier attendu.

## Consignes

Le fichier test.html correspondant à des billets de train, et le fichier test-result.json qui est le résultat attendu. L'objectif est de réaliser un petit programme permettant de générer test-result.json.
- langage libre
- node.JS 8.9.3

=> je dois pouvoir exécuter le programme et examiner le code-source.
