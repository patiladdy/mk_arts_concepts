/* Project page — editorial monograph built from data.js */
(function () {
  const P = window.PROJECTS;
  const id = new URLSearchParams(location.search).get("p") || P[0].id;
  const pi = Math.max(0, P.findIndex((p) => p.id === id));
  const p = P[pi];
  const all = p.images.map((im) => ({ ...im, project: p.title }));
  const cover = p.images[p.cover];

  document.title = `${p.title} — MK Art Concepts, Solapur`;
  document.querySelector('meta[name="description"]').content = p.lede;
  const $ = (s) => document.getElementById(s);
  $("pPhoto").src = cover.src + ".webp"; $("pPhoto").alt = cover.cap;
  $("pSketch").src = `assets/img/sketch/${p.id}.webp`;
  $("pKind").textContent = p.kind;
  $("pTitle").innerHTML = p.title.replace(/^The /, "The<br>").replace(/ House$/, "<em> House</em>").replace(/Chamber$/, "<em>Chamber</em>");
  $("pTitle").setAttribute("data-split", "");
  $("pNo").textContent = p.no;
  $("pNoMeta").textContent = `Project ${p.no} / ${String(P.length).padStart(2, "0")}`;
  $("pLede").textContent = p.lede;

  // group by space (order of first appearance)
  const groups = [];
  all.forEach((im, i) => {
    let g = groups.find((x) => x.space === im.space);
    if (!g) groups.push((g = { space: im.space, items: [] }));
    g.items.push({ ...im, gi: i });
  });
  const tags = {};
  all.forEach((im) => im.tags.forEach((t) => (tags[t] = (tags[t] || 0) + 1)));
  const topTags = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 5).map((x) => x[0]).join(", ");
  $("pSpec").innerHTML = [
    ["Type", p.kind],
    ["Spaces", groups.length],
    ["Frames", all.length],
    ["Palette", topTags],
    ["Design & build", "MK Art Concepts"],
  ].map(([k, v]) => `<div><dt class="k">${k}</dt><dd style="margin:0;text-align:right">${v}</dd></div>`).join("");

  const NOTES = {
    Living: "A living room should host a crowd and still feel calm with just two people in it.",
    Pooja: "We design the sacred corner first. Everything else follows from it.",
    Dining: "Light hangs low over the table, where people gather.",
    Kitchen: "Hard-working surfaces, finished with care.",
    Foyer: "The entrance sets the mood for the whole house.",
    Bedroom: "Soft materials, low light and nothing out of place.",
    Dressing: "Storage you'll enjoy opening.",
    Powder: "A small room can still make a strong statement.",
    Bath: "Tile, stone and water, with light set into the walls.",
    Terrace: "After dark, the house glows from the inside out.",
    Lounge: "The first impression of a practice, built in crystal and leather.",
    Gallery: "Art, sculpture and texture, displayed as in a private collection.",
    Reception: "A reception desk you'd want to run your hand along.",
    Details: "Gilded corners, mouldings and a clock to slow things down.",
    Stair: "Treads hung on slender rods, so the stair looks like it floats.",
    Balcony: "A green outdoor room, just big enough for two chairs.",
    Garden: "Stepping stones, textured walls and lawn.",
    Study: "A quiet room to work and read in.",
  };

  const isL = (im) => im.w / im.h > 1.05;
  const fig = (im, cls, n) => `
    <figure class="${cls} rv" data-gi="${im.gi}" data-cursor="VIEW">
      <div class="imgbox"><img src="${im.src}-s.webp" srcset="${im.src}-s.webp 760w, ${im.src}.webp ${im.w}w"
        sizes="${cls.includes("full") ? "100vw" : cls.includes("wide") ? "66vw" : "40vw"}"
        width="${im.w}" height="${im.h}" alt="${im.cap}" loading="lazy" decoding="async"></div>
      <figcaption><span class="mono">${String(im.gi + 1).padStart(2, "0")}</span><span>${im.cap}</span></figcaption>
    </figure>`;
  const quote = (space) => `<p class="g-quote rv">${NOTES[space] || ""}</p>`;

  const layout = (items, space) => {
    const q = items.slice(); let out = "", first = true, flip = false;
    while (q.length) {
      const a = q[0], b = q[1], c = q[2];
      if (isL(a) && b && !isL(b)) { out += flip ? fig(b, "g-tall", 0) + fig(a, "g-wide r") : fig(a, "g-wide") + fig(b, "g-tall offset"); q.splice(0, 2); flip = !flip; }
      else if (!isL(a) && b && isL(b)) { out += fig(a, "g-tall") + fig(b, "g-wide r"); q.splice(0, 2); }
      else if (!isL(a) && b && !isL(b) && c && !isL(c)) { out += fig(a, "g-third") + fig(b, "g-third") + fig(c, "g-third"); q.splice(0, 3); }
      else if (!isL(a) && b && !isL(b)) { out += fig(a, "g-tall") + fig(b, "g-tall offset") + quote(space); q.splice(0, 2); }
      else if (isL(a) && b && isL(b) && !(first && q.length % 2)) { out += fig(a, "g-half") + fig(b, "g-half"); q.splice(0, 2); }
      else if (isL(a)) { out += fig(a, "g-full"); q.splice(0, 1); }
      else { out += fig(a, "g-tall") + quote(space); q.splice(0, 1); }
      first = false;
    }
    return out;
  };

  $("spaces").innerHTML = groups.map((g, i) => `
    <section class="space" id="s-${g.space.toLowerCase()}">
      <div class="space-head">
        <h2 class="display" data-split>${g.space}</h2>
        <span class="mono">${String(i + 1).padStart(2, "0")} / ${String(groups.length).padStart(2, "0")} · ${g.items.length} frame${g.items.length > 1 ? "s" : ""}</span>
      </div>
      <div class="gal">${layout(g.items, g.space)}</div>
    </section>`).join("");
  $("spaceNav").innerHTML = groups.map((g) => `<a href="#s-${g.space.toLowerCase()}">${g.space}</a>`).join("");

  // re-run split for injected headings
  document.querySelectorAll("#spaces [data-split], #pTitle").forEach((el) => {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((x, i) => `<span class="split-line"><span style="transition-delay:${i * 0.09}s">${x.trim()}</span></span>`).join("");
  });
  addEventListener("siteready", () => $("pTitle").classList.add("in"));
  if (document.body.classList.contains("ready")) $("pTitle").classList.add("in");
  observeReveal(document.getElementById("main"));

  document.querySelectorAll(".gal figure").forEach((f) => f.addEventListener("click", () => openLightbox(all, +f.dataset.gi)));

  // active space in sticky nav
  const links = [...document.querySelectorAll("#spaceNav a")];
  const sio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((l) => {
      const on = l.getAttribute("href") === "#" + e.target.id;
      l.classList.toggle("on", on);
      if (on) l.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    });
  }), { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll(".space").forEach((s) => sio.observe(s));

  // next project
  const n = P[(pi + 1) % P.length];
  $("nextProj").href = projectURL(n.id);
  $("nextImg").src = n.images[n.cover].src + ".webp";
  $("nextTitle").textContent = n.title;

  initReveal($("pHero"), { rest: 62 });
})();
