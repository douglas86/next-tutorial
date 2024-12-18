FROM node:22-slim

RUN npm install -g pnpm
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN apt-get update -y && apt-get install -y jq openssl

RUN pnpm install --store ${PNPM_STORE}

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]