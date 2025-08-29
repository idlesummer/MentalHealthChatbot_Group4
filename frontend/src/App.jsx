import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I’m here to help. How are you feeling today?", ts: Date.now() },
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // auto-scroll to bottom on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // autosize textarea as you type
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
  }, [text]);

  const fmt = (t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  async function send() {
    const content = text.trim();
    if (!content || busy) return;

    const next = [...messages, { role: "user", content, ts: Date.now() }];
    setMessages(next);
    setText("");
    setBusy(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content })
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: `❌ ${e.message}`, ts: Date.now() }]);
    } finally {
      setBusy(false);
    }
  }

  // Enter to send; Shift+Enter = newline
  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(80%_60%_at_50%_-10%,hsl(var(--muted))/0.6,transparent_60%)]">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <Card className="h-[80vh] sm:h-[78vh] grid grid-rows-[auto_1fr_auto] overflow-hidden border shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-background/70 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${busy ? "bg-amber-500" : "bg-emerald-500"}`} />
              <div>
                <div className="text-sm font-medium">Mental Health Chatbot</div>
                <div className="text-xs text-muted-foreground">{busy ? "Assistant is typing…" : "Ready"}</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={listRef} className="overflow-y-auto px-3 sm:px-4 py-4 space-y-3 bg-background">
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} text={m.content} time={fmt(m.ts)} />
            ))}
            {busy && <TypingIndicator />}
          </div>

          {/* Composer */}
          <div className="border-t bg-background/80 backdrop-blur px-3 sm:px-4 py-3">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your message… (Shift+Enter for newline)"
                disabled={busy}
                className="flex-1 min-h-[44px] max-h-40"
              />
              <Button onClick={send} disabled={busy || !text.trim()} className="self-end">
                {busy ? "Sending…" : "Send"}
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              This tool does not replace professional help. If you’re in crisis, contact local emergency services.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* --- UI bits --- */

function Bubble({ role, text, time }) {
  const isUser = role === "user";
  const wrap = "max-w-[85%] sm:max-w-[70%] px-3 py-2 rounded-2xl text-sm shadow-sm whitespace-pre-wrap";
  const side = isUser ? "ml-auto" : "mr-auto";
  const color = isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground";
  return (
    <div className={`${wrap} ${side} ${color}`}>
      <div>{text}</div>
      <div className={`mt-1 text-[10px] opacity-70 ${isUser ? "text-primary-foreground" : "text-muted-foreground"}`}>
        {time}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="mr-auto text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted/60">
      typing…
    </div>
  );
}