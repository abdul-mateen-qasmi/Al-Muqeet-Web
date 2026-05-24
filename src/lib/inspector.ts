export interface InspectorAnswer {
  summary: string;
  dataSource: string;
  renderedIn: string;
  clickChain: string[];
  adminEdit: string;
  risk: 'low' | 'medium' | 'high';
  safelyEditable: boolean;
  suggestedCommand: string | null;
  additionalNotes: string;
}

export interface InspectorResponse {
  answer: InspectorAnswer;
  relatedItems: Array<{ label: string; location: string }>;
}

export async function askInspector(prompt: string, signal?: AbortSignal): Promise<InspectorResponse> {
  const res = await fetch("api.php?action=ai_agent", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "inspector", prompt }),
    signal
  });
  
  if (!res.ok) {
    let errMsg = "Failed to reach the inspector.";
    try {
      const errData = await res.json();
      if (errData.error) errMsg = errData.error;
    } catch (e) {
      // Ignore JSON parse error on 500
    }
    throw new Error(errMsg);
  }
  
  const data = await res.json();
  if (!data.ok || !data.response) {
    throw new Error(data.error || "Invalid response from inspector.");
  }
  
  return data.response as InspectorResponse;
}

export async function fetchManifest(signal?: AbortSignal): Promise<any> {
  const res = await fetch("api.php?action=project_manifest", { credentials: "include", signal });
  if (!res.ok) throw new Error("Failed to fetch manifest");
  return res.json();
}
