/* ETA PRO — scroll engine and the throwable deck.

   Two motion models, kept deliberately separate:

   • The portal is bound to scroll POSITION. Every value is a pure function of how
     far through the section the reader is, so it plays in reverse on the way back
     up and cannot drift out of sync with the page.
   • Entry reveals fire ONCE and never un-reveal. They are scoped to html.js-anim,
     which is only added when prefers-reduced-motion is not set — so the
     reduced-motion and no-JS renders are the finished page, not a blank one. */

(() => {
  "use strict";

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduced) document.documentElement.classList.add("js-anim");

  /* ------------------------------------------------------- portal engine */

  const portal = document.querySelector("#portal");
  const stage = portal ? portal.querySelector(".portal-stage") : null;
  const panelL = portal ? portal.querySelector(".panel-l") : null;
  const panelR = portal ? portal.querySelector(".panel-r") : null;
  const image = portal ? portal.querySelector(".portal-image") : null;
  const duotone = portal ? portal.querySelector(".duotone") : null;
  const dotA = portal ? portal.querySelector(".dot-amber") : null;
  const dotT = portal ? portal.querySelector(".dot-teal") : null;
  const title = portal ? portal.querySelector("#portal-title") : null;
  const spanA = title ? title.querySelector(".t-a") : null;
  const spanB = title ? title.querySelector(".t-b") : null;

  // measured once, then on resize — never assumed
  const metrics = { panelWidth: 0, spanA: 0, spanB: 0, scrollable: 1 };

  const measure = () => {
    if (!portal || !stage) return;
    metrics.panelWidth = stage.clientWidth * 0.502;
    metrics.scrollable = Math.max(portal.offsetHeight - window.innerHeight, 1);
    if (spanA) metrics.spanA = spanA.offsetWidth;
    if (spanB) metrics.spanB = spanB.offsetWidth;
  };

  const applyPortal = () => {
    if (!portal || !stage) return;
    const top = portal.getBoundingClientRect().top;
    const p = clamp(-top / metrics.scrollable, 0, 1);

    // panels clear the frame; image settles from an overscale; the wash rises
    if (panelL) panelL.style.transform = `translate3d(${-p * metrics.panelWidth * 1.04}px,0,0)`;
    if (panelR) panelR.style.transform = `translate3d(${p * metrics.panelWidth * 1.04}px,0,0)`;
    if (image) image.style.setProperty("--img-scale", (1.08 - 0.08 * p).toFixed(4));
    if (duotone) duotone.style.setProperty("--duo", (0.34 * p).toFixed(4));

    // the two accent dots travel out toward opposite corners
    if (dotA) dotA.style.transform = `translate3d(${-p * 44}vw, ${-p * 34}vh, 0)`;
    if (dotT) dotT.style.transform = `translate3d(${p * 44}vw, ${p * 34}vh, 0)`;

    // the signature move: grow AND tighten at the same time, halves parting
    if (title) {
      title.style.setProperty("--title-scale", (1 + 0.16 * p).toFixed(4));
      title.style.setProperty("--track", `${(-0.02 - 0.035 * p).toFixed(4)}em`);
    }
    if (spanA) spanA.style.transform = `translate3d(${-p * metrics.spanA * 0.5}px,0,0)`;
    if (spanB) spanB.style.transform = `translate3d(${p * metrics.spanB * 0.5}px,0,0)`;
  };

  /* -------------------------------------------------- statement orbit */

  const statement = document.querySelector("#statement");
  const orbit = document.querySelector("#orbit");

  const applyOrbit = () => {
    if (!statement || !orbit) return;
    const rect = statement.getBoundingClientRect();
    const progress = clamp(1 - rect.top / window.innerHeight, 0, 1.6);
    orbit.style.transform =
      `translateY(calc(-50% + ${(-progress * 60).toFixed(1)}px)) ` +
      `translateX(${(-progress * 40).toFixed(1)}px) ` +
      `rotate(${(progress * 46).toFixed(1)}deg)`;
  };

  /* ------------------------------------------------------------ the deck */

  const deck = document.querySelector("#deck");
  const dotsHost = document.querySelector("#deck-dots");

  if (deck) {
    const sleeves = Array.from(deck.querySelectorAll(".sleeve"));
    let order = sleeves.slice();
    let busy = false;

    const restack = () => {
      order.forEach((card, depth) => {
        card.style.zIndex = String(100 - depth);
        card.style.opacity = "1";
        card.style.transform =
          `translate3d(${depth * 12}px, ${-depth * 9}px, 0) ` +
          `scale(${(1 - depth * 0.035).toFixed(3)}) ` +
          `rotate(${depth % 2 ? 1.3 : -1.1}deg)`;
      });
      if (dotsHost) {
        dotsHost.innerHTML = order
          .map((card, index) => `<i class="${index === 0 ? "on" : ""}"></i>`)
          .join("");
      }
    };

    const throwTop = (direction) => {
      if (busy) return;
      busy = true;
      const card = order[0];
      const width = deck.clientWidth;
      card.classList.add("dragging");
      card.style.transform =
        `translate3d(${direction * width * 1.5}px, -46px, 0) ` +
        `rotate(${direction * 17}deg) scale(1.02)`;
      card.style.opacity = "0";

      window.setTimeout(() => {
        card.classList.remove("dragging");
        order = order.slice(1).concat(card);
        restack();
        busy = false;
      }, 420);
    };

    let drag = null;

    deck.addEventListener("pointerdown", (event) => {
      if (busy) return;
      const card = order[0];
      if (!card.contains(event.target)) return;
      drag = { id: event.pointerId, startX: event.clientX, dx: 0, width: deck.clientWidth };
      card.classList.add("dragging");
      deck.setPointerCapture(event.pointerId);
    });

    deck.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      drag.dx = event.clientX - drag.startX;
      const card = order[0];
      card.style.transform =
        `translate3d(${drag.dx}px, ${Math.abs(drag.dx) * -0.06}px, 0) ` +
        `rotate(${drag.dx / 22}deg) scale(1.015)`;
    });

    const endDrag = (event) => {
      if (!drag) return;
      const { dx, width, id } = drag;
      drag = null;
      if (deck.hasPointerCapture && deck.hasPointerCapture(id)) {
        deck.releasePointerCapture(id);
      }
      const card = order[0];
      card.classList.remove("dragging");
      // a tenth of the deck width is the throw threshold
      if (Math.abs(dx) > width * 0.1) {
        throwTop(dx > 0 ? 1 : -1);
      } else {
        restack();
      }
    };

    deck.addEventListener("pointerup", endDrag);
    deck.addEventListener("pointercancel", endDrag);
    deck.addEventListener("pointerleave", (event) => {
      if (drag && event.pointerId === drag.id) endDrag(event);
    });

    deck.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") { event.preventDefault(); throwTop(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); throwTop(-1); }
    });

    restack();
  }

  /* --------------------------------------------------------- reveals */

  const reveals = Array.from(document.querySelectorAll(".reveal"));

  if (!("IntersectionObserver" in window) || reduced) {
    reveals.forEach((node) => node.classList.add("in"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );
    reveals.forEach((node, index) => {
      node.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
      observer.observe(node);
    });
  }

  /* ------------------------------------------------------------- loop */

  let queued = false;
  const onFrame = () => {
    queued = false;
    applyPortal();
    applyOrbit();
  };

  const requestFrame = () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(onFrame);
  };

  const remeasure = () => {
    measure();
    requestFrame();
  };

  measure();
  requestFrame();

  // Test hook: lets a headless harness read the scroll-bound values without
  // depending on rAF timing. Harmless in production, used by the verification
  // script that checks the portal actually travels.
  window.__eta = {
    apply: () => { applyPortal(); applyOrbit(); },
    metrics: () => ({ ...metrics }),
  };

  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", remeasure);
  window.addEventListener("load", remeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
})();
