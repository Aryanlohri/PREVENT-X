import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, Minus, Send, Smile } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickChips = ["I'm feeling stressed", "Breathing exercise", "Motivate me", "Sleep tips"];

const mockResponses: Record<string, string> = {
  "I'm feeling stressed": "I hear you. Stress is your body's signal to pause. Let's try a quick technique: breathe in for 4 counts, hold for 4, exhale for 6. Repeat 3 times. You've got this! 💪",
  "Breathing exercise": "Let's do a calming box breath together:\n\n🫁 **Inhale** for 4 seconds\n⏸️ **Hold** for 4 seconds\n😮‍💨 **Exhale** for 4 seconds\n⏸️ **Hold** for 4 seconds\n\nRepeat 4 times. Notice how your body relaxes with each cycle.",
  "Motivate me": "Remember: every small healthy choice you make today compounds into a healthier tomorrow. You're already here, tracking your health — that puts you ahead of 90% of people. Keep going! 🌟",
  "Sleep tips": "Here are 3 science-backed sleep tips:\n\n1. 🌙 **No screens** 30 min before bed\n2. 🧊 Keep your room **cool** (65-68°F)\n3. ☕ **No caffeine** after 2 PM\n\nConsistency is key — try going to bed at the same time each night.",
};

export const AICompanion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi there! 👋 I'm your PreventX Mind Companion. I'm here to support your mental wellness. How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const reply = mockResponses[text.trim()] || "Thank you for sharing. Remember, taking a moment to check in with yourself is a sign of strength. Is there anything specific I can help you with today?";
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    }, 1200);
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
                  <h4 className="font-heading font-semibold text-primary-foreground text-sm">PreventX Mind Companion</h4>
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
                    {msg.content}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground px-4 py-2.5 rounded-2xl rounded-bl-md text-sm flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Chips */}
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Share what's on your mind…"
                className="flex-1 bg-muted rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => send(input)}
                className="p-2 rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
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
