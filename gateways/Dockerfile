# ---- Base image ----
FROM node:20-alpine

# ---- Set working directory ----
WORKDIR /usr/src/app

# ---- Install dependencies ----
COPY package*.json ./
RUN npm install --production

# ---- Copy source code ----
COPY . .

# ---- Expose the app port ----
EXPOSE 5000

# ---- Start the app ----
CMD ["node", "index.js"]
