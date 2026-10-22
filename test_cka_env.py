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

    # Test kubectl from inside the web-terminal pod
    tests = [
        ("kubectl cluster-info", "kubectl cluster-info 2>&1 | head -10"),
        ("kubectl get nodes", "kubectl get nodes -o wide"),
        ("kubectl get ns", "kubectl get ns"),
        ("kubectl auth can-i", "kubectl auth can-i create pods --all-namespaces; kubectl auth can-i delete nodes"),
        ("k3s etcd check", "ls -la /var/lib/rancher/k3s/server/db/ 2>/dev/null | head -5"),
        ("kubectl version", "kubectl version --short 2>&1 | head -5"),
        ("can create deployment", "kubectl create deployment test-cka --image=nginx --dry-run=client -o yaml 2>&1 | head -20"),
        ("kubectl api-resources count", "kubectl api-resources 2>&1 | wc -l"),
    ]

    for name, cmd in tests:
        full_cmd = f"kubectl exec -n qbank deploy/web-terminal -- bash -c '{cmd}'"
        out, err = run(ssh, full_cmd, 30)
        print(f"===== {name} =====")
        print(out[:1500])
        if err:
            print(f"ERR: {err[:300]}")
        print()

    ssh.close()
    sock.close()

if __name__ == "__main__":
    main()
