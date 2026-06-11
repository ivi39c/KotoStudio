/* ═══════════════════════════════════════════════════════════════
   KOTO Studio — main.js
   V4 完整落地版
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── 工具函式 ─────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => window.innerWidth < 768;

/* ══════════════════════════════════════════════════════════════
   1. 導覽列
   ══════════════════════════════════════════════════════════════ */
function initNav() {
  const nav        = $('#koto-nav');
  const hamburger  = $('#nav-hamburger');
  const overlay    = $('#nav-mobile-overlay');
  const closeBtn   = $('#nav-close');
  const mobileLinks = $$('.nav-mobile-link');

  // Scroll → 磨砂效果
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 漢堡選單
  const openOverlay = () => {
    overlay.classList.add('is-open');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };
  const closeOverlay = () => {
    overlay.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  };

  hamburger.addEventListener('click', openOverlay);
  closeBtn.addEventListener('click', closeOverlay);
  mobileLinks.forEach(l => l.addEventListener('click', closeOverlay));

  // Esc 關閉
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay();
  });

  // 平滑滾動：Nav 連結
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   2. 進場動畫（Hero）
   ══════════════════════════════════════════════════════════════ */
function initHeroAnimation() {
  if (prefersReducedMotion()) {
    $$('.animate-in').forEach(el => el.classList.add('is-visible'));
    return;
  }
  $$('.animate-in').forEach(el => {
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('is-visible'), 200 + delay * 120);
  });
}

/* ══════════════════════════════════════════════════════════════
   3. Scroll 進場（IntersectionObserver）
   ══════════════════════════════════════════════════════════════ */
function initReveal() {
  if (prefersReducedMotion()) {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.revealDelay || 0);
      setTimeout(() => el.classList.add('is-visible'), delay * 120);
      observer.unobserve(el);
    });
  }, { threshold: 0.15 });

  $$('.reveal').forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════════════════════
   4. Section 4 流程卡片（無 SVG，純 IntersectionObserver）
   ══════════════════════════════════════════════════════════════ */
function initTimeline() {
  // 流程已改為卡片，無需 SVG 動畫，reveal 由 initReveal 統一處理
}

/* ══════════════════════════════════════════════════════════════
   5. 表單送出（新版簡潔表單）
   ══════════════════════════════════════════════════════════════ */
function initDropdowns() {
  // 舊對話式選單已移除，此函式保留為空以維持呼叫相容
}

function initForm() {
  const form      = $('#contact-form');
  const emailInput= $('#f-email');
  const emailErr  = $('#email-err');
  const nameInput = $('#f-name');
  const serviceEl = $('#f-service');
  const successEl = $('#form-success');
  const errorEl   = $('#form-error-msg');
  const submitBtn = $('#submit-btn');

  if (!form) return;

  // Email 即時驗證
  const validateEmail = (val) => {
    if (!val.trim()) return '請填入您的信箱';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return '請填入有效的信箱格式';
    return '';
  };

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      const err = validateEmail(emailInput.value);
      if (emailErr) emailErr.textContent = err;
      emailInput.classList.toggle('is-error', !!err);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot check
    const hp = $('#hp-field');
    if (hp && hp.value) return;

    // 驗證必填
    let hasError = false;

    if (nameInput && !nameInput.value.trim()) {
      nameInput.classList.add('is-error');
      nameInput.focus();
      hasError = true;
    }

    const emailErrMsg = validateEmail(emailInput ? emailInput.value : '');
    if (emailErrMsg) {
      if (emailErr) emailErr.textContent = emailErrMsg;
      if (emailInput) { emailInput.classList.add('is-error'); }
      if (!hasError) { emailInput.focus(); }
      hasError = true;
    }

    if (serviceEl && !serviceEl.value) {
      serviceEl.style.borderBottomColor = '#C0392B';
      if (!hasError) serviceEl.focus();
      hasError = true;
    }

    if (hasError) return;

    // 送出
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';

    try {
      const res = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.style.transition = 'opacity 0.2s';
        form.style.opacity    = '0';
        setTimeout(() => {
          form.hidden        = true;
          successEl.hidden   = false;
        }, 220);
      } else {
        throw new Error('server');
      }
    } catch {
      if (errorEl) errorEl.hidden = false;
      submitBtn.disabled   = false;
      submitBtn.style.opacity = '';
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   7. Easter Egg：數位小紙花
   ══════════════════════════════════════════════════════════════ */
function initEasterEgg() {
  const trigger = $('#footer-easter');
  const canvas  = $('#confetti-canvas');
  if (!trigger || !canvas) return;

  const ctx = canvas.getContext('2d');
  const colors = ['#D4A373', '#4A5D4E', '#D1D1D1', '#1A1A1A', '#F9F6F0'];
  const symbols = ['✦', '●', '◆', '·', '✦', '○'];

  let particles = [];
  let animId    = null;
  let running   = false;

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const launch = (x, y) => {
    if (prefersReducedMotion()) return;

    if (running) {
      cancelAnimationFrame(animId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = [];
    }

    canvas.style.opacity = '1';
    running = true;

    const count = 18;
    particles = Array.from({ length: count }, () => ({
      x, y,
      vx:     (Math.random() - 0.5) * 6,
      vy:     -(Math.random() * 5 + 2),
      alpha:  1,
      size:   Math.random() * 10 + 8,
      color:  colors[Math.floor(Math.random() * colors.length)],
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      rot:    Math.random() * Math.PI * 2,
      rotV:   (Math.random() - 0.5) * 0.15,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x    += p.vx;
        p.y    += p.vy;
        p.vy   += 0.12;   // gravity
        p.alpha -= 0.018;
        p.rot  += p.rotV;

        if (p.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.font        = `${p.size}px serif`;
        ctx.fillStyle   = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();
      });

      particles = particles.filter(p => p.alpha > 0);
      if (particles.length > 0) {
        animId = requestAnimationFrame(animate);
      } else {
        canvas.style.opacity = '0';
        running = false;
      }
    };
    animId = requestAnimationFrame(animate);
  };

  trigger.addEventListener('click', (e) => {
    launch(e.clientX, e.clientY);
  });
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const r = trigger.getBoundingClientRect();
      launch(r.left + r.width / 2, r.top);
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   8. 作品卡片 focus-gallery（手機 Touch 互動）
   ══════════════════════════════════════════════════════════════ */
function initGalleryTouch() {
  // 手機觸控：點擊某卡片時觸發聚焦效果
  $$('.focus-gallery').forEach(gallery => {
    $$('.gallery-item', gallery).forEach(item => {
      item.addEventListener('touchstart', () => {
        if (!isMobile()) return;
        $$('.gallery-item', gallery).forEach(i => i.classList.remove('touch-focus'));
        item.classList.add('touch-focus');
      }, { passive: true });
    });
    document.addEventListener('touchstart', (e) => {
      if (!gallery.contains(e.target)) {
        $$('.gallery-item', gallery).forEach(i => i.classList.remove('touch-focus'));
      }
    }, { passive: true });
  });
}

/* ══════════════════════════════════════════════════════════════
   初始化
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHeroAnimation();
  initReveal();
  initTimeline();
  initDropdowns();
  initForm();
  initEasterEgg();
  initGalleryTouch();
});
