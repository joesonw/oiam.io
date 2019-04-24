package app

import (
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"log"
	"sort"
	"strings"
)

func SignParams(params map[string]interface{}, secret string) string {
	var keys []string
	for key := range params {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	paris := make([]string, len(keys))
	for i, key := range keys {
		paris[i] = fmt.Sprintf("%s=%v", key, params[key])
	}
	str := strings.Join(paris, "&") + secret
	h := sha1.New()
	_, err := h.Write([]byte(str))
	if err != nil {
		log.Printf("unable to write to hash: %s", err.Error())
	}
	return hex.EncodeToString(h.Sum(nil))
}
