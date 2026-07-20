'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

import ReactMarkdown from 'react-markdown';

export default function HealthBotClient({ medicineName }: { medicineName: string }) {
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: `Hi! I am the CureCart AI Medical Assistant. I use verified data from the FDA, WHO, and Mayo Clinic. What would you like to know about ${medicineName}?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ messages: newMessages, medicineName })
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3.5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white ml-8 rounded-tr-sm shadow-sm' : 'bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 mr-8 rounded-tl-sm shadow-[0_2px_8px_rgb(0,0,0,0.04)] dark:shadow-none'}`}>
            {msg.role === 'user' ? (
              <div className="whitespace-pre-wrap">{msg.text}</div>
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
          <div className="bg-white dark:bg-zinc-800 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-2xl mr-8 w-fit text-sm shadow-sm dark:shadow-none flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="font-medium">Typing...</span>
          </div>
        )}
      </div>
      
      <div className="mt-auto flex gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={`Ask about ${medicineName}...`}
          className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        <Button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm px-5">
          Ask
        </Button>
      </div>
    </div>
  );
}