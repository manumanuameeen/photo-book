# --- Stage 1: Base ---
FROM node:20-alpine AS base

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

# --- Stage 2: Development ---
FROM base AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# --- Stage 3: Builder ---
FROM base AS builder
WORKDIR /app
COPY . .
# Increase memory limit for the build process
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build


# --- Stage 4: Production ---
FROM node:20-alpine AS production
ENV NODE_ENV=production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm install --legacy-peer-deps --omit=dev

# Copy built files
COPY --from=builder /app/dist ./dist

EXPOSE 5000


CMD ["npm", "start"]
