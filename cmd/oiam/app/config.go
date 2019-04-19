package app

import (
	"oiam.io/pkg/access"
	"oiam.io/pkg/storage"
	"oiam.io/pkg/sts"
)

type Config struct {
	STS     *sts.Config     `yaml:"sts"`
	Storage *storage.Config `yaml:"storage"`
	Access  *access.Config  `yaml:"access"`
	Port    int             `yaml:"port"`
}
