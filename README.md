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

All of it is progressive and opt-out:

- **Scroll reveal** — `IntersectionObserver`, staggered by 70 ms, unobserved after firing.
- **Count-up** — figures animate once when they enter the viewport.
- **3D tilt** — pointer-tracked `rotateX/rotateY` plus a radial sheen on the feature cards.
- **Parallax** — background blobs drift with the cursor, damped.
- **Event stream** — cycles real event names every 2.6 s.
- **Tabs** — product screenshots swap with a fade.

With JavaScript disabled the page is fully readable. Under
`prefers-reduced-motion: reduce` every animation and transition is off.

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
