/* ============================================================
   K8s Quest - 答题系统
   支持单选、多选、填空，答对获得星星
   ============================================================ */

(function () {
  function initQuiz() {
    const quizzes = document.querySelectorAll(".quiz");
    quizzes.forEach((quiz) => {
      const btn = quiz.querySelector(".quiz-btn");
      if (!btn) return;
      btn.addEventListener("click", () => handleSubmit(quiz));
    });
  }

  function handleSubmit(quiz) {
    const type = quiz.dataset.type || "choice";
    const answer = quiz.dataset.answer || "";
    const explain = quiz.dataset.explain || "";
    const stars = parseInt(quiz.dataset.stars || "1", 10);
    const chapterId = quiz.dataset.chapter || "";
    const questionId = quiz.dataset.qid || "";

    let userAnswer, isCorrect;

    if (type === "choice") {
      const selected = quiz.querySelector('input[type="radio"]:checked');
      if (!selected) {
        showFeedback(quiz, false, "请先选择一个选项", "");
        return;
      }
      userAnswer = selected.value;
      isCorrect = userAnswer === answer;
    } else if (type === "multi") {
      const checked = Array.from(quiz.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
      if (checked.length === 0) {
        showFeedback(quiz, false, "请至少选择一个选项", "");
        return;
      }
      const correct = answer.split("|").sort().join(",");
      userAnswer = checked.sort().join(",");
      isCorrect = userAnswer === correct;
    } else if (type === "text") {
      const input = quiz.querySelector('input[type="text"]');
      userAnswer = (input?.value || "").trim().toLowerCase();
      const validAnswers = answer.toLowerCase().split("|");
      isCorrect = validAnswers.some(a => userAnswer.includes(a));
    } else if (type === "judge") {
      const selected = quiz.querySelector('input[type="radio"]:checked');
      if (!selected) {
        showFeedback(quiz, false, "请先选择", "");
        return;
      }
      userAnswer = selected.value;
      isCorrect = userAnswer === answer;
    }

    if (isCorrect) {
      // 加星星
      const result = GameSystem.addStars(chapterId, questionId, stars);
      let msg = "回答正确！";
      if (!result.alreadyDone) {
        msg += ` 获得 ${stars} ⭐`;
        // 星星动画
        const rect = quiz.getBoundingClientRect();
        GameSystem.flyStars(rect.left + rect.width / 2, rect.top, stars);
        // 更新顶部星星数
        GameSystem.renderStarDisplay();
      } else {
        msg += "（此题已答过，不重复加星）";
      }
      showFeedback(quiz, true, msg, explain);
      // 标记题已答
      quiz.classList.add("answered");
    } else {
      showFeedback(quiz, false, "回答错误，再想想~", explain);
    }
  }

  function showFeedback(quiz, correct, title, explain) {
    const fb = quiz.querySelector(".quiz-feedback");
    if (!fb) return;
    fb.className = "quiz-feedback show " + (correct ? "correct" : "wrong");
    fb.querySelector(".feedback-title").textContent = title;
    fb.querySelector(".feedback-msg").textContent = explain;
  }

  document.addEventListener("DOMContentLoaded", initQuiz);
})();
