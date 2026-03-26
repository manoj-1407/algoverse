.PHONY: up down logs test lint seed

up:
	docker compose up -d --build
	@echo "  → http://localhost:5173"
	@echo "  → http://localhost:8000/docs"

down: ; docker compose down

logs: ; docker compose logs -f --tail=100

test: ; docker compose exec backend pytest tests/ -v --tb=short

lint: ; docker compose exec backend ruff check app/

seed: ; docker compose exec backend python -m app.scripts.seed

shell-be: ; docker compose exec backend bash
shell-db: ; docker compose exec db psql -U algoverse -d algoverse

clean:
	docker compose down -v --remove-orphans
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
