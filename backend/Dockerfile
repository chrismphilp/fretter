FROM golang:1.23 AS build

WORKDIR /app
COPY / .

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

# Add build args for certificate paths
ARG X509_PUBLIC_CERT_PATH
ARG X509_PRIVATE_CERT_PATH
ENV X509_PUBLIC_CERT_PATH=${X509_PUBLIC_CERT_PATH}
ENV X509_PRIVATE_CERT_PATH=${X509_PRIVATE_CERT_PATH}

# Create directory for certificates
WORKDIR /app

EXPOSE 8080

# Note: X509 cert files should be mounted as volumes at runtime
CMD ["/app/main"]