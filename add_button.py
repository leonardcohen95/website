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

def upload(ssh, remote_path, content):
    sftp = ssh.open_sftp()
    with sftp.file(remote_path, "w") as f:
        f.write(content)
    sftp.close()

def main():
    sock = connect_via_proxy()
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(TARGET_HOST, port=TARGET_PORT, username=USERNAME, password=PASSWORD, sock=sock, timeout=60)

    # 1. Backup
    run(ssh, "cp /root/question_bank_web/questions/templates/questions/index.html /root/question_bank_web/questions/templates/questions/index.html.bak")
    print("Backup done")

    # 2. Read current content
    out, _ = run(ssh, "cat /root/question_bank_web/questions/templates/questions/index.html")

    # 3. Insert Web Terminal button after CKA guide button
    cka_block = '''<a href="/cka/" class="btn btn-lg px-5 py-3 rounded-pill shadow min-height-44 text-white" style="background:#ff6b35;border-color:#ff6b35;">
                                    <i class="bi bi-mortarboard me-2"></i><span>CKA 考试指南</span>
                                </a>
                                <div class="text-muted mt-2">
                                    <small>最新 CKA 备考攻略 · 做题顺序 · 命令速查 · 考场技巧</small>
                                </div>'''

    terminal_block = '''<a href="/terminal/" target="_blank" rel="noopener" class="btn btn-lg px-5 py-3 rounded-pill shadow min-height-44 text-white" style="background:#6f42c1;border-color:#6f42c1;">
                                    <i class="bi bi-terminal me-2"></i><span>Web 终端</span>
                                </a>
                                <div class="text-muted mt-2">
                                    <small>在线 Linux 命令行练习环境 · 不关闭页面即保持连接 · 内置 kubectl</small>
                                </div>'''

    if cka_block in out:
        new_content = out.replace(cka_block, cka_block + "\n" + terminal_block)
        upload(ssh, "/root/question_bank_web/questions/templates/questions/index.html", new_content)
        print("index.html updated with Web Terminal button")
    else:
        print("ERROR: CKA block not found, trying line-by-line")
        # Fallback: insert before the random_tip div
        new_content = out.replace(
            '<div class="text-muted mt-2">\n                                    <small data-i18n="home.random_tip">',
            terminal_block + '\n<div class="text-muted mt-2">\n                                    <small data-i18n="home.random_tip">'
        )
        upload(ssh, "/root/question_bank_web/questions/templates/questions/index.html", new_content)
        print("Fallback update done")

    # 4. Verify the button was added
    out, _ = run(ssh, "grep -n 'Web 终端' /root/question_bank_web/questions/templates/questions/index.html")
    print(f"Verify button: {out.strip()}")

    # 5. Rebuild backend image
    TAG = "terminal-btn"
    out, err = run(ssh, f"cd /root/question_bank_web && docker build -t qbank-backend:{TAG} . 2>&1 | tail -10", 300)
    print("===== docker build backend =====")
    print(out)
    if err:
        print(f"ERR: {err[:500]}")

    # 6. Import to k3s
    out, err = run(ssh, f"docker save qbank-backend:{TAG} | k3s ctr images import - 2>&1 | tail -3", 120)
    print("===== k3s import =====")
    print(out)

    # 7. Rollout update
    out, err = run(ssh, f"kubectl set image deployment/qbank-backend backend=qbank-backend:{TAG} -n qbank && kubectl rollout status deployment/qbank-backend -n qbank --timeout=180s", 200)
    print("===== rollout =====")
    print(out)
    if err:
        print(f"ERR: {err[:500]}")

    time.sleep(5)
    out, err = run(ssh, "kubectl get pods -n qbank -l app=qbank-backend", 30)
    print("===== backend pods =====")
    print(out)

    ssh.close()
    sock.close()

if __name__ == "__main__":
    main()
