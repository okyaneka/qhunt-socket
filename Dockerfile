# Stage build
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@10.2.0
RUN pnpm install

COPY . .

RUN pnpm build

# Stage 2
FROM node:20-alpine

LABEL org.opencontainers.image.source=https://github.com/okyaneka/qhunt-socket
LABEL org.opencontainers.image.description="QHunt Socket Image"

WORKDIR /usr/src/app

ARG NODE_ENV=production
ARG PORT=3000

COPY --from=build /usr/src/app/package.json /usr/src/app/pnpm-lock.yaml /usr/src/app/tsconfig.json ./
COPY --from=build /usr/src/app/dist ./dist
RUN npm install -g pnpm@10.2.0
RUN pnpm install

ENV NODE_ENV=${NODE_ENV}

EXPOSE 3000

CMD ["pnpm", "start"]
