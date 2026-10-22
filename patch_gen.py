#!/usr/bin/env python3
import re
p = "/workspace/gen_tasks.py"
s = open(p).read()

# 1. meta.sh 用 heredoc 写法，避免反引号/命令替换
old = '''    safe_desc = t["desc"].replace('"', '\\\\"')
    safe_title = t["title"].replace('"', '\\\\"')
    hint = t["hint"].replace('"', '\\\\"')
    meta = f\'\'\'#!/bin/bash
TITLE="{safe_title}"
CATEGORY="{t['category']}"
WEIGHT={t['weight']}
DESCRIPTION="{safe_desc}"
HINT="{hint}"
\'\'\''''
new = '''    meta = f"""#!/bin/bash
TITLE={shq(t['title'])}
CATEGORY={shq(t['category'])}
WEIGHT={t['weight']}
DESCRIPTION=$(cat <<'CKA_META_EOF'
{t['desc']}
CKA_META_EOF
)
HINT=$(cat <<'CKA_META_EOF'
{t['hint']}
CKA_META_EOF
)
"""'''
assert old in s, "meta block not found"
s = s.replace(old, new)

# 添加 shq 函数
s = s.replace('BASE = "/workspace/cka-practice/tasks"',
'''BASE = "/workspace/cka-practice/tasks"

def shq(x):
    return "'" + x.replace("'", "'\\\\''") + "'"''')

# 2. ConfigMap 用临时文件生成
old2 = '''cat <<'YAML' | kubectl create configmap nginx-config -n nginx-static --from-file=default.conf=/dev/stdin --dry-run=client -o yaml | kubectl apply -f - >/dev/null
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/certs/tls.crt;
    ssl_certificate_key /etc/nginx/certs/tls.key;
    ssl_protocols TLSv1.1;
    location / { return 200 "ok"; }
}
YAML'''
new2 = '''cat > /tmp/nginx-default.conf <<'CONF'
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/certs/tls.crt;
    ssl_certificate_key /etc/nginx/certs/tls.key;
    ssl_protocols TLSv1.1;
    location / { return 200 "ok"; }
}
CONF
kubectl create configmap nginx-config -n nginx-static --from-file=default.conf=/tmp/nginx-default.conf --dry-run=client -o yaml | kubectl apply -f - >/dev/null'''
assert old2 in s
s = s.replace(old2, new2)

# 3. 去掉 task13 中不可靠的 OVER 检查
old3 = '''  OVER=$(echo "$NP" | jq -r '[.items[] | select((.spec.ingress[]?.from[]? | has("namespaceSelector")|not) and (.spec.ingress[]?.from[]? | has("ipBlock")|not) and (.spec.ingress[]?.from[]?|has("podSelector")|not))]|length')
  assert_eq "没有过度宽松的 from 规则" "0" "${OVER:-0}"
'''
assert old3 in s
s = s.replace(old3, "")

# 4. 题11 提示值改为更小，避免 node 资源不足
s = s.replace("--requests=cpu=500m,memory=512Mi", "--requests=cpu=200m,memory=256Mi")
s = s.replace("# 节点总计 2 核 / 约 3.4Gi，可分给 3 个 Pod：cpu=500m, memory=512Mi",
              "# 节点总计 2 核 / 约 3.4Gi，可分给 3 个 Pod：cpu=200m, memory=256Mi")

open(p, "w").write(s)
print("gen_tasks.py patched")
