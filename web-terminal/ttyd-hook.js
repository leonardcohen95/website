/* ttyd WebSocket hook —— 必须在 ttyd bundle 之前加载 */
(function () {
  var Native = window.WebSocket;
  if (!Native || Native.__ckaHooked) return;

  var decoder = window.TextDecoder ? new TextDecoder('utf-8') : null;

  function ingest(payload) {
    // ttyd 输出帧：首字节 0x30 ('0')，其后是终端数据
    if (!payload) return;
    if (payload.charCodeAt(0) !== 48) return;
    window.__ckaOut = (window.__ckaOut || '') + payload.slice(1);
    if (window.__ckaOut.length > 500000) {
      window.__ckaOut = window.__ckaOut.slice(-250000);
    }
  }

  function onFrame(data) {
    try {
      if (typeof data === 'string') {
        ingest(data);
      } else if (data instanceof ArrayBuffer) {
        var u8 = new Uint8Array(data);
        if (u8.length === 0 || u8[0] !== 48) return;
        ingest(decoder ? decoder.decode(u8.subarray(1)) : String.fromCharCode.apply(null, u8.subarray(1)));
      } else if (data && typeof data.arrayBuffer === 'function') {
        data.arrayBuffer().then(function (ab) { onFrame(ab); });
      }
    } catch (e) {}
  }

  function Hooked(url, protocols) {
    var ws = protocols ? new Native(url, protocols) : new Native(url);
    window.__ckaWS = ws;
    try {
      ws.addEventListener('message', function (ev) { onFrame(ev.data); });
    } catch (e) {}
    return ws;
  }

  Hooked.prototype = Native.prototype;
  Hooked.CONNECTING = 0;
  Hooked.OPEN = 1;
  Hooked.CLOSING = 2;
  Hooked.CLOSED = 3;
  Hooked.__ckaHooked = true;
  window.WebSocket = Hooked;

  // 切回页面时，如果连接已断，立即自动重连
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    var x = window.__ttydXterm;
    if (!x) return;
    // 连接正常时什么都不做
    if (x.socket && (x.socket.readyState === Native.OPEN || x.socket.readyState === Native.CONNECTING)) return;
    // 清理可能的重连定时器，避免重复
    if (x._reconnectTimer) { clearTimeout(x._reconnectTimer); x._reconnectTimer = null; }
    x._pendingReconnect = !1;
    if (typeof x.refreshToken === 'function' && typeof x.connect === 'function') {
      x.refreshToken().then(x.connect.bind(x));
    }
  });
})();
