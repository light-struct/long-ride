package middleware

import (
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type RateLimiter struct {
	visitors map[string]*rate.Limiter
	mu       sync.RWMutex
	r        rate.Limit
	b        int
}

func NewRateLimiter(requests int, window int) *RateLimiter {
	return &RateLimiter{
		visitors: make(map[string]*rate.Limiter),
		r:        rate.Limit(float64(requests) / float64(window)),
		b:        requests,
	}
}

func (rl *RateLimiter) getLimiter(ip string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	limiter, exists := rl.visitors[ip]
	if !exists {
		limiter = rate.NewLimiter(rl.r, rl.b)
		rl.visitors[ip] = limiter
	}

	return limiter
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	go rl.cleanupVisitors()
	
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr
		limiter := rl.getLimiter(ip)

		if !limiter.Allow() {
			http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (rl *RateLimiter) cleanupVisitors() {
	for {
		time.Sleep(time.Minute)
		rl.mu.Lock()
		rl.visitors = make(map[string]*rate.Limiter)
		rl.mu.Unlock()
	}
}
