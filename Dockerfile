FROM golang:1.22 AS build

WORKDIR /app
COPY backend/ .

# Install certificates and set GOPROXY environment
RUN apt-get update && apt-get install -y ca-certificates
ENV GOPROXY=direct
ENV GO111MODULE=on
ENV GOSUMDB=off

# Download dependencies
RUN go mod download
RUN go build -o main .

# Run stage
FROM gcr.io/distroless/base-debian12

WORKDIR /app
COPY --from=build /app/main /app/
COPY backend/X509-cert-public.pem /app/
COPY backend/X509-cert-private.pem /app/

EXPOSE 8080

CMD ["/app/main"]
