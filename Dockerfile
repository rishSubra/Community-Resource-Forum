# Use the official Node.js image as the base.
FROM node:20-alpine AS base

# Set the working directory inside the container.
WORKDIR /app

# Declare build arguments to be passed from docker-compose.yml
ARG AUTH_GOOGLE_ID
ARG AUTH_GOOGLE_SECRET
ARG DATABASE_URL

# Set environment variables for the build stage.
ENV AUTH_GOOGLE_ID=$AUTH_GOOGLE_ID
ENV AUTH_GOOGLE_SECRET=$AUTH_GOOGLE_SECRET
ENV DATABASE_URL=$DATABASE_URL

# Copy package.json and pnpm-lock.yaml to install dependencies.
COPY package.json pnpm-lock.yaml ./

# Use pnpm for dependency installation.
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code.
COPY . .

# Build the Next.js application for a production environment.
# This command will now have access to the required environment variables.
RUN pnpm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

# Enable corepack & pnpm for runtime
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

# Set environment variables for Next.js to run in production mode.
ENV NODE_ENV=production

# Copy built app from the builder stage
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/next.config.js ./next.config.js
COPY --from=base /app/src/env.js ./src/env.js

# Expose the port used by Next.js
EXPOSE 3000

# Install netcat and use it to wait for the DB service before starting Next.js.
RUN apk add --no-cache netcat-openbsd
# Wait for DB, attempt to apply Drizzle schema, then start Next.js.
CMD ["sh", "-c", "until nc -z ${DB_HOST:-db} ${DB_PORT:-3306}; do echo waiting for db; sleep 1; done; pnpm start"]
