# Stage 1: Build environment
FROM node:14 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Rebuild native modules if necessary (e.g., bcrypt)
RUN npm rebuild bcrypt --build-from-source

# Install PM2 globally
RUN npm install pm2 -g

# Copy the rest of the application code
COPY . .

# Stage 2: Runtime environment
FROM node:14

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app /app

# Expose the necessary ports
EXPOSE 3001
EXPOSE 4000
EXPOSE 4001

# Run the application with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
