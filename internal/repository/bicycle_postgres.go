package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/longride/backend/internal/domain"
)

type PostgresBicycleRepository struct {
	db *sql.DB
}

func NewPostgresBicycleRepository(db *sql.DB) *PostgresBicycleRepository {
	return &PostgresBicycleRepository{db: db}
}

func (r *PostgresBicycleRepository) Upsert(ctx context.Context, bike *domain.Bicycle) error {
	query := `
		INSERT INTO bicycles (id, user_id, name, type, total_mileage, is_active, version, created_at, updated_at, deleted_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			type = EXCLUDED.type,
			total_mileage = EXCLUDED.total_mileage,
			is_active = EXCLUDED.is_active,
			version = EXCLUDED.version,
			updated_at = EXCLUDED.updated_at,
			deleted_at = EXCLUDED.deleted_at
		WHERE bicycles.updated_at <= EXCLUDED.updated_at`

	_, err := r.db.ExecContext(ctx, query,
		bike.ID, bike.UserID, bike.Name, bike.Type, bike.TotalMileage,
		bike.IsActive, bike.Version, bike.CreatedAt, bike.UpdatedAt, bike.DeletedAt)
	return err
}

func (r *PostgresBicycleRepository) GetByUserID(ctx context.Context, userID uuid.UUID, since *time.Time) ([]domain.Bicycle, error) {
	query := `SELECT id, user_id, name, type, total_mileage, is_active, version, created_at, updated_at, deleted_at
	          FROM bicycles WHERE user_id = $1`
	args := []interface{}{userID}

	if since != nil {
		query += ` AND updated_at > $2`
		args = append(args, since)
	}

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Return an empty JSON array instead of null when there are no rows.
	bikes := make([]domain.Bicycle, 0)
	for rows.Next() {
		var bike domain.Bicycle
		err := rows.Scan(&bike.ID, &bike.UserID, &bike.Name, &bike.Type, &bike.TotalMileage,
			&bike.IsActive, &bike.Version, &bike.CreatedAt, &bike.UpdatedAt, &bike.DeletedAt)
		if err != nil {
			return nil, err
		}
		bikes = append(bikes, bike)
	}
	return bikes, nil
}

func (r *PostgresBicycleRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Bicycle, error) {
	bike := &domain.Bicycle{}
	query := `SELECT id, user_id, name, type, total_mileage, is_active, version, created_at, updated_at, deleted_at
	          FROM bicycles WHERE id = $1`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&bike.ID, &bike.UserID, &bike.Name, &bike.Type, &bike.TotalMileage,
		&bike.IsActive, &bike.Version, &bike.CreatedAt, &bike.UpdatedAt, &bike.DeletedAt)
	return bike, err
}
