# Frontend image: installs deps and runs Next.js in dev mode wired to the backend.
# NEXT_PUBLIC_API_BASE is read at runtime from the environment (set by docker-compose).
FROM node:20-slim

WORKDIR /app
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
