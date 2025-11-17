# Stage 1: Build with Node and Vite
FROM node:18-alpine as build

WORKDIR /app

# Install git for dependency installation if needed
RUN apk add --no-cache git

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the production-ready static files
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:1.25-alpine

# Copy the build output from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
