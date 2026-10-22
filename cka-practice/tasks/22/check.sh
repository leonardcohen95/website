#!/bin/bash
source /opt/cka/lib/common.sh
if [ -s /opt/KULM00201/foo ]; then
  pass "文件 /opt/KULM00201/foo 已创建"
  BAD=$(grep -vc "unable-to-access-website" /opt/KULM00201/foo || true)
  assert_eq "文件内每行都包含关键字" "0" "${BAD:-0}"
  N=$(wc -l < /opt/KULM00201/foo)
  assert_ge "提取了多条匹配日志" 3 "${N:-0}"
else
  fail "/opt/KULM00201/foo 不存在或为空"
fi
true