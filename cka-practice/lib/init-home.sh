#!/bin/bash
# 首次启动时把镜像内的默认家目录文件播种到持久化卷
TARGET="${1:-/data}"
mkdir -p "$TARGET"
if [ ! -f "$TARGET/.bashrc" ]; then
  cp -a /root/.bashrc "$TARGET/.bashrc" 2>/dev/null || true
  cp -a /root/.profile "$TARGET/.profile" 2>/dev/null || true
fi
# 家目录配置只保留一份“挂载/引用”，避免新镜像的改动被旧文件挡住
grep -q 'cka/etc/cka.bashrc' "$TARGET/.bashrc" 2>/dev/null || \
  echo 'source /opt/cka/etc/cka.bashrc 2>/dev/null' >> "$TARGET/.bashrc"
mkdir -p "$TARGET/work" "$TARGET/work/.cka"
exit 0
