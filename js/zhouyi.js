// 周易六爻起卦 · 核心逻辑（从 zhouyi-app/index.html 抽取）
(function() {
  "use strict";

  var DATA = window.YIJING || [];

  var LINE_NAMES = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];

  var OPTIONS = [
    { key: "laoyin",  label: "3字",     sub: "老阴 ×", yang: 0, moving: true  },
    { key: "shaoyang", label: "1背2字", sub: "少阳",    yang: 1, moving: false },
    { key: "shaoyin",  label: "2背1字", sub: "少阴",    yang: 0, moving: false },
    { key: "laoyang",  label: "3背",    sub: "老阳 ○", yang: 1, moving: true  }
  ];

  var lines = [null, null, null, null, null, null];

  var lineCardsEl = document.getElementById("lineCards");
  var progressEl = document.getElementById("progress");
  var resultPanel = document.getElementById("resultPanel");
  var resultBox = document.getElementById("resultBox");

  function findHex(bits) {
    return DATA.find(function(h) {
      return h.bits.join("") === bits.join("");
    });
  }

  function buildLineCards() {
    lineCardsEl.innerHTML = "";
    for (var i = 0; i < 6; i++) {
      var card = document.createElement("div");
      card.className = "line-card";
      card.dataset.index = i;

      var title = document.createElement("div");
      title.className = "line-title";
      title.innerHTML = "<span>第" + (i + 1) + "爻（" + LINE_NAMES[i] + "）</span><span class='line-status' id='status-" + i + "'></span>";
      card.appendChild(title);

      var options = document.createElement("div");
      options.className = "options";
      let idx = i;

      OPTIONS.forEach(function(opt) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "opt";
        btn.dataset.key = opt.key;
        btn.dataset.index = idx;
        btn.innerHTML = opt.label + "<small>" + opt.sub + "</small>";
        btn.addEventListener("click", function() {
          lines[idx] = {
            yang: opt.yang,
            moving: opt.moving,
            key: opt.key
          };
          refreshUI();
          maybeRender();
        });
        options.appendChild(btn);
      });

      card.appendChild(options);
      lineCardsEl.appendChild(card);
    }
  }

  function refreshUI() {
    var filled = 0;
    for (var i = 0; i < 6; i++) {
      var card = lineCardsEl.children[i];
      var status = card.querySelector(".line-status");
      var btns = card.querySelectorAll(".opt");

      btns.forEach(function(btn) {
        var key = btn.dataset.key;
        if (lines[i] && lines[i].key === key) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      if (lines[i]) {
        filled++;
        var opt = OPTIONS.find(function(o) { return o.key === lines[i].key; });
        status.textContent = opt.label + " · " + opt.sub;
        card.classList.remove("current");
      } else {
        status.textContent = "未输入";
        card.classList.add("current");
      }
    }

    progressEl.textContent = "已输入 " + filled + " / 6";

    document.getElementById("undoBtn").disabled = (filled === 0);
  }

  function maybeRender() {
    for (var i = 0; i < 6; i++) {
      if (!lines[i]) return;
    }
    renderResult();
  }

  function renderResult() {
    var originalBits = lines.map(function(l) { return l.yang; });
    var changedBits = lines.map(function(l) {
      return l.moving ? (1 - l.yang) : l.yang;
    });

    var original = findHex(originalBits);
    var changed = findHex(changedBits);

    if (!original) {
      resultBox.innerHTML = "<p>未找到对应卦象，请检查输入。</p>";
      resultPanel.classList.remove("hidden");
      return;
    }

    var movingIndexes = [];
    for (var i = 0; i < 6; i++) {
      if (lines[i].moving) movingIndexes.push(i);
    }

    var movingText = movingIndexes.length
      ? "动爻：" + movingIndexes.map(function(i) { return "第" + (i + 1) + "爻"; }).join("、")
      : "无动爻";

    var html = "";

    html += '<div class="result-title">';
    html += '<div class="gua-name">第' + original.id + '卦 · ' + original.name + '</div>';
    html += '<div class="gua-image">' + original.image + (original.summary ? " · " + original.summary : "") + '</div>';
    html += '</div>';

    html += '<div class="hexagrams">';
    html += hexBlock("本卦", originalBits, true);
    if (changed && changed.id !== original.id) {
      html += '<div class="arrow">→</div>';
      html += hexBlock("变卦", changedBits, false);
    }
    html += '</div>';

    html += '<div class="moving-info">' + movingText + '</div>';

    // 关联卦象：互卦、错卦、综卦
    var huBits = [originalBits[1], originalBits[2], originalBits[3], originalBits[2], originalBits[3], originalBits[4]];
    var cuoBits = originalBits.map(function(b) { return 1 - b; });
    var zongBits = originalBits.slice().reverse();
    var hu = findHex(huBits);
    var cuo = findHex(cuoBits);
    var zong = findHex(zongBits);
    html += '<div class="section-title">关联卦象</div>';
    html += '<div class="related-grid">';
    html += relatedBlock("互卦", hu);
    html += relatedBlock("错卦", cuo);
    html += relatedBlock("综卦", zong);
    html += '</div>';

    // 本卦原文
    html += '<div class="section-title" id="originalAnchor">《周易》原文 · 本卦</div>';
    html += guaciHtml(original);
    html += yaociHtml(original, movingIndexes);
    html += detailsHtml(original);

    // 变卦
    if (changed && changed.id !== original.id) {
      html += '<div class="section-title">变卦 · ' + changed.name + '</div>';
      html += guaciHtml(changed);
      html += '<details><summary>查看变卦六爻爻辞</summary>';
      html += yaociHtml(changed, []);
      html += '</details>';
    }

    // 六爻装卦
    html += zhuangGuaHtml(original);

    // 在线原文链接
    if (original.src) {
      html += '<a class="source-link" href="' + original.src + '" target="_blank" rel="noopener">打开在线《周易》原文 ↗</a>';
    }

    resultBox.innerHTML = html;
    resultPanel.classList.remove("hidden");

    // 自动定位到结果/原文区域
    setTimeout(function() {
      var anchor = document.getElementById("originalAnchor");
      var target = anchor || resultPanel;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function zhuangGuaHtml(hex) {
    var zg = window.ZHUANG_GUA && window.ZHUANG_GUA[hex.id];
    if (!zg || !hex.lines) return "";
    var html = '<div class="section-title">六爻装卦 · ' + hex.name + '</div>';
    html += '<div class="note">八宫：' + zg.palace + '（' + zg.element + '） · 类型：' + zg.type + ' · 世爻：' + zg.shi + '爻 · 应爻：' + zg.ying + '爻</div>';
    html += '<ul class="line-list">';
    for (var i = 0; i < 6; i++) {
      var line = hex.lines[i];
      var marks = '';
      if (zg.shi === i + 1) marks += '<span class="shi-ying">世</span>';
      if (zg.ying === i + 1) marks += '<span class="shi-ying">应</span>';
      html += '<li>';
      html += '<span class="line-name">' + escapeHtml(line.name) + '</span>';
      html += escapeHtml(zg.branches[i]) + ' · ' + escapeHtml(zg.sixQin[i]) + marks;
      html += '</li>';
    }
    html += '</ul>';
    return html;
  }

  function relatedBlock(title, hex) {
    if (!hex) return '';
    return '<div class="related-item"><div class="hexagram">' + tinyHex(hex.bits) + '</div><div class="rel-name">' + title + ' · ' + hex.name + '</div><div class="rel-image">' + hex.image + '</div></div>';
  }

  function tinyHex(bits) {
    var html = '';
    for (var i = 5; i >= 0; i--) {
      var yang = bits[i] === 1;
      html += '<div class="hx-line ' + (yang ? "yang" : "yin") + '">';
      html += yang ? '<span class="bar"></span>' : '<span class="bar"></span><span class="bar"></span>';
      html += '</div>';
    }
    return html;
  }

  function hexBlock(title, bits, showMoving) {
    var html = '<div class="hex-block"><div class="caption">' + title + '</div><div class="hexagram">';
    for (var i = 5; i >= 0; i--) {
      var yang = bits[i] === 1;
      var moving = showMoving && lines[i] && lines[i].moving;
      var mark = "";
      if (moving) {
        mark = yang ? "○" : "×";
      }
      html += '<div class="hx-line ' + (yang ? "yang" : "yin") + (moving ? " moving" : "") + '">';
      html += yang
        ? '<span class="bar"></span>'
        : '<span class="bar"></span><span class="bar"></span>';
      if (mark) html += '<span class="hx-mark">' + mark + '</span>';
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function guaciHtml(hex) {
    if (!hex.guaci) return "";
    return '<div class="guaci"><strong>卦辞：</strong>' + escapeHtml(hex.guaci) + '</div>';
  }

  function yaociHtml(hex, movingIndexes) {
    if (!hex.lines || !hex.lines.length) return "";
    var html = '<ul class="line-list">';
    hex.lines.forEach(function(line, i) {
      var isMoving = movingIndexes.indexOf(i) >= 0;
      html += '<li class="' + (isMoving ? "moving" : "") + '">';
      html += escapeHtml(line.text);
      if (line.imageText) {
        html += '<span class="image-text">' + escapeHtml(line.imageText) + '</span>';
      }
      html += '</li>';
    });
    html += '</ul>';
    return html;
  }

  function detailsHtml(hex) {
    var html = "";
    if (hex.tuan) {
      html += '<details><summary>彖传</summary><p>' + escapeHtml(hex.tuan) + '</p></details>';
    }
    if (hex.xiang) {
      html += '<details><summary>象传</summary><p>' + escapeHtml(hex.xiang) + '</p></details>';
    }
    // 乾卦六爻皆动用九、坤卦六爻皆动用六
    if (hex.id === 1 && allMovingAreYang()) {
      html += '<div class="note" style="margin-top:10px">六爻皆动，传统另参《用九》：“见群龙无首，吉。”</div>';
    }
    if (hex.id === 2 && allMovingAreYin()) {
      html += '<div class="note" style="margin-top:10px">六爻皆动，传统另参《用六》：“利永贞。”</div>';
    }
    return html;
  }

  function allMovingAreYang() {
    return lines.every(function(l) { return l && l.moving && l.yang === 1; });
  }

  function allMovingAreYin() {
    return lines.every(function(l) { return l && l.moving && l.yang === 0; });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function clearLast() {
    for (var i = 5; i >= 0; i--) {
      if (lines[i]) {
        lines[i] = null;
        break;
      }
    }
    refreshUI();
    resultPanel.classList.add("hidden");
    resultBox.innerHTML = "";
  }

  function clearAll() {
    lines = [null, null, null, null, null, null];
    refreshUI();
    resultPanel.classList.add("hidden");
    resultBox.innerHTML = "";
  }

  document.getElementById("undoBtn").addEventListener("click", clearLast);
  document.getElementById("clearBtn").addEventListener("click", clearAll);

  // ---- 对外接口：记录保存、历史恢复、随机模拟 ----
  function movingTextOf(ls) {
    var idx = [];
    for (var i = 0; i < 6; i++) {
      if (ls[i] && ls[i].moving) idx.push("第" + (i + 1) + "爻");
    }
    return idx.length ? "动爻：" + idx.join("、") : "无动爻";
  }

  window.ZY = {
    getState: function () {
      for (var i = 0; i < 6; i++) { if (!lines[i]) return null; }
      var hex = findHex(lines.map(function (l) { return l.yang; }));
      return {
        title: hex ? "第" + hex.id + "卦 · " + hex.name : "六爻",
        sub: (hex ? hex.image + " · " : "") + movingTextOf(lines),
        image: hex ? hex.image : "",
        lines: lines.map(function (l) { return { yang: l.yang, moving: l.moving, key: l.key }; })
      };
    },
    restore: function (arr) {
      if (!Array.isArray(arr) || arr.length !== 6) return false;
      lines = arr.map(function (l) {
        return l ? { yang: l.yang ? 1 : 0, moving: !!l.moving, key: l.key || "" } : null;
      });
      refreshUI();
      maybeRender();
      return true;
    },
    randomFill: function () {
      for (var i = 0; i < 6; i++) {
        var opt = OPTIONS[Math.floor(Math.random() * OPTIONS.length)];
        lines[i] = { yang: opt.yang, moving: opt.moving, key: opt.key };
      }
      refreshUI();
      maybeRender();
    }
  };

  buildLineCards();
  refreshUI();
})();
