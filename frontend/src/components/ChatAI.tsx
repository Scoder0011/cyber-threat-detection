// src/components/ChatAI.tsx

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Internal type — not exported
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO-8601
  remediationCommand?: string;
}

// Mock AI response bank — cybersecurity-relevant entries
const MOCK_AI_RESPONSES: string[] = [
  "Detected 3 new DDoS patterns in the last 5 minutes.",
  "Malware Bot is actively quarantining suspicious payloads.",
  "Network throughput spike detected — possible exfiltration attempt.",
  "Critical alert: Intrusion attempt from IP 192.168.1.45.",
  "All bots are operating within normal parameters.",
  "Phishing campaign detected targeting internal mail servers.",
  "Anomaly Bot flagged unusual traffic on port 8443.",
  "Blockchain verification completed for 12 alerts.",
  "System health: CPU 28%, Memory 42%, Latency 4.8ms.",
  "No new threats detected in the last 30 minutes.",
];

function getContextualResponse(query: string): { content: string; remediation?: string } {
  const lower = query.toLowerCase();

  if (lower.includes("ddos") || lower.includes("syn") || lower.includes("flood")) {
    return {
      content:
        "DDoS SYN Flood detected targeting port 80. Ingress burst exceeding 46,000 pkts/s with narrow spoofed source entropy (0.091). Recommended immediate action: enable SYN cookies and apply iptables rate limiting.",
      remediation:
        "sudo iptables -A INPUT -p tcp --syn --dport 80 -m connlimit --connlimit-above 50 -j REJECT\nsudo sysctl -w net.ipv4.tcp_syncookies=1",
    };
  }

  if (lower.includes("beacon") || lower.includes("c2")) {
    return {
      content:
        "Cobalt Strike C2 Beaconing observed with 10s base check-in interval and +/-25% Gaussian jitter. Outbound JA3 hash (4d7a28d6f2263ed61de88ca66eb011e3) matches abuse.ch ThreatFox database.",
      remediation:
        "sudo iptables -A OUTPUT -d 185.220.101.44 -j DROP\necho '127.0.0.1 malicious-c2-node.net' | sudo tee -a /etc/hosts",
    };
  }

  if (lower.includes("exfil") || lower.includes("tunnel")) {
    return {
      content:
        "Data Exfiltration detected over DNS Tunnel (dnscat2). Asymmetric egress-to-ingress ratio is 3023:1 with chunked Base32 TXT records exceeding 4.65 Shannon entropy. Host isolation recommended.",
      remediation: "sudo iptables -I FORWARD -s 10.0.0.19 -j DROP",
    };
  }

  if (lower.includes("dga") || lower.includes("domain")) {
    return {
      content:
        "Algorithmic DGA query flagged (vwqzmxrktbn.net). Character entropy 3.88 and vowel-to-consonant ratio 0.09 match DGArchive Necurs/Cryptolocker algorithm.",
      remediation: "sudo iptables -A OUTPUT -p udp --dport 53 -d 8.8.8.8 -j ACCEPT",
    };
  }

  if (lower.includes("blockchain") || lower.includes("verify") || lower.includes("proof")) {
    return {
      content:
        "Alerts with confidence >= 0.85 are committed to the AlertLog.sol smart contract on Polygon Amoy. You can verify any alert in the Alert Detail view to confirm mathematical tamper-resistance.",
    };
  }

  const idx = Math.floor(Math.random() * MOCK_AI_RESPONSES.length);
  return { content: MOCK_AI_RESPONSES[idx] };
}

function getRandomDelay(): number {
  // Random delay between 1000ms and 2000ms
  return 1000 + Math.random() * 1000;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear unread count when panel is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      // Focus input when panel opens
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Click-outside detection
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedPanel = panelRef.current?.contains(target);
      const clickedFab = fabRef.current?.contains(target);

      if (!clickedPanel && !clickedFab) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleFabClick = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const submitMessage = useCallback((content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI response after random 1–2 second delay
    const delay = getRandomDelay();
    setTimeout(() => {
      const res = getContextualResponse(trimmed);
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: res.content,
        timestamp: new Date().toISOString(),
        remediationCommand: res.remediation,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Use a ref-less approach: check isOpen indirectly via a state updater
      setIsOpen((currentIsOpen) => {
        if (!currentIsOpen) {
          setUnreadCount((c) => c + 1);
        }
        return currentIsOpen;
      });
    }, delay);
  }, []);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitMessage(inputValue);
      }
    },
    [inputValue, submitMessage]
  );

  const handleSendClick = useCallback(() => {
    submitMessage(inputValue);
  }, [inputValue, submitMessage]);

  return (
    <>
      {/* Chat panel (AnimatePresence for mount/unmount animation) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            key="chat-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-20 right-6 z-50 w-84 sm:w-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
            aria-label="AI chat assistant panel"
            role="dialog"
            aria-modal="false"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
                <span className="text-sm font-semibold text-white font-mono">AI SOC Assistant</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
                aria-label="Close AI chat assistant"
              >
                {/* X icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Message list */}
            <div
              className="flex flex-col gap-3 px-4 py-3 overflow-y-auto"
              style={{ maxHeight: "300px" }}
              aria-live="polite"
              aria-label="Chat message history"
            >
              {messages.length === 0 && (
                <p className="text-gray-500 text-xs text-center py-4">
                  Ask me about current threats, DDoS mitigations, C2 jitter, or blockchain proofs.
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed break-words ${
                      msg.role === "user"
                        ? "bg-cyan-600 text-white rounded-br-sm"
                        : "bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-sm"
                    }`}
                    aria-label={`${msg.role === "user" ? "You" : "Assistant"}: ${msg.content}`}
                  >
                    <p>{msg.content}</p>
                    {msg.remediationCommand && (
                      <div className="mt-2 p-2 bg-gray-950 rounded border border-gray-700 font-mono text-[10px] text-emerald-400 overflow-x-auto">
                        <div className="text-gray-500 text-[9px] mb-0.5 uppercase tracking-wider">Remediation Command:</div>
                        <pre>{msg.remediationCommand}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-1.5 bg-gray-900 border-t border-gray-800 flex gap-1.5 overflow-x-auto text-[10px] font-mono">
              <button
                type="button"
                onClick={() => submitMessage("How to mitigate active DDoS attack?")}
                className="px-2 py-0.5 rounded bg-gray-800 text-cyan-400 border border-gray-700 hover:border-cyan-500/40 whitespace-nowrap"
              >
                Mitigate DDoS
              </button>
              <button
                type="button"
                onClick={() => submitMessage("Explain C2 Beaconing jitter")}
                className="px-2 py-0.5 rounded bg-gray-800 text-amber-400 border border-gray-700 hover:border-amber-500/40 whitespace-nowrap"
              >
                C2 Jitter
              </button>
              <button
                type="button"
                onClick={() => submitMessage("Verify blockchain proofs")}
                className="px-2 py-0.5 rounded bg-gray-800 text-purple-400 border border-gray-700 hover:border-purple-500/40 whitespace-nowrap"
              >
                On-Chain Proof
              </button>
            </div>

            {/* Input area */}
            <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-700 bg-gray-800">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Ask about threats, MITRE TTPs..."
                maxLength={500}
                className="flex-1 bg-gray-700 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 border border-gray-600"
                aria-label="Chat message input"
              />
              <button
                type="button"
                onClick={handleSendClick}
                disabled={!inputValue.trim()}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 shrink-0"
                aria-label="Send message"
              >
                {/* Send icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB — always visible, fixed bottom-right */}
      <button
        ref={fabRef}
        type="button"
        onClick={handleFabClick}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white flex items-center justify-center shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        aria-label="Open AI chat assistant"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {/* Notification badge */}
        {unreadCount > 0 && !isOpen && (
          <span
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none"
            aria-label={`${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Chat / close icon toggle */}
        {isOpen ? (
          // Chevron-down icon when open
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          // Chat bubble icon when closed
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </>
  );
}

export default ChatAI;
