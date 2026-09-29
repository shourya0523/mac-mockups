/* Shared scroll motion for the mockups: reveal-on-scroll, count-ups, score rings and bars that fill.
   Usage: MACMotion({items:[[selector, options], ...], count:'selector'}).
   Options: from: 'up' (default) | 'left' | 'right' | 'fade' | 'deal' | fn(el, i) returning one of those
            stagger (s, per item), delay (s), group (true = stagger the matched element's children), rule (draw top rule)
   Everything is skipped under prefers-reduced-motion, and content stays visible if this file fails to load. */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.MACMotion = function (cfg) {
    cfg = cfg || {};
    if (reduce || !('IntersectionObserver' in window)) return { reduce: true, scan: function () {} };
    document.documentElement.classList.add('motion');
    const shown = el => !el.closest('[hidden]');

    // Drop the reveal classes once finished so each element's own hover transitions work again
    const done = el => { el.classList.remove('rv', 'rv-left', 'rv-right', 'rv-fade', 'rv-deal', 'rv-up', 'rule', 'in'); el.style.removeProperty('--d'); };

    const count = el => {
      const m = el.textContent.trim().match(/^(\D*)(\d+)(\D*)$/);
      if (!m) return;
      const to = +m[2], t0 = performance.now(), D = 1400;
      const step = t => { const p = Math.min(1, (t - t0) / D); el.textContent = m[1] + Math.round(to * (1 - Math.pow(1 - p, 3))) + m[3]; if (p < 1) requestAnimationFrame(step); };
      el.textContent = m[1] + 0 + m[3]; requestAnimationFrame(step);
    };
    const ring = el => {
      const f = el.querySelector('.sc-fill'); if (!f) return;
      const end = f.getAttribute('stroke-dashoffset');
      f.style.transition = 'none'; f.style.strokeDashoffset = f.getAttribute('stroke-dasharray');
      f.getBoundingClientRect();
      f.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(.2,.7,.2,1)'; f.style.strokeDashoffset = end;
    };
    const bar = el => {
      const w = el.style.width; el.style.transition = 'none'; el.style.width = '0';
      el.getBoundingClientRect(); el.style.transition = 'width 1.1s cubic-bezier(.2,.7,.2,1)'; el.style.width = w;
    };

    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; io.unobserve(el);
      const k = el.dataset.mk;
      if (k === 'count') return count(el);
      if (k === 'ring') return ring(el);
      if (k === 'bar') return bar(el);
      el.getBoundingClientRect(); el.classList.add('in');
      const d = parseFloat(el.style.getPropertyValue('--d')) || 0;
      setTimeout(() => done(el), (d + 1) * 1000);
    }), { rootMargin: '0px 0px -8% 0px', threshold: .12 });

    const add = (el, i, o) => {
      if (el.dataset.mk || !shown(el)) return;
      el.dataset.mk = 'rv';
      const from = typeof o.from === 'function' ? o.from(el, i) : (o.from || 'up');
      el.classList.add('rv', 'rv-' + from);
      if (o.rule) el.classList.add('rule');
      const d = (o.delay || 0) + (o.stagger ? (i % 8) * o.stagger : 0);
      if (d) el.style.setProperty('--d', d + 's');
      io.observe(el);
    };
    const watch = (sel, kind) => document.querySelectorAll(sel).forEach(el => {
      if (el.dataset.mk || !shown(el)) return; el.dataset.mk = kind; io.observe(el);
    });

    const shared = [
      ['[data-view]:not([hidden]) .sf-card', { stagger: .06 }],
      ['.pf-head,.pf-pillar,.pf-sec', { stagger: .05 }]
    ];
    function scan() {
      (cfg.items || []).concat(shared).forEach(([sel, o]) => {
        document.querySelectorAll(sel).forEach((el, i) => {
          if (o.group) [...el.children].forEach((c, j) => add(c, j, o)); else add(el, i, o);
        });
      });
      if (cfg.count) watch(cfg.count, 'count');
      watch('.pf-stat b', 'count');
      watch('.sc-ring', 'ring');
      watch('.sc-bar i', 'bar');
      if (cfg.onScan) cfg.onScan();
    }
    scan();
    // Re-scan after each hash route, keeping any handler the page already set
    const prev = window.onMacRoute;
    window.onMacRoute = function () { if (prev) prev.apply(this, arguments); requestAnimationFrame(scan); };
    return { reduce: false, scan };
  };
})();
