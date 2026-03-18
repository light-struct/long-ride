package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/longride/backend/internal/domain"
)

type PostgresComponentRepository struct {
	db *sql.DB
}

func NewPostgresComponentRepository(db *sql.DB) *PostgresComponentRepository {
	return &PostgresComponentRepository{db: db}
}

func (r *PostgresComponentRepository) Upsert(ctx context.Context, component *domain.Component) error {
	var subCategory any
	if component.SubCategory != nil {
		subCategory = string(*component.SubCategory)
	}

	query := `
		INSERT INTO components (id, bike_id, category, sub_category, name, current_mileage, max_resource_km, status, updated_at, deleted_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT (id) DO UPDATE SET
			bike_id = EXCLUDED.bike_id,
			category = EXCLUDED.category,
			sub_category = EXCLUDED.sub_category,
			name = EXCLUDED.name,
			current_mileage = EXCLUDED.current_mileage,
			max_resource_km = EXCLUDED.max_resource_km,
			status = EXCLUDED.status,
			updated_at = EXCLUDED.updated_at,
			deleted_at = EXCLUDED.deleted_at
		WHERE components.updated_at <= EXCLUDED.updated_at`

	_, err := r.db.ExecContext(ctx, query,
		component.ID, component.BikeID, component.Category, subCategory,
		component.Name, component.CurrentMileage, component.MaxResourceKm,
		component.Status, component.UpdatedAt, component.DeletedAt)
	return err
}

func (r *PostgresComponentRepository) GetByBikeIDs(ctx context.Context, bikeIDs []uuid.UUID, since *time.Time) ([]domain.Component, error) {
	if len(bikeIDs) == 0 {
		return []domain.Component{}, nil
	}

	// Build $1,$2,... placeholders for UUID list
	placeholders := make([]string, len(bikeIDs))
	args := make([]interface{}, len(bikeIDs))
	for i, id := range bikeIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = id
	}

	query := fmt.Sprintf(`SELECT id, bike_id, category, sub_category, name, current_mileage, max_resource_km, status, updated_at, deleted_at
	          FROM components WHERE bike_id IN (%s)`, strings.Join(placeholders, ","))

	if since != nil {
		query += fmt.Sprintf(` AND updated_at > $%d`, len(bikeIDs)+1)
		args = append(args, since)
	}

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Return an empty JSON array instead of null when there are no rows.
	components := make([]domain.Component, 0)
	for rows.Next() {
		var c domain.Component
		var subCat sql.NullString
		err := rows.Scan(&c.ID, &c.BikeID, &c.Category, &subCat, &c.Name,
			&c.CurrentMileage, &c.MaxResourceKm, &c.Status, &c.UpdatedAt, &c.DeletedAt)
		if err != nil {
			return nil, err
		}
		if subCat.Valid {
			v := domain.ComponentSubCategory(subCat.String)
			c.SubCategory = &v
		}
		components = append(components, c)
	}
	return components, nil
}

func (r *PostgresComponentRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]domain.Component, error) {
	query := `SELECT c.id, c.bike_id, c.category, c.sub_category, c.name, c.current_mileage, 
	                 c.max_resource_km, c.status, c.updated_at, c.deleted_at
	          FROM components c
	          JOIN bicycles b ON c.bike_id = b.id
	          WHERE b.user_id = $1 AND c.deleted_at IS NULL`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Return an empty JSON array instead of null when there are no rows.
	components := make([]domain.Component, 0)
	for rows.Next() {
		var c domain.Component
		var subCat sql.NullString
		err := rows.Scan(&c.ID, &c.BikeID, &c.Category, &subCat, &c.Name,
			&c.CurrentMileage, &c.MaxResourceKm, &c.Status, &c.UpdatedAt, &c.DeletedAt)
		if err != nil {
			return nil, err
		}
		if subCat.Valid {
			v := domain.ComponentSubCategory(subCat.String)
			c.SubCategory = &v
		}
		components = append(components, c)
	}
	return components, nil
}
