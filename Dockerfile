# Stage 1: install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: build the app
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are baked into the browser JS at build time,
# so they must exist during `npm run build`, not just at runtime.
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_CLOUDINARY_API_KEY

RUN npm run build

# Stage 3: the small image that actually runs
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# The server (standalone output from step 3)
COPY --from=builder --chown=node:node /app/.next/standalone ./
# Standalone leaves these two out, so copy them yourself
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["node", "server.js"]