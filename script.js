const SITE_VERSION = "1.0";

function initSiteFooter() {
    document.querySelectorAll("[data-site-version]").forEach(function (el) {
        el.textContent = "v" + SITE_VERSION;
        el.setAttribute("title", "Site version " + SITE_VERSION);
        el.setAttribute("aria-label", "Site version " + SITE_VERSION);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll("nav a");

    initSiteFooter();

    navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href === currentPath || (href === "index.html" && currentPath === "")) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        } else {
            link.classList.remove("active");
            link.removeAttribute("aria-current");
        }
    });
});

// Experimental Mode Toggle
function initExperimentalToggle() {
    const toggle = document.createElement("button");
    toggle.className = "experimental-toggle";
    toggle.textContent = "Experimental Mode";
    toggle.setAttribute("aria-pressed", "false");

    // Restore persisted state on page load
    if (localStorage.getItem("experimental-mode") === "enabled") {
        document.body.classList.add("experimental-mode");
        document.documentElement.classList.add("experimental-mode");
        toggle.setAttribute("aria-pressed", "true");
        toggle.textContent = "Standard Mode";
    }

    toggle.addEventListener("click", function () {
        const isEnabled = document.body.classList.toggle("experimental-mode");
        // Also toggle on <html> so rem-based font sizes (relative to the
        // root element) scale up site-wide, not just properties on <body>.
        document.documentElement.classList.toggle("experimental-mode", isEnabled);
        this.setAttribute("aria-pressed", isEnabled);
        this.textContent = isEnabled ? "Standard Mode" : "Experimental Mode";
        // Persist the preference across page refreshes
        localStorage.setItem("experimental-mode", isEnabled ? "enabled" : "disabled");
    });

    document.body.appendChild(toggle);
}

// Background equations rendered with MathJax
// Two vertical columns of mathematical theorems on left and right edges
function initMathBackground() {
    if (document.body.classList.contains('no-math-background')) {
        return;
    }
    // Theorems from Algebraic Number Theory, Commutative Algebra, and Arithmetic Geometry
    var bgEquations = [
        // Algebraic Number Theory
        { field: "Algebraic Number Theory", name: "Chebotarev Density Theorem", latex: "\\Pr(\\operatorname{Frob}_p \\in C) = \\frac{|C|}{|G|}" },
        { field: "Algebraic Number Theory", name: "Dedekind's Factorization Theorem", latex: "\\mathfrak{a} = \\mathfrak{p}_1^{e_1} \\cdots \\mathfrak{p}_r^{e_r}" },
        { field: "Algebraic Number Theory", name: "Chinese Remainder Theorem", latex: "\\mathcal{O}_K / \\mathfrak{a} \\cong \\prod_{i=1}^r \\mathcal{O}_K / \\mathfrak{p}_i^{e_i}" },
        { field: "Algebraic Number Theory", name: "Hilbert's Theorem 90", latex: "H^1(G, L^{\\times}) = 0 \\text{ for Galois extensions}" },
        { field: "Algebraic Number Theory", name: "Class Number Formula", latex: "\\lim_{s \\to 1} (s-1)\\zeta_K(s) = \\frac{2^{r_1}(2\\pi)^{r_2} h_K R_K}{w_K \\sqrt{|d_K|}}" },
        { field: "Algebraic Number Theory", name: "Minkowski Bound", latex: "N(\\mathfrak{a}) \\leq \\left(\\frac{4}{\\pi}\\right)^{r_2} \\frac{n!}{n^n} \\sqrt{|d_K|}" },
        { field: "Algebraic Number Theory", name: "Artin Reciprocity", latex: "\\theta_{L/K} : I_K \\to \\operatorname{Gal}(L/K)^{\\text{ab}}" },
        { field: "Algebraic Number Theory", name: "Stark–Heegner Theorem", latex: "\\mathbb{Q}(\\sqrt{-d}) \\text{ has class number } 1 \\iff d \\in \\{1,2,3,7,11,19,43,67,163\\}" },
        
        // Commutative Algebra
        { field: "Commutative Algebra", name: "Hilbert's Nullstellensatz", latex: "\\sqrt{I} = I(V(I)) \\text{ and } I \\subset \\mathbb{C}[x_1,\\ldots,x_n]" },
        { field: "Commutative Algebra", name: "Nakayama's Lemma", latex: "IM = M \\implies (1 + x)M = 0 \\text{ for some } x \\in I" },
        { field: "Commutative Algebra", name: "Lasker–Noether Theorem", latex: "I = \\bigcap_{i=1}^n \\mathfrak{q}_i \\text{ with } \\mathfrak{q}_i \\text{ primary}" },
        { field: "Commutative Algebra", name: "Krull's Principal Ideal Theorem", latex: "\\operatorname{ht}(P) = 1 \\text{ for } P \\text{ minimal over principal ideal}" },
        { field: "Commutative Algebra", name: "Noether Normalization", latex: "R \\text{ is integral over } S \\cong K[x_1, \\dots, x_d]" },
        { field: "Commutative Algebra", name: "Going-Up Theorem", latex: "\\mathfrak{p} \\subset R \\implies \\exists \\, \\mathfrak{q} \\subset S \\text{ with } \\mathfrak{q} \\cap R = \\mathfrak{p}" },
        { field: "Commutative Algebra", name: "Primary Decomposition", latex: "I = \\bigcap_{i=1}^{n} \\mathfrak{q}_i \\quad \\text{where each } \\mathfrak{q}_i \\text{ is primary}" },
        
        // Arithmetic Geometry
        { field: "Arithmetic Geometry", name: "Mordell–Weil Theorem", latex: "E(K) \\cong \\mathbb{Z}^{r} \\oplus E(K)_{\\text{tors}}" },
        { field: "Arithmetic Geometry", name: "Riemann–Roch Theorem", latex: "\\deg(\\mathcal{L}) - g + 1 = h^0(\\mathcal{L}) - h^1(\\mathcal{L})" },
        { field: "Arithmetic Geometry", name: "Hasse's Theorem", latex: "|E(\\mathbb{F}_q)| = q + 1 - t \\text{ with } t^2 \\leq 4q" },
        { field: "Arithmetic Geometry", name: "Weil Conjectures", latex: "|X(\\mathbb{F}_q)| = q^n + a_1 q^{n-1} + \\cdots + a_n \\quad \\text{with } |a_i| \\leq C \\cdot q^{i/2}" },
        { field: "Arithmetic Geometry", name: "Bézout's Theorem", latex: "\\sum_{P \\in C \\cap D} \\operatorname{mult}_P(C) \\cdot \\operatorname{mult}_P(D) = \\deg(C) \\cdot \\deg(D)" },
        { field: "Arithmetic Geometry", name: "Faltings' Theorem", latex: "\\text{Curves of genus } g \\geq 2 \\text{ have finitely many } \\mathbb{Q}\\text{-points}" }
    ];

    var container = document.createElement('div');
    container.className = 'math-background';
    
    // Create left column
    var leftColumn = document.createElement('div');
    leftColumn.className = 'math-background__column';
    
    // Create right column
    var rightColumn = document.createElement('div');
    rightColumn.className = 'math-background__column math-background__column--right';
    
    // Split equations between left and right columns
    var leftEquations = bgEquations.slice(0, Math.ceil(bgEquations.length / 2));
    var rightEquations = bgEquations.slice(Math.ceil(bgEquations.length / 2));
    
    // Populate left column
    leftEquations.forEach(function(eq) {
        var wrapper = document.createElement('div');
        wrapper.className = 'bg-equation';
        
        var label = document.createElement('span');
        label.className = 'eq-label';
        label.textContent = eq.field;
        
        var name = document.createElement('span');
        name.className = 'eq-name';
        name.textContent = eq.name;
        
        var math = document.createElement('span');
        math.className = 'eq-math';
        math.textContent = '\\[' + eq.latex + '\\]';
        
        wrapper.appendChild(label);
        wrapper.appendChild(name);
        wrapper.appendChild(math);
        leftColumn.appendChild(wrapper);
    });
    
    // Populate right column
    rightEquations.forEach(function(eq) {
        var wrapper = document.createElement('div');
        wrapper.className = 'bg-equation';
        
        var label = document.createElement('span');
        label.className = 'eq-label';
        label.textContent = eq.field;
        
        var name = document.createElement('span');
        name.className = 'eq-name';
        name.textContent = eq.name;
        
        var math = document.createElement('span');
        math.className = 'eq-math';
        math.textContent = '\\[' + eq.latex + '\\]';
        
        wrapper.appendChild(label);
        wrapper.appendChild(name);
        wrapper.appendChild(math);
        rightColumn.appendChild(wrapper);
    });
    
    container.appendChild(leftColumn);
    container.appendChild(rightColumn);
    document.body.appendChild(container);
    
    // Trigger MathJax to render the equations
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([container]).catch(function(){});
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // initExperimentalToggle(); // Disabled for public release - experimental mode not ready
    initMathBackground();
    
    // Initialize Math Lab simulations
    initMathLabSimulations();
});

// Math Lab Simulation Functions
function initMathLabSimulations() {
    // Arithmetic Sequence Simulation
    const arithmeticSim = document.getElementById("arithmetic-sim");
    if (arithmeticSim) {
        const a1Input = arithmeticSim.querySelector("#a1-input");
        const dInput = arithmeticSim.querySelector("#d-input");
        const nInput = arithmeticSim.querySelector("#n-input");
        const calculateBtn = arithmeticSim.querySelector("#calculate-btn");
        const output = arithmeticSim.querySelector(".math-lab__output");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const a1 = parseFloat(a1Input.value) || 0;
                const d = parseFloat(dInput.value) || 0;
                const n = parseInt(nInput.value) || 1;
                
                const an = a1 + (n - 1) * d;
                const sum = (n / 2) * (2 * a1 + (n - 1) * d);
                
                output.innerHTML = `
                    <p><strong>Term ${n}:</strong> a<sub>${n}</sub> = ${a1} + (${n} - 1) × ${d} = ${an}</p>
                    <p><strong>Sum of first ${n} terms:</strong> S<sub>${n}</sub> = ${sum}</p>
                `;
            });
        }
    }
    
    // Geometric Sequence Simulation
    const geometricSim = document.getElementById("geometric-sim");
    if (geometricSim) {
        const a1Input = geometricSim.querySelector("#ga1-input");
        const rInput = geometricSim.querySelector("#r-input");
        const nInput = geometricSim.querySelector("#gn-input");
        const calculateBtn = geometricSim.querySelector("#gcalculate-btn");
        const output = geometricSim.querySelector(".math-lab__output");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const a1 = parseFloat(a1Input.value) || 0;
                const r = parseFloat(rInput.value) || 0;
                const n = parseInt(nInput.value) || 1;
                
                const an = a1 * Math.pow(r, n - 1);
                const sum = a1 * (1 - Math.pow(r, n)) / (1 - r);
                
                output.innerHTML = `
                    <p><strong>Term ${n}:</strong> a<sub>${n}</sub> = ${a1} × ${r}<sup>${n-1}</sup> = ${an.toFixed(2)}</p>
                    <p><strong>Sum of first ${n} terms:</strong> S<sub>${n}</sub> = ${sum.toFixed(2)}</p>
                `;
            });
        }
    }
    
    // Quadratic Function Simulation
    const quadraticSim = document.getElementById("quadratic-sim");
    if (quadraticSim) {
        const aInput = quadraticSim.querySelector("#qa-input");
        const bInput = quadraticSim.querySelector("#qb-input");
        const cInput = quadraticSim.querySelector("#qc-input");
        const calculateBtn = quadraticSim.querySelector("#qcalculate-btn");
        const output = quadraticSim.querySelector(".math-lab__output");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const a = parseFloat(aInput.value) || 0;
                const b = parseFloat(bInput.value) || 0;
                const c = parseFloat(cInput.value) || 0;
                
                if (a === 0) {
                    output.innerHTML = "<p>Please enter a non-zero value for a (coefficient of x²).</p>";
                    return;
                }
                
                const h = -b / (2 * a);
                const k = a * h * h + b * h + c;
                const discriminant = b * b - 4 * a * c;
                
                let rootsInfo = "";
                if (discriminant > 0) {
                    const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                    const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
                    rootsInfo = `<p><strong>Roots:</strong> x = ${root1.toFixed(2)} and x = ${root2.toFixed(2)}</p>`;
                } else if (discriminant === 0) {
                    const root = -b / (2 * a);
                    rootsInfo = `<p><strong>Root:</strong> x = ${root.toFixed(2)} (repeated)</p>`;
                } else {
                    rootsInfo = "<p><strong>Roots:</strong> No real roots (complex)</p>";
                }
                
                output.innerHTML = `
                    <p><strong>Vertex:</strong> (${h.toFixed(2)}, ${k.toFixed(2)})</p>
                    <p><strong>Axis of symmetry:</strong> x = ${h.toFixed(2)}</p>
                    <p><strong>Discriminant:</strong> D = ${discriminant.toFixed(2)}</p>
                    ${rootsInfo}
                `;
            });
        }
    }
    
    // Measurement Conversion Simulation
    const measurementSim = document.getElementById("measurement-sim");
    if (measurementSim) {
        const valueInput = measurementSim.querySelector("#mvalue-input");
        const fromSelect = measurementSim.querySelector("#mfrom-input");
        const calculateBtn = measurementSim.querySelector("#mcalculate-btn");
        const output = measurementSim.querySelector(".math-lab__output");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const value = parseFloat(valueInput.value) || 0;
                const conversion = fromSelect.value;
                
                let result, toUnit;
                switch(conversion) {
                    case "in-cm":
                        result = value * 2.54;
                        toUnit = "cm";
                        break;
                    case "cm-in":
                        result = value / 2.54;
                        toUnit = "inches";
                        break;
                    case "ft-m":
                        result = value * 0.3048;
                        toUnit = "m";
                        break;
                    case "m-ft":
                        result = value / 0.3048;
                        toUnit = "feet";
                        break;
                    case "yd-m":
                        result = value * 0.9144;
                        toUnit = "m";
                        break;
                    case "m-yd":
                        result = value / 0.9144;
                        toUnit = "yards";
                        break;
                    default:
                        result = value;
                        toUnit = "";
                }
                
                output.innerHTML = `
                    <p><strong>Result:</strong> ${value} = ${result.toFixed(2)} ${toUnit}</p>
                `;
            });
        }
    }
    
    // Trigonometry Graph Visualizer
    const trigSim = document.getElementById("trig-sim");
    if (trigSim) {
        const funcSelect = trigSim.querySelector("#tfunc-select");
        const ampInput = trigSim.querySelector("#tamp-input");
        const freqInput = trigSim.querySelector("#tfreq-input");
        const phaseInput = trigSim.querySelector("#tphase-input");
        const shiftInput = trigSim.querySelector("#tshift-input");
        const calculateBtn = trigSim.querySelector("#tcalculate-btn");
        const canvas = trigSim.querySelector("#trig-canvas");
        const resultsDiv = trigSim.querySelector("#trig-results");
        
        if (calculateBtn && canvas) {
            const ctx = canvas.getContext("2d");
            let animationId = null;
            let mouseX = null;
            let mouseY = null;
            
            // Set canvas resolution for sharp rendering
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = 250 * dpr;
            ctx.scale(dpr, dpr);
            
            function drawGraph() {
                const A = parseFloat(ampInput.value) || 1;
                const B = parseFloat(freqInput.value) || 1;
                const C = parseFloat(phaseInput.value) || 0;
                const D = parseFloat(shiftInput.value) || 0;
                const func = funcSelect.value;
                
                const width = canvas.offsetWidth;
                const height = 250;
                
                ctx.clearRect(0, 0, width, height);
                
                // Desmos-like dark background with gradient
                const gradient = ctx.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, "#0d1520");
                gradient.addColorStop(1, "#111824");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                
                // Draw grid lines (Desmos style - more detailed)
                ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
                ctx.lineWidth = 1;
                
                // Minor grid lines
                const minorGridSpacing = 20;
                for (let x = 0; x <= width; x += minorGridSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                for (let y = 0; y <= height; y += minorGridSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
                
                // Major grid lines
                ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
                const majorGridSpacing = 80;
                for (let x = 0; x <= width; x += majorGridSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                for (let y = 0; y <= height; y += majorGridSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
                
                // Draw axes with glow effect
                ctx.shadowColor = "rgba(140, 200, 255, 0.3)";
                ctx.shadowBlur = 8;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, height / 2);
                ctx.lineTo(width, height / 2);
                ctx.moveTo(width / 2, 0);
                ctx.lineTo(width / 2, height);
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                // Draw axis labels
                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                ctx.font = "11px Inter, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("x", width - 10, height / 2 - 8);
                ctx.fillText("y", width / 2 + 8, 12);
                
                // Draw π labels on x-axis
                const piPositions = [-Math.PI, -Math.PI/2, 0, Math.PI/2, Math.PI];
                piPositions.forEach(pi => {
                    const x = width / 2 + (pi / Math.PI) * (width / 2);
                    if (x >= 0 && x <= width) {
                        const label = pi === 0 ? "0" : pi === Math.PI ? "π" : pi === -Math.PI ? "-π" : pi === Math.PI/2 ? "π/2" : "-π/2";
                        ctx.fillText(label, x, height / 2 + 15);
                    }
                });
                
                // Draw function with smooth curve and gradient
                const funcColors = {
                    sin: { main: "#8cc8ff", glow: "rgba(140, 200, 255, 0.4)" },
                    cos: { main: "#a8d4ff", glow: "rgba(168, 212, 255, 0.4)" },
                    tan: { main: "#ff6b6b", glow: "rgba(255, 107, 107, 0.4)" }
                };
                
                const colors = funcColors[func];
                
                // Add glow effect
                ctx.shadowColor = colors.glow;
                ctx.shadowBlur = 12;
                ctx.strokeStyle = colors.main;
                ctx.lineWidth = 3;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.beginPath();
                
                let prevY = null;
                for (let x = 0; x <= width; x++) {
                    const t = (x / width) * 2 * Math.PI - Math.PI;
                    let y;
                    
                    if (func === "sin") {
                        y = A * Math.sin(B * t + C) + D;
                    } else if (func === "cos") {
                        y = A * Math.cos(B * t + C) + D;
                    } else {
                        y = A * Math.tan(B * t + C) + D;
                        // Handle discontinuities for tan
                        if (Math.abs(y) > 10 * A) {
                            prevY = null;
                            continue;
                        }
                    }
                    
                    const canvasY = height / 2 - (y * height / 6 / (A || 1));
                    
                    if (prevY === null || Math.abs(canvasY - prevY) > height) {
                        ctx.moveTo(x, canvasY);
                    } else {
                        ctx.lineTo(x, canvasY);
                    }
                    prevY = canvasY;
                }
                
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                // Draw hover point if mouse is over canvas
                if (mouseX !== null && mouseY !== null) {
                    const t = (mouseX / width) * 2 * Math.PI - Math.PI;
                    let y;
                    if (func === "sin") {
                        y = A * Math.sin(B * t + C) + D;
                    } else if (func === "cos") {
                        y = A * Math.cos(B * t + C) + D;
                    } else {
                        y = A * Math.tan(B * t + C) + D;
                    }
                    
                    const canvasY = height / 2 - (y * height / 6 / (A || 1));
                    
                    // Draw point
                    ctx.fillStyle = "#fff";
                    ctx.shadowColor = colors.glow;
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.arc(mouseX, canvasY, 6, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    
                    // Draw coordinates
                    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                    ctx.font = "10px Inter, sans-serif";
                    ctx.textAlign = "left";
                    const coordText = `(${t.toFixed(2)}, ${y.toFixed(2)})`;
                    ctx.fillText(coordText, mouseX + 10, canvasY - 10);
                }
                
                // Show formula with better formatting
                const funcName = func === "sin" ? "sin" : func === "cos" ? "cos" : "tan";
                const signC = C >= 0 ? "+" : "-";
                const signD = D >= 0 ? "+" : "-";
                const formula = `y = ${A}${funcName}(${B}x ${signC} ${Math.abs(C)}) ${signD} ${Math.abs(D)}`;
                
                resultsDiv.innerHTML = `
                    <p><strong>Function:</strong> ${formula}</p>
                    <p><strong>Amplitude:</strong> ${Math.abs(A)}</p>
                    <p><strong>Period:</strong> ${(2 * Math.PI / (B || 1)).toFixed(3)} (${(2 / (B || 1)).toFixed(2)}π)</p>
                    <p><strong>Phase Shift:</strong> ${(-C / (B || 1)).toFixed(3)} rad</p>
                    <p><strong>Vertical Shift:</strong> ${D}</p>
                `;
            }
            
            // Add mouse tracking for hover effect
            canvas.addEventListener("mousemove", (e) => {
                const rect = canvas.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;
                drawGraph();
            });
            
            canvas.addEventListener("mouseleave", () => {
                mouseX = null;
                mouseY = null;
                drawGraph();
            });
            
            // Add real-time updates
            [ampInput, freqInput, phaseInput, shiftInput, funcSelect].forEach(input => {
                input.addEventListener("input", drawGraph);
            });
            
            calculateBtn.addEventListener("click", drawGraph);
            
            // Handle window resize
            window.addEventListener("resize", () => {
                const dpr = window.devicePixelRatio || 1;
                canvas.width = canvas.offsetWidth * dpr;
                canvas.height = 250 * dpr;
                ctx.scale(dpr, dpr);
                drawGraph();
            });
            
            drawGraph(); // Initial draw
        }
    }
    
    // Factoring Calculator Simulation
    const factoringSim = document.getElementById("factoring-sim");
    if (factoringSim) {
        const aInput = factoringSim.querySelector("#fa-input");
        const bInput = factoringSim.querySelector("#fb-input");
        const cInput = factoringSim.querySelector("#fc-input");
        const calculateBtn = factoringSim.querySelector("#fcalculate-btn");
        const output = factoringSim.querySelector(".math-lab__output");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const a = parseFloat(aInput.value) || 0;
                const b = parseFloat(bInput.value) || 0;
                const c = parseFloat(cInput.value) || 0;
                
                if (a === 0) {
                    output.innerHTML = "<p>Please enter a non-zero value for a (coefficient of x²).</p>";
                    return;
                }
                
                // Try to factor the quadratic
                let result = "";
                const discriminant = b * b - 4 * a * c;
                
                if (discriminant < 0) {
                    result = "Cannot be factored over real numbers (no real roots).";
                } else {
                    // Find factors
                    for (let m = -Math.abs(c); m <= Math.abs(c); m++) {
                        if (m === 0) continue;
                        if (c % m === 0) {
                            const n = c / m;
                                 if (m + n === b) {
                                     result = `(x + ${m})(x + ${n})`;
                                     break;
                                 }
                        }
                    }
                    
                    if (!result) {
                        // Try with a coefficient
                        for (let m = -Math.abs(c * a); m <= Math.abs(c * a); m++) {
                            if (m === 0) continue;
                            if ((c * a) % m === 0) {
                                const n = (c * a) / m;
                                if (m + n === b) {
                                    const factor1 = a > 0 ? a : -a;
                                    const sign1 = a * m > 0 ? "" : "-";
                                    const sign2 = a * n > 0 ? "" : "-";
                                    result = `(${sign1}${Math.abs(factor1)}x + ${m})(${sign2}${Math.abs(factor1)}x + ${n})`;
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (!result) {
                        result = "Cannot be factored with integer coefficients.";
                    }
                }
                
                output.innerHTML = `<p><strong>Factored form:</strong> ${result}</p>`;
            });
        }
    }
    
    // Right Triangle Trigonometry Simulator
    const triangleSim = document.getElementById("triangle-sim");
    if (triangleSim) {
        const angleInput = triangleSim.querySelector("#angle-input");
        const knownSideSelect = triangleSim.querySelector("#known-side-select");
        const sideInput = triangleSim.querySelector("#side-input");
        const calculateBtn = triangleSim.querySelector("#triangle-calculate-btn");
        const canvas = triangleSim.querySelector("#triangle-canvas");
        const resultsDiv = triangleSim.querySelector("#triangle-results");
        
        if (calculateBtn && canvas) {
            const ctx = canvas.getContext("2d");
            
            // Set canvas resolution for sharp rendering
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = 250 * dpr;
            ctx.scale(dpr, dpr);
            
            function drawTriangle(opposite, adjacent, hypotenuse, angle) {
                const width = canvas.offsetWidth;
                const height = 250;
                
                ctx.clearRect(0, 0, width, height);
                
                // Desmos-like dark background with gradient
                const gradient = ctx.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, "#0d1520");
                gradient.addColorStop(1, "#111824");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                
                // Draw grid lines
                ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
                ctx.lineWidth = 1;
                const gridSpacing = 25;
                for (let x = 0; x <= width; x += gridSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                for (let y = 0; y <= height; y += gridSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
              
                // Calculate scale to fit triangle nicely
                const maxVal = Math.max(opposite, adjacent, hypotenuse, 1);
                const scale = Math.min(width - 100, height - 100) * 0.4 / maxVal;
                const offsetX = 60;
                const offsetY = height - 50;
                
                // Triangle vertices
                const p1 = { x: offsetX, y: offsetY };
                const p2 = { x: offsetX + adjacent * scale, y: offsetY };
                const p3 = { x: offsetX + adjacent * scale, y: offsetY - opposite * scale };
                
                // Draw triangle fill with gradient
                const triangleGradient = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
                triangleGradient.addColorStop(0, "rgba(140, 200, 255, 0.1)");
                triangleGradient.addColorStop(1, "rgba(140, 200, 255, 0.05)");
                ctx.fillStyle = triangleGradient;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.closePath();
                ctx.fill();
                
                // Draw triangle with smooth lines and glow
                ctx.shadowColor = "rgba(140, 200, 255, 0.4)";
                ctx.shadowBlur = 10;
                ctx.strokeStyle = "#8cc8ff";
                ctx.lineWidth = 3;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.closePath();
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                // Draw right angle marker with better styling
                const rightAngleSize = 12;
                ctx.strokeStyle = "#8cc8ff";
                ctx.lineWidth = 2;
                ctx.fillStyle = "rgba(140, 200, 255, 0.2)";
                ctx.beginPath();
                ctx.moveTo(p2.x - rightAngleSize, p2.y);
                ctx.lineTo(p2.x - rightAngleSize, p2.y - rightAngleSize);
                ctx.lineTo(p2.x, p2.y - rightAngleSize);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
              
                // Draw angle arc with gradient
                const angleRad = angle * Math.PI / 180;
                ctx.strokeStyle = "#ff6b6b";
                ctx.lineWidth = 2;
                ctx.shadowColor = "rgba(255, 107, 107, 0.4)";
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(p1.x, p1.y, 25, 0, -angleRad, false);
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                // Draw labels with better styling
                ctx.fillStyle = "#f2f6fb";
                ctx.font = "bold 12px Inter, sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                
                // Angle label
                ctx.fillStyle = "#ff6b6b";
                ctx.font = "bold 14px Inter, sans-serif";
                ctx.fillText(`${angle}°`, p1.x + 35, p1.y - 20);
                
                // Side labels with background for readability
                function drawLabel(text, x, y, color = "#8cc8ff") {
                    ctx.font = "bold 13px Inter, sans-serif";
                    const metrics = ctx.measureText(text);
                    const padding = 4;
                    
                    // Background
                    ctx.fillStyle = "rgba(8, 16, 28, 0.8)";
                    ctx.fillRect(x - metrics.width/2 - padding, y - 10, metrics.width + padding*2, 20);
                    
                    // Text
                    ctx.fillStyle = color;
                    ctx.fillText(text, x, y);
                }
                
                // Opposite side label (vertical, centered)
                drawLabel(opposite.toFixed(2), p3.x - 15, (p2.y + p3.y) / 2);
                
                // Adjacent side label (horizontal, below)
                drawLabel(adjacent.toFixed(2), (p1.x + p2.x) / 2, p2.y + 20);
                
                // Hypotenuse label (diagonal, positioned along the hypotenuse)
                const midX = (p1.x + p3.x) / 2;
                const midY = (p1.y + p3.y) / 2;
                drawLabel(hypotenuse.toFixed(2), midX + 20, midY, "#a8d4ff");
                
                // Draw vertex labels
                ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                ctx.font = "italic 11px Inter, sans-serif";
                ctx.fillText("A", p1.x - 12, p1.y + 12);
                ctx.fillText("B", p2.x + 12, p2.y + 12);
                ctx.fillText("C", p3.x + 12, p3.y - 12);
            }
            
            function calculateAndDraw() {
                const angle = parseFloat(angleInput.value) || 0;
                const knownSide = knownSideSelect.value;
                const side = parseFloat(sideInput.value) || 0;
                
                if (angle <= 0 || angle >= 90) {
                    resultsDiv.innerHTML = "<p>Please enter an angle between 1 and 89 degrees.</p>";
                    return;
                }
                
                if (side <= 0) {
                    resultsDiv.innerHTML = "<p>Please enter a positive side length.</p>";
                    return;
                }
                
                const angleRad = angle * Math.PI / 180;
                let opposite, adjacent, hypotenuse;
                  
                if (knownSide === "opposite") {
                    opposite = side;
                    adjacent = side / Math.tan(angleRad);
                    hypotenuse = side / Math.sin(angleRad);
                } else if (knownSide === "adjacent") {
                    adjacent = side;
                    opposite = side * Math.tan(angleRad);
                    hypotenuse = side / Math.cos(angleRad);
                } else {
                    hypotenuse = side;
                    opposite = side * Math.sin(angleRad);
                    adjacent = side * Math.cos(angleRad);
                }
                
                drawTriangle(opposite, adjacent, hypotenuse, angle);
                
                resultsDiv.innerHTML = `
                    <p><strong>Given:</strong> Angle = ${angle}°, ${knownSide} = ${side}</p>
                    <p><strong>Calculated sides:</strong></p>
                    <p>Opposite = ${opposite.toFixed(3)} | Adjacent = ${adjacent.toFixed(3)} | Hypotenuse = ${hypotenuse.toFixed(3)}</p>
                    <p><strong>Trigonometric ratios:</strong></p>
                    <p>sin(${angle}°) = ${Math.sin(angleRad).toFixed(5)} | cos(${angle}°) = ${Math.cos(angleRad).toFixed(5)} | tan(${angle}°) = ${Math.tan(angleRad).toFixed(5)}</p>
                `;
            }
            
            calculateBtn.addEventListener("click", calculateAndDraw);
            
            // Add real-time updates
            [angleInput, knownSideSelect, sideInput].forEach(input => {
                input.addEventListener("input", calculateAndDraw);
            });
            
            // Handle window resize
            window.addEventListener("resize", () => {
                const dpr = window.devicePixelRatio || 1;
                canvas.width = canvas.offsetWidth * dpr;
                canvas.height = 250 * dpr;
                ctx.scale(dpr, dpr);
                calculateAndDraw();
            });
            
            // Initial draw
            calculateAndDraw();
        }
    }
    
    // SOH-CAH-TOA Calculator
    const sohcahtoaSim = document.getElementById("sohcahtoa-sim");
    if (sohcahtoaSim) {
        const angleInput = sohcahtoaSim.querySelector("#soh-angle-input");
        const calculateBtn = sohcahtoaSim.querySelector("#soh-calculate-btn");
        const resultsDiv = sohcahtoaSim.querySelector("#soh-results");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const angle = parseFloat(angleInput.value) || 0;
                
                if (angle < 0 || angle > 360) {
                    resultsDiv.innerHTML = "<p>Please enter an angle between 0 and 360 degrees.</p>";
                    return;
                }
                
                const angleRad = angle * Math.PI / 180;
                const sin = Math.sin(angleRad);
                const cos = Math.cos(angleRad);
                const tan = Math.tan(angleRad);
                
                resultsDiv.innerHTML = `
                    <p><strong>Angle:</strong> ${angle}° = ${(angle * Math.PI / 180).toFixed(4)} radians</p>
                    <p><strong>sin(${angle}°) =</strong> ${sin.toFixed(6)}</p>
                    <p><strong>cos(${angle}°) =</strong> ${cos.toFixed(6)}</p>
                    <p><strong>tan(${angle}°) =</strong> ${tan.toFixed(6)}</p>
                    <p><strong>SOH-CAH-TOA Summary:</strong></p>
                    <p>If hypotenuse = 1, then opposite = ${sin.toFixed(4)} and adjacent = ${cos.toFixed(4)}</p>
                `;
            });
        }
    }
    
    // Prime Factorization Visualizer
    const primeFactorSim = document.getElementById("prime-factor-sim");
    if (primeFactorSim) {
        const numInput = primeFactorSim.querySelector("#pfnum-input");
        const calculateBtn = primeFactorSim.querySelector("#pfcalculate-btn");
        const resultsDiv = primeFactorSim.querySelector("#pf-results");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const num = parseInt(numInput.value) || 0;
                
                if (num < 2) {
                    resultsDiv.innerHTML = "<p>Please enter a number greater than 1.</p>";
                    return;
                }
                
                // Find prime factorization
                let n = num;
                const factors = [];
                for (let i = 2; i <= n; i++) {
                    while (n % i === 0) {
                        factors.push(i);
                        n /= i;
                    }
                }
                
                // Find all factors
                const allFactors = [];
                for (let i = 1; i <= num; i++) {
                    if (num % i === 0) {
                        allFactors.push(i);
                    }
                }
                
                // Format prime factorization
                const factorCounts = {};
                factors.forEach(f => {
                    factorCounts[f] = (factorCounts[f] || 0) + 1;
                });
                
                let primeForm = factors.length > 0 ? 
                    Object.entries(factorCounts).map(([p, c]) => c > 1 ? `${p}<sup>${c}</sup>` : p).join(" × ") : 
                    num.toString();
                
                resultsDiv.innerHTML = `
                    <p><strong>Number:</strong> ${num}</p>
                    <p><strong>Prime Factorization:</strong> ${primeForm}</p>
                    <p><strong>All Factors:</strong> ${allFactors.join(", ")}</p>
                    <p><strong>Number of Factors:</strong> ${allFactors.length}</p>
                `;
            });
        }
    }
    
    // Algebra Tiles Visualizer
    const algebraTilesSim = document.getElementById("algebra-tiles-sim");
    if (algebraTilesSim) {
        const exprInput = algebraTilesSim.querySelector("#tile-expr-input");
        const calculateBtn = algebraTilesSim.querySelector("#tile-calculate-btn");
        const canvas = algebraTilesSim.querySelector("#tile-canvas");
        const resultsDiv = algebraTilesSim.querySelector("#tile-results");
        
        if (calculateBtn && canvas) {
            const ctx = canvas.getContext("2d");
            
            function parseQuadratic(expr) {
                const clean = expr.replace(/\s+/g, '');
                let a = 1, b = 0, c = 0;
                
                // Parse ax²
                const aMatch = clean.match(/^(-?\d*)x\^2/);
                if (aMatch !== null) {
                    const coef = aMatch[1];
                    if (coef === '' || coef === '+') a = 1;
                    else if (coef === '-') a = -1;
                    else a = parseInt(coef);
                }
                
                // Parse bx (not x²)
                const bMatch = clean.match(/([+-]?\d+)x(?!\^)/g);
                if (bMatch !== null && bMatch.length > 0) {
                    b = bMatch.reduce((sum, m) => sum + parseInt(m), 0);
                }
                
                // Parse c - the standalone number at the end
                const cMatch = clean.match(/([+-]?\d+)(?!.*x)/);
                if (cMatch !== null) {
                    c = parseInt(cMatch[0]);
                }
                
                return { a, b, c };
            }
            
            function factorQuadratic(a, b, c) {
                if (c === 0) {
                    return { factorable: true, m: b, n: 0, a: 1 };
                }
                if (a === 1) {
                    for (let m = -Math.max(100, Math.abs(c) * 2); m <= Math.max(100, Math.abs(c) * 2); m++) {
                        if (m === 0) continue;
                        if (c % m === 0) {
                            const n = c / m;
                            if (m + n === b) {
                                return { factorable: true, m, n, a: 1 };
                            }
                        }
                    }
                } else {
                    for (let m = -100; m <= 100; m++) {
                        if (m === 0) continue;
                        if ((a * c) % m === 0) {
                            const n = (a * c) / m;
                            if (m + n === b) {
                                return { factorable: true, m, n, a };
                            }
                        }
                    }
                }
                return { factorable: false };
            }
            
            function drawAreaModel(a, b, c, m, n, isFactored = false) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                const W = canvas.width;
                const H = canvas.height;
                const pad = 20;
                
                if (isFactored && a !== 0) {
                    ctx.fillStyle = "rgba(20, 30, 45, 0.4)";
                    ctx.fillRect(0, 0, W, H);
                    
                    const w = Math.min(W - 2*pad, 200);
                    const h = Math.min(H - 2*pad, 120);
                    const leftPad = (W - w) / 2;
                    const topPad = (H - h) / 2;
                    
                    ctx.strokeStyle = "#d4af37";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(leftPad, topPad, w, h);
                    
                    const halfW = w / 2;
                    const halfH = h / 2;
                    
                    ctx.fillStyle = "#4a90e2";
                    ctx.textAlign = "center";
                    ctx.font = "bold 14px sans-serif";
                    ctx.fillText(`${a}x²`, leftPad + halfW/2, topPad + halfH/3);
                    
                    ctx.fillStyle = "#50c878";
                    ctx.fillText(`${m}x`, leftPad + halfW/2, topPad + halfH/3 + halfH/3);
                    
                    ctx.fillStyle = "#ffd700";
                    ctx.fillText(`${n > 0 ? '+' : ''}${n}`, leftPad + halfW/2, topPad + halfH/3 + 2*halfH/3);
                    ctx.fillText(`${n > 0 ? '+' : ''}${n}`, leftPad + 3*halfW/2, topPad + halfH/3 + 2*halfH/3);
                    
                    ctx.strokeStyle = "#d4af37";
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 3]);
                    ctx.strokeRect(leftPad + halfW, topPad, halfW, h);
                    ctx.setLineDash([]);
                } else {
                    ctx.fillStyle = "rgba(15, 24, 37, 0.3)";
                    ctx.fillRect(0, 0, W, H);
                    
                    const tileSize = 35;
                    const gap = 5;
                    let currentX = pad;
                    const rowY = H / 2;
                    
                    ctx.fillStyle = "#4a90e2";
                    for (let i = 0; i < Math.abs(a); i++) {
                        ctx.fillRect(currentX + i*(tileSize + gap), rowY, tileSize, tileSize);
                    }
                    
                    ctx.fillStyle = "#50c878";
                    currentX = pad + Math.max(0, Math.abs(a)) * (tileSize + gap) + gap;
                    for (let i = 0; i < Math.abs(b); i++) {
                        ctx.fillRect(currentX + i*(tileSize + gap), rowY, tileSize, tileSize);
                    }
                    
                    ctx.fillStyle = "#ffd700";
                    currentX = pad + Math.max(0, Math.abs(a)) * (tileSize + gap) + gap + Math.max(0, Math.abs(b)) * (tileSize + gap) + gap;
                    for (let i = 0; i < Math.abs(c); i++) {
                        ctx.fillRect(currentX + i*(tileSize + gap), rowY, tileSize, tileSize);
                    }
                    
                    ctx.fillStyle = "#f2f6fb";
                    ctx.textAlign = "left";
                    ctx.font = "12px sans-serif";
                    ctx.fillText(`Expression: ${a}x²${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}`, 10, H - 15);
                }
            }
            
            calculateBtn.addEventListener("click", function() {
                const expr = exprInput.value.trim();
                if (!expr) return;
                
                const { a, b, c } = parseQuadratic(expr);
                const result = factorQuadratic(a, b, c);
                
                let factored = "";
                
                if (result.factorable) {
                    const mVal = result.m;
                    const nVal = result.n;
                    
                    if (result.a === 1) {
                        const f1 = mVal >= 0 ? `(x + ${mVal})` : `(x - ${-mVal})`;
                        const f2 = nVal >= 0 ? `(x + ${nVal})` : `(x - ${-nVal})`;
                        factored = `${f1}${f2}`;
                        drawAreaModel(a, b, c, mVal, nVal, true);
                    } else {
                        factored = `${a}x² + ${b}x + ${c} = (x + ${mVal})(x + ${nVal}) (after applying the AC method)`;
                        drawAreaModel(a, b, c, 0, 0, false);
                    }
                } else {
                    factored = `Cannot be factored with integer coefficients (discriminant = ${b*b - 4*a*c})`;
                    drawAreaModel(a, b, c, 0, 0, false);
                }
                
                resultsDiv.innerHTML = `
                    <p><strong>Expression:</strong> ${a}x²${b >= 0 ? '+' : ''}${b}x${c >= 0 ? '+' : ''}${c}</p>
                    <p><strong>Factored form:</strong> ${factored}</p>
                    <p style="color: var(--muted); font-size: 0.85rem;">Try factoring by arranging tiles into a rectangle. The dimensions of the rectangle are your factors!</p>
                `;
            });
        }
    }
    
    // Exponent Laws Simulator
    const exponentSim = document.getElementById("exponent-sim");
    if (exponentSim) {
        const baseInput = exponentSim.querySelector("#exp-base");
        const mInput = exponentSim.querySelector("#exp-m");
        const nInput = exponentSim.querySelector("#exp-n");
        const opSelect = exponentSim.querySelector("#exp-op");
        const calculateBtn = exponentSim.querySelector("#exp-calculate-btn");
        const resultsDiv = exponentSim.querySelector("#exp-results");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const base = parseFloat(baseInput.value) || 0;
                const m = parseFloat(mInput.value) || 0;
                const n = parseFloat(nInput.value) || 0;
                const op = opSelect.value;
                
                let result, formula;
                
                if (op === "product") {
                    result = Math.pow(base, m + n);
                    formula = `a^m × a^n = a^(m+n)`;
                } else if (op === "quotient") {
                    result = Math.pow(base, m - n);
                    formula = `a^m ÷ a^n = a^(m-n)`;
                } else {
                    result = Math.pow(base, m * n);
                    formula = `(a^m)^n = a^(mn)`;
                }
                
                resultsDiv.innerHTML = `
                    <p><strong>Formula:</strong> ${formula}</p>
                    <p><strong>Calculation:</strong> ${base}<sup>${m}</sup> ${op === "product" ? "×" : op === "quotient" ? "÷" : ""}<sup>${n}</sup> = ${result}</p>
                    <p><strong>Verification:</strong> ${op === "product" ? `${base}^m × ${base}^n = ${Math.pow(base, m)} × ${Math.pow(base, n)} = ${Math.pow(base, m) * Math.pow(base, n)}` : 
                      op === "quotient" ? `${base}^m ÷ ${base}^n = ${Math.pow(base, m)} ÷ ${Math.pow(base, n)} = ${(Math.pow(base, m) / Math.pow(base, n)).toFixed(4)}` :
                      `(${base}^m)^n = (${Math.pow(base, m)})^${n} = ${Math.pow(Math.pow(base, m), n)}`}</p>
                `;
            });
        }
    }
    
    // Radical and Exponent Converter
    const radicalSim = document.getElementById("radical-sim");
    if (radicalSim) {
        const valueInput = radicalSim.querySelector("#rad-value");
        const nInput = radicalSim.querySelector("#rad-n");
        const calculateBtn = radicalSim.querySelector("#rad-calculate-btn");
        const resultsDiv = radicalSim.querySelector("#rad-results");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const value = parseFloat(valueInput.value) || 0;
                const n = parseInt(nInput.value) || 2;
                
                if (value < 0) {
                    resultsDiv.innerHTML = "<p>Please enter a non-negative value.</p>";
                    return;
                }
                
                if (n < 2) {
                    resultsDiv.innerHTML = "<p>Please enter a root value of 2 or greater.</p>";
                    return;
                }
                
                const radicalResult = Math.pow(value, 1 / n);
                
                resultsDiv.innerHTML = `
                    <p><strong>Radical Form:</strong> √[${n}]{${value}} = ${radicalResult.toFixed(6)}</p>
                    <p><strong>Exponent Form:</strong> ${value}<sup>1/${n}</sup> = ${radicalResult.toFixed(6)}</p>
                    <p><strong>Verification:</strong> (${radicalResult.toFixed(6)})<sup>${n}</sup> = ${Math.pow(radicalResult, n).toFixed(4)}</p>
                `;
            });
        }
    }
    
    // Scientific Notation Operations
    const scientificCalcSim = document.getElementById("scientific-calc-sim");
    if (scientificCalcSim) {
        const a1Input = scientificCalcSim.querySelector("#sci-a1");
        const m1Input = scientificCalcSim.querySelector("#sci-m1");
        const a2Input = scientificCalcSim.querySelector("#sci-a2");
        const m2Input = scientificCalcSim.querySelector("#sci-m2");
        const opSelect = scientificCalcSim.querySelector("#sci-op");
        const calculateBtn = scientificCalcSim.querySelector("#sci-calculate-btn");
        const resultsDiv = scientificCalcSim.querySelector("#sci-results");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const a1 = parseFloat(a1Input.value) || 0;
                const m1 = parseInt(m1Input.value) || 0;
                const a2 = parseFloat(a2Input.value) || 0;
                const m2 = parseInt(m2Input.value) || 0;
                const op = opSelect.value;
                
                const num1 = a1 * Math.pow(10, m1);
                const num2 = a2 * Math.pow(10, m2);
                
                let result, exponent;
                
                if (op === "multiply") {
                    result = a1 * a2;
                    exponent = m1 + m2;
                } else {
                    result = a1 / a2;
                    exponent = m1 - m2;
                }
                
                // Normalize to proper scientific notation
                while (Math.abs(result) >= 10) {
                    result /= 10;
                    exponent += 1;
                }
                while (Math.abs(result) > 0 && Math.abs(result) < 1) {
                    result *= 10;
                    exponent -= 1;
                }
                
                resultsDiv.innerHTML = `
                    <p><strong>Numbers:</strong> (${a1} × 10<sup>${m1}</sup>) ${op === "multiply" ? "×" : "÷"} (${a2} × 10<sup>${m2}</sup>)</p>
                    <p><strong>Standard form:</strong> ${num1.toExponential(4)} ${op === "multiply" ? "×" : "÷"} ${num2.toExponential(4)}</p>
                    <p><strong>Result:</strong> ${result.toFixed(4)} × 10<sup>${exponent}</sup> = ${(result * Math.pow(10, exponent)).toExponential(4)}</p>
                `;
            });
        }
    }
    
    // Scientific Notation Converter
    const scientificSim = document.getElementById("scientific-sim");
    if (scientificSim) {
        const numInput = scientificSim.querySelector("#snum-input");
        const calculateBtn = scientificSim.querySelector("#scalculate-btn");
        const output = scientificSim.querySelector(".math-lab__output");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const num = parseFloat(numInput.value) || 0;
                
                if (num === 0) {
                    output.innerHTML = "<p>0 in scientific notation: 0 × 10^0</p>";
                    return;
                }
                
                const scientific = num.toExponential(4);
                const parts = scientific.split("e");
                const coefficient = parseFloat(parts[0]);
                const exponent = parseInt(parts[1]);
                
                output.innerHTML = `
                    <p><strong>Original number:</strong> ${num}</p>
                    <p><strong>Scientific notation:</strong> ${coefficient} × 10<sup>${exponent}</sup></p>
                    <p><strong>Engineering notation:</strong> ${num.toPrecision(4)} = ${num >= 0 ? "" : "-"}${Math.abs(num).toExponential(2)}</p>
                `;
            });
        }
    }
    
    // Function Evaluator
    const functionEvaluator = document.getElementById("function-evaluator");
    if (functionEvaluator) {
        const exprInput = functionEvaluator.querySelector("#func-expr");
        const xInput = functionEvaluator.querySelector("#func-x");
        const calculateBtn = functionEvaluator.querySelector("#func-calculate-btn");
        const resultsDiv = functionEvaluator.querySelector("#func-results");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const expr = exprInput.value;
                const x = parseFloat(xInput.value) || 0;
                
                try {
                    // Simple expression evaluator for basic math
                    // Replace ^ with ** for exponentiation, handle sqrt
                    let safeExpr = expr.replace(/\^/g, "**");
                    safeExpr = safeExpr.replace(/sqrt\(/g, "Math.sqrt(");
                    safeExpr = safeExpr.replace(/log\(/g, "Math.log(");
                    safeExpr = safeExpr.replace(/abs\(/g, "Math.abs(");
                    
                    // Replace x with the value, being careful about multiplication
                    safeExpr = safeExpr.replace(/\bx\b/g, `(${x})`);
                    
                    // Handle implicit multiplication (e.g., 2x -> 2*x)
                    safeExpr = safeExpr.replace(/(\d)\s*\(/g, "$1*(");
                    safeExpr = safeExpr.replace(/\)(\d)/g, ")*$1");
                    
                    const result = eval(safeExpr);
                    
                    resultsDiv.innerHTML = `
                        <p><strong>Function:</strong> f(x) = ${expr}</p>
                        <p><strong>Input:</strong> x = ${x}</p>
                        <p><strong>Output:</strong> f(${x}) = ${result}</p>
                    `;
                } catch (e) {
                    resultsDiv.innerHTML = "<p>Invalid function expression. Try: 2*x + 3 or x**2 - 4</p>";
                }
            });
        }
    }
    
    // Domain and Range Analyzer
    const domainRangeSim = document.getElementById("domain-range-sim");
    if (domainRangeSim) {
        const funcInput = domainRangeSim.querySelector("#dr-func");
        const calculateBtn = domainRangeSim.querySelector("#dr-calculate-btn");
        const resultsDiv = domainRangeSim.querySelector("#dr-results");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const func = funcInput.value;
                
                let domain = "All real numbers";
                let range = "All real numbers";
                let restrictions = [];
                
                // Check for division (denominator cannot be zero)
                if (func.includes("/")) {
                    restrictions.push("Denominator cannot be zero");
                    domain = "x ≠ value that makes denominator zero";
                }
                
                // Check for square root (radicand must be non-negative)
                if (func.includes("sqrt") || func.includes("√")) {
                    restrictions.push("Expression under square root must be non-negative");
                    domain = "x ≥ value that makes radicand ≥ 0";
                }
                
                // Check for logarithm (argument must be positive)
                if (func.includes("log") || func.includes("ln")) {
                    restrictions.push("Logarithm argument must be positive");
                    domain = "x > 0 (for log arguments)";
                }
                
                // Check for even roots
                if (func.match(/x\^\(1\/\d+\)|x\^\{1\/\d+\}/)) {
                    restrictions.push("Even root requires non-negative radicand");
                    domain = "x ≥ 0 (for even roots)";
                }
                
                resultsDiv.innerHTML = `
                    <p><strong>Function:</strong> f(x) = ${func}</p>
                    <p><strong>Domain:</strong> ${domain}</p>
                    <p><strong>Range:</strong> ${range}</p>
                    <p><strong>Restrictions:</strong> ${restrictions.length > 0 ? restrictions.join(", ") : "None"}</p>
                `;
            });
        }
    }
    
    // Vertical Line Test Visualizer
    const verticalLineTest = document.getElementById("vertical-line-test");
    if (verticalLineTest) {
        const typeSelect = verticalLineTest.querySelector("#vlt-type");
        const relationInput = verticalLineTest.querySelector("#vlt-relation");
        const xminInput = verticalLineTest.querySelector("#vlt-xmin");
        const xmaxInput = verticalLineTest.querySelector("#vlt-xmax");
        const yminInput = verticalLineTest.querySelector("#vlt-ymin");
        const ymaxInput = verticalLineTest.querySelector("#vlt-ymax");
        const calculateBtn = verticalLineTest.querySelector("#vlt-calculate-btn");
        const canvas = verticalLineTest.querySelector("#vlt-canvas");
        const resultsDiv = verticalLineTest.querySelector("#vlt-results");
        
        if (calculateBtn && canvas) {
            const ctx = canvas.getContext("2d");
            
            function evaluate2DFunction(expr, x) {
                try {
                    // Handle implicit multiplication: 2x -> 2*x, 3(x -> 3*(x
                    let safeExpr = expr.replace(/(\d)(x|\()/g, "$1*$2");
                    // Replace ^ with ** for exponentiation
                    safeExpr = safeExpr.replace(/\^/g, "**");
                    // Handle sqrt
                    safeExpr = safeExpr.replace(/sqrt\(/g, "Math.sqrt(");
                    // Replace x with the value
                    safeExpr = safeExpr.replace(/\bx\b/g, `(${x})`);
                    
                    return eval(safeExpr);
                } catch (e) {
                    return null;
                }
            }
            
            function evaluate3DFunction(expr, x, y) {
                try {
                    // Handle implicit multiplication
                    let safeExpr = expr.replace(/(\d)(x|\()/g, "$1*$2");
                    safeExpr = safeExpr.replace(/(\d)(y|\()/g, "$1*$2");
                    // Replace ^ with ** for exponentiation
                    safeExpr = safeExpr.replace(/\^/g, "**");
                    // Handle sqrt
                    safeExpr = safeExpr.replace(/sqrt\(/g, "Math.sqrt(");
                    // Replace x and y with values
                    safeExpr = safeExpr.replace(/\bx\b/g, `(${x})`);
                    safeExpr = safeExpr.replace(/\by\b/g, `(${y})`);
                    
                    return eval(safeExpr);
                } catch (e) {
                    return null;
                }
            }
            
            function draw2DGraph(relation, xmin, xmax) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Desmos-like dark background
                ctx.fillStyle = "#1a2639";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw grid lines (Desmos style)
                ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
                ctx.lineWidth = 1;
                const gridSpacing = 40;
                for (let x = 0; x <= canvas.width; x += gridSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, canvas.height);
                    ctx.stroke();
                }
                for (let y = 0; y <= canvas.height; y += gridSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(canvas.width, y);
                    ctx.stroke();
                }
                
                // Draw axes
                ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, canvas.height / 2);
                ctx.lineTo(canvas.width, canvas.height / 2);
                ctx.moveTo(canvas.width / 2, 0);
                ctx.lineTo(canvas.width / 2, canvas.height);
                ctx.stroke();
                
                // Draw the relation (Desmos blue)
                ctx.strokeStyle = "#4a90e2";
                ctx.lineWidth = 2;
                ctx.beginPath();
                let started = false;
                for (let x = xmin; x <= xmax; x += 0.1) {
                    const y = evaluate2DFunction(relation, x);
                    if (y === null || isNaN(y) || !isFinite(y)) {
                        started = false;
                        continue;
                    }
                    const canvasX = canvas.width / 2 + x * 20;
                    const canvasY = canvas.height / 2 - y * 20;
                    if (!started) {
                        ctx.moveTo(canvasX, canvasY);
                        started = true;
                    } else {
                        ctx.lineTo(canvasX, canvasY);
                    }
                }
                ctx.stroke();
                
                // Draw vertical lines at sample x-values to show the test
                ctx.strokeStyle = "rgba(255, 107, 107, 0.4)";
                ctx.setLineDash([5, 5]);
                for (let x = Math.floor(xmin); x <= Math.ceil(xmax); x += 1) {
                    const canvasX = canvas.width / 2 + x * 20;
                    ctx.beginPath();
                    ctx.moveTo(canvasX, 0);
                    ctx.lineTo(canvasX, canvas.height);
                    ctx.stroke();
                }
                ctx.setLineDash([]);
            }
            
            function draw3DGraph(relation, xmin, xmax, ymin, ymax) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Desmos-like dark background
                ctx.fillStyle = "#1a2639";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Find min and max z values for scaling
                let minZ = Infinity, maxZ = -Infinity;
                for (let x = xmin; x <= xmax; x += 0.5) {
                    for (let y = ymin; y <= ymax; y += 0.5) {
                        const z = evaluate3DFunction(relation, x, y);
                        if (z !== null && isFinite(z)) {
                            minZ = Math.min(minZ, z);
                            maxZ = Math.max(maxZ, z);
                        }
                    }
                }
                
                // Draw the 3D surface with Desmos-like colors
                const step = 0.3;
                for (let x = xmin; x <= xmax; x += step) {
                    for (let y = ymin; y <= ymax; y += step) {
                        const z1 = evaluate3DFunction(relation, x, y);
                        
                        if (z1 !== null && isFinite(z1)) {
                            // Map 3D point to 2D canvas (isometric projection)
                            const scale = 15;
                            const offsetX = canvas.width / 2;
                            const offsetY = canvas.height / 2;
                            
                            const screenX = offsetX + (x - y) * scale;
                            const screenY = offsetY - (z1 + (x + y) / 2) * scale / 2;
                            
                            // Desmos-like color gradient (blue to purple)
                            const t = (z1 - minZ) / (maxZ - minZ + 0.001);
                            const r = Math.round(74 + t * 100);
                            const g = Math.round(144 + t * 50);
                            const b = Math.round(226 - t * 50);
                            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                            
                            // Draw point
                            ctx.beginPath();
                            ctx.arc(screenX, screenY, 1.5, 0, 2 * Math.PI);
                            ctx.fill();
                        }
                    }
                }
                
                // Draw axes
                ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - 60, canvas.height / 2 + 60);
                ctx.lineTo(canvas.width / 2 + 60, canvas.height / 2 - 60);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            
            calculateBtn.addEventListener("click", function() {
                const type = typeSelect.value;
                const relation = relationInput.value;
                const xmin = parseFloat(xminInput.value) || -5;
                const xmax = parseFloat(xmaxInput.value) || 5;
                const ymin = parseFloat(yminInput.value) || -5;
                const ymax = parseFloat(ymaxInput.value) || 5;
                
                try {
                    if (type === "2d") {
                        // Test if the relation is a function
                        let isFunction = true;
                        let reason = "Each x-value produces exactly one y-value.";
                        
                        // Check for non-function patterns
                        if (relation.includes("y^2") || relation.includes("y**2")) {
                            isFunction = false;
                            reason = "This is a sideways parabola - one x-value can give two y-values.";
                        }
                        
                        draw2DGraph(relation, xmin, xmax);
                        
                        resultsDiv.innerHTML = `
                            <p><strong>Relation:</strong> y = ${relation}</p>
                            <p><strong>Vertical Line Test Result:</strong> ${isFunction ? "✓ PASSES" : "✗ FAILS"}</p>
                            <p><strong>Explanation:</strong> ${reason}</p>
                            <p><strong>What this means:</strong> ${isFunction ? "This relation IS a function - each input has exactly one output." : "This relation is NOT a function - some inputs have multiple outputs."}</p>
                        `;
                    } else {
                        // 3D function - always a function (z = f(x,y) always gives one z for each (x,y))
                        draw3DGraph(relation, xmin, xmax, ymin, ymax);
                        
                        resultsDiv.innerHTML = `
                            <p><strong>Relation:</strong> z = f(x,y) = ${relation}</p>
                            <p><strong>Vertical Line Test Result:</strong> ✓ PASSES (3D functions always pass)</p>
                            <p><strong>Explanation:</strong> For each (x,y) pair, there is exactly one z-value.</p>
                            <p><strong>Domain:</strong> x ∈ [${xmin}, ${xmax}], y ∈ [${ymin}, ${ymax}]</p>
                            <p><strong>3D Visualization:</strong> Points are colored by height (blue = low, purple = high)</p>
                        `;
                    }
                } catch (e) {
                    resultsDiv.innerHTML = "<p>Invalid function expression. Try: x^2, sqrt(x), or x*y</p>";
                }
            });
        }
    }
    
    // Linear Function Grapher
    const linearGrapher = document.getElementById("linear-grapher");
    if (linearGrapher) {
        const mInput = linearGrapher.querySelector("#lm-input");
        const bInput = linearGrapher.querySelector("#lb-input");
        const calculateBtn = linearGrapher.querySelector("#lcalculate-btn");
        const canvas = linearGrapher.querySelector("#linear-canvas");
        const resultsDiv = linearGrapher.querySelector("#linear-results");
        
        if (calculateBtn && canvas) {
            const ctx = canvas.getContext("2d");
            let mouseX = null;
            let mouseY = null;
            
            // Set canvas resolution for sharp rendering
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = 300 * dpr;
            ctx.scale(dpr, dpr);
            
            function drawLine(m, b) {
                const width = canvas.offsetWidth;
                const height = 300;
                
                ctx.clearRect(0, 0, width, height);
                
                // Desmos-like dark background with gradient
                const gradient = ctx.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, "#0d1520");
                gradient.addColorStop(1, "#111824");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                
                // Draw grid lines
                ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
                ctx.lineWidth = 1;
                const gridSpacing = 30;
                for (let x = 0; x <= width; x += gridSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                for (let y = 0; y <= height; y += gridSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
                
                // Draw axes with glow effect
                ctx.shadowColor = "rgba(140, 200, 255, 0.3)";
                ctx.shadowBlur = 8;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, height / 2);
                ctx.lineTo(width, height / 2);
                ctx.moveTo(width / 2, 0);
                ctx.lineTo(width / 2, height);
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                // Draw axis labels
                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                ctx.font = "11px Inter, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("x", width - 10, height / 2 - 8);
                ctx.fillText("y", width / 2 + 8, 12);
                
                // Draw scale numbers
                ctx.font = "10px Inter, sans-serif";
                for (let i = -10; i <= 10; i += 2) {
                    if (i !== 0) {
                        const x = width / 2 + i * 20;
                        const y = height / 2 + i * 20;
                        if (x >= 0 && x <= width) {
                            ctx.fillText(i.toString(), x, height / 2 + 15);
                        }
                        if (y >= 0 && y <= height) {
                            ctx.fillText((-i).toString(), width / 2 + 12, y + 4);
                        }
                    }
                }
                
                // Draw line with glow effect
                ctx.shadowColor = "rgba(140, 200, 255, 0.4)";
                ctx.shadowBlur = 12;
                ctx.strokeStyle = "#8cc8ff";
                ctx.lineWidth = 3;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.beginPath();
                
                const scale = 20;
                const xMin = -width / (2 * scale) - 2;
                const xMax = width / (2 * scale) + 2;
                
                for (let x = xMin; x <= xMax; x += 0.1) {
                    const y = m * x + b;
                    const canvasX = width / 2 + x * scale;
                    const canvasY = height / 2 - y * scale;
                    
                    if (x === xMin) {
                        ctx.moveTo(canvasX, canvasY);
                    } else {
                        ctx.lineTo(canvasX, canvasY);
                    }
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                // Draw y-intercept point
                const yIntX = width / 2;
                const yIntY = height / 2 - b * scale;
                if (yIntY >= 0 && yIntY <= height) {
                    ctx.fillStyle = "#ff6b6b";
                    ctx.shadowColor = "rgba(255, 107, 107, 0.4)";
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.arc(yIntX, yIntY, 6, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    
                    // Label
                    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                    ctx.font = "10px Inter, sans-serif";
                    ctx.fillText(`(0, ${b.toFixed(1)})`, yIntX + 10, yIntY - 8);
                }
                
                // Draw x-intercept point if it exists
                if (m !== 0) {
                    const xInt = -b / m;
                    const xIntX = width / 2 + xInt * scale;
                    const xIntY = height / 2;
                    if (xIntX >= 0 && xIntX <= width) {
                        ctx.fillStyle = "#a8d4ff";
                        ctx.shadowColor = "rgba(168, 212, 255, 0.4)";
                        ctx.shadowBlur = 10;
                        ctx.beginPath();
                        ctx.arc(xIntX, xIntY, 6, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                        
                        // Label
                        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                        ctx.font = "10px Inter, sans-serif";
                        ctx.fillText(`(${xInt.toFixed(1)}, 0)`, xIntX + 10, xIntY + 15);
                    }
                }
                
                // Draw hover point if mouse is over canvas
                if (mouseX !== null && mouseY !== null) {
                    const graphX = (mouseX - width / 2) / scale;
                    const graphY = m * graphX + b;
                    const canvasY = height / 2 - graphY * scale;
                    
                    ctx.fillStyle = "#fff";
                    ctx.shadowColor = "rgba(140, 200, 255, 0.4)";
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.arc(mouseX, canvasY, 6, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    
                    // Draw coordinates
                    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                    ctx.font = "10px Inter, sans-serif";
                    ctx.textAlign = "left";
                    const coordText = `(${graphX.toFixed(2)}, ${graphY.toFixed(2)})`;
                    ctx.fillText(coordText, mouseX + 10, canvasY - 10);
                }
            }
            
            function updateResults() {
                const m = parseFloat(mInput.value) || 0;
                const b = parseFloat(bInput.value) || 0;
                
                drawLine(m, b);
                
                const slopeType = m > 0 ? "increasing" : m < 0 ? "decreasing" : "constant";
                const xIntercept = m !== 0 ? (-b / m).toFixed(3) : "none (horizontal line)";
                
                resultsDiv.innerHTML = `
                    <p><strong>Function:</strong> y = ${m}x + ${b}</p>
                    <p><strong>Slope:</strong> ${m} (${slopeType})</p>
                    <p><strong>Y-intercept:</strong> (0, ${b})</p>
                    <p><strong>X-intercept:</strong> (${xIntercept}, 0)</p>
                `;
            }
            
            // Add mouse tracking for hover effect
            canvas.addEventListener("mousemove", (e) => {
                const rect = canvas.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;
                updateResults();
            });
            
            canvas.addEventListener("mouseleave", () => {
                mouseX = null;
                mouseY = null;
                updateResults();
            });
            
            // Add real-time updates
            [mInput, bInput].forEach(input => {
                input.addEventListener("input", updateResults);
            });
            
            calculateBtn.addEventListener("click", updateResults);
            
            // Handle window resize
            window.addEventListener("resize", () => {
                const dpr = window.devicePixelRatio || 1;
                canvas.width = canvas.offsetWidth * dpr;
                canvas.height = 300 * dpr;
                ctx.scale(dpr, dpr);
                updateResults();
            });
            
            updateResults(); // Initial draw
        }
    }
    
    // Slope Calculator
    const slopeCalculator = document.getElementById("slope-calculator");
    if (slopeCalculator) {
        const p1x = slopeCalculator.querySelector("#sp1x");
        const p1y = slopeCalculator.querySelector("#sp1y");
        const p2x = slopeCalculator.querySelector("#sp2x");
        const p2y = slopeCalculator.querySelector("#sp2y");
        const calculateBtn = slopeCalculator.querySelector("#scalculate-btn");
        const resultsDiv = slopeCalculator.querySelector("#slope-results");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const x1 = parseFloat(p1x.value) || 0;
                const y1 = parseFloat(p1y.value) || 0;
                const x2 = parseFloat(p2x.value) || 0;
                const y2 = parseFloat(p2y.value) || 0;
                
                if (x1 === x2) {
                    resultsDiv.innerHTML = "<p>Vertical line - slope is undefined (infinite).</p>";
                    return;
                }
                
                const slope = (y2 - y1) / (x2 - x1);
                const lineEq = `y - ${y1} = ${slope}(x - ${x1})`;
                
                resultsDiv.innerHTML = `
                    <p><strong>Points:</strong> (${x1}, ${y1}) and (${x2}, ${y2})</p>
                    <p><strong>Slope:</strong> m = (${y2} - ${y1}) / (${x2} - ${x1}) = ${slope}</p>
                    <p><strong>Line equation:</strong> ${lineEq}</p>
                `;
            });
        }
    }
    
    // Linear Inequality Grapher
    const inequalityGrapher = document.getElementById("inequality-grapher");
    if (inequalityGrapher) {
        const exprInput = inequalityGrapher.querySelector("#ineq-expr");
        const calculateBtn = inequalityGrapher.querySelector("#ineq-calculate-btn");
        const canvas = inequalityGrapher.querySelector("#ineq-canvas");
        const resultsDiv = inequalityGrapher.querySelector("#ineq-results");
        
        if (calculateBtn && canvas) {
            const ctx = canvas.getContext("2d");
            
            // Set canvas resolution for sharp rendering
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = 300 * dpr;
            ctx.scale(dpr, dpr);
            
            function parseInequality(expr) {
                // Handle implicit multiplication: 2x -> 2*x
                let cleanExpr = expr.replace(/(\d)(x|\()/g, "$1*$2");
                cleanExpr = cleanExpr.replace(/(\d)(y|\()/g, "$1*$2");
                
                // Parse: ax + by < c or ax + by > c
                // Match patterns like: 2*x + 3*y < 6, x + y <= 5, 3x - 2y > 4
                const match = cleanExpr.match(/([+-]?\d*\.?\d*)\s*\*?\s*x\s*([+-])\s*([+-]?\d*\.?\d*)\s*\*?\s*y\s*([<>=]+)\s*([+-]?\d*\.?\d*)/i) ||
                              cleanExpr.match(/([+-]?\d*\.?\d*)\s*\*?\s*x\s*([<>=]+)\s*([+-]?\d*\.?\d*)/i) ||
                              cleanExpr.match(/([+-]?\d*\.?\d*)\s*\*?\s*y\s*([<>=]+)\s*([+-]?\d*\.?\d*)/i);
                
                if (match) {
                    if (match.length === 6) {
                        // ax + by < c format
                        const a = parseFloat(match[1]) || 0;
                        const sign = match[2];
                        const b = sign === "-" ? -(parseFloat(match[3]) || 0) : (parseFloat(match[3]) || 0);
                        const op = match[4];
                        const c = parseFloat(match[5]) || 0;
                        return { a, b, c, op };
                    } else if (match.length === 4) {
                        // ax < c or by < c format
                        const a = parseFloat(match[1]) || 0;
                        const op = match[2];
                        const c = parseFloat(match[3]) || 0;
                        // Check if it's y or x
                        if (cleanExpr.includes("y") && !cleanExpr.includes("x")) {
                            return { a: 0, b: a, c, op };
                        }
                        return { a, b: 0, c, op };
                    }
                }
                
                // Try simpler parsing
                const simpleMatch = cleanExpr.match(/([+-]?\d*\.?\d*)x?\s*([+-]?\d*\.?\d*)y?\s*([<>=]+)\s*([+-]?\d*\.?\d*)/i);
                if (simpleMatch) {
                    const a = parseFloat(simpleMatch[1]) || 0;
                    const b = parseFloat(simpleMatch[2]) || 0;
                    const op = simpleMatch[3];
                    const c = parseFloat(simpleMatch[4]) || 0;
                    return { a, b, c, op };
                }
                
                return null;
            }
            
            function drawInequality() {
                const expr = exprInput.value;
                const parsed = parseInequality(expr);
                
                if (!parsed) {
                    resultsDiv.innerHTML = "<p>Invalid inequality format. Try: 2*x + 3*y < 6 or x + y <= 5</p>";
                    return;
                }
                
                const { a, b, c, op } = parsed;
                const width = canvas.offsetWidth;
                const height = 300;
                
                ctx.clearRect(0, 0, width, height);
                
                // Desmos-like dark background with gradient
                const gradient = ctx.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, "#0d1520");
                gradient.addColorStop(1, "#111824");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                
                // Draw grid lines
                ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
                ctx.lineWidth = 1;
                const gridSpacing = 30;
                for (let x = 0; x <= width; x += gridSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                for (let y = 0; y <= height; y += gridSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
                
                // Draw axes with glow effect
                ctx.shadowColor = "rgba(140, 200, 255, 0.3)";
                ctx.shadowBlur = 8;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, height / 2);
                ctx.lineTo(width, height / 2);
                ctx.moveTo(width / 2, 0);
                ctx.lineTo(width / 2, height);
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                // Draw axis labels
                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                ctx.font = "11px Inter, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("x", width - 10, height / 2 - 8);
                ctx.fillText("y", width / 2 + 8, 12);
                
                // Test point (0,0)
                const testResult = a * 0 + b * 0;
                const isSatisfied = (op === "<" && testResult < c) || (op === ">" && testResult > c) ||
                                   (op === "<=" && testResult <= c) || (op === ">=" && testResult >= c);
                
                // Shade the solution region with better gradient
                const shadeGradient = ctx.createLinearGradient(0, 0, width, height);
                shadeGradient.addColorStop(0, "rgba(140, 200, 255, 0.15)");
                shadeGradient.addColorStop(1, "rgba(140, 200, 255, 0.05)");
                ctx.fillStyle = shadeGradient;
                ctx.beginPath();
                
                const scale = 20;
                
                // Draw shaded region by filling the appropriate side
                if (b !== 0) {
                    // y = (c - a*x) / b
                    // For each x, determine y range
                    const xMin = -width / (2 * scale) - 2;
                    const xMax = width / (2 * scale) + 2;
                    
                    for (let x = xMin; x <= xMax; x += 0.2) {
                        const boundaryY = (c - a * x) / b;
                        const canvasX = width / 2 + x * scale;
                        const boundaryCanvasY = height / 2 - boundaryY * scale;
                        
                        if (x === xMin) {
                            ctx.moveTo(canvasX, isSatisfied ? height : boundaryCanvasY);
                        }
                        
                        // Draw line to boundary
                        ctx.lineTo(canvasX, boundaryCanvasY);
                    }
                    
                    // Close the path
                    if (isSatisfied) {
                        ctx.lineTo(width, height);
                        ctx.lineTo(0, height);
                    } else {
                        ctx.lineTo(width, 0);
                        ctx.lineTo(0, 0);
                    }
                } else if (a !== 0) {
                    // Vertical line x = c/a
                    const boundaryX = c / a;
                    const boundaryCanvasX = width / 2 + boundaryX * scale;
                    
                    if (isSatisfied) {
                        // Shade right side
                        ctx.moveTo(boundaryCanvasX, 0);
                        ctx.lineTo(width, 0);
                        ctx.lineTo(width, height);
                        ctx.lineTo(boundaryCanvasX, height);
                    } else {
                        // Shade left side
                        ctx.moveTo(0, 0);
                        ctx.lineTo(boundaryCanvasX, 0);
                        ctx.lineTo(boundaryCanvasX, height);
                        ctx.lineTo(0, height);
                    }
                }
                
                ctx.closePath();
                ctx.fill();
                
                // Draw boundary line with glow effect
                ctx.shadowColor = "rgba(140, 200, 255, 0.4)";
                ctx.shadowBlur = 10;
                ctx.strokeStyle = "#8cc8ff";
                ctx.lineWidth = op.includes("=") ? 3 : 2;
                ctx.setLineDash(op.includes("=") ? [] : [8, 6]);
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.beginPath();
                
                if (b !== 0) {
                    for (let x = xMin; x <= xMax; x += 0.1) {
                        const y = (c - a * x) / b;
                        const canvasX = width / 2 + x * scale;
                        const canvasY = height / 2 - y * scale;
                        if (x === xMin) ctx.moveTo(canvasX, canvasY);
                        else ctx.lineTo(canvasX, canvasY);
                    }
                } else if (a !== 0) {
                    // Vertical line
                    const boundaryX = c / a;
                    const canvasX = width / 2 + boundaryX * scale;
                    ctx.moveTo(canvasX, 0);
                    ctx.lineTo(canvasX, height);
                }
                
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.shadowBlur = 0;
                
                // Draw test point indicator
                ctx.fillStyle = isSatisfied ? "#5cb85c" : "#ff6b6b";
                ctx.shadowColor = isSatisfied ? "rgba(92, 184, 92, 0.4)" : "rgba(255, 107, 107, 0.4)";
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Format the boundary line equation
                let boundaryEq;
                if (b !== 0) {
                    const slope = -a / b;
                    const yInt = c / b;
                    const signSlope = slope >= 0 ? "+" : "-";
                    const signYInt = yInt >= 0 ? "+" : "-";
                    boundaryEq = `y = ${signSlope} ${Math.abs(slope).toFixed(2)}x ${signYInt} ${Math.abs(yInt).toFixed(2)}`;
                } else {
                    boundaryEq = `x = ${(c / a).toFixed(2)}`;
                }
                
                resultsDiv.innerHTML = `
                    <p><strong>Inequality:</strong> ${a}x + ${b}y ${op} ${c}</p>
                    <p><strong>Boundary line:</strong> ${boundaryEq}</p>
                    <p><strong>Line style:</strong> ${op.includes("=") ? "Solid (included)" : "Dashed (excluded)"}</p>
                    <p><strong>Test (0,0):</strong> ${testResult} ${op} ${c} is ${isSatisfied ? "✓ true" : "✗ false"}</p>
                    <p><strong>Solution region:</strong> ${isSatisfied ? "Contains origin" : "Does not contain origin"}</p>
                `;
            }
            
            calculateBtn.addEventListener("click", drawInequality);
            
            // Add real-time updates
            exprInput.addEventListener("input", drawInequality);
            
            // Handle window resize
            window.addEventListener("resize", () => {
                const dpr = window.devicePixelRatio || 1;
                canvas.width = canvas.offsetWidth * dpr;
                canvas.height = 300 * dpr;
                ctx.scale(dpr, dpr);
                drawInequality();
            });
            
            drawInequality(); // Initial draw
        }
    }
    
    // Systems of Equations Solver
    const systemsSolver = document.getElementById("systems-solver");
    if (systemsSolver) {
        const a1 = systemsSolver.querySelector("#sys-a1");
        const b1 = systemsSolver.querySelector("#sys-b1");
        const c1 = systemsSolver.querySelector("#sys-c1");
        const a2 = systemsSolver.querySelector("#sys-a2");
        const b2 = systemsSolver.querySelector("#sys-b2");
        const c2 = systemsSolver.querySelector("#sys-c2");
        const methodSelect = systemsSolver.querySelector("#sys-method");
        const calculateBtn = systemsSolver.querySelector("#sys-calculate-btn");
        const canvas = systemsSolver.querySelector("#sys-canvas");
        const resultsDiv = systemsSolver.querySelector("#sys-results");
        
        if (calculateBtn && canvas) {
            const ctx = canvas.getContext("2d");
            
            function drawSystem(a1, b1, c1, a2, b2, c2, x, y) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw background
                ctx.fillStyle = "rgba(15, 24, 37, 0.6)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw axes
                ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, canvas.height / 2);
                ctx.lineTo(canvas.width, canvas.height / 2);
                ctx.moveTo(canvas.width / 2, 0);
                ctx.lineTo(canvas.width / 2, canvas.height);
                ctx.stroke();
                
                // Draw line 1
                ctx.strokeStyle = "#4a90e2";
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let x = -10; x <= 10; x += 0.1) {
                    const y = (c1 - a1 * x) / b1;
                    const canvasX = canvas.width / 2 + x * 20;
                    const canvasY = canvas.height / 2 - y * 20;
                    if (x === -10) ctx.moveTo(canvasX, canvasY);
                    else ctx.lineTo(canvasX, canvasY);
                }
                ctx.stroke();
                
                // Draw line 2
                ctx.strokeStyle = "#50c878";
                ctx.beginPath();
                for (let x = -10; x <= 10; x += 0.1) {
                    const y = (c2 - a2 * x) / b2;
                    const canvasX = canvas.width / 2 + x * 20;
                    const canvasY = canvas.height / 2 - y * 20;
                    if (x === -10) ctx.moveTo(canvasX, canvasY);
                    else ctx.lineTo(canvasX, canvasY);
                }
                ctx.stroke();
                
                // Draw intersection point
                if (x !== null && y !== null) {
                    const canvasX = canvas.width / 2 + x * 20;
                    const canvasY = canvas.height / 2 - y * 20;
                    ctx.fillStyle = "#ff6b6b";
                    ctx.beginPath();
                    ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
            
            calculateBtn.addEventListener("click", function() {
                const a1v = parseFloat(a1.value) || 0;
                const b1v = parseFloat(b1.value) || 0;
                const c1v = parseFloat(c1.value) || 0;
                const a2v = parseFloat(a2.value) || 0;
                const b2v = parseFloat(b2.value) || 0;
                const c2v = parseFloat(c2.value) || 0;
                const method = methodSelect.value;
                
                // Solve using elimination
                const det = a1v * b2v - a2v * b1v;
                
                if (Math.abs(det) < 0.0001) {
                    resultsDiv.innerHTML = "<p><strong>No unique solution:</strong> Lines are parallel or coincident.</p>";
                    drawSystem(a1v, b1v, c1v, a2v, b2v, c2v, null, null);
                    return;
                }
                
                const x = (c1v * b2v - c2v * b1v) / det;
                const y = (a1v * c2v - a2v * c1v) / det;
                
                drawSystem(a1v, b1v, c1v, a2v, b2v, c2v, x, y);
                
                resultsDiv.innerHTML = `
                    <p><strong>System:</strong> ${a1v}x + ${b1v}y = ${c1v} and ${a2v}x + ${b2v}y = ${c2v}</p>
                    <p><strong>Solution:</strong> x = ${x.toFixed(2)}, y = ${y.toFixed(2)}</p>
                    <p><strong>Verification:</strong> ${a1v}(${x.toFixed(2)}) + ${b1v}(${y.toFixed(2)}) = ${(a1v * x + b1v * y).toFixed(2)} ✓</p>
                `;
            });
        }
    }
    
    // Three-Variable System Solver
    const threeVarSolver = document.getElementById("three-var-solver");
    if (threeVarSolver) {
        const a1 = threeVarSolver.querySelector("#t3-a1");
        const b1 = threeVarSolver.querySelector("#t3-b1");
        const c1 = threeVarSolver.querySelector("#t3-c1");
        const d1 = threeVarSolver.querySelector("#t3-d1");
        const a2 = threeVarSolver.querySelector("#t3-a2");
        const b2 = threeVarSolver.querySelector("#t3-b2");
        const c2 = threeVarSolver.querySelector("#t3-c2");
        const d2 = threeVarSolver.querySelector("#t3-d2");
        const a3 = threeVarSolver.querySelector("#t3-a3");
        const b3 = threeVarSolver.querySelector("#t3-b3");
        const c3 = threeVarSolver.querySelector("#t3-c3");
        const d3 = threeVarSolver.querySelector("#t3-d3");
        const calculateBtn = threeVarSolver.querySelector("#t3-calculate-btn");
        const resultsDiv = threeVarSolver.querySelector("#t3-results");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const a1v = parseFloat(a1.value) || 0;
                const b1v = parseFloat(b1.value) || 0;
                const c1v = parseFloat(c1.value) || 0;
                const d1v = parseFloat(d1.value) || 0;
                const a2v = parseFloat(a2.value) || 0;
                const b2v = parseFloat(b2.value) || 0;
                const c2v = parseFloat(c2.value) || 0;
                const d2v = parseFloat(d2.value) || 0;
                const a3v = parseFloat(a3.value) || 0;
                const b3v = parseFloat(b3.value) || 0;
                const c3v = parseFloat(c3.value) || 0;
                const d3v = parseFloat(d3.value) || 0;
                
                // Solve using Gaussian elimination (simplified)
                // This is a basic implementation for demonstration
                try {
                    // Using Cramer's rule for 3x3 system
                    const det = a1v * (b2v * c3v - b3v * c2v) - b1v * (a2v * c3v - a3v * c2v) + c1v * (a2v * b3v - a3v * b2v);
                    
                    if (Math.abs(det) < 0.0001) {
                        resultsDiv.innerHTML = "<p><strong>No unique solution:</strong> System is dependent or inconsistent.</p>";
                        return;
                    }
                    
                    const x = (d1v * (b2v * c3v - b3v * c2v) - b1v * (d2v * c3v - d3v * c2v) + c1v * (d2v * b3v - d3v * b2v)) / det;
                    const y = (a1v * (d2v * c3v - d3v * c2v) - d1v * (a2v * c3v - a3v * c2v) + c1v * (a2v * d3v - a3v * d2v)) / det;
                    const z = (a1v * (b2v * d3v - b3v * d2v) - b1v * (a2v * d3v - a3v * d2v) + d1v * (a2v * b3v - a3v * b2v)) / det;
                    
                    resultsDiv.innerHTML = `
                        <p><strong>System:</strong></p>
                        <p>${a1v}x + ${b1v}y + ${c1v}z = ${d1v}</p>
                        <p>${a2v}x + ${b2v}y + ${c2v}z = ${d2v}</p>
                        <p>${a3v}x + ${b3v}y + ${c3v}z = ${d3v}</p>
                        <p><strong>Solution:</strong> x = ${x.toFixed(2)}, y = ${y.toFixed(2)}, z = ${z.toFixed(2)}</p>
                    `;
                } catch (e) {
                    resultsDiv.innerHTML = "<p>Error solving system. Please check the coefficients.</p>";
                }
            });
        }
    }
    
    // Mixture Problem Solver
    const mixtureSolver = document.getElementById("mixture-solver");
    if (mixtureSolver) {
        const totalInput = mixtureSolver.querySelector("#mix-total");
        const c1Input = mixtureSolver.querySelector("#mix-c1");
        const c2Input = mixtureSolver.querySelector("#mix-c2");
        const desiredInput = mixtureSolver.querySelector("#mix-desired");
        const calculateBtn = mixtureSolver.querySelector("#mix-calculate-btn");
        const resultsDiv = mixtureSolver.querySelector("#mix-results");
        
        if (calculateBtn) {
            calculateBtn.addEventListener("click", function() {
                const total = parseFloat(totalInput.value) || 0;
                const c1 = parseFloat(c1Input.value) || 0;
                const c2 = parseFloat(c2Input.value) || 0;
                const desired = parseFloat(desiredInput.value) || 0;
                
                // x + y = total
                // c1*x + c2*y = desired * total
                // y = total - x
                // c1*x + c2*(total - x) = desired * total
                // x*(c1 - c2) = total*(desired - c2)
                // x = total*(desired - c2) / (c1 - c2)
                
                if (c1 === c2) {
                    resultsDiv.innerHTML = "<p>Both concentrations are the same. Any mixture works!</p>";
                    return;
                }
                
                const x = total * (desired - c2) / (c1 - c2);
                const y = total - x;
                
                resultsDiv.innerHTML = `
                    <p><strong>Problem:</strong> Mix ${total} units of solutions with ${c1}% and ${c2}% concentrations to get ${desired}%.</p>
                    <p><strong>Solution:</strong></p>
                    <p>Amount of ${c1}% solution: ${x.toFixed(2)} units</p>
                    <p>Amount of ${c2}% solution: ${y.toFixed(2)} units</p>
                <p><strong>Verification:</strong> (${x.toFixed(2)} × ${c1} + ${y.toFixed(2)} × ${c2}) / ${total} = ${((x * c1 + y * c2) / total).toFixed(2)}%</p>
                `;
             });
        }
    }
    
    // Quadratic Function Grapher
    const quadraticGrapherSim = document.getElementById("quadratic-sim");
    if (quadraticGrapherSim) {
        const aInput = quadraticGrapherSim.querySelector("#qa-input");
        const bInput = quadraticGrapherSim.querySelector("#qb-input");
        const cInput = quadraticGrapherSim.querySelector("#qc-input");
        const calculateBtn = quadraticGrapherSim.querySelector("#qcalculate-btn");
        const canvas = quadraticGrapherSim.querySelector("#quadratic-canvas");
        const resultsDiv = quadraticGrapherSim.querySelector("#quadratic-results");
        
        if (canvas) {
            const ctx = canvas.getContext("2d");
            
            function drawQuadratic() {
                const a = parseFloat(aInput.value) || 1;
                const b = parseFloat(bInput.value) || 0;
                const c = parseFloat(cInput.value) || 0;
                
                const width = canvas.offsetWidth;
                const height = 300;
                const dpr = window.devicePixelRatio || 1;
                
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                ctx.scale(dpr, dpr);
                
                // Clear and draw background
                ctx.clearRect(0, 0, width, height);
                const gradient = ctx.createLinearGradient(0, 0, 0, height);
                gradient.addColorStop(0, "#0d1520");
                gradient.addColorStop(1, "#111824");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                
                // Draw grid
                ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
                ctx.lineWidth = 1;
                for (let i = 0; i <= 10; i++) {
                    const x = (i / 10) * width;
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                for (let i = 0; i <= 10; i++) {
                    const y = (i / 10) * height;
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
                
                // Draw axes
                ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, height / 2);
                ctx.lineTo(width, height / 2);
                ctx.moveTo(width / 2, 0);
                ctx.lineTo(width / 2, height);
                ctx.stroke();
                
                // Calculate vertex
                const vertexX = -b / (2 * a);
                const vertexY = a * vertexX * vertexX + b * vertexX + c;
                
                // Calculate discriminant and roots
                const discriminant = b * b - 4 * a * c;
                let roots = [];
                if (discriminant >= 0) {
                    roots = [
                        (-b + Math.sqrt(discriminant)) / (2 * a),
                        (-b - Math.sqrt(discriminant)) / (2 * a)
                    ];
                }
                
                // Draw parabola
                ctx.shadowColor = "rgba(140, 200, 255, 0.4)";
                ctx.shadowBlur = 12;
                ctx.strokeStyle = "#8cc8ff";
                ctx.lineWidth = 3;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                
                ctx.beginPath();
                for (let x = -10; x <= 10; x += 0.1) {
                    const y = a * x * x + b * x + c;
                    const canvasX = width / 2 + x * 20;
                    const canvasY = height / 2 - y * 10;
                    if (x === -10) ctx.moveTo(canvasX, canvasY);
                    else ctx.lineTo(canvasX, canvasY);
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                // Draw vertex
                const vertexCanvasX = width / 2 + vertexX * 20;
                const vertexCanvasY = height / 2 - vertexY * 10;
                ctx.fillStyle = "#ff6b6b";
                ctx.beginPath();
                ctx.arc(vertexCanvasX, vertexCanvasY, 6, 0, 2 * Math.PI);
                ctx.fill();
                
                // Draw roots
                roots.forEach(root => {
                    const rootCanvasX = width / 2 + root * 20;
                    const rootCanvasY = height / 2;
                    ctx.fillStyle = "#5cb85c";
                    ctx.beginPath();
                    ctx.arc(rootCanvasX, rootCanvasY, 5, 0, 2 * Math.PI);
                    ctx.fill();
                });
                
                // Update results
                let rootsText = "";
                if (discriminant > 0) {
                    rootsText = `Two real roots: x = ${roots[0].toFixed(2)} and x = ${roots[1].toFixed(2)}`;
                } else if (discriminant === 0) {
                    rootsText = `One real root (vertex on x-axis): x = ${roots[0].toFixed(2)}`;
                } else {
                    rootsText = "No real roots (parabola doesn't cross x-axis)";
                }
                
                resultsDiv.innerHTML = `
                    <p><strong>Function:</strong> f(x) = ${a}x² + ${b}x + ${c}</p>
                    <p><strong>Vertex:</strong> (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})</p>
                    <p><strong>Axis of Symmetry:</strong> x = ${vertexX.toFixed(2)}</p>
                    <p><strong>Direction:</strong> ${a > 0 ? "Opens upward" : "Opens downward"}</p>
                    <p><strong>Discriminant:</strong> ${discriminant.toFixed(2)}</p>
                    <p><strong>Roots:</strong> ${rootsText}</p>
                `;
            }
            
            [aInput, bInput, cInput].forEach(input => {
                if (input) input.addEventListener("input", drawQuadratic);
            });
            
            if (calculateBtn) calculateBtn.addEventListener("click", drawQuadratic);
            
            // Initial draw
            drawQuadratic();
        }
    }
    
}

// End of script.js
