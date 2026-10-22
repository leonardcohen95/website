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

def main():
    sock = connect_via_proxy()
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(TARGET_HOST, port=TARGET_PORT, username=USERNAME, password=PASSWORD, sock=sock, timeout=60)

    cmds = [
        ("mkdir -p /root/ttyd-build && cd /root/ttyd-build && curl -sL -o ttyd https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 && chmod +x ttyd && ls -la ttyd && ./ttyd --version", 120),
        ("cd /root/ttyd-build && KUBECTL_VER=$(curl -sL https://dl.k8s.io/release/stable.txt) && echo \"kubectl version: $KUBECTL_VER\" && curl -sL -o kubectl https://dl.k8s.io/release/$KUBECTL_VER/bin/linux/amd64/kubectl && chmod +x kubectl && ./kubectl version --client", 120),
        ("ls -la /root/ttyd-build/", 10),
    ]
    for c, t in cmds:
        out, err = run(ssh, c, t)
        print(f"===== {c[:80]} =====")
        print(out)
        if err:
            print(f"ERR: {err[:500]}")
    ssh.close()
    sock.close()

if __name__ == "__main__":
    main()
