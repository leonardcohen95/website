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

    # Update ttyd with -b /terminal base path
    patch_cmd = '''kubectl patch deployment web-terminal -n qbank --type='json' -p='[
      {"op":"replace","path":"/spec/template/spec/containers/0/command","value":["ttyd","-W","-c","root:Gmcc@345","-b","/terminal","-p","7681","-t","titleFixed=Web Terminal","-t","cursorBlink=true","bash"]}
    ]' '''
    out, err = run(ssh, patch_cmd, 30)
    print("===== patch base path =====")
    print(out)
    if err:
        print(f"ERR: {err}")

    time.sleep(10)
    out, err = run(ssh, "kubectl get pods -n qbank -l app=web-terminal", 30)
    print("===== pods =====")
    print(out)

    ssh.close()
    sock.close()

if __name__ == "__main__":
    main()
