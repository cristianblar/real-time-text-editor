FROM node:22-alpine AS base

RUN npm install -g pnpm@9.15.0
ENV PNPM_HOME=/usr/local/bin/
RUN chmod +x /usr/local/bin/pnpm

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN pnpm install -g turbo
COPY . .
RUN turbo prune api --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN pnpm turbo build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs

COPY --from=installer /app .

CMD node apps/api/dist/index.js
