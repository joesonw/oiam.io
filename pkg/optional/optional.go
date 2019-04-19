package optional

import "time"

func String(str string) *string {
	return &str
}

func Time(t time.Time) *time.Time {
	return &t
}
