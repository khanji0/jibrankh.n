/* ============================================================
   Jibran Khan — Cover interactions
   ============================================================ */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  const lerp = (a, b, n) => (1 - n) * a + n * b;

  /* ---------- Cover entrance: curtain reveal + letter rise ---------- */
  (function coverEntrance() {
    document.documentElement.classList.add("js");
    // split each name word into per-letter spans
    document.querySelectorAll(".cover__word").forEach((w) => {
      const text = w.textContent;
      w.textContent = "";
      [...text].forEach((ch) => {
        const s = document.createElement("span");
        s.className = "ltr";
        s.textContent = ch;
        w.appendChild(s);
      });
    });
    const letters = [...document.querySelectorAll(".cover__word .ltr")];
    letters.forEach((el, i) => (el.style.animationDelay = 850 + i * 45 + "ms"));
    // curtain overlay
    const curtain = document.createElement("div");
    curtain.className = "cover-curtain";
    document.body.appendChild(curtain);
    // trigger on next frame so initial hidden state paints first
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("cover-in")));
  })();

  /* ---------- Custom cursor ---------- */
  const cursor = document.getElementById("cursor");
  const dot = document.getElementById("cursorDot");
  if (canHover && cursor && dot) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%,-50%)`;
    });
    (function loop() {
      cx = lerp(cx, tx, 0.2); cy = lerp(cy, ty, 0.2);
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("[data-cursor='hover']").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  /* ---------- Magnetic ---------- */
  if (canHover && !reduce) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.4;
        const y = (e.clientY - r.top - r.height / 2) * 0.4;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* The cover name + backdrop stay completely static (no mouse/scroll drift). */

  /* ---------- Ticker marquee ---------- */
  const ticker = document.getElementById("ticker");
  if (ticker && !reduce) {
    let tx = 0, w = 0, vel = 0;
    const measure = () => { w = ticker.children[0].offsetWidth; };
    measure(); addEventListener("resize", measure);
    addEventListener("scroll", () => { vel = 1; }, { passive: true });
    (function loop() {
      tx -= (0.6 + vel * 3);
      if (tx <= -w) tx += w;
      ticker.style.transform = `translateX(${tx}px)`;
      vel = lerp(vel, 0, 0.08);
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 3D tornado card stream ---------- */
  const helix = document.getElementById("helix");
  if (helix) {
    const cards = Array.from(helix.children);
    const N = cards.length;
    const hint = document.querySelector(".stream__hint");
    if (hint) hint.textContent = `HOVER TO PAUSE · CLICK TO WATCH ✦ ${N} STORIES`;
    let R = 300, vstep = 32, astep = 34;   // set responsively below

    // hover pauses the spin so cards are easy to click through to Instagram
    let hovered = false;
    const scene = helix.parentElement;
    if (canHover && scene) {
      scene.addEventListener("mouseenter", () => (hovered = true));
      scene.addEventListener("mouseleave", () => (hovered = false));
    }

    const layout = () => {
      const small = innerWidth < 640;
      R = small ? 168 : Math.min(300, innerWidth * 0.225);
      astep = 44;                 // fixed angular gap so cards never collide
      vstep = small ? 26 : 32;    // vertical spacing between cards
      cards.forEach((c, i) => {
        const a = i * astep;
        const y = (i - (N - 1) / 2) * vstep;
        c._a = a;
        c.style.transform = `translateY(${y}px) rotateY(${a}deg) translateZ(${R}px)`;
      });
    };
    layout();
    addEventListener("resize", layout);

    let rot = 0, boost = 0, lastY = scrollY;
    addEventListener("scroll", () => {
      const y = scrollY;
      boost += Math.max(-4, Math.min(4, (y - lastY) * 0.05));
      lastY = y;
    }, { passive: true });

    const spin = reduce ? 0 : 0.16;
    (function loop() {
      rot += (hovered ? 0 : spin) + boost;
      boost *= hovered ? 0.8 : 0.9;
      helix.style.transform = `rotateX(-7deg) rotateY(${rot}deg)`;
      for (const c of cards) {
        const t = Math.cos((rot + c._a) * Math.PI / 180) * 0.5 + 0.5; // 0 back → 1 front
        c.style.opacity = (0.5 + 0.5 * t).toFixed(3);
        c.style.filter = `brightness(${(0.66 + 0.46 * t).toFixed(3)})`;
        c.style.zIndex = Math.round(t * 100);
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.14 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- Count-up stats ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.getAttribute("data-count"));
      const suffix = el.getAttribute("data-suffix") || "";
      const dur = 1500, start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------- Smooth anchor scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: "smooth" }); }
    });
  });
})();
