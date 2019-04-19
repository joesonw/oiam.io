package common

import (
	"encoding/base64"

	uuid "github.com/satori/go.uuid"
)

func UUIDHash() string {
	s := base64.StdEncoding.EncodeToString(uuid.NewV4().Bytes())
	return s[:len(s)-2]
}
