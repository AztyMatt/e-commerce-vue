# DONOTREADME.md

## Projet e-commerce-vue-docker

## Aperçu

Ce projet comprend trois services (auth, commande, produit), une base de données MongoDB et une application frontend. Chaque service possède son propre Dockerfile, et l'ensemble de l'application est orchestré avec Docker Compose.

## Prérequis

- Docker
- Docker Compose

## Structure du projet

```
e-commerce-vue/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── services/
│   ├── auth-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── ...
│   ├── order-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── ...
│   └── product-service/
│       ├── Dockerfile
│       ├── package.json
│       ├── scripts/
│       │   └── init-products.sh
│       └── ...
│       └── ...
└── scripts/
│   └── init-products.sh
└── Dockerfile.common
└── docker-compose.yaml
```

## Étapes pour exécuter l'application

### 1. Cloner le dépôt

```sh
git clone https://github.com/AztyMatt/e-commerce-vue.git
cd e-commerce-vue
```

### 2. Vérifier l'installation de Docker et Docker Compose

```sh
docker --version
docker-compose --version
```

### 3. Construire et démarrer les conteneurs

```sh
docker-compose up --build
```

Cette commande :
- Construit les images Docker pour chaque service et le frontend.
- Démarre le conteneur MongoDB.
- Démarre les conteneurs auth-service, order-service, product-service et frontend.

### 4. Vérifier les services

```sh
docker-compose logs auth-service
docker-compose logs order-service
docker-compose logs product-service
docker-compose logs frontend
```

### 5. Initialiser le service produit

```sh
docker-compose exec product-service sh
cd /app/scripts
chmod +x init-products.sh
sh ./init-products.sh
```

### 6. Accéder à l'application

- **Frontend** : [http://localhost:8080](http://localhost:8080)
- **Auth Service** : [http://localhost:3001](http://localhost:3001)
- **Order Service** : [http://localhost:3002](http://localhost:3002)
- **Product Service** : [http://localhost:3000](http://localhost:3000)

### 7. Vérifier l'initialisation des produits

```sh
curl http://localhost:3000/api/products
```

Vous devriez voir une liste de produits dans la réponse.

---

## Dockerfile 

```dockerfile
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json ./

RUN if [ "$NODE_ENV" = "prod" ]; then \
        npm ci --only=production && npm cache clean --force; \
    else \
        npm install && npm cache clean --force; \
    fi

COPY . .

RUN if [ "$NODE_ENV" = "prod" ] && npm run | grep -q "^  build$"; then \
        npm run build; \
    else \
        echo "Build not necessary or development mode"; \
    fi

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/package-lock.json /app/package-lock.json
COPY --from=build /app/node_modules /app/node_modules
#! in prod, only /app/dist needs to be copied (if it exists) !

ARG PORT=3001
EXPOSE $PORT

CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm run start; else npm run dev; fi"]

```

## Configuration Docker Compose

```yaml
services:
  prometheus:
    image: prom/prometheus
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yaml:/etc/prometheus/prometheus.yaml
    command:
      - "--config.file=/etc/prometheus/prometheus.yaml"
    depends_on:
      - cadvisor

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.2
    container_name: cadvisor
    restart: unless-stopped
    ports:
      - "8085:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "/sys:/sys:ro"
      - "/var/lib/docker/:/var/lib/docker:ro"

  grafana:
    image: grafana/grafana
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3100:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin 
      - GF_SECURITY_ADMIN_PASSWORD=admin 
    depends_on:
      - prometheus

  frontend:
    build:
      context: ./frontend
      dockerfile: ../Dockerfile.common
    ports:
      - "8080:8080"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  product-service:
    build:
      context: ./services/product-service
      dockerfile: ../../Dockerfile.common
    ports:
      - "3000:3000"
    volumes:
      - ./services/product-service:/app
      - /app/node_modules
    env_file:
      - .env
    depends_on:
      - mongodb
    entrypoint: /bin/sh -c "sh /app/scripts/init-products.sh && npm run dev"
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  auth-service:
    build:
      context: ./services/auth-service
      dockerfile: ../../Dockerfile.common
    ports:
      - "3001:3001"
    volumes:
      - ./services/auth-service:/app
      - /app/node_modules
    env_file:
      - .env
    depends_on:
      - mongodb
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  order-service:
    build:
      context: ./services/order-service
      dockerfile: ../../Dockerfile.common
    ports:
      - "3002:3002"
    volumes:
      - ./services/order-service:/app
      - /app/node_modules
    env_file:
      - .env
    depends_on:
      - mongodb
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  mongodb:
    image: mongo:latest
    ports:
      - "27018:27017"
    volumes:
      - ./mongo-data:/data/db
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  mongodb-exporter:
    image: bitnami/mongodb-exporter:latest
    container_name: mongodb-exporter
    ports:
      - "9216:9216"
    environment:
      - MONGODB_URI=mongodb://admin:password@mongodb:27017
    depends_on:
      - mongodb
    restart: unless-stopped

volumes:
  grafana-data:

```

---

## Script d'initialisation du service produit

```sh
#!/bin/bash

# Attendre que le service produit soit disponible
echo "Attente du service produit..."
sleep 10

# URL du service
API_URL="http://localhost:3000/api"

# Token d'authentification (à adapter selon votre configuration)
TOKEN="efrei_super_pass"

# Fonction pour créer un produit
create_product() {
    local name=$1
    local price=$2
    local description=$3
    local stock=$4

    curl -X POST "${API_URL}/products" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d "{
            \"name\": \"${name}\",
            \"price\": ${price},
            \"description\": \"${description}\",
            \"stock\": ${stock}
        }"
    echo
}

echo "Création des produits..."

# Création de plusieurs produits
create_product "Smartphone Galaxy S21" 899 "Dernier smartphone Samsung avec appareil photo 108MP" 15
create_product "MacBook Pro M1" 1299 "Ordinateur portable Apple avec puce M1" 10
create_product "PS5" 499 "Console de jeu dernière génération" 5
create_product "Écouteurs AirPods Pro" 249 "Écouteurs sans fil avec réduction de bruit" 20
create_product "Nintendo Switch" 299 "Console de jeu portable" 12
create_product "iPad Air" 599 "Tablette Apple avec écran Retina" 8
create_product "Montre connectée" 199 "Montre intelligente avec suivi d'activité" 25
create_product "Enceinte Bluetooth" 79 "Enceinte portable waterproof" 30

echo "Initialisation des produits terminée !"
```

## Test de Sécurité

## Utilisation de Trivy pour effectuer des scans du code et des conteneurs

### Création d'un fichier `.trivyignore`

fichier `.trivyignore` :

```
*.log
*.tmp
node_modules/
build/
dist/
```

### Installation de Trivy

installation de Trivy :

```sh
winget install AquaSecurity.Trivy
```

### Ajout d'un script de scan dans `package.json`

Ajout du script dans `package.json > scripts` :

```json
"scripts": {
  "scan": "trivy fs ."
}
```

### Exécution du scan

Exécution du scan :

```sh
npm run scan
```

---

### Résultat obtenu


- auth-service

```
trivy image e-commerce-vue-auth-service
```

### e-commerce-vue-auth-service (alpine 3.21.3)
===========================================
Total: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0)

2025-02-28T23:15:55+01:00       INFO    Table result includes only package filenames. Use '--format json' option to get the full path to the package file.

### Node.js (node-pkg)
==================
Total: 1 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 1, CRITICAL: 0)

| Library             | Vulnerability        | Severity | Status | Installed Version | Fixed Version | Title                                                                 |
|---------------------|----------------------|----------|--------|-------------------|---------------|-----------------------------------------------------------------------|
| cross-spawn         | CVE-2024-21538       | HIGH     | fixed  | 7.0.3             | 7.0.5, 6.0.6  | cross-spawn: regular expression denial of service [More Info](https://avd.aquasec.com/nvd/cve-2024-21538)               |

---

- order-service

```
trivy image e-commerce-vue-order-service
```

### e-commerce-vue-order-service (alpine 3.21.3)
============================================
Total: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0)

2025-02-28T23:21:52+01:00       INFO    Table result includes only package filenames. Use '--format json' option to get the full path to the package file.

### Node.js (node-pkg)
==================
Total: 1 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 1, CRITICAL: 0)


| Library             | Vulnerability        | Severity | Status | Installed Version | Fixed Version | Title                                                                 |
|---------------------|----------------------|----------|--------|-------------------|---------------|-----------------------------------------------------------------------|
| cross-spawn         | CVE-2024-21538       | HIGH     | fixed  | 7.0.3             | 7.0.5, 6.0.6  | cross-spawn: regular expression denial of service [More Info](https://avd.aquasec.com/nvd/cve-2024-21538)               |


---

- product-service


```
trivy image e-commerce-vue-product-service
```

### e-commerce-vue-product-service (alpine 3.21.3)
==============================================
Total: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0)

2025-02-28T23:23:46+01:00       INFO    Table result includes only package filenames. Use '--format json' option to get the full path to the package file.

### Node.js (node-pkg)
==================
Total: 1 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 1, CRITICAL: 0)


| Library             | Vulnerability        | Severity | Status | Installed Version | Fixed Version | Title                                                                 |
|---------------------|----------------------|----------|--------|-------------------|---------------|-----------------------------------------------------------------------|
| cross-spawn         | CVE-2024-21538       | HIGH     | fixed  | 7.0.3             | 7.0.5, 6.0.6  | cross-spawn: regular expression denial of service [More Info](https://avd.aquasec.com/nvd/cve-2024-21538)               |



**Résultats des vulnérabilités** :
  une vulnérabilité de haute sévérité a été trouvée dans la bibliothèque `cross-spawn` :
        - **Vulnérabilité** : CVE-2024-21538
        - **Sévérité** : Haute (HIGH)
        - **Version installée** : 7.0.3
        - **Versions corrigées** : 7.0.5, 6.0.6
        - **Description** : Cette vulnérabilité est une attaque par déni de service via une expression régulière.

**Fix** : Pour fix cette vulnérabilité il faut mettre a jour le paquet cross-spawn a une version plus récente.

---

- frontend

```
trivy image e-commerce-vue-frontend
```

### e-commerce-vue-frontend (alpine 3.21.3)
=======================================
Total: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0)

2025-02-28T23:27:14+01:00       INFO    Table result includes only package filenames. Use '--format json' option to get the full path to the package file.

### Node.js (node-pkg)
==================
Total: 2 (UNKNOWN: 0, LOW: 0, MEDIUM: 1, HIGH: 1, CRITICAL: 0)


| Library             | Vulnerability        | Severity | Status | Installed Version | Fixed Version | Title                                                                 |
|---------------------|----------------------|----------|--------|-------------------|---------------|-----------------------------------------------------------------------|
| cross-spawn         | CVE-2024-21538       | HIGH     | fixed  | 7.0.3             | 7.0.5, 6.0.6  | cross-spawn: regular expression denial of service [More Info](https://avd.aquasec.com/nvd/cve-2024-21538)               |
| esbuild             | GHSA-67mh-4wv8-2f99  | MEDIUM   |        | 0.21.5            | 0.25.0        | esbuild enables any website to send any requests to the development server... [More Info](https://github.com/advisories/GHSA-67mh-4wv8-2f99) |


### app/node_modules/@esbuild/linux-x64/bin/esbuild (gobinary)
==========================================================
Total: 1 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 1, CRITICAL: 0)


### Vulnerability Details

| Library | Vulnerability  | Severity | Status | Installed Version | Fixed Version | Title |
|---------|----------------|----------|--------|-------------------|---------------|-------|
| stdlib  | CVE-2024-24790 | CRITICAL | fixed  | v1.20.12          | 1.21.11, 1.22.4 | golang: net/netip: Unexpected behavior from Is methods for IPv4-mapped IPv6 addresses [More Info](https://avd.aquasec.com/nvd/cve-2024-24790) |



**Fix** : Pour fix ces vulnérabilités il faut mettre a jour les paquets a des versions plus récente.

---

## Test Frontend

### 1. Configuration de Vitest

configuration de vitest.config.js :

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    reporters: ['verbose', 'junit'],
    outputFile: {
      junit: './test-results/junit.xml'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'cobertura'],
      reportsDirectory: './coverage'
    }
  }
})
```

### 2. Structure des tests

Les tests sont localisés dans le dossier tests. Voici un exemple de test unitaire pour le composant `ProductList` :

```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductList from '../../src/components/ProductList.vue'

describe('ProductList', () => {
  const mockProducts = [
    { id: 1, name: 'Produit 1', price: 99.99, description: 'Description 1' },
    { id: 2, name: 'Produit 2', price: 149.99, description: 'Description 2' }
  ]

  it('affiche correctement la liste des produits', () => {
    const wrapper = mount(ProductList, {
      props: {
        products: mockProducts
      }
    })
    expect(wrapper.findAll('.product-card')).toHaveLength(2)
  })

  it('émet un événement add-to-cart lors du clic sur le bouton ajouter', async () => {
    const wrapper = mount(ProductList, {
      props: {
        products: mockProducts
      }
    })
    
    await wrapper.find('.add-to-cart').trigger('click')
    expect(wrapper.emitted('add-to-cart')).toBeTruthy()
  })
})
```

### 3. Exécution des tests

Pour exécuter les tests :

```sh
cd frontend
npm run test
```

### 4. Commandes de test dans package.json

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

### 5. Exécution des tests

Dans le terminal :

```sh
cd frontend
npm run test
```

---

# Résultats des Tests

### Nombre total de fichiers de test
- 4 fichiers de test ont été exécutés.

### Nombre total de tests
- 14 tests ont été exécutés.
- Tous les tests ont réussi : 14 tests réussis sur 14.

### Détails des tests

#### Tests des composants

**ShoppingCart :**
- **affiche un panier vide par défaut** : Le test vérifie que le panier est vide par défaut.
- **calcule correctement le total du panier** : Le test vérifie que le total du panier est calculé correctement.
- **émet un événement remove-from-cart lors du clic sur le bouton supprimer** : Le test vérifie que l'événement remove-from-cart est émis lors du clic sur le bouton supprimer.

**ProductList :**
- **affiche correctement la liste des produits** : Le test vérifie que la liste des produits est affichée correctement.
- **émet un événement add-to-cart lors du clic sur le bouton ajouter** : Le test vérifie que l'événement add-to-cart est émis lors du clic sur le bouton ajouter.
- **affiche correctement les prix des produits** : Le test vérifie que les prix des produits sont affichés correctement.

**App :**
- **initialise correctement l'état du panier** : Le test vérifie que l'état du panier est initialisé correctement.
- **met à jour correctement le panier lors de l'ajout d'un produit** : Le test vérifie que le panier est mis à jour correctement lors de l'ajout d'un produit.
- **supprime correctement un produit du panier** : Le test vérifie que le produit est supprimé correctement du panier.



## Test Backend

### auth-service 


 PASS  tests/auth.test.js
  Endpoints d'authentification
    POST /api/auth/register                                               
      √ devrait créer un nouvel utilisateur (255 ms)                      
      √ ne devrait pas créer un utilisateur en double (129 ms)            
      √ ne devrait pas créer un utilisateur avec un email invalide (17 ms)
    POST /api/auth/login                                                  
      √ devrait se connecter avec des identifiants valides (216 ms)       
      √ ne devrait pas se connecter avec un mauvais mot de passe (209 ms) 
      √ ne devrait pas se connecter avec un email inexistant (126 ms)     
    GET /api/auth/profile                                                 
      √ devrait obtenir le profil utilisateur avec un token valide (126 ms)                                                                         
      √ ne devrait pas obtenir le profil sans token (135 ms)
      √ ne devrait pas obtenir le profil avec un token invalide (141 ms)  
      √ ne devrait pas obtenir le profil avec un token malformé (139 ms)  


File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------|---------|----------|---------|---------|-------------------
All files    |   66.96 |       64 |    37.5 |   67.56 |                   
 src         |   52.17 |       40 |       0 |   52.17 |                   
  app.js     |   52.17 |       40 |       0 |   52.17 | ...36,39,42,45-46 
 src/config  |      10 |        0 |       0 |      10 |                   
  ...base.js |      10 |        0 |       0 |      10 | 4-17              
 ...trollers |   70.58 |       75 |      50 |   70.58 |                   
  ...ller.js |   70.58 |       75 |      50 |   70.58 | ...17-120,126-127 
 ...ddleware |     100 |      100 |     100 |     100 |                   
  auth.js    |     100 |      100 |     100 |     100 |                   
 src/models  |   85.71 |       50 |     100 |     100 |                   
  user.js    |   85.71 |       50 |     100 |     100 | 29                
 src/routes  |   83.33 |      100 |       0 |   83.33 |                   
  ...utes.js |   83.33 |      100 |       0 |   83.33 | 9                 

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        4.257 s
Tout les tests ont été exécuté sans probleme particulier

### order-service

 PASS  tests/order.test.js
  Order Endpoints
    POST /api/orders
      √ Devrait crée une nouvelle commande (146 ms) 
      √ Ne devrait pas créer de commande sans produits (22 ms)
      √ Ne devrait pas créer de commande avec un produit inexistant (19 ms)
    GET /api/orders/:id
      √ Devrait obtenir une commande par id (42 ms)
      √ Devrait retourner 403 si l'utilisateur n'est pas le propriétaire de la commande (40 ms)
    PATCH /api/orders/:id/status
      √ Devrait mettre à jour le statut de la commande (42 ms)
      √ Ne devrait pas mettre à jour le statut de la commande avec un statut invalide (25 ms)
    DELETE /api/orders/:id
      √ Devrait annuler une commande (37 ms)
      √ Ne devrait pas annuler une commande déjà livrée (36 ms)


File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------|---------|----------|---------|---------|-------------------
All files    |   71.18 |    62.74 |      60 |   71.18 |                   
 src         |   69.23 |    66.66 |       0 |   69.23 |                   
  app.js     |   69.23 |    66.66 |       0 |   69.23 | 14,26,30-31       
 src/config  |      10 |        0 |       0 |      10 |                   
  ...base.js |      10 |        0 |       0 |      10 | 4-16              
 ...trollers |   77.02 |    72.72 |   83.33 |   77.02 |                   
  ...ller.js |   77.02 |    72.72 |   83.33 |   77.02 | ...37,141,164,170 
 ...ddleware |   69.23 |    66.66 |     100 |   69.23 |                   
  auth.js    |   69.23 |    66.66 |     100 |   69.23 | 7,12,19-20        
 src/models  |     100 |      100 |     100 |     100 |                   
  order.js   |     100 |      100 |     100 |     100 |                   
 src/routes  |     100 |      100 |     100 |     100 |                   
  ...utes.js |     100 |      100 |     100 |     100 |                   

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        2.763 s, estimated 3 s
Tout les tests ont été exécuté sans probleme particulier


### product-service

 PASS  tests/product.test.js
  API Produit
    POST /api/products                                                    
      √ devrait créer un nouveau produit (127 ms)                         
    GET /api/products                                                     
      √ devrait retourner tous les produits (50 ms)                       
    GET /api/products/:id                                                 
      √ devrait retourner un produit par id (42 ms)                       

File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------|---------|----------|---------|---------|-------------------
All files    |   39.21 |    20.83 |   23.07 |   39.21 |                   
 src         |   73.33 |    66.66 |       0 |   73.33 |                   
  app.js     |   73.33 |    66.66 |       0 |   73.33 | 17,30,34-35       
 src/config  |   11.11 |        0 |       0 |   11.11 |                   
  ...base.js |   11.11 |        0 |       0 |   11.11 | 5-17              
 ...trollers |      50 |    16.66 |      60 |      50 |                   
  ...ller.js |      50 |    16.66 |      60 |      50 | ...36,41-52,57-64 
 src/models  |     100 |      100 |     100 |     100 |                   
  cart.js    |     100 |      100 |     100 |     100 |                   
  product.js |     100 |      100 |     100 |     100 |                   
 src/routes  |   22.72 |        0 |       0 |   22.72 |                   
  ...utes.js |   10.52 |        0 |       0 |   10.52 | 9-20,26-49,55-73  
  ...utes.js |     100 |      100 |     100 |     100 |                   

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        3.066 s, estimated 27 s

Tout les tests ont été exécuté sans probleme particulier.

---

## Application des bonnes pratiques

### Optimisation des images docker
La réduction des images docker s'est faite avec l'utilisation du multi staging. L'idée principale est de séparer les étapes de build et de serving pour ne conserver que les fichiers finaux nécessaires, réduisant ainsi la taille de l'image.


``
npm cache clean --force
``

 L'utilisation de cette commande qui réduit la taille de l'image Docker en supprimant les fichiers temporaires inutiles après l’installation des dépendances.

### Séparation des fichiers copiés dans la phase finale:

En copiant séparément package.json et package-lock.json, Docker réutilise plus efficacement les couches (layers), ce qui accélère les builds suivants.
Si seul le code change (pas package.json), les dépendances ne sont pas réinstallées inutilement.

Avant :
dockerfile
```
COPY --from=build /app /app
```

Après :
dockerfile
```
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/package-lock.json /app/package-lock.json
COPY --from=build /app/node_modules /app/node_modules
```


### Ajout de la politique restart: unless stopped
Assure que les services redémarrent automatiquement en cas d’échec ou de redémarrage du serveur.


```
 product-service:
    build:
      context: ./services/product-service
      dockerfile: ../../Dockerfile.common
    ports:
      - "3000:3000"
    volumes:
      - ./services/product-service:/app
      - /app/node_modules
    env_file:
      - .env
    depends_on:
      - mongodb
    entrypoint: /bin/sh -c "sh /app/scripts/init-products.sh && npm run dev"
    restart: unless-stopped

```


### Logs et monitoring
Limite la taille des logs (10MB par fichier, maximum 3 fichiers), pour éviter que les logs ne remplissent le disque.

```
 logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```


### Monitoring avancé avec Prometheus et Grafana
Objectif : Mettre en place un monitoring complet pour les trois microservices en nodeJS et la base de données MongoDB, avec Prometheus pour la collecte des métriques et Grafana pour la visualisation.

1. Ajouter les services Protheus et Grafana dans le fichier docker-compose.yml

   
``` 
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

``` 
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

   
```
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
      
        1. Aller dans Configuration > Data Sources.

         2. Cliquer sur Add Data Source.


         3. Choisir Prometheus.

   
         4. Entrer l'URL : http://prometheus:9090.

   
         5. Cliquer sur Save & Test.***

   
     b. Importer les dashboards pour visualiser les métriques
  
          Dans Grafana > Dashboards > Import
   nous avons ajouté :
           API Node.js → ID 11074.
           MongoDB → ID 2583.



     c. Analyser les métriques dans Grafana
     







