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
        "kubectl get storageclass",
        "kubectl get pv,pvc -A 2>/dev/null | head -20",
        "kubectl get pods -n monitoring -o wide | head -10",
        "kubectl get deploy -n monitoring -o jsonpath='{range .items[*]}{.metadata.name}{\"\\n\"}{end}'",
        "ls /var/lib/rancher/k3s/server/db/ 2>/dev/null; echo '--- db dir ---'",
        "cat /etc/rancher/k3s/k3s.yaml | head -8",
        "df -h / | tail -2",
        "k3s ctr images ls | wc -l",
    ]
    for c in cmds:
        out, err = run(ssh, c)
        print(f"===== {c[:70]} =====")
        print(out[:1200])
        if err.strip():
            print(f"ERR: {err[:300]}")

    # Test image pull capability
    out, err = run(ssh, "timeout 120 kubectl run pull-test --image=busybox:1.36 --restart=Never --image-pull-policy=Always -- sleep 5 2>&1; echo '---'; sleep 12; kubectl get pod pull-test -o wide 2>&1; kubectl delete pod pull-test --ignore-not-found 2>&1", 180)
    print("===== image pull test =====")
    print(out)

    ssh.close()
    sock.close()

if __name__ == "__main__":
    main()
