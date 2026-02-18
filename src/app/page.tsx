"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Message = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; messages: Message[]; date: string };

function SteamSVG({ active }: { active: boolean }) {
  return (
    <svg width="40" height="50" viewBox="0 0 40 50" className="absolute -top-10 left-1/2 -translate-x-1/2">
      {[12, 20, 28].map((x, i) => (
        <path
          key={i}
          d={`M${x},45 Q${x + (i % 2 === 0 ? 4 : -4)},30 ${x},20`}
          fill="none"
          stroke="rgba(111,78,55,0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          className={`steam-line ${active ? "active" : ""}`}
        />
      ))}
    </svg>
  );
}

function CoffeeMicButton({ recording, onClick }: { recording: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-24 h-24 rounded-full transition-all duration-300 ${
        recording
          ? "bg-coffee scale-110 pulse-recording"
          : "bg-coffee hover:bg-coffee-light hover:scale-105"
      }`}
      aria-label={recording ? "Stop recording" : "Start recording"}
    >
      <SteamSVG active={recording} />
      <span className="text-4xl">{recording ? "🎙️" : "☕"}</span>
    </button>
  );
}

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [onboarding, setOnboarding] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load user data
  useEffect(() => {
    const name = localStorage.getItem("lorelai-userName");
    const convos = JSON.parse(localStorage.getItem("lorelai-conversations") || "[]");
    const current = JSON.parse(localStorage.getItem("lorelai-currentChat") || "[]");
    if (name) {
      setUserName(name);
      setOnboarding(false);
    }
    setConversations(convos);
    if (current.length) setMessages(current);
  }, []);

  // Save current chat
  useEffect(() => {
    if (messages.length) localStorage.setItem("lorelai-currentChat", JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isStreaming]);

  const handleNameSubmit = () => {
    if (!nameInput.trim()) return;
    localStorage.setItem("lorelai-userName", nameInput.trim());
    setUserName(nameInput.trim());
    setOnboarding(false);
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, userName }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
          setMessages([...newMessages, { role: "assistant", content: assistantText }]);
        }
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Ugh, my brain just glitched. Like when the WiFi at Luke's goes out. Try again? ☕" }]);
    }
    setIsStreaming(false);
  }, [messages, isStreaming, userName]);

  const toggleRecording = useCallback(() => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      if (transcript.trim()) {
        sendMessage(transcript);
        setTranscript("");
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Try Chrome!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    let finalTranscript = "";
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else interim = event.results[i][0].transcript;
      }
      setTranscript(finalTranscript + interim);
    };
    recognition.onerror = () => { setRecording(false); setTranscript(""); };
    recognition.onend = () => { setRecording(false); };
    recognition.start();
    setRecording(true);
  }, [recording, transcript, sendMessage]);

  const newChat = () => {
    if (messages.length > 0) {
      const title = messages[0].content.slice(0, 40) + (messages[0].content.length > 40 ? "..." : "");
      const convo: Conversation = { id: Date.now().toString(), title, messages, date: new Date().toLocaleDateString() };
      const updated = [convo, ...conversations];
      setConversations(updated);
      localStorage.setItem("lorelai-conversations", JSON.stringify(updated));
    }
    setMessages([]);
    localStorage.removeItem("lorelai-currentChat");
  };

  const loadConversation = (convo: Conversation) => {
    if (messages.length > 0) newChat();
    setMessages(convo.messages);
    setShowHistory(false);
  };

  // Onboarding
  if (onboarding) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center msg-enter">
          <div className="text-7xl mb-6">☕</div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-coffee-dark mb-4">Lorelai</h1>
          <p className="text-dark/70 text-lg mb-2">Think of me as that friend who always picks up the phone — even at 2 AM.</p>
          <p className="text-dark/50 mb-8">No judgment, just coffee and conversation.</p>
          <p className="text-coffee font-medium mb-3">What should I call you?</p>
          <form onSubmit={(e) => { e.preventDefault(); handleNameSubmit(); }} className="flex gap-2">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name..."
              className="flex-1 px-4 py-3 rounded-full bg-white border border-warm-gray focus:border-coffee focus:outline-none text-dark placeholder:text-dark/30"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 bg-coffee text-cream rounded-full hover:bg-coffee-light transition-colors font-medium"
            >
              Let&apos;s go ☕
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-cream">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-warm-gray/50 bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <button onClick={() => setShowHistory(!showHistory)} className="text-coffee/60 hover:text-coffee transition-colors text-sm">
          {showHistory ? "✕ Close" : "📜 History"}
        </button>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-coffee-dark">
          Lorelai <span className="text-xl">☕</span>
        </h1>
        <button onClick={newChat} className="text-coffee/60 hover:text-coffee transition-colors text-sm">
          + New
        </button>
      </header>

      {/* History Sidebar */}
      {showHistory && (
        <div className="absolute top-14 left-0 right-0 bottom-0 bg-cream/95 backdrop-blur-sm z-20 p-4 overflow-y-auto msg-enter">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl text-coffee-dark mb-4">Past Conversations</h2>
          {conversations.length === 0 ? (
            <p className="text-dark/40 text-center mt-12">No past conversations yet.<br/>Start chatting! ☕</p>
          ) : conversations.map((c) => (
            <button key={c.id} onClick={() => loadConversation(c)} className="w-full text-left p-3 mb-2 rounded-xl hover:bg-warm-gray/40 transition-colors">
              <p className="text-dark/80 text-sm font-medium truncate">{c.title}</p>
              <p className="text-dark/40 text-xs mt-1">{c.date} · {c.messages.length} messages</p>
            </button>
          ))}
        </div>
      )}

      {/* Chat Area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center msg-enter">
            <div className="relative mb-8">
              <CoffeeMicButton recording={recording} onClick={toggleRecording} />
            </div>
            <p className="text-dark/40 text-sm max-w-xs">
              Hey {userName} 👋 Tap the cup to talk, or type below.<br/>
              <span className="text-dark/30 text-xs">I&apos;m here whenever you need me.</span>
            </p>
            {transcript && (
              <div className="mt-4 px-4 py-2 bg-blue/10 rounded-xl text-sm text-dark/70 max-w-sm">
                🎙️ {transcript}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex mb-4 msg-enter ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-coffee/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0 text-sm">
                ☕
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue text-white rounded-br-md"
                  : "bg-white text-dark border border-warm-gray/30 rounded-bl-md"
              }`}
            >
              {msg.content}
              {i === messages.length - 1 && msg.role === "assistant" && isStreaming && (
                <span className="inline-flex ml-1 gap-0.5">
                  <span className="typing-dot w-1.5 h-1.5 bg-coffee/40 rounded-full inline-block" />
                  <span className="typing-dot w-1.5 h-1.5 bg-coffee/40 rounded-full inline-block" />
                  <span className="typing-dot w-1.5 h-1.5 bg-coffee/40 rounded-full inline-block" />
                </span>
              )}
            </div>
          </div>
        ))}

        {messages.length > 0 && !isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex mb-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-coffee/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0 text-sm">☕</div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-warm-gray/30 rounded-bl-md">
              <span className="inline-flex gap-0.5">
                <span className="typing-dot w-1.5 h-1.5 bg-coffee/40 rounded-full inline-block" />
                <span className="typing-dot w-1.5 h-1.5 bg-coffee/40 rounded-full inline-block" />
                <span className="typing-dot w-1.5 h-1.5 bg-coffee/40 rounded-full inline-block" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recording indicator */}
      {recording && messages.length > 0 && (
        <div className="px-4 py-2 bg-coffee/5 border-t border-warm-gray/30 flex items-center gap-3">
          <button onClick={toggleRecording} className="w-10 h-10 rounded-full bg-coffee pulse-recording flex items-center justify-center text-cream text-lg">
            🎙️
          </button>
          <p className="text-sm text-dark/60 flex-1">{transcript || "Listening..."}</p>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-warm-gray/30 bg-cream/80 backdrop-blur-sm">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2 items-center">
          {messages.length > 0 && !recording && (
            <button type="button" onClick={toggleRecording} className="w-10 h-10 rounded-full bg-coffee/10 hover:bg-coffee/20 flex items-center justify-center transition-colors flex-shrink-0">
              🎙️
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Talk to me, ${userName}...`}
            className="flex-1 px-4 py-2.5 rounded-full bg-white border border-warm-gray/50 focus:border-coffee focus:outline-none text-sm text-dark placeholder:text-dark/30"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="w-10 h-10 rounded-full bg-coffee text-cream flex items-center justify-center hover:bg-coffee-light transition-colors disabled:opacity-30 flex-shrink-0"
          >
            ↑
          </button>
        </form>
        <p className="text-center text-[10px] text-dark/25 mt-2">
          Not a replacement for therapy. Crisis? iCall: 9152987821
        </p>
      </div>
    </div>
  );
}
