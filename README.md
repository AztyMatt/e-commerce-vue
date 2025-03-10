# Documentation du Projet E-Commerce Microservices

## Table des Matières

1. [Introduction](#introduction)
2. [Architecture du Projet](#architecture-du-projet)
   - [Vue d'Ensemble](#vue-densemble)
   - [Microservices](#microservices)
3. [Structure des Répertoires](#structure-des-répertoires)
4. [Environnement et Dépendances](#environnement-et-dépendances)
   - [Environnement d'Exécution](#environnement-dexecution)
   - [Logiciels Nécessaires](#logiciels-nécessaires)
   - [Dépendances](#dépendances)
   - [Détails des Composants](#détails-des-composants)
5. [Configuration et Déploiement](#configuration-et-déploiement)
   - [Déploiement Manuel avec PM2 pour la Pré-production](#déploiement-manuel-avec-pm2-pour-la-pré-production)
   - [Déploiement avec Docker et Docker Compose](#déploiement-avec-docker-et-docker-compose)
     - [Environnement de Développement](#environnement-de-développement)
   - [Scripts d'Automatisation](#scripts-dautomatisation)
6. [Fonctionnalités Principales](#fonctionnalités-principales)
   - [Authentification JWT](#authentification-jwt)
   - [Gestion des Produits et du Panier](#gestion-des-produits-et-du-panier)
   - [Gestion des Commandes](#gestion-des-commandes)
7. [Flux de Données](#flux-de-données)
8. [Tests et Qualité du Code](#tests-et-qualité-du-code)
   - [Tests de Sécurité](#tests-de-sécurité)
   - [Tests Frontend](#tests-frontend)
   - [Tests Backend](#tests-backend)
9. [Bonnes Pratiques et Considérations](#bonnes-pratiques-et-considérations)
10. [Annexes](#annexes)
    - [Exemples de Commandes CURL](#exemples-de-commandes-curl)
    - [Comment Exécuter le Projet](#comment-exécuter-le-projet)

---

# Documentation du Projet E-Commerce Microservices

---

## Introduction

Documentation détaillée du **Projet E-Commerce Microservices**. Ce projet est une application e-commerce complète basée sur une architecture microservices, conçue pour offrir modularité, scalabilité et maintenabilité. Cette documentation couvre la structure du projet, les composants individuels, les configurations nécessaires, les méthodes de déploiement, ainsi que les pratiques de développement et de test mises en œuvre.

---

## Architecture du Projet

### Vue d'Ensemble

Le projet est structuré autour d'une architecture microservices, permettant de séparer les différentes fonctionnalités en services indépendants. Cette approche facilite la maintenance, la scalabilité et l'évolution de l'application.

**Composants Principaux :**

- **Frontend** : Application utilisateur développée avec Vue.js.
- **Backend** : Trois microservices principaux :
  - **Auth Service** : Gestion de l'authentification et des utilisateurs.
  - **Product Service** : Gestion des produits et du panier.
  - **Order Service** : Gestion des commandes.
- **Base de Données** : Chaque microservice dispose de sa propre base de données MongoDB.
- **Conteneurisation** : Utilisation de Docker et Docker Compose pour la conteneurisation et l'orchestration.

- Les machines du projets utilisées sont toutes des **debian 12**, veuillez prendre en compte cette information que ce soit ou un déploiement local ou pour votre future pipeline :)
### Microservices

1. **Auth Service** : Gère l'inscription, la connexion, la gestion des profils utilisateurs et l'authentification via JWT.
2. **Product Service** : Gère l'affichage des produits, les opérations sur le panier (ajout, modification, suppression).
3. **Order Service** : Gère la création et la consultation des commandes des utilisateurs.

---

## Structure des Répertoires

Voici la structure complète du projet, excluant les dossiers ignorés (`node_modules`, `dist`, `.git`, `coverage`):

```
.
├── docker-compose.prod.yml
├── docker-compose.yml
├── frontend
│   ├── build-front.yml
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── public
│   ├── README.md
│   ├── server.cjs
│   ├── src
│   │   ├── App.vue
│   │   ├── assets
│   │   ├── components
│   │   ├── main.js
│   │   ├── router
│   │   ├── services
│   │   └── style.css
│   ├── test-results
│   ├── tests
│   ├── vite.config.js
│   └── vitest.config.js
├── package.json
├── package-lock.json
├── README.md
├── scripts
│   ├── deploy.sh
│   ├── init-products.sh
│   ├── run-tests.sh
│   ├── setup.sh
│   └── tests.notes
└── services
    ├── auth-service
    │   ├── build-auth.yml
    │   ├── Dockerfile
    │   ├── jest.config.js
    │   ├── package.json
    │   ├── package-lock.json
    │   ├── src
    │   └── tests
    ├── order-service
    │   ├── build-order.yml
    │   ├── Dockerfile
    │   ├── jest.config.js
    │   ├── package.json
    │   ├── package-lock.json
    │   ├── src
    │   └── tests
    └── product-service
        ├── build-product.yml
        ├── Dockerfile
        ├── jest.config.js
        ├── package.json
        ├── package-lock.json
        ├── src
        └── tests
```

---

## Environnement et Dépendances

### Environnement d'Exécution

L'application peut être déployée de deux manières principales :

1. **Déploiement Manuel avec PM2 pour la Pré-production** : Exécution directe des services sur votre machine locale en utilisant PM2 pour gérer les processus, idéal pour la pré-production ou les environnements de test.

2. **Déploiement avec Docker et Docker Compose** : Utilisation de Docker pour conteneuriser les services et Docker Compose pour orchestrer les conteneurs en environnement de développement.

### Logiciels Nécessaires

#### Pour le Déploiement Manuel

- **Node.js** : Version 14.x ou supérieure.
- **npm** : Version 6.x ou supérieure (généralement inclus avec Node.js).
- **Git** : Pour cloner le dépôt du projet.
- **MongoDB** : Version 4.4 installée et en cours d'exécution localement.
- **PM2** : Pour gérer les processus Node.js en production ou pré-production.

#### Pour le Déploiement avec Docker

- **Docker** : Version 20.x ou supérieure.
- **Docker Compose** : Version 1.27 ou supérieure.

#### Outils de Développement (Facultatif)

- **Visual Studio Code** ou tout autre éditeur de code.
- **Postman** : Pour tester les API backend.
- **MongoDB Compass** : Pour gérer visuellement les bases de données MongoDB.

### Dépendances

Chaque composant (frontend et services backend) possède ses propres dépendances gérées via `package.json`. Voici un aperçu des dépendances principales :

#### Frontend

- **Vue.js** : Framework JavaScript pour construire l'interface utilisateur.
- **Vue Router** : Gestion des routes côté client.
- **Axios** : Pour les requêtes HTTP vers les APIs backend.
- **Vite** : Outil de bundling et de développement rapide.
- **Vitest** : Framework de test pour Vue.js.

#### Services Backend

- **Express.js** : Framework web pour Node.js.
- **Mongoose** : ODM pour interagir avec MongoDB.
- **jsonwebtoken** : Pour la génération et la vérification des tokens JWT.
- **bcrypt** : Pour le hachage des mots de passe.
- **Cors** : Middleware pour gérer les en-têtes CORS.
- **dotenv** : Pour gérer les variables d'environnement.
- **Jest** : Framework de test pour Node.js.

### Détails des Composants

#### Frontend

Le frontend est une application Vue.js qui sert d'interface utilisateur pour l'application e-commerce.

- **Technologies** : Vue.js, Vue Router, Axios, Vite.
- **Structure** :
  - **`index.html`** : Point d'entrée HTML de l'application.
  - **`src/`** : Contient le code source de l'application.
    - **`main.js`** : Point d'entrée JavaScript, configure l'application Vue et le routeur.
    - **`App.vue`** : Composant racine de l'application.
    - **`components/`** : Contient les composants Vue réutilisables.
      - **`AuthTest.vue`** : Composant pour l'inscription, la connexion et l'affichage du profil utilisateur.
      - **`OrderHistory.vue`** : Composant pour afficher l'historique des commandes.
      - **`ProductList.vue`** : Composant pour afficher la liste des produits disponibles.
      - **`ShoppingCart.vue`** : Composant pour gérer le panier d'achat de l'utilisateur.
    - **`services/`** : Contient les services pour communiquer avec les APIs backend via Axios.
      - **`authService.js`**, **`cartService.js`**, **`orderService.js`**, **`productService.js`**.
    - **`router/`** : Configure les routes de l'application avec Vue Router.
    - **`assets/`** : Contient les fichiers statiques tels que les images et les styles CSS.
  - **`server.cjs`** : Serveur Express qui sert les fichiers statiques et configure les proxies vers les microservices backend (pour la production)
  - **`tests/`** : Contient les tests unitaires du frontend.
  - **`vite.config.js`** et **`vitest.config.js`** : Configurations pour Vite et Vitest (pour le developement)

**Fonctionnalités Clés :**

- **Authentification** : Inscription, connexion, gestion du profil via JWT.
- **Gestion des Produits** : Affichage de la liste des produits, détails des produits.
- **Gestion du Panier** : Ajout, modification, suppression d'articles dans le panier.
- **Gestion des Commandes** : Passation de commandes, affichage de l'historique des commandes.

#### Services Backend

Chaque microservice backend est développé en Node.js avec Express et possède sa propre base de données MongoDB.

##### Auth Service

- **Fonctionnalités** :
  - Inscription, connexion, gestion du profil utilisateur.
  - Génération et vérification des tokens JWT.
- **Structure** :
  - **`src/app.js`** : Point d'entrée du service.
  - **`src/controllers/authController.js`** : Contient les fonctions pour l'inscription, la connexion et la récupération du profil.
  - **`src/models/user.js`** : Modèle Mongoose pour les utilisateurs.
  - **`src/routes/authRoutes.js`** : Définit les routes pour l'authentification.
  - **`src/middleware/auth.js`** : Middleware pour vérifier le token JWT.
  - **Tests** : Situés dans **`tests/`**.

##### Product Service

- **Fonctionnalités** :
  - Gestion des produits : liste, détails.
  - Gestion du panier : ajout, suppression, mise à jour.
- **Structure** :
  - **`src/app.js`** : Point d'entrée du service.
  - **`src/controllers/productController.js`** : Gère les opérations liées aux produits.
  - **`src/models/product.js`** : Modèle Mongoose pour les produits.
  - **`src/routes/productRoutes.js`** : Définit les routes pour les produits.
  - **`src/controllers/cartController.js`** : Gère les opérations sur le panier.
  - **`src/models/cart.js`** : Modèle Mongoose pour le panier.
  - **`src/routes/cartRoutes.js`** : Définit les routes pour le panier.
  - **Tests** : Situés dans **`tests/`**.

##### Order Service

- **Fonctionnalités** :
  - Création et consultation des commandes.
- **Structure** :
  - **`src/app.js`** : Point d'entrée du service.
  - **`src/controllers/orderController.js`** : Gère la création et la récupération des commandes.
  - **`src/models/order.js`** : Modèle Mongoose pour les commandes.
  - **`src/routes/orderRoutes.js`** : Définit les routes pour les commandes.
  - **Tests** : Situés dans **`tests/`**.

---

## Configuration et Déploiement

### Déploiement Manuel avec PM2 pour la Pré-production

Le déploiement manuel consiste à exécuter directement les services sur votre machine locale en utilisant PM2 pour gérer les processus. Le script `deploy.sh` est utilisé pour automatiser ce processus et est idéal pour les environnements de pré-production ou de test.

#### Utilisation de `deploy.sh`

- **Chemin** : `scripts/deploy.sh`
- **Fonctionnalités** :
  - Installe les dépendances pour le frontend et les services backend.
  - Construit le frontend avec `npm run build` (comme en production).
  - Démarre les services backend et le frontend en utilisant PM2.

**Étapes :**

1. **Installer PM2** :

   ```bash
   npm install -g pm2
   ```

2. **Rendre le script exécutable** :

```bash
   chmod +x scripts/deploy.sh
   mkdir /opt/e-commerce
   cp -r e-commerce-vue/* /opt/e-commerce
   cd /opt/e-commerce
```

3. **Exécuter le script** :

```bash
   ./scripts/deploy.sh
   ./scripts/init-products.sh
```

**Remarques :**

- Assurez-vous que MongoDB est installé et en cours d'exécution sur votre machine.
- Configurez les variables d'environnement nécessaires dans des fichiers `.env` situés dans chaque répertoire de service.
- PM2 offre des fonctionnalités de surveillance, de gestion des logs et de redémarrage automatique.
- Exemple avec SSH : 
```bash
sync -avz --delete --exclude '.git' -e "ssh -o StrictHostKeyChecking=no" ./ root@192.168.1.108:/opt/e-commerce
```

### Déploiement avec Docker et Docker Compose

Le projet utilise Docker pour conteneuriser les services et le frontend, et Docker Compose pour orchestrer les conteneurs. Le fichier `docker-compose.yml` est configuré pour déployer la stack en mode développement. En modifiant la cible (`target`) dans les Dockerfiles ou les variables d'environnement, il est possible de déployer en mode production.

#### Environnement de Développement

1. **Prérequis** :

   - **Docker** et **Docker Compose** installés sur votre machine.
   - **Git** pour cloner le dépôt du projet.

2. **Cloner le Dépôt** :

   ```bash
   git clone <URL_DU_DÉPÔT>
   cd <NOM_DU_PROJET>
   ```

3. **Construire et Démarrer les Conteneurs** :

   ```bash
   docker-compose up --build
   ```

4. **Initialisation des Données** :

   ```bash
   ./scripts/init-products.sh
   ```

5. **Accès à l'Application** :

   - Ouvrez votre navigateur et accédez à `http://localhost:8080`.

---

## Scripts d'Automatisation

Le répertoire **`scripts/`** contient plusieurs scripts pour faciliter le déploiement et la gestion du projet :

- **`deploy.sh`** : Automatise le déploiement manuel de l'application avec PM2 pour la pré-production.
- **`init-products.sh`** : Initialise la base de données des produits avec des données par défaut.
- **`run-tests.sh`** : Exécute l'ensemble des tests pour les services backend et le frontend.
- **`setup.sh`** : Prépare l'environnement de développement en installant les dépendances nécessaires.
- **`tests.notes`** : Contient des notes ou des instructions supplémentaires liées aux tests.

**Exemples d'utilisation :**
- **Mise en place initiale sur le serveur de dev** :

  ```bash
  ./scripts/setup.sh
  ```

- **Exécuter les Tests** :

  ```bash
  ./scripts/run-tests.sh
  ```

- **Initialiser les Données des Produits** :

  ```bash
  ./scripts/init-products.sh
  ```

---

## Fonctionnalités Principales

### Authentification JWT

- **Inscription et Connexion** : Les utilisateurs peuvent s'inscrire avec un email et un mot de passe, puis se connecter pour obtenir un token JWT.
- **Protection des Routes** : Les routes sensibles sont protégées par un middleware qui vérifie le token JWT.
- **Gestion du Profil** : Les utilisateurs peuvent consulter leur profil.

### Gestion des Produits et du Panier

- **Liste des Produits** : Affichage de tous les produits disponibles.
- **Détails du Produit** : Affichage des informations détaillées sur un produit.
- **Panier** :
  - **Ajout au Panier** : Les utilisateurs peuvent ajouter des produits à leur panier.
  - **Modification du Panier** : Mise à jour ou suppression d'articles du panier.
  - **Consultation du Panier** : Affichage des articles dans le panier.

### Gestion des Commandes

- **Passation de Commande** : Les utilisateurs peuvent passer une commande basée sur le contenu de leur panier.
- **Historique des Commandes** : Consultation des commandes précédentes.

---

## Flux de Données

1. **Authentification** :
   - **Inscription** :
     - Frontend → `/api/auth/register` → Auth Service → Base de Données → Frontend.
   - **Connexion** :
     - Frontend → `/api/auth/login` → Auth Service → Base de Données → Frontend.
   - **Profil** :
     - Frontend (avec JWT) → `/api/auth/profile` → Auth Service → Base de Données → Frontend.

2. **Gestion des Produits et du Panier** :
   - **Liste des Produits** :
     - Frontend → `/api/products` → Product Service → Base de Données → Frontend.
   - **Gestion du Panier** :
     - Frontend → `/api/cart/*` → Product Service → Base de Données → Frontend.

3. **Gestion des Commandes** :
   - **Passation de Commande** :
     - Frontend → `/api/orders/create` → Order Service → Base de Données → Frontend.
   - **Historique des Commandes** :
     - Frontend → `/api/orders/user/:userId` → Order Service → Base de Données → Frontend.

---

## Tests et Qualité du Code

### Tests de Sécurité

- **SonarCloud** : Peut être implémenté pour une analyse continue de la qualité et de la sécurité du code.
- **Trivy** : Outil de scan de vulnérabilités pour le code et les conteneurs.

### Tests Frontend

- **Framework** : Vitest
- **Localisation** : `frontend/tests/`
- **Types de Tests** :
  - **Unitaires** : Tests des composants Vue.js et des services Axios.

**Exécution des Tests :**

```bash
cd frontend
npm run test
npm run test:unit
npm run test:coverage
npm run lint:report || true
```

### Tests Backend

- **Framework** : Jest
- **Localisation** : `services/<service-name>/tests/`
- **Types de Tests** :
  - **Unitaires** : Tests des contrôleurs, des modèles et des routes.

**Exécution des Tests :**

```bash
cd services/<service-name>
npm test
npm run lint || true # Si disponible
```

---

## Bonnes Pratiques et Considérations

- **Modularité** : Chaque service est indépendant, ce qui facilite la maintenance et la scalabilité.
- **Sécurité** :
  - Utilisation de tokens JWT pour sécuriser les communications.
  - Protection des routes sensibles avec des middlewares d'authentification.
  - Stockage sécurisé des mots de passe (hachage avec bcrypt).
  - Gestion des secrets avec des variables d'environnement sécurisées.
- **Gestion des Erreurs** : Implémentation de messages d'erreur clairs pour faciliter le débogage.
- **Logs** :
  - Les services backend utilisent des middlewares de logging pour enregistrer les requêtes reçues.
- **Configuration du Proxy** :
  - Le fichier `server.cjs` est configuré pour rediriger correctement les requêtes du frontend vers les services backend.
- **Conteneurisation et Orchestration** :
  - Utilisation de Docker pour isoler les environnements de développement et de production.
- **Tests Automatisés** : Maintien d'une couverture de tests élevée pour assurer la qualité et la fiabilité du code.
- **Utilisation de PM2 pour la Pré-production** :
  - PM2 est utilisé pour gérer les processus Node.js dans les environnements de pré-production ou de test.
- **Gestion des Variables d'Environnement** :
  - Les variables sensibles, comme `JWT_SECRET`, sont gérées via des variables d'environnement et doivent être correctement configurées.
    
---

## Bonus
### Monitoring avancé avec Prometheus et Grafana
Objectif : Mettre en place un monitoring complet pour les trois microservices en nodeJS et la base de données MongoDB, avec Prometheus pour la collecte des métriques et Grafana pour la visualisation.

1. Ajouter les services Protheus et Grafana dans le fichier docker-compose.yml
``` javascript
  services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
    networks:
      - monitoring
```
Prometheus est désormais accessible sur : http://localhost:9090
Grafana est désormais accesible sur : http://localhost:3000

2. Configuration de prometheus pour récupérer les métriques dans le fichier prometheus.yaml
``` javascript
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: "cadvisor"
    static_configs:
      - targets: ["cadvisor:8080"]

  - job_name: "auth-service"
    static_configs:
      - targets: ["host.docker.internal:3001"]

  - job_name: "product-service"
    static_configs:
      - targets: ["host.docker.internal:3000"]

  - job_name: "order-service"
    static_configs:
      - targets: ["host.docker.internal:3002"]

  - job_name: "mongodb"
    static_configs:
      - targets: ["mongodb-exporter:9216"]
```
Prometheus récupère désormais les métriques des microservice via : /metrics.

MongoDB est monitoré depuis mongodb-exporter
 
3. Ajout de l'exportation des métriques dans chaque microservice
  
   a. Installation de prom-client et express-prom-bundle pour chaque micro service/
  
   b. Ajout de la middleware de monitoring dans app.js
  
        ``` javascript
              const metricsMiddleware = promBundle({ includeMethod: true });
               app.use(metricsMiddleware);
               
               const httpRequestCounter = new client.Counter({
                 name: "http_requests_total",
                 help: "Total HTTP requests received",
               });
               
               const responseTimeHistogram = new client.Histogram({
                 name: "http_response_time_seconds",
                 help: "Response time in seconds",
                 buckets: [0.1, 0.5, 1, 2, 5, 10],
               });
               
               app.use((req, res, next) => {
                 httpRequestCounter.inc();
                 const start = Date.now();
                 res.on("finish", () => {
                   const duration = (Date.now() - start) / 1000;
                   responseTimeHistogram.observe(duration);
                 });
                 next();
               });
               
               app.get("/metrics", async (req, res) => {
                 res.set("Content-Type", client.register.contentType);
                 res.end(await client.register.metrics());
               });
     ```
Chaque service expose désormais /metrics pour Prometheus.

On surveille les requêtes HTTP et les temps de réponse.

4. Vérification des métriques dans Prometheus
  
   a. Vérifier que tous les services ont un statut UP
     ![image](https://github.com/user-attachments/assets/5789cb5d-159e-47b8-a9eb-84f220575687)
  
   b. Tester une requete promQL ( si 1 => le service est bien surveillé et si 0 => le service n'est pas surveillé )
      ![image](https://github.com/user-attachments/assets/e5f9cddb-edcd-40d9-8f9d-ddf043d80203)

5. Configurer Grafana pour afficher les métriques

     a. Ajout de Prometheus comme source de données:
      
      ***1. Aller dans Configuration > Data Sources.
         2. Cliquer sur Add Data Source.
         3. Choisir Prometheus.
         4. Entrer l'URL : http://prometheus:9090.
         5. Cliquer sur Save & Test.***
     b. Importer les dashboards pour visualiser les métriques
  
           ***Dans Grafana > Dashboards > Import, nous avons ajouté :
           API Node.js → ID 11074.
           MongoDB → ID 2583.***
     c. Analyser les métriques dans Grafana
       Par exemple: on a testé sur le nombre total de requetes pour chaque micro service.

        Exemple du service auth-service avec la commande rate(http_requests_total{job="auth-service"}[5m]):
         ![image](https://github.com/user-attachments/assets/b643ee0d-38fd-4aac-ae1f-a93a97b16f24)

---

## Annexes

### Exemples de Commandes CURL

Pour faciliter les tests des différentes APIs de votre application, voici une série d'exemples de commandes `curl` que vous pouvez utiliser.

#### Auth Service

- **Inscription d'un Nouvel Utilisateur**

  ```bash
  curl -X POST http://localhost:3001/api/auth/register \
       -H "Content-Type: application/json" \
       -d '{"email": "user@example.com", "password": "password123"}'
  ```

```json
{"message":"Utilisateur créé avec succès","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzNiNmIyYzAyNTJmZDViZmU5OTdkYWMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzE5NDczMDgsImV4cCI6MTczMjAzMzcwOH0.Zcbj4jVTY0Ma3z-pCKl_bGiXbqT8aSFghE2MQBkCmXo","userId":"673b6b2c0252fd5bfe997dac"}
```


- **Connexion d'un Utilisateur**

  ```bash
  curl -X POST http://localhost:3001/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email": "user@example.com", "password": "password123"}'
  ```

```json
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzNiNmIyYzAyNTJmZDViZmU5OTdkYWMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzE5NDczNDYsImV4cCI6MTczMjAzMzc0Nn0.RcwtvVyp6gw15Zs8addBS25FzuqpqZmxp7OqwglFBG4","userId":"673b6b2c0252fd5bfe997dac","email":"user@example.com"}
```

- **Récupération du Profil Utilisateur**

  ```bash
  curl -X GET http://localhost:3001/api/auth/profile \
       -H "Authorization: Bearer <JWT_TOKEN>"
  ```

```json
{"_id":"673b6b2c0252fd5bfe997dac","email":"user@example.com","createdAt":"2024-11-18T16:28:28.239Z","__v":0}
```

#### Product Service

- **Récupération de la Liste des Produits**

  ```bash
  curl -X GET http://localhost:3000/api/products
  ```

```json
[{"_id":"673b6ba048c194f02ade2aac","name":"Smartphone Galaxy S21","price":899,"description":"Dernier smartphone Samsung avec appareil photo 108MP","stock":15,"createdAt":"2024-11-18T16:30:24.472Z","__v":0},{"_id":"673b6ba048c194f02ade2aae","name":"MacBook Pro M1","price":1299,"description":"Ordinateur portable Apple avec puce M1","stock":10,"createdAt":"2024-11-18T16:30:24.489Z","__v":0},{"_id":"673b6ba048c194f02ade2ab0","name":"PS5","price":499,"description":"Console de jeu dernière génération","stock":5,"createdAt":"2024-11-18T16:30:24.498Z","__v":0},{"_id":"673b6ba048c194f02ade2ab2","name":"Écouteurs AirPods Pro","price":249,"description":"Écouteurs sans fil avec réduction de bruit","stock":20,"createdAt":"2024-11-18T16:30:24.506Z","__v":0},{"_id":"673b6ba048c194f02ade2ab4","name":"Nintendo Switch","price":299,"description":"Console de jeu portable","stock":12,"createdAt":"2024-11-18T16:30:24.516Z","__v":0},{"_id":"673b6ba048c194f02ade2ab6","name":"iPad Air","price":599,"description":"Tablette Apple avec écran Retina","stock":8,"createdAt":"2024-11-18T16:30:24.526Z","__v":0},{"_id":"673b6ba048c194f02ade2ab8","name":"Montre connectée","price":199,"description":"Montre intelligente avec suivi d'activité","stock":25,"createdAt":"2024-11-18T16:30:24.535Z","__v":0},{"_id":"673b6ba048c194f02ade2aba","name":"Enceinte Bluetooth","price":79,"description":"Enceinte portable waterproof","stock":30,"createdAt":"2024-11-18T16:30:24.544Z","__v":0}]1
```

- **Ajout d'un Produit au Panier**

```bash
curl -X POST http://localhost:3000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer efrei_super_pass" \
  -d '{
    "userId": "673b6b2c0252fd5bfe997dac",
    "productId": "673b6ba048c194f02ade2aba",
    "quantity": 2
  }'  
```

```json
{"userId":"673b6b2c0252fd5bfe997dac","items":[{"productId":{"_id":"673b6ba048c194f02ade2aba","name":"Enceinte Bluetooth","price":79,"description":"Enceinte portable waterproof","stock":30,"createdAt":"2024-11-18T16:30:24.544Z","__v":0},"quantity":1,"_id":"673b6f7f48c194f02ade2ad0"}],"_id":"673b6f7f48c194f02ade2acf","updatedAt":"2024-11-18T16:46:55.284Z","__v":0}
```

#### Order Service
- **Passage d'une Commande**

```bash
curl -X POST http://localhost:3002/api/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzNiNmIyYzAyNTJmZDViZmU5OTdkYWMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzE5NDczNDYsImV4cCI6MTczMjAzMzc0Nn0.RcwtvVyp6gw15Zs8addBS25FzuqpqZmxp7OqwglFBG4" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [{
      "productId": "673b6ba048c194f02ade2aba",
      "quantity": 1
    }],
    "shippingAddress": {
      "street": "123 Test St",
      "city": "Test City",
      "postalCode": "12345"
    }'
```

```json
{"userId":"673b6b2c0252fd5bfe997dac","products":[{"productId":"673b6ba048c194f02ade2aba","name":"Enceinte Bluetooth","price":79,"quantity":1,"_id":"673b70050a40d45c0f920818"}],"totalAmount":79,"status":"pending","shippingAddress":{"street":"123 Test St","city":"Test City","postalCode":"12345"},"_id":"673b70050a40d45c0f920817","createdAt":"2024-11-18T16:49:09.281Z","__v":0}
```

- **Consultation de l'Historique des Commandes**

```bash
  curl -X GET http://localhost:3002/api/orders \
       -H "Authorization: Bearer <JWT_TOKEN>"
```

```json
[{"shippingAddress":{"street":"123 Test St","city":"Test City","postalCode":"12345"},"_id":"673b70050a40d45c0f920817","userId":"673b6b2c0252fd5bfe997dac","products":[{"productId":"673b6ba048c194f02ade2aba","name":"Enceinte Bluetooth","price":79,"quantity":1,"_id":"673b70050a40d45c0f920818"}],"totalAmount":79,"status":"pending","createdAt":"2024-11-18T16:49:09.281Z","__v":0}]
```

---

## Comment Exécuter le Projet

### Déploiement Manuel avec PM2 pour la Pré-production

1. **Prérequis** :

   - **Node.js** et **npm** installés sur votre machine.
   - **MongoDB** installé et en cours d'exécution localement.
   - **Git** pour cloner le dépôt.
   - **PM2** installé globalement.

2. **Cloner le Dépôt** :

   ```bash
   git clone https://gitlab.com/vlaine1/e-commerce-vue.git
   cd  /opt/e-commerce-vue
   ```

3. **Exécuter le Script de Déploiement** :

   ```bash
   ./scripts/deploy.sh
   ```

4. **Initialisation des Données** :

   ```bash
   ./scripts/init-products.sh
   ```

5. **Accès à l'Application** :

   - Ouvrez votre navigateur et accédez à `http://localhost:8080`.

### Déploiement avec Docker et Docker Compose

1. **Prérequis** :

   - **Docker** et **Docker Compose** installés sur votre machine.
   - **Git** pour cloner le dépôt.

2. **Cloner le Dépôt** :

   ```bash
   git clone <URL_DU_DÉPÔT>
   cd <NOM_DU_PROJET>
   ```

3. **Construire et Démarrer les Conteneurs** :

   ```bash
   docker-compose up --build
   ```

4. **Initialisation des Données** :

   ```bash
   ./scripts/init-products.sh
   ```

5. **Accès à l'Application** :

   - Ouvrez votre navigateur et accédez à `http://localhost:8080`.