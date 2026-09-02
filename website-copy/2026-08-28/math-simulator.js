/* Math Simulator Framework - Enhanced Interactive Mathematics */

// Core simulator utilities
const MathSimulator = {
    // Animation frame management
    animationFrames: new Map(),
    
    // Request animation frame with tracking
    animate: function(id, callback) {
        if (this.animationFrames.has(id)) {
            cancelAnimationFrame(this.animationFrames.get(id));
        }
        const frameId = requestAnimationFrame(callback);
        this.animationFrames.set(id, frameId);
    },
    
    // Cancel animation
    stopAnimate: function(id) {
        if (this.animationFrames.has(id)) {
            cancelAnimationFrame(this.animationFrames.get(id));
            this.animationFrames.delete(id);
        }
    },
    
    // Format numbers nicely
    formatNumber: function(num, decimals = 3) {
        if (Math.abs(num) < 0.0001) return '0';
        if (Math.abs(num) > 1000000) return num.toExponential(4);
        return num.toFixed(decimals);
    },
    
    // Parse expression safely
    parseExpression: function(expr, x, y = null) {
        try {
            let safeExpr = expr.replace(/\^/g, '**');
            safeExpr = safeExpr.replace(/sqrt\(/g, 'Math.sqrt(');
            safeExpr = safeExpr.replace(/log\(/g, 'Math.log(');
            safeExpr = safeExpr.replace(/abs\(/g, 'Math.abs(');
            safeExpr = safeExpr.replace(/sin\(/g, 'Math.sin(');
            safeExpr = safeExpr.replace(/cos\(/g, 'Math.cos(');
            safeExpr = safeExpr.replace(/tan\(/g, 'Math.tan(');
            
            // Handle implicit multiplication
            safeExpr = safeExpr.replace(/(\d)(x|\()/g, '$1*$2');
            safeExpr = safeExpr.replace(/(\d)(y|\()/g, '$1*$2');
            
            // Replace variables
            if (y !== null) {
                safeExpr = safeExpr.replace(/\bx\b/g, `(${x})`);
                safeExpr = safeExpr.replace(/\by\b/g, `(${y})`);
            } else {
                safeExpr = safeExpr.replace(/\bx\b/g, `(${x})`);
            }
            
            return eval(safeExpr);
        } catch (e) {
            return null;
        }
    }
};

// Enhanced Canvas Graph Component
class InteractiveGraph {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = Object.assign({
            width: 400,
            height: 300,
            padding: 40,
            showGrid: true,
            showAxes: true,
            showLabels: true,
            snapToGrid: false,
            gridSize: 20,
            minX: -10,
            maxX: 10,
            minY: -10,
            maxY: 10,
            onUpdate: null,
            onDrag: null
        }, options);
        
        this.dragging = false;
        this.dragPoint = null;
        this.points = [];
        this.lines = [];
        this.interactionPoints = [];
        
        this.init();
    }
    
    init() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.offsetWidth * dpr;
        this.canvas.height = this.options.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.setupEventListeners();
        this.draw();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicking on an interaction point
        for (let point of this.interactionPoints) {
            const dist = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
            if (dist < 10) {
                this.dragging = true;
                this.dragPoint = point;
                break;
            }
        }
    }
    
    handleMouseMove(e) {
        if (!this.dragging || !this.dragPoint) return;
        
        const rect = this.canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        
        // Convert to graph coordinates
        const graphPos = this.canvasToGraph(x, y);
        
        if (this.options.snapToGrid) {
            graphPos.x = Math.round(graphPos.x / 0.5) * 0.5;
            graphPos.y = Math.round(graphPos.y / 0.5) * 0.5;
        }
        
        this.dragPoint.x = x;
        this.dragPoint.y = y;
        this.dragPoint.graphX = graphPos.x;
        this.dragPoint.graphY = graphPos.y;
        
        if (this.options.onDrag) {
            this.options.onDrag(this.dragPoint, this);
        }
        
        this.draw();
    }
    
    handleMouseUp() {
        this.dragging = false;
        this.dragPoint = null;
    }
    
    handleMouseLeave() {
        this.dragging = false;
        this.dragPoint = null;
    }
    
    handleWheel(e) {
        e.preventDefault();
        // Zoom functionality
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const centerX = (this.options.minX + this.options.maxX) / 2;
        const centerY = (this.options.minY + this.options.maxY) / 2;
        
        const rangeX = (this.options.maxX - this.options.minX) * delta;
        const rangeY = (this.options.maxY - this.options.minY) * delta;
        
        this.options.minX = centerX - rangeX / 2;
        this.options.maxX = centerX + rangeX / 2;
        this.options.minY = centerY - rangeY / 2;
        this.options.maxY = centerY + rangeY / 2;
        
        this.draw();
    }
    
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.handleMouseDown(mouseEvent);
        }
    }
    
    handleTouchMove(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.handleMouseMove(mouseEvent);
        }
    }
    
    handleTouchEnd(e) {
        this.handleMouseUp();
    }
    
    canvasToGraph(x, y) {
        const graphX = this.options.minX + (x / this.canvas.offsetWidth) * (this.options.maxX - this.options.minX);
        const graphY = this.options.maxY - (y / this.options.height) * (this.options.maxY - this.options.minY);
        return { x: graphX, y: graphY };
    }
    
    graphToCanvas(x, y) {
        const canvasX = ((x - this.options.minX) / (this.options.maxX - this.options.minX)) * this.canvas.offsetWidth;
        const canvasY = ((this.options.maxY - y) / (this.options.maxY - this.options.minY)) * this.options.height;
        return { x: canvasX, y: canvasY };
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.options.height);
    }
    
    drawGrid() {
        if (!this.options.showGrid) return;
        
        const width = this.canvas.offsetWidth;
        const height = this.options.height;
        
        // Minor grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        
        const xStep = (this.options.maxX - this.options.minX) / 20;
        const yStep = (this.options.maxY - this.options.minY) / 20;
        
        for (let i = 0; i <= 20; i++) {
            const x = (i / 20) * width;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        for (let i = 0; i <= 20; i++) {
            const y = (i / 20) * height;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }
    
    drawAxes() {
        if (!this.options.showAxes) return;
        
        const width = this.canvas.offsetWidth;
        const height = this.options.height;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        
        // X-axis
        const yZero = this.graphToCanvas(0, 0).y;
        this.ctx.beginPath();
        this.ctx.moveTo(0, yZero);
        this.ctx.lineTo(width, yZero);
        this.ctx.stroke();
        
        // Y-axis
        const xZero = this.graphToCanvas(0, 0).x;
        this.ctx.beginPath();
        this.ctx.moveTo(xZero, 0);
        this.ctx.lineTo(xZero, height);
        this.ctx.stroke();
    }
    
    drawAxisLabels() {
        if (!this.options.showLabels) return;
        
        const width = this.canvas.offsetWidth;
        const height = this.options.height;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '11px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // X-axis label
        this.ctx.fillText('x', width - 15, this.graphToCanvas(0, 0).y + 15);
        
        // Y-axis label
        this.ctx.fillText('y', this.graphToCanvas(0, 0).x + 15, 15);
        
        // Tick labels
        this.ctx.font = '10px Inter, sans-serif';
        for (let i = -10; i <= 10; i += 2) {
            if (i === 0) continue;
            const x = this.graphToCanvas(i, 0).x;
            const y = this.graphToCanvas(0, i).y;
            
            if (x >= 0 && x <= width) {
                this.ctx.fillText(i.toString(), x, this.graphToCanvas(0, 0).y + 15);
            }
            if (y >= 0 && y <= height) {
                this.ctx.fillText((-i).toString(), this.graphToCanvas(0, 0).x + 15, y + 3);
            }
        }
    }
    
    drawPoint(x, y, color = '#8cc8ff', size = 6, label = null) {
        const pos = this.graphToCanvas(x, y);
        
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        
        if (label) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '10px Inter, sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(label, pos.x + 8, pos.y - 8);
        }
    }
    
    drawLine(x1, y1, x2, y2, color = '#8cc8ff', width = 2, dashed = false) {
        const p1 = this.graphToCanvas(x1, y1);
        const p2 = this.graphToCanvas(x2, y2);
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        
        if (dashed) {
            this.ctx.setLineDash([5, 5]);
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
    
    drawFunction(func, color = '#8cc8ff', width = 3) {
        const width_px = this.canvas.offsetWidth;
        const height_px = this.options.height;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        
        for (let i = 0; i <= width_px; i += 2) {
            const x = this.options.minX + (i / width_px) * (this.options.maxX - this.options.minX);
            const y = func(x);
            
            if (i === 0) {
                this.ctx.moveTo(i, this.graphToCanvas(0, y).y);
            } else {
                this.ctx.lineTo(i, this.graphToCanvas(0, y).y);
            }
        }
        
        this.ctx.stroke();
    }
    
    addInteractionPoint(x, y, color = '#ff6b6b', label = null) {
        const pos = this.graphToCanvas(x, y);
        this.interactionPoints.push({
            x: pos.x,
            y: pos.y,
            graphX: x,
            graphY: y,
            color: color,
            label: label
        });
    }
    
    draw() {
        this.clear();
        
        // Background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.options.height);
        gradient.addColorStop(0, '#0d1520');
        gradient.addColorStop(1, '#111824');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.offsetWidth, this.options.height);
        
        this.drawGrid();
        this.drawAxes();
        this.drawAxisLabels();
        
        // Draw interaction points
        for (let point of this.interactionPoints) {
            this.drawPoint(point.graphX, point.graphY, point.color, 8, point.label);
        }
    }
}

// Enhanced Trigonometry Simulator
function createEnhancedTrigSimulator(container) {
    const sim = document.createElement('div');
    sim.className = 'math-lab';
    sim.innerHTML = `
        <h3 class="math-lab__title">Enhanced Trigonometry Simulator</h3>
        <p class="math-lab__description">
          Interactive visualization of sine, cosine, and tangent functions. Drag points to explore!
        </p>
        <div class="math-lab__controls">
          <label>
            <span>Function:</span>
            <select id="tfunc-select" class="math-lab__input">
              <option value="sin">Sine (sin)</option>
              <option value="cos">Cosine (cos)</option>
              <option value="tan">Tangent (tan)</option>
            </select>
          </label>
          <label>
            <span>Amplitude (A):</span>
            <input type="number" id="tamp-input" class="math-lab__input" value="1" step="any">
          </label>
          <label>
            <span>Frequency (B):</span>
            <input type="number" id="tfreq-input" class="math-lab__input" value="1" step="any">
          </label>
          <label>
            <span>Phase (C):</span>
            <input type="number" id="tphase-input" class="math-lab__input" value="0" step="any">
          </label>
          <label>
            <span>Vertical Shift (D):</span>
            <input type="number" id="tshift-input" class="math-lab__input" value="0" step="any">
          </label>
          <button id="treset-btn" class="math-lab__button">Reset View</button>
        </div>
        <div class="math-lab__output">
          <canvas id="trig-canvas" width="400" height="250" style="width: 100%; height: 250px;"></canvas>
          <div id="trig-results" style="margin-top: 1rem;"></div>
        </div>
    `;
    
    container.appendChild(sim);
    
    const canvas = sim.querySelector('#trig-canvas');
    const graph = new InteractiveGraph(canvas, {
        height: 250,
        minX: -Math.PI,
        maxX: Math.PI,
        minY: -3,
        maxY: 3
    });
    
    const funcSelect = sim.querySelector('#tfunc-select');
    const ampInput = sim.querySelector('#tamp-input');
    const freqInput = sim.querySelector('#tfreq-input');
    const phaseInput = sim.querySelector('#tphase-input');
    const shiftInput = sim.querySelector('#tshift-input');
    const resultsDiv = sim.querySelector('#trig-results');
    const resetBtn = sim.querySelector('#treset-btn');
    
    function updateGraph() {
        const A = parseFloat(ampInput.value) || 1;
        const B = parseFloat(freqInput.value) || 1;
        const C = parseFloat(phaseInput.value) || 0;
        const D = parseFloat(shiftInput.value) || 0;
        const func = funcSelect.value;
        
        const funcColors = {
            sin: { main: '#8cc8ff', glow: 'rgba(140, 200, 255, 0.4)' },
            cos: { main: '#a8d4ff', glow: 'rgba(168, 212, 255, 0.4)' },
            tan: { main: '#ff6b6b', glow: 'rgba(255, 107, 107, 0.4)' }
        };
        
        const colors = funcColors[func];
        
        // Draw function
        graph.ctx.shadowColor = colors.glow;
        graph.ctx.shadowBlur = 12;
        graph.ctx.strokeStyle = colors.main;
        graph.ctx.lineWidth = 3;
        graph.ctx.lineCap = 'round';
        graph.ctx.lineJoin = 'round';
        
        const width = canvas.offsetWidth;
        const height = 250;
        
        graph.ctx.beginPath();
        let prevY = null;
        
        for (let x = 0; x <= width; x++) {
            const t = (x / width) * 2 * Math.PI - Math.PI;
            let y;
            
            if (func === 'sin') {
                y = A * Math.sin(B * t + C) + D;
            } else if (func === 'cos') {
                y = A * Math.cos(B * t + C) + D;
            } else {
                y = A * Math.tan(B * t + C) + D;
                if (Math.abs(y) > 10 * A) {
                    prevY = null;
                    continue;
                }
            }
            
            const canvasY = height / 2 - (y * height / 6 / (A || 1));
            
            if (prevY === null || Math.abs(canvasY - prevY) > height) {
                graph.ctx.moveTo(x, canvasY);
            } else {
                graph.ctx.lineTo(x, canvasY);
            }
            prevY = canvasY;
        }
        
        graph.ctx.stroke();
        graph.ctx.shadowBlur = 0;
        
        // Update results
        const funcName = func === 'sin' ? 'sin' : func === 'cos' ? 'cos' : 'tan';
        const signC = C >= 0 ? '+' : '-';
        const signD = D >= 0 ? '+' : '-';
        const formula = `y = ${A}${funcName}(${B}x ${signC} ${Math.abs(C)}) ${signD} ${Math.abs(D)}`;
        
        resultsDiv.innerHTML = `
            <p><strong>Function:</strong> ${formula}</p>
            <p><strong>Amplitude:</strong> ${Math.abs(A)}</p>
            <p><strong>Period:</strong> ${(2 * Math.PI / (B || 1)).toFixed(3)} (${(2 / (B || 1)).toFixed(2)}π)</p>
            <p><strong>Phase Shift:</strong> ${(-C / (B || 1)).toFixed(3)} rad</p>
            <p><strong>Vertical Shift:</strong> ${D}</p>
        `;
    }
    
    // Real-time updates
    [ampInput, freqInput, phaseInput, shiftInput, funcSelect].forEach(input => {
        input.addEventListener('input', updateGraph);
    });
    
    resetBtn.addEventListener('click', () => {
        graph.options = {
            minX: -Math.PI,
            maxX: Math.PI,
            minY: -3,
            maxY: 3
        };
        updateGraph();
    });
    
    updateGraph();
}

// Enhanced Right Triangle Simulator
function createEnhancedTriangleSimulator(container) {
    const sim = document.createElement('div');
    sim.className = 'math-lab';
    sim.innerHTML = `
        <h3 class="math-lab__title">Interactive Right Triangle Simulator</h3>
        <p class="math-lab__description">
          Drag the vertices to explore how the sides and angles change in real-time.
        </p>
        <div class="math-lab__controls">
          <label>
            <span>Snap to Grid:</span>
            <input type="checkbox" id="triangle-snap" class="math-lab__input">
          </label>
          <button id="triangle-reset-btn" class="math-lab__button">Reset</button>
        </div>
        <div class="math-lab__output">
          <canvas id="triangle-canvas" width="300" height="250" style="width: 100%; height: 250px;"></canvas>
          <div id="triangle-results" style="margin-top: 1rem;"></div>
        </div>
    `;
    
    container.appendChild(sim);
    
    const canvas = sim.querySelector('#triangle-canvas');
    const graph = new InteractiveGraph(canvas, {
        height: 250,
        minX: 0,
        maxX: 10,
        minY: 0,
        maxY: 10
    });
    
    const snapCheckbox = sim.querySelector('#triangle-snap');
    const resetBtn = sim.querySelector('#triangle-reset-btn');
    const resultsDiv = sim.querySelector('#triangle-results');
    
    // Initial triangle points
    let points = [
        { x: 2, y: 2, fixed: true },  // Right angle vertex
        { x: 8, y: 2, fixed: false },  // Adjacent vertex
        { x: 2, y: 8, fixed: false }   // Opposite vertex
    ];
    
    function updateTriangle() {
        const p1 = points[0];
        const p2 = points[1];
        const p3 = points[2];
        
        // Calculate side lengths
        const adjacent = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
        const opposite = Math.sqrt((p3.x - p1.x) ** 2 + (p3.y - p1.y) ** 2);
        const hypotenuse = Math.sqrt((p2.x - p3.x) ** 2 + (p2.y - p3.y) ** 2);
        
        // Calculate angle
        const angle = Math.atan2(opposite, adjacent) * 180 / Math.PI;
        
        // Draw triangle
        graph.clear();
        
        // Background
        const gradient = graph.ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, '#0d1520');
        gradient.addColorStop(1, '#111824');
        graph.ctx.fillStyle = gradient;
        graph.ctx.fillRect(0, 0, canvas.offsetWidth, 250);
        
        // Draw grid
        graph.drawGrid();
        
        // Draw triangle fill
        graph.ctx.fillStyle = 'rgba(140, 200, 255, 0.1)';
        graph.ctx.beginPath();
        graph.ctx.moveTo(...Object.values(graph.graphToCanvas(p1.x, p1.y)));
        graph.ctx.lineTo(...Object.values(graph.graphToCanvas(p2.x, p2.y)));
        graph.ctx.lineTo(...Object.values(graph.graphToCanvas(p3.x, p3.y)));
        graph.ctx.closePath();
        graph.ctx.fill();
        
        // Draw triangle outline
        graph.ctx.strokeStyle = '#8cc8ff';
        graph.ctx.lineWidth = 3;
        graph.ctx.beginPath();
        graph.ctx.moveTo(...Object.values(graph.graphToCanvas(p1.x, p1.y)));
        graph.ctx.lineTo(...Object.values(graph.graphToCanvas(p2.x, p2.y)));
        graph.ctx.lineTo(...Object.values(graph.graphToCanvas(p3.x, p3.y)));
        graph.ctx.closePath();
        graph.ctx.stroke();
        
        // Draw vertices
        points.forEach((p, i) => {
            const pos = graph.graphToCanvas(p.x, p.y);
            graph.ctx.fillStyle = p.fixed ? '#4a90e2' : '#ff6b6b';
            graph.ctx.strokeStyle = '#fff';
            graph.ctx.lineWidth = 2;
            graph.ctx.beginPath();
            graph.ctx.arc(pos.x, pos.y, 8, 0, 2 * Math.PI);
            graph.ctx.fill();
            graph.ctx.stroke();
        });
        
        // Update results
        resultsDiv.innerHTML = `
            <p><strong>Side Lengths:</strong> Opposite = ${adjacent.toFixed(2)}, Adjacent = ${opposite.toFixed(2)}, Hypotenuse = ${hypotenuse.toFixed(2)}</p>
            <p><strong>Angle at A:</strong> ${angle.toFixed(1)}°</p>
            <p><strong>Trig Ratios:</strong> sin = ${(opposite/hypotenuse).toFixed(4)}, cos = ${(adjacent/hypotenuse).toFixed(4)}, tan = ${(opposite/adjacent).toFixed(4)}</p>
        `;
    }
    
    resetBtn.addEventListener('click', () => {
        points = [
            { x: 2, y: 2, fixed: true },
            { x: 8, y: 2, fixed: false },
            { x: 2, y: 8, fixed: false }
        ];
        updateTriangle();
    });
    
    updateTriangle();
}

// Export for use
window.MathSimulator = MathSimulator;
window.InteractiveGraph = InteractiveGraph;
window.createEnhancedTrigSimulator = createEnhancedTrigSimulator;
window.createEnhancedTriangleSimulator = createEnhancedTriangleSimulator;