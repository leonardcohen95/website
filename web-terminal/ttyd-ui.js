/* 终端复制 / 粘贴：悬浮按钮 + 长按菜单（手机端适配） */
(function () {
  if (document.getElementById('cka-tools')) return;

  var style = document.createElement('style');
  style.textContent = [
    /* 终端区域禁用系统长按菜单，改由我们的长按菜单接管 */
    '#terminal-container,#terminal-container *{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}',

    '#cka-tools{position:fixed;right:10px;bottom:14px;display:flex;flex-direction:column;gap:8px;',
    'z-index:2147483646;opacity:.78;transition:opacity .2s}',
    '#cka-tools button{width:56px;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.28);',
    'background:rgba(38,42,52,.92);color:#eaeaea;font-size:13px;line-height:1;font-family:inherit;',
    'box-shadow:0 2px 8px rgba(0,0,0,.35);-webkit-tap-highlight-color:transparent;cursor:pointer;',
    'touch-action:manipulation}',
    '#cka-tools button:active{background:rgba(80,140,255,.92);border-color:#5b9bff}',

    '#cka-toast{position:fixed;left:50%;bottom:80px;transform:translateX(-50%);background:rgba(20,22,28,.94);',
    'color:#fff;font-size:13px;padding:8px 14px;border-radius:8px;z-index:2147483647;pointer-events:none;',
    'opacity:0;transition:opacity .18s;white-space:nowrap;max-width:88vw;overflow:hidden;text-overflow:ellipsis}',
    '#cka-toast.show{opacity:1}',

    /* 长按弹出的操作菜单 */
    '#cka-sheet{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2147483647;display:flex;',
    'align-items:flex-end;justify-content:center}',
    '#cka-sheet .panel{width:100%;max-width:560px;background:#1f232b;border-radius:14px 14px 0 0;',
    'padding:10px 12px calc(12px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:8px;',
    'box-shadow:0 -6px 24px rgba(0,0,0,.5)}',
    '#cka-sheet .tip{color:#8b94a7;font-size:12px;text-align:center;padding:4px 0 2px}',
    '#cka-sheet button{width:100%;padding:14px 12px;border-radius:10px;border:1px solid #394050;',
    'background:#2b3140;color:#eaeaea;font-size:16px;font-family:inherit;touch-action:manipulation;',
    '-webkit-tap-highlight-color:transparent}',
    '#cka-sheet button:active{background:#3b6fd4;border-color:#3b6fd4}',
    '#cka-sheet button.cancel{background:#16191f;color:#aab2c0;font-size:15px}',

    '#cka-pastebox{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2147483647;display:flex;',
    'align-items:center;justify-content:center;padding:16px}',
    '#cka-pastebox .box{background:#1f232b;border:1px solid #394050;border-radius:12px;width:100%;max-width:560px;padding:14px}',
    '#cka-pastebox .title{color:#cfd6e4;font-size:13px;margin-bottom:8px;line-height:1.5}',
    '#cka-pastebox textarea{width:100%;height:150px;box-sizing:border-box;background:#12151b;color:#e8e8e8;',
    'border:1px solid #394050;border-radius:8px;padding:10px;font-family:ui-monospace,Menlo,Consolas,monospace;',
    'font-size:16px;resize:vertical}',
    '#cka-pastebox .actions{display:flex;justify-content:flex-end;gap:10px;margin-top:10px}',
    '#cka-pastebox button{padding:11px 18px;border-radius:8px;border:1px solid #394050;background:#2b3140;',
    'color:#eaeaea;font-size:15px;font-family:inherit;touch-action:manipulation}',
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

  // 手机键盘弹出时，position:fixed 的按钮会被挡住，按 visualViewport 抬到底部上方
  function place() {
    var vv = window.visualViewport;
    var hidden = 0;
    if (vv) hidden = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    var bottom = 14 + hidden;
    wrap.style.bottom = bottom + 'px';
    toastEl.style.bottom = (80 + hidden) + 'px';
  }
  function watchViewport() {
    place();
    window.addEventListener('resize', place);
    window.addEventListener('orientationchange', place);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', place);
      window.visualViewport.addEventListener('scroll', place);
    }
    setTimeout(place, 300);
    setTimeout(place, 1000);
  }
  watchViewport();

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
      out.push(parts[parts.length - 1].replace(/[ \t]+$/, ''));
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
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.width = '1px';
      ta.style.height = '1px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  function doCopy() {
    var text = screenText();
    if (!text) { toast('暂时没有可复制的内容'); return; }
    copyText(text).then(function () {
      toast('已复制 ' + text.split('\n').length + ' 行');
    }, function () {
      appendPasteBox(text, '自动复制被浏览器拦截，请长按下方文本选择「全选 → 复制」');
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
    toast('已发送 ' + text.length + ' 个字符，按回车执行');
  }

  function doPaste() {
    if (!navigator.clipboard || !navigator.clipboard.readText || !window.isSecureContext) {
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

  // 长按 / 右键弹出的操作菜单
  function showSheet() {
    if (document.getElementById('cka-sheet')) return;
    var sheet = document.createElement('div');
    sheet.id = 'cka-sheet';
    sheet.innerHTML =
      '<div class="panel">' +
        '<div class="tip">终端操作</div>' +
        '<button type="button" data-act="copy">复制屏幕内容</button>' +
        '<button type="button" data-act="paste">粘贴命令</button>' +
        '<button type="button" class="cancel" data-act="cancel">取消</button>' +
      '</div>';
    document.body.appendChild(sheet);
    sheet.addEventListener('click', function (e) {
      if (e.target === sheet) { sheet.remove(); return; }
      var b = e.target.closest ? e.target.closest('button') : null;
      if (!b) return;
      var act = b.getAttribute('data-act');
      sheet.remove();
      if (act === 'copy') doCopy();
      else if (act === 'paste') doPaste();
      if (navigator.vibrate) { try { navigator.vibrate(10); } catch (err) {} }
    });
  }

  // 触摸长按：550ms 不动即弹出菜单
  var pressTimer = null, sx = 0, sy = 0;
  function cancelPress() {
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
  }
  function onTouchStart(e) {
    if (e.touches.length !== 1) { cancelPress(); return; }
    if (e.target.closest && e.target.closest('#cka-sheet,#cka-pastebox,#cka-tools')) return;
    var t = e.touches[0];
    sx = t.clientX; sy = t.clientY;
    cancelPress();
    pressTimer = setTimeout(function () {
      pressTimer = null;
      showSheet();
    }, 550);
  }
  function onTouchMove(e) {
    if (!pressTimer || e.touches.length !== 1) return;
    var t = e.touches[0];
    if (Math.abs(t.clientX - sx) > 12 || Math.abs(t.clientY - sy) > 12) cancelPress();
  }

  function bindTerminal() {
    var c = document.getElementById('terminal-container');
    if (!c) return false;
    c.addEventListener('touchstart', onTouchStart, { passive: true });
    c.addEventListener('touchmove', onTouchMove, { passive: true });
    c.addEventListener('touchend', cancelPress);
    c.addEventListener('touchcancel', cancelPress);
    return true;
  }
  if (!bindTerminal()) {
    var tries = 0;
    var timer = setInterval(function () {
      if (bindTerminal() || ++tries > 50) clearInterval(timer);
    }, 100);
  }

  // 桌面右键 / 安卓长按 contextmenu 也走同一个菜单
  document.addEventListener('contextmenu', function (e) {
    if (e.target.closest && e.target.closest('#terminal-container')) {
      e.preventDefault();
      cancelPress();
      showSheet();
    }
  });

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
