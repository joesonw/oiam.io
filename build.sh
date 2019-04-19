#!/bin/bash

echo "---- CLEAN -----"
rm -f oiam

echo "---- TEST -----"
(cd web; npm run lint)


echo "---- BUILD -----"
(cd web; npm run build)
statik -src=./web/dist
go build ./cmd/oiam/main.go -o oiam

