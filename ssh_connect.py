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
    # Connect to HTTP proxy
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(15)
    sock.connect((PROXY_HOST, PROXY_PORT))
    # Send CONNECT request
    connect_req = f"CONNECT {TARGET_HOST}:{TARGET_PORT} HTTP/1.1\r\nHost: {TARGET_HOST}:{TARGET_PORT}\r\n\r\n"
    sock.sendall(connect_req.encode())
    # Read proxy response
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

def run_command(ssh, cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=15)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    print(f"$ {cmd}")
    if out:
        print(out)
    if err:
        print(f"STDERR: {err}")
    print("---")

def main():
    sock = connect_via_proxy()
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(TARGET_HOST, port=TARGET_PORT, username=USERNAME, password=PASSWORD, sock=sock, timeout=15)
    print("=== SSH Connected ===")
    run_command(ssh, "uname -a")
    run_command(ssh, "hostname")
    run_command(ssh, "kubectl get ns 2>/dev/null | head -20")
    run_command(ssh, "kubectl get pods -n qbank 2>/dev/null")
    run_command(ssh, "kubectl get ingress -n qbank 2>/dev/null")
    run_command(ssh, "which ttyd wetty gotty 2>/dev/null; echo '---web tools check done---'")
    ssh.close()
    sock.close()

if __name__ == "__main__":
    main()
