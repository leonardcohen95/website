#!/bin/bash
source /opt/cka/lib/common.sh

# 题目用到的命名空间收集器（供 cka start 展示部署摘要）
CKA_NS_LIST="${CKA_NS_LIST:-}"
record_ns(){
  local ns="$1"
  case " $CKA_NS_LIST " in
    *" $ns "*) ;;
    *) CKA_NS_LIST="${CKA_NS_LIST} $ns" ;;
  esac
  export CKA_NS_LIST
}

ensure_ns(){
  local ns="$1" phase i
  record_ns "$ns"
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

# 部署摘要：列出本题涉及的命名空间 + 关键资源（setup.sh 退出前自动执行）
show_deploy_summary(){
  [ -z "$CKA_NS_LIST" ] && return 0
  local found=0
  local ids_to_show=""
  local ns
  for ns in $CKA_NS_LIST; do
    [ -z "$ns" ] && continue
    # default 命名空间里有题库本身的服务，不展示以免干扰
    [ "$ns" = "default" ] && continue
    ids_to_show="$ids_to_show $ns"
    found=1
  done
  [ $found -eq 0 ] && return 0
  echo ""
  echo "${C_YEL}────── 部署摘要 ──────${C_RST}"
  for ns in $ids_to_show; do
    if [ "$ns" = "default" ]; then
      echo "${C_BOLD}命名空间：${C_RST}${C_CYAN}default${C_RST}（集群默认）"
    else
      echo "${C_BOLD}命名空间：${C_RST}${C_CYAN}${ns}${C_RST}"
    fi
    local total running
    total=$(kubectl get pods -n "$ns" --no-headers 2>/dev/null | wc -l)
    running=$(kubectl get pods -n "$ns" --no-headers 2>/dev/null | awk '/Running/{c++} END{print c+0}')
    echo "    ${C_DIM}Pod 总数 ${total} / Running ${running}${C_RST}"
    local ds=$(kubectl get deploy -n "$ns" --no-headers 2>/dev/null | wc -l)
    local svcs=$(kubectl get svc -n "$ns" --no-headers 2>/dev/null | wc -l)
    local hpas=$(kubectl get hpa -n "$ns" --no-headers 2>/dev/null | wc -l)
    [ "$ds"   -gt 0 ] && echo "    ${C_DIM}Deployment ${ds}${C_RST}"
    [ "$svcs" -gt 0 ] && echo "    ${C_DIM}Service    ${svcs}${C_RST}"
    [ "$hpas" -gt 0 ] && echo "    ${C_DIM}HPA        ${hpas}${C_RST}"
  done
  echo "${C_DIM}用 ${C_RST}kubectl get all -n <ns>${C_DIM} 查看具体资源${C_RST}"
  echo ""
}

clean_ns(){
  local ns="$1"
  if kubectl get ns "$ns" -o jsonpath='{.metadata.labels.cka-practice}' 2>/dev/null | grep -q true; then
    kubectl delete ns "$ns" --wait=false >/dev/null 2>&1
  fi
}

# setup.sh 结束前自动打印部署摘要（通过 trap 只在正常退出时触发）
trap 'show_deploy_summary' EXIT
