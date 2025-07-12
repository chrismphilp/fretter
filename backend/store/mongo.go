package store

import (
	"backend/utils"
	"context"
	"crypto/tls"
	"fmt"
	"github.com/rs/zerolog/log"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"os"
	"time"
)

func InitMongoDB() (*mongo.Database, error) {
	var privateCertContent, publicCertContent string
	var err error

	privateCertPath := os.Getenv("X509_PRIVATE_CERT_PATH")
	publicCertPath := os.Getenv("X509_PUBLIC_CERT_PATH")

	privateSecretName := os.Getenv("X509_PRIVATE_CERT_SECRET")
	publicSecretName := os.Getenv("X509_PUBLIC_CERT_SECRET")

	if privateSecretName != "" && publicSecretName != "" { // If using Secret Manager
		log.Info().Msg("Loading certificates from Secret Manager")
		privateCertContent, err = utils.AccessSecret(privateSecretName)
		if err != nil {
			log.Error().Err(err).Msg("Failed to access private cert secret")
			return nil, err
		}

		publicCertContent, err = utils.AccessSecret(publicSecretName)
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
