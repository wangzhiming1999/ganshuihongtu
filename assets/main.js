/* 赣水红途 · 共享脚本：滚动动效 + 数字滚动 + 视差 + 粒子 */
(function () {
  "use strict";

  /* ===== 进场动效（fade-up）===== */
  /* 兜底：如果 JS 因任何原因没有执行完 observer 回调，滚动 3 秒后强制显示全部内容 */
  var els = document.querySelectorAll("[data-anim]");
  setTimeout(function () {
    els.forEach(function (el) {
      if (el.classList.contains("anim-done")) return;
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.style.opacity = 1;
        el.style.transform = "none";
        el.style.clipPath = "inset(0% 0% 0% 0% round 18px)";
        el.classList.add("anim-done");
      }
    });
  }, 3000);
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = el.getAttribute("data-anim-delay") || 0;
        el.style.transition =
          "opacity .9s var(--ease-out) " + delay + "ms, transform .9s var(--ease-out) " + delay + "ms," +
          " clip-path 1.1s var(--ease-out) " + delay + "ms";
        el.style.opacity = 1;
        el.style.transform = "none";
        el.style.clipPath = "inset(0% 0% 0% 0% round 18px)";
        el.classList.add("anim-done");
        io.unobserve(el);
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; el.classList.add("anim-done"); });
  }

  /* ===== 数字滚动 ===== */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-count"), 10);
        var start = null, dur = 1700;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute("data-count"); });
  }

  /* ===== Hero 背景视差 ===== */
  var heroBg = document.querySelector(".page-hero .hero-bg");
  if (heroBg) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          heroBg.style.transform = "translateY(" + y * 0.28 + "px) scale(1.06)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ===== 导航当前页高亮 ===== */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
  });

  /* ===== Canvas 粒子：余烬飘散「灰飞烟灭」===== */
  var canvas = document.getElementById("ember-canvas");
  if (canvas) {
    /* canvas 铺满 hero、置于内容下层（防止内联元素默认尺寸撑布局） */
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;";
    var ctx = canvas.getContext("2d");
    var host = canvas.parentElement;
    var W, H, particles;

    function resize() {
      W = canvas.width = host.offsetWidth;
      H = canvas.height = host.offsetHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    function rand(a, b) { return a + Math.random() * (b - a); }

    function Particle() { this.reset(true); }
    Particle.prototype.reset = function (initial) {
      this.x = rand(0, W);
      this.y = initial ? rand(0, H) : H + rand(0, 40);
      this.r = rand(0.8, 3.2);
      this.vy = -rand(0.25, 1.1);
      this.vx = rand(-0.35, 0.55);
      this.life = rand(0.35, 1);
      this.decay = rand(0.0015, 0.004);
      this.hue = rand(12, 38);
      this.tw = rand(0, Math.PI * 2);
    };
    Particle.prototype.draw = function () {
      this.tw += 0.06;
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      if (this.life <= 0 || this.y < -20 || this.x < -20 || this.x > W + 20) { this.reset(false); return; }
      var flicker = 0.65 + 0.35 * Math.sin(this.tw);
      var alpha = Math.max(this.life, 0) * flicker;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = "hsla(" + this.hue + ", 90%, 62%, " + alpha.toFixed(3) + ")";
      ctx.shadowColor = "rgba(255, 160, 60, " + alpha.toFixed(3) + ")";
      ctx.shadowBlur = this.r * 5;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    var count = Math.min(110, Math.floor(W / 12));
    particles = [];
    for (var i = 0; i < count; i++) particles.push(new Particle());

    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      (function loop() {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < particles.length; i++) particles[i].draw();
        requestAnimationFrame(loop);
      })();
    }
  }
})();
