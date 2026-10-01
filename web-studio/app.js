/**
 * ArchFlow Studio - Interactive Visual Web Editor
 * Developed by Rehan Akbar
 */

class FlowStudio {
  constructor() {
    this.canvas = document.getElementById('main-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.viewport = document.getElementById('canvas-viewport');
    this.stage = document.getElementById('canvas-stage');

    // State
    this.image = new Image();
    this.imageLoaded = false;
    this.imageSize = [1200, 800];
    this.routes = [];
    this.selectedRouteIndex = -1;
    this.selectedPointIndex = -1;
    this.activeTool = 'select'; // 'select' | 'draw'
    this.drawingPoints = [];

    // Animation & Playback
    this.isPlaying = true;
    this.playbackTime = 0.0;
    this.speedMultiplier = 1.0;
    this.totalDuration = 4.5; // seconds
    this.lastFrameTime = performance.now();
    this.fps = 60;
    this.frameCount = 0;
    this.fpsTimer = performance.now();

    // Viewport zoom & pan
    this.zoom = 1.0;
    this.isDraggingPoint = false;

    // Display options
    this.showGuides = true;
    this.showLabels = true;
    this.showCrosshair = true;

    // Recording state
    this.isRecording = false;
    this.mediaRecorder = null;
    this.recordedChunks = [];

    this.initDOM();
    this.initEvents();
    this.loadArchitecture();
    this.startAnimationLoop();
  }

  initDOM() {
    this.btnPlayPause = document.getElementById('btn-play-pause');
    this.playIcon = document.getElementById('play-icon');
    this.pauseIcon = document.getElementById('pause-icon');
    this.timelineScrubber = document.getElementById('timeline-scrubber');
    this.timeCurrent = document.getElementById('time-current');
    this.timeTotal = document.getElementById('time-total');
    this.fpsCounter = document.getElementById('fps-counter');

    this.toolSelect = document.getElementById('tool-select');
    this.toolDraw = document.getElementById('tool-draw');
    this.drawingGuide = document.getElementById('drawing-instructions');
    this.btnFinishDrawing = document.getElementById('btn-finish-drawing');

    this.coordX = document.getElementById('coord-x');
    this.coordY = document.getElementById('coord-y');
    this.zoomLevel = document.getElementById('zoom-level');

    // Inspector elements
    this.inspectorEmpty = document.getElementById('empty-route-prompt');
    this.inspectorForm = document.getElementById('inspector-form');
    this.routeIdInput = document.getElementById('route-id-input');
    this.routeColorInput = document.getElementById('route-color-input');
    this.routeColorHex = document.getElementById('route-color-hex');
    this.routeSpeedInput = document.getElementById('route-speed-input');
    this.routeDiameterInput = document.getElementById('route-diameter-input');
    this.routeDotCountInput = document.getElementById('route-dot-count-input');
    this.routeTrailInput = document.getElementById('route-trail-input');
    this.chkRouteGlow = document.getElementById('chk-route-glow');
    this.valSpeed = document.getElementById('val-speed');
    this.valDiameter = document.getElementById('val-diameter');
    this.valDotCount = document.getElementById('val-dot-count');
    this.valTrail = document.getElementById('val-trail');

    this.routesContainer = document.getElementById('routes-container');
    this.routeCountBadge = document.getElementById('route-count');
  }

  initEvents() {
    // Mode toggles
    this.toolSelect.addEventListener('click', () => this.setTool('select'));
    this.toolDraw.addEventListener('click', () => this.setTool('draw'));
    this.btnFinishDrawing.addEventListener('click', () => this.finishCurrentDrawing());

    // Playback
    this.btnPlayPause.addEventListener('click', () => this.togglePlayback());
    this.timelineScrubber.addEventListener('input', (e) => {
      this.playbackTime = (parseFloat(e.target.value) / 1000) * this.totalDuration;
      this.updateTimelineUI();
    });

    // Speed multiplier buttons
    document.querySelectorAll('.speed-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.speed-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.speedMultiplier = parseFloat(btn.dataset.speed);
      });
    });

    // Zoom buttons
    document.getElementById('btn-zoom-in').addEventListener('click', () => this.setZoom(this.zoom + 0.1));
    document.getElementById('btn-zoom-out').addEventListener('click', () => this.setZoom(this.zoom - 0.1));
    document.getElementById('btn-zoom-reset').addEventListener('click', () => this.fitToScreen());

    // Display checkboxes
    document.getElementById('chk-show-guides').addEventListener('change', (e) => (this.showGuides = e.target.checked));
    document.getElementById('chk-show-labels').addEventListener('change', (e) => (this.showLabels = e.target.checked));
    document.getElementById('chk-show-crosshair').addEventListener('change', (e) => (this.showCrosshair = e.target.checked));

    // File loading & export
    const btnArch = document.getElementById('btn-load-architecture');
    if (btnArch) btnArch.addEventListener('click', () => this.loadArchitecture());
    document.getElementById('input-diagram-file').addEventListener('change', (e) => this.handleImageUpload(e));
    document.getElementById('btn-import-json').addEventListener('click', () => document.getElementById('input-json-file').click());
    document.getElementById('input-json-file').addEventListener('change', (e) => this.handleJSONImport(e));
    document.getElementById('btn-export-json').addEventListener('click', () => this.exportJSON());
    document.getElementById('btn-record-video').addEventListener('click', () => this.toggleVideoRecording());

    // Inspector changes
    this.routeIdInput.addEventListener('input', (e) => {
      if (this.selectedRouteIndex >= 0) {
        this.routes[this.selectedRouteIndex].id = e.target.value;
        this.renderRoutesList();
      }
    });

    this.routeColorInput.addEventListener('input', (e) => {
      if (this.selectedRouteIndex >= 0) {
        this.routes[this.selectedRouteIndex].color = e.target.value;
        this.routeColorHex.innerText = e.target.value.toUpperCase();
        this.renderRoutesList();
      }
    });

    document.querySelectorAll('.preset-dot').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.selectedRouteIndex >= 0) {
          const color = btn.dataset.color;
          this.routes[this.selectedRouteIndex].color = color;
          this.routeColorInput.value = color;
          this.routeColorHex.innerText = color.toUpperCase();
          this.renderRoutesList();
        }
      });
    });

    this.routeSpeedInput.addEventListener('input', (e) => {
      if (this.selectedRouteIndex >= 0) {
        this.routes[this.selectedRouteIndex].speed = parseFloat(e.target.value);
        this.valSpeed.innerText = e.target.value;
      }
    });

    this.routeDiameterInput.addEventListener('input', (e) => {
      if (this.selectedRouteIndex >= 0) {
        this.routes[this.selectedRouteIndex].diameter = parseInt(e.target.value);
        this.valDiameter.innerText = e.target.value;
      }
    });

    this.routeDotCountInput.addEventListener('input', (e) => {
      if (this.selectedRouteIndex >= 0) {
        this.routes[this.selectedRouteIndex].dot_count = parseInt(e.target.value);
        this.valDotCount.innerText = e.target.value;
      }
    });

    this.routeTrailInput.addEventListener('input', (e) => {
      if (this.selectedRouteIndex >= 0) {
        this.routes[this.selectedRouteIndex].trail_length = parseInt(e.target.value);
        this.valTrail.innerText = e.target.value;
      }
    });

    this.chkRouteGlow.addEventListener('change', (e) => {
      if (this.selectedRouteIndex >= 0) {
        this.routes[this.selectedRouteIndex].glow = e.target.checked;
      }
    });

    document.getElementById('btn-reverse-route').addEventListener('click', () => {
      if (this.selectedRouteIndex >= 0) {
        const route = this.routes[this.selectedRouteIndex];
        route.points.reverse();
        this.updateRouteMetrics(route);
      }
    });

    document.getElementById('btn-delete-route').addEventListener('click', () => {
      if (this.selectedRouteIndex >= 0) {
        this.routes.splice(this.selectedRouteIndex, 1);
        this.selectRoute(-1);
        this.renderRoutesList();
      }
    });

    // Canvas Mouse & Interaction
    this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
    this.canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
    window.addEventListener('mouseup', () => (this.isDraggingPoint = false));
    this.canvas.addEventListener('dblclick', () => {
      if (this.activeTool === 'draw') {
        this.finishCurrentDrawing();
      }
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === ' ') {
        e.preventDefault();
        this.togglePlayback();
      } else if (e.key === 'v' || e.key === 'V') {
        this.setTool('select');
      } else if (e.key === 'p' || e.key === 'P') {
        this.setTool('draw');
      } else if (e.key === 'Enter' && this.activeTool === 'draw') {
        this.finishCurrentDrawing();
      } else if (e.key === 'Escape' && this.activeTool === 'draw') {
        this.drawingPoints = [];
        this.setTool('select');
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedRouteIndex >= 0) {
        this.routes.splice(this.selectedRouteIndex, 1);
        this.selectRoute(-1);
        this.renderRoutesList();
      }
    });
  }

  setTool(tool) {
    this.activeTool = tool;
    this.toolSelect.classList.toggle('active', tool === 'select');
    this.toolDraw.classList.toggle('active', tool === 'draw');
    this.drawingGuide.style.display = tool === 'draw' ? 'block' : 'none';
    if (tool === 'select') {
      this.drawingPoints = [];
    }
  }

  setZoom(zoom) {
    this.zoom = Math.max(0.2, Math.min(3.0, zoom));
    this.zoomLevel.innerText = `${Math.round(this.zoom * 100)}%`;
    this.applyCanvasTransform();
  }

  fitToScreen() {
    const stageWidth = this.stage.clientWidth - 40;
    const stageHeight = this.stage.clientHeight - 40;
    const scaleX = stageWidth / this.imageSize[0];
    const scaleY = stageHeight / this.imageSize[1];
    this.setZoom(Math.min(scaleX, scaleY, 1.0));
  }

  applyCanvasTransform() {
    this.canvas.style.width = `${this.imageSize[0] * this.zoom}px`;
    this.canvas.style.height = `${this.imageSize[1] * this.zoom}px`;
  }

  togglePlayback() {
    this.isPlaying = !this.isPlaying;
    this.playIcon.style.display = this.isPlaying ? 'none' : 'block';
    this.pauseIcon.style.display = this.isPlaying ? 'block' : 'none';
  }

  updateTimelineUI() {
    this.timeCurrent.innerText = `${this.playbackTime.toFixed(1)}s`;
    this.timelineScrubber.value = (this.playbackTime / this.totalDuration) * 1000;
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.imageSize[0] / rect.width;
    const scaleY = this.imageSize[1] / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  }

  handleCanvasMouseMove(e) {
    const { x, y } = this.getCanvasCoords(e);
    this.coordX.innerText = x;
    this.coordY.innerText = y;

    if (this.isDraggingPoint && this.selectedRouteIndex >= 0 && this.selectedPointIndex >= 0) {
      const route = this.routes[this.selectedRouteIndex];
      route.points[this.selectedPointIndex] = [x, y];
      this.updateRouteMetrics(route);
    }
  }

  handleCanvasMouseDown(e) {
    const { x, y } = this.getCanvasCoords(e);

    if (this.activeTool === 'draw') {
      this.drawingPoints.push([x, y]);
    } else {
      // Check if clicking an existing point on selected route
      if (this.selectedRouteIndex >= 0) {
        const route = this.routes[this.selectedRouteIndex];
        for (let i = 0; i < route.points.length; i++) {
          const pt = route.points[i];
          if (Math.hypot(pt[0] - x, pt[1] - y) <= 12) {
            this.selectedPointIndex = i;
            this.isDraggingPoint = true;
            return;
          }
        }
      }

      // Check if clicking near any route line
      for (let r = 0; r < this.routes.length; r++) {
        const route = this.routes[r];
        for (let i = 0; i < route.points.length - 1; i++) {
          const p1 = route.points[i];
          const p2 = route.points[i + 1];
          if (this.distToSegment([x, y], p1, p2) <= 14) {
            this.selectRoute(r);
            return;
          }
        }
      }

      // Clicked on empty canvas -> deselect
      this.selectRoute(-1);
    }
  }

  distToSegment(p, v, w) {
    const l2 = (w[0] - v[0]) ** 2 + (w[1] - v[1]) ** 2;
    if (l2 === 0) return Math.hypot(p[0] - v[0], p[1] - v[1]);
    let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p[0] - (v[0] + t * (w[0] - v[0])), p[1] - (v[1] + t * (w[1] - v[1])));
  }

  finishCurrentDrawing() {
    if (this.drawingPoints.length >= 2) {
      const newRoute = {
        id: `route-${this.routes.length + 1}`,
        points: [...this.drawingPoints],
        color: '#00F0FF',
        speed: 250,
        diameter: 16,
        phase: 0.0,
        dot_count: 1,
        trail_length: 0,
        glow: true,
      };
      this.updateRouteMetrics(newRoute);
      this.routes.push(newRoute);
      this.selectRoute(this.routes.length - 1);
      this.renderRoutesList();
    }
    this.drawingPoints = [];
    this.setTool('select');
  }

  selectRoute(index) {
    this.selectedRouteIndex = index;
    this.selectedPointIndex = -1;

    if (index >= 0) {
      const route = this.routes[index];
      this.inspectorEmpty.style.display = 'none';
      this.inspectorForm.style.display = 'flex';

      this.routeIdInput.value = route.id;
      this.routeColorInput.value = route.color;
      this.routeColorHex.innerText = route.color.toUpperCase();

      this.routeSpeedInput.value = route.speed;
      this.valSpeed.innerText = Math.round(route.speed);

      this.routeDiameterInput.value = route.diameter;
      this.valDiameter.innerText = route.diameter;

      this.routeDotCountInput.value = route.dot_count || 1;
      this.valDotCount.innerText = route.dot_count || 1;

      this.routeTrailInput.value = route.trail_length || 0;
      this.valTrail.innerText = route.trail_length || 0;

      this.chkRouteGlow.checked = !!route.glow;
    } else {
      this.inspectorEmpty.style.display = 'flex';
      this.inspectorForm.style.display = 'none';
    }

    this.renderRoutesList();
  }

  renderRoutesList() {
    this.routesContainer.innerHTML = '';
    this.routeCountBadge.innerText = `${this.routes.length} route${this.routes.length === 1 ? '' : 's'}`;

    this.routes.forEach((route, idx) => {
      const item = document.createElement('div');
      item.className = `route-item ${idx === this.selectedRouteIndex ? 'selected' : ''}`;
      item.innerHTML = `
        <div class="route-item-left">
          <div class="route-color-pill" style="background:${route.color}"></div>
          <span class="route-item-title">${route.id}</span>
        </div>
        <span class="route-item-meta">${Math.round(route.totalLength || 0)}px</span>
      `;
      item.addEventListener('click', () => this.selectRoute(idx));
      this.routesContainer.appendChild(item);
    });
  }

  updateRouteMetrics(route) {
    const cumulative = [0.0];
    for (let i = 0; i < route.points.length - 1; i++) {
      const start = route.points[i];
      const end = route.points[i + 1];
      const dist = Math.hypot(end[0] - start[0], end[1] - start[1]);
      cumulative.push(cumulative[cumulative.length - 1] + dist);
    }
    route.cumulative = cumulative;
    route.totalLength = cumulative[cumulative.length - 1];
  }

  positionAt(route, t, phaseOffset = 0.0) {
    const length = route.totalLength;
    if (!length || length <= 0) return route.points[0];

    const effectivePhase = ((route.phase || 0.0) + phaseOffset) % 1.0;
    const distance = (effectivePhase * length + route.speed * t) % length;

    let segment = 0;
    for (let i = 0; i < route.cumulative.length - 1; i++) {
      if (route.cumulative[i + 1] >= distance) {
        segment = i;
        break;
      }
    }

    const segStart = route.cumulative[segment];
    const segLen = route.cumulative[segment + 1] - segStart;
    const fraction = segLen > 0 ? (distance - segStart) / segLen : 0;
    const p1 = route.points[segment];
    const p2 = route.points[segment + 1];

    return [p1[0] + (p2[0] - p1[0]) * fraction, p1[1] + (p2[1] - p1[1]) * fraction];
  }

  // Animation Loop (60 FPS)
  startAnimationLoop() {
    const loop = (timestamp) => {
      const dt = (timestamp - this.lastFrameTime) / 1000;
      this.lastFrameTime = timestamp;

      // Update FPS counter
      this.frameCount++;
      if (timestamp - this.fpsTimer >= 1000) {
        this.fpsCounter.innerText = this.frameCount;
        this.frameCount = 0;
        this.fpsTimer = timestamp;
      }

      if (this.isPlaying) {
        this.playbackTime = (this.playbackTime + dt * this.speedMultiplier) % this.totalDuration;
        this.updateTimelineUI();
      }

      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw base diagram image
    if (this.imageLoaded) {
      this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.fillStyle = '#0F1B30';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 2. Draw static route connector guides and labels
    if (this.showGuides) {
      this.routes.forEach((route, idx) => {
        const isSelected = idx === this.selectedRouteIndex;
        this.ctx.lineWidth = isSelected ? 3 : 2;
        this.ctx.strokeStyle = route.color;
        this.ctx.globalAlpha = isSelected ? 0.9 : 0.45;

        // Path line
        this.ctx.beginPath();
        route.points.forEach((pt, i) => {
          if (i === 0) this.ctx.moveTo(pt[0], pt[1]);
          else this.ctx.lineTo(pt[0], pt[1]);
        });
        this.ctx.stroke();

        // Arrowhead at endpoint
        if (route.points.length >= 2) {
          const end = route.points[route.points.length - 1];
          const prev = route.points[route.points.length - 2];
          this.drawArrowhead(prev, end, route.color);
        }

        // Control points (handles)
        this.ctx.globalAlpha = 0.8;
        route.points.forEach((pt, pIdx) => {
          this.ctx.fillStyle = isSelected && pIdx === this.selectedPointIndex ? '#FFF' : route.color;
          this.ctx.beginPath();
          this.ctx.arc(pt[0], pt[1], isSelected ? 5 : 3.5, 0, Math.PI * 2);
          this.ctx.fill();
        });

        // Route Label
        if (this.showLabels && route.points.length > 0) {
          const start = route.points[0];
          this.ctx.font = '600 12px "JetBrains Mono", monospace';
          this.ctx.fillStyle = '#FFF';
          this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
          this.ctx.shadowBlur = 4;
          this.ctx.fillText(route.id, start[0] + 8, start[1] + 4);
          this.ctx.shadowBlur = 0;
        }

        this.ctx.globalAlpha = 1.0;
      });
    }

    // 3. Draw active drawing polyline (in Draw Mode)
    if (this.activeTool === 'draw' && this.drawingPoints.length > 0) {
      this.ctx.lineWidth = 2.5;
      this.ctx.strokeStyle = '#00F0FF';
      this.ctx.setLineDash([6, 4]);
      this.ctx.beginPath();
      this.drawingPoints.forEach((pt, i) => {
        if (i === 0) this.ctx.moveTo(pt[0], pt[1]);
        else this.ctx.lineTo(pt[0], pt[1]);
      });
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      this.drawingPoints.forEach((pt) => {
        this.ctx.fillStyle = '#00F0FF';
        this.ctx.beginPath();
        this.ctx.arc(pt[0], pt[1], 4.5, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }

    // 4. Draw moving flow-dots with glow and trails
    this.routes.forEach((route) => {
      const dotCount = route.dot_count || 1;
      const trail = route.trail_length || 0;

      for (let dotIdx = 0; dotIdx < dotCount; dotIdx++) {
        const phaseOffset = dotIdx / dotCount;
        const [x, y] = this.positionAt(route, this.playbackTime, phaseOffset);

        // Fading comet trail particles
        if (trail > 0) {
          for (let step = 1; step <= trail; step++) {
            const trailTime = this.playbackTime - (step * 0.025);
            const [tx, ty] = this.positionAt(route, trailTime, phaseOffset);
            const alpha = 0.5 * (1.0 - step / (trail + 1));
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = route.color;
            this.ctx.beginPath();
            this.ctx.arc(tx, ty, route.diameter * 0.35, 0, Math.PI * 2);
            this.ctx.fill();
          }
          this.ctx.globalAlpha = 1.0;
        }

        // Glow halo
        if (route.glow) {
          this.ctx.shadowColor = route.color;
          this.ctx.shadowBlur = route.diameter * 1.2;
        }

        // Dot body
        this.ctx.fillStyle = route.color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, route.diameter / 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner highlight for 3D sphere look
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.globalAlpha = 0.45;
        this.ctx.beginPath();
        this.ctx.arc(x - route.diameter * 0.12, y - route.diameter * 0.12, route.diameter * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;
      }
    });
  }

  drawArrowhead(from, to, color) {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.hypot(dx, dy);
    if (len <= 0) return;
    const ux = dx / len;
    const uy = dy / len;
    const headLen = Math.min(14, len * 0.4);
    const wing = headLen * 0.55;

    const left = [to[0] - ux * headLen + uy * wing, to[1] - uy * headLen - ux * wing];
    const right = [to[0] - ux * headLen - uy * wing, to[1] - uy * headLen + ux * wing];

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(to[0], to[1]);
    this.ctx.lineTo(left[0], left[1]);
    this.ctx.lineTo(right[0], right[1]);
    this.ctx.closePath();
    this.ctx.fill();
  }

  // Architecture Diagram Loader (Rehan Akbar)
  loadArchitecture() {
    this.image.onload = () => {
      this.imageLoaded = true;
      this.imageSize = [this.image.naturalWidth, this.image.naturalHeight];
      this.canvas.width = this.imageSize[0];
      this.canvas.height = this.imageSize[1];
      this.fitToScreen();
    };
    this.image.src = '../examples/architecture.png';

    fetch('../examples/routes.json')
      .then((res) => res.json())
      .then((data) => {
        this.routes = data.routes || [];
        this.routes.forEach((r) => this.updateRouteMetrics(r));
        this.selectRoute(0);
        this.renderRoutesList();
      })
      .catch(() => {
        this.routes = [
          { id: 'client-to-gateway', points: [[230, 400], [330, 400]], color: '#00F0FF', speed: 220, diameter: 16, dot_count: 2, glow: true },
          { id: 'gateway-to-service', points: [[510, 400], [610, 400]], color: '#CBA35C', speed: 240, diameter: 16, dot_count: 2, glow: true },
          { id: 'service-to-cache', points: [[800, 380], [860, 380], [860, 270], [910, 270]], color: '#43E8BD', speed: 340, diameter: 14, dot_count: 1, glow: true },
          { id: 'service-to-database', points: [[800, 420], [860, 420], [860, 530], [910, 530]], color: '#90B5FF', speed: 160, diameter: 16, dot_count: 1, glow: true }
        ];
        this.routes.forEach((r) => this.updateRouteMetrics(r));
        this.selectRoute(0);
        this.renderRoutesList();
      });
  }

  handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      this.image.onload = () => {
        this.imageLoaded = true;
        this.imageSize = [this.image.naturalWidth, this.image.naturalHeight];
        this.canvas.width = this.imageSize[0];
        this.canvas.height = this.imageSize[1];
        this.fitToScreen();
      };
      this.image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  handleJSONImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.routes && Array.isArray(data.routes)) {
          this.routes = data.routes;
          this.routes.forEach((r) => this.updateRouteMetrics(r));
          this.selectRoute(this.routes.length > 0 ? 0 : -1);
          this.renderRoutesList();
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  }

  exportJSON() {
    const cleanRoutes = this.routes.map((r) => ({
      id: r.id,
      points: r.points,
      color: r.color,
      speed: r.speed,
      diameter: r.diameter,
      phase: r.phase || 0.0,
      dot_count: r.dot_count || 1,
      glow: !!r.glow,
      trail_length: r.trail_length || 0,
    }));

    const config = {
      image_size: this.imageSize,
      frames: 150,
      delay_ms: 30,
      defaults: {
        speed: 250,
        diameter: 16,
        color: '#00F0FF',
      },
      routes: cleanRoutes,
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'routes.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Browser-native video recorder (WebM/MP4) - zero FFmpeg needed!
  toggleVideoRecording() {
    const recordBtnText = document.getElementById('record-btn-text');

    if (this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      recordBtnText.innerText = 'Export Video';
      return;
    }

    try {
      const stream = this.canvas.captureStream(60);
      const options = { mimeType: 'video/webm; codecs=vp9' };
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'archflow-animation.webm';
        a.click();
        URL.revokeObjectURL(url);
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      recordBtnText.innerText = 'Stop & Save';

      // Automatically stop after 1 full clip loop (4.5s)
      setTimeout(() => {
        if (this.isRecording) {
          this.toggleVideoRecording();
        }
      }, this.totalDuration * 1000);
    } catch (err) {
      alert('MediaRecorder is not supported in this browser. Use the Python CLI for GIF/MP4 export.');
    }
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.studio = new FlowStudio();
});
