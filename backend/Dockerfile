# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
# Use legacy-peer-deps to avoid lockfile mismatches during image build
RUN npm install --legacy-peer-deps --production
COPY . .
EXPOSE 5000
CMD ["node","index.js"]
