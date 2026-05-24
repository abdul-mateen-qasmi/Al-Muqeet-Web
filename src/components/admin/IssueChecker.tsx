import { useState, useEffect } from "react";

interface Issue {
  category: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

interface IssueReport {
  lastRun: string | null;
  issues: Issue[];
  summary: {
    critical: number;
    warning: number;
    info: number;
  } | null;
}

export default function IssueChecker() {
  const [report, setReport] = useState<IssueReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');

  // Load last report on mount if available
  useEffect(() => {
    fetch("data/issue-report.json")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.summary) setReport(data);
      })
      .catch(() => {});
  }, []);

  const runScan = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const res = await fetch("api.php?action=issue_check", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to run diagnostics.");
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Scan failed.");
      setReport(data.report);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during scan.");
    } finally {
      setIsScanning(false);
    }
  };

  const filteredIssues = report?.issues.filter(i => filter === 'all' || i.severity === filter) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-gold-grad flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            System Diagnostics
          </h2>
          <p className="text-sm text-[#3A3D42] mt-1">
            Automated 12-category health check for API, file system, schema, and security.
          </p>
        </div>
        <button 
          onClick={runScan} 
          disabled={isScanning}
          className="btn-dark text-sm shrink-0"
        >
          {isScanning ? "Scanning..." : "Run Full Scan"}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Summary Cards */}
      {report && report.summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5 border-t-4 border-t-red-500">
            <div className="text-[10px] uppercase tracking-[.2em] text-[#6B7280]">Critical</div>
            <div className="font-display text-3xl text-red-600 mt-1">{report.summary.critical}</div>
          </div>
          <div className="glass rounded-2xl p-5 border-t-4 border-t-yellow-500">
            <div className="text-[10px] uppercase tracking-[.2em] text-[#6B7280]">Warnings</div>
            <div className="font-display text-3xl text-yellow-600 mt-1">{report.summary.warning}</div>
          </div>
          <div className="glass rounded-2xl p-5 border-t-4 border-t-green-500">
            <div className="text-[10px] uppercase tracking-[.2em] text-[#6B7280]">Status</div>
            <div className="font-display text-xl text-green-600 mt-2">
              {report.summary.critical === 0 && report.summary.warning === 0 ? "Healthy" : "Needs Attention"}
            </div>
          </div>
        </div>
      )}

      {/* Results Area */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-[11px] uppercase tracking-[.35em] text-[#C8A24A]">Scan Results</div>
            <span className="gold-line w-12" />
          </div>
          
          {report && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#6B7280] mr-2">Filter:</span>
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-xs transition ${filter === 'all' ? 'bg-[#1F2328] text-white' : 'bg-white/50 text-[#3A3D42] hover:bg-white'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('critical')}
                className={`px-3 py-1 rounded-full text-xs transition ${filter === 'critical' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-white/50 text-[#3A3D42] hover:bg-white'}`}
              >
                Critical
              </button>
              <button 
                onClick={() => setFilter('warning')}
                className={`px-3 py-1 rounded-full text-xs transition ${filter === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-white/50 text-[#3A3D42] hover:bg-white'}`}
              >
                Warnings
              </button>
            </div>
          )}
        </div>

        {isScanning ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#C8A24A] border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-sm text-[#6B7280] animate-pulse">Running 12-category diagnostic check...</div>
          </div>
        ) : !report ? (
          <div className="py-12 text-center text-sm text-[#6B7280]">
            No scan results available. Click "Run Full Scan" to begin.
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 grid place-items-center mx-auto mb-3 text-xl">✓</div>
            <div className="text-sm text-[#1F2328] font-medium">No issues found in this category.</div>
            <div className="text-xs text-[#6B7280] mt-1">System is operating within normal parameters.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue, i) => (
              <div 
                key={i} 
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  issue.severity === 'critical' ? 'bg-red-50/50 border-red-100' : 
                  issue.severity === 'warning' ? 'bg-yellow-50/50 border-yellow-100' : 
                  'bg-blue-50/50 border-blue-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 ${
                    issue.severity === 'critical' ? 'text-red-500' : 
                    issue.severity === 'warning' ? 'text-yellow-500' : 
                    'text-blue-500'
                  }`}>
                    {issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵'}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[.2em] text-[#6B7280] mb-0.5">{issue.category}</div>
                    <div className="text-sm text-[#1F2328]">{issue.message}</div>
                  </div>
                </div>
                
                {/* Auto-fix button placeholder (Safe actions only) */}
                {issue.severity === 'warning' && issue.category === 'Backup Health' && (
                  <button 
                    onClick={async () => {
                      await fetch("api.php?action=backup", {method:"POST", credentials: "include"});
                      runScan();
                    }}
                    className="px-3 py-1.5 bg-white border border-[#1F2328]/10 rounded-lg text-xs text-[#3A3D42] hover:bg-gray-50 transition shrink-0"
                  >
                    Auto-Fix: Create Backup
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {report && report.lastRun && (
          <div className="mt-6 pt-4 border-t border-[#1F2328]/10 text-[10px] text-[#6B7280] text-right font-mono-tech">
            Last scan: {new Date(report.lastRun).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
