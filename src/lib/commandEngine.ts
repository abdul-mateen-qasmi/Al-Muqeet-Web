export interface AIPlan {
  understood: string;
  risk: 'low' | 'medium' | 'high';
  riskReason: string;
  affectedPaths: string[];
  affectedFiles: string[];
  affectedComponents: string[];
  breakageRisk: string;
  patch: {
    type: string;
    operations: Array<{
      op: 'set' | 'merge' | 'unset';
      path: string;
      value?: any;
    }>;
  };
  previewNote: string;
  undoable: boolean;
  requiresRebuild: boolean;
  codeChangeNeeded: boolean;
  codeChangeReason: string;
}

export interface CommandHistoryItem {
  id: string;
  timestamp: string;
  command: string;
  plan: AIPlan;
}

export interface PresetsFile {
  themePresets: Record<string, Preset>;
  heroPresets: Record<string, Preset>;
  announcementPresets: Record<string, Preset>;
}

export interface Preset {
  label: string;
  description?: string;
  patch: {
    type: string;
    operations: Array<{
      op: 'set' | 'merge' | 'unset';
      path: string;
      value?: any;
    }>;
  };
}

export async function previewCommand(command: string, signal?: AbortSignal): Promise<AIPlan> {
  const res = await fetch("api.php?action=command_preview", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command }),
    signal
  });
  
  if (!res.ok) {
    let errMsg = "Failed to preview command.";
    try {
      const errData = await res.json();
      if (errData.error) errMsg = errData.error;
    } catch (e) {}
    throw new Error(errMsg);
  }
  
  const data = await res.json();
  if (!data.ok || !data.plan) {
    throw new Error(data.error || "Invalid plan returned from AI.");
  }
  
  return data.plan as AIPlan;
}

export async function applyCommand(command: string, plan: AIPlan): Promise<{ ok: boolean; backupId?: string }> {
  const res = await fetch("api.php?action=command_apply", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command, plan })
  });
  
  if (!res.ok) {
    let errMsg = "Failed to apply command.";
    try {
      const errData = await res.json();
      if (errData.error) errMsg = errData.error;
    } catch (e) {}
    throw new Error(errMsg);
  }
  
  return res.json();
}

export async function undoCommand(): Promise<boolean> {
  const res = await fetch("api.php?action=command_undo", { method: "POST", credentials: "include" });
  if (!res.ok) {
    let errMsg = "Failed to undo.";
    try {
      const errData = await res.json();
      if (errData.error) errMsg = errData.error;
    } catch (e) {}
    throw new Error(errMsg);
  }
  return true;
}

export async function redoCommand(): Promise<boolean> {
  const res = await fetch("api.php?action=command_redo", { method: "POST", credentials: "include" });
  if (!res.ok) {
    let errMsg = "Failed to redo.";
    try {
      const errData = await res.json();
      if (errData.error) errMsg = errData.error;
    } catch (e) {}
    throw new Error(errMsg);
  }
  return true;
}

export async function fetchCommandHistory(): Promise<CommandHistoryItem[]> {
  const res = await fetch("api.php?action=command_history", { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchPresets(): Promise<PresetsFile | null> {
  const res = await fetch("api.php?action=presets", { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

export async function applyPreset(category: string, presetId: string): Promise<boolean> {
  const res = await fetch("api.php?action=preset_apply", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, presetId })
  });
  
  if (!res.ok) {
    let errMsg = "Failed to apply preset.";
    try {
      const errData = await res.json();
      if (errData.error) errMsg = errData.error;
    } catch (e) {}
    throw new Error(errMsg);
  }
  return true;
}
