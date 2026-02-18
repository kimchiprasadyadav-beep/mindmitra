"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Message = { role: "user" | "assistant"; content: string };

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function CouplesContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Session state
  const [phase, setPhase] = useState<"lobby" | "waiting" | "chat">("lobby");
  const [roomCode, setRoomCode] = useState(searchParams.get("room") || "");
  const [joinCode, setJoinCode] = useState("");
  const [myName, setMyName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [convoId, setConvoId] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Auth check
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
      const name = profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "";
      setMyName(name);
      setLoading(false);

      // Auto-join if room code in URL
      const urlRoom = searchParams.get("room");
      if (urlRoom) {
        setRoomCode(urlRoom);
        try {
          const res = await fetch("/api/couples-join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: urlRoom, partnerName: name }),
          });
          if (res.ok) {
            const data = await res.json();
            setConvoId(data.convoId);
            setPartnerName(data.creatorName);
            if (data.messages) setMessages(data.messages);
            setPhase("chat");
          }
        } catch { /* ignore, show lobby */ }
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!convoId) return;

    const channel = supabase
      .channel(`couples-${convoId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${convoId}` },
        (payload) => {
          const newMsg = payload.new as { role: string; content: string };
          setMessages((prev) => {
            // Avoid duplicates - check if last message has same content
            const last = prev[prev.length - 1];
            if (last && last.content === newMsg.content && last.role === newMsg.role) return prev;
            return [...prev, { role: newMsg.role as "user" | "assistant", content: newMsg.content }];
          });
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convoId]);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  // Poll for partner joining (when waiting)
  useEffect(() => {
    if (phase !== "waiting" || !convoId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("conversations")
        .select("title")
        .eq("id", convoId)
        .single();
      if (data) {
        const match = data.title.match(/\[COUPLES:[A-Z0-9]+\] (.+) & (.+)/);
        if (match && match[2] && match[2] !== "...") {
          setPartnerName(match[2]);
          setPhase("chat");
          clearInterval(interval);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, convoId]);

  const createSession = async () => {
    if (!myName.trim() || !userId) return;
    const code = generateRoomCode();
    setRoomCode(code);

    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: userId, title: `[COUPLES:${code}] ${myName.trim()} & ...` })
      .select()
      .single();

    if (error || !data) return;
    setConvoId(data.id);
    setPhase("waiting");
    window.history.replaceState(null, "", `/couples?room=${code}`);
  };

  const joinSession = async () => {
    if (!joinCode.trim() || !myName.trim() || !userId) return;
    const code = joinCode.trim().toUpperCase();

    try {
      const res = await fetch("/api/couples-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, partnerName: myName.trim() }),
      });

      if (!res.ok) {
        alert("Session not found. Check the code and try again.");
        return;
      }

      const data = await res.json();
      setRoomCode(code);
      setConvoId(data.convoId);
      setPartnerName(data.creatorName);
      if (data.messages) setMessages(data.messages);
      setPhase("chat");
      window.history.replaceState(null, "", `/couples?room=${code}`);
    } catch {
      alert("Something went wrong. Try again.");
    }
  };

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!convoId) return;
    await fetch("/api/couples-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: convoId, role, content }),
    });
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming || !convoId) return;
    const prefixed = `[${myName}]: ${text.trim()}`;
    const userMsg: Message = { role: "user", content: prefixed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsStreaming(true);

    await saveMessage("user", prefixed);

    try {
      const res = await fetch("/api/couples-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, partnerA: myName, partnerB: partnerName }),
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
      if (assistantText) await saveMessage("assistant", assistantText);
    } catch {
      const errMsg = "I'm having a moment — can you try again? 💛";
      setMessages([...newMessages, { role: "assistant", content: errMsg }]);
    }
    setIsStreaming(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isStreaming, myName, partnerName, convoId]);

  const copyInviteLink = () => {
    const url = `${window.location.origin}/couples?room=${roomCode}`;
    navigator.clipboard.writeText(url);
  };

  const resizeTextarea = () => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 120) + "px"; }
  };

  // Determine message styling
  const getMessageStyle = (msg: Message) => {
    if (msg.role === "assistant") return "assistant";
    if (msg.content.startsWith(`[${myName}]:`)) return "me";
    return "partner";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-brown/10 flex items-center justify-center">
            <span className="text-2xl">💕</span>
          </div>
          <p className="text-warm-brown/50 text-sm tracking-wide">Setting up your space...</p>
        </div>
      </div>
    );
  }

  // === LOBBY ===
  if (phase === "lobby") {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <header className="flex items-center justify-between px-5 py-4 border-b border-warm-brown/8">
          <button onClick={() => router.push("/")} className="text-warm-brown/40 hover:text-warm-brown text-sm transition-colors">
            ← Back
          </button>
          <h1 className="font-[family-name:var(--font-playfair)] text-[22px] text-warm-brown tracking-tight">
            Lorelai <span className="text-warm-brown/40">· Couples</span> 💕
          </h1>
          <div className="w-12" />
        </header>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-sm w-full space-y-8 animate-fade-in">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-warm-brown/6 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💕</span>
              </div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-warm-brown mb-2">
                Couples Session
              </h2>
              <p className="text-warm-brown/40 text-sm leading-relaxed">
                A safe space for both of you to be heard.
              </p>
            </div>

            {/* Name input */}
            <div>
              <label className="text-warm-brown/50 text-xs tracking-wide mb-2 block">Your name</label>
              <input
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                placeholder="What should Lorelai call you?"
                className="w-full px-4 py-3 rounded-2xl border border-warm-brown/12 bg-white text-warm-brown text-sm placeholder:text-warm-brown/25 focus:outline-none focus:border-warm-brown/25 transition-colors"
              />
            </div>

            {/* Create */}
            <div>
              <button
                onClick={createSession}
                disabled={!myName.trim()}
                className="w-full py-3.5 rounded-2xl bg-warm-brown text-cream text-sm font-medium hover:bg-warm-brown/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Start a Couples Session
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-warm-brown/8" />
              <span className="text-warm-brown/25 text-xs">or join one</span>
              <div className="flex-1 h-px bg-warm-brown/8" />
            </div>

            {/* Join */}
            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                maxLength={6}
                className="flex-1 px-4 py-3 rounded-2xl border border-warm-brown/12 bg-white text-warm-brown text-sm text-center tracking-[0.3em] font-mono placeholder:text-warm-brown/25 placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:border-warm-brown/25 transition-colors"
              />
              <button
                onClick={joinSession}
                disabled={joinCode.length < 6 || !myName.trim()}
                className="px-6 py-3 rounded-2xl bg-warm-brown/10 text-warm-brown text-sm font-medium hover:bg-warm-brown/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === WAITING FOR PARTNER ===
  if (phase === "waiting") {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <header className="flex items-center justify-between px-5 py-4 border-b border-warm-brown/8">
          <button onClick={() => { setPhase("lobby"); setRoomCode(""); setConvoId(null); }} className="text-warm-brown/40 hover:text-warm-brown text-sm transition-colors">
            ← Back
          </button>
          <h1 className="font-[family-name:var(--font-playfair)] text-[22px] text-warm-brown tracking-tight">
            Lorelai <span className="text-warm-brown/40">· Couples</span> 💕
          </h1>
          <div className="w-12" />
        </header>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-sm w-full text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-warm-brown/6 flex items-center justify-center mx-auto mb-6 pulse-recording">
              <span className="text-3xl">💕</span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-warm-brown mb-3">
              Waiting for your partner
            </h2>
            <p className="text-warm-brown/40 text-sm mb-8">Share this code with them:</p>

            <div className="bg-white rounded-2xl border border-warm-brown/12 px-8 py-6 mb-6">
              <p className="text-warm-brown font-mono text-4xl tracking-[0.4em] font-bold">{roomCode}</p>
            </div>

            <button
              onClick={copyInviteLink}
              className="px-6 py-3 rounded-2xl bg-warm-brown/10 text-warm-brown text-sm font-medium hover:bg-warm-brown/15 transition-all"
            >
              📋 Copy invite link
            </button>

            <p className="text-warm-brown/25 text-xs mt-6">
              The session will begin once your partner joins.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // === CHAT ===
  return (
    <div className="h-screen flex flex-col bg-cream">
      <header className="flex items-center justify-between px-5 py-4 border-b border-warm-brown/8">
        <button onClick={() => router.push("/")} className="text-warm-brown/40 hover:text-warm-brown text-sm transition-colors">
          ← Exit
        </button>
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-[20px] text-warm-brown tracking-tight">
            Lorelai <span className="text-warm-brown/40">· Couples</span> 💕
          </h1>
          <p className="text-warm-brown/25 text-[10px] tracking-wider">{roomCode}</p>
        </div>
        <button onClick={copyInviteLink} className="text-warm-brown/30 hover:text-warm-brown/60 text-xs transition-colors" title="Copy invite link">
          📋
        </button>
      </header>

      {/* Welcome message */}
      {messages.length === 0 && (
        <div className="px-4 py-6 max-w-2xl mx-auto text-center animate-fade-in">
          <div className="bg-white rounded-2xl border border-warm-brown/8 px-6 py-5 shadow-sm">
            <p className="text-warm-brown/60 text-sm leading-relaxed">
              Welcome, <strong>{myName}</strong>{partnerName ? ` & ${partnerName}` : ""}. I&apos;m Lorelai — think of me as your mediator. This is a safe space. There are no sides here, only understanding. Who&apos;d like to start?
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto">
        {messages.length > 0 && (
          <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">
            {messages.map((msg, i) => {
              const style = getMessageStyle(msg);
              // Strip name prefix for display
              const displayContent = msg.role === "user"
                ? msg.content.replace(/^\[.+?\]:\s*/, "")
                : msg.content;
              const senderName = msg.role === "user"
                ? msg.content.match(/^\[(.+?)\]:/)?.[1] || "Unknown"
                : "Lorelai";

              return (
                <div
                  key={i}
                  className={`flex animate-msg-in ${style === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  {style === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-warm-brown/8 flex items-center justify-center mr-2.5 mt-0.5 flex-shrink-0">
                      <span className="text-xs">☕</span>
                    </div>
                  )}
                  <div className="max-w-[78%]">
                    {msg.role === "user" && (
                      <p className={`text-[11px] mb-1 ${style === "me" ? "text-right text-sage-dark/50" : "text-right text-indigo-400/60"}`}>
                        {senderName}
                      </p>
                    )}
                    <div
                      className={`px-4 py-3 text-[15px] leading-relaxed ${
                        style === "me"
                          ? "bg-sage text-sage-dark rounded-[20px] rounded-br-md"
                          : style === "partner"
                          ? "bg-indigo-50 text-indigo-900/70 rounded-[20px] rounded-br-md"
                          : "bg-white text-warm-brown/80 rounded-[20px] rounded-bl-md border border-warm-brown/8 shadow-sm"
                      }`}
                    >
                      {displayContent}
                      {i === messages.length - 1 && msg.role === "assistant" && isStreaming && (
                        <span className="inline-flex ml-1.5 gap-0.5 align-middle">
                          <span className="typing-dot w-1.5 h-1.5 bg-warm-brown/30 rounded-full inline-block" />
                          <span className="typing-dot w-1.5 h-1.5 bg-warm-brown/30 rounded-full inline-block" />
                          <span className="typing-dot w-1.5 h-1.5 bg-warm-brown/30 rounded-full inline-block" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-2 bg-white rounded-[24px] border border-warm-brown/10 px-3 py-2 shadow-sm focus-within:border-warm-brown/20 focus-within:shadow-md transition-all">
            <div className="flex items-center px-2 py-1 rounded-full bg-warm-brown/5 text-warm-brown/40 text-[10px] flex-shrink-0">
              {myName}
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); resizeTextarea(); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Type something..."
              className="flex-1 resize-none bg-transparent text-[15px] text-warm-brown placeholder:text-warm-brown/25 focus:outline-none py-1.5 max-h-[120px] leading-relaxed"
              rows={1}
              disabled={isStreaming}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isStreaming || !input.trim()}
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                input.trim()
                  ? "bg-warm-brown text-cream hover:bg-warm-brown/90"
                  : "bg-warm-brown/8 text-warm-brown/20"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-warm-brown/20 mt-2.5 tracking-wide">
            A safe space for both of you
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CouplesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-brown/10 flex items-center justify-center">
            <span className="text-2xl">💕</span>
          </div>
          <p className="text-warm-brown/50 text-sm tracking-wide">Setting up your space...</p>
        </div>
      </div>
    }>
      <CouplesContent />
    </Suspense>
  );
}
