FROM node:18-alpine AS base
RUN npm i -g pnpm

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build
RUN pnpm prune --prod

FROM base AS deploy
WORKDIR /app
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD [ "node", "dist/index.js" ]


# FROM node:18 as base
# RUN npm i -g pnpm

# FROM base as build
# WORKDIR $HOME
# ADD src ./src
# ADD package.json pnpm-lock.yaml tsconfig.json ./
# RUN pnpm install
# RUN ["pnpm", "user", "build"]

# FROM base as run
# WORKDIR $HOME
# ADD package.json pnpm-lock.yaml ./
# RUN npm install --production
# COPY --from=build $HOME/dist ./dist
# EXPOSE 3000
# CMD ["node", "./dist/index.js"]
