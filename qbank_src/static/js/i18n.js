/* 最小 i18n：把 data-i18n 标签替换为默认中文（fallback）。
   原始 i18n.js 可能包含中英文字典，这里只做保底：若元素有 data-i18n 属性
   且文本为空，则保留属性里已有的中文默认值即可。
   由于模板里 data-i18n 元素都已带中文 innerText，这里无需额外处理，
   只要不报错即可。 */
(function () {
  try {
    document.documentElement.removeAttribute('data-lang-pending');
  } catch (e) {}
})();
