/* ETA Pro landing page — scroll animation, tilt, counters, tabs, marquee.

   No dependencies. Everything degrades: with JS disabled the page is fully
   readable (reveals are CSS-visible without the .js class), and with
   prefers-reduced-motion every animation is off. */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("js");

  /* --------------------------------------------------------- scroll reveal */

  const reveal = () => {
    const nodes = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduced) {
      nodes.forEach((n) => n.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    nodes.forEach((node, i) => {
      node.style.transitionDelay = `${Math.min(i % 5, 4) * 70}ms`;
      io.observe(node);
    });
  };

  /* ------------------------------------------------------------- count up */

  const countUp = () => {
    $$("[data-count]").forEach((node) => {
      const target = Number(node.dataset.count);
      const suffix = node.dataset.suffix || "";
      if (reduced || !target) {
        node.textContent = target + suffix;
        return;
      }
      const io = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / 1100, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          node.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      io.observe(node);
    });
  };

  /* ---------------------------------------------------------------- tilt */

  const tilt = () => {
    if (reduced) return;
    $$("[data-tilt]").forEach((card) => {
      const MAX = 6;
      card.addEventListener("pointermove", (event) => {
        const box = card.getBoundingClientRect();
        const px = (event.clientX - box.left) / box.width;
        const py = (event.clientY - box.top) / box.height;
        card.style.setProperty("--ty", `${(px - 0.5) * 2 * MAX}deg`);
        card.style.setProperty("--tx", `${(0.5 - py) * 2 * MAX}deg`);
        card.style.setProperty("--mx", `${px * 100}%`);
        card.style.setProperty("--my", `${py * 100}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tx", "0deg");
        card.style.setProperty("--ty", "0deg");
      });
    });
  };

  /* ------------------------------------------------------------- parallax */

  const parallax = () => {
    if (reduced) return;
    const blobs = $$(".blob");
    if (!blobs.length) return;
    const state = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener(
      "pointermove",
      (e) => {
        state.tx = e.clientX / innerWidth - 0.5;
        state.ty = e.clientY / innerHeight - 0.5;
        const glow = $(".cursor-glow");
        if (glow) {
          glow.style.left = `${e.clientX}px`;
          glow.style.top = `${e.clientY + scrollY}px`;
        }
      },
      { passive: true }
    );
    const loop = () => {
      state.x += (state.tx - state.x) * 0.05;
      state.y += (state.ty - state.y) * 0.05;
      blobs.forEach((blob, i) => {
        const depth = (i + 1) * 10;
        blob.style.translate = `${(state.x * depth).toFixed(1)}px ${(state.y * depth).toFixed(1)}px`;
      });
      requestAnimationFrame(loop);
    };
    loop();
  };

  /* ---------------------------------------------------------- event stream */

  const EVENTS = [
    ["translation_requested", "hi-IN · 41 ms", ""],
    ["term_glossed", "te-IN · chlorophyll", ""],
    ["tutor_refused_ungrounded", "ta-IN", "refusal"],
    ["quiz_passed", "bn-IN · 100%", ""],
    ["recommendation_shown", "hi-IN · core", ""],
    ["lesson_opened", "te-IN · photosynthesis", ""],
    ["translation_served", "cache hit · 2 ms", ""],
    ["export_refreshed", "98 rows", ""],
  ];

  const stream = () => {
    const host = $("#event-stream");
    if (!host) return;
    let index = 0;
    const render = () => {
      host.innerHTML = EVENTS.slice(index, index + 5)
        .map(
          ([name, meta, kind], i) =>
            `<div class="event-row ${kind}" style="animation-delay:${i * 60}ms">
               <span class="name">${name}</span><span class="meta">${meta}</span>
             </div>`
        )
        .join("");
    };
    render();
    if (reduced) return;
    setInterval(() => {
      index = (index + 1) % EVENTS.length;
      render();
    }, 2600);
  };

  /* ----------------------------------------------------------------- nav */

  const navShadow = () => {
    const nav = $(".nav");
    if (!nav) return;
    const onScroll = () => {
      nav.style.borderBottomColor = scrollY > 20 ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.09)";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  };

  reveal();
  countUp();
  tilt();
  parallax();
  stream();
  navShadow();
})();
