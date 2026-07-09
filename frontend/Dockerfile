FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
# Using --legacy-peer-deps or --force might be needed for older Next.js deps, but we try standard first.
RUN npm install || npm install --legacy-peer-deps

# Copy all files
COPY . .

# Build the Next.js app
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Start the application on port 3018
EXPOSE 3018

CMD ["npm", "start"]
