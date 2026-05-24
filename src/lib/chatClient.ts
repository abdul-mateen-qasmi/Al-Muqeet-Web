export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSession {
  sessionId: string;
  messages: Message[];
  leadCaptured: boolean;
  lastActivity: number;
}

const SESSION_KEY = 'almuqeet_chat_session';
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getChatSession(): ChatSession {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      const session = JSON.parse(stored) as ChatSession;
      if (Date.now() - session.lastActivity < SESSION_EXPIRY) {
        return session;
      }
    }
  } catch (e) {}
  
  return {
    sessionId: crypto.randomUUID?.() || Date.now().toString(),
    messages: [],
    leadCaptured: false,
    lastActivity: Date.now()
  };
}

export function saveChatSession(session: ChatSession): void {
  session.lastActivity = Date.now();
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {}
}

export function clearChatSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {}
}

export async function sendChatMessage(messages: Message[], sessionId: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch("api.php?action=ai_chat", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, sessionId }),
    signal
  });
  
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    let errMsg = "Failed to send message.";
    try {
      const errData = await res.json();
      if (errData.error) errMsg = errData.error;
    } catch (e) {}
    throw new Error(errMsg);
  }
  
  const data = await res.json();
  if (!data.ok || !data.text) {
    throw new Error(data.error || "Invalid response from assistant.");
  }
  
  // Strip markdown formatting for plain text output
  let cleanText = data.text.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
  cleanText = cleanText.replace(/\*(.*?)\*/g, '$1'); // Italic
  cleanText = cleanText.replace(/#(.*?)\n/g, '$1\n'); // Headers
  cleanText = cleanText.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Links
  
  return cleanText.trim();
}

export async function submitLead(name: string, phone: string, email: string, context: string): Promise<boolean> {
  const res = await fetch("api.php?action=message", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      phone,
      email,
      service: "Chat Lead",
      message: `Lead captured via AI Chat.\n\nContext:\n${context}`,
      source: "chat_widget",
      ts: Date.now()
    })
  });
  
  return res.ok;
}

export function shouldRequestLead(messages: Message[], lastBotMessage: string, leadCaptured: boolean): boolean {
  if (leadCaptured) return false;
  
  const userCount = messages.filter(m => m.role === 'user').length;
  if (userCount >= 3) return true;
  
  const triggers = ['get a quote', 'call you', 'share your contact', 'will reach out', 'contact details'];
  const lowerMsg = lastBotMessage.toLowerCase();
  
  if (triggers.some(t => lowerMsg.includes(t))) return true;
  
  return false;
}
