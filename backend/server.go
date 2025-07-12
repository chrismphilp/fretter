package main

import (
	"backend/store"
	"os"
	"time"

	"backend/controller"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339})

	database, err := store.InitMongoDB()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to init mongodb")
		return
	}

	router := gin.Default()
	router.Use(corsMiddleware())
	router.GET("/", indexHandler)

	tc := controller.NewTabController(database)
	controller.SetupRoutes(router, tc)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Info().Msgf("Defaulting to port %s", port)
	}

	log.Info().Msgf("Listening on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal().Err(err).Msg("Failed to start server")
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func indexHandler(c *gin.Context) {
	c.String(200, "Fretter API Server")
}
