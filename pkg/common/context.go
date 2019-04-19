package common

import (
	"context"
	"net/url"
)

type ContextKey int

const (
	ContextHeader ContextKey = iota
)

func AddHeaderToContext(ctx context.Context, key, value string) context.Context {
	var headers url.Values
	headersIn := ctx.Value(ContextHeader)
	if headersIn == nil {
		headers = make(url.Values)
	} else {
		h, ok := headersIn.(url.Values)
		if !ok {
			headers = make(url.Values)
		} else {
			headers = h
		}
	}
	headers.Add(key, value)
	return context.WithValue(ctx, ContextHeader, headers)
}

func SetHeaderToContext(ctx context.Context, key, value string) context.Context {
	var headers url.Values
	headersIn := ctx.Value(ContextHeader)
	if headersIn == nil {
		headers = make(url.Values)
	} else {
		h, ok := headersIn.(url.Values)
		if !ok {
			headers = make(url.Values)
		} else {
			headers = h
		}
	}
	headers.Set(key, value)
	return context.WithValue(ctx, ContextHeader, headers)
}

func GetHeaderFromContext(ctx context.Context, key string) string {
	headersIn := ctx.Value(ContextHeader)
	if headersIn == nil {
		return ""
	}
	headers, ok := headersIn.(url.Values)
	if !ok {
		return ""
	}
	return headers.Get(key)
}
