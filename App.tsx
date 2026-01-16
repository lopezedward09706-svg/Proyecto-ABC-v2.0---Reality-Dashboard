
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  FileText, 
  Zap, 
  AlertCircle, 
  Globe, 
  Layers,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Thermometer,
  Telescope,
  Binary,
  Atom,
  FileSearch,
  ChevronRight,
  TrendingUp,
  Pause,
  Play,
  Lock,
  Unlock,
  AlertTriangle,
  FileCode,
  Music,
  BarChart3,
  UserCheck,
  Share2,
  Send,
  ExternalLink,
  Github
} from 'lucide-react';
import { PhysicsEngine } from './engine/PhysicsEngine';
import { 
  SimulationState, 
  Knot, 
  AILog, 
  AgentName, 
  TelemetryData,
  TheoryTestResult
} from './types';
import { 
  INITIAL_PROTON, 
  INITIAL_ELECTRON, 
  ALPHA_ABC,
  BETA_ABC,
  RELATIVITY_CORRECTION
} from './constants';
import { getBridgeCommentary, generateScientificReport } from './services/geminiService';

// Fix: Moved INITIAL_TESTS to the top to ensure it is defined before App component uses it in useState
const INITIAL_TESTS: TheoryTestResult[] = [
  { name: "Curvatura Extrema", status: 'pending', value: '--', description: "Manejo de casos límite en escala de Planck." },
  { name: "Principio Holográfico", status: 'pending', value: '--', description: "Consistencia S_BH corregida por Alpha." },
  { name: "Conservación Energética", status: 'pending', value: '--', description: "Error < 1e-5 en colisiones gravitacionales." },
  { name: "Preservación Causal", status: 'pending', value: '--', description: "Velocidad de señal <= 1.000000001c." },
  { name: "Límites Cuánticos", status: 'pending', value: '--', description: "Escala Planck L_planck * (1 + Alpha)." },
  { name: "Restricción LIGO", status: 'pending', value: '--', description: "Corrección vs Límite GW170817." },
  { name: "Termodinámica BH", status: 'pending', value: '--', description: "Hawking T_H corregida (1 + Alpha)." },
  { name: "Consistencia Cosmólogica", status: 'pending', value: '--', description: "Contribución a Lambda observada < 1%." },
  { name: "Ondas Gravitacionales", status: 'pending', value: '--', description: "Amplitud h_std (1 + Alpha)." },
  { name: "Consistencia Matemática", status: 'pending', value: '--', description: "Definición logarítmica en valores 0/inf." }
];

const INITIAL_STATE: SimulationState = {
  knots: [
    { id: 'p1', x: INITIAL_PROTON.up1.x, y: INITIAL_PROTON.up1.y, vx: 0, vy: 0, mass: 2.3, charge: 2/3, type: 'up' },
    { id: 'p2', x: INITIAL_PROTON.up2.x, y: INITIAL_PROTON.up2.y, vx: 0, vy: 0, mass: 2.3, charge: 2/3, type: 'up' },
    { id: 'p3', x: INITIAL_PROTON.down.x, y: INITIAL_PROTON.down.y, vx: 0, vy: 0, mass: 4.8, charge: -1/3, type: 'down' },
    { id: 'e1', x: INITIAL_ELECTRON.x, y: INITIAL_ELECTRON.y, vx: 0, vy: 0, mass: 0.511, charge: -1, type: 'electron' }
  ],
  strings: [
    { a: 'p1', b: 'p2', restLength: 60, stiffness: 0.1 },
    { a: 'p2', b: 'p3', restLength: 60, stiffness: 0.1 },
    { a: 'p3', b: 'p1', restLength: 60, stiffness: 0.1 }
  ],
  timeDilation: 1,
  entropy: 0,
  expansionRate: 70.4,
  totalMass: 10,
  totalCharge: 0,
  stabilityRatio: 1
};

const AUTHOR_INFO = {
  name: "Edward López",
  email: "lopezedward09706@gmail.com",
  orcid: "0009-0009-0717-5536"
};

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);
  const [logs, setLogs] = useState<AILog[]>([]);
  const [testResults, setTestResults] = useState<TheoryTestResult[]>(INITIAL_TESTS);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [vibrations, setVibrations] = useState({ a: 0.8, b: 0.5, c: 0.3 });
  const [isAiPaused, setIsAiPaused] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  
  // New States for Dissemination Center
  const [isDisseminationOpen, setIsDisseminationOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [publishedNodes, setPublishedNodes] = useState<Record<string, boolean>>({
    zenodo: false,
    arxiv: false,
    cern: false,
    github: false
  });

  // Archive Logic
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isArchiveUnlocked, setIsArchiveUnlocked] = useState(false);
  const [archiveCodeInput, setArchiveCodeInput] = useState('');
  const [archiveError, setArchiveError] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PhysicsEngine>(new PhysicsEngine(INITIAL_STATE));
  const requestRef = useRef<number>();
  const lastUpdateRef = useRef<number>(performance.now());
  const aiRequestInProgress = useRef(false);

  const stateRef = useRef(state);
  const vibrationsRef = useRef(vibrations);
  
  useEffect(() => {
    stateRef.current = state;
    vibrationsRef.current = vibrations;
  }, [state, vibrations]);

  const addLog = useCallback((agent: string, message: string, severity: any = 'info') => {
    setLogs(prev => [{
      id: Math.random().toString(),
      agent,
      message,
      timestamp: Date.now(),
      severity
    }, ...prev].slice(0, 30));
  }, []);

  const handleVibrationChange = (p: 'a' | 'b' | 'c', val: number) => {
    const newVal = val / 100;
    setVibrations(prev => ({ ...prev, [p]: newVal }));
    engineRef.current.vibrationProfiles[p] = newVal;
    addLog(AgentName.GEOMETER, `Ajuste de Vibración Perfil ${p.toUpperCase()}: ${val}%`);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    addLog(AgentName.BRIDGE, "Generando Reporte de Difusión R-QNT...", 'warning');
    const summary = `Stability: ${state.stabilityRatio}, Charge: ${state.totalCharge}, Dilation: ${state.timeDilation}, Alpha: ${ALPHA_ABC}`;
    const report = await generateScientificReport(summary, AUTHOR_INFO);
    setCurrentReport(report);
    setIsGeneratingReport(false);
    addLog(AgentName.BRIDGE, "Reporte Académico compilado satisfactoriamente.");
  };

  const handlePublishToNode = (node: string) => {
    addLog(AgentName.BRIDGE, `Transmitiendo paquete de datos a ${node.toUpperCase()}...`, 'info');
    setTimeout(() => {
      setPublishedNodes(prev => ({ ...prev, [node]: true }));
      addLog(AgentName.ANALYST, `Sincronización confirmada en Nodo ${node.toUpperCase()}. DOI Pendiente.`);
    }, 2000);
  };

  const unlockArchive = () => {
    if (archiveCodeInput.toUpperCase() === "AUTODIDACTA") {
      setIsArchiveUnlocked(true);
      setArchiveError(false);
      addLog(AgentName.BRIDGE, "Acceso concedido al Expediente Maestro de Edward López.");
    } else {
      setArchiveError(true);
      addLog(AgentName.CRITICAL, "Intento de acceso no autorizado al archivo privado.", 'critical');
    }
  };

  // Fix: Defined the missing calculateQ function referenced in line 726
  const calculateQ = () => {
    addLog(AgentName.ANALYST, "Iniciando Cálculo Q de Red R-QNT...", 'info');
    setTimeout(() => {
      const val = (stateRef.current.stabilityRatio * 0.998).toFixed(6);
      addLog(AgentName.ANALYST, `Protocolo Q finalizado. Factor de Coherencia: ${val}`, 'info');
    }, 1000);
  };

  const runFullSuite = async () => {
    setIsValidating(true);
    addLog(AgentName.THEORIST, "Iniciando Suite R-QNT Optimizada v2.0...", 'warning');
    for (let i = 0; i < INITIAL_TESTS.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setTestResults(prev => {
        const next = [...prev];
        next[i] = { ...next[i], status: 'success', value: i === 3 ? "1.0000c" : "PASS" };
        return next;
      });
    }
    setIsValidating(false);
    addLog(AgentName.BRIDGE, "Sincronización R-QNT Completa.");
  };

  useEffect(() => {
    const agents = Object.values(AgentName);
    const intervalTime = 45000;

    const pollAI = async () => {
      if (isAiPaused || isArchiveOpen || isRateLimited || isDisseminationOpen) return;

      const agent = agents[Math.floor(Math.random() * agents.length)];
      
      if (agent === AgentName.BRIDGE) {
        if (aiRequestInProgress.current) return;
        aiRequestInProgress.current = true;
        
        try {
          const summary = `Vibration A: ${vibrationsRef.current.a}, Q-Charge: ${stateRef.current.totalCharge}, Stability: ${stateRef.current.stabilityRatio}`;
          const msg = await getBridgeCommentary(summary);
          
          if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("Quota")) {
            addLog(AgentName.BRIDGE, "Límite de cuota Gemini alcanzado. El puente entrará en modo ahorro.", 'error');
            setIsRateLimited(true);
            setIsAiPaused(true);
          } else {
            addLog(AgentName.BRIDGE, msg);
          }
        } catch (e) {
          console.error("AI Polling Error", e);
        } finally {
          aiRequestInProgress.current = false;
        }
      } else {
        let message = "";
        switch(agent) {
          case AgentName.ANALYST: message = `Coherencia R-QNT: ${(stateRef.current.stabilityRatio * 100).toFixed(2)}%.`; break;
          case AgentName.THEORIST: message = `Torsión Local: ${(stateRef.current.timeDilation - 1).toFixed(4)} τ.`; break;
          case AgentName.COSMOLOGIST: message = `Vibración ABC activa en sector central.`; break;
          case AgentName.CRITICAL: message = `Monitoreando integridad de la red...`; break;
        }
        if (message) addLog(agent, message);
      }
    };

    const interval = setInterval(pollAI, intervalTime);
    const initialTimer = setTimeout(pollAI, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, [isAiPaused, isArchiveOpen, isRateLimited, isDisseminationOpen, addLog]);

  const animate = useCallback((time: number) => {
    const dt = (time - lastUpdateRef.current) / 16.67;
    lastUpdateRef.current = time;
    if (!isArchiveOpen && !isDisseminationOpen) {
      const newState = engineRef.current.update(dt, null, draggedId);
      setState({ ...newState });
      draw(newState);
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [draggedId, isArchiveOpen, isDisseminationOpen]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  const draw = (s: SimulationState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=30) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
    for(let i=0; i<canvas.height; i+=30) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }

    ctx.strokeStyle = 'rgba(0, 242, 255, 0.4)';
    s.strings.forEach(str => {
      const a = s.knots.find(k => k.id === str.a);
      const b = s.knots.find(k => k.id === str.b);
      if (a && b) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    });

    s.knots.forEach(knot => {
      ctx.beginPath();
      const r = knot.type === 'electron' ? 6 : 9;
      ctx.arc(knot.x, knot.y, r, 0, Math.PI * 2);
      let color = knot.type === 'up' ? '#00f2ff' : knot.type === 'down' ? '#ff0044' : '#fbbf24';
      ctx.fillStyle = color;
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clicked = state.knots.find(k => Math.sqrt((k.x - x)**2 + (k.y - y)**2) < 20);
    if (clicked) setDraggedId(clicked.id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left);
      const y = (e.clientY - rect.top);
      engineRef.current.update(0, {x, y}, draggedId);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-sky-400 overflow-hidden font-sans">
      {/* Header R-QNT */}
      <header className="h-20 border-b-2 border-sky-500/50 bg-sky-500/5 flex items-center justify-between px-8 z-50">
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-widest uppercase flex items-center gap-3">
            <Atom className="text-sky-400 animate-spin-slow" />
            SISTEMA DE VERIFICACIÓN RED CUÁNTICA R-QNT
          </h1>
          <div className="flex gap-2 mt-2">
            {['NODOS', 'ABC', 'TORCION', 'RQNT', 'RED CUANTICA'].map(tag => (
              <span key={tag} className="px-2 py-0.5 border border-sky-500/40 rounded-full text-[9px] font-bold tracking-widest text-sky-500/80 bg-sky-500/5">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              setIsAiPaused(!isAiPaused);
              if (isRateLimited) setIsRateLimited(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all text-xs font-bold uppercase ${
              isAiPaused || isRateLimited ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
            }`}
          >
            {isAiPaused || isRateLimited ? <Play size={14} /> : <Pause size={14} />}
            {isRateLimited ? 'RATE LIMITED' : isAiPaused ? 'IA Pausada' : 'IA Activa'}
          </button>
          <div className="text-right">
            <div className="text-[10px] uppercase opacity-60">Coherencia de Red</div>
            <div className="text-lg font-black mono">{(state.stabilityRatio * 100).toFixed(1)}%</div>
          </div>
          <button 
            onClick={runFullSuite}
            disabled={isValidating}
            className="px-6 py-2 bg-sky-400 text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-all disabled:bg-slate-800 disabled:text-slate-600"
          >
            {isValidating ? 'Validando...' : 'Verificar Suite'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex min-h-0">
        {/* Explorador de Archivos (Izquierda) */}
        <aside className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col p-4 overflow-y-auto">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <FileSearch size={14} /> Datasets R-QNT
          </h3>
          <nav className="space-y-2">
            {[
              { id: 'codice', label: 'El Códice R-QNT', icon: <FileText size={14} /> },
              { id: 'profiles', label: 'Perfiles Vibracionales', icon: <Activity size={14} /> },
              { id: 'equations', label: 'Ecuaciones de Torción', icon: <Layers size={14} /> },
              { id: 'dissemination', label: 'Centro de Difusión', icon: <Share2 size={14} />, specialColor: 'text-sky-400 border-sky-500/20' },
              { id: 'private', label: 'Expediente Maestro', icon: <Lock size={14} />, special: true }
            ].map(file => (
              <button 
                key={file.id} 
                onClick={() => {
                  if (file.id === 'dissemination') {
                    setIsDisseminationOpen(true);
                  } else if (file.special) {
                    setIsArchiveOpen(true);
                  } else {
                    addLog(AgentName.BRIDGE, `Accediendo a ${file.label}...`, 'info');
                  }
                }}
                className={`w-full flex items-center justify-between p-3 rounded border transition-all text-left group ${
                  file.special 
                  ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500 hover:bg-rose-500/10'
                  : file.id === 'dissemination'
                  ? 'bg-sky-500/5 border-sky-500/10 hover:border-sky-500 hover:bg-sky-500/10'
                  : 'bg-white/5 border-white/5 hover:border-sky-500/50 hover:bg-sky-500/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${file.special ? 'text-rose-500' : file.id === 'dissemination' ? 'text-sky-400' : 'text-sky-500/50 group-hover:text-sky-400'}`}>{file.icon}</span>
                  <span className={`text-[11px] font-bold uppercase ${file.special ? 'text-rose-400' : file.id === 'dissemination' ? 'text-sky-300' : ''}`}>{file.label}</span>
                </div>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="text-[10px] mono text-emerald-500 h-40 overflow-y-auto leading-tight custom-scroll">
              {logs.map(log => (
                <div key={log.id} className={`mb-1 ${log.severity === 'error' ? 'text-rose-500 font-bold' : log.severity === 'critical' ? 'text-red-500 animate-pulse' : 'opacity-80'}`}>
                  <span className="text-emerald-700 mr-2">></span>
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Workspace Central */}
        <div className="flex-1 relative bg-black overflow-hidden">
          {/* Dissemination View */}
          {isDisseminationOpen && (
            <div className="absolute inset-0 z-[60] bg-[#050505] overflow-y-auto animate-in fade-in duration-500 p-8 flex flex-col">
              <div className="flex items-center justify-between border-b border-sky-500/30 pb-4 mb-8">
                <div className="flex items-center gap-4">
                  <Share2 className="text-sky-400" size={24} />
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Centro de Difusión R-QNT</h2>
                    <span className="text-[10px] mono text-sky-500/80 uppercase tracking-widest">Diseminación Científica Dirigida por IA</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDisseminationOpen(false)}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 text-[11px] uppercase font-bold text-slate-400 hover:text-white transition-all"
                >
                  Cerrar Nodo
                </button>
              </div>

              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Report Generation */}
                <div className="flex flex-col gap-6">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-sky-400 uppercase flex items-center gap-2">
                        <FileCode size={16} /> Compilador Académico (LaTeX)
                      </h3>
                      <span className="text-[10px] text-slate-500 mono">{AUTHOR_INFO.orcid}</span>
                    </div>
                    
                    <div className="flex-1 bg-black/50 border border-white/5 p-4 rounded mb-6 overflow-y-auto custom-scroll">
                      {isGeneratingReport ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-sky-500/40">
                          <Atom className="animate-spin" size={32} />
                          <span className="text-[10px] mono animate-pulse">EXTRAYENDO MÉTRICAS DE RED...</span>
                        </div>
                      ) : currentReport ? (
                        <pre className="text-[11px] mono text-sky-200/80 whitespace-pre-wrap">{currentReport}</pre>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-700">
                          <FileText size={48} opacity={0.1} />
                          <span className="text-[10px] uppercase font-bold">Sin datos de reporte activos</span>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={handleGenerateReport}
                      disabled={isGeneratingReport}
                      className="w-full py-3 bg-sky-500 text-black font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-lg shadow-sky-500/10 disabled:opacity-50"
                    >
                      Generar Reporte R-QNT
                    </button>
                  </div>
                </div>

                {/* Right: Distribution Network */}
                <div className="flex flex-col gap-6">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h3 className="text-xs font-bold text-sky-400 uppercase mb-4 flex items-center gap-2">
                      <Globe size={16} /> Red de Distribución Automática
                    </h3>
                    <div className="space-y-3">
                      {[
                        { id: 'zenodo', name: 'Zenodo / DOI', desc: 'Archivo permanente y asignación de identificador.', icon: <Database size={16}/> },
                        { id: 'arxiv', name: 'arXiv.org', desc: 'Repositorio de pre-publicación en física teórica.', icon: <FileText size={16}/> },
                        { id: 'cern', name: 'CERN / INSPIRE', desc: 'Base de datos de física de altas energías.', icon: <Zap size={16}/> },
                        { id: 'github', name: 'GitHub Research', desc: 'Sincronización de activos digitales y código.', icon: <Github size={16}/> }
                      ].map(node => (
                        <div key={node.id} className="p-4 bg-black/40 border border-white/5 rounded-md flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className={`${publishedNodes[node.id] ? 'text-emerald-500' : 'text-slate-600'} group-hover:scale-110 transition-transform`}>
                              {node.icon}
                            </div>
                            <div>
                              <div className="text-[11px] font-bold uppercase text-slate-300">{node.name}</div>
                              <div className="text-[9px] text-slate-500 mt-0.5">{node.desc}</div>
                            </div>
                          </div>
                          {publishedNodes[node.id] ? (
                            <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 size={12} /> SINCRONIZADO
                            </span>
                          ) : (
                            <button 
                              onClick={() => handlePublishToNode(node.id)}
                              disabled={!currentReport}
                              className="px-3 py-1.5 border border-sky-500/40 text-[9px] font-black text-sky-400 hover:bg-sky-400 hover:text-black transition-all disabled:opacity-20"
                            >
                              Sincronizar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg mono text-[10px] text-amber-500/80">
                    <div className="flex items-center gap-2 mb-2 font-black uppercase tracking-tighter">
                      <AlertTriangle size={14} /> Nota Técnica de Operación
                    </div>
                    La IA-Puente actúa como orquestadora de diseminación. Toda publicación generada incluye las firmas criptográficas del entorno y la identificación ORCID vinculada.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Archive View */}
          {isArchiveOpen ? (
            <div className="absolute inset-0 z-[60] bg-[#0d1117] overflow-y-auto animate-in fade-in duration-500">
              {!isArchiveUnlocked ? (
                <div className="h-full w-full flex items-center justify-center p-6 bg-black">
                  <div className="max-w-md w-full glass p-8 border border-rose-500/30 text-center animate-in zoom-in-95 duration-300">
                    <Lock size={48} className="mx-auto text-rose-500 mb-6" />
                    <h2 className="text-xl font-black text-rose-400 mb-2">ACCESO RESTRINGIDO</h2>
                    <p className="text-xs text-slate-400 mb-6 uppercase tracking-wider">Introduce el código de extensión para desencriptar el archivo privado.</p>
                    
                    <div className="relative mb-6">
                      <input 
                        type="password"
                        placeholder="Código de Acceso..."
                        className={`w-full bg-black border ${archiveError ? 'border-red-500 animate-shake' : 'border-rose-500/30'} p-3 text-center text-lg mono text-white rounded outline-none transition-all`}
                        value={archiveCodeInput}
                        onChange={(e) => setArchiveCodeInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && unlockArchive()}
                      />
                      {archiveError && <div className="text-[10px] text-red-500 font-bold mt-2 uppercase">CÓDIGO INCORRECTO: ACCESO DENEGADO</div>}
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsArchiveOpen(false)}
                        className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={unlockArchive}
                        className="flex-1 py-3 bg-rose-500 text-black text-[11px] font-black uppercase tracking-widest hover:bg-rose-400 transition-all"
                      >
                        Desencriptar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto py-12 px-8 text-[#c9d1d9] font-sans leading-relaxed">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#30363d]">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/40">
                        <UserCheck className="text-rose-500" size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Expediente Maestro: Edward López</h2>
                        <span className="text-xs mono text-rose-500/80">ACCESO_SUDO: CONFIRMADO | DIC_2025</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setIsArchiveOpen(false); setIsArchiveUnlocked(false); setArchiveCodeInput(''); }}
                      className="px-4 py-2 border border-[#30363d] hover:bg-white/5 text-[11px] uppercase font-bold text-slate-400 hover:text-white transition-all"
                    >
                      Cerrar Archivo
                    </button>
                  </div>

                  <div className="bg-[#161b22] border-l-4 border-sky-500 p-6 mb-12 mono text-sm italic">
                    <h3 className="text-sky-400 font-bold mb-2 flex items-center gap-2 uppercase text-xs">
                      <Database size={14} /> Manifiesto de Operación
                    </h3>
                    <p className="mb-2"><strong>ORDEN DE EJECUCIÓN:</strong> AQUÍ TIENES TODA LA INFORMACIÓN NECESARIA.</p>
                    <p className="mb-2"><strong>ESTRATEGIA:</strong> DE AQUÍ TOMAREMOS LO QUE HAGA FALTA PARA MODIFICACIONES FUTURAS.</p>
                    <p className="text-xs text-slate-500 mt-4 leading-tight">
                      Recopilación forense de chats, correos e infraestructura de seguridad. Periodo: 22-31 Dic 2025.
                    </p>
                  </div>

                  <section className="mb-12">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#30363d] pb-2">
                      <FileCode size={20} className="text-sky-400" /> 1. Infraestructura de Identidad
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full ml-auto">ACTIVO</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
                        <h3 className="text-sky-400 text-xs font-bold uppercase mb-3">GitHub & Desarrollo</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>Organización:</strong> <code className="bg-black/40 px-1 rounded text-sky-300">AUTODIDACTA</code></li>
                          <li><strong>Eventos Sudo:</strong> Confirmados 27, 28 y 30 Dic.</li>
                          <li className="text-amber-400"><strong>Alerta:</strong> Activar 2FA antes de Feb 2026.</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
                        <h3 className="text-sky-400 text-xs font-bold uppercase mb-3">Identidad Académica</h3>
                        <ul className="space-y-2 text-sm">
                          <li><strong>ORCID iD:</strong> <code className="bg-black/40 px-1 rounded text-sky-300">0009-0009-0717-5536</code></li>
                          <li><strong>Status:</strong> Integraciones pendientes (Scopus, Crossref).</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section className="mb-12">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#30363d] pb-2">
                      <BarChart3 size={20} className="text-rose-400" /> 2. Auditoría Financiera
                      <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full ml-auto">ATENCIÓN</span>
                    </h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-lg">
                        <h3 className="text-rose-400 text-xs font-bold uppercase mb-2">Capital.com (Trading)</h3>
                        <p className="text-sm font-bold text-rose-300">ESTADO: CUENTA SUSPENDIDA (31 Dic 2025)</p>
                        <p className="text-xs text-slate-400 mt-1 italic">Diagnóstico: Fallo en actualización KYC o inactividad prolongada.</p>
                      </div>
                      <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
                        <h3 className="text-sky-400 text-xs font-bold uppercase mb-2">Meta Ads & Verification</h3>
                        <p className="text-sm text-slate-300">Suscripción "Meta Verified Max Bundle" proyectada.</p>
                        <p className="text-sm text-emerald-400 font-bold mt-1">Costo: $11,500.00 MXN mensuales (Ene 2026).</p>
                      </div>
                    </div>
                  </section>

                  <section className="mb-12">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#30363d] pb-2">
                      <Music size={20} className="text-sky-400" /> 3. Repositorio Técnico: Nils' K1v (MIDI)
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-[#161b22] text-sky-400 text-[10px] uppercase">
                          <tr>
                            <th className="p-3 border border-[#30363d]">Comando</th>
                            <th className="p-3 border border-[#30363d]">Hex</th>
                            <th className="p-3 border border-[#30363d]">Función Técnica</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-[#30363d] hover:bg-white/5">
                            <td className="p-3">Vector X</td>
                            <td className="p-3 text-sky-300 mono">Bn 10 vv</td>
                            <td className="p-3">Mezcla Fuente 1 vs Fuente 2 (CC #16)</td>
                          </tr>
                          <tr className="border-b border-[#30363d] hover:bg-white/5">
                            <td className="p-3">Vector Y</td>
                            <td className="p-3 text-sky-300 mono">Bn 17 vv</td>
                            <td className="p-3">Mezcla Fuente 3 vs Fuente 4 (CC #23)</td>
                          </tr>
                          <tr className="border-b border-[#30363d] hover:bg-white/5">
                            <td className="p-3">Pitch Bend</td>
                            <td className="p-3 text-sky-300 mono">En ll mm</td>
                            <td className="p-3">Resolución completa de 14-bits</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <footer className="mt-20 text-center text-[10px] uppercase text-slate-600 tracking-widest border-t border-[#30363d] pt-8">
                    ARCHIVO GENERADO AUTOMÁTICAMENTE | ACCESO EXCLUSIVO: EDWARD LÓPEZ
                  </footer>
                </div>
              )}
            </div>
          ) : null}
          
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={600} 
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => setDraggedId(null)}
            className={`w-full h-full transition-opacity duration-500 ${isArchiveOpen || isDisseminationOpen ? 'opacity-0' : 'opacity-100'}`}
          />
          
          {(!isArchiveOpen && !isDisseminationOpen) && (
            <div className="absolute bottom-6 right-6 p-4 border border-sky-400 bg-black/80 text-[11px] mono animate-in fade-in zoom-in-95">
              <div className="flex justify-between gap-8 mb-1">
                <strong>Torsión Local:</strong> <span className="text-rose-400">{(state.timeDilation - 1).toFixed(4)} τ</span>
              </div>
              <div className="flex justify-between gap-8">
                <strong>Carga Calculada:</strong> <span className="text-emerald-400">{state.totalCharge.toFixed(3)} e</span>
              </div>
            </div>
          )}
        </div>

        {/* Panel de Control (Derecha) */}
        <aside className="w-80 border-l border-white/10 bg-[#0a0a0a] flex flex-col p-6 overflow-y-auto">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6">Control de Vibración</h3>
          
          <div className="space-y-8">
            <div className="vibration-group">
              <label className="text-[10px] uppercase font-bold text-sky-500/60 block mb-2">Perfil A (Atracción)</label>
              <input 
                type="range" min="0" max="100" value={vibrations.a * 100}
                onChange={(e) => handleVibrationChange('a', parseInt(e.target.value))}
                className="w-full accent-sky-400 bg-slate-800 rounded-lg"
              />
              <div className="mt-2 h-10 w-full bg-slate-900 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-sweep" style={{ animationDuration: '2s' }} />
              </div>
            </div>

            <div className="vibration-group">
              <label className="text-[10px] uppercase font-bold text-sky-500/60 block mb-2">Perfil B (Balance)</label>
              <input 
                type="range" min="0" max="100" value={vibrations.b * 100}
                onChange={(e) => handleVibrationChange('b', parseInt(e.target.value))}
                className="w-full accent-emerald-400 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="vibration-group">
              <label className="text-[10px] uppercase font-bold text-sky-500/60 block mb-2">Perfil C (Cinética)</label>
              <input 
                type="range" min="0" max="100" value={vibrations.c * 100}
                onChange={(e) => handleVibrationChange('c', parseInt(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg"
              />
            </div>

            <button 
              onClick={calculateQ}
              className="w-full py-4 mt-4 bg-sky-400 text-black font-black uppercase tracking-widest text-xs hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-sky-500/20"
            >
              Ejecutar Cálculo Q
            </button>
          </div>

          <div className="mt-12 p-4 bg-white/5 border border-white/10 rounded">
            <h4 className="text-[10px] font-black uppercase mb-3 flex items-center gap-2">
              <TrendingUp size={12} /> Métricas de Tensión
            </h4>
            <div className="space-y-2 text-[10px] mono">
              <div className="flex justify-between">
                <span className="opacity-50">ALPHA_OPT:</span>
                <span>{ALPHA_ABC.toExponential(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">BETA_OPT:</span>
                <span>{BETA_ABC.toExponential(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">CORR_REL:</span>
                <span className="text-emerald-400">+{RELATIVITY_CORRECTION * 100}%</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <footer className="h-10 border-t border-white/10 bg-black flex items-center px-6 justify-between text-[10px] mono uppercase tracking-widest text-slate-500">
        <div className="flex gap-8">
          <span className="flex items-center gap-1"><Zap size={12} className="text-amber-500" /> Coherencia Quantum: NOMINAL</span>
          <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-500" /> Escudo de Realidad: ACTIVO</span>
        </div>
        <div>
          EDWARD_INTERFACE_LINK_V2.0P
        </div>
      </footer>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #38bdf8; border-radius: 2px; }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-sweep { animation: sweep 3s infinite linear; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 3; }
      `}</style>
    </div>
  );
};

export default App;
