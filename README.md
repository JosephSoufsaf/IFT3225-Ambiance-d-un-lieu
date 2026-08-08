____________
Description:
____________
Ce projet est une plateforme de suivi environnemental en temps réel conçue pour capturer, stocker et analyser le niveau sonore (dB) et l'ambiance de lieux publics (cafés, bibliothèques). Le système utilise un appareil mobile comme capteur via l'application Phyphox et un script bridge.js pour le transfert des données de mesure. En complément, une application cliente React permet aux usagers de consulter l'ambiance des lieux, de créer un compte, de soumettre des observations manuelles, et de gérer leurs lieux favoris et observés.

_______
Outils:
_______
- Node.js
- Phyphox installé sur votre téléphone pour la capture audio
- Compte MongoDB Atlas
- npm

_____________________________
Prérequis pour le client React:
_____________________________
- Node.js (pour lancer npm install / npm run dev dans le dossier client)
- L'API backend doit être en marche (voir section "Pour commencer (backend)")

_______________________
Pour commencer (backend):
_______________________
1. Cloner le projet
2. npm install
3. Créer un fichier .env à la racine avec le contenu suivant :
    MONGODB_URI="your_URI"
    PORT=7070
    JWT_SECRET="une_chaine_aleatoire_longue"
4. node index.js pour démarrer le serveur
5. Démarrer Phyphox sur le même réseau Wi-Fi que votre ordinateur
6. node bridge.js <PHONE_IP_PORT> <API_KEY> <DEVICE_ID> <LOCATION_NAME> avec Phyphox actif sur le cellulaire

Note : Vous pouvez utiliser node seed.js <baseline> <startOffset> <endOffset> pour peupler la base de données. baseline correspond à la valeur moyenne de décibels souhaitée (ex: 35.0) et le script crée des mesures qui fluctuent autour de ce baseline de ±3 dB. startOffset définit le point de départ de la simulation en minutes (ex: 60 pour commencer il y a 60 minutes), et endOffset définit la fin de la fenêtre temporelle (ex: 0 pour aller jusqu'à l'instant présent). Notez que seed.js crée seulement des Measurement/Observation — il faut créer le Location correspondant séparément via POST /locations pour qu'il apparaisse dans l'application cliente.

________________________
Pour commencer (client):
________________________
1. cd client
2. npm install
4. npm run dev
5. Ouvrir l'URL affichée

________________________________
Comment se connecter et tester les actions protégées:
________________________________
1. Aller sur /inscription pour créer un compte (email, nom d'utilisateur, mot de passe)
2. Aller sur /connection pour se connecter avec ces identifiants
3. Une fois connecté, le header affiche un bouton "Déconnexion" et un lien "Nouvelle observation"
4. Depuis /lieux, cliquer sur un lieu pour voir son détail (classification, historique, créneaux calmes), et ajouter/retirer ce lieu de vos favoris (visible seulement si connecté)
5. Depuis /nouvelleObservation, soumettre une observation pour un lieu — cette action est protégée et échoue si vous n'êtes pas connecté
6. L'onglet "Mes lieux" (dans /lieux) affiche vos favoris et les lieux où vous avez soumis une observation

_____________________
Instructions Postman:
_____________________
On commence par créer un appareil en envoyant une requête POST vers /api/devices avec un corps JSON contenant le nom de l'appareil. Le serveur génère automatiquement une clé API et la retourne dans la réponse avec un code 201. Cette clé doit être conservée, car elle sera nécessaire pour les requêtes de mesure. On peut vérifier que l'appareil a bien été enregistré en envoyant une requête GET vers /api/devices, qui retourne la liste complète des appareils sans nécessiter d'authentification.

Pour créer un compte utilisateur, on envoie une requête POST vers /api/register avec un corps JSON contenant email, username et password. Pour se connecter, POST vers /api/login avec email (ou username) et password — la réponse contient un authToken (JWT) à utiliser dans l'en-tête Authorization: Bearer <token> pour toutes les routes protégées par utilisateur.

Pour tester les endpoints de collecte de mesures, on envoie une requête POST vers /api/measurements en ajoutant la clé API de l'appareil dans l'en-tête x-api-key. Le corps de la requête contient le type de mesure, la valeur en décibels, l'unité, la localisation, l'horodatage et l'identifiant de l'appareil.

Pour soumettre une observation, on envoie une requête POST vers /api/observations avec l'en-tête Authorization: Bearer <token> (utilisateur connecté, pas de clé d'appareil). Le corps contient la localisation, la proximité, la vibe, des notes optionnelles — l'horodatage et l'auteur sont générés automatiquement par le serveur.

Pour gérer les lieux (créer, lister, consulter), on utilise /api/locations (POST pour créer, GET pour lister ou consulter un lieu précis par nom). Pour gérer ses lieux favoris/observés, on utilise /api/userLocations (GET/POST/DELETE), toutes protégées par Authorization: Bearer <token>.

Pour tester les endpoints sémantiques, aucune en-tête n'est requise puisque ces routes sont publiques. Une requête GET vers /api/ambiance/<lieu>/portrait retourne un portrait de l'ambiance des trente dernières minutes. Une requête GET vers /api/ambiance/<lieu>/history?last=24h retourne l'historique des mesures sur les vingt-quatre dernières heures, la fenêtre étant configurable via le paramètre last. Enfin, une requête GET vers /api/ambiance/<lieu>/quiet-hours retourne les créneaux horaires classés du plus calme au plus bruyant selon l'ensemble de l'historique.

Finalement, on vérifie le bon fonctionnement des middlewares d'authentification en envoyant une requête POST vers /api/measurements sans en-tête x-api-key, ce qui doit retourner un code 401, puis en envoyant la même requête avec une clé fictive, ce qui doit retourner un code 403. De façon similaire, une requête vers une route protégée par utilisateur sans en-tête Authorization retourne un code 401, et avec un token invalide/expiré, un code 401 également.

__________
Endpoints:
__________
POST /api/devices                        
enregistre un nouvel appareil (retourne une apiKey)

GET /api/devices                         
liste tous les appareils enregistrés

POST /api/register
crée un nouveau compte utilisateur

POST /api/login
authentifie un usager (retourne un authToken)

DELETE /api/logout
déconnecte l'usager (nécessite Authorization: Bearer)

POST /api/measurements                   
enregistre une nouvelle mesure sonore (nécessite x-api-key)

POST /api/observations	                 
enregistre une observation qualitative manuelle (nécessite Authorization: Bearer)

GET /api/locations
liste tous les lieux enregistrés

GET /api/locations/:name
détail d'un lieu précis

POST /api/locations
enregistre un nouveau lieu (nom, latitude, longitude)

GET /api/userLocations
liste les lieux sauvegardés de l'usager (favoris/observés, nécessite Authorization: Bearer)

POST /api/userLocations
ajoute un lieu aux favoris/observés de l'usager (nécessite Authorization: Bearer)

DELETE /api/userLocations
retire un lieu des favoris/observés de l'usager (nécessite Authorization: Bearer)

GET /api/ambiance/:location/quiet-hours  
retourne les heures les plus calmes par créneaux horaires (trié)

GET /api/ambiance/:location/history      
historique des données selon le paramètre last

GET /api/ambiance/:location/portrait     
portrait sémantique (résumé) des 30 dernières minutes
