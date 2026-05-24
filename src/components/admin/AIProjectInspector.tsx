import { useState, useEffect, useCallback, useRef } from "react";
import { askInspector, fetchManifest, type InspectorResponse } from "../../lib/inspector";

const QUICK_QUESTIONS =[
  "Where is the hero button located?",
  "Which files control the theme colors?",
  "Explain the contact form save chain",
  "Where is the services data stored?",
  "List all API endpoints",
  "How do I safely edit the announcement bar?"
];

export default function AIProjectInspector() {
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<InspectorResponse | null>(null);
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);
  const[showManifest, setShowManifest] = useState(false);
  const [manifest, setManifest] = useState<any | null>(null);
  const[isListening, setIsListening] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load recent questions and manifest on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("almuqeet_inspector_recent");
      if (stored) setRecentQuestions(JSON.parse(stored));
    } catch (e) {}

    const controller = new AbortController();
    fetchManifest(controller.signal)
      .then(setManifest)
      .catch(() => setManifest({ error: "Manifest not available" }));

    return () => controller.abort();
  },[]);

  const saveRecent = (q: string) => {
    const updated = [q, ...recentQuestions.filter(item => item !== q)].slice(0, 10);
    setRecentQuestions(updated);
    try {
      localStorage.setItem("almuqeet_inspector_recent", JSON.stringify(updated));
    } catch (e) {}
  };

  const submitQuestion = async (q: string) => {
    if (!q.trim()) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsAsking(true);
    setError(null);
    setResponse(null);
    setQuestion(q);
    saveRecent(q);

    try {
      const res = await askInspector(q, abortControllerRef.current.signal);
      setResponse(res);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submitQuestion(question);
    }
  };

  const startVoice = useCallback(() => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      setError("Voice input not supported in your browser. Try Chrome or Edge.");
      return;
    }
    
    const recognition = new SR();
    recognition.lang = 'en-US'; // Fallback handles Urdu/Arabic naturally in modern engines
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setQuestion(prev => prev ? prev + ' ' + transcript : transcript);
    };
    
    recognition.onerror = (e: any) => {
      setIsListening(false);
      if (e.error !== 'no-speech') {
        setError(`Voice error: ${e.error}`);
      }
    };
    
    recognition.onend = () => setIsListening(false);
    
    try {
      recognition.start();
    } catch (err) {
      setError("Could not start voice input.");
      setIsListening(false);
    }
  },[]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-gold-grad flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            AI Project Inspector
          </h2>
          <p className="text-sm text-[#3A3D42] mt-1">
            Ask anything about your website structure, data flow, or safe edit paths. (Read-only)
          </p>
        </div>
        <button 
          onClick={() => { setQuestion(""); setResponse(null); setError(null); }}
          className="btn-glass text-xs shrink-0"
          aria-label="Refresh Inspector"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Input Area */}
      <div className="glass rounded-2xl p-6">
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mera hero ka Request Quote button kahan hai? (Cmd/Ctrl + Enter to ask)"
            className="w-full bg-white/60 border border-[#1F2328]/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C8A24A] min-h-[100px] resize-y"
            aria-label="Ask Inspector"
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
            onClick={() => submitQuestion(question)} 
            disabled={isAsking || !question.trim()}
            className="btn-dark text-sm"
          >
            {isAsking ? "Analyzing..." : "Ask Inspector →"}
          </button>
          <button 
            onClick={startVoice} 
            disabled={isAsking || isListening}
            className={`btn-glass text-sm flex items-center gap-2 ${isListening ? 'ring-1 ring-red-500' : ''}`}
            aria-label="Voice Input"
          >
            🎤 {isListening ? "Listening..." : "Voice"}
          </button>
          <button 
            onClick={() => setQuestion("")} 
            disabled={isAsking || !question}
            className="text-xs text-[#6B7280] hover:text-[#1F2328] px-2"
          >
            Clear
          </button>
        </div>

        {/* Quick Questions */}
        <div className="mt-6">
          <div className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] mb-2">💡 Quick Questions</div>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q, i) => (
              <button 
                key={i} 
                onClick={() => submitQuestion(q)}
                disabled={isAsking}
                className="px-3 py-1.5 rounded-lg bg-white/40 border border-[#1F2328]/5 text-xs text-[#3A3D42] hover:bg-white/80 hover:border-[#C8A24A]/30 transition text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Questions */}
        {recentQuestions.length > 0 && (
          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] mb-2">🕐 Recent</div>
            <div className="flex flex-wrap gap-2">
              {recentQuestions.map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => submitQuestion(q)}
                  disabled={isAsking}
                  className="px-3 py-1 rounded-lg bg-transparent border border-[#1F2328]/10 text-[11px] text-[#6B7280] hover:text-[#1F2328] transition max-w-[200px] truncate"
                  title={q}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status / Error */}
      <div aria-live="assertive">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => submitQuestion(question)} className="underline text-xs">Retry</button>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      <div aria-live="polite">
        {isAsking && (
          <div className="glass rounded-2xl p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-[#1F2328]/10 rounded w-1/3" />
            <div className="h-4 bg-[#1F2328]/5 rounded w-full" />
            <div className="h-4 bg-[#1F2328]/5 rounded w-5/6" />
            <div className="h-20 bg-[#1F2328]/5 rounded w-full mt-4" />
          </div>
        )}
      </div>

      {/* Answer Area */}
      {!isAsking && response && (
        <article className="glass rounded-2xl p-6 md:p-8 border-t-4 border-t-[#C8A24A] shadow-lg transition-opacity duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-[11px] uppercase tracking-[.35em] text-[#C8A24A]">📋 Inspector Answer</div>
            <span className="gold-line flex-1" />
          </div>

          <h3 className="font-display text-xl md:text-2xl text-[#1F2328] mb-6 leading-relaxed">
            {response.answer.summary}
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <section className="space-y-4">
              <div>
                <div className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] flex items-center gap-1.5 mb-1">
                  <span>📊</span> Data Source
                </div>
                <div className="text-sm font-mono-tech bg-white/50 px-3 py-2 rounded-lg border border-[#1F2328]/5">
                  {response.answer.dataSource}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] flex items-center gap-1.5 mb-1">
                  <span>📁</span> Rendered In
                </div>
                <div className="text-sm font-mono-tech bg-white/50 px-3 py-2 rounded-lg border border-[#1F2328]/5">
                  {response.answer.renderedIn}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] flex items-center gap-1.5 mb-1">
                  <span>✏️</span> To Edit Safely
                </div>
                <div className="text-sm bg-white/50 px-3 py-2 rounded-lg border border-[#1F2328]/5">
                  {response.answer.adminEdit}
                </div>
              </div>
            </section>

            <section>
              <div className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] flex items-center gap-1.5 mb-2">
                <span>🔗</span> Click Chain
              </div>
              <ol className="space-y-2 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-[#C8A24A]/30">
                {response.answer.clickChain.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#3A3D42]">
                    <span className="relative z-10 w-6 h-6 rounded-full bg-[#F4F5F7] border border-[#C8A24A]/50 flex items-center justify-center text-[10px] font-mono-tech shrink-0">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <div className="flex flex-wrap items-center gap-4 py-4 border-y border-[#1F2328]/10 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#6B7280]">Risk Level:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                response.answer.risk === 'low' ? 'bg-green-100 text-green-800' :
                response.answer.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {response.answer.risk.toUpperCase()}
              </span>
            </div>
            <div className="w-px h-4 bg-[#1F2328]/20" />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#6B7280]">Safely Editable:</span>
              {response.answer.safelyEditable ? "✅ Yes" : "❌ No (Code change required)"}
            </div>
          </div>

          {response.answer.suggestedCommand && (
            <section className="mb-6">
              <div className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5"><span>💡</span> Suggested Command (Read-Only)</span>
                <button 
                  onClick={() => copyToClipboard(response.answer.suggestedCommand!)}
                  className="text-[#C8A24A] hover:underline"
                  aria-label="Copy command"
                >
                  📋 Copy
                </button>
              </div>
              <div className="bg-[#1F2328] text-[#F4F5F7] p-4 rounded-xl font-mono-tech text-sm overflow-x-auto">
                {response.answer.suggestedCommand}
              </div>
            </section>
          )}

          {response.answer.additionalNotes && (
            <div className="text-sm text-[#6B7280] bg-white/30 p-4 rounded-xl italic">
              Note: {response.answer.additionalNotes}
            </div>
          )}

          {response.relatedItems && response.relatedItems.length > 0 && (
            <section className="mt-6 pt-6 border-t border-[#1F2328]/10">
              <div className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] mb-3">🔗 Related Items</div>
              <ul className="flex flex-wrap gap-2">
                {response.relatedItems.map((item, i) => (
                  <li key={i} className="text-xs bg-white/50 border border-[#1F2328]/10 px-3 py-1.5 rounded-lg text-[#3A3D42]">
                    <strong>{item.label}</strong> <span className="text-[#6B7280]">({item.location})</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      )}

      {/* Manifest Viewer */}
      <div className="glass rounded-2xl p-6">
        <button 
          onClick={() => setShowManifest(!showManifest)}
          className="flex items-center justify-between w-full text-left"
          aria-expanded={showManifest}
        >
          <div className="flex items-center gap-3">
            <div className="text-[11px] uppercase tracking-[.35em] text-[#C8A24A]">📂 Project Manifest</div>
            <span className="gold-line w-12" />
          </div>
          <span className="text-[#6B7280] text-sm">{showManifest ? "▼ Hide" : "▶ Show"}</span>
        </button>
        
        {showManifest && manifest && (
          <div className="mt-4 pt-4 border-t border-[#1F2328]/10">
            <div className="bg-white/50 rounded-xl p-4 overflow-x-auto max-h-[400px] overflow-y-auto no-scrollbar">
              <pre className="text-[11px] font-mono-tech text-[#3A3D42]">
                {JSON.stringify(manifest, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}