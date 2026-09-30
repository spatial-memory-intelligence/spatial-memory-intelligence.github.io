# Spatial Memory Intelligence (SMI)

**Endowing World Models with Understanding-Driven Long-Term Memory**

[Project website](https://spatial-memory-intelligence.github.io/) · [Code repository](https://github.com/xbyym/SMI)

SMI uses a multimodal large language model to coordinate four spatial-memory operations for long-video world models:

1. **Spatial clustering** — organize spatially related observations.
2. **Within-cluster sparsification** — reduce redundant memory.
3. **Action-aware retrieval** — select memories for the next action.
4. **Reliability-aware filtering** — prevent unreliable observations from entering memory.

## Release status

This repository hosts the project website and selected video demonstrations. The public code repository is maintained separately at [xbyym/SMI](https://github.com/xbyym/SMI); the research implementation is coming soon. Paper, data, and model-weight links will be added as resources become available.

## Video demonstrations

Twenty-one curated examples are displayed after the method overview: sixteen HY1.5 comparisons and five Wan2.2 comparisons. Each backbone has one continuous gallery, bringing consistency and stability examples together. Each comparison occupies one row, with Base and SMI side by side. Scene names and dataset case numbers are omitted from the visible interface.

Every group has its own synchronized Base/SMI player, with SMI on the right. Eleven groups additionally support FramePack, Deep Forcing, MoC, VMem, and MemFlow through the comparison selector. Starting a group pauses all other groups. Videos load near the viewport and can be expanded for closer inspection.

Selected groups include manually checked red-box highlights for clear spatial inconsistencies, such as replaced landmarks, missing objects, or changed layouts on revisiting. Whole-frame visual collapse is not highlighted. The user-selected kitchen example also marks a local mismatch in the microwave, cooking area, and countertop on the left from 18 to 24 seconds. Boxes follow timestamped coordinates and disappear outside the annotated interval. The Highlights button jumps to a highlighted moment; the global checkbox toggles overlays. Annotations belong to a specific method and are cleared when switching to an unannotated method. These selected highlights are illustrative, not exhaustive error labels or quantitative evaluation. Original video pixels are unchanged.

The seven methods are Base, FramePack, Deep Forcing, MoC, VMem, MemFlow, and SMI. These are selected qualitative examples, not the complete evaluation set. Full-length originals remain in the repository. The gallery includes explicitly labeled 0–30-second excerpts of hy15-61002 and hy15-62003, trimmed equally across all seven methods. The Wan2.2 example wan22-60024 retains its complete 60-second sequence. The latest HY1.5 pairs hy15-48, hy15-61001, and hy15-64003 use the supplied 30-, 45-, and 50-second sequences respectively, with equal lengths for Base and SMI. The 30- and 50-second clips are labeled as excerpts. The kitchen highlight follows the left-side appliance and counter area; the other two new pairs have no red-box tracks. Other comparison videos preserve their full duration. Hero mosaics are decorative excerpts rendered separately from the scientific comparisons. Default playback is 1×, with optional 2× and 4× controls applied equally to both videos.

## Cover and visual treatment

The cover presents sixteen retained gallery scenes in a single animated mosaic, using a 4×4 desktop composition and a 2×8 mobile composition. `assets/hero/sources.json` records the source videos and excerpt boundaries (0–8 seconds). `tools/build_hero_wall.py` rebuilds both compositions using ffmpeg. The sixteen scenes share one video decoder; desktop and mobile request only their matching layout. A canvas fits each source tile separately into an equal-sized destination cell, so wide screens cannot crop the top and bottom rows of the complete mosaic. Resizing updates the tile crops without stretching individual scenes. Drawing follows decoded video frames and stops when paused, offscreen, or in a background tab. An immediate image fallback, reduced-motion support, a pause control, and offscreen/background pausing keep the cover usable.

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
