#!/bin/bash
source /opt/cka/lib/common.sh

I=$(kubectl get ingress echo -n sound-repeater -o json 2>/dev/null)
if [ -z "$I" ]; then fail "Ingress echo 不存在"; else
  assert_eq "host=example.org" "example.org" "$(echo "$I" | jq -r '.spec.rules[0].host')"
  assert_eq "path=/echo" "/echo" "$(echo "$I" | jq -r '.spec.rules[0].http.paths[0].path')"
  assert_eq "pathType=Prefix" "Prefix" "$(echo "$I" | jq -r '.spec.rules[0].http.paths[0].pathType')"
  assert_eq "backend service=echoserver-service" "echoserver-service" "$(echo "$I" | jq -r '.spec.rules[0].http.paths[0].backend.service.name')"
  assert_eq "backend port=8080" "8080" "$(echo "$I" | jq -r '.spec.rules[0].http.paths[0].backend.service.port.number')"
fi

true
