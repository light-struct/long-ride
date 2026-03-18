package domain

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Bicycle struct {
	ID           uuid.UUID  `json:"id"`
	UserID       uuid.UUID  `json:"user_id"`
	Name         string     `json:"name"`
	Type         string     `json:"type"`
	TotalMileage float64    `json:"total_mileage"`
	IsActive     bool       `json:"is_active"`
	Version      int        `json:"version"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`
}

type ComponentCategory string
type ComponentSubCategory string
type ComponentStatus string

const (
	CategoryDrivetrain ComponentCategory = "Drivetrain"
	CategoryBrakes     ComponentCategory = "Brakes"
	CategoryWheels     ComponentCategory = "Wheels"
	CategorySuspension ComponentCategory = "Suspension"
	CategoryOther      ComponentCategory = "Other"

	SubCategoryChain     ComponentSubCategory = "Chain"
	SubCategoryCassette  ComponentSubCategory = "Cassette"
	SubCategoryChainring ComponentSubCategory = "Chainring"
	SubCategoryPads      ComponentSubCategory = "Pads"
	SubCategoryRotors    ComponentSubCategory = "Rotors"
	SubCategoryCables    ComponentSubCategory = "Cables"
	SubCategoryTires     ComponentSubCategory = "Tires"
	SubCategoryRims      ComponentSubCategory = "Rims"
	SubCategoryFork      ComponentSubCategory = "Fork"
	SubCategoryShock     ComponentSubCategory = "Shock"

	StatusGreen  ComponentStatus = "Green"
	StatusYellow ComponentStatus = "Yellow"
	StatusRed    ComponentStatus = "Red"
)

type Component struct {
	ID             uuid.UUID             `json:"id"`
	BikeID         uuid.UUID             `json:"bike_id"`
	Category       ComponentCategory     `json:"category"`
	SubCategory    *ComponentSubCategory `json:"sub_category,omitempty"`
	Name           string                `json:"name"`
	CurrentMileage float64               `json:"current_mileage"`
	MaxResourceKm  float64               `json:"max_resource_km"`
	Status         ComponentStatus       `json:"status"`
	UpdatedAt      time.Time             `json:"updated_at"`
	DeletedAt      *time.Time            `json:"deleted_at,omitempty"`
}

type SyncLog struct {
	ID         uuid.UUID `json:"id"`
	UserID     uuid.UUID `json:"user_id"`
	DeviceID   string    `json:"device_id"`
	LastSyncAt time.Time `json:"last_sync_at"`
}

type SyncRequest struct {
	DeviceID   string      `json:"device_id"`
	Bicycles   []Bicycle   `json:"bicycles"`
	Components []Component `json:"components"`
	LastSyncAt *time.Time  `json:"last_sync_at,omitempty"`
}

type SyncResponse struct {
	Bicycles   []Bicycle   `json:"bicycles"`
	Components []Component `json:"components"`
	SyncedAt   time.Time   `json:"synced_at"`
}
