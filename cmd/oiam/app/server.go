package app

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/joesonw/oiam/pkg/controller"
	"github.com/joesonw/oiam/pkg/iam"
	"github.com/joesonw/oiam/pkg/sts"
	_ "github.com/joesonw/oiam/statik" // static files
	"github.com/rakyll/statik/fs"
)

type response struct {
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
}

type Server struct {
	nameToController map[iam.Kind]controller.Interface
	stsClient        sts.Interface
	publicHandler    http.Handler
}

func New(stsClient sts.Interface) (*Server, error) {
	statik, err := fs.New()
	if err != nil {
		return nil, err
	}

	return &Server{
		nameToController: make(map[iam.Kind]controller.Interface),
		stsClient:        stsClient,
		publicHandler:    http.StripPrefix("/public/", http.FileServer(statik)),
	}, nil
}

func (s *Server) Register(controllerInterface controller.Interface) {
	s.nameToController[controllerInterface.Kind()] = controllerInterface
}

func (s *Server) Start(host string, port int) error {
	return http.ListenAndServe(fmt.Sprintf("%s:%d", host, port), s)
}

func (s *Server) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	if req.URL.Path == "/" || req.URL.Path == "/public" {
		http.Redirect(res, req, "/public/", http.StatusTemporaryRedirect)
		return
	}

	if strings.HasPrefix(req.RequestURI, "/public/") {
		s.publicHandler.ServeHTTP(res, req)
		return
	}

	if strings.HasPrefix(req.RequestURI, "/oauth/") {
		return
	}

	res.Header().Set("Access-Control-Allow-Origin", req.Header.Get("Origin"))
	res.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE")
	if req.Method == http.MethodOptions {
		res.Header().Set("Access-Control-Allow-Headers", req.Header.Get("Access-Control-Request-Headers"))
		res.WriteHeader(200)
		_, err := res.Write(nil)
		if err != nil {
			log.Printf("unable to write to resposne: %s", err.Error())
		}
		return
	}

	var token *sts.Token

	if !strings.HasPrefix(req.RequestURI, "/sts/auth") {
		tokenID := req.Header.Get("X-Authorization-Token")
		var err error
		token, err = s.stsClient.Retrieve(req.Context(), tokenID)
		if err != nil {
			http.Error(res, `{"message":"UnAuthorized"}`, http.StatusUnauthorized)
			return
		}
	}

	if strings.HasPrefix(req.RequestURI, "/iam") {
		s.serveIAM(res, req, token)
		return
	}

	if strings.HasPrefix(req.RequestURI, "/sts") {
		s.serveSTS(res, req, token)
		return
	}
	http.Error(res, "not found", 404)
}
