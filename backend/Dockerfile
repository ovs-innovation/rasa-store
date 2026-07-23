FROM node:20-alpine

WORKDIR /app

# Runtime secrets come from compose env_file — never bake .env into the image
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Ensure entrypoint is executable (Windows checkouts may lose +x)
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "start"]
