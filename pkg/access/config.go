package access

import "time"

type Config struct {
	ConditionFallback *ConditionFallbackConfig `yaml:"condition_fallback"`
}

type ConditionFallbackConfig struct {
	URL     string        `yaml:"url"`
	Timeout time.Duration `yaml:"timeout"`
}
