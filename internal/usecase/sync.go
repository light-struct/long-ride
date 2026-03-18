package usecase

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/longride/backend/internal/domain"
	"github.com/longride/backend/internal/repository"
)

type SyncUseCase struct {
	bikeRepo      repository.BicycleRepository
	componentRepo repository.ComponentRepository
	syncLogRepo   repository.SyncLogRepository
}

func NewSyncUseCase(
	bikeRepo repository.BicycleRepository,
	componentRepo repository.ComponentRepository,
	syncLogRepo repository.SyncLogRepository,
) *SyncUseCase {
	return &SyncUseCase{
		bikeRepo:      bikeRepo,
		componentRepo: componentRepo,
		syncLogRepo:   syncLogRepo,
	}
}

func (uc *SyncUseCase) Sync(ctx context.Context, userID uuid.UUID, req *domain.SyncRequest) (*domain.SyncResponse, error) {
	// Get last sync timestamp for this device
	lastSync, err := uc.syncLogRepo.GetByUserDevice(ctx, userID, req.DeviceID)
	if err != nil {
		return nil, err
	}

	var lastSyncTime *time.Time
	if lastSync != nil {
		lastSyncTime = &lastSync.LastSyncAt
	}

	// Process incoming bicycles from client (upsert with conflict resolution)
	for _, bike := range req.Bicycles {
		bike.UserID = userID // Ensure ownership
		if err := uc.bikeRepo.Upsert(ctx, &bike); err != nil {
			return nil, err
		}
	}

	// Process incoming components from client
	for _, component := range req.Components {
		if err := uc.componentRepo.Upsert(ctx, &component); err != nil {
			return nil, err
		}
	}

	// Fetch server changes since last sync
	serverBikes, err := uc.bikeRepo.GetByUserID(ctx, userID, lastSyncTime)
	if err != nil {
		return nil, err
	}

	// Extract bike IDs for component query
	bikeIDs := make([]uuid.UUID, len(serverBikes))
	for i, bike := range serverBikes {
		bikeIDs[i] = bike.ID
	}

	serverComponents, err := uc.componentRepo.GetByBikeIDs(ctx, bikeIDs, lastSyncTime)
	if err != nil {
		return nil, err
	}

	// Update sync log
	now := time.Now()
	syncLog := &domain.SyncLog{
		ID:         uuid.New(),
		UserID:     userID,
		DeviceID:   req.DeviceID,
		LastSyncAt: now,
	}
	if err := uc.syncLogRepo.Upsert(ctx, syncLog); err != nil {
		return nil, err
	}

	return &domain.SyncResponse{
		Bicycles:   serverBikes,
		Components: serverComponents,
		SyncedAt:   now,
	}, nil
}
