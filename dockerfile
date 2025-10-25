# Stage 1: Build
FROM node:20-alpine AS build

# Set working directory inside container
WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Now copy the rest of your project files
COPY . .

# Build your Quasar app
RUN npx quasar prepare
RUN npx quasar build

# Stage 2: Run
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy built files from previous stage
COPY --from=build /app/dist /app/dist

EXPOSE 443

CMD ["npm", "run", "start"]