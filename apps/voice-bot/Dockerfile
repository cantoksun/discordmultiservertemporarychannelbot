FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json .
COPY apps/voice-bot/package.json ./apps/voice-bot/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run build -w packages/shared
RUN npm run build -w apps/voice-bot

# Production Stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/voice-bot/dist ./apps/voice-bot/dist
COPY --from=builder /app/apps/voice-bot/package.json ./apps/voice-bot/
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

ENV NODE_ENV=production

# Command to run
CMD ["npm", "start", "-w", "apps/voice-bot"]
