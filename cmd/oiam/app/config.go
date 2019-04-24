package app

import (
	"github.com/joesonw/oiam.io/pkg/access"
	"github.com/joesonw/oiam.io/pkg/storage"
	"github.com/joesonw/oiam.io/pkg/sts"
)

type Config struct {
	STS     *sts.Config     `yaml:"sts"`
	Storage *storage.Config `yaml:"storage"`
	Access  *access.Config  `yaml:"access"`
	Port    int             `yaml:"port"`
}
