# ─── Stage 1: Development ───────────────────────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]


# ─── Stage 2: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

ARG NODE_OPTIONS="--max-old-space-size=1024"
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


# ─── Stage 3: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
