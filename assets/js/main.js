/* =========================================================
   MK ART CONCEPTS — shared site behaviour (vanilla JS)
   Theme · loader · nav · cursor · reveals · transitions · lightbox
   ========================================================= */
window.SITE = {
  name: "MK Art Concepts",
  principal: "Manoj Khuba",
  phoneDisplay: "074473 45566",
  phone: "+917447345566",
  whatsapp: "917447345566",
  address: "Flat No. 3, Saurabh Apartment, above Axis Bank, Hotagi Road, Solapur, Maharashtra 413003",
  plusCode: "JWW7+V9 Solapur",
  mapLink: "https://maps.app.goo.gl/VQPH1AhUaQkoyTFZ7",
  // ⚠ Edit opening time if needed. Closing time from Google listing: 7:30 pm
  hours: { open: "10:00", close: "19:30" },
};

(function () {
  const doc = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;
  window.REDUCE = reduce;

  /* ---------- theme (day / night) ---------- */
  const setTheme = (t, save) => {
    doc.setAttribute("data-theme", t);
    if (save) localStorage.setItem("mk-theme", t);
    document.querySelectorAll(".toggle-txt").forEach((e) => (e.textContent = t === "night" ? "NIGHT" : "DAY"));
    document.querySelectorAll("[data-day][data-night]").forEach((img) => {
      const want = t === "night" ? img.dataset.night : img.dataset.day;
      if (img.getAttribute("src") !== want) img.src = want;
    });
    window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
  };
  window.setTheme = setTheme;
  document.addEventListener("click", (e) => {
    const t = e.target.closest(".toggle");
    if (!t) return;
    setTheme(doc.getAttribute("data-theme") === "night" ? "day" : "night", true);
  });
  setTheme(doc.getAttribute("data-theme") || "day", false);

  /* ---------- loader (first visit per session) ---------- */
  const loader = document.querySelector(".loader");
  const finishLoad = () => {
    document.body.classList.add("ready");
    window.dispatchEvent(new Event("siteready"));
  };
  if (loader) {
    if (sessionStorage.getItem("mk-seen") || reduce) {
      loader.remove();
      requestAnimationFrame(finishLoad);
    } else {
      sessionStorage.setItem("mk-seen", "1");
      const c = loader.querySelector(".count");
      let n = 0;
      const t0 = performance.now();
      const tick = (now) => {
        n = Math.min(100, Math.round(((now - t0) / 2200) * 100));
        if (c) c.textContent = String(n).padStart(3, "0");
        if (n < 100) requestAnimationFrame(tick);
        else {
          loader.classList.add("done");
          setTimeout(finishLoad, 350);
          setTimeout(() => loader.remove(), 1300);
        }
      };
      requestAnimationFrame(tick);
    }
  } else requestAnimationFrame(finishLoad);

  /* ---------- page transition curtain ---------- */
  const curtain = document.createElement("div");
  curtain.className = "curtain";
  document.body.appendChild(curtain);
  if (sessionStorage.getItem("mk-trans")) {
    sessionStorage.removeItem("mk-trans");
    curtain.style.transform = "translateY(0)";
    requestAnimationFrame(() => requestAnimationFrame(() => { curtain.style.transform = ""; curtain.classList.add("out"); }));
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || reduce) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.target === "_blank" || a.hasAttribute("download") || /^(mailto|tel|https?):/.test(href) || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    sessionStorage.setItem("mk-trans", "1");
    curtain.classList.remove("out");
    curtain.classList.add("in");
    setTimeout(() => (location.href = href), 650);
  });
  window.addEventListener("pageshow", (e) => { if (e.persisted) { curtain.className = "curtain"; } });

  /* ---------- nav: hide on scroll down, solid after hero ---------- */
  const nav = document.querySelector(".nav");
  let lastY = 0;
  const onScrollNav = () => {
    const y = window.scrollY;
    if (!nav) return;
    nav.classList.toggle("scrolled", y > 60);
    nav.classList.toggle("hide", y > lastY && y > 400 && !document.body.classList.contains("menu-open"));
    document.body.classList.toggle("nav-hidden", nav.classList.contains("hide"));
    lastY = y;
  };
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();
  document.querySelectorAll(".menu-btn").forEach((b) => b.addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
    b.setAttribute("aria-expanded", document.body.classList.contains("menu-open"));
  }));
  document.querySelectorAll(".mobile-menu a").forEach((a) => a.addEventListener("click", () => document.body.classList.remove("menu-open")));

  /* ---------- split headings into lines ---------- */
  document.querySelectorAll("[data-split]").forEach((el) => {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((p, i) => `<span class="split-line"><span style="transition-delay:${i * 0.09}s">${p.trim()}</span></span>`).join("");
  });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -12% 0px" });
  window.observeReveal = (root = document) => root.querySelectorAll(".rv, .rv-mask, [data-split]").forEach((el) => io.observe(el));
  window.observeReveal();

  /* ---------- parallax [data-speed] ---------- */
  const para = () => document.querySelectorAll("[data-speed]");
  const runPara = () => {
    if (reduce) return;
    const vh = innerHeight;
    para().forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = `translate3d(0, ${(p * parseFloat(el.dataset.speed) * 100).toFixed(2)}px, 0)`;
    });
  };
  window.addEventListener("scroll", () => requestAnimationFrame(runPara), { passive: true });
  window.addEventListener("resize", runPara);
  window.runPara = runPara;
  runPara();

  /* ---------- custom cursor ---------- */
  if (fine && !reduce) {
    const ring = document.createElement("div");
    ring.className = "cursor";
    ring.innerHTML = "<span></span>";
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.append(ring, dot);
    const label = ring.querySelector("span");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("pointerover", (e) => {
      const c = e.target.closest("[data-cursor]");
      const l = e.target.closest("a, button");
      ring.classList.toggle("is-label", !!c);
      ring.classList.toggle("is-link", !c && !!l);
      label.textContent = c ? c.dataset.cursor : "";
    });
  }

  /* ---------- WhatsApp float ---------- */
  const wa = document.querySelector(".wa-float");
  if (wa) {
    wa.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hello MK Art Concepts, I would like to discuss an interior project.")}`;
    const s = () => wa.classList.toggle("show", scrollY > innerHeight * 0.6);
    addEventListener("scroll", s, { passive: true }); s();
  }

  /* ---------- open / closed status ---------- */
  document.querySelectorAll(".open-now").forEach((el) => {
    const now = new Date();
    const m = now.getHours() * 60 + now.getMinutes();
    const [oh, om] = SITE.hours.open.split(":").map(Number);
    const [ch, cm] = SITE.hours.close.split(":").map(Number);
    const open = m >= oh * 60 + om && m < ch * 60 + cm;
    el.classList.toggle("closed", !open);
    el.querySelector("span").textContent = open ? "Open now · closes 7:30 pm" : "Closed now · closes 7:30 pm daily";
  });

  /* ---------- active nav link ---------- */
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => { if (a.getAttribute("href") === page) a.classList.add("active"); });

  /* ---------- year ---------- */
  document.querySelectorAll("[data-year]").forEach((e) => (e.textContent = new Date().getFullYear()));

  /* =========================================================
     LIGHTBOX
     ========================================================= */
  const lb = document.createElement("div");
  lb.className = "lb";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.innerHTML = `
    <div class="lb-top"><span class="lb-count">01 / 01</span><span class="lb-space"></span>
      <button class="lb-btn lb-close" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>
    <div class="lb-stage">
      <button class="lb-btn lb-prev" aria-label="Previous"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <img alt="">
      <button class="lb-btn lb-next" aria-label="Next"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
    </div>
    <div class="lb-bot"><span class="lb-cap"></span><span class="mono lb-proj"></span></div>`;
  document.body.appendChild(lb);
  const lbImg = lb.querySelector(".lb-stage img");
  let lbList = [], lbI = 0, lastFocus = null;
  const lbShow = (i) => {
    lbI = (i + lbList.length) % lbList.length;
    const it = lbList[lbI];
    lbImg.classList.add("swap");
    const pre = new Image();
    pre.onload = pre.onerror = () => {
      lbImg.src = it.src + ".webp";
      lbImg.alt = it.cap;
      lbImg.classList.remove("swap");
    };
    pre.src = it.src + ".webp";
    lb.querySelector(".lb-count").textContent = `${String(lbI + 1).padStart(2, "0")} / ${String(lbList.length).padStart(2, "0")}`;
    lb.querySelector(".lb-space").textContent = it.space || "";
    lb.querySelector(".lb-cap").textContent = it.cap || "";
    lb.querySelector(".lb-proj").textContent = it.project || "";
    [lbI + 1, lbI - 1].forEach((k) => { const n = lbList[(k + lbList.length) % lbList.length]; if (n) new Image().src = n.src + ".webp"; });
  };
  window.openLightbox = (list, i) => {
    lbList = list; lastFocus = document.activeElement;
    lb.classList.add("open"); document.body.style.overflow = "hidden";
    lbShow(i); lb.querySelector(".lb-close").focus();
  };
  const lbClose = () => { lb.classList.remove("open"); document.body.style.overflow = ""; lastFocus && lastFocus.focus(); };
  lb.querySelector(".lb-close").onclick = lbClose;
  lb.querySelector(".lb-prev").onclick = () => lbShow(lbI - 1);
  lb.querySelector(".lb-next").onclick = () => lbShow(lbI + 1);
  lb.querySelector(".lb-stage").addEventListener("click", (e) => { if (e.target.classList.contains("lb-stage")) lbClose(); });
  addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") lbClose();
    if (e.key === "ArrowRight") lbShow(lbI + 1);
    if (e.key === "ArrowLeft") lbShow(lbI - 1);
  });
  let sx = null;
  lb.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) lbShow(lbI + (dx < 0 ? 1 : -1));
    sx = null;
  });

  /* ---------- helper: project URL ---------- */
  window.projectURL = (id) => `project.html?p=${encodeURIComponent(id)}`;
})();

/* =========================================================
   Sketch ↔ photo reveal (used on home + project hero)
   ========================================================= */
window.initReveal = function (root, opts = {}) {
  if (!root) return;
  if (innerWidth < 760) opts.rest = 84;
  let x = opts.start ?? 50, target = x, dragging = false, auto = true;
  const set = (v) => root.style.setProperty("--x", v.toFixed(2) + "%");
  set(x);
  const toPct = (cx) => {
    const r = root.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((cx - r.left) / r.width) * 100));
  };
  const handle = root.querySelector(".hero-handle button");
  const start = (e) => { dragging = true; auto = false; target = toPct(e.clientX); handle && handle.setPointerCapture && e.pointerId !== undefined && handle.setPointerCapture(e.pointerId); };
  root.addEventListener("pointerdown", (e) => { if (e.target.closest("a")) return; start(e); });
  addEventListener("pointermove", (e) => {
    if (dragging) target = toPct(e.clientX);
    else if (matchMedia("(pointer: fine)").matches && !auto) {
      const r = root.getBoundingClientRect();
      if (e.clientY > r.top && e.clientY < r.bottom) target = toPct(e.clientX);
    }
  }, { passive: true });
  addEventListener("pointerup", () => (dragging = false));
  root.addEventListener("pointerenter", () => { auto = false; });
  if (handle) handle.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { auto = false; target = Math.max(0, target - 5); }
    if (e.key === "ArrowRight") { auto = false; target = Math.min(100, target + 5); }
  });
  // intro sweep: sketch covers everything, then slides back to reveal the photo
  const intro = () => {
    if (window.REDUCE) { x = target = opts.rest ?? 58; set(x); return; }
    x = 0; set(0); target = 0;
    const t0 = performance.now(), D = 2600, to = opts.rest ?? 58;
    const step = (now) => {
      if (!auto) return;
      const k = Math.min(1, (now - t0) / D);
      const e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      x = target = e * to; set(x);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  // sketch layer clipped from left = x, i.e. left side photo, right side sketch
  if (document.body.classList.contains("ready")) intro(); else addEventListener("siteready", intro, { once: true });
  const loop = () => {
    if (!auto) { x += (target - x) * 0.14; set(x); }
    requestAnimationFrame(loop);
  };
  loop();
};
