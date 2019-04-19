package common

import "reflect"

func IsReflectValueZero(val reflect.Value) bool {
	return reflect.DeepEqual(val.Interface(), reflect.Zero(val.Type()).Interface())
}

func Get(in interface{}, keys ...string) interface{} {
	if in == nil {
		return nil
	}

	if len(keys) == 0 {
		return nil
	}

	val := reflect.ValueOf(in)
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
	}

	typ := val.Type()
	numField := typ.NumField()
	key := keys[0]

	index := -1
	for i := 0; i < numField; i++ {
		fieldType := typ.Field(i)
		if fieldType.Name == key || fieldType.Tag.Get("yaml") == key || fieldType.Tag.Get("json") == key || fieldType.Tag.Get("key") == key || StringToCamel(fieldType.Name) == key {
			index = i
			break
		}
	}

	if index == -1 {
		return nil
	}

	field := val.Field(index)
	if len(keys) > 1 {
		return Get(field.Interface(), keys[1:]...)
	}
	return field.Interface()
}

func Set(in, value interface{}, keys ...string) {
	if len(keys) == 0 {
		return
	}

	val := reflect.ValueOf(in)
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
	}

	typ := val.Type()
	numField := typ.NumField()
	key := keys[0]

	index := -1
	for i := 0; i < numField; i++ {
		fieldType := typ.Field(i)
		if fieldType.Name == key || fieldType.Tag.Get("yaml") == key || fieldType.Tag.Get("json") == key || fieldType.Tag.Get("key") == key || StringToCamel(fieldType.Name) == key {
			index = i
			break
		}
	}

	if index == -1 {
		return
	}

	field := val.Field(index)

	if len(keys) > 1 {
		if field.IsNil() {
			field.Set(reflect.New(typ.Field(index).Type.Elem()))
		}
		Set(field.Interface(), value, keys[1:]...)
		return
	}
	field.Set(reflect.ValueOf(value))
}
