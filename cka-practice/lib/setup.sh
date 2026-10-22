#!/bin/bash
source /opt/cka/lib/common.sh
ensure_ns(){
  local ns="$1" phase i
  for i in $(seq 1 60); do
    phase=$(kubectl get ns "$ns" -o jsonpath='{.status.phase}' 2>/dev/null)
    case "$phase" in
      Active) break ;;
      "") kubectl create ns "$ns" >/dev/null 2>&1 ;;
      *) sleep 1 ;;
    esac
  done
  kubectl label ns "$ns" cka-practice=true --overwrite >/dev/null 2>&1
}
clean_ns(){
  local ns="$1"
  if kubectl get ns "$ns" -o jsonpath='{.metadata.labels.cka-practice}' 2>/dev/null | grep -q true; then
    kubectl delete ns "$ns" --wait=false >/dev/null 2>&1
  fi
}
