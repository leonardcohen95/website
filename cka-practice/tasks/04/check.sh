#!/bin/bash
source /opt/cka/lib/common.sh

SC=$(kubectl get storageclass ran-local-path -o json 2>/dev/null)
if [ -z "$SC" ]; then fail "StorageClass ran-local-path 不存在"; else
  assert_eq "provisioner=rancher.io/local-path" "rancher.io/local-path" "$(echo "$SC" | jq -r '.provisioner')"
  assert_eq "volumeBindingMode=WaitForFirstConsumer" "WaitForFirstConsumer" "$(echo "$SC" | jq -r '.volumeBindingMode')"
  assert_eq "annotation is-default-class=true" "true" "$(echo "$SC" | jq -r '.metadata.annotations["storageclass.kubernetes.io/is-default-class"] // ""')"
fi

true
