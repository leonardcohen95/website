FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive

# CKA 考场同款工具集：vim 是必须的（kubectl edit 默认编辑器）
RUN apt-get update && apt-get install -y --no-install-recommends \
    ttyd curl wget ca-certificates bash git \
    vim vim-runtime less tree nano \
    python3 python3-yaml jq \
    iproute2 net-tools dnsutils iputils-ping procps \
    bash-completion unzip tar gzip \
    && rm -rf /var/lib/apt/lists/*

# kubectl / helm（宿主机自带二进制，避免构建时外网下载超时）
COPY kubectl /usr/local/bin/kubectl
COPY linux-amd64/helm /usr/local/bin/helm
RUN chmod +x /usr/local/bin/kubectl /usr/local/bin/helm

# CKA 练习框架
COPY cka-practice /opt/cka
RUN ln -sf /opt/cka/bin/cka /usr/local/bin/cka && \
    echo 'source /opt/cka/etc/cka.bashrc 2>/dev/null' >> /root/.bashrc && \
    echo 'source /etc/bash_completion' >> /root/.bashrc && \
    echo 'export EDITOR=vim' >> /root/.bashrc

# 自定义前端：加复制/粘贴工具栏
COPY index.html /opt/ttyd/index.html

ENV EDITOR=vim KUBE_EDITOR=vim
WORKDIR /root
ENTRYPOINT ["ttyd", "-W", "-c", "root:Gmcc@345", "-p", "7681", "-b", "/terminal", \
            "-I", "/opt/ttyd/index.html", \
            "-t", "titleFixed=CKA 练习终端", "bash"]
