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
    sock.settimeout(30)
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

def run(ssh, cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=60)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    return out, err

def main():
    sock = connect_via_proxy()
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(TARGET_HOST, port=TARGET_PORT, username=USERNAME, password=PASSWORD, sock=sock, timeout=30)

    cmds = [
        "which docker nerdctl buildah podman 2>/dev/null; echo '---runtime done---'",
        "docker --version 2>/dev/null; nerdctl --version 2>/dev/null; echo '---ver done---'",
        "kubectl get pods -n kube-system -l k8s-app=kube-dns -o name 2>/dev/null",
        "cat /var/lib/rancher/k3s/agent/etc/containerd/config.toml 2>/dev/null | grep -i 'systemd_cgroup\|disable' | head -5",
    ]
    for c in cmds:
        out, err = run(ssh, c)
        print(f"===== {c} =====")
        print(out)
        if err:
            print(f"ERR: {err}")
    ssh.close()
    sock.close()

if __name__ == "__main__":
    main()
