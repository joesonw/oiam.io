package storage

import "errors"

var (
	ErrNotFound = errors.New("not found")
)

type Config struct {
	Redis *RedisConfig `yaml:"redis"`
	ETCD  *ETCDConfig  `yaml:"etcd"`
}

type RedisConfig struct {
	Addr     string `yaml:"addr"`
	Password string `yaml:"password"`
	DB       int    `yaml:"db"`
}

type ETCDConfig struct {
	Endpoints []string `yaml:"endpoints"`
	Username  string   `yaml:"username"`
	Password  string   `yaml:"password"`
}
