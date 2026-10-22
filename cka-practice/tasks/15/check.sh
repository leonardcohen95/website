#!/bin/bash
source /opt/cka/lib/common.sh

pass "理论题：kubeadm + 外部 etcd 迁移损坏修复步骤"
pass "当前 k3s 单节点用 sqlite 做后端，无法真实复现 kubeadm 的外部 etcd 场景"
pass "执行 cka done 15 标记完成"

true
