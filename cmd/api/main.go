package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/longride/backend/internal/config"
	"github.com/longride/backend/internal/handler"
	"github.com/longride/backend/internal/middleware"
	"github.com/longride/backend/internal/repository"
	"github.com/longride/backend/internal/usecase"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	// Initialize repositories
	userRepo := repository.NewPostgresUserRepository(db)
	bikeRepo := repository.NewPostgresBicycleRepository(db)
	componentRepo := repository.NewPostgresComponentRepository(db)
	syncLogRepo := repository.NewPostgresSyncLogRepository(db)

	// Initialize use cases
	authUseCase := usecase.NewAuthUseCase(userRepo, cfg.JWTSecret, cfg.JWTRefreshSecret)
	syncUseCase := usecase.NewSyncUseCase(bikeRepo, componentRepo, syncLogRepo)
	aiUseCase := usecase.NewAIUseCase(componentRepo, bikeRepo, cfg.AIAPIKey, cfg.AIapiurl, cfg.AIModel)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authUseCase)
	syncHandler := handler.NewSyncHandler(syncUseCase)
	aiHandler := handler.NewAIHandler(aiUseCase)
	workshopHandler := handler.NewWorkshopHandler()

	// Initialize middleware
	globalRateLimiter := middleware.NewRateLimiter(cfg.RateLimitRequests, cfg.RateLimitWindow)
	aiRateLimiter := middleware.NewRateLimiter(cfg.AIRateLimitRequests, cfg.AIRateLimitWindow)
	authMiddleware := middleware.AuthMiddleware(cfg.JWTSecret)
	corsMiddleware := middleware.CORSMiddleware(cfg.AllowedOrigins)

	// Setup router
	r := mux.NewRouter()

	// Apply global middleware
	r.Use(corsMiddleware)
	r.Use(globalRateLimiter.Middleware)

	log.Printf("CORS allowed origins: %s", cfg.AllowedOrigins)

	// Public routes
	r.HandleFunc("/v1/auth/register", authHandler.Register).Methods("POST", "OPTIONS")
	r.HandleFunc("/v1/auth/login", authHandler.Login).Methods("POST", "OPTIONS")
	r.HandleFunc("/v1/auth/refresh", authHandler.RefreshToken).Methods("POST", "OPTIONS")

	// Protected routes
	protected := r.PathPrefix("/v1").Subrouter()
	protected.Use(authMiddleware)

	protected.HandleFunc("/sync", syncHandler.Sync).Methods("POST", "OPTIONS")
	protected.HandleFunc("/workshops", workshopHandler.GetWorkshops).Methods("GET", "OPTIONS")

	// AI route with additional rate limiting
	aiRouter := protected.PathPrefix("/ai").Subrouter()
	aiRouter.Use(aiRateLimiter.Middleware)
	aiRouter.HandleFunc("/consult", aiHandler.Consult).Methods("POST", "OPTIONS")

	// Health check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server starting on %s", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
