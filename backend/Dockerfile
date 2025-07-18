# Backend Dockerfile
FROM python:3.12-slim-bullseye

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=config.settings

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    postgresql-client \
    build-essential \
    libpq-dev \
    gettext \
    curl \
    netcat-openbsd \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    libxml2 \
    libgirepository-1.0-1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt separately for better layer caching
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files
COPY . /app/

# Create directories for media and static files
RUN mkdir -p /app/media /app/staticfiles

# Collect static files (ensure settings are correct and dependencies are installed)
RUN python manage.py collectstatic --noinput || echo "Collectstatic failed during build, will retry at runtime if needed"

# Create entrypoint script
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 8000

# Run entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]