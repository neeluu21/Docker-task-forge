# syntax=docker/dockerfile:1.7
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund \
    && npm cache clean --force

COPY src ./src

RUN addgroup -S taskforge && adduser -S -G taskforge taskforge \
    && chown -R taskforge:taskforge /app

USER taskforge

EXPOSE 5000

HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:5000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
