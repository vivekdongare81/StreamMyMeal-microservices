FROM node:20-alpine

WORKDIR /app

# Install npm packages
COPY package*.json ./
RUN npm install --production \
    --build-from-source \
    --no-package-lock \
    --no-optional

# Copy source code
COPY . .

# Expose ports
EXPOSE 4000
EXPOSE 40000-49999/udp

# Start the server
CMD ["npm", "start"]
