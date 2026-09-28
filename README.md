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

Six selected, full-duration examples are split into Spatial Consistency and Generation Stability, after the method overview. Each collection has its own synchronized player. SMI remains on the right, and the comparison method can be changed on the left. Starting one player pauses the other.

| Category | Backbone | Case | Duration | Comparisons |
| --- | --- | --- | --- | --- |
| Spatial consistency | Wan2.2 | 91 | 15.81 s | All seven methods |
| Spatial consistency | HY1.5 | 5 | 45.21 s | Base and SMI |
| Spatial consistency | Wan2.2 | 33 | 15.81 s | All seven methods |
| Generation stability | HY1.5 | 11 | 65.21 s | All seven methods |
| Generation stability | HY1.5 | 108 | 65.21 s | Base and SMI |
| Generation stability | HY1.5 | 104 | 65.21 s | Base and SMI |

The seven methods are Base, FramePack, Deep Forcing, MoC, VMem, MemFlow, and SMI. These are selected qualitative examples, not the complete evaluation set. Every published video preserves its source video stream, frame count, resolution, frame rate, and full duration. MP4 metadata is moved to the beginning for web playback; the images are not re-encoded. Default playback is 1×, with optional 2× and 4× controls applied equally to both videos.

## Website

The site is a static HTML/CSS/JavaScript page deployed with GitHub Pages from the root of `main`.

- `index.html`: project content and resource links
- `style.css`: responsive layout and styling
- `demo.js`: synchronized comparison player
- `demo-data.json`: scene labels and media paths
- `assets/`: paper figures, video streams, posters, and favicon

To preview locally, serve this directory with a static HTTP server that supports byte-range requests for video seeking.
