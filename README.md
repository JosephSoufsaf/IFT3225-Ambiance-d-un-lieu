____________
Description:
____________
Ce projet est une plateforme de suivi environnemental en temps réel conçue pour capturer, stocker et analyser le niveau sonore (dB) de lieux publics (cafés, bibliothèques). Le système utilise un appareil mobile comme capteur via l'application Phyphox et un script bridge.js pour le transfert des données.

_______
Outils:
_______

- Node.js
- Phyphox installé sur votre téléphone pour la capture audio
- Compte Mongo DB Atlas

_____________________
Instructions Postman:
_____________________

On commence par créer un appareil en envoyant une requête POST vers /devices avec un corps JSON contenant le nom et la localisation de l'appareil. Le serveur génère automatiquement une clé API et la retourne dans la réponse avec un code 201. Cette clé doit être conservée, car elle sera nécessaire pour toutes les requêtes d'écriture suivantes. On peut vérifier que l'appareil a bien été enregistré en envoyant une requête GET vers /devices, qui retourne la liste complète des appareils sans nécessiter d'authentification.

Pour tester les endpoints de collecte, on envoie une requête POST vers /measurements en ajoutant la clé API dans l'en-tête x-api-key. Le corps de la requête contient le type de mesure, la valeur en décibels, l'unité, la localisation, l'horodatage et l'identifiant de l'appareil. Le même processus s'applique à /observations, où le corps contient plutôt la localisation, la proximité, la vibe, les notes optionnelles, l'horodatage et l'identifiant de l'appareil.

Pour tester les endpoints sémantiques, aucune en-tête n'est requise puisque ces routes sont publiques. Une requête GET vers /ambiance/hotel-lobby/portrait retourne un portrait de l'ambiance des trente dernières minutes. Une requête GET vers /ambiance/hotel-lobby/history?last=24 retourne l'historique des mesures sur les vingt-quatre dernières heures, la fenêtre étant configurable via le paramètre last. Enfin, une requête GET vers /ambiance/hotel-lobby/quiet-hours retourne les créneaux horaires classés du plus calme au plus bruyant selon l'ensemble de l'historique.

Finalement, on vérifie le bon fonctionnement du middleware d'authentification en envoyant une requête POST vers /measurements sans en-tête x-api-key, ce qui doit retourner un code 401, puis en envoyant la même requête avec une clé fictive, ce qui doit retourner un code 403.

_______________
Pour commencer:
_______________

1. Cloner le projet
2. npm install
3. creer .env à la racine et ecrire le suivant dedans:
    MONGODB_URI="your_URI"
    PORT=7070
4. npm start pour pour démarrer le serveur
5. demarre Phyphox connecte au meme IP que votre ordi
6. node bridge.js <PHONE_IP_PORT> <API_KEY> <DEVICE_ID> <LOCATION_NAME> avec Phyphox qui roule sur le cellulaire

*peut utiliser node seed.js <baseline> <startOffset> <endOffset> pour populer le DB. Baseline correspond à la valeur moyenne de décibels souhaitée (ex: 35.0) et le script crée des mesures qui fluctue autour du basline de 3 dB , startOffset définit le point de départ de la simulation en minutes (ex: 60 pour commencer il y a 60 minutes), et endOffset définit la fin de la fenêtre temporelle (ex: 0 pour aller jusqu'à l'instant présent). De cette façon, vous pouvez peupler la base de données sur plusieurs périodes afin de mieux la tester.
__________
Endpoints:
__________

POST /devices                        enregistre un nouveau appareil (retourne une apiKey)
GET /devices                         liste tous les appareils enregistrés
POST /measurements                   enregistre une nouvelle mesure sonore (nécessite x-api-key)
POST /observations	                 enregistre une observation qualitative manuelle (nécessite x-api-key)
GET /ambiance/:location/quiet-hours  retourne les heures les plus calmes par créneaux horaires (trié)
GET /ambiance/:location/history      historique des données selon le paramètre last
GET /ambiance/:location/portrait     portrait sémantique (résumé) des 30 dernières minutes

