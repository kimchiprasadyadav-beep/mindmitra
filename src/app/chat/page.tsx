'use client';
import { useState, useEffect, useRef } from 'react';
import { getChatMessages, saveChatMessages, clearChat, getUserName, type ChatMessage } from '@/lib/storage';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const userName = getUserName();

  useEffect(() => { setMessages(getChatMessages()); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim(), timestamp: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    saveChatMessages(updated);
    setInput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })), userName }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const { text } = JSON.parse(line.slice(6));
              assistantContent += text;
              setMessages([...updated, { role: 'assistant', content: assistantContent, timestamp: Date.now() }]);
            } catch { /* skip */ }
          }
        }
      }
      const final = [...updated, { role: 'assistant' as const, content: assistantContent, timestamp: Date.now() }];
      setMessages(final);
      saveChatMessages(final);
    } catch {
      const errMsg: ChatMessage = { role: 'assistant', content: "Sorry, I couldn't connect right now. Please try again. 💜", timestamp: Date.now() };
      const final = [...updated, errMsg];
      setMessages(final);
      saveChatMessages(final);
    }
    setStreaming(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-xl font-bold">MindMitra 💜</h1>
          <p className="text-xs opacity-50">Your safe space</p>
        </div>
        <button onClick={() => { clearChat(); setMessages([]); }} className="text-xs px-3 py-1.5 rounded-full bg-[#E8D5F5]/50 dark:bg-[#E8D5F5]/10 hover:bg-[#E8D5F5] dark:hover:bg-[#E8D5F5]/20 transition-colors">
          New Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-12 opacity-40">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">Start a conversation with MindMitra</p>
            <p className="text-xs mt-1">I&apos;m here to listen, without judgment.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`animate-fade-in-up flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-gradient-to-br from-[#5B9EA6] to-[#4A8A91] text-white rounded-br-md' : 'bg-white/80 dark:bg-[#222240]/80 shadow-sm rounded-bl-md'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {streaming && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-white/80 dark:bg-[#222240]/80 shadow-sm px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#5B9EA6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[#5B9EA6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[#5B9EA6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 py-3">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Share what's on your mind..." className="flex-1 px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#222240]/80 focus:outline-none focus:ring-2 focus:ring-[#5B9EA6] text-sm" disabled={streaming} />
        <button type="submit" disabled={!input.trim() || streaming} className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#5B9EA6] to-[#4A8A91] text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40">
          Send
        </button>
      </form>
    </div>
  );
}
