package app

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/joesonw/oiam.io/pkg/iam"
	"github.com/joesonw/oiam.io/pkg/sts"
)

type authRequest struct {
	Key                string `json:"key,omitempty"`
	DurationSeconds    int64  `json:"durationSeconds,omitempty"`
	CurrentTimeSeconds int64  `json:"currentTimeSeconds,omitempty"`
	Nonce              string `json:"nonce,omitempty"`
	Signature          string `json:"signature,omitempty"`
}

type assumeRequest struct {
	Name            string  `json:"name,omitempty"`
	DurationSeconds int64   `json:"durationSeconds,omitempty"`
	Role            iam.Ref `json:"role,omitempty"`
}

type accessRequest struct {
	Service iam.Ref `json:"service,omitempty"`
	Action  string  `json:"action,omitempty"`
}

func (s *Server) serveSTS(res http.ResponseWriter, req *http.Request, token *sts.Token) {
	parts := strings.Split(req.URL.Path, "/")[2:]

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

	if req.Method != http.MethodPost {
		return
	}

	if len(parts) < 1 {
		return
	}

	var reqBody []byte
	reqBody, err = ioutil.ReadAll(req.Body)
	if err != nil {
		return
	}

	name := strings.ToLower(parts[0])
	switch name {
	case "auth":
		{
			r := authRequest{}
			err = json.Unmarshal(reqBody, &r)
			if err != nil {
				return
			}

			var credential *sts.Credential
			credential, err = s.stsClient.FindCredential(req.Context(), r.Key)
			if err != nil {
				return
			}

			params := map[string]interface{}{
				"key":                r.Key,
				"durationSeconds":    r.DurationSeconds,
				"currentTimeSeconds": r.CurrentTimeSeconds,
				"nonce":              r.Nonce,
			}
			sig := SignParams(params, credential.Secret)
			if sig != r.Signature {
				err = errors.New("unauthenticated")
				return
			}

			token, err = s.stsClient.Grant(req.Context(), r.Key, time.Hour)
			if err != nil {
				return
			}

			resBody.Data = token
			return
		}
	case "assume":
		{
			r := assumeRequest{}
			err = json.Unmarshal(reqBody, &r)
			if err != nil {
				return
			}

			svc := iam.Ref{
				Namespace: "oiam.io",
				Name:      "sts",
				Kind:      iam.KindService,
				Tags:      make(iam.Tags).Add("role.name", r.Role.Name).Add("role.namespace", r.Role.Namespace),
			}
			err = s.stsClient.Access(req.Context(), token.ID, "assume", svc)
			if err != nil {
				return
			}

			params := map[string]interface{}{
				"name":     r.Name,
				"duration": r.DurationSeconds,
			}

			{
				var b []byte
				b, err = json.Marshal(r.Role)
				if err != nil {
					return
				}
				params["role"] = string(b)
			}

			fmt.Println()

			var cred *sts.Credential
			cred, err = s.stsClient.Assume(req.Context(), r.Name, time.Second*time.Duration(r.DurationSeconds), r.Role)
			if err != nil {
				return
			}
			resBody.Data = cred
		}
	case "access":
		{
			r := accessRequest{}
			err = json.Unmarshal(reqBody, &r)
			if err != nil {
				return
			}

			svc := r.Service.Clone()
			svc.Kind = iam.KindService

			err = s.stsClient.Access(req.Context(), token.ID, r.Action, *svc)
			if err != nil {
				return
			}

			resBody.Data = "ok"
		}
	}
}
