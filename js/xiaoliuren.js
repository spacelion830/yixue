// 小六壬起课 · 核心逻辑（从 xiaoliuren/index.html 抽取）
var PALACES = [
  {
    name: "大安",
    nature: "大吉",
    element: "木",
    direction: "东方",
    color: "青色",
    god: "青龙",
    nums: "1、4、5",
    trueGan: "甲 + 丁",
    palace: "事业宫",
    inner: "命宫",
    keyword: "安而不动、安静安稳、吉庆吉利",
    detail: "主政府、学校、贵人、大树、卧室、床被；身体对应肝胆、四肢、筋脉。感情平稳偏平淡；寻物看东方、木制品、衣物、植物旁。事业宫主工作、学业、官职。",
    poem: "大安事事昌，求财在坤方。\n失物去不远，宅舍保安康。\n行人身未动，病者主无妨。\n将军回田野，仔细好推详。"
  },
  {
    name: "留连",
    nature: "小凶",
    element: "土（阴土/四方土）",
    direction: "东南/四偏位",
    color: "—",
    god: "腾蛇（象）",
    nums: "2、7、8",
    trueGan: "丁 + 己",
    palace: "田宅宫",
    inner: "奴仆宫",
    keyword: "暂缓、停留、拖延、犹豫、有阻碍",
    detail: "主弯折绳索、脏乱、化学物品、病毒；身体对应脾胃、肠胃、隐藏疾病。感情易暧昧、隐瞒、第三者；寻物看东南或角落、柜缝床底。田宅宫主土地房产、家中阴私。",
    poem: "留连事未当，求事日莫光。\n凡事只宜缓，去者未回向。\n失物南方去，急急行便访。\n紧记防口舌，人口且平祥。"
  },
  {
    name: "速喜",
    nature: "大吉",
    element: "火",
    direction: "南方",
    color: "红色",
    god: "朱雀",
    nums: "3、6、9",
    trueGan: "丙 + 辛",
    palace: "感情宫",
    inner: "夫妻宫",
    keyword: "快速、迅猛、好事快发生",
    detail: "主口舌、说话、交流、文书、网络；身体对应炎症、心脑血管、上火。感情宫主婚姻喜事、桃花、报喜；寻物看南方、高处、红色物品。掐到速喜宜马上行动，不要拖。",
    poem: "速喜喜临乡，求财往南方。\n失物申午未，逢人路寻详。\n官事有福德，病者无大伤。\n六畜田稼庆，行人有音向。"
  },
  {
    name: "赤口",
    nature: "大凶",
    element: "金",
    direction: "西方",
    color: "白色",
    god: "白虎",
    nums: "4、1、2",
    trueGan: "庚 + 癸",
    palace: "疾厄宫",
    inner: "兄弟宫",
    keyword: "血光、争斗、灾祸、口舌官非",
    detail: "主金属、玻璃、刀剑、机械、破损物；身体对应皮肤、肺、外伤、骨头。感情易分手吵架；寻物看西方、白色、金属、口袋。疾厄宫主灾祸、官司、意外。",
    poem: "赤口主口伤，官事且紧防。\n失物急去找，行人有惊慌。\n鸡犬多作怪，病者上西方。\n更须防咒咀，恐怕染瘟殃。"
  },
  {
    name: "小吉",
    nature: "大吉",
    element: "水",
    direction: "北方",
    color: "蓝/黑",
    god: "玄武",
    nums: "5、3、8",
    trueGan: "壬 + 甲",
    palace: "驿马宫",
    inner: "子女宫",
    keyword: "力量缓慢递进、出行、流动、驿马",
    detail: "主车船、人流、旅游、酒水奶茶；身体对应肾、膀胱、泌尿。感情六合，合作合婚；寻物看北方、水边、厕所。驿马宫主出差、变动、调动。",
    poem: "小吉最吉昌，路上好商量。\n阴人来报喜，失物在坤方。\n行人立刻至，交易甚是强。\n凡事皆合好，病者保安康。"
  },
  {
    name: "空亡",
    nature: "凶/特殊",
    element: "土",
    direction: "中央",
    color: "黄色",
    god: "勾陈",
    nums: "6、5、10",
    trueGan: "戊 + 乙",
    palace: "福德宫",
    inner: "父母宫",
    keyword: "落空、空亡，好事坏事都落空",
    detail: "主盒子、袋子、柜子、四方形容纳之物；占疾病需特别注意，寻人可能代表“找不到/人已远”。福德宫主阴德、外财、牢狱。特殊情况下也代表“无事”。",
    poem: "空亡事不长，阴人无主张。\n求财心白费，行人有灾殃。\n失物永不见，官事有刑伤。\n病人遇邪鬼，久病添祸殃。"
  }
];

var shichenNames = ["子时","丑时","寅时","卯时","辰时","巳时","午时","未时","申时","酉时","戌时","亥时"];

var panels = {
  monthDayHour: document.getElementById("panelMonthDayHour"),
  threeNumbers: document.getElementById("panelThreeNumbers"),
  time: document.getElementById("panelTime")
};
var tabs = {
  monthDayHour: document.getElementById("tabMonthDayHour"),
  threeNumbers: document.getElementById("tabThreeNumbers"),
  time: document.getElementById("tabTime")
};
var resultPanel = document.getElementById("resultPanel");
var resultBox = document.getElementById("resultBox");

function switchTab(key) {
  Object.keys(tabs).forEach(function(k) {
    if (k === key) {
      tabs[k].classList.add("active");
      tabs[k].setAttribute("aria-selected", "true");
      panels[k].classList.remove("hidden");
    } else {
      tabs[k].classList.remove("active");
      tabs[k].setAttribute("aria-selected", "false");
      panels[k].classList.add("hidden");
    }
  });
}

tabs.monthDayHour.addEventListener("click", function() { switchTab("monthDayHour"); });
tabs.threeNumbers.addEventListener("click", function() { switchTab("threeNumbers"); });
tabs.time.addEventListener("click", function() { switchTab("time"); });
function move(start, n, zeroAsTen) {
  var v = zeroAsTen ? (n === 0 ? 10 : n) : n;
  if (v === 0) return start;
  return (start + v - 1) % 6;
}

function shichenIndexFromHour(hour) {
  hour = Number(hour);
  if (hour >= 23 || hour < 1) return 1;
  return Math.floor((hour + 1) / 2) + 1;
}

document.getElementById("calcMonthDayHour").addEventListener("click", function() {
  var month = parseInt(document.getElementById("lunarMonth").value, 10);
  var day = parseInt(document.getElementById("lunarDay").value, 10);
  var shichen = parseInt(document.getElementById("shichen").value, 10);

  if (isNaN(month) || isNaN(day) || isNaN(shichen) || month < 1 || day < 1) {
    showError("请输入有效的农历月、日和时辰。");
    return;
  }

  var tian = move(0, month, true);
  var di = move(tian, day, true);
  var ren = move(di, shichen, true);

  renderResult(tian, di, ren, [
    "天宫：从大安数农历" + month + "月 → " + PALACES[tian].name,
    "地宫：从" + PALACES[tian].name + "数" + day + "日 → " + PALACES[di].name,
    "人宫：从" + PALACES[di].name + "数" + shichenNames[shichen - 1] + "（序数" + shichen + "）→ " + PALACES[ren].name
  ], "农历" + month + "月 · " + day + "日 · " + shichenNames[shichen - 1]);
});

document.getElementById("calcThreeNumbers").addEventListener("click", function() {
  var n1 = parseInt(document.getElementById("num1").value, 10);
  var n2 = parseInt(document.getElementById("num2").value, 10);
  var n3 = parseInt(document.getElementById("num3").value, 10);

  if (isNaN(n1) || isNaN(n2) || isNaN(n3) || n1 < 0 || n2 < 0 || n3 < 0) {
    showError("三个数字请输入 0 或正整数。");
    return;
  }

  var tian = move(0, n1, true);
  var di = move(tian, n2, true);
  var ren = move(di, n3, true);

  renderResult(tian, di, ren, [
    "天宫：从大安数 " + (n1 === 0 ? "0（按10）" : n1) + " → " + PALACES[tian].name,
    "地宫：从" + PALACES[tian].name + "数 " + (n2 === 0 ? "0（按10）" : n2) + " → " + PALACES[di].name,
    "人宫：从" + PALACES[di].name + "数 " + (n3 === 0 ? "0（按10）" : n3) + " → " + PALACES[ren].name
  ], "数字：" + n1 + " · " + n2 + " · " + n3);
});

document.getElementById("calcTime").addEventListener("click", function() {
  var hour = parseInt(document.getElementById("hour").value, 10);
  var minute = parseInt(document.getElementById("minute").value, 10);

  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    showError("请输入有效时间：小时 0-23，分钟 0-59。");
    return;
  }

  var shichen = shichenIndexFromHour(hour);
  var tian = move(0, shichen, true);
  var ke = Math.floor(minute / 15);
  var yu = minute % 15;
  var di = move(tian, ke, false);
  var ren = move(di, yu, false);

  renderResult(tian, di, ren, [
    "天宫：" + shichenNames[shichen - 1] + "（" + hour + "点）→ 从大安数" + shichen + " → " + PALACES[tian].name,
    "地宫：" + ke + "刻（每15分钟为1刻）→ " + (ke === 0 ? "不移动" : "从" + PALACES[tian].name + "数" + ke) + " → " + PALACES[di].name,
    "人宫：余" + yu + "分 → " + (yu === 0 ? "不移动" : "从" + PALACES[di].name + "数" + yu) + " → " + PALACES[ren].name
  ], hour + ":" + (minute < 10 ? "0" + minute : minute));
});

var lastCast = null;

function renderResult(tianIndex, diIndex, renIndex, steps, note) {
  lastCast = { tian: tianIndex, di: diIndex, ren: renIndex, steps: steps, note: note };
  var tian = PALACES[tianIndex];
  var di = PALACES[diIndex];
  var ren = PALACES[renIndex];

  var html = "";
  html += '<div class="result-name">' + ren.name + '</div>';
  html += '<div class="result-sub">人宫定吉凶 · ' + ren.nature + ' · ' + ren.keyword + '</div>';

  html += '<div class="palace-grid">';
  html += palaceCard("天宫", tian, false);
  html += palaceCard("地宫", di, false);
  html += palaceCard("人宫", ren, true);
  html += '</div>';

  html += '<div class="section-title">推算过程</div>';
  html += '<div class="steps">';
  steps.forEach(function(s) {
    html += '<div>• ' + escapeHtml(s) + '</div>';
  });
  html += '<div class="steps-note">' + escapeHtml(note) + '</div>';
  html += '</div>';

  html += '<div class="note" style="margin-top:10px">吉凶铁律：以人宫为准。天宫看起因/过去，地宫看经过/现在，人宫看结果/未来。</div>';

  resultBox.innerHTML = html;
  resultPanel.classList.remove("hidden");
  setTimeout(function() {
    resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 60);
}

function palaceCard(role, p, isRen) {
  var html = '<div class="palace-card' + (isRen ? " ren" : "") + '">';
  html += '<div class="p-head"><span class="p-name">' + role + ' · ' + p.name + '</span><span class="p-tag">' + p.nature + '</span></div>';
  html += '<div class="p-meta">五行 ' + p.element + ' ｜ 六神 ' + p.god + ' ｜ 方位 ' + p.direction + ' ｜ 颜色 ' + p.color + '</div>';
  html += '<div class="p-meta">主数 ' + p.nums + ' ｜ 真天干 ' + p.trueGan + ' ｜ ' + p.palace + '（内：' + p.inner + '）</div>';
  html += '<div class="p-key"><strong>' + p.keyword + '</strong></div>';
  html += '<div class="p-meta" style="margin-top:6px">' + escapeHtml(p.detail) + '</div>';
  html += '</div>';
  return html;
}

function renderQuickRef() {
  var html = '<table class="quick-table"><thead><tr><th>神煞</th><th>吉凶</th><th>五行</th><th>方位</th><th>宫职</th><th>主数</th></tr></thead><tbody>';
  PALACES.forEach(function(p) {
    html += '<tr>';
    html += '<td><strong>' + p.name + '</strong></td>';
    html += '<td>' + p.nature + '</td>';
    html += '<td>' + p.element + '</td>';
    html += '<td>' + p.direction + '</td>';
    html += '<td>' + p.palace + '</td>';
    html += '<td>' + p.nums + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table>';
  document.getElementById("quickRef").innerHTML = html;
}

function showError(msg) {
  resultBox.innerHTML = '<div class="error">' + escapeHtml(msg) + '</div>';
  resultPanel.classList.remove("hidden");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

renderQuickRef();

// ---- 对外接口：记录保存、历史恢复 ----
window.XLR = {
  getState: function () {
    if (!lastCast) return null;
    var ren = PALACES[lastCast.ren];
    return {
      title: ren.name,
      sub: "天 " + PALACES[lastCast.tian].name + " · 地 " + PALACES[lastCast.di].name +
           " · 人 " + ren.name + "（" + lastCast.note + "）",
      payload: lastCast
    };
  },
  restore: function (payload) {
    if (!payload || typeof payload.tian !== "number") return false;
    renderResult(payload.tian, payload.di, payload.ren, payload.steps || [], payload.note || "");
    return true;
  }
};
