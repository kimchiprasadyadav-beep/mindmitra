"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Message = { role: "user" | "assistant"; content: string };
type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

const STARTERS = [
  "How are you feeling?",
  "I need to vent",
  "Help me reflect",
];

const MOODS = [
  { emoji: "😊", label: "Great" },
  { emoji: "😌", label: "Good" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😔", label: "Low" },
  { emoji: "😰", label: "Anxious" },
];

const CRISIS_NUMBERS = [
  { name: "iCall", number: "9152987821" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", note: "24/7" },
  { name: "AASRA", number: "9820466726" },
];

export default function Home() {
  const supabase = createClient();
  const router = useRouter();

  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvoId, setCurrentConvoId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTemporary, setIsTemporary] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMoodCheckin, setShowMoodCheckin] = useState(true);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const resizeTextarea = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };

  // Play TTS audio
  const playVoice = async (text: string) => {
    if (!voiceEnabled || !text.trim()) return;
    try {
      setIsPlaying(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsPlaying(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch { setIsPlaying(false); }
  };

  // Init
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
      setUserName(profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "friend");
      const { data: convos } = await supabase.from("conversations").select("*").order("updated_at", { ascending: false });
      if (convos) setConversations(convos);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isStreaming]);

  const loadConversationMessages = async (convoId: string) => {
    const { data } = await supabase.from("messages").select("role, content").eq("conversation_id", convoId).order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
    setCurrentConvoId(convoId);
    setShowHistory(false);
  };

  const createNewConversation = async (firstMessage: string): Promise<string | null> => {
    if (!userId) return null;
    const title = firstMessage.slice(0, 40) + (firstMessage.length > 40 ? "..." : "");
    const { data, error } = await supabase.from("conversations").insert({ user_id: userId, title }).select().single();
    if (error || !data) return null;
    setConversations((prev) => [data, ...prev]);
    setCurrentConvoId(data.id);
    return data.id;
  };

  const saveMessage = async (convoId: string, role: "user" | "assistant", content: string) => {
    await supabase.from("messages").insert({ conversation_id: convoId, role, content });
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convoId);
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; }
    setIsStreaming(true);

    let convoId = currentConvoId;
    if (!isTemporary) {
      if (!convoId) convoId = await createNewConversation(text.trim());
      if (convoId) await saveMessage(convoId, "user", text.trim());
    }

    try {
      const pastSessions = conversations.slice(0, 5).map((c) => c.title);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, userName, mood: selectedMood, pastSessions }),
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
      if (!isTemporary && convoId && assistantText) await saveMessage(convoId, "assistant", assistantText);
      // Check if response contains helpline numbers (crisis detection)
      if (assistantText && (assistantText.includes("9152987821") || assistantText.includes("1860-2662-345") || assistantText.includes("9820466726"))) {
        setShowCrisisBanner(true);
      }
      if (assistantText) playVoice(assistantText);
    } catch {
      const errMsg = "I'm having a moment — can you try again? 💛";
      setMessages([...newMessages, { role: "assistant", content: errMsg }]);
      if (!isTemporary && convoId) await saveMessage(convoId, "assistant", errMsg);
    }
    setIsStreaming(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isStreaming, userName, currentConvoId, userId, isTemporary, selectedMood, conversations]);

  const toggleRecording = useCallback(() => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      if (transcript.trim()) { sendMessage(transcript); setTranscript(""); }
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition not supported. Try Chrome!"); return; }
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
    recognition.onend = () => setRecording(false);
    recognition.start();
    setRecording(true);
  }, [recording, transcript, sendMessage]);

  const newChat = (temp?: boolean) => {
    setMessages([]);
    setCurrentConvoId(null);
    setSelectedMood(null);
    setShowMoodCheckin(true);
    setShowCrisisBanner(false);
    if (temp !== undefined) setIsTemporary(temp);
  };

  const deleteConversation = async (convoId: string) => {
    setDeletingId(convoId);
    await supabase.from("messages").delete().eq("conversation_id", convoId);
    await supabase.from("conversations").delete().eq("id", convoId);
    setConversations((prev) => prev.filter((c) => c.id !== convoId));
    if (currentConvoId === convoId) { setMessages([]); setCurrentConvoId(null); }
    setDeletingId(null);
  };

  const deleteAllConversations = async () => {
    if (!userId) return;
    const ids = conversations.map((c) => c.id);
    for (const id of ids) {
      await supabase.from("messages").delete().eq("conversation_id", id);
    }
    await supabase.from("conversations").delete().eq("user_id", userId);
    setConversations([]);
    setMessages([]);
    setCurrentConvoId(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-brown/10 flex items-center justify-center">
            <span className="text-2xl">☕</span>
          </div>
          <p className="text-warm-brown/50 text-sm tracking-wide">Brewing your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-cream">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-warm-brown/8">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-warm-brown/5 transition-colors"
          title="History"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-warm-brown/40">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>

        <h1 className="font-[family-name:var(--font-playfair)] text-[22px] text-warm-brown tracking-tight">
          Lorelai
        </h1>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowBreathing(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-warm-brown/5 transition-colors text-warm-brown/40"
            title="Breathing exercise"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4l2 2" />
            </svg>
          </button>
          {isTemporary && (
            <span className="text-[10px] text-warm-brown/30 mr-1">temp</span>
          )}
          <button
            onClick={() => newChat(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-warm-brown/5 transition-colors"
            title="New conversation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-warm-brown/40">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button
            onClick={() => newChat(true)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isTemporary ? "bg-warm-brown/10 text-warm-brown/60" : "hover:bg-warm-brown/5 text-warm-brown/30"
            }`}
            title="Temporary chat (not saved)"
          >

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>
      </header>

      {/* History Panel */}
      {showHistory && (
        <div className="absolute top-[57px] left-0 right-0 bottom-0 bg-cream/98 backdrop-blur-md z-20 animate-fade-in">
          <div className="p-5 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-playfair)] text-lg text-warm-brown">Past Conversations</h2>
              <button onClick={() => setShowHistory(false)} className="text-warm-brown/40 hover:text-warm-brown text-sm">✕</button>
            </div>
            {conversations.length === 0 ? (
              <p className="text-warm-brown/30 text-center mt-16 text-sm">No conversations yet.<br />Start one below.</p>
            ) : (
              <>
              <div className="space-y-1">
                {conversations.map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-center rounded-xl transition-colors ${
                      currentConvoId === c.id ? "bg-warm-brown/8" : "hover:bg-warm-brown/4"
                    }`}
                  >
                    <button
                      onClick={() => loadConversationMessages(c.id)}
                      className="flex-1 text-left px-4 py-3"
                    >
                      <p className="text-warm-brown/70 text-sm truncate">{c.title}</p>
                      <p className="text-warm-brown/30 text-xs mt-0.5">{new Date(c.created_at).toLocaleDateString()}</p>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                      disabled={deletingId === c.id}
                      className="w-8 h-8 mr-2 rounded-full flex items-center justify-center text-warm-brown/20 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                      title="Delete"
                    >
                      {deletingId === c.id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
              {conversations.length >= 2 && (
                <button
                  onClick={() => { if (confirm("Delete all conversations? This can\u0027t be undone.")) deleteAllConversations(); }}
                  className="mt-4 text-red-300 hover:text-red-400 text-xs transition-colors"
                >
                  Delete all conversations
                </button>
              )}
              </>
            )}
            <button onClick={handleSignOut} className="mt-8 text-warm-brown/25 hover:text-warm-brown/50 text-xs transition-colors">
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Crisis Banner */}
      {showCrisisBanner && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 animate-fade-in">
          <div className="max-w-2xl mx-auto flex items-start gap-3">
            <span className="text-red-400 text-lg flex-shrink-0">💛</span>
            <div className="flex-1">
              <p className="text-red-800 text-sm font-medium mb-1">You&apos;re not alone. Help is available right now:</p>
              <div className="flex flex-wrap gap-3 text-xs">
                {CRISIS_NUMBERS.map((c) => (
                  <a key={c.number} href={`tel:${c.number}`} className="text-red-700 hover:text-red-900 underline">
                    {c.name}: {c.number}{c.note ? ` (${c.note})` : ""}
                  </a>
                ))}
              </div>
            </div>
            <button onClick={() => setShowCrisisBanner(false)} className="text-red-300 hover:text-red-500 text-sm flex-shrink-0">✕</button>
          </div>
        </div>
      )}

      {/* Breathing Exercise Overlay */}
      {showBreathing && (
        <div className="fixed inset-0 bg-cream z-50 flex flex-col items-center justify-center animate-fade-in">
          <button
            onClick={() => setShowBreathing(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-warm-brown/40 hover:text-warm-brown hover:bg-warm-brown/5 transition-colors text-lg"
          >
            ✕
          </button>
          <div className="breathing-circle w-40 h-40 rounded-full bg-warm-brown/10 border-2 border-warm-brown/20 flex items-center justify-center mb-8">
            <div className="breathing-text text-warm-brown/60 text-sm font-medium tracking-wide" />
          </div>
          <p className="text-warm-brown/40 text-sm">Follow the circle. Breathe gently.</p>
        </div>
      )}

      {/* Chat Area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto">
        {/* Mood Check-in (before empty state) */}
        {messages.length === 0 && !recording && showMoodCheckin && !currentConvoId && (
          <div className="flex flex-col items-center justify-center h-full px-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-warm-brown/6 flex items-center justify-center mb-6">
              <span className="text-3xl">☕</span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-warm-brown mb-2">
              How are you feeling?
            </h2>
            <p className="text-warm-brown/40 text-sm text-center mb-8">
              Take a moment to check in with yourself.
            </p>
            <div className="flex gap-4 mb-8">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => { setSelectedMood(m.label); setShowMoodCheckin(false); }}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-warm-brown/5 transition-all hover:scale-105"
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-warm-brown/50 text-xs">{m.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMoodCheckin(false)}
              className="text-warm-brown/25 text-xs hover:text-warm-brown/40 transition-colors"
            >
              Skip
            </button>
          </div>
        )}

        {/* Empty State */}
        {messages.length === 0 && !recording && (!showMoodCheckin || !!currentConvoId) && (
          <div className="flex flex-col items-center justify-center h-full px-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-warm-brown/6 flex items-center justify-center mb-6">
              <span className="text-3xl">☕</span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-warm-brown mb-2">
              Hey there 👋
            </h2>
            <p className="text-warm-brown/40 text-sm text-center mb-8 leading-relaxed">
              I&apos;m here whenever you need me.<br />Take your time.
            </p>
            {selectedMood && (
              <p className="text-warm-brown/30 text-xs mb-4">Feeling {selectedMood.toLowerCase()} today</p>
            )}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-4 py-2 rounded-full border border-warm-brown/12 text-warm-brown/50 text-sm hover:bg-warm-brown/5 hover:text-warm-brown/70 hover:border-warm-brown/20 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowBreathing(true)}
              className="px-4 py-2 rounded-full border border-warm-brown/8 text-warm-brown/30 text-xs hover:bg-warm-brown/5 hover:text-warm-brown/50 transition-all"
            >
              🫁 Breathing exercise
            </button>
          </div>
        )}

        {/* Recording empty state */}
        {messages.length === 0 && recording && (
          <div className="flex flex-col items-center justify-center h-full px-6 animate-fade-in">
            <button
              onClick={toggleRecording}
              className="w-24 h-24 rounded-full bg-warm-brown flex items-center justify-center mb-6 pulse-recording"
            >
              <span className="text-4xl">🎙️</span>
            </button>
            <p className="text-warm-brown/50 text-sm text-center">
              {transcript || "Listening..."}
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex animate-msg-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-warm-brown/8 flex items-center justify-center mr-2.5 mt-0.5 flex-shrink-0">
                    <span className="text-xs">☕</span>
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-4 py-3 text-[15px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-sage text-sage-dark rounded-[20px] rounded-br-md"
                      : "bg-white text-warm-brown/80 rounded-[20px] rounded-bl-md border border-warm-brown/8 shadow-sm"
                  }`}
                >
                  {msg.content}
                  {i === messages.length - 1 && msg.role === "assistant" && isStreaming && (
                    <span className="inline-flex ml-1.5 gap-0.5 align-middle">
                      <span className="typing-dot w-1.5 h-1.5 bg-warm-brown/30 rounded-full inline-block" />
                      <span className="typing-dot w-1.5 h-1.5 bg-warm-brown/30 rounded-full inline-block" />
                      <span className="typing-dot w-1.5 h-1.5 bg-warm-brown/30 rounded-full inline-block" />
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator when waiting */}
            {messages.length > 0 && !isStreaming && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start animate-msg-in">
                <div className="w-8 h-8 rounded-full bg-warm-brown/8 flex items-center justify-center mr-2.5 mt-0.5 flex-shrink-0">
                  <span className="text-xs">☕</span>
                </div>
                <div className="px-4 py-3 rounded-[20px] rounded-bl-md bg-white border border-warm-brown/8 shadow-sm">
                  <span className="inline-flex gap-0.5">
                    <span className="typing-dot w-1.5 h-1.5 bg-warm-brown/30 rounded-full inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 bg-warm-brown/30 rounded-full inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 bg-warm-brown/30 rounded-full inline-block" />
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recording bar */}
      {recording && messages.length > 0 && (
        <div className="px-5 py-3 bg-warm-brown/3 border-t border-warm-brown/8 flex items-center gap-3 animate-fade-in">
          <button
            onClick={toggleRecording}
            className="w-10 h-10 rounded-full bg-warm-brown pulse-recording flex items-center justify-center text-cream"
          >
            🎙️
          </button>
          <p className="text-sm text-warm-brown/50 flex-1">{transcript || "Listening..."}</p>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-2 bg-white rounded-[24px] border border-warm-brown/10 px-3 py-2 shadow-sm focus-within:border-warm-brown/20 focus-within:shadow-md transition-all">
            {/* Mic button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                recording ? "bg-warm-brown text-cream" : "hover:bg-warm-brown/5 text-warm-brown/30"
              }`}
              title={recording ? "Stop" : "Voice input"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>

            {/* Text input */}
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

            {/* Voice toggle */}
            <button
              type="button"
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (isPlaying && audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors text-xs ${
                voiceEnabled ? "text-warm-brown/40" : "text-warm-brown/15"
              }`}
              title={voiceEnabled ? "Voice on" : "Voice off"}
            >
              {voiceEnabled ? "🔊" : "🔇"}
            </button>

            {/* Send button */}
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
            Not a replacement for professional therapy
          </p>
        </div>
      </div>
    </div>
  );
}
