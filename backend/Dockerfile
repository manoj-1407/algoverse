FROM python:3.11-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

FROM base AS development
COPY . .
EXPOSE 8000

FROM base AS production
COPY . .
RUN addgroup --system appgroup && adduser --system --group appuser
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
