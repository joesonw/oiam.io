package common

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

type WebhookRequest struct {
	Action string      `json:"action,omitempty"`
	Body   interface{} `json:"body,omitempty"`
}

type WebhookClient struct {
	httpClient *http.Client
}

func NewWebhookClient(timeout time.Duration) (*WebhookClient, error) {
	return &WebhookClient{httpClient: &http.Client{Timeout: timeout}}, nil
}

func (wc *WebhookClient) Do(ctx context.Context, url, action string, reqIn, resIn interface{}) error {
	reqBody := WebhookRequest{
		Action: action,
		Body:   reqIn,
	}
	reqBytes, err := json.Marshal(&reqBody)
	if err != nil {
		return err
	}
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(reqBytes))
	if err != nil {
		return err
	}

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Requester", "oiam.io")

	res, err := wc.httpClient.Do(req.WithContext(ctx))
	if err != nil {
		return err
	}
	defer res.Body.Close()

	resBytes, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return err
	}

	if res.StatusCode != 200 {
		return fmt.Errorf("(%d): %s", res.StatusCode, string(resBytes))
	}

	if resIn != nil {
		err = json.Unmarshal(resBytes, resIn)
		if err != nil {
			return err
		}
	}

	return nil
}
