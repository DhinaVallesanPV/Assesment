# Render Deployment Guide for TaskFlow

This document explains how to deploy the **TaskFlow** application (FastAPI backend + Glassmorphic SPA frontend) on **Render** using the Docker-based service configuration.

## Prerequisites
- A GitHub repository containing the full project (already pushed).
- A Render account (free tier works fine).
- The `render.yaml` file at the repository root (created automatically by this guide).

## Steps
1. **Log in to Render** and click **New → Web Service**.
2. **Connect your GitHub repository** – select the repo you just pushed.
3. Render will detect `render.yaml`. It will use the Dockerfile you already have in the repo to build the image.
4. **Environment Variables** – Render imports the variables defined inside `render.yaml`. Replace the placeholder `<YOUR_SECRET_KEY>` with a strong, random secret (e.g., `openssl rand -hex 32`).
   - `DATABASE_URL` – defaults to `sqlite:///./tasks.db` (file stored in a persistent volume). You can also point to a hosted PostgreSQL instance.
   - `SECRET_KEY` – keep secret!
   - `ALGORITHM` – keep `HS256`.
   - `ACCESS_TOKEN_EXPIRE_MINUTES` – token lifetime, default `60`.
5. **Persistent Storage** – Render automatically attaches a volume for the SQLite file. No extra configuration needed.
6. **Deploy** – Click **Create Web Service**. Render will build the Docker image and start the container.
7. **Access** – Once the deployment finishes, you’ll receive a URL like `https://taskflow.onrender.com`. Open it to see the Glassmorphic UI.
8. **API Docs** – The OpenAPI docs are available at `https://<your‑domain>/docs`.

## Updating the Service
Any new commit to the `master` (or the branch you chose) will trigger an automatic rebuild on Render. Just push changes as usual:
```bash
git add <changed-files>
git commit -m "Your message"
git push
```
Render will pick up the new commit and redeploy.

## Common Issues
- **CORS errors** – ensure the origin (your Render domain) is listed in `origins` inside `backend/app/main.py`.
- **Missing environment variables** – double‑check that the secret key is set and not the placeholder.
- **SQLite persistence** – if you switch to PostgreSQL, update `DATABASE_URL` accordingly and run migrations if needed.

Happy deploying! 🚀
