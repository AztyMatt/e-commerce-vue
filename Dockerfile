FROM node:18-alpine AS build

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app /app

ARG PORT=3001
EXPOSE $PORT

CMD ["npm", "run", "dev"]