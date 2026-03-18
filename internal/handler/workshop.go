package handler

import (
	"encoding/json"
	"net/http"
)

type WorkshopHandler struct{}

func NewWorkshopHandler() *WorkshopHandler {
	return &WorkshopHandler{}
}

type Workshop struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Address   string  `json:"address"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Distance  float64 `json:"distance"`
	Rating    float64 `json:"rating"`
	Phone     string  `json:"phone"`
}

func (h *WorkshopHandler) GetWorkshops(w http.ResponseWriter, r *http.Request) {
	lat := r.URL.Query().Get("lat")
	lng := r.URL.Query().Get("lng")

	if lat == "" || lng == "" {
		http.Error(w, "latitude and longitude are required", http.StatusBadRequest)
		return
	}

	// Mock data - integrate with real maps API in production
	workshops := []Workshop{
		{
			ID:        "1",
			Name:      "Bike Pro Service",
			Address:   "123 Main St, City",
			Latitude:  40.7128,
			Longitude: -74.0060,
			Distance:  1.2,
			Rating:    4.5,
			Phone:     "+1234567890",
		},
		{
			ID:        "2",
			Name:      "Cycle Masters",
			Address:   "456 Oak Ave, City",
			Latitude:  40.7580,
			Longitude: -73.9855,
			Distance:  2.8,
			Rating:    4.8,
			Phone:     "+1234567891",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workshops)
}
