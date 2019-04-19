package common

type Action string

func (a Action) String() string {
	return string(a)
}

const (
	ActionList   Action = "list"
	ActionGet    Action = "get"
	ActionPut    Action = "put"
	ActionDelete Action = "delete"
)

var AllActions = []Action{
	ActionList,
	ActionGet,
	ActionPut,
	ActionDelete,
}
