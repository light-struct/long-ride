.PHONY: run build migrate test clean docker-build docker-run frontend

# ── Бэкенд ────────────────────────────────────────────────────────────────────

run:
	go run cmd/api/main.go

build:
	go build -o bin/longride cmd/api/main.go

migrate:
	psql "$(DATABASE_URL)" -f migrations/001_initial_schema.sql

test:
	go test -v ./...

vet:
	go vet ./...

clean:
	rm -rf bin/

# ── Docker ────────────────────────────────────────────────────────────────────

docker-build:
	docker build -t longride-backend .

docker-run:
	docker run -p 8080:8080 --env-file .env longride-backend

# ── Фронтенд ──────────────────────────────────────────────────────────────────

frontend:
	cd frontend && pnpm dev

frontend-build:
	cd frontend && pnpm build

frontend-install:
	cd frontend && pnpm install

# ── Оба сервиса ───────────────────────────────────────────────────────────────

dev:
	@echo "Запустите в двух терминалах:"
	@echo "  make run       (бэкенд :8080)"
	@echo "  make frontend  (фронтенд :3000)"
