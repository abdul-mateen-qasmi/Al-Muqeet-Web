import { useState, useEffect, useCallback, useRef } from "react";
import { 
  previewCommand, applyCommand, undoCommand, redoCommand, 
  fetchCommandHistory, fetchPresets, applyPreset,
  type AIPlan, type CommandHistoryItem, type PresetsFile 
} from "../../lib/commandEngine";
import PresetGallery from "./PresetGallery";

type Status = 'idle' | 'analyzing' | 'plan_ready' | 'applying' | 'applied' | 'error' | 'undoing' | 'redoing' | 'preset_apply';

export default function CommandCenterV2({ onDataChanged }: { onDataChanged: () => void }) {
  const [command, setCommand] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [plan, setPlan] = useState<AIPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [presets, setPresets] = useState<PresetsFile | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("almuqeet_cmd_recent");
      if (stored) setRecentCommands(JSON.parse(stored));
    } catch (e) {}

    refreshHistory();
    fetchPresets().then(setPresets).catch(()=>{});
  }, []);

  const refreshHistory = () => {
    fetchCommandHistory().then(setHistory).catch(()=>{});
  };

  const saveRecent = (cmd: string) => {
    const updated = [cmd, ...recentCommands.filter(item => item !== cmd)].slice(0, 20);
    setRecentCommands(updated);
    try { localStorage.setItem("almuqeet_cmd_recent", JSON.stringify(updated)); } catch (e) {}
  };

  const analyzeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setStatus("analyzing");
    setError(null);
    setPlan(null);
    setShowConfirm(false);
    setCommand(cmd);

    try {
      const resPlan = await previewCommand(cmd, abortControllerRef.current.signal);
      setPlan(resPlan);
      setStatus("plan_ready");
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "Failed to analyze command.");
      setStatus("error");
    }
  };

  const handleApply = async () => {
    if (!plan) return;
    
    if (plan.risk === 'high' && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    setStatus("applying");
    setError(null);

    try {
      await applyCommand(command, plan);
      setStatus("applied");
      saveRecent(command);
      refreshHistory();
      onDataChanged(); // Trigger reload in Admin.tsx
      
      setTimeout(() => {
        setStatus("idle");
        setPlan(null);
        setCommand("");
        setShowConfirm(false);
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Failed to apply changes.");
      setStatus("error"); // Keep plan visible so they can retry
    }
  };

  const handleUndo = async () => {
    setStatus("undoing");
    setError(null);
    try {
      await undoCommand();
      refreshHistory();
      onDataChanged();
      setStatus("idle");
    } catch (err: any) {
      setError(err.message || "Undo failed.");
      setStatus("error");
    }
  };

  const handleRedo = async () => {
    setStatus("redoing");
    setError(null);
    try {
      await redoCommand();
      refreshHistory();
      onDataChanged();
      setStatus("idle");
    } catch (err: any) {
      setError(err.message || "Redo failed.");
      setStatus("error");
    }
  };

  const handlePresetApply = async (category: string, presetId: string) => {
    setStatus("preset_apply");
    setError(null);
    try {
      await applyPreset(category, presetId);
      setShowPresets(false);
      refreshHistory();
      onDataChanged();
      setStatus("applied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to apply preset.");
      setStatus("error");
    }
  };

  const startVoice = useCallback(() => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      setError("Voice input not supported in your browser.");
      return;
    }
    
    const recognition = new SR();
    recognition.lang = 'ur-PK'; // Urdu first, fallback handles English/Roman Urdu
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setCommand(prev => prev ? prev + ' ' + transcript : transcript);
    };
    
    recognition.onerror = (e: any) => {
      setIsListening(false);
      if (e.error !== 'no-speech') setError(`Voice error: ${e.error}`);
    };
    
    recognition.onend = () => setIsListening(false);
    
    try { recognition.start(); } catch (err) {
      setError("Could not start voice input.");
      setIsListening(false);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      analyzeCommand(command);
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && status === "plan_ready") {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="glass rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-gold-grad flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Command Center V2
          </h2>
          <p className="text-sm text-[#3A3D42] mt-1">
            AI-powered site management. Type commands in English, Urdu, or Roman Urdu.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setShowPresets(true)} className="btn-glass text-xs" disabled={!presets}>
            💾 Presets
          </button>
          <button onClick={handleUndo} className="btn-glass text-xs" disabled={status !== 'idle'}>
            ⏪ Undo
          </button>
          <button onClick={handleRedo} className="btn-glass text-xs" disabled={status !== 'idle'}>
            ⏩ Redo
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="glass rounded-2xl p-6">
        <div className="relative">
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={status === 'analyzing' || status === 'applying'}
            placeholder="e.g., 'hero ko premium 3D look do aur announcement on karo' (Enter to analyze)"
            className="w-full bg-white/60 border border-[#1F2328]/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C8A24A] min-h-[100px] resize-y disabled:opacity-50"
          />
          {isListening && (
            <div className="absolute top-3 right-4 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-red-500 uppercase tracking-widest">Listening</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button 
            onClick={() => analyzeCommand(command)} 
            disabled={status === 'analyzing' || status === 'applying' || !command.trim()}
            className="btn-dark text-sm"
          >
            {status === 'analyzing' ? "Analyzing 🧠..." : "Analyze Command"}
          </button>
          <button 
            onClick={startVoice} 
            disabled={status !== 'idle' || isListening}
            className={`btn-glass text-sm flex items-center gap-2 ${isListening ? 'ring-1 ring-red-500' : ''}`}
          >
            🎤 {isListening ? "Listening..." : "Voice"}
          </button>
          <button 
            onClick={() => { setCommand(""); setPlan(null); setError(null); setStatus("idle"); setShowConfirm(false); }} 
            disabled={status === 'analyzing' || status === 'applying'}
            className="text-xs text-[#6B7280] hover:text-[#1F2328] px-2"
          >
            Clear
          </button>
        </div>

        {/* Examples */}
        <div className="mt-4 pt-4 border-t border-[#1F2328]/10">
          <div className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] mb-2">💡 Try saying:</div>
          <div className="flex flex-wrap gap-2">
            {["Change theme to minimal clean", "Turn off the announcement bar", "Make the hero button say 'Get Free Quote'"].map((q, i) => (
              <button 
                key={i} 
                onClick={() => { setCommand(q); analyzeCommand(q); }}
                disabled={status !== 'idle'}
                className="px-3 py-1.5 rounded-lg bg-white/40 border border-[#1F2328]/5 text-xs text-[#3A3D42] hover:bg-white/80 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status / Error */}
      <div aria-live="assertive">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-xs underline">Dismiss</button>
          </div>
        )}
        {status === 'applied' && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Changes applied successfully. Site data reloaded.
          </div>
        )}
        {(status === 'undoing' || status === 'redoing' || status === 'preset_apply') && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800 flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Processing request...
          </div>
        )}
      </div>

      {/* Plan Preview */}
      {plan && (
        <div className="glass rounded-2xl p-6 md:p-8 border-t-4 border-t-[#C8A24A] shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-[11px] uppercase tracking-[.35em] text-[#C8A24A]">📋 AI Plan</div>
              <span className="gold-line w-12" />
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
              plan.risk === 'low' ? 'bg-green-50 text-green-700 border-green-200' :
              plan.risk === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              'bg-red-50 text-red-700 border-red-200'
            }`}>
              Risk: {plan.risk.toUpperCase()}
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <h4 className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] mb-2 flex items-center gap-1.5"><span>📝</span> What I understood</h4>
              <p className="text-sm text-[#1F2328] bg-white/50 p-3 rounded-xl border border-[#1F2328]/5 leading-relaxed">
                {plan.understood}
              </p>
            </section>

            <div className="grid md:grid-cols-2 gap-4">
              <section>
                <h4 className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] mb-2 flex items-center gap-1.5"><span>🎯</span> Affected Paths</h4>
                <ul className="text-xs font-mono-tech text-[#3A3D42] bg-white/50 p-3 rounded-xl border border-[#1F2328]/5 space-y-1">
                  {plan.affectedPaths.map((p, i) => <li key={i}>• {p}</li>)}
                </ul>
              </section>
              <section>
                <h4 className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] mb-2 flex items-center gap-1.5"><span>⚠️</span> Breakage Risk</h4>
                <p className="text-xs text-[#3A3D42] bg-white/50 p-3 rounded-xl border border-[#1F2328]/5 leading-relaxed">
                  {plan.breakageRisk}
                </p>
              </section>
            </div>

            <section>
              <h4 className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] mb-2 flex items-center gap-1.5"><span>📊</span> Diff Preview (Operations)</h4>
              <div className="bg-[#1F2328] text-[#F4F5F7] p-4 rounded-xl font-mono-tech text-xs overflow-x-auto space-y-2">
                {plan.patch.operations.map((op, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-[#C8A24A] w-12 shrink-0">[{op.op}]</span>
                    <span className="text-[#BFC7D5] w-48 shrink-0">{op.path}</span>
                    <span className="text-white truncate">
                      {op.op === 'unset' ? '---' : JSON.stringify(op.value)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex items-center gap-4 py-3 border-y border-[#1F2328]/10 text-sm">
              <span className="text-[#6B7280]">Undoable: {plan.undoable ? "✅ Yes" : "❌ No"}</span>
              <div className="w-px h-4 bg-[#1F2328]/20" />
              <span className="text-[#6B7280]">Rebuild needed: {plan.requiresRebuild ? "⚠️ Yes" : "✅ No"}</span>
            </div>

            {/* Apply Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              {showConfirm ? (
                <div className="w-full flex items-center justify-between bg-red-50 border border-red-200 p-3 rounded-xl">
                  <span className="text-sm text-red-700 font-medium">High risk change. Are you sure?</span>
                  <div className="flex gap-2">
                    <button onClick={() => setShowConfirm(false)} className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-100 rounded-lg transition">Cancel</button>
                    <button onClick={handleApply} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Yes, Apply Anyway</button>
                  </div>
                </div>
              ) : (
                <>
                  <button 
                    onClick={handleApply} 
                    disabled={status === 'applying'}
                    className="w-full sm:w-auto btn-dark justify-center"
                  >
                    {status === 'applying' ? "Applying..." : "✓ Apply Changes"}
                  </button>
                  <span className="text-xs text-[#6B7280]">Auto-backup will be created first.</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-[11px] uppercase tracking-[.35em] text-[#C8A24A]">📜 Recent Commands</div>
            <span className="gold-line flex-1" />
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 no-scrollbar">
            {history.slice().reverse().map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-[#1F2328]/5 text-sm">
                <div className="truncate pr-4 text-[#1F2328]">"{h.command}"</div>
                <div className="text-[10px] text-[#6B7280] whitespace-nowrap font-mono-tech">
                  {new Date(h.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showPresets && presets && (
        <PresetGallery 
          presets={presets} 
          onApply={handlePresetApply} 
          onClose={() => setShowPresets(false)} 
          isApplying={status === 'preset_apply'}
        />
      )}
    </div>
  );
}