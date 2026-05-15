# BUILD STAGE
FROM node:20-alpine AS builder

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including tsc)
RUN npm ci

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build


# PRODUCTION STAGE
FROM node:20-alpine

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy only what is needed for production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Optional: If you want to keep node_modules minimal, you could rerun npm ci --only=production
# but copying from builder is faster and usually fine if you didn't have huge dev deps.

EXPOSE 5000

CMD ["node", "dist/server.js"]
