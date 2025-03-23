FROM golang:1.23 AS build

WORKDIR /app
COPY backend/ .

# Install certificates and set environment variables for robust downloads
RUN apt-get update && apt-get install -y ca-certificates
ENV GOPROXY=https://proxy.golang.org,direct
ENV GO111MODULE=on
ENV GOSUMDB=off
ENV GOTOOLCHAIN=auto

RUN go build -o main .

# Run stage
FROM gcr.io/distroless/base-debian12

WORKDIR /app
COPY --from=build /app/main /app/

# Create directory for certificates (will be mounted at runtime)
WORKDIR /app/certs
WORKDIR /app

EXPOSE 8080

# Note: X509 cert files should be mounted as volumes at runtime
CMD ["/app/main"]
