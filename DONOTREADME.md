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
└── scripts/
    └── init-products.sh
```

## Étapes pour exécuter l'application

### 1. Cloner le dépôt

```sh
git clone <repository-url>
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

## Dockerfile du service produit

```dockerfile
FROM node:18-alpine

# Installer curl
RUN apk add --no-cache curl

WORKDIR /app

COPY package.json ./
RUN npm install
COPY . .

# Copier le script d'initialisation
COPY ../../scripts/init-products.sh /app/scripts/init-products.sh

EXPOSE 3000
CMD ["npm", "run", "dev"]
```

## Configuration Docker Compose

```yaml
services:
  frontend:
    build:
      context: ./frontend
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

  product-service:
    build:
      context: ./services/product-service
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

  auth-service:
    build:
      context: ./services/auth-service
    ports:
      - "3001:3001"
    volumes:
      - ./services/auth-service:/app
      - /app/node_modules
    env_file:
      - .env
    depends_on:
      - mongodb

  order-service:
    build:
      context: ./services/order-service
    ports:
      - "3002:3002"
    volumes:
      - ./services/order-service:/app
      - /app/node_modules
    env_file:
      - .env
    depends_on:
      - mongodb

  mongodb:
    image: mongo:latest
    ports:
      - "27018:27017"
    volumes:
      - ./mongo-data:/data/db
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

Ajoutez les lignes suivantes dans un fichier `.trivyignore` pour ignorer certains fichiers et dossiers :

```
*.log
*.tmp
node_modules/
build/
dist/
```

### Installation de Trivy

Pour installer Trivy, utilisez la commande suivante :

```sh
winget install AquaSecurity.Trivy
```

### Ajout d'un script de scan dans `package.json`

Ajoutez le script suivant dans la section `"scripts"` de votre fichier `package.json` :

```json
"scripts": {
  "scan": "trivy fs ."
}
```

### Exécution du scan

Pour exécuter le scan, utilisez la commande suivante :

```sh
npm run scan
```

### Résultat obtenu

Les résultats du scan seront affichés dans le terminal après l'exécution de la commande.

-- auth-service

trivy image e-commerce-vue-auth-service

e-commerce-vue-auth-service (alpine 3.21.3)
===========================================
Total: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0)

2025-02-28T23:15:55+01:00       INFO    Table result includes only package filenames. Use '--format json' option to get the full path to the package file.

Node.js (node-pkg)
==================
Total: 1 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 1, CRITICAL: 0)

┌────────────────────────────┬────────────────┬──────────┬────────┬───────────────────┬───────────────┬───────────────────────────────────────────────────┐
│          Library           │ Vulnerability  │ Severity │ Status │ Installed Version │ Fixed Version │                       Title                       │
├────────────────────────────┼────────────────┼──────────┼────────┼───────────────────┼───────────────┼───────────────────────────────────────────────────┤
│ cross-spawn (package.json) │ CVE-2024-21538 │ HIGH     │ fixed  │ 7.0.3             │ 7.0.5, 6.0.6  │ cross-spawn: regular expression denial of service │
│                            │                │          │        │                   │               │ https://avd.aquasec.com/nvd/cve-2024-21538        │
└────────────────────────────┴────────────────┴──────────┴────────┴───────────────────┴───────────────┴───────────────────────────────────────────────────┘


-- order-service

e-commerce-vue-order-service (alpine 3.21.3)
============================================
Total: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0)

2025-02-28T23:21:52+01:00       INFO    Table result includes only package filenames. Use '--format json' option to get the full path to the package file.

Node.js (node-pkg)
==================
Total: 1 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 1, CRITICAL: 0)

┌────────────────────────────┬────────────────┬──────────┬────────┬───────────────────┬───────────────┬───────────────────────────────────────────────────┐
│          Library           │ Vulnerability  │ Severity │ Status │ Installed Version │ Fixed Version │           
            Title                       │
├────────────────────────────┼────────────────┼──────────┼────────┼───────────────────┼───────────────┼───────────────────────────────────────────────────┤
│ cross-spawn (package.json) │ CVE-2024-21538 │ HIGH     │ fixed  │ 7.0.3             │ 7.0.5, 6.0.6  │ cross-spawn: regular expression denial of service │
│                            │                │          │        │                   │               │ https://avd.aquasec.com/nvd/cve-2024-21538        │
└────────────────────────────┴────────────────┴──────────┴────────┴───────────────────┴───────────────┴───────────────────────────────────────────────────┘


-- product-service


e-commerce-vue-product-service (alpine 3.21.3)
==============================================
Total: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0)

2025-02-28T23:23:46+01:00       INFO    Table result includes only package filenames. Use '--format json' option to get the full path to the package file.

Node.js (node-pkg)
==================
Total: 1 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 1, CRITICAL: 0)

┌────────────────────────────┬────────────────┬──────────┬────────┬───────────────────┬───────────────┬───────────────────────────────────────────────────┐
│          Library           │ Vulnerability  │ Severity │ Status │ Installed Version │ Fixed Version │           
            Title                       │
├────────────────────────────┼────────────────┼──────────┼────────┼───────────────────┼───────────────┼───────────────────────────────────────────────────┤
│ cross-spawn (package.json) │ CVE-2024-21538 │ HIGH     │ fixed  │ 7.0.3             │ 7.0.5, 6.0.6  │ cross-spawn: regular expression denial of service │
│                            │                │          │        │                   │               │ https://avd.aquasec.com/nvd/cve-2024-21538        │
└────────────────────────────┴────────────────┴──────────┴────────┴───────────────────┴───────────────┴───────────────────────────────────────────────────┘


**Résultats des vulnérabilités** :
  une vulnérabilité de haute sévérité a été trouvée dans la bibliothèque `cross-spawn` :
        - **Vulnérabilité** : CVE-2024-21538
        - **Sévérité** : Haute (HIGH)
        - **Version installée** : 7.0.3
        - **Versions corrigées** : 7.0.5, 6.0.6
        - **Description** : Cette vulnérabilité est une attaque par déni de service via une expression régulière.

**Fix** : Pour fix cette vulnérabilité il faut mettre a jour le paquet cross-spawn a une version plus récente.


-- frontend

e-commerce-vue-frontend (alpine 3.21.3)
=======================================
Total: 0 (UNKNOWN: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0)

2025-02-28T23:27:14+01:00       INFO    Table result includes only package filenames. Use '--format json' option to get the full path to the package file.

Node.js (node-pkg)
==================
Total: 2 (UNKNOWN: 0, LOW: 0, MEDIUM: 1, HIGH: 1, CRITICAL: 0)

┌────────────────────────────┬─────────────────────┬──────────┬────────┬───────────────────┬───────────────┬─────────────────────────────────────────────────────────┐
│          Library           │    Vulnerability    │ Severity │ Status │ Installed Version │ Fixed Version │                          Title                          │
├────────────────────────────┼─────────────────────┼──────────┼────────┼───────────────────┼───────────────┼─────────────────────────────────────────────────────────┤
│ cross-spawn (package.json) │ CVE-2024-21538      │ HIGH     │ fixed  │ 7.0.3             │ 7.0.5, 6.0.6  │ cross-spawn: regular expression denial of service       │
│                            │                     │          │        │                   │               │ https://avd.aquasec.com/nvd/cve-2024-21538              │
├────────────────────────────┼─────────────────────┼──────────┤        ├───────────────────┼───────────────┼─────────────────────────────────────────────────────────┤
│ esbuild (package.json)     │ GHSA-67mh-4wv8-2f99 │ MEDIUM   │        │ 0.21.5            │ 0.25.0        │ esbuild enables any website to send any requests to the │
│                            │                     │          │        │                   │               │ development server...                                   │
│                            │                     │          │        │                   │               │ https://github.com/advisories/GHSA-67mh-4wv8-2f99       │
└────────────────────────────┴─────────────────────┴──────────┴────────┴───────────────────┴───────────────┴─────────────────────────────────────────────────────────┘

app/node_modules/@esbuild/linux-x64/bin/esbuild (gobinary)
==========================================================
Total: 15 (UNKNOWN: 0, LOW: 0, MEDIUM: 12, HIGH: 2, CRITICAL: 1)

┌─────────┬────────────────┬──────────┬────────┬───────────────────┬──────────────────────────────┬──────────────────────────────────────────────────────────────┐
│ Library │ Vulnerability  │ Severity │ Status │ Installed Version │        Fixed Version         │               
             Title                             │
├─────────┼────────────────┼──────────┼────────┼───────────────────┼──────────────────────────────┼──────────────────────────────────────────────────────────────┤
│ stdlib  │ CVE-2024-24790 │ CRITICAL │ fixed  │ v1.20.12          │ 1.21.11, 1.22.4              │ golang: net/netip: Unexpected behavior from Is methods for   │
│         │                │          │        │                   │                              │ IPv4-mapped IPv6 addresses                                   │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2024-24790                   │
│         ├────────────────┼──────────┤        │                   ├──────────────────────────────┼──────────────────────────────────────────────────────────────┤
│         │ CVE-2023-45288 │ HIGH     │        │                   │ 1.21.9, 1.22.2               │ golang: net/http, x/net/http2: unlimited number of           │
│         │                │          │        │                   │                              │ CONTINUATION frames causes DoS                               │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2023-45288                   │
│         ├────────────────┤          │        │                   ├──────────────────────────────┼──────────────────────────────────────────────────────────────┤
│         │ CVE-2024-34156 │          │        │                   │ 1.22.7, 1.23.1               │ encoding/gob: golang: Calling Decoder.Decode on a message    │
│         │                │          │        │                   │                              │ which contains deeply nested structures...                   │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2024-34156                   │
│         ├────────────────┼──────────┤        │                   ├──────────────────────────────┼──────────────────────────────────────────────────────────────┤
│         │ CVE-2023-45289 │ MEDIUM   │        │                   │ 1.21.8, 1.22.1               │ golang: net/http/cookiejar: incorrect forwarding of          │
│         │                │          │        │                   │                              │ sensitive headers and cookies on HTTP redirect...            │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2023-45289                   │
│         ├────────────────┤          │        │                   │                              ├──────────────────────────────────────────────────────────────┤
│         │ CVE-2023-45290 │          │        │                   │                              │ golang: net/http: golang: mime/multipart: golang:            │
│         │                │          │        │                   │                              │ net/textproto: memory exhaustion in                          │
│         │                │          │        │                   │                              │ Request.ParseMultipartForm                                   │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2023-45290                   │
│         ├────────────────┤          │        │                   │                              ├──────────────────────────────────────────────────────────────┤
│         │ CVE-2024-24783 │          │        │                   │                              │ golang: crypto/x509: Verify panics on certificates with an   │
│         │                │          │        │                   │                              │ unknown public key algorithm...                              │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2024-24783                   │
│         ├────────────────┤          │        │                   │                              ├──────────────────────────────────────────────────────────────┤
│         │ CVE-2024-24784 │          │        │                   │                              │ golang: net/mail: comments in display names are incorrectly  │
│         │                │          │        │                   │                              │ handled                                                      │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2024-24784                   │
│         ├────────────────┤          │        │                   │                              ├──────────────────────────────────────────────────────────────┤
│         │ CVE-2024-24785 │          │        │                   │                              │ golang: html/template: errors returned from MarshalJSON      │
│         │                │          │        │                   │                              │ methods may break template escaping                          │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2024-24785                   │
│         ├────────────────┤          │        │                   ├──────────────────────────────┼──────────────────────────────────────────────────────────────┤
│         │ CVE-2024-24789 │          │        │                   │ 1.21.11, 1.22.4              │ golang: archive/zip: Incorrect handling of certain ZIP files │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2024-24789                   │
│         ├────────────────┤          │        │                   ├──────────────────────────────┼──────────────────────────────────────────────────────────────┤
│         │ CVE-2024-24791 │          │        │                   │ 1.21.12, 1.22.5              │ net/http: Denial of service due to improper 100-continue     │
│         │                │          │        │                   │                              │ handling in net/http                                         │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2024-24791                   │
│         ├────────────────┤          │        │                   ├──────────────────────────────┼──────────────────────────────────────────────────────────────┤
│         │ CVE-2024-34155 │          │        │                   │ 1.22.7, 1.23.1               │ go/parser: golang: Calling any of the Parse functions        │
│         │                │          │        │                   │                              │ containing deeply nested literals...                         │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2024-34155                   │
│         ├────────────────┤          │        │                   │                              ├──────────────────────────────────────────────────────────────┤
│         │ CVE-2024-34158 │          │        │                   │                              │ go/build/constraint: golang: Calling Parse on a "// +build"  │
│         │                │          │        │                   │                              │ build tag line with...                                       │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2024-34158                   │
│         ├────────────────┤          │        │                   ├──────────────────────────────┼──────────────────────────────────────────────────────────────┤
│         │ CVE-2024-45336 │          │        │                   │ 1.22.11, 1.23.5, 1.24.0-rc.2 │ golang: net/http: net/http: sensitive headers incorrectly    │
│         │                │          │        │                   │                              │ sent after cross-domain redirect                             │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2024-45336                   │
│         ├────────────────┤          │        │                   │                              ├──────────────────────────────────────────────────────────────┤
│         │ CVE-2024-45341 │          │        │                   │                              │ golang: crypto/x509: crypto/x509: usage of IPv6 zone IDs can │
│         │                │          │        │                   │                              │ bypass URI name...                                           │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2024-45341                   │
│         ├────────────────┤          │        │                   ├──────────────────────────────┼──────────────────────────────────────────────────────────────┤
│         │ CVE-2025-22866 │          │        │                   │ 1.22.12, 1.23.6, 1.24.0-rc.3 │ crypto/internal/nistec: golang: Timing sidechannel for P-256 │
│         │                │          │        │                   │                              │ on ppc64le in crypto/internal/nistec                         │
│         │                │          │        │                   │                              │ https://avd.aquasec.com/nvd/cve-2025-22866                   │
└─────────┴────────────────┴──────────┴────────┴───────────────────┴──────────────────────────────┴──────────────────────────────────────────────────────────────┘


**Fix** : Pour fix ces vulnérabilités il faut mettre a jour les paquets a des versions plus récente.


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
npm run test:unit
npm run test:coverage
```

### 4. Commandes de test dans package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:coverage": "vitest run --coverage",
  }
}
```

### 5. Exécution des tests

Dans le terminal :

```sh
cd frontend
npm run test
npm run test:unit
npm run test:coverage
npm run lint:report || true
```

## Conclusion des test Frontend

## Résultats des Tests

### Nombre total de fichiers de test
- 5 fichiers de test ont été exécutés.

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

### Tests de couverture

#### Couverture globale
- **% Stmts** : 49.13% des instructions sont couvertes par les tests.
- **% Branch** : 51.16% des branches conditionnelles sont couvertes.
- **% Funcs** : 28.57% des fonctions sont couvertes.
- **% Lines** : 49.13% des lignes de code sont couvertes.

#### Détails par fichier

**App.vue :**
- 81.29% des instructions
- 63.15% des branches
- 50% des fonctions
- 81.29% des lignes

**ProductList.vue :**
- 99.08% des instructions
- 66.66% des branches
- 100% des fonctions
- 99.08% des lignes

**ShoppingCart.vue :**
- 69.85% des instructions
- 50% des branches
- 30% des fonctions
- 69.85% des lignes

**AuthTest.vue :**
- 62.02% des instructions
- 100% des branches
- 0% des fonctions
- 62.02% des lignes

**OrderHistory.vue :**
- 0% des instructions
- 0% des branches
- 0% des fonctions
- 0% des lignes

#### Services

**authService.js :**
- 0% des instructions
- 0% des branches
- 0% des fonctions
- 0% des lignes

**cartService.js :**
- 26.66% des instructions
- 100% des branches
- 0% des fonctions
- 26.66% des lignes

**orderService.js :**
- 0% des instructions
- 0% des branches
- 0% des fonctions
- 0% des lignes

**productService.js :**
- 47.05% des instructions
- 100% des branches
- 0% des fonctions
- 47.05% des lignes


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
                                                                          
-------------|---------|----------|---------|---------|-------------------
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
-------------|---------|----------|---------|---------|-------------------Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        4.257 s
Tout les tests ont été exécuté sans probleme particulier

### order-service

 PASS  tests/order.test.js
  Order Endpoints
    POST /api/orders
      √ should create a new order (146 ms)
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

-------------|---------|----------|---------|---------|-------------------
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
-------------|---------|----------|---------|---------|-------------------
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
                                                                          
-------------|---------|----------|---------|---------|-------------------
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
-------------|---------|----------|---------|---------|-------------------Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        3.066 s, estimated 27 s

Tout les tests ont été exécuté sans probleme particulier