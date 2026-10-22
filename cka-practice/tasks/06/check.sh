#!/bin/bash
source /opt/cka/lib/common.sh
if [ -s "$HOME/resources.yaml" ]; then
  pass "resources.yaml 已创建"
  assert_contains "resources.yaml 含 cert-manager CRD" "certificates.cert-manager.io" "$(cat "$HOME/resources.yaml")"
  assert_not_contains "resources.yaml 未使用 -o 自定义输出" "apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition" "$(head -3 "$HOME/resources.yaml")"
else
  fail "resources.yaml 不存在或为空"
fi
if [ -s "$HOME/subject.yaml" ]; then
  pass "subject.yaml 已创建"
  assert_contains "subject.yaml 含 subject 字段说明" "subject" "$(cat "$HOME/subject.yaml")"
else
  fail "subject.yaml 不存在或为空"
fi
true