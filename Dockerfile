FROM golang:1.23 AS build

WORKDIR /app
COPY backend/ .

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
