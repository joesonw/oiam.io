package common

import (
	"regexp"
	"strings"
)

var camelNumberSequence = regexp.MustCompile(`([a-zA-Z])(\d+)([a-zA-Z]?)`)
var camelNumberReplacement = []byte(`$1 $2 $3`)

func camelAddWordBoundariesToNumbers(s string) string {
	b := []byte(s)
	b = camelNumberSequence.ReplaceAll(b, camelNumberReplacement)
	return string(b)
}

// Converts a string to CamelCase
func toCamelInitCase(s string, initCase bool) string {
	s = camelAddWordBoundariesToNumbers(s)
	s = strings.Trim(s, " ")
	n := ""
	capNext := initCase
	for _, v := range s {
		if v >= 'A' && v <= 'Z' {
			n += string(v)
		}
		if v >= '0' && v <= '9' {
			n += string(v)
		}
		if v >= 'a' && v <= 'z' {
			if capNext {
				n += strings.ToUpper(string(v))
			} else {
				n += string(v)
			}
		}
		if v == '_' || v == ' ' || v == '-' {
			capNext = true
		} else {
			capNext = false
		}
	}
	return n
}

func StringToCamel(s string) string {
	if s == "" {
		return s
	}
	if r := rune(s[0]); r >= 'A' && r <= 'Z' {
		s = strings.ToLower(string(r)) + s[1:]
	}
	return toCamelInitCase(s, false)
}
