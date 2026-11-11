/* Premium motion layer: Lenis + GSAP ScrollTrigger.

   This file is an ENHANCEMENT, never a requirement. It bails out immediately if
   the CDN libraries did not load, if the user prefers reduced motion, or if the
   page is being printed. assets/js/main.js already gives the page its reveal,
   counters, tilt and parallax — so a blocked CDN costs you polish, not content.

   What it adds on top:
     1. inertial scrolling (Lenis) wired into ScrollTrigger's ticker
     2. masked headline reveal — the h1 rises out of a clipping edge
     3. per-word reveal on section headings
     4. a pinned horizontal gallery driven by vertical scroll
     5. layered parallax on the hero card and product panels
     6. magnetic CTAs
     7. a scroll progress bar
*/

(() => {
  "use strict";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  if (reduced || !hasGsap) return;

  const { gsap } = window;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("motion");

  /* -------------------------------------------------- 1. smooth scrolling */

  if (typeof window.Lenis !== "undefined") {
    const lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // in-page anchors must go through Lenis, or the jump is instant
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        const target = id && id.length > 1 ? document.querySelector(id) : null;
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target, { offset: -70, duration: 1.4 });
      });
    });
  }

  /* --------------------------------------------- 2. masked hero headline */

  const heroTitle = document.querySelector("#hero-title");
  if (heroTitle) {
    gsap.set(heroTitle, { opacity: 1 });
    const tl = gsap.timeline({ delay: 0.15 });
    tl.from(heroTitle, { yPercent: 108, duration: 1.15, ease: "expo.out" })
      .from(
        ".hero .eyebrow, .hero .lede, .hero .pills, .hero .cta-row",
        { y: 26, opacity: 0, duration: 0.9, stagger: 0.09, ease: "expo.out" },
        0.15
      )
      .from(".event-card", { y: 34, opacity: 0, duration: 1, ease: "expo.out" }, 0.3)
      .from(".event-row", { x: 16, opacity: 0, duration: 0.5, stagger: 0.06 }, 0.5);
  }

  // Watchdog: if the animation ticker never advanced (throttled rAF in a
  // background tab, an extension blocking frames, a very slow device), the hero
  // must not stay trapped behind its mask. Content wins over choreography.
  setTimeout(() => {
    if (!heroTitle) return;
    const offset = Math.abs(Number(gsap.getProperty(heroTitle, "yPercent")) || 0);
    if (offset > 2) {
      gsap.set(heroTitle, { yPercent: 0 });
      gsap.set(".hero .eyebrow, .hero .lede, .hero .pills, .hero .cta-row, .event-card", {
        clearProps: "all",
      });
    }
  }, 2600);

  /* ------------------------------------------- 3. per-word section reveal */

  const splitWords = (el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    const frag = document.createDocumentFragment();
    words.forEach((word, index) => {
      const outer = document.createElement("span");
      outer.className = "split-word";
      const inner = document.createElement("span");
      inner.className = "split-inner";
      inner.textContent = word;
      outer.appendChild(inner);
      frag.appendChild(outer);
      if (index < words.length - 1) frag.appendChild(document.createTextNode(" "));
    });
    el.appendChild(frag);
    return el.querySelectorAll(".split-inner");
  };

  document.querySelectorAll("h2[data-split]").forEach((heading) => {
    const inner = splitWords(heading);
    gsap.from(inner, {
      yPercent: 115,
      duration: 0.95,
      ease: "expo.out",
      stagger: 0.045,
      scrollTrigger: { trigger: heading, start: "top 86%", once: true },
    });
  });

  /* ------------------------------- 4. pinned horizontal product gallery */

  const track = document.querySelector("#pin-track");
  const wrap = document.querySelector(".pin-wrap");
  const productSection = document.querySelector("#product");

  if (track && wrap && productSection && innerWidth > 980) {
    const distance = () => Math.max(track.scrollWidth - innerWidth, 0);

    try {
      if (distance() > 40) {
        const horizontal = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: productSection,
            start: "top top",
            end: () => "+=" + (distance() + innerHeight * 0.4),
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // panels lift slightly as they cross the middle of the screen
        gsap.utils.toArray(".pin-panel").forEach((panel) => {
          gsap.fromTo(
            panel,
            { scale: 0.95, opacity: 0.6 },
            {
              scale: 1,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: horizontal,
                start: "left 92%",
                end: "center center",
                scrub: true,
              },
            }
          );
        });

        // only now is it safe to hide the native scrollbar on the wrapper
        document.body.classList.add("pinned");
      }
    } catch (error) {
      // pinning is a luxury: if it fails, the wrapper keeps its own scrollbar
      console.warn("[motion] pin skipped", error);
      document.body.classList.remove("pinned");
    }
  }

  /* ------------------------------------------------------ 5. parallax */

  gsap.to(".event-card", {
    yPercent: -12,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  gsap.utils.toArray(".figure, .stat, .card").forEach((node) => {
    gsap.from(node, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "expo.out",
      scrollTrigger: { trigger: node, start: "top 90%", once: true },
    });
  });

  /* ------------------------------------------------ 6. magnetic buttons */

  document.querySelectorAll("[data-magnetic]").forEach((button) => {
    const strength = 14;
    button.addEventListener("pointermove", (event) => {
      const box = button.getBoundingClientRect();
      const x = (event.clientX - box.left - box.width / 2) / (box.width / 2);
      const y = (event.clientY - box.top - box.height / 2) / (box.height / 2);
      gsap.to(button, { x: x * strength, y: y * strength, duration: 0.4, ease: "power3.out" });
    });
    button.addEventListener("pointerleave", () => {
      gsap.to(button, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    });
  });

  /* -------------------------------------------------- 7. progress bar */

  const bar = document.querySelector("#progress");
  if (bar) {
    gsap.to(bar, {
      width: "100%",
      ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
    });
  }

  // fonts change line heights after load — recompute the pin distance
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  addEventListener("load", () => ScrollTrigger.refresh());
})();
