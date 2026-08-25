FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
# Install dependencies
RUN pnpm install --frozen-lockfile
# Build the specific app and its dependencies
RUN pnpm --filter @tatalaku/api build
# Prune dependencies for production
RUN pnpm --filter @tatalaku/api deploy --prod /deploy

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 express

COPY --from=builder --chown=express:nodejs /deploy ./

USER express

EXPOSE 5000
ENV PORT=5000

CMD ["node", "dist/server.js"]
