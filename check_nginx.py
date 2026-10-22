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

    # Check qbank-web deployment image
    out, err = run(ssh, "kubectl get deploy qbank-web -n qbank -o jsonpath='{.spec.template.spec.containers[0].image}'")
    print(f"qbank-web image: {out}")

    # Check nginx config in qbank-web pod
    out, err = run(ssh, "kubectl exec -n qbank deploy/qbank-web -- cat /etc/nginx/conf.d/default.conf 2>/dev/null || kubectl exec -n qbank deploy/qbank-web -- cat /etc/nginx/nginx.conf 2>/dev/null | head -60")
    print("===== nginx config =====")
    print(out[:3000])

    # Check the index.html served by nginx
    out, err = run(ssh, "kubectl exec -n qbank deploy/qbank-web -- head -30 /usr/share/nginx/html/index.html 2>/dev/null")
    print("===== nginx index.html (first 30 lines) =====")
    print(out)

    # Check if it's a proxy to backend
    out, err = run(ssh, "kubectl exec -n qbank deploy/qbank-web -- grep -r 'proxy_pass' /etc/nginx/ 2>/dev/null | head -10")
    print("===== proxy_pass directives =====")
    print(out)

    ssh.close()
    sock.close()

if __name__ == "__main__":
    main()
