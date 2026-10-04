# TaskForge Architecture

```text
Browser
  |
  | HTTP :8080
  v
React + Nginx (frontend)
  |
  | /api -> backend:5000
  v
Node.js + Express (backend)
  |
  | mongodb://database:27017/taskforge
  v
MongoDB (database)
  |
  v
Named volume: mongo_data
```

## Container boundaries

- `frontend`: public entrypoint only. Nginx serves the React static build and reverse-proxies `/api`.
- `backend`: internal-only REST API. No host port is published.
- `database`: internal-only MongoDB. No host port is published.

## Resource targets

- Frontend: 128 MiB / 0.25 CPU
- Backend: 256 MiB / 0.50 CPU
- Database: 512 MiB / 0.75 CPU

These are intentionally conservative starting limits for a demo/portfolio workload. Adjust after measuring with `docker stats` on your target machine.
