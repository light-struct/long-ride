package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/longride/backend/internal/domain"
)

type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
}

type BicycleRepository interface {
	Upsert(ctx context.Context, bike *domain.Bicycle) error
	GetByUserID(ctx context.Context, userID uuid.UUID, since *time.Time) ([]domain.Bicycle, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Bicycle, error)
}

type ComponentRepository interface {
	Upsert(ctx context.Context, component *domain.Component) error
	GetByBikeIDs(ctx context.Context, bikeIDs []uuid.UUID, since *time.Time) ([]domain.Component, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]domain.Component, error)
}

type SyncLogRepository interface {
	Upsert(ctx context.Context, log *domain.SyncLog) error
	GetByUserDevice(ctx context.Context, userID uuid.UUID, deviceID string) (*domain.SyncLog, error)
}
