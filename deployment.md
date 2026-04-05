# PreventX Deployment Guide 🚀

This guide provides step-by-step instructions for deploying the **PreventX** production-ready stack to a cloud environment.

## 🏗️ Deployment Architectures

You have two primary options for professional deployment:

### Option 1: Managed Platform (Railway, Render, Fly.io)
**Best for**: Fast, zero-maintenance launches.
- **Backend**: Point to the `/backend` folder. The platform will automatically detect the `Dockerfile`.
- **Frontend**: Point to the `/frontend` folder. The platform will use the multi-stage `Dockerfile`.
- **Environment Variables**:
  - `VITE_API_BASE_URL`: Your backend URL (e.g., `https://api.preventx.com`)
  - `VITE_ALLOWED_ORIGINS`: Your frontend URL (e.g., `https://preventx.com`)

### Option 2: Self-Hosted VPS (DigitalOcean, AWS, Linode)
**Best for**: Full control and lower costs.
1. Install **Docker** and **Docker Compose** on your server.
2. Clone your repository: `git clone https://github.com/Aryanlohri/PREVENT-X.git`
3. Update the `VITE_API_BASE_URL` in `docker-compose.yml` to your domain.
4. Run the stack: `docker-compose up -d --build`

---

## 🔒 Post-Deployment Checklist

### 1. SSL/TLS Certificate
If using a VPS, use **Certbot** with Nginx to enable HTTPS. Managed platforms handle this automatically.

### 2. Database Persistence
Your healthcare data is stored in a Docker Volume (`protectx-db`).
- **Backup**: Regularly back up the `sql_app.db` file from the volume.
- **Migration**: If you plan to scale horizontally (more than 1 backend instance), migrate to a managed PostgreSQL service.

### 3. Environment Variables Overview
| Variable | Value (Example) | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://api.myapp.com` | Backend URL for the frontend |
| `VITE_ALLOWED_ORIGINS` | `https://myapp.com` | CORS whitelist for the backend |
| `DATABASE_URL` | `sqlite:///./data/sql_app.db` | Connection string |

---

## 🛠️ Testing the Build
You can test the entire production stack locally before pushing:
```bash
# Build and start all services
docker-compose up --build
```
Access the app at `http://localhost:8080`.

> [!IMPORTANT]
> **Production Server**: We use **Gunicorn** with **Uvicorn workers** (4 workers) for maximum concurrency. This handles multiple users simultaneously without blocking.
