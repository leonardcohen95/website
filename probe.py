#!/usr/bin/env python3
import paramiko, socket, sys

def proxy():
    s = socket.socket(); s.settimeout(60); s.connect(("127.0.0.1",18080))
    s.sendall(b"CONNECT 8.138.146.169:22 HTTP/1.1\r\nHost: 8.138.146.169:22\r\n\r\n")
    r=b""
    while b"\r\n\r\n" not in r: r+=s.recv(4096)
    return s

def main():
    s=proxy()
    ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect("8.138.146.169",22,username="root",password="Gmcc@345",sock=s,timeout=60)
    cmds=[
      "kubectl get node -o jsonpath='{.items[0].status.allocatable}'",
      "kubectl get node -o jsonpath='{.items[0].status.capacity}'",
      "kubectl get crd | grep -i cert-manager | head -10; echo '---crd---'",
      "which helm; helm version --short 2>/dev/null; echo '---helm---'",
      "kubectl get ns --show-labels | head -12",
      "kubectl get pv qbank-data-pv -o yaml | head -30",
      "free -h | head -2; nproc",
    ]
    for c in cmds:
        i,o,e=ssh.exec_command(c,timeout=60)
        print(f"===== {c[:60]} =====")
        print(o.read().decode(errors='replace')[:1500])
        err=e.read().decode(errors='replace')
        if err.strip(): print("ERR:",err[:200])
    ssh.close(); s.close()

main()
