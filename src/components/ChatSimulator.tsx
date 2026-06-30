import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, MessagingPlatform, BusinessInfo } from "../types";
import { Send, Phone, Video, MoreVertical, Check, CheckCheck, Smile } from "lucide-react";

interface ChatSimulatorProps {
  businessInfo: BusinessInfo;
  platform: MessagingPlatform;
  heartbeat: string;
  status: "Active" | "Paused";
  setStatus: (s: "Active" | "Paused") => void;
  onAddLead: (lead: any) => void;
  onAddSocialPost: (post: any) => void;
  onAddActivity: (title: string, desc: string, type?: any) => void;
  onToggleMode: (modeId: any, enabled: boolean) => void;
}

export default function ChatSimulator({
  businessInfo,
  platform,
  heartbeat,
  status,
  setStatus,
  onAddLead,
  onAddSocialPost,
  onAddActivity,
  onToggleMode
}: ChatSimulatorProps) {
  const cachedAgent = localStorage.getItem("omniagent_custom_agent");
  const parsedAgent = cachedAgent ? JSON.parse(cachedAgent) : null;
  const agentName = parsedAgent ? parsedAgent.name : "OmniAgentAI";
  const avatarEmoji = parsedAgent ? parsedAgent.avatarEmoji : "🤖";

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setMessages([
      {
        id: "1",
        sender: "agent",
        text: `Hi ${businessInfo.name || "User"}! I'm your dedicated ${agentName}. I'm now active and will perform scans every ${heartbeat} for your ${businessInfo.niche || "local"} niche.

Try asking me:
- 'Find cosmetic dentist leads in Austin'
- 'What was yesterday's revenue report?'
- 'Draft a social post for Twitter'
- 'Pause my operations'`,
        timestamp: "07:00 AM"
      }
    ]);
  }, [businessInfo.name, businessInfo.niche, heartbeat, agentName]);

  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setInputMsg("");

    // Add user message to state
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // POST message to Express /api/chat backend endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          chatHistory: messages,
          agentConfig: {
            buyerName: "User",
            businessName: businessInfo.name,
            niche: businessInfo.niche,
            targetAudience: businessInfo.targetAudience,
            toneOfVoice: businessInfo.toneOfVoice,
            heartbeat
          }
        })
      });

      const data = await response.json();
      setIsTyping(false);

      if (data && data.responseText) {
        // Add Agent Response
        const agentMsg: ChatMessage = {
          id: String(Date.now() + 1),
          sender: "agent",
          text: data.responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, agentMsg]);

        // Process triggered actions
        if (data.actions && Array.isArray(data.actions)) {
          data.actions.forEach((act: any) => {
            console.log("Processing action:", act);
            if (act.type === "add_activity" && act.payload) {
              onAddActivity(act.payload.title, act.payload.description, act.payload.status);
            } else if (act.type === "add_lead" && act.payload) {
              onAddLead(act.payload);
            } else if (act.type === "add_social_post" && act.payload) {
              onAddSocialPost(act.payload);
            } else if (act.type === "toggle_mode" && act.payload) {
              onToggleMode(act.payload.modeId, act.payload.enabled);
            } else if (act.type === "set_status" && act.payload) {
              setStatus(act.payload.status);
            }
          });
        }
      }
    } catch (error) {
      console.error("Chat simulator failure:", error);
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg flex flex-col h-[520px] overflow-hidden max-w-sm w-full mx-auto font-sans">
      
      {/* Header (WhatsApp styled) */}
      <div className="bg-[#075e54] text-white p-3 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-800 border border-emerald-600/30 text-lg">
            {avatarEmoji}
          </div>
          <div>
            <h4 className="text-xs font-bold font-sans">{parsedAgent ? parsedAgent.name : "OmniAgent (OpenClaw)"}</h4>
            <span className="text-[10px] text-emerald-200 block">
              {status === "Active" ? "Online & Autonomous" : "Paused"}
            </span>
          </div>
        </div>

        <div className="flex space-x-3.5 text-emerald-100">
          <Phone className="h-4 w-4 cursor-pointer hover:text-white" />
          <Video className="h-4 w-4 cursor-pointer hover:text-white" />
          <MoreVertical className="h-4 w-4 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Message Area (WhatsApp styled tile wall) */}
      <div 
        className="flex-1 p-4 overflow-y-auto space-y-3.5"
        style={{
          backgroundColor: "#efeae2",
          backgroundImage: "radial-gradient(#dfdcd6 1px, transparent 1px)",
          backgroundSize: "16px 16px"
        }}
      >
        {messages.map((msg) => {
          const isMe = msg.sender === "user";
          return (
            <div 
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              <div 
                className={`p-3 rounded-2xl text-[11px] leading-relaxed relative shadow-sm ${
                  isMe 
                    ? "bg-[#d9fdd3] text-slate-900 rounded-tr-none border border-[#c3f0be]" 
                    : "bg-white text-slate-900 rounded-tl-none border border-slate-100"
                }`}
                style={{ wordBreak: "break-word" }}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                
                <div className="flex justify-end items-center space-x-1 mt-1 text-[8px] text-slate-400 font-mono text-right">
                  <span>{msg.timestamp}</span>
                  {isMe && <CheckCheck className="h-3 w-3 text-sky-500" />}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex flex-col items-start mr-auto max-w-[80%]">
            <div className="p-3 bg-white border border-slate-100 text-slate-500 rounded-2xl rounded-tl-none shadow-sm text-xs font-semibold flex items-center space-x-1">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-75">●</span>
              <span className="animate-bounce delay-150">●</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Tray */}
      <form onSubmit={handleSendMessage} className="bg-[#f0f2f5] p-2.5 flex items-center space-x-2 border-t border-slate-200">
        <div className="flex-1 bg-white rounded-full px-3 py-2 flex items-center space-x-2 shadow-inner border border-slate-200">
          <Smile className="h-4.5 w-4.5 text-slate-400 cursor-pointer" />
          <input
            type="text"
            className="flex-1 text-xs focus:outline-none bg-transparent"
            placeholder="Type message to agent..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          disabled={!inputMsg.trim()}
          className="p-2.5 bg-[#00a884] disabled:opacity-50 text-white rounded-full shadow hover:bg-[#008f72] transition flex items-center justify-center flex-shrink-0"
        >
          <Send className="h-3.5 w-3.5 fill-current" />
        </button>
      </form>

    </div>
  );
}
