#!/usr/bin/env python3
import paramiko
import socket
import sys
import time

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

    # 1. Update Deployment: add -W (writable) and better cmd
    patch_cmd = '''kubectl patch deployment web-terminal -n qbank --type='json' -p='[
      {"op":"replace","path":"/spec/template/spec/containers/0/command","value":["ttyd","-W","-c","root:Gmcc@345","-p","7681","-t","titleFixed=Web Terminal","-t","cursorBlink=true","bash"]}
    ]' '''
    out, err = run(ssh, patch_cmd, 30)
    print("===== patch deploy =====")
    print(out)
    if err:
        print(f"ERR: {err}")

    time.sleep(8)
    out, err = run(ssh, "kubectl get pods -n qbank -l app=web-terminal -o wide", 30)
    print("===== pods after patch =====")
    print(out)

    # 2. Update Ingress: add /terminal path
    ingress_patch = '''kubectl patch ingress qbank-ingress -n qbank --type='json' -p='[
      {"op":"add","path":"/spec/rules/0/http/paths/-","value":{"path":"/terminal","pathType":"Prefix","backend":{"service":{"name":"web-terminal","port":{"number":7681}}}}}
    ]' '''
    out, err = run(ssh, ingress_patch, 30)
    print("===== patch ingress =====")
    print(out)
    if err:
        print(f"ERR: {err}")

    out, err = run(ssh, "kubectl get ingress qbank-ingress -n qbank -o jsonpath='{.spec.rules[0].http.paths}'", 30)
    print("===== ingress paths =====")
    print(out)

    ssh.close()
    sock.close()

if __name__ == "__main__":
    main()
