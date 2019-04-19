package iam

type Resource struct {
	Kind      Kind   `json:"kind,omitempty"`
	Tags      Tags   `json:"tags,omitempty"`
	Name      string `json:"name,omitempty"`
	Namespace string `json:"namespace,omitempty"`
}

func (r Resource) Clone() *Resource {
	return &Resource{
		Tags:      r.Tags.Clone(),
		Kind:      r.Kind,
		Namespace: r.Namespace,
		Name:      r.Name,
	}
}

func (r Resource) Validate() error {
	return nil
}
