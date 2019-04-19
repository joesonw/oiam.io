package common

import (
	"io/ioutil"

	"github.com/spf13/pflag"
	"gopkg.in/yaml.v2"

	"reflect"
	"strings"
	"time"
)

var (
	durationType = reflect.TypeOf(time.Duration(0))
)

type configPair struct {
	in   interface{}
	typ  reflect.Type
	name string
}

func ParseConfig(in interface{}) {
	var configPath string
	pflag.StringVarP(&configPath, "config", "c", "", "config file path")
	paris := parseConfig(nil, in)
	pflag.Parse()

	println(configPath)
	if configPath != "" {
		bytes, err := ioutil.ReadFile(configPath)
		if err != nil {
			panic(err)
		}
		err = yaml.Unmarshal(bytes, in)
		if err != nil {
			panic(err)
		}
	}

	for _, pair := range paris {
		val := reflect.ValueOf(pair.in).Elem()
		if !IsReflectValueZero(val) {
			if pair.typ == durationType {
				dur, err := time.ParseDuration(*(pair.in.(*string)))
				if err != nil {
					panic(err)
				}
				val = reflect.ValueOf(dur)
			}
			Set(in, val.Interface(), strings.Split(pair.name, ".")...)
		}
	}
}

func parseConfig(parent []string, in interface{}) []*configPair {
	val := reflect.ValueOf(in)
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
	}

	typ := val.Type()
	numField := typ.NumField()
	var pairs []*configPair

	for i := 0; i < numField; i++ {
		field := typ.Field(i)
		fieldKind := field.Type.Kind()
		usage := field.Tag.Get("usage")

		key := field.Tag.Get("yaml")
		name := strings.Join(append(parent, key), ".")
		var in interface{}

		switch fieldKind {
		case reflect.Bool:
			{
				var p bool
				in = &p
				pflag.BoolVar(&p, name, false, usage)
			}
		case reflect.String:
			{
				var p string
				in = &p
				pflag.StringVar(&p, name, "", usage)
			}
		case reflect.Int:
			{
				var p int
				in = &p
				pflag.IntVar(&p, name, 0, usage)
			}
		case reflect.Ptr:
			pairs = append(pairs, parseConfig(append(parent, key), reflect.New(field.Type.Elem()).Interface())...)
		case reflect.Slice:
			{
				sliceKind := field.Type.Elem().Kind()
				switch sliceKind {
				case reflect.Bool:
					{
						var p []bool
						in = &p
						pflag.BoolSliceVar(&p, name, nil, usage)
					}
				case reflect.String:
					{
						var p []string
						in = &p
						pflag.StringSliceVar(&p, name, nil, usage)
					}
				case reflect.Int:
					{
						var p []int
						in = &p
						pflag.IntSliceVar(&p, name, nil, usage)
					}
				}
			}
		default:
			if field.Type == durationType {
				var p string
				in = &p
				pflag.StringVar(&p, name, "", usage)
			}
		}
		if in != nil {
			pairs = append(pairs, &configPair{in: in, typ: field.Type, name: name})
		}
	}

	return pairs
}
