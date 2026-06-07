FROM node:20-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma/ ./prisma/
RUN npx prisma generate

FROM base AS build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
RUN addgroup -S -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodeuser
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=base /app/package*.json ./
COPY --from=base /app/prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

RUN chown -R 1001:1001 /app/node_modules/@prisma /app/node_modules/.prisma

EXPOSE 3000
USER nodeuser
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/db-setup.js && node dist/index.js"]
