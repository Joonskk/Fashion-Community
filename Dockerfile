# Stage 1: install dependencies
FROM node:22-alpine AS deps
WORKDIR app/
COPY package*.json ./
RUN npm ci