/* Home page interactions */
(function () {
  const P = window.PROJECTS;
  const byId = Object.fromEntries(P.map((p) => [p.id, p]));
  const img = (pid, n) => ({ ...byId[pid].images[n - 1], project: byId[pid].title, pid });
  const reduce = window.REDUCE;

  /* ---------- hero reveal ---------- */
  initReveal(document.getElementById("hero"), { rest: 58 });

  /* ---------- manifesto word lighting ---------- */
  const man = document.getElementById("manifesto");
  if (man) {
    const walk = (node) => {
      [...node.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach((w) => {
            if (!w.trim()) frag.append(w);
            else { const s = document.createElement("span"); s.className = "w"; s.textContent = w; frag.append(s); }
          });
          c.replaceWith(frag);
        } else walk(c);
      });
    };
    walk(man);
    const words = man.querySelectorAll(".w");
    const lit = () => {
      const r = man.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const n = reduce ? words.length : Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < n));
    };
    addEventListener("scroll", lit, { passive: true }); lit();
  }

  /* ---------- counters ---------- */
  const totals = {
    projects: P.length,
    frames: P.reduce((a, p) => a + p.images.length, 0),
    spaces: new Set(P.flatMap((p) => p.images.map((i) => i.space))).size,
  };
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, to = totals[el.dataset.count], t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 1600);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3)))).padStart(2, "0");
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    cio.unobserve(el);
  }), { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((e) => cio.observe(e));

  /* ---------- chapters ---------- */
  const tagCount = (p) => {
    const m = {};
    p.images.forEach((i) => i.tags.forEach((t) => (m[t] = (m[t] || 0) + 1)));
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 4).map((x) => x[0]);
  };
  const chapters = document.getElementById("chapters");
  chapters.innerHTML = P.map((p) => {
    const c = p.images[p.cover];
    const spaces = [...new Set(p.images.map((i) => i.space))];
    return `
    <article class="chapter">
      <a class="chapter-media rv-mask" href="${projectURL(p.id)}" data-cursor="OPEN" aria-label="Open ${p.title}">
        <span class="badge">${p.kind}</span>
        <div class="ph"><img src="${c.src}.webp" alt="${c.cap}" loading="lazy" data-speed="-0.35"></div>
        <div class="sk" aria-hidden="true"><img src="assets/img/sketch/${p.id}.webp" alt="" loading="lazy" data-speed="-0.35"></div>
      </a>
      <div class="chapter-info rv">
        <span class="chapter-no">${p.no}</span>
        <h3>${p.title}</h3>
        <p>${p.lede}</p>
        <div class="chips">${tagCount(p).map((t) => `<span class="chip">${t}</span>`).join("")}</div>
        <p class="mono" style="margin-bottom:22px">${spaces.length} spaces · ${p.images.length} frames</p>
        <a class="arrow-link" href="${projectURL(p.id)}">View project <svg viewBox="0 0 34 12"><path d="M0 6h32M27 1l5 5-5 5"/></svg></a>
      </div>
    </article>`;
  }).join("");
  // x-ray lens follows the cursor
  chapters.querySelectorAll(".chapter-media").forEach((m) => {
    m.addEventListener("pointermove", (e) => {
      const r = m.getBoundingClientRect();
      m.style.setProperty("--mx", e.clientX - r.left + "px");
      m.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });
  observeReveal(chapters);
  runPara();

  /* ---------- walkthrough ---------- */
  const rooms = [
    ["Foyer", img("terrace-house", 12)],
    ["Living", img("terrace-house", 1)],
    ["Pooja", img("terrace-house", 9)],
    ["Dining", img("floating-stair-house", 7)],
    ["Stair", img("floating-stair-house", 3)],
    ["Bedroom", img("floating-stair-house", 8)],
    ["Dressing", img("terrace-house", 20)],
    ["Bath", img("terrace-house", 22)],
    ["Office", img("the-chamber", 1)],
    ["Terrace", img("terrace-house", 35)],
  ];
  const track = document.getElementById("walkTrack");
  track.innerHTML = rooms.map(([name, im], i) => `
    <div class="room" data-i="${i}">
      <span class="room-no">${String(i + 1).padStart(2, "0")} — ${name.toUpperCase()}</span>
      <figure>
        <div class="ph" style="aspect-ratio:${im.w}/${im.h}"><img src="${im.src}-s.webp" srcset="${im.src}-s.webp 760w, ${im.src}.webp ${im.w}w" sizes="60vw" alt="${im.cap}" loading="lazy" data-cursor="VIEW"></div>
      <figcaption><span><b>${name}</b>${im.cap}</span><span class="mono">${im.project}</span></figcaption>
      </figure>
    </div>`).join("");
  track.querySelectorAll(".room img").forEach((el, i) => el.addEventListener("click", () => openLightbox(rooms.map((r) => r[1]), i)));

  // floor plan minimap — abstract plan with one cell per room
  const cells = [[4,4,40,40],[46,4,70,40],[118,4,30,40],[150,4,46,40],[4,46,30,40],[36,46,62,40],[100,46,40,40],[142,46,54,40],[4,88,92,38],[98,88,98,38]];
  const svg = document.getElementById("mmSvg");
  svg.innerHTML = cells.map((c, i) => `<rect data-i="${i}" x="${c[0]}" y="${c[1]}" width="${c[2]}" height="${c[3]}"/><text x="${c[0] + 4}" y="${c[1] + 11}">${rooms[i][0].toUpperCase()}</text>`).join("");
  const walk = document.getElementById("walk");
  const sticky = walk.querySelector(".walk-sticky");
  const tape = walk.querySelector(".tape");
  const mmRoom = document.getElementById("mmRoom");
  let dist = 0;
  const isMobile = () => matchMedia("(max-width: 860px)").matches;
  const sizeWalk = () => {
    if (isMobile()) { walk.style.height = ""; return; }
    dist = Math.max(0, track.scrollWidth - innerWidth);
    walk.style.height = innerHeight + dist + "px";
  };
  const roomEls = [...track.querySelectorAll(".room")];
  const onWalk = () => {
    if (isMobile()) return;
    const r = walk.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (dist || 1)));
    track.style.transform = `translate3d(${-p * dist}px,0,0)`;
    tape.style.setProperty("--p", p);
    tape.querySelector(".tape-read").textContent = (p * 24).toFixed(1) + " m";
    // active room = the one nearest the left third of the viewport
    let best = 0, bd = 1e9;
    roomEls.forEach((el, i) => { const d = Math.abs(el.getBoundingClientRect().left - innerWidth * 0.25); if (d < bd) { bd = d; best = i; } });
    svg.querySelectorAll("rect").forEach((rc) => rc.classList.toggle("on", +rc.dataset.i === best));
    mmRoom.textContent = rooms[best][0].toUpperCase();
  };
  svg.addEventListener("click", (e) => {
    const rc = e.target.closest("rect"); if (!rc) return;
    const el = roomEls[+rc.dataset.i];
    const off = el.offsetLeft - innerWidth * 0.25 + parseFloat(getComputedStyle(track).paddingLeft);
    const p = Math.min(1, Math.max(0, off / (dist || 1)));
    scrollTo({ top: walk.offsetTop + p * dist, behavior: "smooth" });
  });
  addEventListener("resize", () => { sizeWalk(); onWalk(); });
  addEventListener("scroll", () => requestAnimationFrame(onWalk), { passive: true });
  addEventListener("load", () => { sizeWalk(); onWalk(); });
  track.querySelectorAll("img").forEach((i) => i.addEventListener("load", sizeWalk, { once: true }));
  sizeWalk(); onWalk();

  /* ---------- day → night slider ---------- */
  const hs = document.getElementById("hoursStage");
  const hourImgs = [img("terrace-house", 31), img("terrace-house", 33), img("terrace-house", 35)];
  hourImgs.forEach((h, i) => {
    const el = document.createElement("img");
    el.src = h.src + ".webp"; el.alt = h.cap; el.loading = "lazy";
    el.style.opacity = i === 0 ? 1 : 0;
    hs.insertBefore(el, hs.firstChild);
  });
  const layers = [...hs.querySelectorAll("img")].reverse();
  const range = document.getElementById("hourRange");
  const clock = document.getElementById("hoursClock");
  const setHour = (v) => {
    const t = v / 100 * 2; // 0..2 across 3 images
    layers.forEach((l, i) => (l.style.opacity = Math.max(0, 1 - Math.abs(t - i))));
    const mins = 18 * 60 + 30 + Math.round((v / 100) * 150); // 6:30 → 9:00 pm
    clock.textContent = `${Math.floor(mins / 60) - 12}:${String(mins % 60).padStart(2, "0")} pm`;
  };
  range.addEventListener("input", () => setHour(+range.value));
  setHour(0);
  // drift with scroll until user touches it
  let touched = false;
  range.addEventListener("pointerdown", () => (touched = true));
  addEventListener("scroll", () => {
    if (touched || reduce) return;
    const r = hs.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
    range.value = Math.round(Math.min(1, Math.max(0, (p - 0.25) / 0.5)) * 100);
    setHour(+range.value);
  }, { passive: true });

  /* ---------- swatches ---------- */
  const MATS = window.MATERIALS;
  document.getElementById("swatches").innerHTML = MATS.map((m, i) => `
    <a class="swatch rv" style="transition-delay:${i * 0.06}s" href="materials.html#${m.key}">
      <div class="disc" style="background-image:url(${m.img}-s.webp);background-position:${m.pos}"></div>
      <b>${m.name}</b><span>${m.note}</span>
    </a>`).join("");
  observeReveal(document.getElementById("swatches"));

  /* ---------- services ---------- */
  const SV = [
    ["Residential interiors", "Whole-home design for apartments, bungalows and duplexes.", img("terrace-house", 1)],
    ["Offices & chambers", "Professional spaces that build trust as soon as clients walk in.", img("the-chamber", 1)],
    ["Pooja & sacred spaces", "Jaali doors, lit arches and brass details.", img("terrace-house", 9)],
    ["Kitchens & wardrobes", "Modular joinery, walk-in wardrobes, tile and stone.", img("floating-stair-house", 7)],
    ["Lighting design", "Cove, track, niche and lantern lighting, planned with the layout.", img("terrace-house", 27)],
    ["Turnkey execution", "From civil work to the last cushion, one team, one handover.", img("floating-stair-house", 3)],
  ];
  const list = document.getElementById("serviceList");
  const prev = document.getElementById("svcPreview");
  list.innerHTML = SV.map((s, i) => `<li class="rv"><a href="#contact" data-i="${i}"><span class="n">0${i + 1}</span><h3>${s[0]}</h3><p>${s[1]}</p></a></li>`).join("");
  prev.innerHTML = SV.map((s) => `<img src="${s[2].src}-s.webp" alt="" loading="lazy">`).join("");
  observeReveal(list);
  let px = 0, py = 0, cx = 0, cy = 0, run = false;
  const pv = () => { cx += (px - cx) * 0.15; cy += (py - cy) * 0.15; prev.style.transform = `translate(${cx + 30}px, ${cy - 180}px) ${prev.classList.contains("show") ? "" : "scale(.7)"}`; if (run) requestAnimationFrame(pv); };
  list.addEventListener("pointerenter", () => { prev.classList.add("show"); run = true; pv(); });
  list.addEventListener("pointerleave", () => { prev.classList.remove("show"); run = false; });
  list.addEventListener("pointermove", (e) => {
    px = e.clientX; py = e.clientY;
    const a = e.target.closest("a"); if (!a) return;
    prev.querySelectorAll("img").forEach((im, i) => im.classList.toggle("on", i === +a.dataset.i));
  });

  /* ---------- process line ---------- */
  const pw = document.getElementById("processWrap");
  const steps = pw.querySelectorAll(".step");
  addEventListener("scroll", () => {
    const r = pw.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.8 - r.top) / (r.height + innerHeight * 0.3)));
    pw.querySelector(".process-line").style.setProperty("--p", p);
    steps.forEach((s, i) => s.classList.toggle("on", p >= i / steps.length + 0.05));
  }, { passive: true });

  /* ---------- studio image ---------- */
  const si = img("terrace-house", 9);
  document.getElementById("studioImg").src = si.src + ".webp";
})();
