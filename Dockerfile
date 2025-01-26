# Stage build
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN pnpm run build

# Stage 2
FROM node:20-alpine

WORKDIR /usr/src/app

ARG NODE_ENV=production
ARG PORT=1235
ARG MONGO_URI=
ARG MONGO_DB_NAME=
ARG APP_URL=

COPY --from=build /usr/src/app/package.json .
COPY --from=build /usr/src/app/pnpm-lock.yaml .
COPY --from=build /usr/src/app/tsconfig.json .
COPY --from=build /usr/src/app/dist ./dist
RUN npm install -g pnpm
RUN pnpm install

ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV MONGO_URI=${MONGO_URI}
ENV MONGO_DB_NAME=${MONGO_DB_NAME}
ENV APP_URL=${APP_URL}

EXPOSE ${PORT}}

CMD ["pnpm", "start"]
