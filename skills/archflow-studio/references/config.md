# ArchFlow Studio - Configuration Reference

All coordinates map directly to full-resolution pixel space with `(0, 0)` at the top-left origin.

## Complete Configuration Example

```json
{
  "image_size": [1200, 800],
  "frames": 150,
  "delay_ms": 30,
  "defaults": {
    "speed": 250,
    "diameter": 16,
    "color": "#00F0FF",
    "dot_count": 1,
    "glow": true,
    "glow_radius": 6,
    "trail_length": 0
  },
  "routes": [
    {
      "id": "client-to-api",
      "points": [[100, 200], [450, 200], [450, 350], [800, 350]],
      "color": "#00F0FF",
      "dot_count": 2,
      "glow": true
    },
    {
      "id": "api-to-database",
      "points": [[800, 350], [1100, 350]],
      "color": "#43E8BD",
      "speed": 300,
      "trail_length": 2
    }
  ]
}
```

## Schema Specification

| Field | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `image_size` | `[int, int]` | Width and height matching source image | Required |
| `frames` | `int` | Number of animation frames (at least 2) | `150` |
| `delay_ms` | `int` | Delay per frame in ms (multiple of 10) | `30` (33.33 FPS) |
| `defaults.speed` | `float` | Pixels traversed per second | Proportional to width |
| `defaults.diameter` | `int` | Dot diameter in pixels | Proportional to width |
| `defaults.color` | `string` | Six-digit hex code (`#RRGGBB`) | `#00F0FF` |
| `defaults.dot_count`| `int` | Number of evenly spaced dots per route | `1` |
| `defaults.glow` | `bool` | Enable neon glow aura | `false` |
| `defaults.glow_radius` | `int` | Glow blur radius in pixels | `6` |
| `defaults.trail_length` | `int` | Number of trailing fade particles | `0` |
| `routes[].id` | `string` | Unique identifier for preview labeling | Required |
| `routes[].points` | `[[x, y], ...]` | Ordered sequence of coordinates | Required (min 2 points) |
| `routes[].phase` | `float` | Starting position offset fraction `[0.0, 1.0)` | `0.0` |
| `routes[].reverse` | `bool` | Reverse direction of travel | `false` |
| `routes[].dot_count` | `int` | Stream 1 to 20 dots on this specific route | Inherits default |
| `routes[].glow` | `bool` | Toggle neon glow on this specific route | Inherits default |
| `routes[].trail_length`| `int` | Fading comet tail particle count | Inherits default |
| `routes[].bezier` | `bool` | Automatically sample smooth Bézier curve | `false` |
