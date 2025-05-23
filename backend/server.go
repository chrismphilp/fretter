package main

import (
	"context"
	"crypto/tls"
	"fmt"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"os"
	"time"

	"backend/controller"
	secretmanager "cloud.google.com/go/secretmanager/apiv1"
	"cloud.google.com/go/secretmanager/apiv1/secretmanagerpb"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// accessSecret retrieves a secret from Secret Manager
func accessSecret(secretName string) (string, error) {
	ctx := context.Background()
	client, err := secretmanager.NewClient(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to create secretmanager client: %v", err)
	}
	defer client.Close()

	req := &secretmanagerpb.AccessSecretVersionRequest{
		Name: secretName,
	}
	result, err := client.AccessSecretVersion(ctx, req)
	if err != nil {
		return "", fmt.Errorf("failed to access secret version: %v", err)
	}

	return string(result.Payload.Data), nil
}

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339})

	database, err := initMongoDB()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to init mongodb")
		return
	}

	router := gin.Default()
	router.Use(corsMiddleware())
	router.GET("/", indexHandler)

	tabController := controller.NewTabController(database)
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

func initMongoDB() (*mongo.Database, error) {
	var privateCertContent, publicCertContent string
	var err error

	privateCertPath := os.Getenv("X509_PRIVATE_CERT_PATH")
	publicCertPath := os.Getenv("X509_PUBLIC_CERT_PATH")

	privateSecretName := os.Getenv("X509_PRIVATE_CERT_SECRET")
	publicSecretName := os.Getenv("X509_PUBLIC_CERT_SECRET")

	if privateSecretName != "" && publicSecretName != "" { // If using Secret Manager
		log.Info().Msg("Loading certificates from Secret Manager")
		privateCertContent, err = accessSecret(privateSecretName)
		if err != nil {
			log.Error().Err(err).Msg("Failed to access private cert secret")
			return nil, err
		}

		publicCertContent, err = accessSecret(publicSecretName)
		if err != nil {
			log.Error().Err(err).Msg("Failed to access public cert secret")
			return nil, err
		}
		log.Info().Msg("Successfully loaded certificates from Secret Manager")
	} else if privateCertPath != "" && publicCertPath != "" { // If using file paths
		log.Info().Msg("Loading certificates from file paths")

		if _, err := os.Stat(privateCertPath); os.IsNotExist(err) {
			log.Error().Str("privateCertPath", privateCertPath).Err(err).Msg("X509 private certificate file not found")
			return nil, err
		}
		privateBytes, err := os.ReadFile(privateCertPath)
		if err != nil {
			log.Error().Err(err).Msg("Failed to read private cert file")
			return nil, err
		}
		privateCertContent = string(privateBytes)

		if _, err := os.Stat(publicCertPath); os.IsNotExist(err) {
			log.Error().Str("publicCertPath", publicCertPath).Err(err).Msg("X509 public certificate file not found")
			return nil, err
		}
		publicBytes, err := os.ReadFile(publicCertPath)
		if err != nil {
			log.Error().Err(err).Msg("Failed to read public cert file")
			return nil, err
		}
		publicCertContent = string(publicBytes)

		log.Info().Msg("Successfully loaded certificates from file paths")
	} else {
		log.Error().Msg("No certificate source specified")
		return nil, fmt.Errorf("no certificate source specified")
	}

	// Use the cert content directly
	cert, err := tls.X509KeyPair([]byte(publicCertContent), []byte(privateCertContent))
	if err != nil {
		log.Error().Err(err).Msg("Failed to load X509 key pair")
		return nil, err
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

	mongoClient, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Error().Err(err).Msg("Failed to connect to MongoDB")
		return nil, err
	}

	pingCtx, pingCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer pingCancel()

	log.Debug().Msg("Pinging MongoDB...")
	if err = mongoClient.Ping(pingCtx, readpref.Primary()); err != nil {
		log.Error().Err(err).Msg("MongoDB ping failed but connection may still be usable")
		return nil, err
	}
	log.Info().Msg("Successfully pinged MongoDB")

	database := mongoClient.Database("fretter")

	return database, nil
}

func indexHandler(c *gin.Context) {
	c.String(200, "Fretter API Server")
}
