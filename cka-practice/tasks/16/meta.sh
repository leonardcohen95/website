#!/bin/bash
TITLE='cri-dockerd + sysctl 参数配置'
CATEGORY='集群架构'
WEIGHT=0
DESCRIPTION=$(cat <<'CKA_META_EOF'
（理论题）为 kubeadm 准备 Linux 系统：
1. sudo dpkg -i /home/student/cri-dockerd_0.3.6.3-0.ubuntu-jammy_amd64.deb
2. sudo systemctl enable --now cri-docker
3. /etc/sysctl.conf 末尾加：
   net.bridge.bridge-nf-call-iptables = 1
   net.ipv6.conf.all.forwarding = 1
   net.ipv4.ip_forward = 1
   net.netfilter.nf_conntrack_max = 131072
4. sudo sysctl -p
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
sudo dpkg -i cri-dockerd_0.3.6.3-0.ubuntu-jammy_amd64.deb
sudo systemctl enable --now cri-docker
sudo vim /etc/sysctl.conf
sudo sysctl -p
CKA_META_EOF
)
