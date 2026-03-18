FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o longride cmd/api/main.go

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/longride .
COPY --from=builder /app/migrations ./migrations

EXPOSE 8080

CMD ["./longride"]
