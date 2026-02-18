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

function SteamSVG({ active }: { active: boolean }) {
  return (
    <svg
      width="40"
      height="50"
      viewBox="0 0 40 50"
      className="absolute -top-10 left-1/2 -translate-x-1/2"
    >
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

function CoffeeMicButton({
  recording,
  onClick,
}: {
  recording: boolean;
  onClick: () => void;
}) {
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
  const chatRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load user + conversations on mount
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);

      // Get profile name
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();
      setUserName(
        profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "friend"
      );

      // Load conversations
      const { data: convos } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });
      if (convos) setConversations(convos);

      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isStreaming]);

  const loadConversationMessages = async (convoId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
    setCurrentConvoId(convoId);
    setShowHistory(false);
  };

  const createNewConversation = async (
    firstMessage: string
  ): Promise<string | null> => {
    if (!userId) return null;
    const title =
      firstMessage.slice(0, 40) +
      (firstMessage.length > 40 ? "..." : "");
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: userId, title })
      .select()
      .single();
    if (error || !data) return null;
    setConversations((prev) => [data, ...prev]);
    setCurrentConvoId(data.id);
    return data.id;
  };

  const saveMessage = async (
    convoId: string,
    role: "user" | "assistant",
    content: string
  ) => {
    await supabase.from("messages").insert({
      conversation_id: convoId,
      role,
      content,
    });
    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convoId);
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;
      const userMsg: Message = { role: "user", content: text.trim() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setIsStreaming(true);

      // Create conversation if needed
      let convoId = currentConvoId;
      if (!convoId) {
        convoId = await createNewConversation(text.trim());
      }

      // Save user message
      if (convoId) await saveMessage(convoId, "user", text.trim());

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
            setMessages([
              ...newMessages,
              { role: "assistant", content: assistantText },
            ]);
          }
        }

        // Save assistant message
        if (convoId && assistantText)
          await saveMessage(convoId, "assistant", assistantText);
      } catch {
        const errMsg =
          "Ugh, my brain just glitched. Like when the WiFi at Luke's goes out. Try again? ☕";
        setMessages([
          ...newMessages,
          { role: "assistant", content: errMsg },
        ]);
        if (convoId) await saveMessage(convoId, "assistant", errMsg);
      }
      setIsStreaming(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages, isStreaming, userName, currentConvoId, userId]
  );

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

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
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
        if (event.results[i].isFinal)
          finalTranscript += event.results[i][0].transcript;
        else interim = event.results[i][0].transcript;
      }
      setTranscript(finalTranscript + interim);
    };
    recognition.onerror = () => {
      setRecording(false);
      setTranscript("");
    };
    recognition.onend = () => {
      setRecording(false);
    };
    recognition.start();
    setRecording(true);
  }, [recording, transcript, sendMessage]);

  const newChat = () => {
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
        <div className="text-center msg-enter">
          <div className="text-5xl mb-4">☕</div>
          <p className="text-coffee/60">Brewing your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-cream">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-warm-gray/50 bg-cream/80 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-coffee/60 hover:text-coffee transition-colors text-sm"
        >
          {showHistory ? "✕ Close" : "📜 History"}
        </button>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-coffee-dark">
          Lorelai <span className="text-xl">☕</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={newChat}
            className="text-coffee/60 hover:text-coffee transition-colors text-sm"
          >
            + New
          </button>
          <button
            onClick={handleSignOut}
            className="text-coffee/40 hover:text-rust transition-colors text-xs ml-1"
            title="Sign out"
          >
            🚪
          </button>
        </div>
      </header>

      {/* History Sidebar */}
      {showHistory && (
        <div className="absolute top-14 left-0 right-0 bottom-0 bg-cream/95 backdrop-blur-sm z-20 p-4 overflow-y-auto msg-enter">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl text-coffee-dark mb-4">
            Past Conversations
          </h2>
          {conversations.length === 0 ? (
            <p className="text-dark/40 text-center mt-12">
              No past conversations yet.
              <br />
              Start chatting! ☕
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => loadConversationMessages(c.id)}
                className={`w-full text-left p-3 mb-2 rounded-xl hover:bg-warm-gray/40 transition-colors ${
                  currentConvoId === c.id ? "bg-warm-gray/30" : ""
                }`}
              >
                <p className="text-dark/80 text-sm font-medium truncate">
                  {c.title}
                </p>
                <p className="text-dark/40 text-xs mt-1">
                  {new Date(c.created_at).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
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
              Hey {userName} 👋 Tap the cup to talk, or type below.
              <br />
              <span className="text-dark/30 text-xs">
                I&apos;m here whenever you need me.
              </span>
            </p>
            {transcript && (
              <div className="mt-4 px-4 py-2 bg-blue/10 rounded-xl text-sm text-dark/70 max-w-sm">
                🎙️ {transcript}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex mb-4 msg-enter ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
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
              {i === messages.length - 1 &&
                msg.role === "assistant" &&
                isStreaming && (
                  <span className="inline-flex ml-1 gap-0.5">
                    <span className="typing-dot w-1.5 h-1.5 bg-coffee/40 rounded-full inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 bg-coffee/40 rounded-full inline-block" />
                    <span className="typing-dot w-1.5 h-1.5 bg-coffee/40 rounded-full inline-block" />
                  </span>
                )}
            </div>
          </div>
        ))}

        {messages.length > 0 &&
          !isStreaming &&
          messages[messages.length - 1]?.role === "user" && (
            <div className="flex mb-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-coffee/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0 text-sm">
                ☕
              </div>
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
          <button
            onClick={toggleRecording}
            className="w-10 h-10 rounded-full bg-coffee pulse-recording flex items-center justify-center text-cream text-lg"
          >
            🎙️
          </button>
          <p className="text-sm text-dark/60 flex-1">
            {transcript || "Listening..."}
          </p>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-warm-gray/30 bg-cream/80 backdrop-blur-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2 items-center"
        >
          {messages.length > 0 && !recording && (
            <button
              type="button"
              onClick={toggleRecording}
              className="w-10 h-10 rounded-full bg-coffee/10 hover:bg-coffee/20 flex items-center justify-center transition-colors flex-shrink-0"
            >
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
