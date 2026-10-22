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

    # Check ttyd logs
    out, err = run(ssh, "kubectl logs -n qbank -l app=web-terminal --tail=30")
    print("===== ttyd logs =====")
    print(out)

    # Test websocket from inside the pod (direct to ttyd)
    out, err = run(ssh, "kubectl exec -n qbank deploy/web-terminal -- curl -s -o /dev/null -w '%{http_code}' -u root:Gmcc@345 -H 'Connection: Upgrade' -H 'Upgrade: websocket' -H 'Sec-WebSocket-Version: 13' -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' http://localhost:7681/terminal/ws")
    print(f"\n===== internal ws test (localhost:7681/terminal/ws): {out} =====")

    # Test root ws path
    out, err = run(ssh, "kubectl exec -n qbank deploy/web-terminal -- curl -s -o /dev/null -w '%{http_code}' -u root:Gmcc@345 -H 'Connection: Upgrade' -H 'Upgrade: websocket' -H 'Sec-WebSocket-Version: 13' -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' http://localhost:7681/ws")
    print(f"===== internal ws test (localhost:7681/ws): {out} =====")

    # Check what ttyd command is running
    out, err = run(ssh, "kubectl exec -n qbank deploy/web-terminal -- ps aux | grep ttyd")
    print(f"\n===== ttyd process =====")
    print(out)

    # Check traefik pod logs for /terminal/ws
    out, err = run(ssh, "kubectl logs -n kube-system -l app.kubernetes.io/name=traefik --tail=30 2>/dev/null | grep -i terminal | tail -10")
    print(f"\n===== traefik logs (terminal) =====")
    print(out[:1000])

    ssh.close()
    sock.close()

if __name__ == "__main__":
    main()
