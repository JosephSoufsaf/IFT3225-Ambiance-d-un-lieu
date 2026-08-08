# Maintenabilité et réutilisabilité

## Découpage retenu

Avant refactorisation, la logique d'accès aux données, la gestion d'état (chargement, erreur) et l'affichage étaient mélangés directement dans les composants de page. Trois pages (*Lieux*, *Map*, *NouvelleObservation*) dupliquaient chacune le même bloc *useState*/*useEffect* pour récupérer la liste des lieux, et la gestion du token d'authentification était dispersée dans six fichiers différents (*api/client.js*, *Header.jsx*, *connection.jsx*), chacun accédant directement à *localStorage*.

La refactorisation sépare maintenant trois responsabilités distinctes :
- l'*accès aux données* (*api/client.js*) — fonctions pures qui ne connaissent que HTTP, sans lire ni écrire d'état applicatif ;
- l'*état partagé et la logique métier* (hooks personnalisés, contexte, store) ;
- l'*affichage* (composants de page, réduits à orchestrer les hooks et rendre le JSX).

## Hooks, contexte et store

*Hooks personnalisés.* Deux hooks extraient des patterns de fetch auparavant dupliqués. *useLocations()* remplace le triplet *useState(locations/loading/error)* + *useEffect* répété dans trois pages par un seul appel, désormais branché sur le store partagé. *useLocationDetails(name)* regroupe la récupération du portrait, des créneaux calmes et de l'historique d'un lieu sélectionné, avec les trois requêtes lancées en parallèle (*Promise.all*) plutôt que séquentiellement comme dans la version initiale.

*Contexte.* *AuthContext* (exposé via le hook *useAuth()*) centralise l'état d'authentification — le token et le statut *loggedin* — évitant que chaque composant ou fonction d'API doive lire *localStorage* lui-même. Les fonctions d'*api/client.js* qui nécessitent une authentification reçoivent désormais le token en paramètre explicite plutôt que d'y accéder directement, ce qui les garde pures et testables indépendamment de l'état de l'application.

*Store.* Un store Zustand (*useLocationsStore*) remplace l'état local dupliqué pour la liste des lieux. Les trois pages qui en ont besoin partagent désormais la même donnée en mémoire : la première page à monter déclenche le fetch, les suivantes réutilisent le résultat déjà chargé sans requête réseau additionnelle.

## Composants réutilisables

*<LocationButton>* et *<LocationList>* remplacent le pattern de bouton/liste répété trois fois dans *Lieux* (tous les lieux, favoris, lieux observés). *<AuthForm>* généralise la structure commune des formulaires de connexion et d'inscription (état par champ, gestion d'erreur/message, soumission) derrière une configuration déclarative de champs, éliminant la duplication entre *connection.jsx* et *inscription.jsx*.