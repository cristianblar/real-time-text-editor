FROM node:22-alpine AS base

RUN npm install -g pnpm@9.15.0
ENV PNPM_HOME=/usr/local/bin/
RUN chmod +x /usr/local/bin/pnpm

FROM base AS builder
RUN apk update
RUN apk add libc6-compat

WORKDIR /app

RUN pnpm install -g turbo
COPY . .
RUN turbo prune frontend --docker

FROM base AS installer
RUN apk update
RUN apk add libc6-compat

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

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

CMD node apps/frontend/server.js
