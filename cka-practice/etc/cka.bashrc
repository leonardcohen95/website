#!/bin/bash
# CKA 练习终端欢迎信息与便捷配置（每次打开终端显示）

export KUBECONFIG="${KUBECONFIG:-/root/.kube/config}"
export CKA_ROOT="${CKA_ROOT:-/opt/cka}"
export PATH="/opt/cka/bin:$PATH"

alias k=kubectl 2>/dev/null
alias kk='kubectl get pods -A -o wide'
command -v kubectl >/dev/null 2>&1 && complete -F __start_kubectl k 2>/dev/null

if [ -t 1 ] && [ -z "$CKA_BANNER_SHOWN" ]; then
  export CKA_BANNER_SHOWN=1
  total=$(ls -d "$CKA_ROOT"/tasks/*/ 2>/dev/null | wc -l)
  done_n=$(grep -cv '^$' /root/work/.cka/progress.txt 2>/dev/null || echo 0)
  echo ""
  echo -e "  \033[36m\033[1m╔══════════════════════════════════════════════════════╗\033[0m"
  echo -e "  \033[36m\033[1m║           CKA 真题练习终端 · 自动评分系统           ║\033[0m"
  echo -e "  \033[36m\033[1m╚══════════════════════════════════════════════════════╝\033[0m"
  echo -e "  进度：\033[32m${done_n}/${total}\033[0m 题通过    工作目录：\033[33m/root/work\033[0m（已持久化）"
  echo -e "  \033[2m当前集群：\033[0m$(kubectl config current-context 2>/dev/null)  \033[2m节点：\033[0m$(kubectl get nodes --no-headers 2>/dev/null | wc -l)"
  echo ""
  echo -e "  \033[36mcka list\033[0m          查看全部题目与进度"
  echo -e "  \033[36mcka desc 01\033[0m       查看题目要求"
  echo -e "  \033[36mcka start 01\033[0m      部署该题初始环境"
  echo -e "  \033[36mcka check 01\033[0m      自动评分，检验答案"
  echo -e "  \033[36mcka hint 01\033[0m       查看提示"
  echo -e "  \033[36mcka score\033[0m         查看总分与及格情况"
  echo ""
fi
