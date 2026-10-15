/* ============================================================
   K8s Quest - 答题系统（动态渲染 + 答错消耗1星换题）
   题目从 question-bank.js 加载，每题有多套变体
   ============================================================ */

(function () {
  // 记录每道题当前展示的变体索引，用于换题
  const variantIndex = {};

  function initQuiz() {
    const section = document.getElementById("quiz-section");
    if (!section) return;
    section.innerHTML = "";

    // 必须登录后才能答题（后端可用时必须是后端账号）
    const hasBackend = typeof GameSystem !== "undefined" && GameSystem.backendAvailable && GameSystem.backendAvailable();
    const canAnswer = hasBackend
      ? (typeof GameSystem !== "undefined" && GameSystem.isBackendAuthed ? GameSystem.isBackendAuthed() : false)
      : (typeof GameSystem !== "undefined" && GameSystem.getAuth ? !!GameSystem.getAuth()?.token : false);
    if (!canAnswer) {
      renderLocked(section);
      return;
    }

    const chapterId = document.body.getAttribute("data-chapter");
    const bank = (window.QUESTION_BANK && window.QUESTION_BANK[chapterId]) || [];
    if (bank.length === 0) return;

    // 章节标题
    const h2 = document.createElement("h2");
    h2.innerHTML = `🎯 本章测试（共 ${bank.length} 题，答对赚星星！答错可消耗 1 ⭐ 换一题）`;
    section.appendChild(h2);

    // 渲染每道题
    bank.forEach((slot, idx) => {
      const qid = slot.slot;
      variantIndex[qid] = 0;
      const quizEl = document.createElement("div");
      quizEl.className = "quiz";
      quizEl.dataset.qid = qid;
      quizEl.dataset.chapter = chapterId;
      quizEl.dataset.slotIndex = idx;
      section.appendChild(quizEl);
      renderVariant(quizEl, slot, 0);
    });
  }

  // 未登录时的锁定提示
  function renderLocked(section) {
    const h2 = document.createElement("h2");
    h2.textContent = "🎯 本章测试";
    section.appendChild(h2);

    const lock = document.createElement("div");
    lock.className = "quiz-locked";
    lock.innerHTML = `
      <div class="quiz-locked-icon">🔒</div>
      <div class="quiz-locked-title">登录后即可答题</div>
      <div class="quiz-locked-desc">答题会累计星星、解锁成就并计入排行榜，请先注册或登录账号。</div>
      <button class="quiz-login-btn" type="button">注册 / 登录</button>
    `;
    section.appendChild(lock);

    const btn = lock.querySelector(".quiz-login-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        if (typeof GameSystem !== "undefined" && GameSystem.showLoginModal) GameSystem.showLoginModal();
      });
    }
  }

  // 渲染某道题的指定变体
  function renderVariant(quizEl, slot, vIdx) {
    const v = slot.variants[vIdx] || slot.variants[0];
    const qid = quizEl.dataset.qid;
    const chapterId = quizEl.dataset.chapter;
    const idx = parseInt(quizEl.dataset.slotIndex) + 1;

    let optionsHtml = "";
    if (v.type === "choice") {
      const letters = ["A", "B", "C", "D", "E", "F"];
      optionsHtml = '<ul class="quiz-options">' +
        v.options.map((opt, i) =>
          `<li><label><input type="radio" name="${qid}" value="${letters[i]}" /> ${letters[i]}. ${opt}</label></li>`
        ).join("") + "</ul>";
    } else if (v.type === "multi") {
      const letters = ["A", "B", "C", "D", "E", "F"];
      optionsHtml = '<ul class="quiz-options">' +
        v.options.map((opt, i) =>
          `<li><label><input type="checkbox" name="${qid}" value="${letters[i]}" /> ${letters[i]}. ${opt}</label></li>`
        ).join("") + "</ul>";
    } else if (v.type === "judge") {
      optionsHtml = '<ul class="quiz-options">' +
        `<li><label><input type="radio" name="${qid}" value="T" /> 正确</label></li>` +
        `<li><label><input type="radio" name="${qid}" value="F" /> 错误</label></li>` +
        "</ul>";
    } else if (v.type === "text") {
      optionsHtml = '<ul class="quiz-options">' +
        `<li><input type="text" placeholder="输入你的答案" /></li>` +
        "</ul>";
    }

    const answerStr = formatAnswer(v);
    quizEl.innerHTML = `
      <div class="quiz-question">${idx}. ${v.q}<span class="star-badge">⭐${v.stars}</span></div>
      ${optionsHtml}
      <div class="quiz-actions">
        <button class="quiz-btn">提交答案</button>
      </div>
      <div class="quiz-feedback"><div class="feedback-title"></div><div class="feedback-msg"></div></div>
    `;
    quizEl.dataset.type = v.type;
    quizEl.dataset.answer = answerStr;
    quizEl.dataset.stars = v.stars;
    quizEl.dataset.explain = v.explain || "";
    quizEl.classList.remove("answered");

    const btn = quizEl.querySelector(".quiz-btn");
    btn.addEventListener("click", () => handleSubmit(quizEl, slot));
  }

  // 将答案统一格式化为字符串
  function formatAnswer(v) {
    if (v.type === "multi") {
      const letters = ["A", "B", "C", "D", "E", "F"];
      return v.answer.map(i => letters[i]).sort().join("|");
    } else if (v.type === "choice") {
      return ["A", "B", "C", "D", "E", "F"][v.answer];
    } else if (v.type === "judge") {
      return v.answer ? "T" : "F";
    }
    return v.answer;
  }

  async function handleSubmit(quizEl, slot) {
    const type = quizEl.dataset.type;
    const answer = quizEl.dataset.answer || "";
    const explain = quizEl.dataset.explain || "";
    const stars = parseInt(quizEl.dataset.stars || "1", 10);
    const chapterId = quizEl.dataset.chapter || "";
    const questionId = quizEl.dataset.qid || "";

    let userAnswer, isCorrect;

    if (type === "choice") {
      const selected = quizEl.querySelector('input[type="radio"]:checked');
      if (!selected) { showFeedback(quizEl, false, "请先选择一个选项", ""); return; }
      userAnswer = selected.value;
      isCorrect = userAnswer === answer;
    } else if (type === "multi") {
      const checked = Array.from(quizEl.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
      if (checked.length === 0) { showFeedback(quizEl, false, "请至少选择一个选项", ""); return; }
      const correct = answer.split("|").sort().join(",");
      userAnswer = checked.sort().join(",");
      isCorrect = userAnswer === correct;
    } else if (type === "text") {
      const input = quizEl.querySelector('input[type="text"]');
      userAnswer = (input?.value || "").trim().toLowerCase();
      const validAnswers = answer.toLowerCase().split("|");
      isCorrect = validAnswers.some(a => userAnswer.includes(a));
    } else if (type === "judge") {
      const selected = quizEl.querySelector('input[type="radio"]:checked');
      if (!selected) { showFeedback(quizEl, false, "请先选择", ""); return; }
      userAnswer = selected.value;
      isCorrect = userAnswer === answer;
    }

    if (isCorrect) {
      const result = await GameSystem.addStars(chapterId, questionId, stars);
      let msg = "回答正确！";
      if (!result.alreadyDone) {
        msg += ` 获得 ${result.newStars || stars} ⭐`;
        if (result.chapterCompleted) msg += " 🎉 章节通关奖励 +5 ⭐";
        const rect = quizEl.getBoundingClientRect();
        GameSystem.flyStars(rect.left + rect.width / 2, rect.top, result.newStars || stars);
        if (result.newAchievements) {
          result.newAchievements.forEach((a, i) => setTimeout(() => GameSystem.showAchievementPopup(a), i * 800));
        }
        GameSystem.renderStarDisplay();
      } else {
        msg += "（此题已答过，不重复加星）";
      }
      showFeedback(quizEl, true, msg, explain);
      quizEl.classList.add("answered");
    } else {
      showFeedback(quizEl, false, "回答错误，再想想~", explain);
      // 显示重新答题按钮
      showRetryButton(quizEl, slot);
    }
  }

  // 显示重新答题按钮（消耗1星换一题）
  function showRetryButton(quizEl, slot) {
    // 避免重复添加
    if (quizEl.querySelector(".quiz-retry-btn")) return;
    const actions = quizEl.querySelector(".quiz-actions");
    const retryBtn = document.createElement("button");
    retryBtn.className = "quiz-retry-btn";
    retryBtn.innerHTML = "🔄 重新答题（消耗 1 ⭐）";
    retryBtn.title = "消耗 1 颗星星，换一道新题";
    retryBtn.addEventListener("click", async () => {
      // 消耗 1 星
      const r = await GameSystem.spendStars(1);
      if (!r.success) {
        showFeedback(quizEl, false, "星星不足，无法重新答题！去其他章节答题赚星星吧~", "");
        return;
      }
      GameSystem.renderStarDisplay();
      // 切换到不同变体
      const qid = quizEl.dataset.qid;
      const cur = variantIndex[qid] || 0;
      const total = slot.variants.length;
      let next = (cur + 1) % total;
      // 尽量不重复同一题
      if (total > 1 && next === cur) next = (next + 1) % total;
      variantIndex[qid] = next;
      renderVariant(quizEl, slot, next);
      // 提示
      showFeedback(quizEl, false, "已换新题，请重新作答~", "");
    });
    actions.appendChild(retryBtn);
  }

  function showFeedback(quizEl, correct, title, explain) {
    const fb = quizEl.querySelector(".quiz-feedback");
    if (!fb) return;
    fb.className = "quiz-feedback show " + (correct ? "correct" : "wrong");
    fb.querySelector(".feedback-title").textContent = title;
    fb.querySelector(".feedback-msg").textContent = explain;
  }

  document.addEventListener("DOMContentLoaded", initQuiz);
  // 登录/注册成功后自动解锁并渲染题目
  window.addEventListener("k8squest:auth", initQuiz);
})();
