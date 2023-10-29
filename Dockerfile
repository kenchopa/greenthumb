#### PNPM LAYER ####
# Pnpm - handles the vm requirements (node and pnpm)
FROM node:18 AS pnpm
RUN npm i -g pnpm

#### INSTALL LAYER ####
# Install - handles the top-level pnpm install. We've kept the file content light:
FROM pnpm AS install
WORKDIR /repo
# These folders include `package.json` files _only_ to avoid having to re-run pnpm install on every code change. 
# They are pre-filtered via our build orchestrator (gradle)
COPY apps/ apps/
COPY packages/ packages/
# Top-level monorepo concerns that are shared across projects
COPY package.json .
COPY pnpm-workspace.yaml pnpm-workspace.yaml
COPY pnpm-lock.yaml pnpm-lock.yaml
RUN pnpm install -r --frozen-lockfile && \
    rm -rf ~/.pnpm-store;
EXPOSE 3000
ENTRYPOINT ["pnpm", "dev"]

#### LINT LAYER ####
# Lint - allows linting to be controlled separately from other build concerns to maximize caching
#FROM install as lint
#WORKDIR /repo
# These folders include all lintable (.js and .ts) files in each package as well as eslint-specific configs (eslintignore, eslint.config.js, etc). They are pre-filtered via our build orchestrator (gradle)
#COPY apps/ apps/
#COPY packages/ packages/
#COPY .eslint/ .eslint/
#RUN pnpm run lint -r --no-sort && \
#    find . -delete && \
#    echo "OK" > results.txt
#FROM alpine
#COPY --from=lint /repo/results.txt /repo/results.txt