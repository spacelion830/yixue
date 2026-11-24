/* ============================================================
   易学斋 · 共享脚本
   - 主题（明/暗）持久化
   - 导航高亮、回到顶部、轻提示
   - 本地记录（localStorage）
   ============================================================ */
(function () {
  "use strict";

  var THEME_KEY = "yixue.theme";
  var STORE_KEY = "yixue.history.v1";
  var STORE_LIMIT = 80;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ---------------- 主题 ---------------- */
  function readTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#15120e" : "#f6f1e6");
    var btn = $("#themeBtn");
    if (btn) {
      btn.textContent = theme === "dark" ? "☀" : "☾";
      btn.setAttribute("aria-label", theme === "dark" ? "切换到浅色模式" : "切换到深色模式");
      btn.title = btn.getAttribute("aria-label");
    }
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  }

  /* ---------------- 轻提示 ---------------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $("#toast");
    if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 1900);
  }

  /* ---------------- 剪贴板 ---------------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  /* ---------------- 本地记录 ---------------- */
  function readStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function writeStore(arr) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(arr.slice(0, STORE_LIMIT))); } catch (e) {}
  }

  var store = {
    list: function () { return readStore(); },
    add: function (entry) {
      var arr = readStore();
      var item = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        app: entry.app,
        ts: entry.ts || Date.now(),
        title: entry.title || "",
        sub: entry.sub || "",
        payload: entry.payload || null
      };
      arr.unshift(item);
      writeStore(arr);
      return item;
    },
    get: function (id) {
      return readStore().filter(function (x) { return x.id === id; })[0] || null;
    },
    remove: function (id) {
      writeStore(readStore().filter(function (x) { return x.id !== id; }));
    },
    clear: function () { writeStore([]); }
  };

  /* ---------------- 时间格式化 ---------------- */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function fmtTime(ts) {
    var d = new Date(ts);
    var now = new Date();
    var sameDay = d.toDateString() === now.toDateString();
    var hm = pad(d.getHours()) + ":" + pad(d.getMinutes());
    if (sameDay) return "今天 " + hm;
    var yd = new Date(now.getTime() - 86400000);
    if (d.toDateString() === yd.toDateString()) return "昨天 " + hm;
    return (d.getMonth() + 1) + "/" + d.getDate() + " " + hm;
  }

  /* ---------------- 导航 / 滚动 ---------------- */
  function initChrome() {
    var page = document.body.getAttribute("data-page");
    $all(".nav-links a[data-page]").forEach(function (a) {
      if (a.getAttribute("data-page") === page) a.setAttribute("aria-current", "page");
    });

    var themeBtn = $("#themeBtn");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    var toTop = $("#toTop");
    if (toTop) {
      toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
      var onScroll = function () {
        if (window.scrollY > 420) toTop.classList.add("show");
        else toTop.classList.remove("show");
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---------------- 首页：记录列表 ---------------- */
  function renderRecords() {
    var box = $("#recordList");
    if (!box) return;
    var arr = store.list();
    var counter = $("#recordCount");
    if (counter) counter.textContent = arr.length ? "本机共 " + arr.length + " 条" : "";
    if (!arr.length) {
      box.innerHTML = '<div class="empty-state">还没有起课记录。到「周易六爻」或「小六壬」起一卦，会自动存在本机。</div>';
      var clearBtnEmpty = $("#clearRecords");
      if (clearBtnEmpty) clearBtnEmpty.classList.add("hidden");
      return;
    }
    var html = '<ul class="record-list">';
    arr.slice(0, 8).forEach(function (item) {
      var appName = item.app === "zhouyi" ? "六爻" : "小六壬";
      var href = (item.app === "zhouyi" ? "zhouyi.html" : "xiaoliuren.html") + "#h=" + item.id;
      html += '<li class="record-row">' +
        '<a class="record-item" href="' + href + '">' +
        '<span class="record-tag ' + escapeHtml(item.app) + '">' + appName + "</span>" +
        '<span class="record-main"><span class="record-title">' + escapeHtml(item.title) + "</span>" +
        '<span class="record-sub">' + escapeHtml(item.sub || "") + "</span></span>" +
        '<span class="record-time">' + fmtTime(item.ts) + "</span>" +
        "</a>" +
        '<button class="record-del" type="button" data-id="' + escapeHtml(item.id) + '" aria-label="删除这条记录" title="删除这条记录">×</button>' +
        "</li>";
    });
    html += "</ul>";
    box.innerHTML = html;

    box.onclick = function (e) {
      var btn = e.target.closest ? e.target.closest(".record-del") : null;
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      store.remove(btn.getAttribute("data-id"));
      renderRecords();
      toast("已删除这条记录");
    };

    var clearBtn = $("#clearRecords");
    if (clearBtn) {
      clearBtn.classList.remove("hidden");
      clearBtn.onclick = function () {
        if (window.confirm("确定清空本机所有起课记录？此操作不可恢复。")) {
          store.clear();
          renderRecords();
          toast("记录已清空");
        }
      };
    }
  }

  function initHub() {
    if (document.body.getAttribute("data-page") !== "home") return;
    renderRecords();
  }

  /* ---------------- 错误上报（便于排查） ---------------- */
  window.addEventListener("error", function (e) {
    if (e && e.message) console.error("[yixue] " + e.message + " @ " + (e.filename || "") + ":" + (e.lineno || 0));
  });
  window.addEventListener("unhandledrejection", function (e) {
    console.error("[yixue] unhandled:", e && e.reason);
  });

  /* ---------------- 启动 ---------------- */
  applyTheme(readTheme());
  document.addEventListener("DOMContentLoaded", function () {
    initChrome();
    initHub();
  });

  window.Site = {
    toast: toast,
    copy: copyText,
    store: store,
    fmtTime: fmtTime,
    escapeHtml: escapeHtml,
    theme: { apply: applyTheme, toggle: toggleTheme },
    renderRecords: renderRecords
  };
})();
