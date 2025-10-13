FROM node:23.4.0-alpine3.20

WORKDIR /app

RUN npm install -g pnpm

COPY package*.json ./

RUN pnpm install

COPY . .