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

def run(ssh, cmd, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    return out, err

def main():
    sock = connect_via_proxy()
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(TARGET_HOST, port=TARGET_PORT, username=USERNAME, password=PASSWORD, sock=sock, timeout=60)

    # Find deploy script and qbank source
    cmds = [
        "ls /root/deploy_turtle7.sh 2>/dev/null && head -60 /root/deploy_turtle7.sh",
        "find / -name 'index.html' -path '*questions*' 2>/dev/null | head -10",
        "find / -name 'Dockerfile' -path '*qbank*' 2>/dev/null | head -10",
        "find /root -maxdepth 3 -name '*.sh' 2>/dev/null | head -20",
    ]
    for c in cmds:
        out, err = run(ssh, c)
        print(f"===== {c[:70]} =====")
        print(out[:2000])
        if err:
            print(f"ERR: {err[:300]}")

    # Check qbank-web pod to find index.html location
    out, err = run(ssh, "kubectl exec -n qbank deploy/qbank-web -- ls /usr/share/nginx/html/ 2>/dev/null | head -20")
    print("===== qbank-web nginx html =====")
    print(out)

    out, err = run(ssh, "kubectl exec -n qbank deploy/qbank-web -- find / -name 'index.html' 2>/dev/null | head -10")
    print("===== qbank-web index.html locations =====")
    print(out)

    ssh.close()
    sock.close()

if __name__ == "__main__":
    main()
