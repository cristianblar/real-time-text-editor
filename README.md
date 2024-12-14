# Real time text editor Turborepo monorepo

### Apps and Packages

- `frontend`: a [Next.js](https://nextjs.org/) app
- `api`: an [Express](https://expressjs.com/) server (it uses websockets so Node.js is the way to go)
- `@repo/logger`: Isomorphic logger (a small wrapper around console.log)
- `@repo/eslint-config`: ESLint presets
- `@repo/typescript-config`: tsconfig.json's used throughout the monorepo
- `@repo/jest-presets`: Jest configurations

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Requirements

- Node 22.12.0
- Pnpm 9.15.0
- Docker 27.3.1

### Dependencies Installation

```
# Go to the root of the repo
cd real-time-text-editor

# Install dependencies
pnpm install
```

### Docker

This repo is configured to be built with Docker, and Docker compose. To build all apps in this repo:

```
# Go to the root of the repo
cd real-time-text-editor

# Build from the docker compose file
docker compose build --no-cache

# Start the services
docker compose up

# To shutdown all running containers just press `Ctrl+C`.
```

Open http://localhost:3000, signup yourself, then signin, and start collaborating with others!

