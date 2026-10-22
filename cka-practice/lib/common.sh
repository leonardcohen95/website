#!/bin/bash
# CKA 练习共同库
CKA_ROOT="${CKA_ROOT:-/opt/cka}"
WORKDIR="${WORKDIR:-/root/work}"
PROGRESS_DIR="$WORKDIR/.cka"
PROGRESS_FILE="$PROGRESS_DIR/progress.txt"

C_GREEN=$'\033[32m'; C_RED=$'\033[31m'; C_YEL=$'\033[33m'
C_CYAN=$'\033[36m'; C_BOLD=$'\033[1m'; C_DIM=$'\033[2m'; C_RST=$'\033[0m'

pass(){ echo "RESULT|1|$1"; }
fail(){ echo "RESULT|0|$1"; }

# assert_eq 描述 期望 实际
assert_eq(){
  if [ "$2" = "$3" ]; then pass "$1"; else fail "$1   ${C_DIM}(期望:[$2] 实际:[$3])${C_RST}"; fi
}
# assert_contains 描述 子串 全文
assert_contains(){
  case "$3" in *"$2"*) pass "$1";; *) fail "$1   ${C_DIM}(缺少:[$2])${C_RST}";; esac
}
# assert_not_contains 描述 子串 全文
assert_not_contains(){
  case "$3" in *"$2"*) fail "$1   ${C_DIM}(不应包含:[$2])${C_RST}";; *) pass "$1";; esac
}
# assert_ge 描述 期望(>=) 实际
assert_ge(){
  if [ "${3:-0}" -ge "$2" ] 2>/dev/null; then pass "$1"; else fail "$1   ${C_DIM}(期望>=$2 实际:${3:-空})${C_RST}"; fi
}

k(){ kubectl "$@" 2>/dev/null; }

progress_count(){
  [ -f "$PROGRESS_FILE" ] && grep -cv '^$' "$PROGRESS_FILE" 2>/dev/null || echo 0
}

# 按显示宽度右补空格（中文按 2 列）
padw(){
  python3 -c '
import sys,unicodedata
s,w=sys.argv[1],int(sys.argv[2])
dw=sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in s)
sys.stdout.write(s+" "*max(0,w-dw))
' "$1" "$2"
}

mark_done(){
  mkdir -p "$PROGRESS_DIR"
  local id="$1"
  grep -qx "$id" "$PROGRESS_FILE" 2>/dev/null || echo "$id" >> "$PROGRESS_FILE"
}
is_done(){ grep -qx "$1" "$PROGRESS_FILE" 2>/dev/null; }

# assert_ne 描述 不应等于 实际
assert_ne(){
  if [ "$2" != "$3" ]; then pass "$1"; else fail "$1   ${C_DIM}(不应等于:[$2])${C_RST}"; fi
}
