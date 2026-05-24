import { useState } from "react";
import type { PresetsFile } from "../../lib/commandEngine";

interface PresetGalleryProps {
  presets: PresetsFile;
  onApply: (category: string, presetId: string) => void;
  onClose: () => void;
  isApplying: boolean;
}

export default function PresetGallery({ presets, onApply, onClose, isApplying }: PresetGalleryProps) {
  const [activeTab, setActiveTab] = useState<keyof PresetsFile>("themePresets");

  const tabs: { id: keyof PresetsFile; label: string }[] = [
    { id: "themePresets", label: "Themes" },
    { id: "heroPresets", label: "Hero Styles" },
    { id: "announcementPresets", label: "Announcements" }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[#1F2328]/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#F4F5F7] rounded-3xl shadow-2xl overflow-hidden border border-[#1F2328]/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2328]/10 bg-white/50">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3A3A3A] to-[#111827] grid place-items-center">
              <span className="text-lg">💾</span>
            </span>
            <div>
              <h3 className="font-display text-lg text-[#1F2328]">Preset Gallery</h3>
              <div className="text-[10px] uppercase tracking-[.2em] text-[#6B7280]">One-click configurations</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/80 hover:bg-white grid place-items-center text-[#3A3D42] transition">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-[#1F2328]/10 bg-white/30 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-xl transition-colors whitespace-nowrap ${
                activeTab === t.id 
                  ? "bg-white text-[#1F2328] border-t border-x border-[#1F2328]/10 shadow-[0_2px_0_0_white]" 
                  : "text-[#6B7280] hover:text-[#1F2328] hover:bg-white/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white/40">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(presets[activeTab] || {}).map(([id, preset]) => (
              <div key={id} className="glass rounded-2xl p-5 flex flex-col h-full border border-[#1F2328]/5 hover:border-[#C8A24A]/30 transition-colors group">
                
                {/* Visual Preview Hint based on category */}
                {activeTab === "themePresets" && (
                  <div className="h-20 rounded-xl mb-4 flex overflow-hidden border border-[#1F2328]/10">
                    {preset.patch.operations.filter(op => op.path.startsWith('theme.background')).map((op, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: op.value }} />
                    ))}
                    {preset.patch.operations.filter(op => op.path.startsWith('theme.gold')).map((op, i) => (
                      <div key={i} className="w-4 h-full" style={{ backgroundColor: op.value }} />
                    ))}
                  </div>
                )}
                
                {activeTab === "announcementPresets" && (
                  <div className="h-20 rounded-xl mb-4 flex items-center justify-center px-2 text-center text-[10px] border border-[#1F2328]/10"
                       style={{ 
                         backgroundColor: preset.patch.operations.find(op => op.path === 'announcementBar.bgColor')?.value || '#eee',
                         color: preset.patch.operations.find(op => op.path === 'announcementBar.textColor')?.value || '#333'
                       }}>
                    {preset.patch.operations.find(op => op.path === 'announcementBar.text')?.value || 'Hidden'}
                  </div>
                )}

                <div className="flex-1">
                  <h4 className="font-display text-lg text-[#1F2328] group-hover:text-[#C8A24A] transition-colors">{preset.label}</h4>
                  {preset.description && (
                    <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">{preset.description}</p>
                  )}
                  <div className="mt-3 text-[10px] font-mono-tech text-[#6B7280] bg-white/50 px-2 py-1 rounded inline-block">
                    {preset.patch.operations.length} operations
                  </div>
                </div>

                <button
                  onClick={() => onApply(activeTab, id)}
                  disabled={isApplying}
                  className="mt-5 w-full btn-dark text-xs justify-center py-2"
                >
                  {isApplying ? "Applying..." : "Apply Preset"}
                </button>
              </div>
            ))}
          </div>
          
          {Object.keys(presets[activeTab] || {}).length === 0 && (
            <div className="text-center py-12 text-[#6B7280] text-sm">
              No presets found in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}