package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL          string
	JWTSecret            string
	JWTRefreshSecret     string
	Port                 string
	AIAPIKey             string
	AIapiurl             string
	AIModel              string
	Environment          string
	AllowedOrigins       string
	RateLimitRequests    int
	RateLimitWindow      int
	AIRateLimitRequests  int
	AIRateLimitWindow    int
}

func Load() (*Config, error) {
	godotenv.Load()

	cfg := &Config{
		DatabaseURL:          getEnv("DATABASE_URL", ""),
		JWTSecret:            getEnv("JWT_SECRET", ""),
		JWTRefreshSecret:     getEnv("JWT_REFRESH_SECRET", ""),
		Port:                 getEnv("PORT", "8080"),
		AIAPIKey:             getEnv("AI_API_KEY", ""),
		AIapiurl:             getEnv("AI_API_URL", ""),
		AIModel:              getEnv("AI_MODEL", "openai/gpt-oss-120b"),
		Environment:          getEnv("ENVIRONMENT", "development"),
		AllowedOrigins:       getEnv("ALLOWED_ORIGINS", "*"),
		RateLimitRequests:    getEnvInt("RATE_LIMIT_REQUESTS", 100),
		RateLimitWindow:      getEnvInt("RATE_LIMIT_WINDOW", 60),
		AIRateLimitRequests:  getEnvInt("AI_RATE_LIMIT_REQUESTS", 10),
		AIRateLimitWindow:    getEnvInt("AI_RATE_LIMIT_WINDOW", 60),
	}

	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

func (c *Config) Validate() error {
	if c.DatabaseURL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}
	if c.JWTSecret == "" {
		return fmt.Errorf("JWT_SECRET is required")
	}
	if c.JWTRefreshSecret == "" {
		return fmt.Errorf("JWT_REFRESH_SECRET is required")
	}
	if c.AIAPIKey == "" {
		return fmt.Errorf("AI_API_KEY is required")
	}
	if c.AIapiurl == "" {
		return fmt.Errorf("AI_API_URL is required")
	}
	if c.AIModel == "" {
		return fmt.Errorf("AI_MODEL is required")
	}
	if c.RateLimitRequests <= 0 || c.RateLimitWindow <= 0 {
		return fmt.Errorf("RATE_LIMIT_REQUESTS and RATE_LIMIT_WINDOW must be > 0")
	}
	if c.AIRateLimitRequests <= 0 || c.AIRateLimitWindow <= 0 {
		return fmt.Errorf("AI_RATE_LIMIT_REQUESTS and AI_RATE_LIMIT_WINDOW must be > 0")
	}
	if c.Environment == "production" && c.AllowedOrigins == "*" {
		return fmt.Errorf("ALLOWED_ORIGINS must not be '*' in production")
	}
	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}
