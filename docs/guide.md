# Practical Guide to Architecture Diagram Flow Animation

Transform any static system architecture, pipeline, or network diagram into an animated explainer with moving flow dots.

## 1. Visual Web Studio Workflow (Zero Setup)

The easiest and fastest way to animate your diagrams is using **ArchFlow Web Studio**:
1. Open `web-studio/index.html` in your browser.
2. Click **Upload Diagram** and select your PNG, JPEG, or SVG image (or explore the pre-loaded **Cloud Architecture**).
3. Click **Add Route** in the left sidebar.
4. Click along the connector line on your diagram to place the start, bends, and arrowhead endpoint.
5. In the right properties panel:
   - Pick your dot color (Teal Cyan, Muted Gold, Mint, Soft Blue).
   - Adjust speed and dot diameter.
   - Set **Multi-Dot Stream** (e.g. 2 or 3 dots on the same line).
   - Toggle **Neon Glow** and **Comet Trails**.
6. Watch the real-time 60 FPS canvas animation immediately!
7. Click **Export Video** to download a WebM video, or **Export JSON** to render with the CLI.

---

## 2. CLI Rendering Workflow

For batch rendering, high-resolution MP4s, or automated pipelines:

### Preview Diagnostic Overlays
```bash
python skills/archflow-studio/scripts/archflow.py preview \
  --image examples/architecture.png \
  --config examples/routes.json \
  --output output/preview.png
```

### Render Looping GIF
```bash
python skills/archflow-studio/scripts/archflow.py render \
  --image examples/architecture.png \
  --config examples/routes.json \
  --output output/architecture-flow.gif
```

### Render High-Definition MP4 Video
```bash
python skills/archflow-studio/scripts/archflow.py render \
  --image examples/architecture.png \
  --config examples/routes.json \
  --output output/architecture-flow.mp4
```
