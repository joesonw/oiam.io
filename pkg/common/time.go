package common

import "time"

const timeParseLayout = "2006-01-02T15:04:05-0700"

func ParseTime(s string) (time.Time, error) {
	return time.Parse(timeParseLayout, s)
}

func StringTime(t time.Time) string {
	return t.Format(timeParseLayout)
}

func CloneTime(t *time.Time) *time.Time {
	if t == nil {
		return nil
	}
	ms := t.Unix()
	ns := int64(t.Nanosecond())
	r := time.Unix(ms, ns)
	return &r
}
