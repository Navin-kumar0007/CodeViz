# 🏗️ Stage 1: Runtime Environment
FROM node:18-bullseye-slim

# ✅ Install System Dependencies (Python, GCC, JDK)
# We need these to execute user code in the container
RUN apt-get update && apt-get install -y \
    python3 \
    g++ \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

# 📂 Set Working Directory
WORKDIR /app

# 📦 Install Node Dependencies
COPY package*.json ./
RUN npm install --production

# 📄 Copy Application Source
COPY . .

# 🌍 Expose Port
EXPOSE 5001

# 🚀 Start Server
CMD ["node", "server.js"]
