# Use the specified Node.js version
FROM node:22.1.0

# Create and set the working directory
WORKDIR /app

# Install necessary system dependencies for Puppeteer/WhatsApp Web
RUN apt-get update && apt-get install -y \
    libnss3 \  
    libxss1 \
    libasound2 \ 
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libdrm2 \
    libgbm1 \
    libxshmfence1 \
    libx11-xcb1 \
    chromium \
    wget \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set environment variables
ENV WWEBJS_FORCE_REINIT=true
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create wait-for-it script
RUN echo '#!/bin/bash\n\
echo "Waiting for dependencies..."\n\
sleep 5\n\
echo "Starting application..."\n\
node index.js' > /app/start.sh && chmod +x /app/start.sh

# Expose the desired port
EXPOSE 3000

# Command to run the application
CMD ["/app/start.sh"]
