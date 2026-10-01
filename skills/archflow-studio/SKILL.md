---
name: archflow-studio
license: MIT
description: Use when animating arrows, connector lines, or paths in architecture diagrams, pipelines, and technical explainers with moving flow dots and exporting a GIF or MP4 video. Preserves all text, icons, and backgrounds while animating moving dots along measured routes. Developed by Rehan Akbar.
---

# ArchFlow Studio

Transform static architecture diagrams, CI/CD pipelines, workflows, and cloud infrastructure explainers into animated flow-dot motion. Developed by Rehan Akbar.

## Overview

ArchFlow Studio provides two workflows:
1. **Interactive Visual Web Studio** (`web-studio/index.html`): Point-and-click route drawing directly in your browser with real-time 60 FPS canvas preview and in-browser video export.
2. **Deterministic Python CLI Engine** (`skills/archflow-studio/scripts/archflow.py`): Constant-speed motion rendering, multi-dot streams, neon glow, and GIF/MP4 export.

## Step-by-Step CLI Workflow

### 1. Inspect and Map
- Check pixel dimensions of your PNG or JPEG diagram.
- Identify connector arrows, straight lines, corners, or curves.
- Create a route JSON configuration (see `references/config.md`) defining routes, colors, speeds, dot diameters, and multi-dot counts.

### 2. Preview Diagnostic Overlays
Before rendering a full animation, generate a diagnostic preview to confirm route alignments:

```bash
python skills/archflow-studio/scripts/archflow.py preview \
  --image diagram.png \
  --config routes.json \
  --output preview.png
```

Verify that:
- Every line runs through the visual centerline.
- Arrowhead directions match intended flow.
- Labels and node boxes are not obstructed.

### 3. Render Animation (GIF or MP4)

**Render Looping GIF:**
```bash
python skills/archflow-studio/scripts/archflow.py render \
  --image diagram.png \
  --config routes.json \
  --output diagram-flow.gif
```

**Render High-Definition MP4 Video:**
```bash
python skills/archflow-studio/scripts/archflow.py render \
  --image diagram.png \
  --config routes.json \
  --output diagram-flow.mp4
```

## Advanced Features
- **Multi-Dot Stream (`dot_count`)**: Put 2, 3, or more dots along the same path without duplicating route blocks.
- **Neon Glow (`glow: true`, `glow_radius: 6`)**: Add luminous outer glow on dark architecture diagrams.
- **Comet Trails (`trail_length: 3`)**: Fading particle trail behind each moving dot.
- **Bézier Curves (`bezier: true`)**: Pass 3 or 4 points to automatically sample smooth Bézier curves.
