# Spatial Memory Intelligence (SMI)

**Endowing World Models with Understanding-Driven Long-Term Memory**

[Project website](https://spatial-memory-intelligence.github.io/) · [Code repository (private)](https://github.com/spatial-memory-intelligence/SMI)

SMI uses a multimodal large language model to coordinate four spatial-memory operations for long-video world models:

1. **Spatial clustering** — organize spatially related observations.
2. **Within-cluster sparsification** — reduce redundant memory.
3. **Action-aware retrieval** — select memories for the next action.
4. **Reliability-aware filtering** — prevent unreliable observations from entering memory.

## Release status

This repository hosts the project website and selected video demonstrations. The Code links point to the private SMI development repository and require repository access. Paper, data, and model-weight links will be added as resources become available.

## Video demonstrations

Twenty-six full-duration examples are displayed after the method overview, including all twelve HY1.5 Base/SMI cases in the main-paper and appendix source manifest. HY1.5 and Wan2.2 have separate sections, each divided into Spatial Consistency and Generation Stability. HY1.5 has ten consistency and eight stability comparisons; Wan2.2 has four consistency and four stability comparisons. Desktop shows two comparison groups per row; mobile shows one. Scene names and dataset case numbers are omitted from the visible interface. Paper examples retain their complete intermediate frames, including visible generation artifacts.

Every group has its own synchronized Base/SMI player, with SMI on the right. Fourteen groups additionally support FramePack, Deep Forcing, MoC, VMem, and MemFlow through the comparison selector. Starting a group pauses all other groups. Videos load near the viewport and can be expanded for closer inspection.

Selected groups include manually checked red-box highlights for visual inconsistencies. Boxes follow timestamped coordinates and disappear outside the annotated interval. The outline button jumps to a highlighted moment; the global checkbox toggles overlays. Annotations belong to a specific method and are cleared when switching to an unannotated method. These selected highlights are illustrative, not exhaustive error labels or quantitative evaluation. Original video pixels are unchanged.

The seven methods are Base, FramePack, Deep Forcing, MoC, VMem, MemFlow, and SMI. These are selected qualitative examples, not the complete evaluation set. Every published video preserves its source video stream, frame count, resolution, frame rate, and full duration. MP4 metadata is moved to the beginning for web playback; the images are not re-encoded. Default playback is 1×, with optional 2× and 4× controls applied equally to both videos.

## Website

The site is a static HTML/CSS/JavaScript page deployed with GitHub Pages from the root of `main`. Videos are stored in this same public repository and streamed from `raw.githubusercontent.com` with byte-range support. `_config.yml` excludes video files from the Pages build so that the large collection does not inflate the page deployment or require lossy re-encoding. Do not add `.nojekyll`, which would bypass that exclusion.

- `index.html`: project content and resource links
- `style.css`: responsive layout and styling
- `demo.js`: synchronized comparison player
- `demo-data.json`: scene labels and media paths
- `assets/`: paper figures, video streams, posters, and favicon

To preview locally, serve this directory with a static HTTP server that supports byte-range requests for video seeking.
