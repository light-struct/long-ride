package handler

import (
	"encoding/json"
	"net/http"

	"github.com/longride/backend/internal/middleware"
	"github.com/longride/backend/internal/usecase"
)

type AIHandler struct {
	aiUseCase *usecase.AIUseCase
}

func NewAIHandler(aiUseCase *usecase.AIUseCase) *AIHandler {
	return &AIHandler{aiUseCase: aiUseCase}
}

type AIConsultRequest struct {
	Question string `json:"question"`
}

type AIConsultResponse struct {
	Answer string `json:"answer"`
}

func (h *AIHandler) Consult(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req AIConsultRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.Question == "" {
		http.Error(w, "question is required", http.StatusBadRequest)
		return
	}

	answer, err := h.aiUseCase.Consult(r.Context(), userID, req.Question)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AIConsultResponse{Answer: answer})
}
