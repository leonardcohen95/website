#!/usr/bin/env python3
"""部署 CKA 练习终端：打包练习框架 -> 构建镜像 -> 持久化卷 PV/PVC -> 更新 Deployment"""
import io
import socket
import sys
import tarfile
import time

import paramiko

PROXY_HOST = "127.0.0.1"
PROXY_PORT = 18080
TARGET_HOST = "8.138.146.169"
TARGET_PORT = 22
USERNAME = "root"
PASSWORD = "Gmcc@345"

IMAGE_TAG = "web-terminal:cka5"
BASE_DIR = "/root/ttyd-build"


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


def run(ssh, cmd, timeout=600):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    return out, err


def upload_text(ssh, path, content):
    sftp = ssh.open_sftp()
    with sftp.file(path, "w") as f:
        f.write(content)
    sftp.close()


def main():
    sock = connect_via_proxy()
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(TARGET_HOST, port=TARGET_PORT, username=USERNAME,
                password=PASSWORD, sock=sock, timeout=60)

    # ---------- 1. 打包并上传练习框架 ----------
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        tar.add("/workspace/cka-practice", arcname="cka")
    buf.seek(0)

    out, _ = run(ssh, f"mkdir -p {BASE_DIR}")
    sftp = ssh.open_sftp()
    with sftp.file(f"{BASE_DIR}/cka.tgz", "wb") as f:
        f.write(buf.read())
    sftp.close()
    out, err = run(ssh, f"rm -rf {BASE_DIR}/cka && tar xzf {BASE_DIR}/cka.tgz -C {BASE_DIR} && "
                        f"chmod +x {BASE_DIR}/cka/bin/cka {BASE_DIR}/cka/lib/*.sh && "
                        f"ls {BASE_DIR}/cka")
    print("===== upload package =====")
    print(out, err[:300])

    # ---------- 2. Dockerfile ----------
    dockerfile = f'''FROM docker.io/library/web-terminal:latest
COPY cka /opt/cka
RUN chmod +x /opt/cka/bin/cka /opt/cka/lib/*.sh /opt/cka/tasks/*/*.sh \\
    && ln -sf /opt/cka/bin/cka /usr/local/bin/cka \\
    && mkdir -p /root/work/.cka \\
    && curl -fsSL https://get.helm.sh/helm-v3.16.3-linux-amd64.tar.gz | tar xz -C /tmp \\
    && mv /tmp/linux-amd64/helm /usr/local/bin/helm && chmod +x /usr/local/bin/helm \\
    && helm version --short
WORKDIR /root/work
ENV TZ=Asia/Shanghai
EXPOSE 7681
CMD ["ttyd","-W","-c","root:Gmcc@345","-p","7681","-b","/terminal","-t","titleFixed=CKA 练习终端","bash"]
'''
    upload_text(ssh, f"{BASE_DIR}/Dockerfile.cka", dockerfile)
    out, err = run(ssh, f"cd {BASE_DIR} && docker build -f Dockerfile.cka -t {IMAGE_TAG} . 2>&1 | tail -15", 900)
    print("===== docker build =====")
    print(out, err[:500])

    # ---------- 3. 导入 k3s ----------
    out, err = run(ssh, f"docker save {IMAGE_TAG} | k3s ctr images import - 2>&1 | tail -3", 600)
    print("===== import image =====")
    print(out, err[:300])

    # 预拉练习题用到的镜像并导入 k3s（避免练习时等待拉取）
    run(ssh, "docker pull -q nginx:1.26 >/dev/null 2>&1; docker pull -q nginx:latest >/dev/null 2>&1; "
              "docker pull -q busybox:latest >/dev/null 2>&1; docker tag redis:7-alpine redis:latest; "
              "docker tag memcached:1.6-alpine memcached:latest", 600)
    out, err = run(ssh, "docker save nginx:1.25 nginx:1.26 nginx:latest busybox:1.36 busybox:latest "
                        "redis:latest memcached:latest | k3s ctr images import - 2>&1 | tail -3", 900)
    print("===== import task images =====")
    print(out, err[:300])

    # ---------- 4. PV / PVC ----------
    storage_yaml = '''apiVersion: v1
kind: PersistentVolume
metadata:
  name: cka-terminal-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: qbank-local
  hostPath:
    path: /root/cka-terminal-data
    type: DirectoryOrCreate
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: web-terminal-data
  namespace: qbank
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: qbank-local
  resources:
    requests:
      storage: 10Gi
'''
    upload_text(ssh, f"{BASE_DIR}/cka-storage.yaml", storage_yaml)
    out, err = run(ssh, f"kubectl apply -f {BASE_DIR}/cka-storage.yaml", 60)
    print("===== pv/pvc =====")
    print(out, err[:300])

    # ---------- 5. Deployment ----------
    deploy_yaml = f'''apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-terminal
  namespace: qbank
  labels:
    app: web-terminal
spec:
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: web-terminal
  template:
    metadata:
      labels:
        app: web-terminal
    spec:
      initContainers:
      - name: init-home
        image: {IMAGE_TAG}
        imagePullPolicy: IfNotPresent
        command: ["bash", "/opt/cka/lib/init-home.sh", "/data"]
        volumeMounts:
        - name: home
          mountPath: /data
      containers:
      - name: ttyd
        image: {IMAGE_TAG}
        imagePullPolicy: IfNotPresent
        command:
        - ttyd
        - -W
        - -c
        - root:Gmcc@345
        - -p
        - "7681"
        - -b
        - /terminal
        - -t
        - titleFixed=CKA 练习终端
        - bash
        ports:
        - containerPort: 7681
          name: http
        env:
        - name: TZ
          value: Asia/Shanghai
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "100m"
            memory: "128Mi"
        volumeMounts:
        - name: home
          mountPath: /root
        - name: kubeconfig
          mountPath: /root/.kube
          readOnly: true
      volumes:
      - name: home
        persistentVolumeClaim:
          claimName: web-terminal-data
      - name: kubeconfig
        configMap:
          name: web-terminal-kubeconfig
          defaultMode: 0600
'''
    upload_text(ssh, f"{BASE_DIR}/web-terminal-cka.yaml", deploy_yaml)
    out, err = run(ssh, f"kubectl apply -f {BASE_DIR}/web-terminal-cka.yaml", 60)
    print("===== deployment =====")
    print(out, err[:300])

    # 等待滚动完成
    for _ in range(20):
        out, _ = run(ssh, "kubectl get pods -n qbank -l app=web-terminal "
                          "-o jsonpath='{.items[*].status.phase}'", 30)
        if out.strip() == "Running":
            break
        time.sleep(5)

    out, err = run(ssh, "kubectl get pods,pvc -n qbank -o wide; echo '---'; "
                        "kubectl get pv | grep cka-terminal", 30)
    print("===== status =====")
    print(out)

    out, err = run(ssh, "kubectl logs -n qbank deploy/web-terminal --tail=15", 30)
    print("===== logs =====")
    print(out, err[:500])

    ssh.close()
    sock.close()


if __name__ == "__main__":
    main()
