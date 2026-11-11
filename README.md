# ETA Pro — landing page

The marketing page for **ETA Pro**, the vernacular education platform (CDS208 final
project). One static page, no framework, no build step: `index.html`, one stylesheet,
one script.

The product itself lives in
[`cds208-vernacular-web`](https://github.com/bhavyanpotla/cds208-vernacular-web)
(FastAPI + vanilla frontend) — this repo is only the front door.

![Hero](docs/hero.jpg)

## What's in it

| Section | What it does |
|---|---|
| Hero | Gradient headline, live event-stream card that cycles real event names, cursor glow |
| Marquee | The five languages in their own scripts, scrolling |
| Stats | Count-up figures that animate on scroll |
| Problem | Two cited statistics as oversized figures (UNESCO GEM 2025, ASER 2024) |
| Features | Six glass cards with pointer-tracked 3D tilt and a sheen that follows the cursor |
| Product | Tabbed screenshots of the running app in a browser chrome frame |
| Loop | The three-step loop with a connecting gradient line |
| Stack | The architecture argument: framework-free services, replaceable front end |
| CTA + footer | Links to the application repo, the Power BI model and the Streamlit build |

## Run it

No install, no build:

```bash
python -m http.server 5500     # then open http://127.0.0.1:5500
```

Or just open `index.html` in a browser.

## Design

Designed first in Figma —
[ETA Pro — Landing Page](https://www.figma.com/design/OBglATme0J94EF6MP62Uw4) — then
built by hand in CSS. The Figma file is the reference for spacing, type scale and the
section order; the page is the implementation, and it goes further than the frame
(real animations, real screenshots, responsive behaviour).

Palette and type are shared with the app so the two read as one product:

```
canvas #05060a   surface rgba(255,255,255,.045)   line rgba(255,255,255,.09)
ink    #f4f6ff   body    #c3c9dd                  muted #98a1ba
accent #7c5cff   accent2 #22d3ee                  ok #10b981   warn #f59e0b
type   Inter + Noto Sans Devanagari / Bengali / Tamil / Telugu
```

Contrast is AA at every size (ink 17:1, body 11:1, muted 7:1 on the canvas).

## Motion

Two layers, deliberately separated.

**`assets/js/main.js` — the baseline, zero dependencies.** Scroll reveal via
`IntersectionObserver` (staggered 70 ms), count-up figures, pointer-tracked 3D tilt
with a radial sheen, damped blob parallax, cursor glow, the cycling event stream.
This is what every visitor gets, and it is what still works if a CDN is blocked.

**`assets/js/motion.js` — the premium layer, GSAP + ScrollTrigger + Lenis.**
It bails out on the first line if the libraries did not load or the user prefers
reduced motion. When it does run it adds:

| Technique | Where |
|---|---|
| Inertial scrolling (Lenis) wired into ScrollTrigger's ticker | whole page |
| Masked headline reveal — the h1 rises out of a clipping edge | hero |
| Per-word reveal, staggered 45 ms | every `h2[data-split]` |
| Pinned horizontal gallery driven by vertical scroll | the product section |
| Layered parallax (hero card, figures, cards) | throughout |
| Magnetic CTAs — the button leans toward the cursor, snaps back on leave | primary buttons |
| Scroll progress bar | top of the viewport |

Three safety rules are baked in, because motion that breaks content is worse than no
motion:

1. **A watchdog.** If the animation ticker never advances — background tab, throttled
   rAF, a very slow device — the hero is forced to its final state after 2.6 s. Content
   always wins over choreography.
2. **The pin can fail without taking the gallery with it.** The native horizontal
   scrollbar on `.pin-wrap` is only removed *after* the ScrollTrigger pin is created
   successfully; if pinning throws, the wrapper keeps its own scrollbar and every panel
   stays reachable.
3. **`prefers-reduced-motion: reduce`** turns the whole layer off before it starts.

With JavaScript disabled the page is fully readable — the reveals are CSS-visible
without the `.js` class.

## Structure

```
index.html              the page
assets/css/style.css    the whole design system
assets/js/main.js       reveal, counters, tilt, parallax, stream, tabs
assets/img/*.jpg        product screenshots, captured from the running app
docs/hero.jpg           page screenshots for this README
docs/full.jpg
docs/mobile.jpg
```

## Deploy

Any static host. Netlify or Vercel: point at the repo, no build command, publish
directory `/`. GitHub Pages works too — the page is one HTML file with relative asset
paths.

## Known limits

- Screenshots are of the local build; the live demo URL is a placeholder until the
  API is deployed. Replace the two `Open the live demo` links with the real URL.
- Statistics are cited in the footer but not linked inline; add links if the page goes
  public.
- The Figma file and the CSS have already drifted slightly (the page is newer). Treat
  the page as the source of truth.
