# Production Dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV DATABASE_URL=sqlite:///./tasks.db

WORKDIR /app

# Install system utilities needed for building wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements first to optimize caching
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./backend/requirements.txt && \
    pip install --no-cache-dir "bcrypt==4.0.1"

# Copy source folders
COPY frontend ./frontend
COPY backend ./backend

# Expose server port
EXPOSE 8000

# Set Pythonpath so main app is easily resolvable
ENV PYTHONPATH=/app

# Start application via Uvicorn
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
