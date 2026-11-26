/* Captain Dad Games: menu, star hunt, badges, secret code. Everything is saved on this device only. */
(function () {
  'use strict';
  var KEY = 'captainDadGames_v1';
  var PAGES = ['home', 'sum-shredders', 'captain-dad', 'grown-ups', 'secrets'];
  var STARS = ['hero', 'shelf', 'game', 'captain', 'grownups'];
  var CODE = 'SHRED';

  function load() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    d = d || {};
    return { stars: d.stars || [], pages: d.pages || [], tester: !!d.tester, code: !!d.code };
  }
  var S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function has(a, v) { return a.indexOf(v) >= 0; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var STAR_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.9l-5.25 2.7 1-5.8L3.5 9.7l5.9-.9z"/></svg>';

  /* ---- toast ---- */
  var toastT;
  function toast(msg) {
    var t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }
  window.cdgToast = toast;

  /* ---- menu ---- */
  var btn = $('.menu-btn'), nav = $('#site-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---- page visits (Explorer badge) ---- */
  var page = document.body.getAttribute('data-page');
  if (page && !has(S.pages, page)) { S.pages.push(page); save(); }

  /* ---- play links (Game Tester badge) ---- */
  $$('[data-play]').forEach(function (a) {
    a.addEventListener('click', function () { if (!S.tester) { S.tester = true; save(); } });
  });

  /* ---- star hunt ---- */
  function starCount() { return STARS.filter(function (s) { return has(S.stars, s); }).length; }
  function renderStars() {
    var n = starCount();
    $$('[data-star-count]').forEach(function (el) { el.textContent = n + '/5'; });
    $$('.pips').forEach(function (p) {
      var html = '<span class="pips-label">Stars found</span><span class="pips-track">';
      for (var i = 1; i <= 5; i++) html += '<span class="slot' + (i <= n ? ' on' : '') + '">' + (i <= n ? STAR_SVG : '') + '</span>';
      html += '</span><span class="count">' + n + ' of 5</span>';
      p.innerHTML = html;
      p.setAttribute('aria-label', 'Star hunt: ' + n + ' of 5 hidden stars found');
    });
    $$('[data-when-done]').forEach(function (el) { el.hidden = n < 5; });
    $$('[data-when-not-done]').forEach(function (el) { el.hidden = n >= 5; });
    $$('.hidden-star').forEach(function (b) { if (has(S.stars, b.getAttribute('data-star'))) b.classList.add('found'); });
  }
  $$('.hidden-star').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-star');
      if (has(S.stars, id)) return;
      S.stars.push(id); save();
      var r = b.getBoundingClientRect();
      var pop = document.createElement('img');
      pop.src = b.querySelector('img').src; pop.alt = ''; pop.className = 'star-pop';
      pop.style.left = (r.left + r.width / 2 - 32) + 'px'; pop.style.top = (r.top + r.height / 2 - 32) + 'px';
      document.body.appendChild(pop); setTimeout(function () { pop.remove(); }, 1000);
      var n = starCount();
      toast(n >= 5 ? 'You found all 5 stars! The Secret Room has a badge for you.' : 'Star found! ' + n + ' of 5. Keep looking on other pages!');
      renderStars(); renderBadges();
    });
  });

  /* ---- badges (secrets page) ---- */
  function renderBadges() {
    var list = $('#badges'); if (!list) return;
    var explored = PAGES.filter(function (p) { return has(S.pages, p); }).length;
    var B = [
      { t: 'Star Hunter', d: 'Find all 5 hidden stars on this site (' + starCount() + '/5)', got: starCount() >= 5, icon: 'star', col: '#ffc90a' },
      { t: 'Explorer', d: 'Visit every page on this site (' + explored + '/5)', got: explored >= 5, icon: 'map', col: '#9be3b0' },
      { t: 'Game Tester', d: 'Press Play on a Captain Dad game', got: S.tester, icon: 'play', col: '#33c3ff' },
      { t: 'Code Cracker', d: 'Crack the secret code below', got: S.code, icon: 'key', col: '#ff8fb3' }
    ];
    var ICON = {
      star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.9l-5.25 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
      map: '<path d="M9 4L3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
      play: '<path d="M7 4.5v15l12.5-7.5z"/>',
      key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
      lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
    };
    var got = 0;
    list.innerHTML = B.map(function (b) {
      if (b.got) got++;
      return '<li class="badge' + (b.got ? ' got' : '') + '"><span class="medal"' + (b.got ? ' style="background:' + b.col + '"' : '') + '>' +
        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[b.got ? b.icon : 'lock'] + '</svg></span>' +
        '<span class="t">' + b.t + '</span><span class="d">' + (b.got ? 'Earned!' : b.d) + '</span>' +
        '<span class="sr-only">' + (b.got ? 'Badge earned' : 'Badge locked') + '</span></li>';
    }).join('');
    $$('[data-badge-count]').forEach(function (el) { el.textContent = got + ' of ' + B.length; });
  }

  /* ---- secret code ---- */
  var form = $('#code-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = ($('#code').value || '').trim().toUpperCase().replace(/\s+/g, '');
      var m = $('#code-msg');
      if (v === CODE) {
        S.code = true; save(); renderBadges();
        m.className = 'code-msg good'; m.textContent = 'Code cracked! You earned the Code Cracker badge.';
      } else if (v) {
        m.className = 'code-msg'; m.textContent = 'Hmm, that\'s not it. Keep exploring!';
      }
    });
  }

  /* ---- contact (address is put together only when the button is pressed) ---- */
  $$('[data-contact]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var u = ['joel', 'black', 'burn'].join(''), d = ['live', 'co', 'uk'].join('.');
      var subj = a.getAttribute('data-subject') || 'Hello Captain Dad';
      location.href = 'mailto:' + u + '@' + d + '?subject=' + encodeURIComponent(subj);
    });
  });

  /* ---- year ---- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  renderStars(); renderBadges();
})();
