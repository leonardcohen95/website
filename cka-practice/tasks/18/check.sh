#!/bin/bash
source /opt/cka/lib/common.sh
if [ -s "$HOME/custom-columns.txt" ]; then
  T=$(cat "$HOME/custom-columns.txt")
  assert_contains "包含列名 POD_NAME" "POD_NAME" "$T"
  assert_contains "包含列名 POD_STATUS" "POD_STATUS" "$T"
  LINES=$(echo "$T" | grep -c "nginx-demo")
  assert_ge "列出了 nginx Pod 行" 2 "${LINES:-0}"
else
  fail "~/custom-columns.txt 不存在或为空"
fi
true