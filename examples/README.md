# Architecture Flow Assets (by Rehan Akbar)

This folder contains the complete, production-grade cloud architecture example for **ArchFlow Studio**:

- `architecture.png`: Original 1200x800 system architecture diagram depicting a modern cloud backend:
  - **Client Applications** (External HTTPS traffic)
  - **API Gateway** (Ingress routing, auth, throttling)
  - **Order Service** (Core domain microservice & business logic)
  - **Redis Cache Cluster** (In-memory low-latency reads)
  - **PostgreSQL Database** (Durable ACID transactional persistence)
- `routes.json`: Route coordinates and motion configuration mapping the flow across all 4 system boundaries:
  - `client-to-gateway`: Ingress flow (`#00F0FF` Teal Cyan, 2-dot stream, 220 px/s)
  - `gateway-to-service`: Service ingress (`#CBA35C` Muted Gold, 2-dot stream, 240 px/s)
  - `service-to-cache`: Fast cache check (`#43E8BD` Mint Teal, 340 px/s)
  - `service-to-database`: Persistent disk write (`#90B5FF` Soft Blue, 160 px/s)
- `routes-preview.png`: Visual alignment preview showing measured path vectors and numbered nodes.
- `architecture-flow.gif`: Rendered 120-frame looping animated flow at 33 FPS with neon aura and particle motion.

## Reproducing the Animation

Using the Python CLI engine:

```powershell
python skills/archflow-studio/scripts/archflow.py render `
  --image examples/architecture.png `
  --config examples/routes.json `
  --output examples/architecture-flow.gif `
  --format gif `
  --force
```

Or open the **Web Studio** (`web-studio/index.html`) to interactively inspect, customize, and export this architecture directly in your browser.
