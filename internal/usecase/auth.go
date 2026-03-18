package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/longride/backend/internal/domain"
	"github.com/longride/backend/internal/repository"
)

type AuthUseCase struct {
	userRepo         repository.UserRepository
	jwtSecret        string
	jwtRefreshSecret string
}

func NewAuthUseCase(userRepo repository.UserRepository, jwtSecret, jwtRefreshSecret string) *AuthUseCase {
	return &AuthUseCase{
		userRepo:         userRepo,
		jwtSecret:        jwtSecret,
		jwtRefreshSecret: jwtRefreshSecret,
	}
}

func (uc *AuthUseCase) Register(ctx context.Context, email, password string) (*domain.User, error) {
	user := &domain.User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: repository.HashPassword(password),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	
	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}
	
	return user, nil
}

func (uc *AuthUseCase) Login(ctx context.Context, email, password string) (string, string, uuid.UUID, error) {
	user, err := uc.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return "", "", uuid.Nil, fmt.Errorf("invalid credentials")
	}

	if !repository.VerifyPassword(password, user.PasswordHash) {
		return "", "", uuid.Nil, fmt.Errorf("invalid credentials")
	}

	accessToken, err := uc.generateToken(user.ID, 15*time.Minute, uc.jwtSecret)
	if err != nil {
		return "", "", uuid.Nil, err
	}

	refreshToken, err := uc.generateToken(user.ID, 7*24*time.Hour, uc.jwtRefreshSecret)
	if err != nil {
		return "", "", uuid.Nil, err
	}

	return accessToken, refreshToken, user.ID, nil
}

func (uc *AuthUseCase) RefreshToken(ctx context.Context, refreshToken string) (string, error) {
	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(refreshToken, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(uc.jwtRefreshSecret), nil
	})

	if err != nil || !token.Valid {
		return "", fmt.Errorf("invalid refresh token")
	}

	userID, err := uuid.Parse(claims.Subject)
	if err != nil {
		return "", err
	}

	return uc.generateToken(userID, 15*time.Minute, uc.jwtSecret)
}

func (uc *AuthUseCase) generateToken(userID uuid.UUID, duration time.Duration, secret string) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   userID.String(),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
