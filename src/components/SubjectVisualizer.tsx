import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Zap, Sliders, CheckCircle2, Info, Code, Compass, Activity } from 'lucide-react';
import katex from 'katex';

interface SubjectVisualizerProps {
  visualType: 'none' | 'math-graph' | 'physics-circuit' | 'biology-cell' | 'history-timeline' | 'code-sandbox';
  visualData?: any;
}

export const SubjectVisualizer: React.FC<SubjectVisualizerProps> = ({ visualType, visualData }) => {
  // 1. Physics Circuit State (Ohm's Law interactive simulation)
  const [voltage, setVoltage] = useState<number>(visualData?.voltage || 12);
  const [resistance, setResistance] = useState<number>(visualData?.resistance || 20);
  const current = Number((voltage / (resistance || 1)).toFixed(2));
  const power = Number((voltage * current).toFixed(1));

  // 2. Math Graph State (ax² + bx + c)
  const [aCoeff, setACoeff] = useState<number>(visualData?.a ?? 1);
  const [bCoeff, setBCoeff] = useState<number>(visualData?.b ?? -2);
  const [cCoeff, setCCoeff] = useState<number>(visualData?.c ?? -3);
  const mathCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3. Biology Hotspot State
  const [selectedOrganelle, setSelectedOrganelle] = useState<string>('mitochondria');

  // 4. Code Sandbox State
  const [codeSnippet, setCodeSnippet] = useState<string>(
    visualData?.code ||
      `// Interactive Counter Demo\nlet count = 0;\nfunction increment() {\n  count += 1;\n  console.log("Current Count:", count);\n}\nincrement();\nincrement();`
  );
  const [codeOutput, setCodeOutput] = useState<string>('Current Count: 1\nCurrent Count: 2');
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);

  // Math Canvas Rendering Loop
  useEffect(() => {
    if (visualType !== 'math-graph' || !mathCanvasRef.current) return;
    const canvas = mathCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    const originX = width / 2;
    const originY = height / 2;
    const scale = 25; // 25px per unit

    // X and Y axes
    ctx.beginPath();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Draw Parabola: y = a x^2 + b x + c
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;

    for (let px = 0; px <= width; px += 2) {
      const mathX = (px - originX) / scale;
      const mathY = aCoeff * mathX * mathX + bCoeff * mathX + cCoeff;
      const py = originY - mathY * scale;

      if (px === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Mark Vertex: x = -b / 2a
    if (aCoeff !== 0) {
      const vx = -bCoeff / (2 * aCoeff);
      const vy = aCoeff * vx * vx + bCoeff * vx + cCoeff;
      const vPx = originX + vx * scale;
      const vPy = originY - vy * scale;

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(vPx, vPy, 6, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Vertex (${vx.toFixed(1)}, ${vy.toFixed(1)})`, vPx + 8, vPy - 8);
    }
  }, [visualType, aCoeff, bCoeff, cCoeff]);

  // Execute sandboxed code
  const handleRunCode = () => {
    setIsRunningCode(true);
    let logs: string[] = [];
    try {
      const mockConsole = {
        log: (...args: any[]) => logs.push(args.join(' ')),
        error: (...args: any[]) => logs.push('❌ ' + args.join(' ')),
        warn: (...args: any[]) => logs.push('⚠️ ' + args.join(' '))
      };
      const runFn = new Function('console', codeSnippet);
      runFn(mockConsole);
      setCodeOutput(logs.join('\n') || 'Program executed with no console output.');
    } catch (err: any) {
      setCodeOutput('Runtime Error: ' + err.message);
    } finally {
      setTimeout(() => setIsRunningCode(false), 300);
    }
  };

  if (visualType === 'none') {
    return null;
  }

  // --- 1. PHYSICS CIRCUIT VISUALIZER ---
  if (visualType === 'physics-circuit') {
    return (
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="font-bold text-slate-100 text-sm tracking-wide uppercase">
              Interactive Lab: Ohm's Law Circuit
            </span>
          </div>
          <span className="text-xs bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2.5 py-1 rounded-full font-mono">
            V = I × R
          </span>
        </div>

        {/* Live Schematic Canvas */}
        <div className="relative bg-slate-950/80 border border-slate-800 rounded-xl p-6 h-56 flex items-center justify-center overflow-hidden">
          {/* Animated Electron Particle Flow Tracks */}
          <div className="absolute inset-4 border-2 border-dashed border-sky-500/40 rounded-lg pointer-events-none" />

          {/* Current Animation Indicators */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-full border border-sky-500/40 shadow">
            <Activity className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: `${Math.max(0.4, 2.5 - current * 0.8)}s` }} />
            <span className="text-xs text-sky-300 font-mono font-bold">
              Current I = {current} A
            </span>
          </div>

          {/* Circuit Components Layout */}
          <div className="grid grid-cols-3 w-full max-w-md items-center text-center z-10">
            {/* Battery / Voltage Source */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-20 rounded-lg bg-gradient-to-b from-amber-600 to-amber-800 border-2 border-amber-400 flex flex-col justify-between p-2 shadow-lg shadow-amber-500/20">
                <span className="text-[10px] font-bold text-amber-200">+</span>
                <span className="text-xs font-mono font-black text-white">{voltage}V</span>
                <span className="text-[10px] font-bold text-amber-200">-</span>
              </div>
              <span className="text-xs text-slate-400 mt-2 font-medium">Battery (V)</span>
            </div>

            {/* Resistor Component */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-10 bg-slate-800 border-2 border-rose-500 rounded flex items-center justify-center px-1 shadow-lg shadow-rose-500/20">
                <span className="text-xs font-mono font-bold text-rose-300">{resistance} Ω</span>
              </div>
              <span className="text-xs text-slate-400 mt-2 font-medium">Resistor (R)</span>
            </div>

            {/* Glowing Load (Bulb) */}
            <div className="flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-xl"
                style={{
                  backgroundColor: `rgba(250, 204, 21, ${Math.min(1, power / 40)})`,
                  borderColor: power > 5 ? '#facc15' : '#475569',
                  boxShadow: `0 0 ${Math.min(35, power * 1.5)}px rgba(250, 204, 21, ${Math.min(0.9, power / 30)})`
                }}
              >
                <Zap
                  className="w-7 h-7"
                  style={{ color: power > 5 ? '#78350f' : '#64748b' }}
                />
              </div>
              <span className="text-xs text-slate-400 mt-2 font-medium">Power: {power} W</span>
            </div>
          </div>
        </div>

        {/* Interactive Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div>
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="text-slate-300">Potential Difference (Voltage, V):</span>
              <span className="font-mono text-amber-400 font-bold">{voltage} Volts</span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={voltage}
              onChange={(e) => setVoltage(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-[11px] text-slate-500">More voltage pushes more charge through the wire.</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="text-slate-300">Resistance (Opposition, R):</span>
              <span className="font-mono text-rose-400 font-bold">{resistance} Ohms (Ω)</span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              value={resistance}
              onChange={(e) => setResistance(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <span className="text-[11px] text-slate-500">Notice: higher resistance strictly reduces current!</span>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. MATHEMATICS PARABOLA VISUALIZER ---
  if (visualType === 'math-graph') {
    const discriminant = bCoeff * bCoeff - 4 * aCoeff * cCoeff;
    return (
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <span className="font-bold text-slate-100 text-sm tracking-wide uppercase">
              Interactive Coordinate Geometry: Quadratic Parabola
            </span>
          </div>
          <span className="text-xs bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded-full font-mono">
            f(x) = {aCoeff}x² {bCoeff >= 0 ? `+ ${bCoeff}` : bCoeff}x {cCoeff >= 0 ? `+ ${cCoeff}` : cCoeff}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <canvas
            ref={mathCanvasRef}
            width={380}
            height={220}
            className="w-full md:w-[380px] h-[220px] bg-slate-950 rounded-xl border border-slate-800 shadow-inner"
          />

          <div className="flex-1 w-full space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Coefficient 'a' (Curvature & Orientation):</span>
                <span className="font-mono text-sky-400 font-bold">{aCoeff}</span>
              </div>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.5"
                value={aCoeff}
                onChange={(e) => setACoeff(Number(e.target.value) || 0.1)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Coefficient 'b' (Linear Axis Shift):</span>
                <span className="font-mono text-emerald-400 font-bold">{bCoeff}</span>
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                value={bCoeff}
                onChange={(e) => setBCoeff(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Constant 'c' (Vertical y-intercept):</span>
                <span className="font-mono text-purple-400 font-bold">{cCoeff}</span>
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                value={cCoeff}
                onChange={(e) => setCCoeff(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Discriminant Δ = b² - 4ac:</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded ${
                  discriminant > 0
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : discriminant === 0
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {discriminant.toFixed(1)} ({discriminant > 0 ? '2 Real Roots' : discriminant === 0 ? '1 Tangent Root' : 'No Real Roots'})
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. BIOLOGY CELL ORGANELLES VISUALIZER ---
  if (visualType === 'biology-cell') {
    const organelleInfo: Record<string, { title: string; role: string; bioEnergy: string }> = {
      mitochondria: {
        title: 'Mitochondria (Powerhouse of the Cell)',
        role: 'Site of the Citric Acid Cycle and Oxidative Phosphorylation. Synthesizes ~32 ATP per glucose molecule.',
        bioEnergy: 'Inner membrane cristae host the Electron Transport Chain and ATP Synthase motor.'
      },
      nucleus: {
        title: 'Cell Nucleus & Chromatin',
        role: 'Houses the genomic DNA code and orchestrates transcriptional RNA synthesis.',
        bioEnergy: 'Enclosed by a double nuclear membrane with regulatory pore complexes.'
      },
      ribosome: {
        title: 'Ribosomes (Protein Synthesis Factories)',
        role: 'Translates messenger RNA (mRNA) sequences into polypeptide amino acid chains.',
        bioEnergy: 'Can be free-floating in cytosol or anchored onto the Rough Endoplasmic Reticulum.'
      }
    };

    const currentData = organelleInfo[selectedOrganelle] || organelleInfo.mitochondria;

    return (
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-slate-100 text-sm tracking-wide uppercase">
              Interactive Cellular Diagram & Organelle Inspector
            </span>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-mono">
            Eukaryotic Bioenergetics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Interactive Cell SVG Graphic */}
          <div className="md:col-span-2 relative bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-center justify-center">
            <svg viewBox="0 0 400 240" className="w-full h-56">
              {/* Outer Cell Membrane */}
              <ellipse cx="200" cy="120" rx="180" ry="100" fill="#0f172a" stroke="#10b981" strokeWidth="3" strokeDasharray="6 3" />
              {/* Cytosol fill */}
              <ellipse cx="200" cy="120" rx="174" ry="94" fill="#064e3b" fillOpacity="0.25" />

              {/* Nucleus */}
              <g
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => setSelectedOrganelle('nucleus')}
              >
                <circle cx="140" cy="120" r="42" fill="#4338ca" stroke="#818cf8" strokeWidth="2.5" />
                <circle cx="140" cy="120" r="16" fill="#1e1b4b" />
                <text x="140" y="124" fill="#e0e7ff" fontSize="10" fontWeight="bold" textAnchor="middle">Nucleus</text>
              </g>

              {/* Mitochondria 1 (Primary) */}
              <g
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => setSelectedOrganelle('mitochondria')}
              >
                <ellipse cx="270" cy="90" rx="40" ry="22" fill="#b45309" stroke="#f59e0b" strokeWidth="3" transform="rotate(-15 270 90)" />
                {/* Cristae folds */}
                <path d="M 245 92 Q 255 82 265 92 T 285 92 T 295 92" stroke="#fef08a" strokeWidth="2" fill="none" transform="rotate(-15 270 90)" />
                <text x="270" y="94" fill="#fef3c7" fontSize="9" fontWeight="bold" textAnchor="middle">Mitochondria</text>
              </g>

              {/* Mitochondria 2 */}
              <g
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => setSelectedOrganelle('mitochondria')}
              >
                <ellipse cx="250" cy="165" rx="34" ry="18" fill="#b45309" stroke="#f59e0b" strokeWidth="2" transform="rotate(20 250 165)" />
                <path d="M 230 165 Q 240 157 250 165 T 270 165" stroke="#fef08a" strokeWidth="1.5" fill="none" transform="rotate(20 250 165)" />
              </g>

              {/* Ribosomes (Dots) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedOrganelle('ribosome')}
              >
                <circle cx="190" cy="65" r="4" fill="#38bdf8" />
                <circle cx="205" cy="70" r="4" fill="#38bdf8" />
                <circle cx="180" cy="180" r="4" fill="#38bdf8" />
                <circle cx="160" cy="190" r="4" fill="#38bdf8" />
                <text x="185" y="198" fill="#7dd3fc" fontSize="9" textAnchor="middle">Ribosomes</text>
              </g>
            </svg>
          </div>

          {/* Details Inspector Panel */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2">
                <Info className="w-3.5 h-3.5" />
                Organelle Focus
              </div>
              <h4 className="text-sm font-bold text-white mb-2">{currentData.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{currentData.role}</p>
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-2.5">
                <span className="text-[10px] text-emerald-300 font-semibold block uppercase">Mechanism:</span>
                <p className="text-xs text-slate-200 mt-0.5">{currentData.bioEnergy}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSelectedOrganelle('mitochondria')}
                className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition ${
                  selectedOrganelle === 'mitochondria' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Mitochondria
              </button>
              <button
                onClick={() => setSelectedOrganelle('nucleus')}
                className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition ${
                  selectedOrganelle === 'nucleus' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Nucleus
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 4. PROGRAMMING CODE SANDBOX VISUALIZER ---
  if (visualType === 'code-sandbox') {
    return (
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-slate-100 text-sm tracking-wide uppercase">
              Live Code Sandbox & Execution Tracer
            </span>
          </div>
          <button
            onClick={handleRunCode}
            disabled={isRunningCode}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunningCode ? 'Executing...' : 'Run Code'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Code Editor */}
          <div className="flex flex-col">
            <span className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
              <span>script.js</span>
            </span>
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 font-mono text-xs text-sky-300 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none selection:bg-indigo-700"
              spellCheck={false}
            />
          </div>

          {/* Execution Output */}
          <div className="flex flex-col">
            <span className="text-[11px] font-mono text-slate-400 mb-1">Execution Terminal Output:</span>
            <div className="flex-1 bg-black/80 rounded-xl border border-slate-800 p-3 font-mono text-xs text-emerald-400 whitespace-pre-wrap overflow-y-auto min-h-[140px]">
              {codeOutput}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 5. HISTORY TIMELINE VISUALIZER ---
  if (visualType === 'history-timeline') {
    const events = [
      { year: '1789', title: 'Outbreak of Revolution', desc: 'Storming of the Bastille in Paris and collapse of absolute monarchy.' },
      { year: '1793', title: 'Reign of Terror', desc: 'Jacobin governance and radical sociopolitical restructuring under Robespierre.' },
      { year: '1799', title: 'Rise of Napoleon', desc: 'Coup of 18 Brumaire establishes the French Consulate and legal codification.' },
      { year: '1815', title: 'Congress of Vienna', desc: 'Post-Napoleonic European balance of power treaty restoration.' }
    ];

    return (
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-slate-100 text-sm tracking-wide uppercase">
              Visual Chronology & Causal Epochs
            </span>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-mono">
            Historical Trajectory
          </span>
        </div>

        <div className="relative border-l-2 border-amber-500/40 ml-4 pl-6 space-y-5 my-2">
          {events.map((ev, i) => (
            <div key={i} className="relative group">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-slate-900 shadow" />
              <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl hover:border-amber-500/40 transition">
                <span className="text-xs font-mono font-bold text-amber-400">{ev.year}</span>
                <h4 className="text-sm font-semibold text-slate-100">{ev.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{ev.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
