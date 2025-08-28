# Use official Node LTS
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Build client and server
COPY . .
RUN npm run build

# Runtime image
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/server/public ./server/public
COPY package*.json ./

# Vercel sets PORT; our server reads PORT (defaults 5000)
EXPOSE 3000
ENV PORT=3000

CMD ["npm", "start"]


