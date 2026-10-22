#!/usr/bin/env python3
# 生成 CKA 练习环境的公共库 + 主命令

LIB_COMMON = r'''#!/bin/bash
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

mark_done(){
  mkdir -p "$PROGRESS_DIR"
  local id="$1"
  grep -qx "$id" "$PROGRESS_FILE" 2>/dev/null || echo "$id" >> "$PROGRESS_FILE"
}
is_done(){ grep -qx "$1" "$PROGRESS_FILE" 2>/dev/null; }
'''

BIN_CKA = r'''#!/bin/bash
# cka —— CKA 真题练习与自动评分工具
CKA_ROOT="${CKA_ROOT:-/opt/cka}"
export CKA_ROOT WORKDIR="${WORKDIR:-/root/work}"
source "$CKA_ROOT/lib/common.sh" 2>/dev/null

list_tasks(){
  local dirs=$(ls -d "$CKA_ROOT"/tasks/*/ 2>/dev/null | sort)
  echo ""
  printf "${C_BOLD}%-4s %-34s %-16s %-6s %-6s${C_RST}\n" "ID" "题目" "分类" "分值" "状态"
  echo "----------------------------------------------------------------------------------"
  for d in $dirs; do
    local meta="$d/meta.sh"
    [ -f "$meta" ] || continue
    ( source "$meta"
      local id=$(basename "$d" | cut -d- -f1)
      local st="${C_DIM}未做${C_RST}"
      is_done "$id" && st="${C_GREEN}已通过${C_RST}"
      printf "%-4s %-34s %-16s %-6s %b\n" "$id" "$TITLE" "$CATEGORY" "$WEIGHT" "$st"
    )
  done
  echo "----------------------------------------------------------------------------------"
  local total=$(ls -d "$CKA_ROOT"/tasks/*/ 2>/dev/null | wc -l)
  local done=$(wc -l < "$PROGRESS_FILE" 2>/dev/null || echo 0)
  echo "  进度：${C_BOLD}$done / $total${C_RST} 题通过"
  echo "  用法：${C_CYAN}cka desc <ID>${C_RST} 看题 · ${C_CYAN}cka start <ID>${C_RST} 出题 · ${C_CYAN}cka check <ID>${C_RST} 评分 · ${C_CYAN}cka hint <ID>${C_RST} 提示 · ${C_CYAN}cka clean <ID>${C_RST} 清理"
  echo ""
}

find_task_dir(){
  local id="$1"
  local d=$(ls -d "$CKA_ROOT"/tasks/"$id"*/ 2>/dev/null | head -1)
  [ -n "$d" ] && echo "$d" || return 1
}

cmd_desc(){
  local d=$(find_task_dir "$1") || { echo "找不到题目 $1，用 cka list 查看"; exit 1; }
  ( source "$d/meta.sh"
    echo ""
    echo "${C_BOLD}${C_CYAN}【题 $1】$TITLE${C_RST}  ${C_DIM}($CATEGORY · ${WEIGHT}分)${C_RST}"
    echo "────────────────────────────────────────────────────────────"
    echo "$DESCRIPTION"
    echo ""
  )
}

cmd_start(){
  local d=$(find_task_dir "$1") || { echo "找不到题目 $1"; exit 1; }
  echo "${C_YEL}==> 正在部署题 $1 的初始环境 ...${C_RST}"
  bash "$d/setup.sh"
  echo ""
  cmd_desc "$1"
  echo "${C_GREEN}环境就绪。开始操作吧，完成后运行：${C_BOLD}cka check $1${C_RST}"
  echo "${C_DIM}（如需重来：cka reset $1）${C_RST}"
}

cmd_check(){
  local d=$(find_task_dir "$1") || { echo "找不到题目 $1"; exit 1; }
  echo "${C_YEL}==> 正在检查题 $1 ...${C_RST}"
  echo "────────────────────────────────────────────────────────────"
  local out
  out=$(bash "$d/check.sh")
  local passed=0 total=0
  while IFS='|' read -r tag ok msg; do
    [ "$tag" = "RESULT" ] || continue
    total=$((total+1))
    if [ "$ok" = "1" ]; then
      passed=$((passed+1)); echo "  ${C_GREEN}✔${C_RST} $msg"
    else
      echo "  ${C_RED}✘${C_RST} $msg"
    fi
  done <<< "$out"
  echo "────────────────────────────────────────────────────────────"
  ( source "$d/meta.sh"
    local score=$(( passed * 100 / (total>0?total:1) ))
    local w=$(( passed * WEIGHT / (total>0?total:1) ))
    if [ "$passed" -eq "$total" ] && [ "$total" -gt 0 ]; then
      echo "${C_GREEN}${C_BOLD}🎉 全部通过！得分 ${score}%（本机有效分值 ${w}/${WEIGHT}）${C_RST}"
      mark_done "$1"
    elif [ "$score" -ge 70 ]; then
      echo "${C_YEL}${C_BOLD}部分通过 ${passed}/${total}（${score}%）。修正标红项后重跑 cka check $1${C_RST}"
    else
      echo "${C_RED}未通过 ${passed}/${total}（${score}%）。运行 cka hint $1 看提示${C_RST}"
    fi
  )
}

cmd_hint(){
  local d=$(find_task_dir "$1") || { echo "找不到题目 $1"; exit 1; }
  ( source "$d/meta.sh"; echo ""; echo "${C_CYAN}💡 提示（题 $1）：${C_RST}"; echo "$HINT"; echo "" )
}

cmd_reset(){
  local d=$(find_task_dir "$1") || { echo "找不到题目 $1"; exit 1; }
  echo "${C_YEL}==> 重置题 $1 环境 ...${C_RST}"
  bash "$d/clean.sh" >/dev/null 2>&1
  bash "$d/setup.sh"
  echo "${C_GREEN}已重置，环境重新就绪。${C_RST}"
}

cmd_clean(){
  local d=$(find_task_dir "$1") || { echo "找不到题目 $1"; exit 1; }
  echo "${C_YEL}==> 清理题 $1 资源 ...${C_RST}"
  bash "$d/clean.sh"
  echo "${C_GREEN}已清理。${C_RST}"
}

case "$1" in
  list|ls)   list_tasks ;;
  desc)      cmd_desc "$2" ;;
  start)     cmd_start "$2" ;;
  check)     cmd_check "$2" ;;
  hint)      cmd_hint "$2" ;;
  reset)     cmd_reset "$2" ;;
  clean)     cmd_clean "$2" ;;
  *)
    echo ""
    echo "${C_BOLD}${C_CYAN}  CKA 真题练习环境${C_RST}"
    echo "  ──────────────────────────────────────────────"
    echo "  cka list            列出全部题目与进度"
    echo "  cka desc  <ID>      查看题目要求"
    echo "  cka start <ID>      部署某题的初始环境"
    echo "  cka check <ID>      自动评分（检验答案）"
    echo "  cka hint  <ID>      查看解题提示"
    echo "  cka reset <ID>      重置该题环境"
    echo "  cka clean <ID>      清理该题资源"
    echo ""
    echo "  ${C_DIM}示例：cka start 01 && cka check 01${C_RST}"
    echo ""
    ;;
esac
'''

import os
base = "/workspace/cka-practice"
os.makedirs(f"{base}/lib", exist_ok=True)
os.makedirs(f"{base}/bin", exist_ok=True)
with open(f"{base}/lib/common.sh", "w") as f:
    f.write(LIB_COMMON)
with open(f"{base}/bin/cka", "w") as f:
    f.write(BIN_CKA)
print("lib/common.sh and bin/cka generated")
