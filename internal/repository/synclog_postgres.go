package repository

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	"github.com/longride/backend/internal/domain"
)

type PostgresSyncLogRepository struct {
	db *sql.DB
}

func NewPostgresSyncLogRepository(db *sql.DB) *PostgresSyncLogRepository {
	return &PostgresSyncLogRepository{db: db}
}

func (r *PostgresSyncLogRepository) Upsert(ctx context.Context, log *domain.SyncLog) error {
	query := `
		INSERT INTO sync_logs (id, user_id, device_id, last_sync_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, device_id) DO UPDATE SET
			last_sync_at = EXCLUDED.last_sync_at`
	
	_, err := r.db.ExecContext(ctx, query, log.ID, log.UserID, log.DeviceID, log.LastSyncAt)
	return err
}

func (r *PostgresSyncLogRepository) GetByUserDevice(ctx context.Context, userID uuid.UUID, deviceID string) (*domain.SyncLog, error) {
	log := &domain.SyncLog{}
	query := `SELECT id, user_id, device_id, last_sync_at FROM sync_logs WHERE user_id = $1 AND device_id = $2`
	err := r.db.QueryRowContext(ctx, query, userID, deviceID).Scan(&log.ID, &log.UserID, &log.DeviceID, &log.LastSyncAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return log, err
}
