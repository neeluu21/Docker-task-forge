# TaskForge — Dockerized Full-Stack DevOps Project

TaskForge is a portfolio-ready 3-tier task management application built with React, Node.js/Express and MongoDB, then packaged with Docker and Docker Compose.

## What this project demonstrates

- React + Vite frontend
- Node.js + Express REST API
- MongoDB persistence with a named volume
- Nginx reverse proxy
- Docker multi-stage frontend build
- Backend non-root user
- Custom Docker network
- Health checks and dependency ordering
- CPU/memory limits
- Read-only backend filesystem plus tmpfs
- Dropped Linux capabilities
- HTTP security headers via Helmet
- API rate limiting
- Docker Hub image distribution
- Portable pull-and-run deployment

## Architecture

See [architecture.md](./architecture.md).

## Prerequisites

On Ubuntu 24.04 LTS, install Docker Engine and the Compose plugin using Docker's official repository instructions:

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF2
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF2
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
```

Verify:

```bash
docker --version
docker compose version
sudo docker run hello-world
```

## 1. Configure environment

```bash
cp .env.example .env
nano .env
```

At minimum, change `MONGO_PASSWORD` before any non-local deployment.

## 2. Build locally

```bash
docker compose build
```

## 3. Run

```bash
docker compose up -d
```

Open:

```text
http://localhost:8080
```

Check containers:

```bash
docker compose ps
docker stats
```

## 4. API checks

Through the public Nginx entrypoint:

```bash
curl http://localhost:8080/api/health
curl http://localhost:8080/api/tasks
```

Expected health response when MongoDB is ready:

```json
{
  "status": "ok",
  "service": "taskforge-api",
  "database": "connected"
}
```

## 5. Persistence test

Create a task in the UI, then run:

```bash
docker compose down
docker compose up -d
```

The task should still exist because MongoDB uses the `mongo_data` named volume.

## 6. Docker Hub release

Login:

```bash
docker login
```

Build with the Docker Hub namespace from `.env`:

```bash
docker compose build
```

Push both images:

```bash
docker compose push
```

This works because `compose.yaml` assigns each build an `image:` name such as:

```text
neelu196/taskforge-frontend:v1.0.0
neelu196/taskforge-backend:v1.0.0
```

Replace `DOCKERHUB_USERNAME` in `.env` with your own Docker Hub username if needed.

## 7. Fresh-machine portability test

On another PC/server with Docker + Compose:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd taskforge
cp .env.example .env
```

Update `.env`, then:

```bash
docker compose pull
docker compose up -d
```

No Node.js, npm, React, Nginx or MongoDB installation should be required on the host.

## 8. Security checks

Backend is configured with:

- non-root user
- read-only root filesystem
- `/tmp` tmpfs
- all Linux capabilities dropped
- `no-new-privileges`
- Helmet security headers
- request body limit
- API rate limiting

Frontend and backend images do not copy `.env` files.

MongoDB and the backend are not published to host ports; only Nginx is published.

## 9. Vulnerability scan

With Docker Scout available:

```bash
docker scout cves neelu196/taskforge-frontend:v1.0.0
docker scout cves neelu196/taskforge-backend:v1.0.0
```

Record important findings in your project report and update the base/dependency versions when appropriate.

## 10. Troubleshooting

### Frontend opens but tasks fail

```bash
docker compose logs backend --tail=100
docker compose logs database --tail=100
```

### Check network

```bash
docker network ls
docker network inspect taskforge_taskforge-network
```

### Check volume

```bash
docker volume ls
docker volume inspect taskforge_mongo_data
```

### Recreate cleanly

```bash
docker compose down --remove-orphans
docker compose up -d --force-recreate
```

Do not use `docker compose down -v` unless you intentionally want to delete the MongoDB data volume.

## Project structure

```text
taskforge/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .dockerignore
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── docs/
├── architecture.md
├── compose.yaml
├── .env.example
├── .gitignore
├── Makefile
└── README.md
```

## Production note

For production, replace the example database password, use a proper secret-management solution, pin dependencies/base images to approved versions, put TLS in front of Nginx, and review the resource limits under real workload measurements.
