# Use the specified Node.js version
FROM node:22.1.0

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./


RUN apt-get update && apt-get install -y \
    libnss3 \  
    libasound2 \ 
    libgtk-3-dev \ 
    && rm -rf /var/lib/apt/lists/*
# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the desired port (optional, if your app listens on a port)
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]
