package main

import (
	"context"
	"crypto/tls"
	"fmt"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"os"
	"time"

	"backend/controller"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var mongoClient *mongo.Client
var tabController *controller.TabController

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339})

	err := initMongoDB()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to init mongodb")
		return
	}

	router := gin.Default()
	router.Use(corsMiddleware())
	router.GET("/", indexHandler)
	tabController.SetupRoutes(router)

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

func initMongoDB() error {
	privateCertPath := os.Getenv("X509_PRIVATE_CERT_PATH")
	if privateCertPath == "" {
		workDir, err := os.Getwd()
		if err != nil {
			log.Error().Err(err).Msg("Failed to get working directory")
			return err
		}
		privateCertPath = fmt.Sprintf("%s/X509-cert-private.pem", workDir)
		log.Info().Str("privateCertPath", privateCertPath).Msg("Using absolute certificate path")
	}

	if _, err := os.Stat(privateCertPath); os.IsNotExist(err) {
		log.Error().Str("privateCertPath", privateCertPath).Err(err).Msg("X509 private certificate file not found")
		return err
	}

	publicCertPath := os.Getenv("X509_PUBLIC_CERT_PATH")
	if publicCertPath == "" {
		workDir, err := os.Getwd()
		if err != nil {
			log.Error().Err(err).Msg("Failed to get working directory")
			return err
		}
		publicCertPath = fmt.Sprintf("%s/X509-cert-public.pem", workDir)
		log.Info().Str("publicCertPath", publicCertPath).Msg("Using absolute certificate path")
	}

	if _, err := os.Stat(publicCertPath); os.IsNotExist(err) {
		log.Error().Str("publicCertPath", publicCertPath).Err(err).Msg("X509 public certificate file not found")
		return err
	}

	cert, err := tls.LoadX509KeyPair(publicCertPath, privateCertPath)
	if err != nil {
		log.Error().Err(err).Msg("Failed to load X509 key pair")
		return err
	}

	tlsConfig := &tls.Config{
		Certificates: []tls.Certificate{cert},
	}

	auth := options.Credential{
		AuthMechanism: "MONGODB-X509",
	}

	uri := "mongodb+srv://fretter.usmjg.mongodb.net/?appName=fretter"
	log.Info().Str("uri", uri).Msg("Connecting to MongoDB")

	serverAPIOptions := options.ServerAPI(options.ServerAPIVersion1)
	clientOptions := options.Client().
		ApplyURI(uri).
		SetAppName("fretter").
		SetAuth(auth).
		SetTLSConfig(tlsConfig).
		SetServerAPIOptions(serverAPIOptions)

	log.Debug().Msg("Attempting to connect to MongoDB...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	mongoClient, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Error().Err(err).Msg("Failed to connect to MongoDB")
		return err
	}

	pingCtx, pingCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer pingCancel()

	log.Debug().Msg("Pinging MongoDB...")
	if err = mongoClient.Ping(pingCtx, readpref.Primary()); err != nil {
		log.Error().Err(err).Msg("MongoDB ping failed but connection may still be usable")
		return err
	}
	log.Info().Msg("Successfully pinged MongoDB")

	database := mongoClient.Database("fretter")
	tabController = controller.NewTabController(database)

	return nil
}

func indexHandler(c *gin.Context) {
	c.String(200, "Fretter API Server")
}
