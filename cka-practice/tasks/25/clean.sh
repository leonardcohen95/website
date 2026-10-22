#!/bin/bash
rm -f "$HOME/argo-helm.yaml"
helm repo remove argo >/dev/null 2>&1 || true
true