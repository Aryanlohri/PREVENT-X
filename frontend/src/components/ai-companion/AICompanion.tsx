import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, Minus, Send, Loader2 } from "lucide-react";
import { sendChatMessage, fetchQuickQuestions, isAuthenticated, isApiError } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AICompanion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi there! 👋 I'm your PreventX AI Companion. I can help with health questions, diet advice, stress management, and more. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [quickChips, setQuickChips] = useState<string[]>([]);
  const [chipsLoading, setChipsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  // Fetch quick questions from backend when companion opens
  useEffect(() => {
    if (isOpen && quickChips.length === 0 && isAuthenticated()) {
      loadQuickQuestions();
    }
  }, [isOpen, quickChips.length]);

  const loadQuickQuestions = async () => {
    setChipsLoading(true);
    try {
      const data = await fetchQuickQuestions();
      setQuickChips(data.questions);
    } catch {
      // Fallback to sensible defaults if backend is unreachable
      setQuickChips([
        "What should I eat for diabetes?",
        "How to relieve stress?",
        "How do I log my vitals?",
        "What is normal blood pressure?",
      ]);
    } finally {
      setChipsLoading(false);
    }
  };

  const send = async (text: string) => {
    if (!text.trim() || typing) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setTyping(true);

    try {
      if (!isAuthenticated()) {
        // If not logged in, show a friendly message
        setTyping(false);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Please log in to use the AI Companion. Your responses will be personalized based on your health data!" },
        ]);
        return;
      }

      // Build the message payload for the backend
      const payload = updatedMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      const data = await sendChatMessage(payload);
      setTyping(false);
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (err: unknown) {
      setTyping(false);
      const isAuthError = isApiError(err) && err.status === 401;
      const errorMsg = isAuthError
        ? "Your session has expired. Please log in again to continue."
        : "I'm having trouble connecting right now. Please try again in a moment.";
      setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
    }
  };

  // Format message content — handle newlines for display
  const formatContent = (content: string) => {
    return content.split("\n").map((line, i) => (
      <span key={i}>
        {line}
        {i < content.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center pulse-gentle hover:scale-110 transition-transform"
            title="Talk to PreventX AI"
          >
            <Brain className="h-6 w-6 text-primary-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[340px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)] glass-card rounded-[20px] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-primary p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-primary-foreground text-sm">PreventX AI Companion</h4>
                  <p className="text-xs text-primary-foreground/70">Online • Here to support you</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg hover:bg-primary-foreground/10 transition-colors">
                  <Minus className="h-4 w-4 text-primary-foreground" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-primary-foreground/10 transition-colors">
                  <X className="h-4 w-4 text-primary-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}>
                    {formatContent(msg.content)}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground px-4 py-2.5 rounded-2xl rounded-bl-md text-sm flex gap-1 items-center">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs ml-1">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Chips — fetched from backend */}
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {chipsLoading ? (
                <span className="text-xs text-muted-foreground">Loading suggestions...</span>
              ) : (
                quickChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => send(chip)}
                    disabled={typing}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {chip}
                  </button>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Ask me anything about your health…"
                disabled={typing}
                className="flex-1 bg-muted rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />
              <button
                onClick={() => send(input)}
                disabled={typing || !input.trim()}
                className="p-2 rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Privacy */}
            <p className="text-[10px] text-muted-foreground text-center pb-2 px-4">
              PreventX AI provides wellness support, not medical diagnosis.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized state */}
      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Brain className="h-6 w-6 text-primary-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};
