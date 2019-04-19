package storage

import "errors"

func New(config *Config) (Interface, error) {
	if config.Redis != nil {
		return NewRedis(config.Redis.Addr, config.Redis.Password, config.Redis.DB)
	}
	return nil, errors.New("no storage provider is configured")
}
