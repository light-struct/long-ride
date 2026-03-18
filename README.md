# LongRide

Платформа для управления велосипедами. Состоит из двух частей:

- **Бэкенд** — Go, Clean Architecture, PostgreSQL (Neon), порт `8080`
- **Фронтенд** — Next.js 16 + React 19, порт `3000`

---

## Структура проекта

```
demo2/
├── cmd/api/main.go                        # Точка входа, DI, роутер
├── internal/
│   ├── config/config.go                   # Загрузка и валидация .env
│   ├── domain/entities.go                 # Доменные модели
│   ├── usecase/
│   │   ├── auth.go                        # JWT: регистрация, логин, refresh
│   │   ├── sync.go                        # Движок дифференциальной синхронизации
│   │   └── ai.go                          # AI с prompt guard и контекстом
│   ├── repository/
│   │   ├── interfaces.go                  # Контракты репозиториев
│   │   ├── user_postgres.go               # Пользователи + Argon2 (случайный соль)
│   │   ├── bicycle_postgres.go            # Велосипеды, soft delete, upsert
│   │   ├── component_postgres.go          # Компоненты, upsert, IN-запросы
│   │   └── synclog_postgres.go            # Лог синхронизации по устройствам
│   ├── handler/
│   │   ├── auth.go                        # POST /v1/auth/*
│   │   ├── sync.go                        # POST /v1/sync
│   │   ├── ai.go                          # POST /v1/ai/consult
│   │   └── workshop.go                    # GET /v1/workshops
│   └── middleware/
│       ├── auth.go                        # JWT-валидация, контекст userID
│       ├── cors.go                        # CORS по списку доменов
│       └── ratelimit.go                   # Rate limiting (IP-based, in-memory)
├── migrations/
│   └── 001_initial_schema.sql             # Схема БД с UUID, enum, триггерами
├── frontend/
│   ├── app/
│   │   ├── page.tsx                       # Корневой роутер (auth → shell)
│   │   └── layout.tsx                     # HTML-обёртка, метаданные
│   ├── components/longride/
│   │   ├── app-shell.tsx                  # Sidebar (desktop) + BottomNav (mobile)
│   │   └── views/
│   │       ├── auth.tsx                   # Логин / регистрация → реальный API
│   │       ├── dashboard.tsx              # Главный экран, статус велосипедов
│   │       ├── garage.tsx                 # CRUD велосипедов и компонентов
│   │       ├── ai-assistant.tsx           # Чат с AI → реальный API + toolkit
│   │       ├── map-view.tsx               # Карта мастерских → реальный API
│   │       ├── settings.tsx               # Sync, тема, выход → реальный API
│   │       └── toolkit.tsx                # Офлайн-руководства по ремонту
│   └── lib/
│       └── api.ts                         # Единый API-клиент с авто-refresh токена
├── .env                                   # Переменные окружения (не в git)
├── .env.example                           # Шаблон переменных
├── frontend/.env.local                    # NEXT_PUBLIC_API_URL для фронтенда
├── api.yaml                               # OpenAPI 3.0 спецификация
├── Dockerfile                             # Сборка бэкенда в контейнер
└── Makefile                               # Команды разработки
```

---

## Быстрый старт

### 1. Бэкенд

```bash
# Из корня demo2/
go mod download

# Применить миграции (один раз)
psql "$DATABASE_URL" -f migrations/001_initial_schema.sql

# Запустить сервер
go run cmd/api/main.go
# → Server starting on :8080
# → CORS allowed origins: http://localhost:3000,http://localhost:8080
```

### 2. Фронтенд

```bash
cd frontend/
pnpm install
pnpm dev
# → http://localhost:3000
```

### 3. Проверка связки

```bash
# Бэкенд живой?
curl http://localhost:8080/health
# → OK

# Регистрация через фронтенд
# Открыть http://localhost:3000 → ввести email/пароль → Sign in
```

---

## Переменные окружения

### Бэкенд — `.env`

| Переменная | Описание | Обязательная |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Секрет для access-токенов (15 мин) | ✅ |
| `JWT_REFRESH_SECRET` | Секрет для refresh-токенов (7 дней) | ✅ |
| `AI_API_KEY` | Groq API ключ | ✅ |
| `AI_API_URL` | `https://api.groq.com/openai/v1/chat/completions` | ✅ |
| `PORT` | Порт сервера (по умолчанию `8080`) | — |
| `ENVIRONMENT` | `development` или `production` | — |
| `ALLOWED_ORIGINS` | Домены через запятую для CORS | — |
| `RATE_LIMIT_REQUESTS` | Запросов на IP (по умолчанию `100`) | — |
| `RATE_LIMIT_WINDOW` | Окно в секундах (по умолчанию `60`) | — |
| `AI_RATE_LIMIT_REQUESTS` | Запросов к AI на IP (по умолчанию `10`) | — |
| `AI_RATE_LIMIT_WINDOW` | Окно AI в секундах (по умолчанию `60`) | — |

### Фронтенд — `frontend/.env.local`

| Переменная | Значение |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/v1` |

---

## API

Все защищённые эндпоинты требуют заголовок `Authorization: Bearer <access_token>`.

### Публичные

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/v1/auth/register` | Регистрация, возвращает оба токена |
| `POST` | `/v1/auth/login` | Логин, возвращает оба токена |
| `POST` | `/v1/auth/refresh` | Обновление access-токена по refresh |
| `GET` | `/health` | Health check |

### Защищённые

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/v1/sync` | Дифференциальная синхронизация |
| `POST` | `/v1/ai/consult` | AI-консультация (rate limit: 10/мин) |
| `GET` | `/v1/workshops?lat=X&lng=Y` | Ближайшие мастерские |

Полная спецификация — `api.yaml`.

---

## Как работает синхронизация

Движок реализован в `internal/usecase/sync.go`. Стратегия — **Server Wins** по полю `updated_at`.

```
Клиент                              Сервер
  │                                    │
  │── POST /v1/sync ──────────────────>│
  │   { device_id, bicycles,           │
  │     components, last_sync_at }     │
  │                                    │
  │                    1. Upsert данных клиента
  │                       (сервер побеждает при конфликте)
  │                    2. SELECT изменений с last_sync_at
  │                    3. UPSERT sync_logs (user_id, device_id, NOW())
  │                                    │
  │<── { bicycles, components, ────────│
  │      synced_at }                   │
  │                                    │
  │  Сохранить synced_at как           │
  │  новый last_sync_at                │
```

**Конфликт:** если `server.updated_at > client.updated_at` — сервер не перезаписывается, клиент получит серверную версию в ответе.

**Soft delete:** записи с `deleted_at != null` включаются в ответ — клиент должен удалить их локально.

**UUID:** клиент генерирует UUID сам (для офлайн-создания). Сервер принимает клиентские UUID как есть.

---

## Как работает AI

Реализован в `internal/usecase/ai.go`. Модель — `llama3-8b-8192` через Groq API.

**Prompt Guard** — системный промпт запрещает AI отвечать на темы вне велосипедной механики.

**Динамический контекст** — перед каждым запросом сервер:
1. Делает `SELECT` компонентов пользователя из БД
2. Фильтрует Yellow/Red статусы
3. Формирует строку контекста вида:
   ```
   Current bicycle status:
   - Shimano HG701 (Drivetrain): 1800/2000 km (WARNING)
   - Brake Pads (Brakes): 950/1000 km (CRITICAL)
   ```
4. Инжектирует как второй system-message перед вопросом пользователя

---

## Как работает API-клиент фронтенда

Весь сетевой код сосредоточен в `frontend/lib/api.ts`.

- Токены хранятся в `localStorage` (`access_token`, `refresh_token`, `user_id`)
- При получении `401` — автоматически вызывает `/auth/refresh` и повторяет запрос
- При неудачном refresh — очищает токены (выход из системы)
- `device_id` генерируется через `crypto.randomUUID()` и хранится в `localStorage`
- `last_sync_at` сохраняется после каждого успешного sync

---

## Безопасность

| Механизм | Реализация |
|---|---|
| Пароли | Argon2id, случайный 16-байтный соль на каждый пароль, формат `salt$hash` |
| Access-токен | JWT HS256, TTL 15 минут |
| Refresh-токен | JWT HS256, TTL 7 дней, отдельный секрет |
| CORS | Whitelist доменов из `ALLOWED_ORIGINS` |
| Rate limiting | In-memory, IP-based, глобальный + отдельный для AI |
| SQL-инъекции | Параметризованные запросы везде |
| UUID | Клиентская генерация для офлайн-поддержки |

---

## База данных

Схема: `migrations/001_initial_schema.sql`

```sql
users        — id (UUID), email (UNIQUE), password_hash, created_at, updated_at
bicycles     — id (UUID, client), user_id (FK), name, type, total_mileage,
               is_active, version, created_at, updated_at, deleted_at
components   — id (UUID, client), bike_id (FK), category (ENUM), sub_category (ENUM),
               name, current_mileage, max_resource_km, status (ENUM), updated_at, deleted_at
sync_logs    — id (UUID), user_id (FK), device_id, last_sync_at
               UNIQUE(user_id, device_id)
```

Enum-типы: `component_category`, `component_sub_category`, `component_status`

Индексы: `users.email`, `bicycles.user_id`, `bicycles.deleted_at`, `components.bike_id`, `components.deleted_at`, `sync_logs(user_id, device_id)`

Триггеры: автоматическое обновление `updated_at` при UPDATE на `users`, `bicycles`, `components`.

---

## Сборка и деплой

### Локальная сборка бинарника

```bash
go build -o bin/longride cmd/api/main.go
./bin/longride
```

### Docker

```bash
docker build -t longride-backend .
docker run -p 8080:8080 --env-file .env longride-backend
```

### Render.com / Railway

- Build command: `go build -o bin/longride cmd/api/main.go`
- Start command: `./bin/longride`
- Добавить все переменные из `.env`

### Makefile

```bash
make run          # go run cmd/api/main.go
make build        # собрать бинарник в bin/
make migrate      # применить миграции через psql
make test         # go test ./...
make docker-build
make docker-run
```

---

## Тестирование API вручную

```bash
# 1. Health
curl http://localhost:8080/health

# 2. Регистрация
curl -X POST http://localhost:8080/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@longride.com","password":"SecurePass123"}'

# 3. Логин → сохранить токен
export TOKEN=$(curl -s -X POST http://localhost:8080/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@longride.com","password":"SecurePass123"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# 4. Синхронизация
curl -X POST http://localhost:8080/v1/sync \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test-device-001",
    "bicycles": [{
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "00000000-0000-0000-0000-000000000000",
      "name": "Test Bike", "type": "MTB",
      "total_mileage": 100.5, "is_active": true, "version": 1,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }],
    "components": []
  }'

# 5. AI-консультация
curl -X POST http://localhost:8080/v1/ai/consult \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"When should I replace my chain?"}'

# 6. Мастерские
curl "http://localhost:8080/v1/workshops?lat=40.7128&lng=-74.0060" \
  -H "Authorization: Bearer $TOKEN"

# 7. Refresh токена
curl -X POST http://localhost:8080/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'

# 8. Проверка 401
curl -X POST http://localhost:8080/v1/sync \
  -H "Authorization: Bearer invalid" \
  -d '{}'
# → 401 Unauthorized
```

---

## Устранение неполадок

**Сервер не стартует — "JWT_SECRET is required"**
→ Проверить наличие файла `.env` в корне `demo2/`. Убедиться, что `JWT_SECRET` и `JWT_REFRESH_SECRET` заданы.

**Ошибка подключения к БД**
```bash
psql "$DATABASE_URL" -c "SELECT 1;"
```
→ Проверить `DATABASE_URL`, наличие `sslmode=require`.

**CORS-ошибка в браузере**
→ Добавить `http://localhost:3000` в `ALLOWED_ORIGINS` в `.env`.

**AI возвращает ошибку**
```bash
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3-8b-8192","messages":[{"role":"user","content":"test"}]}'
```
→ Проверить `AI_API_KEY`.

**Фронтенд не видит бэкенд**
→ Проверить `frontend/.env.local`: должно быть `NEXT_PUBLIC_API_URL=http://localhost:8080/v1`.

**429 Too Many Requests на AI**
→ Увеличить `AI_RATE_LIMIT_REQUESTS` в `.env` для разработки.

---

## Лицензия

github: light-struct
# LongRide
