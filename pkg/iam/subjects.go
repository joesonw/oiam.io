package iam

func parseParamsToRefs(prefix string, params Params) []Ref {
	maxLength := 0
	for _, v := range params {
		if len(v) > maxLength {
			maxLength = len(v)
		}
	}
	refs := make([]Ref, maxLength)
	for i := 0; i < maxLength; i++ {
		refs[i] = Ref{}
	}
	for k, values := range params {
		switch k {
		case prefix + "name":
			for i, v := range values {
				ref := refs[i].Clone()
				ref.Name = v
				refs[i] = *ref
			}
		case prefix + "namespace":
			for i, v := range values {
				ref := refs[i].Clone()
				ref.Namespace = v
				refs[i] = *ref
			}
		case prefix + "kind":
			for i, v := range values {
				ref := refs[i].Clone()
				ref.Kind = Kind(v)
				refs[i] = *ref
			}
		}
	}
	return refs
}
