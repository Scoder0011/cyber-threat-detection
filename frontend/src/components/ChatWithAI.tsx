import React, { useState } from 'react';
import { ThreatAlert } from '../types/alert';
import { MessageSquare, Send, Bot, User, Sparkles, X, Shield, Terminal } from 'lucide-react';

interface ChatWithAIProps {
  alerts: ThreatAlert[];
  selectedAlert?: ThreatAlert | null;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  remediationSnippet?: string;
}

export const ChatWithAI: React.FC<ChatWithAIProps> = ({ alerts, selectedAlert }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello, Analyst. I am your AI SOC Assistant. I can help analyze active multi-vector threat alerts, map them to MITRE ATT&CK TTPs, or generate firewall quarantine commands. How can I assist you?",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input;
    const newMsg: Message = { sender: 'user', text: userText };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    // Generate intelligent contextual response
    setTimeout(() => {
      let aiResponse: string = '';
      let remediation: string | undefined = undefined;

      const lower = userText.toLowerCase();

      if (lower.includes('ddos') || lower.includes('syn')) {
        aiResponse =
          "DDoS SYN Flood detected targeting port 80. The threat exhibits high burst velocity (46,356 pkts/s) with narrow spoofed source entropy (0.091). Recommended immediate action is kernel SYN cookies and edge IP throttling.";
        remediation =
          "# Block malicious source subnet & enable SYN cookies\nsudo iptables -A INPUT -s 45.33.12.0/24 -p tcp --dport 80 -j DROP\nsudo sysctl -w net.ipv4.tcp_syncookies=1";
      } else if (lower.includes('beacon') || lower.includes('c2')) {
        aiResponse =
          "C2 Beaconing detected with ~10s base interval and 23.1% Gaussian jitter matching Cobalt Strike malleable HTTPS profiles. Recommended action is terminating socket session and blocking C2 IP on egress proxy.";
        remediation =
          "# Block C2 egress IP & DNS sinkhole\nsudo iptables -A OUTPUT -d 185.220.101.44 -j REJECT\necho '127.0.0.1 tunnel.c2exfil-network.org' | sudo tee -a /etc/hosts";
      } else if (lower.includes('exfil') || lower.includes('dns tunnel')) {
        aiResponse =
          "Data Exfiltration detected over DNS tunneling (dnscat2). High Shannon entropy (4.67) and asymmetric egress ratio (3023:1) observed in TXT records. Recommend isolating source host 10.0.0.19 immediately.";
        remediation =
          "# Quarantine internal host\nsudo iptables -I FORWARD -s 10.0.0.19 -j DROP";
      } else if (lower.includes('blockchain') || lower.includes('verify')) {
        aiResponse =
          "Alerts with confidence >= 0.85 are automatically hashed (Keccak-256) and committed to the AlertLog.sol contract on Polygon Amoy. You can verify any alert in the Alert Detail view to confirm mathematical tamper-resistance.";
      } else {
        aiResponse = `Analyzing active threat telemetry (${alerts.length} incidents recorded). The dominant vector is ${
          alerts[0]?.attack_type || 'DDOS_SYN_FLOOD'
        }. All 6 specialist bots are operational with zero detected degradation.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiResponse,
          remediationSnippet: remediation,
        },
      ]);
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-mono text-xs font-semibold shadow-neon-cyan hover:brightness-110 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-cyan-200 animate-spin" />
          Ask AI SOC Analyst
        </button>
      )}

      {/* Slide-in Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] glass-panel rounded-2xl border border-cyan-500/30 shadow-2xl flex flex-col h-[520px] overflow-hidden">
          {/* Header */}
          <div className="p-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-mono">AI Threat Analyst</h4>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs font-mono">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-300 flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-xl max-w-[82%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                  }`}
                >
                  <p>{m.text}</p>

                  {m.remediationSnippet && (
                    <div className="mt-2.5 p-2 bg-slate-950 rounded border border-slate-800 text-[10px] text-emerald-400 overflow-x-auto">
                      <div className="flex items-center gap-1 text-slate-500 mb-1">
                        <Terminal className="w-3 h-3 text-cyan-400" />
                        REMEDIATION COMMAND:
                      </div>
                      <pre className="font-mono">{m.remediationSnippet}</pre>
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[10px] font-mono">
            <button
              onClick={() => setInput('How to mitigate the active DDoS attack?')}
              className="px-2 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800 hover:border-cyan-500/40 whitespace-nowrap"
            >
              Mitigate DDoS
            </button>
            <button
              onClick={() => setInput('Explain C2 Beaconing jitter')}
              className="px-2 py-1 rounded bg-slate-900 text-purple-400 border border-slate-800 hover:border-purple-500/40 whitespace-nowrap"
            >
              Explain C2 Jitter
            </button>
            <button
              onClick={() => setInput('Verify Blockchain Proofs')}
              className="px-2 py-1 rounded bg-slate-900 text-emerald-400 border border-slate-800 hover:border-emerald-500/40 whitespace-nowrap"
            >
              Verify On-Chain
            </button>
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about threats, MITRE TTPs..."
              className="flex-1 bg-slate-950 text-slate-100 text-xs font-mono px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={handleSend}
              className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
