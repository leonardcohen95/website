#!/usr/bin/env python3
"""Ad-hoc SSH runner: python3 remote.py 'cmd1' 'cmd2' ..."""
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
    req = f"CONNECT {TARGET_HOST}:{TARGET_PORT} HTTP/1.1\r\nHost: {TARGET_HOST}:{TARGET_PORT}\r\n\r\n"
    sock.sendall(req.encode())
    resp = b""
    while b"\r\n\r\n" not in resp:
        chunk = sock.recv(4096)
        if not chunk:
            break
        resp += chunk
    if b"200" not in resp.split(b"\r\n")[0]:
        print(f"Proxy error: {resp}")
        sys.exit(1)
    return sock


def main():
    sock = connect_via_proxy()
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(TARGET_HOST, port=TARGET_PORT, username=USERNAME,
                password=PASSWORD, sock=sock, timeout=60)

    for cmd in sys.argv[1:]:
        if cmd.startswith("put "):
            _, local, remote = cmd.split(maxsplit=2)
            sftp = ssh.open_sftp()
            sftp.put(local, remote)
            sftp.close()
            print(f"===== uploaded {local} -> {remote} =====")
            continue
        print(f"===== {cmd[:90]} =====")
        stdin, stdout, stderr = ssh.exec_command(cmd, timeout=600)
        out = stdout.read().decode(errors="replace")
        err = stderr.read().decode(errors="replace")
        print(out, end="")
        if err.strip():
            print("ERR:", err[:1000])
    ssh.close()
    sock.close()


if __name__ == "__main__":
    main()
