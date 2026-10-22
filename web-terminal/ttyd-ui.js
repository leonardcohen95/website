/* 终端复制 / 粘贴工具栏 */
(function () {
  if (document.getElementById('cka-tools')) return;

  var style = document.createElement('style');
  style.textContent = [
    '#cka-tools{position:fixed;right:10px;bottom:14px;display:flex;flex-direction:column;gap:8px;z-index:2147483647;opacity:.72;transition:opacity .2s}',
    '#cka-tools:hover,#cka-tools:focus-within{opacity:1}',
    '#cka-tools button{width:52px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,.28);',
    'background:rgba(38,42,52,.9);color:#eaeaea;font-size:13px;line-height:1;font-family:inherit;',
    'box-shadow:0 2px 8px rgba(0,0,0,.35);-webkit-tap-highlight-color:transparent;cursor:pointer}',
    '#cka-tools button:active{background:rgba(80,140,255,.9);border-color:#5b9bff}',
    '#cka-toast{position:fixed;left:50%;bottom:80px;transform:translateX(-50%);background:rgba(20,22,28,.94);',
    'color:#fff;font-size:13px;padding:8px 14px;border-radius:8px;z-index:2147483647;pointer-events:none;',
    'opacity:0;transition:opacity .18s;white-space:nowrap;max-width:88vw;overflow:hidden;text-overflow:ellipsis}',
    '#cka-toast.show{opacity:1}',
    '#cka-pastebox{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2147483647;display:flex;',
    'align-items:center;justify-content:center;padding:16px}',
    '#cka-pastebox .box{background:#1f232b;border:1px solid #394050;border-radius:12px;width:100%;max-width:560px;padding:14px}',
    '#cka-pastebox .title{color:#cfd6e4;font-size:13px;margin-bottom:8px;line-height:1.5}',
    '#cka-pastebox textarea{width:100%;height:150px;box-sizing:border-box;background:#12151b;color:#e8e8e8;',
    'border:1px solid #394050;border-radius:8px;padding:10px;font-family:ui-monospace,Menlo,Consolas,monospace;',
    'font-size:16px;resize:vertical}',
    '#cka-pastebox .actions{display:flex;justify-content:flex-end;gap:10px;margin-top:10px}',
    '#cka-pastebox button{padding:9px 16px;border-radius:8px;border:1px solid #394050;background:#2b3140;',
    'color:#eaeaea;font-size:14px}',
    '#cka-pastebox button.primary{background:#3b6fd4;border-color:#3b6fd4;color:#fff}'
  ].join('');
  document.head.appendChild(style);

  var wrap = document.createElement('div');
  wrap.id = 'cka-tools';
  wrap.innerHTML = '<button type="button" id="cka-copy" title="复制屏幕内容">复制</button>' +
                   '<button type="button" id="cka-paste" title="把剪贴板内容粘到终端">粘贴</button>';
  document.body.appendChild(wrap);

  var toastEl = document.createElement('div');
  toastEl.id = 'cka-toast';
  document.body.appendChild(toastEl);
  var toastTimer = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 1800);
  }

  function stripAnsi(s) {
    return s
      .replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, '')
      .replace(/\x1b\[[0-9;?]*[ -\/]*[@-~]/g, '')
      .replace(/\x1b[()][A-Za-z0-9]/g, '')
      .replace(/\x1b[=>78]/g, '')
      .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
  }

  // 处理 \r 回车覆盖：同一行只保留最后一次渲染的内容
  function collapseCR(text) {
    var out = [];
    var lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var parts = lines[i].split('\r');
      var line = parts[parts.length - 1];
      out.push(line.replace(/[ \t]+$/, ''));
    }
    return out.join('\n');
  }

  function screenText() {
    // ttyd 1.7 把 xterm 实例挂在 window.term，直接读缓冲区最准确
    var term = window.term;
    if (term && term.buffer && term.buffer.active) {
      var b = term.buffer.active;
      var lines = [];
      for (var i = 0; i < b.length; i++) {
        var line = b.getLine(i);
        lines.push(line ? line.translateToString(true) : '');
      }
      while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
      while (lines.length && !lines[0].trim()) lines.shift();
      if (lines.length > 300) lines = lines.slice(-300);
      if (lines.join('').trim()) return lines.join('\n');
    }

    var rows = document.querySelectorAll('.xterm-rows > div');
    if (rows && rows.length > 1) {
      var lns = [];
      for (var j = 0; j < rows.length; j++) {
        var t = (rows[j].textContent || '').replace(/\u00a0/g, ' ');
        lns.push(t.replace(/[ \t]+$/, ''));
      }
      while (lns.length && lns[lns.length - 1] === '') lns.pop();
      if (lns.join('').trim()) return lns.join('\n');
    }

    var buf = window.__ckaOut || '';
    if (!buf) return '';
    var text = collapseCR(stripAnsi(buf));
    var ls = text.split('\n');
    if (ls.length > 300) ls = ls.slice(-300);
    while (ls.length && ls[ls.length - 1] === '') ls.pop();
    while (ls.length && ls[0] === '') ls.shift();
    return ls.join('\n');
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('execCommand failed'));
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  function doCopy() {
    var text = screenText();
    if (!text) { toast('暂时没有可复制的内容，先在终端里执行条命令'); return; }
    copyText(text).then(function () {
      toast('已复制 ' + text.split('\n').length + ' 行');
    }, function () {
      appendPasteBox(text, '自动复制失败，请长按下方文本手动复制');
    });
  }

  function appendPasteBox(prefill, title) {
    if (document.getElementById('cka-pastebox')) return;
    var box = document.createElement('div');
    box.id = 'cka-pastebox';
    box.innerHTML =
      '<div class="box">' +
        '<div class="title"></div>' +
        '<textarea id="cka-pb-ta" placeholder="kubectl get pods -A"></textarea>' +
        '<div class="actions">' +
          '<button type="button" id="cka-pb-cancel">取消</button>' +
          '<button type="button" class="primary" id="cka-pb-send">发送</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(box);
    var ta = document.getElementById('cka-pb-ta');
    box.querySelector('.title').textContent =
      title || '在此粘贴命令，然后点「发送」（手机端长按输入框选择粘贴）';
    if (prefill) ta.value = prefill;
    setTimeout(function () { ta.focus(); }, 50);

    document.getElementById('cka-pb-cancel').onclick = function () { box.remove(); };
    document.getElementById('cka-pb-send').onclick = function () {
      var v = ta.value;
      box.remove();
      if (v) sendInput(v);
    };
    box.addEventListener('click', function (e) { if (e.target === box) box.remove(); });
  }

  function sendInput(text) {
    var ws = window.__ckaWS;
    if (!ws || ws.readyState !== 1) { toast('终端未连接，请刷新页面'); return; }
    text = text.replace(/\r\n/g, '\n');
    ws.send('0' + text);
    toast('已发送 ' + text.length + ' 个字符');
  }

  function doPaste() {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      appendPasteBox();
      return;
    }
    navigator.clipboard.readText().then(function (t) {
      if (!t) { appendPasteBox(); return; }
      sendInput(t);
    }, function () {
      appendPasteBox();
    });
  }

  document.getElementById('cka-copy').addEventListener('click', doCopy);
  document.getElementById('cka-paste').addEventListener('click', doPaste);

  // 桌面端快捷键：Ctrl/⌘+Shift+C 复制屏幕，Ctrl/⌘+Shift+V 粘贴
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
      e.preventDefault(); doCopy();
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'V' || e.key === 'v')) {
      e.preventDefault(); doPaste();
    }
  });
})();
