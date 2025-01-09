ARG PLATFORM=linux/amd64

FROM --platform=${PLATFORM} node:lts-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start"]
