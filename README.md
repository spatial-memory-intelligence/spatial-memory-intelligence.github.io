# Spatial Memory Intelligence (SMI)

**Endowing World Models with Understanding-Driven Long-Term Memory**

[Project website](https://spatial-memory-intelligence.github.io/) · [Code repository](https://github.com/xbyym/SMI)

SMI uses a multimodal large language model to coordinate four spatial-memory operations for long-video world models:

1. **Spatial clustering** — organize spatially related observations.
2. **Within-cluster sparsification** — reduce redundant memory.
3. **Action-aware retrieval** — select memories for the next action.
4. **Reliability-aware filtering** — prevent unreliable observations from entering memory.

## Release status

This repository hosts the project website and selected video demonstrations. The code repository is maintained separately at [xbyym/SMI](https://github.com/xbyym/SMI) and is currently private. Paper, data, and model-weight links will be added as resources become available.

## Video demonstrations

Twenty-three curated examples are displayed after the method overview. HY1.5 and Wan2.2 have separate sections, each divided into Spatial Consistency and Generation Stability. HY1.5 has nine consistency and six stability comparisons; Wan2.2 has four consistency and four stability comparisons. Each comparison occupies one row, with Base and SMI side by side. Scene names and dataset case numbers are omitted from the visible interface.

Every group has its own synchronized Base/SMI player, with SMI on the right. 13 groups additionally support FramePack, Deep Forcing, MoC, VMem, and MemFlow through the comparison selector. Starting a group pauses all other groups. Videos load near the viewport and can be expanded for closer inspection.

Selected groups include manually checked red-box highlights for visual inconsistencies. Boxes follow timestamped coordinates and disappear outside the annotated interval. The Highlights button jumps to a highlighted moment; the global checkbox toggles overlays. Annotations belong to a specific method and are cleared when switching to an unannotated method. These selected highlights are illustrative, not exhaustive error labels or quantitative evaluation. Original video pixels are unchanged.

The seven methods are Base, FramePack, Deep Forcing, MoC, VMem, MemFlow, and SMI. These are selected qualitative examples, not the complete evaluation set. Full-length originals remain in the repository. The gallery includes an explicitly labeled 0–30-second excerpt of hy15-61002, trimmed equally across all seven methods. Other comparison videos preserve their full duration. Hero mosaics are decorative excerpts rendered separately from the scientific comparisons. Default playback is 1×, with optional 2× and 4× controls applied equally to both videos.

## Cover and visual treatment

The cover presents sixteen existing SMI sequences in a single animated mosaic, using a 4×4 desktop composition and a 2×8 mobile composition. `assets/hero/sources.json` records the source videos and excerpt boundaries (0–8 seconds). `tools/build_hero_wall.py` rebuilds both compositions using ffmpeg. The sixteen scenes share one video decoder; desktop and mobile request only their matching layout. An immediate image fallback, reduced-motion support, a pause control, and offscreen/background pausing keep the cover usable.

The gallery uses a dark cinematic background with pale green SMI labels. Paper figures stay on white, readable panels. Ordering, selected methods, synchronized controls, and red-box annotations are independent of the cover.

## Website

The site is a static HTML/CSS/JavaScript page deployed with GitHub Pages from the root of `main`. Videos are stored in this same public repository and streamed from `raw.githubusercontent.com` with byte-range support. `_config.yml` excludes video files from the Pages build so that the large collection does not inflate the page deployment or require lossy re-encoding. Do not add `.nojekyll`, which would bypass that exclusion.

- `index.html`: project content and resource links
- `style.css`: responsive layout and styling
- `cinema.css`: cinematic cover and gallery styling
- `hero.js`: responsive cover media and motion preferences
- `demo.js`: synchronized comparison player
- `demo-data.json`: scene labels and media paths
- `assets/`: paper figures, video streams, posters, and favicon

To preview locally, serve this directory with a static HTTP server that supports byte-range requests for video seeking.
