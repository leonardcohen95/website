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

    # 1. Read k3s.yaml and modify server address for in-cluster access
    out, err = run(ssh, "cat /etc/rancher/k3s/k3s.yaml", 30)
    kubeconfig = out.replace("server: https://127.0.0.1:6443", "server: https://kubernetes.default.svc:443")
    print("kubeconfig modified (server -> kubernetes.default.svc:443)")

    # 2. Create ConfigMap with modified kubeconfig
    upload(ssh, "/root/ttyd-build/kubeconfig.yaml", kubeconfig)
    out, err = run(ssh, "kubectl create configmap web-terminal-kubeconfig --from-file=config=/root/ttyd-build/kubeconfig.yaml -n qbank --dry-run=client -o yaml | kubectl apply -f -", 30)
    print("===== configmap =====")
    print(out)
    if err:
        print(f"ERR: {err}")

    # 3. Deployment + Service
    k8s_yaml = '''apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-terminal
  namespace: qbank
  labels:
    app: web-terminal
spec:
  replicas: 1
  selector:
    matchLabels:
      app: web-terminal
  template:
    metadata:
      labels:
        app: web-terminal
    spec:
      containers:
      - name: ttyd
        image: docker.io/library/web-terminal:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 7681
          name: http
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "100m"
            memory: "128Mi"
        volumeMounts:
        - name: kubeconfig
          mountPath: /root/.kube
          readOnly: true
      volumes:
      - name: kubeconfig
        configMap:
          name: web-terminal-kubeconfig
---
apiVersion: v1
kind: Service
metadata:
  name: web-terminal
  namespace: qbank
spec:
  selector:
    app: web-terminal
  ports:
  - port: 7681
    targetPort: 7681
    name: http
'''
    upload(ssh, "/root/ttyd-build/web-terminal.yaml", k8s_yaml)
    out, err = run(ssh, "kubectl apply -f /root/ttyd-build/web-terminal.yaml", 60)
    print("===== deploy + svc =====")
    print(out)
    if err:
        print(f"ERR: {err}")

    # 4. Wait for pod
    import time
    time.sleep(10)
    out, err = run(ssh, "kubectl get pods -n qbank -l app=web-terminal -o wide", 30)
    print("===== pods =====")
    print(out)

    out, err = run(ssh, "kubectl logs -n qbank -l app=web-terminal --tail=20", 30)
    print("===== logs =====")
    print(out)

    ssh.close()
    sock.close()

if __name__ == "__main__":
    main()
