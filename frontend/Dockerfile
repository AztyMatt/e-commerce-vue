FROM node:18-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .
# COPY ../scripts/init-products.sh /app/scripts/init-products.sh

EXPOSE 8080

CMD ["npm", "run", "dev"]
# CMD ["sh", "-c", "sh /app/scripts/init-products.sh && npm run dev"]
