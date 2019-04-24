FROM node:8 AS nodebuild
WORKDIR /app
ADD web/package.json /app/package.json
ADD web/package-lock.json /app/package-lock.json
ADD web/src/ /app/src
ADD web/tsconfig.json /app/tsconfig.json
ADD web/webpack.config.js /app/webpack.config.js
ADD web/.babelrc /app/.babelrc
RUN npm i
RUN npm run build

FROM golang:1.12 AS gobuild
COPY --from=nodebuild /app/dist /go/dist
WORKDIR /app
ADD vendor/ /app/vendor
ADD pkg/ /app/pkg
ADD cmd/ /app/cmd
ADD go.mod /app/go.mod
RUN go mod tidy
RUN GOPROXY="https://athens.azurefd.net" go get github.com/rakyll/statik
RUN statik -src=/go/dist -dest=/app
RUN CGO_ENABLED=0 GOOS=linux go build -o oiam /app/cmd/oiam/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /
COPY --from=gobuild /app/oiam /oiam
ENTRYPOINT ["/oiam -c /config.yaml"]
