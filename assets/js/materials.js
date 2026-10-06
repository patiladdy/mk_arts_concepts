/* Draggable infinite-feel moodboard with inertia + material filters */
(function () {
  const P = window.PROJECTS, M = window.MATERIALS;
  const vp = document.getElementById("viewport");
  const board = document.getElementById("board");
  const reduce = window.REDUCE;

  // seeded random so the layout is stable between visits
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  const photos = P.flatMap((p) => p.images.map((im) => ({ ...im, project: p.title, type: "photo" })));
  // shuffle photos
  for (let i = photos.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [photos[i], photos[j]] = [photos[j], photos[i]]; }
  const notes = [
    "Brass ages beautifully, so let it.",
    "Light is a material too.",
    "Jaali: privacy that still lets light through",
    "Every room needs one hand-made thing.",
    "Texture first, colour second.",
  ];
  const items = [];
  let si = 0, ni = 0;
  photos.forEach((ph, i) => {
    items.push(ph);
    if (i % 5 === 2 && si < M.length) items.push({ type: "sw", ...M[si++] });
    if (i % 13 === 7 && ni < notes.length) items.push({ type: "note", text: notes[ni++] });
  });
  while (si < M.length) items.push({ type: "sw", ...M[si++] });

  // masonry placement
  const COLW = innerWidth < 700 ? 210 : 290, GAP = innerWidth < 700 ? 60 : 90;
  const COLS = Math.max(6, Math.round(Math.sqrt(items.length * 1.6)));
  const heights = new Array(COLS).fill(0).map(() => rnd() * 200);
  const placed = [];
  items.forEach((it) => {
    let c = 0; heights.forEach((h, i) => { if (h < heights[c]) c = i; });
    const w = it.type === "sw" ? COLW * 0.68 : it.type === "note" ? COLW : COLW * (0.82 + rnd() * 0.3);
    const h = it.type === "photo" ? (w * it.h) / it.w + 40 : it.type === "sw" ? w + 50 : 120;
    const x = c * (COLW + GAP) + (COLW - w) / 2 + (rnd() - 0.5) * 30;
    const y = heights[c] + GAP * 0.6;
    heights[c] = y + h;
    placed.push({ it, x, y, w, h, rot: (rnd() - 0.5) * (it.type === "note" ? 8 : 5) });
  });
  const BW = COLS * (COLW + GAP), BH = Math.max(...heights) + 200;
  board.style.width = BW + "px"; board.style.height = BH + "px";

  board.innerHTML = placed.map((p, i) => {
    const s = `left:${p.x.toFixed(0)}px;top:${p.y.toFixed(0)}px;width:${p.w.toFixed(0)}px;--rot:${p.rot.toFixed(1)}deg`;
    if (p.it.type === "photo") return `<div class="card" data-i="${i}" data-tags="${p.it.tags.join(" ")}" style="${s}">${rnd() > 0.6 ? '<span class="tape-strip"></span>' : ""}<img src="${p.it.src}-s.webp" alt="${p.it.cap}" loading="lazy" width="${p.it.w}" height="${p.it.h}"><div class="cap"><span>${p.it.space}</span><span>${p.it.project.replace("The ", "")}</span></div></div>`;
    if (p.it.type === "sw") return `<div class="card sw" data-key="${p.it.key}" data-tags="${p.it.key}" style="${s}"><div class="disc" style="background-image:url(${p.it.img}-s.webp);background-position:${p.it.pos}"></div><b>${p.it.name}</b><span class="mono">${p.it.note}</span></div>`;
    return `<div class="card note" data-tags="" style="${s}">${p.it.text}</div>`;
  }).join("");

  /* ---------- pan with inertia ---------- */
  let x = -(BW / 2 - innerWidth / 2), y = -(BH / 2 - innerHeight / 2), vx = 0, vy = 0, tx = null, ty = null;
  const clamp = () => {
    const pad = 200;
    x = Math.min(pad, Math.max(innerWidth - BW - pad, x));
    y = Math.min(pad + 120, Math.max(innerHeight - BH - pad, y));
  };
  const apply = () => (board.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`);
  clamp(); apply();

  let down = false, moved = 0, lx = 0, ly = 0, lt = 0;
  vp.addEventListener("pointerdown", (e) => {
    down = true; moved = 0; lx = e.clientX; ly = e.clientY; lt = performance.now(); vx = vy = 0; tx = ty = null;
    vp.classList.add("dragging"); vp.setPointerCapture(e.pointerId);
  });
  vp.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - lx, dy = e.clientY - ly, now = performance.now(), dt = Math.max(1, now - lt);
    x += dx; y += dy; moved += Math.abs(dx) + Math.abs(dy);
    vx = (dx / dt) * 16; vy = (dy / dt) * 16;
    lx = e.clientX; ly = e.clientY; lt = now; clamp(); apply();
  });
  const up = (e) => {
    if (!down) return;
    down = false; vp.classList.remove("dragging");
    if (moved < 6) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const card = el && el.closest(".card");
      if (card && card.dataset.i !== undefined) {
        const list = placed.filter((p) => p.it.type === "photo").map((p) => p.it);
        const it = placed[+card.dataset.i].it;
        openLightbox(list, list.indexOf(it));
      } else if (card && card.dataset.key) setFilter(card.dataset.key);
    }
  };
  vp.addEventListener("pointerup", up);
  vp.addEventListener("pointercancel", () => { down = false; vp.classList.remove("dragging"); });
  vp.addEventListener("wheel", (e) => { e.preventDefault(); tx = ty = null; x -= e.deltaX; y -= e.deltaY; clamp(); apply(); }, { passive: false });
  addEventListener("keydown", (e) => {
    if (document.querySelector(".lb.open")) return;
    const k = { ArrowLeft: [120, 0], ArrowRight: [-120, 0], ArrowUp: [0, 120], ArrowDown: [0, -120] }[e.key];
    if (k) { tx = x + k[0]; ty = y + k[1]; }
  });
  const loop = () => {
    if (!down) {
      if (tx !== null) { x += (tx - x) * 0.09; y += (ty - y) * 0.09; if (Math.abs(tx - x) < 0.5 && Math.abs(ty - y) < 0.5) tx = ty = null; }
      else if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) { x += vx; y += vy; vx *= 0.94; vy *= 0.94; }
      clamp(); apply();
    }
    requestAnimationFrame(loop);
  };
  loop();
  addEventListener("resize", () => { clamp(); apply(); });
  document.getElementById("recenter").onclick = () => { tx = -(BW / 2 - innerWidth / 2); ty = -(BH / 2 - innerHeight / 2); };

  /* ---------- filters ---------- */
  const fwrap = document.getElementById("filters");
  const count = document.getElementById("moodCount");
  fwrap.innerHTML = `<button class="on" data-k="all">All</button>` + M.map((m) => `<button data-k="${m.key}"><i style="background-image:url(${m.img}-s.webp);background-position:${m.pos};background-size:400%"></i>${m.name}</button>`).join("");
  const cards = [...board.querySelectorAll(".card")];
  const setFilter = (k) => {
    fwrap.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.k === k));
    let n = 0, best = null, bd = 1e12;
    const cx = -x + innerWidth / 2, cy = -y + innerHeight / 2;
    cards.forEach((c, i) => {
      const match = k === "all" || (c.dataset.tags || "").split(" ").includes(k);
      c.classList.toggle("dim", !match);
      if (match && k !== "all" && c.dataset.i !== undefined) {
        n++;
        const p = placed[i], d = (p.x + p.w / 2 - cx) ** 2 + (p.y + p.h / 2 - cy) ** 2;
        if (d < bd) { bd = d; best = p; }
      }
    });
    const m = M.find((mm) => mm.key === k);
    count.textContent = k === "all" ? `${photos.length} frames · ${M.length} materials` : `${n} frames use ${m.name.toLowerCase()}`;
    if (best && !reduce) { tx = innerWidth / 2 - best.x - best.w / 2; ty = innerHeight / 2 - best.y - best.h / 2; }
    history.replaceState(null, "", k === "all" ? location.pathname : "#" + k);
  };
  fwrap.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) setFilter(b.dataset.k); });
  const h = location.hash.slice(1);
  setFilter(M.some((m) => m.key === h) ? h : "all");
})();
