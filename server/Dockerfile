FROM node:20

WORKDIR /app

# Install build tools for native modules
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy server files
COPY . .

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]

