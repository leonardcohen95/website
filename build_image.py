#!/usr/bin/env python3
import paramiko
import socket
import sys

PROXY_HOST = "127.0.0.1"
PROXY_PORT = 18080
TARGET_HOST = "8.138.146.169"
TARGET_PORT = 22
USERNAME = "root"
PASSWORD = "Gmcc@345"

def connect_via_proxy():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(60)
    sock.connect((PROXY_HOST, PROXY_PORT))
    connect_req = f"CONNECT {TARGET_HOST}:{TARGET_PORT} HTTP/1.1\r\nHost: {TARGET_HOST}:{TARGET_PORT}\r\n\r\n"
    sock.sendall(connect_req.encode())
    response = b""
    while b"\r\n\r\n" not in response:
        chunk = sock.recv(4096)
        if not chunk:
            break
        response += chunk
    if b"200" not in response.split(b"\r\n")[0]:
        print(f"Proxy error: {response}")
        sys.exit(1)
    return sock

def run(ssh, cmd, timeout=120):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    return out, err

def upload(ssh, remote_path, content):
    sftp = ssh.open_sftp()
    with sftp.file(remote_path, "w") as f:
        f.write(content)
    sftp.close()

def main():
    sock = connect_via_proxy()
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(TARGET_HOST, port=TARGET_PORT, username=USERNAME, password=PASSWORD, sock=sock, timeout=60)

    # 1. Dockerfile
    dockerfile = '''FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive
COPY ttyd /usr/local/bin/ttyd
COPY kubectl /usr/local/bin/kubectl
RUN chmod +x /usr/local/bin/ttyd /usr/local/bin/kubectl \\
    && apt-get update && apt-get install -y \\
    bash curl wget ca-certificates git vim nano \\
    python3 python3-pip \\
    iputils-ping dnsutils net-tools iproute2 procps \\
    bash-completion unzip jq tree \\
    && rm -rf /var/lib/apt/lists/* \\
    && echo 'source /etc/bash_completion' >> /root/.bashrc \\
    && echo 'export PS1="\\[\\033[01;32m\\]\\u@web-terminal\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ "' >> /root/.bashrc \\
    && echo 'alias ll="ls -la"' >> /root/.bashrc \\
    && echo 'alias grep="grep --color=auto"' >> /root/.bashrc \\
    && echo 'eval "$(kubectl completion bash)"' >> /root/.bashrc \\
    && echo 'export KUBECONFIG=/root/.kube/config' >> /root/.bashrc
WORKDIR /root
EXPOSE 7681
CMD ["ttyd", "-c", "root:Gmcc@345", "-p", "7681", "-t", "titleFixed=Web Terminal", "bash"]
'''
    upload(ssh, "/root/ttyd-build/Dockerfile", dockerfile)
    print("Dockerfile uploaded")

    # 2. Build image
    out, err = run(ssh, "cd /root/ttyd-build && docker build -t web-terminal:latest . 2>&1 | tail -20", 300)
    print("===== docker build =====")
    print(out)
    if err:
        print(f"ERR: {err[:500]}")

    # 3. Import to k3s
    out, err = run(ssh, "docker save web-terminal:latest | k3s ctr images import - 2>&1 | tail -5", 120)
    print("===== k3s import =====")
    print(out)
    if err:
        print(f"ERR: {err[:500]}")

    # 4. Verify image in k3s
    out, err = run(ssh, "k3s ctr images ls 2>/dev/null | grep web-terminal", 30)
    print("===== image check =====")
    print(out)

    ssh.close()
    sock.close()

if __name__ == "__main__":
    main()
