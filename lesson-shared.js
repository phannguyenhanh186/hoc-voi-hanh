// lesson-shared.js
// Hạ tầng dùng chung cho các trang kỹ năng (vocabulary/grammar/listening/reading.html):
// audio player, các tiện ích DOM nhỏ, khung "section shell" (thanh trên có nút back),
// và bộ máy quiz/stepper/vòng tròn kết quả dùng chung.
// Nạp file này TRƯỚC script riêng của từng trang.

let voice = 'nam';
try { voice = localStorage.getItem('voice') || 'nam'; } catch (e) {}

    function resolveAudio(path) { return (path || '').replace('{voice}', voice); }

    let player = new Audio();
    player.preload = 'auto';
    let currentEl = null;
    const customAudios = [];
    player.addEventListener('ended', function () { if (currentEl) currentEl.classList.remove('playing'); });


    function play(src, elm) {
      if (!src) return;
      customAudios.forEach(function (a) { try { a.pause(); } catch (e) {} });
      if (currentEl) currentEl.classList.remove('playing');
      currentEl = elm || null;
      if (currentEl) currentEl.classList.add('playing');
      try { player.pause(); } catch (e) {}
      player.src = src;
      try { player.currentTime = 0; } catch (e) {}
      const pr = player.play();
      if (pr && pr.catch) pr.catch(function (e) {
        if (currentEl) currentEl.classList.remove('playing');
        console.warn('Could not play audio:', src, e && e.message);
      });
    }


    function fmtAudioTime(s) {
      if (!isFinite(s) || s < 0) return '0:00';
      s = Math.floor(s);
      const m = Math.floor(s / 60), sec = s % 60;
      return m + ':' + (sec < 10 ? '0' : '') + sec;
    }


    function renderAudioPlayer(rawSrc) {
      const wrap = el('div', 'audio-player');
      if (!rawSrc) { wrap.classList.add('audio-player-disabled'); return wrap; }
      const src = resolveAudio(rawSrc);
      const audio = new Audio(src);
      audio.preload = 'metadata';
      customAudios.push(audio);

      const btn = el('button', 'audio-play-btn', '▶');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Play / pause');

      const seek = document.createElement('input');
      seek.type = 'range'; seek.min = '0'; seek.max = '0'; seek.value = '0'; seek.step = '0.1';
      seek.className = 'audio-seek';

      const time = el('span', 'audio-time', '0:00 / 0:00');

      let seeking = false;
      audio.addEventListener('loadedmetadata', function () {
        seek.max = String(audio.duration || 0);
        time.textContent = fmtAudioTime(0) + ' / ' + fmtAudioTime(audio.duration);
      });
      audio.addEventListener('timeupdate', function () {
        if (!seeking) seek.value = String(audio.currentTime);
        time.textContent = fmtAudioTime(audio.currentTime) + ' / ' + fmtAudioTime(audio.duration);
      });
      audio.addEventListener('play', function () { btn.textContent = '⏸'; btn.classList.add('playing'); });
      audio.addEventListener('pause', function () { btn.textContent = '▶'; btn.classList.remove('playing'); });
      audio.addEventListener('ended', function () { btn.textContent = '▶'; btn.classList.remove('playing'); });

      btn.addEventListener('click', function () {
        if (audio.paused) {
          try { player.pause(); } catch (e) {}
          customAudios.forEach(function (a) { if (a !== audio) { try { a.pause(); } catch (e) {} } });
          const pr = audio.play();
          if (pr && pr.catch) pr.catch(function (e) { console.warn('Could not play audio:', src, e && e.message); });
        } else {
          audio.pause();
        }
      });
      seek.addEventListener('input', function () { seeking = true; audio.currentTime = Number(seek.value); });
      seek.addEventListener('change', function () { seeking = false; });

      wrap.appendChild(btn);
      wrap.appendChild(seek);
      wrap.appendChild(time);
      return wrap;
    }


    function el(tag, cls, txt) {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (txt != null) n.textContent = txt;
      return n;
    }


    function playBtn(src) {
      const b = el('button', 'play-sentence');
      b.type = 'button';
      b.setAttribute('aria-label', 'Play audio');
      b.innerHTML = '▶';
      if (src) { b.addEventListener('click', function () { play(resolveAudio(src), b); }); }
      else { b.disabled = true; }
      return b;
    }


    function norm(s) {
      return (s || '')
        .toString().trim().toLowerCase()
        .normalize('NFC')
        .replace(/[.,!?;:"'“”]/g, '')
        .replace(/\s+/g, ' ');
    }


    function emptyNote(text) { return el('p', 'note', text); }


    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
      }
      return a;
    }

    // ---------- Hub (màn hình chọn phần) / Tabs ----------
    // Bấm vào 1 thẻ trên hub sẽ chuyển sang URL riêng (lesson.html?...&tab=X) — một trang thật sự,
    // có trong lịch sử trình duyệt. Quay lại hub dùng nút back có sẵn (mũi tên "←" trong từng phần),
    // nút này gọi history.back() để quay lại đúng trang hub vừa rồi.
    const $hub = document.getElementById('lesson-hub');


    function makeToggleSection(label, buildContent) {
      const wrap = el('div', 'toggle-section');
      const btn = el('button', 'toggle-btn', label);
      btn.type = 'button';
      const content = el('div', 'toggle-content hidden');
      content.appendChild(buildContent());
      btn.addEventListener('click', function () {
        const willOpen = content.classList.contains('hidden');
        content.classList.toggle('hidden');
        btn.classList.toggle('open', willOpen);
      });
      wrap.appendChild(btn);
      wrap.appendChild(content);
      return wrap;
    }

    // ========================================================
    // NỘI DUNG DANH XƯNG (pronounContent) — hiển thị trực tiếp trong tab Ngữ pháp
    // ========================================================


    function createResultsRing(total) {
      const svgNS = 'http://www.w3.org/2000/svg';
      const r = 42, c = 2 * Math.PI * r;
      const wrap = el('div', 'results-summary hidden');
      const ringWrap = el('div', 'results-ring-wrap');
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('class', 'results-ring-svg');
      const bg = document.createElementNS(svgNS, 'circle');
      bg.setAttribute('cx', '50'); bg.setAttribute('cy', '50'); bg.setAttribute('r', String(r));
      bg.setAttribute('class', 'ring-bg');
      const correctArc = document.createElementNS(svgNS, 'circle');
      correctArc.setAttribute('cx', '50'); correctArc.setAttribute('cy', '50'); correctArc.setAttribute('r', String(r));
      correctArc.setAttribute('class', 'ring-correct');
      const wrongArc = document.createElementNS(svgNS, 'circle');
      wrongArc.setAttribute('cx', '50'); wrongArc.setAttribute('cy', '50'); wrongArc.setAttribute('r', String(r));
      wrongArc.setAttribute('class', 'ring-wrong');
      svg.appendChild(bg); svg.appendChild(correctArc); svg.appendChild(wrongArc);
      const center = el('div', 'ring-center');
      ringWrap.appendChild(svg);
      ringWrap.appendChild(center);

      function legendRow(cls, label) {
        const row = el('div', 'legend-row');
        const dot = el('span', 'legend-dot ' + cls);
        const lbl = el('span', 'legend-label', label + ':');
        const count = el('span', 'legend-count', '0 questions');
        row.appendChild(dot); row.appendChild(lbl); row.appendChild(count);
        return { row: row, count: count };
      }
      const rowCorrect = legendRow('dot-correct', 'Correct');
      const rowWrong = legendRow('dot-wrong', 'Sai');
      const rowSkip = legendRow('dot-skip', 'Skipped');
      const legend = el('div', 'results-legend');
      legend.appendChild(rowCorrect.row);
      legend.appendChild(rowWrong.row);
      legend.appendChild(rowSkip.row);

      wrap.appendChild(ringWrap);
      wrap.appendChild(legend);

      function update(correct, incorrect) {
        const skipped = Math.max(0, total - correct - incorrect);
        const correctLen = total ? (correct / total) * c : 0;
        const wrongLen = total ? (incorrect / total) * c : 0;
        correctArc.setAttribute('stroke-dasharray', correctLen + ' ' + (c - correctLen));
        correctArc.setAttribute('stroke-dashoffset', '0');
        wrongArc.setAttribute('stroke-dasharray', wrongLen + ' ' + (c - wrongLen));
        wrongArc.setAttribute('stroke-dashoffset', String(-correctLen));
        center.innerHTML = '<div class="ring-score">' + correct + '/' + total + '</div><div class="ring-label">correct</div>';
        rowCorrect.count.textContent = correct + ' questions';
        rowWrong.count.textContent = incorrect + ' questions';
        rowSkip.count.textContent = skipped + ' questions';
      }
      function reveal() { wrap.classList.remove('hidden'); }
      update(0, 0);
      return { el: wrap, update: update, reveal: reveal };
    }

    // Tiện ích: theo dõi 1 mảng trạng thái (true/false/null); chỉ tính & hiện ring khi finalize() (bấm Nộp bài)


    function trackQuizState(total) {
      const state = new Array(total).fill(null);
      const ring = createResultsRing(total);
      function set(idx, ok) { state[idx] = ok; }
      function finalize() {
        const correctCount = state.filter(function (s) { return s === true; }).length;
        const wrongCount = state.filter(function (s) { return s === false; }).length;
        ring.update(correctCount, wrongCount);
        ring.reveal();
      }
      return { ring: ring, set: set, finalize: finalize };
    }

    // Thêm nút "Nộp bài" cuối 1 bài — bấm vào mới tính & hiện vòng tròn kết quả; đồng thời tính là đã hoàn thành phần này


    function appendSubmitAndRing(container, tracker, onSubmit) {
      const progressKeyForThis = nextProgressKey();
      const submitBtn = el('button', 'btn-check btn-submit', 'Submit ✓');
      submitBtn.type = 'button';
      submitBtn.addEventListener('click', function () {
        tracker.finalize();
        markProgressDone(progressKeyForThis);
        if (onSubmit) onSubmit();
      });
      container.appendChild(submitBtn);
      container.appendChild(tracker.ring.el);
    }

    // Chỉ tạo vòng tròn kết quả (không có nút Submit riêng) — dùng khi từng câu đã tự chấm ngay lúc làm,
    // và kết quả tổng sẽ tự hiện ra khi làm xong câu cuối (thông qua opts.onFinish của buildStepper).
    // Không tự appendChild — để caller tự chèn ringEl vào đúng vị trí (thường là sau khối câu hỏi).


    function createResultsRingReveal(tracker) {
      const progressKeyForThis = nextProgressKey();
      return {
        ringEl: tracker.ring.el,
        finish: function () {
          tracker.finalize();
          markProgressDone(progressKeyForThis);
        }
      };
    }


    function buildQuizBlock(quiz, onReviewTheory) {
      const wrap = el('div', 'gram2-quiz-wrap');
      wrap.appendChild(el('div', 'gram2-quiz-banner', 'Choose the correct answers.'));

      const progressTrack = el('div', 'gram2-quiz-progress-track');
      const progressFill = el('div', 'gram2-quiz-progress-fill');
      progressTrack.appendChild(progressFill);
      wrap.appendChild(progressTrack);

      const qSlot = el('div', 'gram2-quiz-item');
      wrap.appendChild(qSlot);

      let tracker = trackQuizState(quiz.length);
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      let i = 0;

      function updateProgress() {
        const pct = quiz.length ? Math.round((i / quiz.length) * 100) : 0;
        progressFill.style.width = pct + '%';
      }

      function renderQuestion() {
        qSlot.innerHTML = '';
        if (i >= quiz.length) {
          updateProgress();
          tracker.finalize();
          markProgressDone(nextProgressKey());
          qSlot.appendChild(tracker.ring.el);

          const actionsRow = el('div', 'gram2-quiz-result-actions');
          const retryBtn = el('button', 'btn-check btn-secondary gram2-quiz-next', '↺ Try again'); retryBtn.type = 'button';
          retryBtn.addEventListener('click', function () {
            i = 0;
            tracker = trackQuizState(quiz.length);
            renderQuestion();
          });
          actionsRow.appendChild(retryBtn);
          if (onReviewTheory) {
            const reviewBtn = el('button', 'btn-purple gram2-quiz-next', 'Review theory →'); reviewBtn.type = 'button';
            reviewBtn.addEventListener('click', function () { onReviewTheory(); });
            actionsRow.appendChild(reviewBtn);
          }
          qSlot.appendChild(actionsRow);
          return;
        }
        const q = quiz[i];
        qSlot.appendChild(el('p', 'gram2-quiz-question', (i + 1) + '. ' + q.question));
        const optWrap = el('div', 'gram2-quiz-options');
        let answered = false;
        (q.options || []).forEach(function (opt, oi) {
          const card = el('button', 'gram2-quiz-option'); card.type = 'button';
          card.appendChild(el('span', 'gram2-quiz-badge', letters[oi] || ''));
          card.appendChild(el('span', 'gram2-quiz-option-text', opt));
          card.addEventListener('click', function () {
            if (answered) return;
            answered = true;
            const ok = opt === q.answer;
            card.classList.add(ok ? 'opt-correct' : 'opt-wrong');
            if (!ok) {
              Array.from(optWrap.children).forEach(function (b) {
                if (b.querySelector('.gram2-quiz-option-text').textContent === q.answer) b.classList.add('opt-correct');
              });
            }
            tracker.set(i, ok);
            const nextBtn = el('button', 'btn-purple gram2-quiz-next', i === quiz.length - 1 ? 'Xem kết quả →' : 'Câu tiếp theo →');
            nextBtn.type = 'button';
            nextBtn.addEventListener('click', function () { i++; updateProgress(); renderQuestion(); });
            qSlot.appendChild(nextBtn);
          });
          optWrap.appendChild(card);
        });
        qSlot.appendChild(optWrap);
        updateProgress();
      }

      renderQuestion();
      return wrap;
    }


    function renderQuizToggle(quiz, label) {
      return makeToggleSection(label || 'Small quiz', function () {
        return buildQuizBlock(quiz);
      });
    }

    // Render pattern + notes + toggle(examples) + optional tip + optional answer-note/examples + toggle(quiz)
    // into `container`. Used both for standalone grammar points and for subsections grouped in one card.


    function buildSectionShell(labelText, onBack) {
      const shell = el('div', 'gram2-shell');
      const topbar = el('div', 'gram2-topbar');
      const backBtn = el('button', 'gram2-back-btn', '←'); backBtn.type = 'button';
      backBtn.setAttribute('aria-label', 'Back');
      backBtn.addEventListener('click', onBack);
      topbar.appendChild(backBtn);
      topbar.appendChild(el('div', 'gram2-tab-pill', labelText));
      shell.appendChild(topbar);
      return shell;
    }
    // Back về màn hình chọn phần (hub / landing page của bài)
    // Nút "←" có sẵn trong từng phần: điều hướng THẲNG về URL hub (không phải tab nào),
    // thay vì history.back() — để luôn về đúng landing page dù học viên vào tab này
    // bằng cách nào (từ hub, mở link trực tiếp, bookmark, v.v.), không phụ thuộc lịch sử trình duyệt.


    function checkRow(ok) { return el('span', 'result ' + (ok ? 'result-ok' : 'result-bad'), ok ? '✓' : '✗'); }


    function buildStepper(container, steps, renderStepFn, opts) {
      opts = opts || {};
      let i = 0;
      let answeredForStep = false;
      const stage = el('div', opts.stageClass || '');
      const dots = el('div', 'step-dots');
      const nav = el('div', 'step-nav');
      container.appendChild(stage);
      container.appendChild(dots);
      container.appendChild(nav);

      function markAnswered() {
        answeredForStep = true;
        if (nextBtnRef) nextBtnRef.disabled = false;
      }

      let nextBtnRef = null;

      function draw() {
        answeredForStep = false;
        stage.innerHTML = '';
        stage.appendChild(renderStepFn(steps[i], i, markAnswered));

        dots.innerHTML = '';
        steps.forEach(function (_, idx) { dots.appendChild(el('span', 'step-dot' + (idx === i ? ' active' : ''))); });

        nav.innerHTML = '';
        const isLast = i >= steps.length - 1;
        if (!opts.noBack) {
          const prev = el('button', 'btn-check btn-secondary', '← Back'); prev.type = 'button';
          prev.style.visibility = i === 0 ? 'hidden' : 'visible';
          prev.addEventListener('click', function () { i--; draw(); });
          nav.appendChild(prev);
        }
        const next = el('button', 'btn-check', isLast ? (opts.lastLabel || 'Done ✓') : 'Next →'); next.type = 'button';
        if (opts.requireAnswer) next.disabled = !answeredForStep;
        next.addEventListener('click', function () {
          if (!isLast) { i++; draw(); }
          else if (opts.onFinish) { opts.onFinish(); }
        });
        nav.appendChild(next);
        nextBtnRef = next;
      }
      draw();
    }


// ---------- Tiến độ học theo TỪNG KỸ NĂNG (mỗi trang skill có key localStorage riêng) ----------
// storageKey ví dụ: 'progress:mam:lesson1:grammar'
function createProgressTracker(storageKey) {
  let progressCounter = 0;
  const state = { total: 0, done: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object') state.done = saved.done || {};
  } catch (e) {}
  function saveProgress() { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (e) {} }
  function nextProgressKey(explicitKey) {
    const k = explicitKey || ('ex' + progressCounter);
    progressCounter++;
    if (state.total < progressCounter) state.total = progressCounter;
    return k;
  }
  function markProgressDone(key) {
    if (state.done[key]) return;
    state.done[key] = true;
    saveProgress();
  }
  function doneCount() {
    return Object.keys(state.done).filter(function (k) { return state.done[k]; }).length;
  }
  return { state: state, nextProgressKey: nextProgressKey, markProgressDone: markProgressDone, saveProgress: saveProgress, doneCount: doneCount };
}
