"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

import ReactMarkdown from 'react-markdown';

export function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: `Hi! I am your AI Medical Assistant. I use verified data from the FDA, WHO, and Mayo Clinic to give you instant answers. How can I help?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-open chatbot after 5 seconds if the user hasn't closed it before in this session
    const hasClosed = sessionStorage.getItem('chatbot_closed');
    if (!hasClosed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('chatbot_closed', 'true');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    const newMessages: {role: 'user'|'bot', text: string}[] = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/health-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, medicineName: 'General Health' })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: `Error: ${data.error}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Failed to connect to the medical assistant." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(52,211,153,0.3)] transition-all z-50 hover:scale-110 group"
        >
          <div className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping opacity-75 group-hover:opacity-0 transition-opacity"></div>
          <MessageCircle className="w-7 h-7 relative z-10 drop-shadow-sm" />
        </button>
      )}

      {/* Chat Window Overlay */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[85vh] bg-white dark:bg-zinc-950 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.12)] flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500 border border-emerald-100/50 dark:border-emerald-900/30">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 pattern-dots"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-sm">
                <Sparkles className="w-5 h-5 text-emerald-50" />
              </div>
              <div>
                <h3 className="font-black text-base tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                  AI Assistant
                </h3>
                <p className="text-xs text-emerald-100/90 mt-0.5 font-medium">Verified Medical Sources</p>
              </div>
            </div>
            <button onClick={handleClose} className="relative z-10 text-emerald-100 hover:text-white hover:bg-white/20 transition-all p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50/80 dark:bg-zinc-900/50 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800">
            {messages.map((msg, i) => (
              <div key={i} className={`max-w-[85%] p-4 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white ml-auto rounded-2xl rounded-tr-sm shadow-sm' 
                  : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 mr-auto rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-zinc-700'
              }`}>
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                ) : (
                  <div className="text-gray-800 dark:text-zinc-200">
                    <ReactMarkdown
                      components={{
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="text-gray-800 dark:text-zinc-200" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 p-4 rounded-2xl rounded-tl-sm mr-auto max-w-[85%] shadow-sm border border-gray-100 dark:border-zinc-700 flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span className="text-xs font-medium text-emerald-600">Typing...</span>
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-zinc-900/50 rounded-2xl px-4 py-2 border border-gray-200 dark:border-zinc-700 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask a medical question..."
                className="flex-1 bg-transparent border-0 py-2.5 text-sm focus:outline-none placeholder:text-gray-400 dark:text-zinc-100 font-medium"
              />
              <button 
                onClick={sendMessage} 
                disabled={loading || !input.trim()} 
                className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-sm transition-all disabled:opacity-40 disabled:hover:scale-100 flex-shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <p className="text-center text-[10px] font-bold text-gray-300 dark:text-zinc-700 mt-3 uppercase tracking-widest">
              Powered by CureCart AI
            </p>
          </div>
        </div>
      )}
    </>
  );
}
