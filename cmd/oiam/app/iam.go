package app

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	"github.com/joesonw/oiam/pkg/common"
	"github.com/joesonw/oiam/pkg/iam"
	"github.com/joesonw/oiam/pkg/sts"
)

func (s *Server) serveIAM(res http.ResponseWriter, req *http.Request, token *sts.Token) {
	parts := strings.Split(req.URL.Path, "/")[1:]

	resBody := response{}
	err := errors.New("not found")
	errCode := 404
	defer func() {
		if err != nil {
			resBody.Data = nil
			resBody.Message = err.Error()
		} else {
			errCode = 200
		}
		b, _ := json.Marshal(resBody)
		res.Header().Set("Content-Type", "application/json")
		res.WriteHeader(errCode)
		_, err = res.Write(b)
		if err != nil {
			log.Printf("unable to write to resposne: %s", err.Error())
		}
	}()
	defer req.Body.Close()

	if len(parts) < 4 {
		return
	}

	namespace := strings.ToLower(parts[1])
	kindName := strings.ToLower(parts[2])
	name := strings.ToLower(parts[3])

	metadata := iam.Metadata{
		Namespace: namespace,
		Name:      name,
		Kind:      iam.Kind(kindName),
	}

	action := "undefined"
	switch req.Method {
	case http.MethodGet:
		action = "list"
		if name != "" {
			action = "get"
		}
	case http.MethodDelete:
		action = "delete"
	case http.MethodPut:
		action = "put"
	}

	err = s.stsClient.Access(req.Context(), token.ID, action, metadata.Ref())
	if err != nil {
		return
	}

	controller, ok := s.nameToController[metadata.Kind]
	if !ok {
		return
	}

	ctx := req.Context()
	for k, values := range req.Header {
		for _, v := range values {
			ctx = common.AddHeaderToContext(ctx, k, v)
		}
	}

	switch req.Method {
	case http.MethodGet:
		if name != "" {
			var result iam.Interface
			result, err = controller.Get(ctx, metadata)
			if err != nil {
				errCode = 500
				return
			}
			resBody.Data = result
		} else {
			var result []iam.Interface
			params := make(iam.Params).AppendValues(req.URL.Query())
			in := controller.New().SetParams(params)
			result, err = controller.List(ctx, metadata, in.GetParams())
			if err != nil {
				errCode = 500
				return
			}
			resBody.Data = result
		}
	case http.MethodPost, http.MethodPut:
		{
			var b []byte
			b, err = ioutil.ReadAll(req.Body)
			if err != nil {
				errCode = 400
				return
			}
			in := controller.New()
			err = json.Unmarshal(b, in)
			if err != nil {
				errCode = 400
				return
			}
			if in.GetMetadata().Namespace != metadata.Namespace || in.GetMetadata().Name != metadata.Name || !in.GetMetadata().Kind.Equal(metadata.Kind) {
				err = errors.New("metadata not matched")
				errCode = 400
				return
			}
			err = controller.PreFlightCheck(ctx, in)
			if err != nil {
				errCode = 400
				return
			}
			err = controller.Put(ctx, in)
			if err != nil {
				errCode = 500
				return
			}
			resBody.Data = in
		}
	case http.MethodDelete:
		if name != "" {
			err = controller.Delete(ctx, metadata)
			if err != nil {
				errCode = 500
			}
		}
	}
}
