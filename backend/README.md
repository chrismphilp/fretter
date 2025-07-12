# Fretter Backend

This document provides instructions on how to build, run, and develop the backend service for Fretter.

## Prerequisites

- **Go**: Version 1.23 or higher.
- **Docker**: For running the application in a containerized environment.
- **MongoDB Atlas Account**: The application is configured to connect to a MongoDB Atlas cluster using X.509 authentication.

## Local Development (with Hot-Reload)

For a fast development loop, we recommend running the application directly on your host machine using `air`, a tool for live-reloading Go applications.

### 1. Install `air`

If you don't have `air` installed, you can install it with the following command:
```sh
go install github.com/air-verse/air@latest
```
> **Note**: The `go install` command installs binaries to `$GOPATH/bin` or `$HOME/go/bin`. If this directory is not in your shell's `PATH`, you will need to call `air` using its full path (e.g., `~/go/bin/air`).

### 2. Obtain Certificates

You need X.509 certificates to authenticate with MongoDB Atlas. Place your `X509-cert-public.pem` and `X509-cert-private.pem` files in this `backend` directory.

### 3. Run the Application

Navigate to the `backend` directory and run the following command. This assumes your certificate files are in the current (`backend`) directory.

```sh
X509_PUBLIC_CERT_PATH="./X509-cert-public.pem" \
X509_PRIVATE_CERT_PATH="./X509-cert-private.pem" \
~/go/bin/air
```

`air` will start the server on port `8080`. It will automatically recompile and restart the application whenever you make changes to Go source files.

## Running with Docker

You can also run the application inside a Docker container. This is useful for testing the production environment or for isolated deployments.

### 1. Build the Docker Image

From the `backend` directory, build the Docker image:
```bash
docker build -t fretter-backend .
```

### 2. Run the Docker Container

Run the container, making sure to mount your X.509 certificates as volumes and pass their paths as environment variables. The command below uses `$(pwd)` to create absolute paths from your current directory, which is required for volume mounting.

```sh
docker run --rm -p 8080:8080 \
  -v "$(pwd)/X509-cert-public.pem:/certs/public.pem" \
  -v "$(pwd)/X509-cert-private.pem:/certs/private.pem" \
  -e X509_PUBLIC_CERT_PATH="/certs/public.pem" \
  -e X509_PRIVATE_CERT_PATH="/certs/private.pem" \
  fretter-backend
```

The application will be accessible at `http://localhost:8080`. 