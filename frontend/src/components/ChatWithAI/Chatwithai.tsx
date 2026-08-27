import { useState } from "react";

interface ChatMsg {
  role: "analyst" | "assistant";
  text: string;
}

// Wire this to your backend's LLM route, e.g. POST /api/chat { message }
export function ChatWithAI() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setMessages((m) => [...m, { role: "analyst", text }]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", text: data.reply ?? "(no reply)" }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Could not reach the analyst service." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-hairline bg-panel">
      <div className="border-b border-hairline px-4 py-3">
        <h3 className="font-display text-sm font-semibold tracking-wide text-ink">
          Ask the Analyst
        </h3>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin px-4 py-3">
        {messages.length === 0 && (
          <p className="font-mono text-xs text-dim">
            Ask about a source IP, a threat class, or "why was this flagged".
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded px-3 py-2 font-mono text-xs ${
              m.role === "analyst"
                ? "ml-auto bg-flow/10 text-ink"
                : "bg-panel2 text-dim"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-hairline p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Query the log…"
          className="flex-1 rounded border border-hairline bg-panel2 px-3 py-1.5 font-mono text-xs text-ink outline-none focus:border-flow"
        />
        <button
          onClick={send}
          disabled={sending}
          className="rounded bg-flow px-3 py-1.5 font-mono text-xs text-void disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}