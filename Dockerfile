#Use a lightweight Node.js base image
FROM node:23.3.0-slim AS base

#Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

#Create app directory
WORKDIR /app

#Set pnpm global store path
ENV PNPM_HOME=/pnpm-store
ENV PATH=$PNPM_HOME:$PATH

#Create app directory
COPY package.json pnpm-lock.yaml ./

#Install dependencies in an intermediate build stage
FROM base AS dependencies

#Mount the global pnpm store as a volume
VOLUME ["/pnpm-store"]

#Install dependencies
RUN pnpm install --frozen-lockfile

#Copy app files AFTER installing dependencies
COPY . .

#Final build stage for production
FROM base AS production

#Copy project files
COPY --from=dependencies /pnpm-store /pnpm-store
COPY --from=dependencies /app /app

#Only install production dependencies
RUN pnpm prune --prod

#Expose the app (optional, for web apps)
EXPOSE 3000

#Command to start the app
CMD ["pnpm", "dev"]