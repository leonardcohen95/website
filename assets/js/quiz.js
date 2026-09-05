/* ============================================================
   测验交互逻辑
   支持：单选题、简答题
   用法：在 HTML 中用 data-* 属性定义题目，脚本自动接管
   ============================================================ */

(function () {
  "use strict";

  /* 初始化所有测验 */
  function initAllQuizzes() {
    document.querySelectorAll(".quiz").forEach((quizEl, idx) => {
      const type = quizEl.getAttribute("data-type"); // "choice" | "text"
      const btn = quizEl.querySelector(".quiz-btn");
      const feedback = quizEl.querySelector(".quiz-feedback");
      if (!btn) return;

      btn.addEventListener("click", () => {
        const result =
          type === "text" ? checkText(quizEl) : checkChoice(quizEl);
        showFeedback(feedback, result);
      });

      // 允许在输入框中按回车提交
      const input = quizEl.querySelector('input[type="text"]');
      if (input) {
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") btn.click();
        });
      }
    });
  }

  /* 单选校验 */
  function checkChoice(quizEl) {
    const correct = quizEl.getAttribute("data-answer");
    const selected = quizEl.querySelector('input[type="radio"]:checked');
    const explanation = quizEl.getAttribute("data-explain") || "";
    if (!selected) {
      return { ok: false, msg: "请先选择一个选项再提交。" };
    }
    if (selected.value === correct) {
      return {
        ok: true,
        msg: "回答正确！" + (explanation ? " 解析：" + explanation : ""),
      };
    }
    return {
      ok: false,
      msg: "回答有误。" + (explanation ? " 解析：" + explanation : ""),
    };
  }

  /* 简答校验（去除首尾空格、忽略大小写、支持多个正确答案用 | 分隔）*/
  function checkText(quizEl) {
    const input = quizEl.querySelector('input[type="text"]');
    const answer = (quizEl.getAttribute("data-answer") || "").trim();
    const explanation = quizEl.getAttribute("data-explain") || "";
    const userVal = (input.value || "").trim().toLowerCase();
    if (!userVal) {
      return { ok: false, msg: "请输入你的答案再提交。" };
    }
    const answers = answer.split("|").map((a) => a.trim().toLowerCase());
    const ok = answers.some((a) => a && userVal.includes(a));
    if (ok) {
      return {
        ok: true,
        msg: "回答正确！" + (explanation ? " 解析：" + explanation : ""),
      };
    }
    return {
      ok: false,
      msg:
        "回答有误。参考答案：" +
        answer.split("|")[0] +
        (explanation ? "。 解析：" + explanation : ""),
    };
  }

  /* 显示反馈 */
  function showFeedback(feedbackEl, result) {
    if (!feedbackEl) return;
    feedbackEl.classList.remove("correct", "wrong", "show");
    feedbackEl.classList.add(result.ok ? "correct" : "wrong", "show");
    const titleEl = feedbackEl.querySelector(".feedback-title");
    if (titleEl) titleEl.textContent = result.ok ? "答对了" : "再想想";
    const msgEl = feedbackEl.querySelector(".feedback-msg");
    if (msgEl) msgEl.textContent = result.msg;
  }

  document.addEventListener("DOMContentLoaded", initAllQuizzes);
})();
