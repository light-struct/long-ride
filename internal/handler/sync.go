package handler

import (
	"encoding/json"
	"net/http"

	"github.com/longride/backend/internal/domain"
	"github.com/longride/backend/internal/middleware"
	"github.com/longride/backend/internal/usecase"
)

type SyncHandler struct {
	syncUseCase *usecase.SyncUseCase
}

func NewSyncHandler(syncUseCase *usecase.SyncUseCase) *SyncHandler {
	return &SyncHandler{syncUseCase: syncUseCase}
}

func (h *SyncHandler) Sync(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req domain.SyncRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	resp, err := h.syncUseCase.Sync(r.Context(), userID, &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
