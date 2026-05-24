import { useState, useEffect, useRef } from "react";
import { 
  getChatSession, saveChatSession, clearChatSession, 
  sendChatMessage, submitLead, shouldRequestLead, 
  type Message, type ChatSession 
} from "../lib/chatClient";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<ChatSession>(getChatSession());
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: "", phone: "", email: "" });
  const [leadStatus, setLeadStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [unread, setUnread] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [session.messages, isOpen, isTyping, showLeadForm]);

  // Initial greeting if empty
  useEffect(() => {
    if (isOpen && session.messages.length === 0 && !isTyping) {
      const greeting: Message = {
        role: 'assistant',
        content: "Hi! I'm Al Muqeet's AI assistant. How can I help you today?"
      };
      const newSession = { ...session, messages: [greeting] };
      setSession(newSession);
      saveChatSession(newSession);
    }
  }, [isOpen, session.messages.length, isTyping, session]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;
    
    const userMsg: Message = { role: 'user', content: text.trim() };
    const updatedMessages = [...session.messages, userMsg];
    
    const newSession = { ...session, messages: updatedMessages };
    setSession(newSession);
    saveChatSession(newSession);
    setInput("");
    setError(null);
    setIsTyping(true);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      const replyText = await sendChatMessage(updatedMessages, session.sessionId, abortControllerRef.current.signal);
      
      const botMsg: Message = { role: 'assistant', content: replyText };
      const finalMessages = [...updatedMessages, botMsg];
      
      const finalSession = { ...newSession, messages: finalMessages };
      setSession(finalSession);
      saveChatSession(finalSession);
      
      if (!isOpen) setUnread(true);
      
      if (shouldRequestLead(finalMessages, replyText, session.leadCaptured)) {
        setShowLeadForm(true);
      }
      
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "Failed to send message.");
      // Remove the user message if it failed so they can try again
      setSession(session);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) return;
    
    setLeadStatus("submitting");
    
    // Create context from last few messages
    const context = session.messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
    
    const success = await submitLead(leadForm.name, leadForm.phone, leadForm.email, context);
    
    if (success) {
      setLeadStatus("success");
      const newSession = { ...session, leadCaptured: true };
      setSession(newSession);
      saveChatSession(newSession);
      
      setTimeout(() => {
        setShowLeadForm(false);
        const botMsg: Message = { role: 'assistant', content: "Thank you! Our team will contact you shortly." };
        const finalSession = { ...newSession, messages: [...newSession.messages, botMsg] };
        setSession(finalSession);
        saveChatSession(finalSession);
      }, 2000);
    } else {
      setLeadStatus("idle");
      setError("Failed to submit contact details. Please try again.");
    }
  };

  const handleEndChat = () => {
    clearChatSession();
    setSession(getChatSession());
    setIsOpen(false);
    setShowLeadForm(false);
    setLeadStatus("idle");
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnread(false);
  };

  return (
    <>
      {/* Chat Bubble */}
      <button
        onClick={toggleOpen}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        style={{ background: "linear-gradient(135deg, #C8A24A, #B8912F)" }}
        aria-label="Open Chat"
      >
        <span className="absolute inset-0 rounded-full anim-pulse-gold pointer-events-none" />
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {unread && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full" />
        )}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed z-50 transition-all duration-300 ease-out flex flex-col overflow-hidden shadow-2xl
          ${isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-10 opacity-0 pointer-events-none'}
          md:bottom-6 md:right-6 md:w-[380px] md:h-[600px] md:rounded-3xl
          inset-0 w-full h-full md:inset-auto bg-[#F4F5F7] border border-[#1F2328]/10
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1F2328] to-[#2B2D31] p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg">🤖</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1F2328] rounded-full" />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">Al Muqeet Assistant</h3>
              <p className="text-[#C8A24A] text-[10px] uppercase tracking-widest">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleEndChat} className="text-white/50 hover:text-white text-xs px-2" title="End Chat">
              End
            </button>
            <button onClick={toggleOpen} className="text-white/70 hover:text-white p-1" aria-label="Close Chat">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/40" aria-live="polite">
          {session.messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[#1F2328] text-white rounded-br-sm' 
                  : 'bg-white border border-[#1F2328]/10 text-[#3A3D42] rounded-bl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#1F2328]/10 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#C8A24A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#C8A24A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#C8A24A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Lead Capture Form */}
          {showLeadForm && (
            <div className="bg-white border border-[#C8A24A]/30 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <div className="text-sm text-[#1F2328] font-medium mb-3">
                Please share your details so our team can assist you better:
              </div>
              <form onSubmit={handleLeadSubmit} className="space-y-3">
                <input 
                  required type="text" placeholder="Name" 
                  value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})}
                  className="w-full bg-[#F4F5F7] border border-[#1F2328]/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C8A24A]"
                  disabled={leadStatus !== 'idle'}
                />
                <input 
                  required type="tel" placeholder="Phone Number" 
                  value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})}
                  className="w-full bg-[#F4F5F7] border border-[#1F2328]/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C8A24A]"
                  disabled={leadStatus !== 'idle'}
                />
                <input 
                  type="email" placeholder="Email (Optional)" 
                  value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})}
                  className="w-full bg-[#F4F5F7] border border-[#1F2328]/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#C8A24A]"
                  disabled={leadStatus !== 'idle'}
                />
                <button 
                  type="submit" 
                  disabled={leadStatus !== 'idle'}
                  className="w-full bg-[#C8A24A] text-[#1F2328] font-medium rounded-xl py-2 text-sm hover:bg-[#D6B85A] transition disabled:opacity-50"
                >
                  {leadStatus === 'submitting' ? 'Submitting...' : leadStatus === 'success' ? 'Sent ✓' : 'Submit Details'}
                </button>
              </form>
            </div>
          )}

          {error && (
            <div className="text-center text-xs text-red-500 py-2">{error}</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies (only show if no messages or just greeting) */}
        {session.messages.length <= 1 && !isTyping && (
          <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0 bg-white/40">
            {["Get a quote", "Our services", "Contact details"].map(qr => (
              <button 
                key={qr} 
                onClick={() => handleSend(qr)}
                className="whitespace-nowrap px-3 py-1.5 bg-white border border-[#1F2328]/10 rounded-full text-xs text-[#3A3D42] hover:border-[#C8A24A] transition"
              >
                {qr}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-[#1F2328]/10 shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isTyping || showLeadForm}
              className="flex-1 bg-[#F4F5F7] border border-[#1F2328]/10 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#C8A24A] disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping || showLeadForm}
              className="w-10 h-10 rounded-full bg-[#1F2328] text-white flex items-center justify-center disabled:opacity-50 hover:bg-[#3A3A3A] transition shrink-0"
              aria-label="Send"
            >
              <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </form>
          <div className="text-center mt-2 text-[9px] text-[#6B7280] uppercase tracking-widest">
            Powered by Al Muqeet AI
          </div>
        </div>
      </div>
    </>
  );
}