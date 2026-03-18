package usecase

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/longride/backend/internal/repository"
)

type AIUseCase struct {
	componentRepo repository.ComponentRepository
	bikeRepo      repository.BicycleRepository
	apiKey        string
	apiURL        string
	model         string
}

func NewAIUseCase(componentRepo repository.ComponentRepository, bikeRepo repository.BicycleRepository, apiKey, apiURL, model string) *AIUseCase {
	return &AIUseCase{
		componentRepo: componentRepo,
		bikeRepo:      bikeRepo,
		apiKey:        apiKey,
		apiURL:        apiURL,
		model:         model,
	}
}

type AIRequest struct {
	Model    string      `json:"model"`
	Messages []AIMessage `json:"messages"`
}

type AIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type AIResponse struct {
	Choices []struct {
		Message AIMessage `json:"message"`
	} `json:"choices"`
}

func (uc *AIUseCase) Consult(ctx context.Context, userID uuid.UUID, userQuestion string) (string, error) {
	// System prompt guard
	systemPrompt := `You are a bicycle maintenance expert assistant.
Output rules:
- Reply in plain text only (no Markdown).
- Do not use tables.
- Do not use '*' or '-' for bullet formatting; use short sentences instead.`

	// Fetch user's bicycle and component data for context
	components, err := uc.componentRepo.GetByUserID(ctx, userID)
	if err != nil {
		return "", err
	}

	// Build dynamic context
	contextData := "Current bicycle status:\n"
	yellowCount := 0
	redCount := 0

	for _, c := range components {
		if c.Status == "Yellow" {
			yellowCount++
			contextData += fmt.Sprintf("- %s (%s): %.0f/%.0f km (WARNING - needs attention soon)\n",
				c.Name, c.Category, c.CurrentMileage, c.MaxResourceKm)
		} else if c.Status == "Red" {
			redCount++
			contextData += fmt.Sprintf("- %s (%s): %.0f/%.0f km (CRITICAL - replace immediately)\n",
				c.Name, c.Category, c.CurrentMileage, c.MaxResourceKm)
		}
	}

	if yellowCount == 0 && redCount == 0 {
		contextData += "All components are in good condition (Green status).\n"
	}

	// Prepare AI request
	aiReq := AIRequest{
		Model: uc.model,
		Messages: []AIMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "system", Content: contextData},
			{Role: "user", Content: userQuestion},
		},
	}

	reqBody, err := json.Marshal(aiReq)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", uc.apiURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	apiKey := strings.TrimSpace(uc.apiKey)
	apiKey = strings.TrimPrefix(apiKey, "Bearer ")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("AI API error: %s", string(body))
	}

	var aiResp AIResponse
	if err := json.Unmarshal(body, &aiResp); err != nil {
		return "", err
	}

	if len(aiResp.Choices) == 0 {
		return "", fmt.Errorf("no response from AI")
	}

	return aiResp.Choices[0].Message.Content, nil
}
