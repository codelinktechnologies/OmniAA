import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, User, Send, Calendar, CheckCircle2, AlertCircle, Sparkles, 
  ChevronRight, Smile, Phone, Video, Info, Wifi, Battery, RefreshCw,
  Paperclip, MoreHorizontal, Mic, Check, Zap, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CardGlow from "./CardGlow";
import confetti from "canvas-confetti";

interface Message {
  id: string;
  sender: "customer" | "ai";
  text: string;
  timestamp: string;
  isOffer?: boolean;
  timeSlot?: string;
  isConfirmed?: boolean;
}

interface Scenario {
  id: string;
  name: string;
  label: string;
  avatar: string;
  avatarColor: string;
  businessName: string;
  initialMessage: string;
  replies: {
    triggerKeywords: string[];
    aiResponse: string;
    hasTimeSlots?: string[];
    isConfirmation?: boolean;
  }[];
  quickOptions: string[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "skeptical",
    name: "Emma Larson",
    label: "Wellness Clinic Prospect",
    avatar: "💆‍♀️",
    avatarColor: "from-pink-500 to-rose-500",
    businessName: "Zen Float Oasis",
    initialMessage: "Hey, do you guys have any flotation therapy openings this Thursday afternoon? My back has been killing me.",
    quickOptions: [
      "Any slots around 2:00 PM?",
      "How much does a session cost?",
      "Can I reschedule later if needed?"
    ],
    replies: [
      {
        triggerKeywords: ["2:00", "afternoon", "time", "slots", "when"],
        aiResponse: "I have two slots open this Thursday for Float Therapy: 2:00 PM and 4:30 PM. Which one works best to lock in your relief?",
        hasTimeSlots: ["Thursday 2:00 PM", "Thursday 4:30 PM"]
      },
      {
        triggerKeywords: ["cost", "price", "how much", "rate"],
        aiResponse: "Our premium 60-minute flotation sessions are $85, which includes private rainfall showers & organic teas. Would you like to reserve a Thursday afternoon opening?",
        hasTimeSlots: ["Reserve Thursday Slot"]
      },
      {
        triggerKeywords: ["reschedule", "cancel", "policy"],
        aiResponse: "Completely understandable! You can change or cancel your slot with a single click up to 12 hours before with zero penalty. Shall we hold a spot for Thursday?",
        hasTimeSlots: ["Yes, please hold a spot"]
      },
      {
        triggerKeywords: ["confirm", "lock", "book", "2:00 PM", "4:30 PM", "hold"],
        aiResponse: "🎉 Incredible choice! I've placed a priority calendar hold on your session. We've delivered your 1-click confirmation ticket to your device.",
        isConfirmation: true
      }
    ]
  },
  {
    id: "urgent",
    name: "Dave Miller",
    label: "Emergency Plumbing Client",
    avatar: "👨‍🔧",
    avatarColor: "from-amber-500 to-orange-500",
    businessName: "Rapid Rescue Plumbing",
    initialMessage: "EMERGENCY: I have water backing up in my basement drain! Can you get someone out here today?!",
    quickOptions: [
      "Yes, immediately!",
      "What is your emergency dispatch fee?",
      "Can I send you a video of the drain?"
    ],
    replies: [
      {
        triggerKeywords: ["immediately", "today", "now", "yes"],
        aiResponse: "I can dispatch our lead emergency technician, Dave, to arrive between 1:30 PM and 3:00 PM today. Does that window work for you?",
        hasTimeSlots: ["Confirm Dispatch Window"]
      },
      {
        triggerKeywords: ["fee", "cost", "charge"],
        aiResponse: "Our emergency diagnostic dispatch is a flat $99 (which is fully applied toward any repair we perform today). Should I lock in your dispatch window?",
        hasTimeSlots: ["Lock In Dispatch"]
      },
      {
        triggerKeywords: ["video", "photo", "send"],
        aiResponse: "Yes, please! You can drop any photo or short video directly in this secure chat channel so our technician is fully prepared. Shall we schedule the visit first?",
        hasTimeSlots: ["Yes, book dispatch first"]
      },
      {
        triggerKeywords: ["confirm", "lock", "dispatch", "book", "window"],
        aiResponse: "⚡ Emergency dispatch authorized! Technician Dave is prepared with truck equipment and is routed to your location. SMS tracking link dispatched.",
        isConfirmation: true
      }
    ]
  },
  {
    id: "reschedule",
    name: "Brad Peterson",
    label: "Busy Dental Patient",
    avatar: "🦷",
    avatarColor: "from-blue-500 to-indigo-500",
    businessName: "Starlight Dentistry",
    initialMessage: "Hi, I have a checkup scheduled for Wednesday at 10 AM, but a work emergency came up. Can we move it?",
    quickOptions: [
      "What is open next Monday?",
      "Do you have anything early morning?",
      "No problem, let's cancel it for now."
    ],
    replies: [
      {
        triggerKeywords: ["monday", "next week", "days"],
        aiResponse: "No worries! Next Monday (July 6th) we have hygiene slots open at 9:00 AM and 2:30 PM. Would either of those fit your agenda?",
        hasTimeSlots: ["Monday 9:00 AM", "Monday 2:30 PM"]
      },
      {
        triggerKeywords: ["morning", "early", "9:00"],
        aiResponse: "Excellent. We can lock in 9:00 AM next Monday so you're in and out before your work day kicks off. Sound like a plan?",
        hasTimeSlots: ["Confirm Monday 9:00 AM"]
      },
      {
        triggerKeywords: ["cancel", "now", "later"],
        aiResponse: "I can place a tentative pause on your Wednesday slot, but let's secure a placeholder for next week so you don't lose your hygiene streak. How about next Monday morning?",
        hasTimeSlots: ["Yes, next Monday morning"]
      },
      {
        triggerKeywords: ["confirm", "lock", "yes", "9:00 AM", "2:30 PM"],
        aiResponse: "🗓️ Appointment successfully rescheduled! Your Wednesday slot is released, and your new calendar card for Monday at 9:00 AM is updated on autopilot.",
        isConfirmation: true
      }
    ]
  }
];

export default function ConversationalSimulator() {
  const [activeScenarioId, setActiveScenarioId] = useState("skeptical");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatCompleted, setChatCompleted] = useState(false);
  const [phoneTime, setPhoneTime] = useState("09:41");

  const activeScenario = SCENARIOS.find(s => s.id === activeScenarioId) || SCENARIOS[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep phone time synced
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const strHours = hours < 10 ? `0${hours}` : hours;
      const strMinutes = minutes < 10 ? `0${minutes}` : minutes;
      setPhoneTime(`${strHours}:${strMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Chat Scenario
  useEffect(() => {
    setMessages([
      {
        id: "msg_init_cust",
        sender: "customer",
        text: activeScenario.initialMessage,
        timestamp: "09:41 AM"
      },
      {
        id: "msg_init_ai",
        sender: "ai",
        text: `Hello! I'm the digital assistant for ${activeScenario.businessName}. I can check real-time availability and confirm your schedule in seconds. Let me check the calendar...`,
        timestamp: "09:41 AM"
      }
    ]);
    setChatCompleted(false);
    setUserInput("");
  }, [activeScenarioId]);

  // Auto-scroll messaging thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim() || isAiTyping || chatCompleted) return;

    // 1. Post User Reply
    const userMsgId = `msg_user_${Date.now()}`;
    const newMessages = [
      ...messages,
      { 
        id: userMsgId, 
        sender: "customer" as const, 
        text: textToSend, 
        timestamp: "Just Now" 
      }
    ];
    setMessages(newMessages);
    setUserInput("");
    setIsAiTyping(true);

    // 2. Compute AI response delay
    setTimeout(() => {
      setIsAiTyping(false);
      const textLower = textToSend.toLowerCase();
      
      // Determine response based on triggers
      let matchedResponse = activeScenario.replies.find(r => 
        r.triggerKeywords.some(keyword => textLower.includes(keyword))
      );

      // Default fallback if no keyword matched
      if (!matchedResponse) {
        matchedResponse = activeScenario.replies[0]; // fallback to first option
      }

      const isConf = matchedResponse.isConfirmation || false;
      const aiMsgId = `msg_ai_${Date.now()}`;

      setMessages(prev => [
        ...prev,
        {
          id: aiMsgId,
          sender: "ai",
          text: matchedResponse!.aiResponse,
          timestamp: "Just Now",
          timeSlot: matchedResponse!.hasTimeSlots?.[0],
          isConfirmed: isConf
        }
      ]);

      if (isConf) {
        setChatCompleted(true);
        
        const bookingLead = {
          id: "sim-booking-" + Date.now(),
          name: activeScenario.name,
          company: activeScenario.businessName,
          niche: activeScenario.label,
          email: `${activeScenario.name.toLowerCase().replace(/\s/g, "")}@gmail.com`,
          linkedin: "linkedin.com",
          source: "SMS Handshake Sandbox",
          budgetSignal: "High (Auto-Booked)",
          notes: `Simulated prospect completed conversation and reserved booking block.`,
          status: "booked" as const,
          address: "Local service sector"
        };

        const bookingApproval = {
          id: "sim-approval-" + Date.now(),
          type: "calendar_confirm" as const,
          title: `Approve Appointment: ${activeScenario.name}`,
          description: `Prospect ${activeScenario.name} auto-booked appointment for ${activeScenario.businessName} via automated chat negotiator. Click to validate.`,
          metadata: {
            time: "Next open slot, 2:00 PM CST",
            email: `${activeScenario.name.toLowerCase().replace(/\s/g, "")}@gmail.com`
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "pending" as const
        };

        const bookingActivity = {
          id: "sim-activity-" + Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modeId: "appointment_booking" as any,
          title: `Booking Secured: ${activeScenario.name}`,
          description: `Negotiated and confirmed appointment hold for ${activeScenario.businessName} calendar.`,
          status: "success" as const
        };

        try {
          const existingLeads = JSON.parse(localStorage.getItem("omniagent_leads") || "[]");
          const existingApprovals = JSON.parse(localStorage.getItem("omniagent_approvals") || "[]");
          const existingActivityLog = JSON.parse(localStorage.getItem("omniagent_activityLog") || "[]");

          localStorage.setItem("omniagent_leads", JSON.stringify([bookingLead, ...existingLeads]));
          localStorage.setItem("omniagent_approvals", JSON.stringify([bookingApproval, ...existingApprovals]));
          localStorage.setItem("omniagent_activityLog", JSON.stringify([bookingActivity, ...existingActivityLog]));
        } catch (e) {
          console.error("Simulation storage sync error:", e);
        }

        fetch("/api/dashboard-state")
          .then(res => res.json())
          .then(state => {
            const updatedLeads = [bookingLead, ...(state.leads || [])];
            const updatedApprovals = [bookingApproval, ...(state.approvals || [])];
            const updatedActivityLog = [bookingActivity, ...(state.activityLog || [])];
            
            return fetch("/api/dashboard-state", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                leads: updatedLeads,
                approvals: updatedApprovals,
                activityLog: updatedActivityLog
              })
            });
          })
          .catch(err => console.error("Error syncing simulation booking to server state:", err));

        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.8 },
          colors: ["#a855f7", "#10b981", "#3b82f6"]
        });
      }

    }, 1200);
  };

  return (
    <CardGlow 
      glowColor="rgba(168, 85, 247, 0.08)" 
      hoverBorderColor="border-slate-200 hover:border-purple-500/30"
      className="bg-white border border-slate-200/80 shadow-xl rounded-3xl p-6 md:p-8 flex flex-col justify-between h-full"
    >
      <div className="space-y-6 flex-1 flex flex-col justify-between">
        
        {/* Header block */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="bg-purple-100 text-purple-700 p-2 rounded-2xl shadow-sm">
              <MessageSquare className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold font-mono text-purple-600 uppercase tracking-widest block">FEATURE 3: HANDSHAKE SIMULATOR</span>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Interactive Smart-SMS Sandbox</h3>
            </div>
          </div>

          <p className="text-slate-600 text-xs leading-relaxed">
            Test drive the Conversational AI booking experience. Switch between client personas, choose options, or type your own responses to experience the instant friction-free booking funnel.
          </p>

          {/* Persona Selectors */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">
              SELECT INTERACTIVE CHAT PERSONA
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SCENARIOS.map((scen) => {
                const isSelected = activeScenarioId === scen.id;
                return (
                  <button
                    key={scen.id}
                    onClick={() => {
                      if (!isAiTyping) {
                        setActiveScenarioId(scen.id);
                      }
                    }}
                    disabled={isAiTyping}
                    className={`group p-2.5 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between h-20 ${
                      isSelected
                        ? "bg-purple-600 border-purple-600 shadow-lg shadow-purple-600/15 text-white transform -translate-y-0.5"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-2xl">{scen.avatar}</span>
                      {isSelected ? (
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 mt-1">
                      <h4 className={`text-[11px] font-extrabold tracking-tight truncate ${isSelected ? "text-white" : "text-slate-800"}`}>
                        {scen.name}
                      </h4>
                      <p className={`text-[9px] truncate ${isSelected ? "text-purple-200" : "text-slate-400"}`}>
                        {scen.label.split(" ")[0]} Prospect
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visual Smartphone Simulator Frame */}
        <div className="relative mx-auto mt-6 w-full max-w-[330px] bg-slate-950 rounded-[48px] p-3.5 border-[8px] border-slate-900 shadow-2xl overflow-hidden aspect-[9/18] ring-1 ring-white/10">
          
          {/* Hardware highlights */}
          <div className="absolute top-0 inset-x-0 h-full w-full rounded-[40px] border border-white/5 pointer-events-none z-30" />
          
          {/* Top Notch / Dynamic Island */}
          <div className="absolute top-2 inset-x-0 flex justify-center z-40 transition-all duration-300">
            <motion.div 
              animate={{ 
                width: isAiTyping ? 150 : 110,
                height: isAiTyping ? 24 : 20 
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-black rounded-full border border-white/10 flex items-center justify-center px-2.5 overflow-hidden shadow-md"
            >
              {isAiTyping ? (
                <div className="flex items-center space-x-2 text-[8px] font-bold text-purple-400 uppercase tracking-widest">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping" />
                  <span>AI Processing</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Sandbox</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Phone Status Bar */}
          <div className="absolute top-1.5 inset-x-0 h-6 flex justify-between items-center px-6 z-20 text-[9px] text-slate-400 font-mono font-bold select-none">
            <span className="translate-y-0.5">{phoneTime}</span>
            <div className="flex items-center space-x-1.5 translate-y-0.5">
              <Wifi className="h-3 w-3" />
              <div className="flex items-end gap-0.5 h-2.5 w-3.5 select-none">
                <span className="w-[2px] h-[30%] bg-slate-400 rounded-sm" />
                <span className="w-[2px] h-[50%] bg-slate-400 rounded-sm" />
                <span className="w-[2px] h-[75%] bg-slate-400 rounded-sm" />
                <span className="w-[2px] h-[100%] bg-slate-400 rounded-sm" />
              </div>
              <Battery className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Chat Window Content */}
          <div className="h-full pt-6 pb-12 flex flex-col justify-between bg-slate-900 rounded-[34px] overflow-hidden text-slate-100 font-sans text-xs relative">
            
            {/* Contact Header */}
            <div className="bg-slate-950/80 backdrop-blur-md px-4 py-3 pt-5 border-b border-white/5 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2.5">
                <div className="relative">
                  <div className="h-8.5 w-8.5 rounded-full bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border border-purple-500/20 flex items-center justify-center text-lg shadow-sm">
                    {activeScenario.avatar}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
                </div>
                <div>
                  <h5 className="font-extrabold text-white tracking-tight text-[11px] flex items-center gap-1">
                    {activeScenario.name}
                  </h5>
                  <p className="text-[8px] text-slate-400 font-medium truncate flex items-center gap-1">
                    <span>{activeScenario.businessName}</span>
                    <span className="text-[7px] text-emerald-400 font-semibold uppercase px-1 py-[0.5px] rounded bg-emerald-500/10 font-mono">SMS</span>
                  </p>
                </div>
              </div>
              <div className="flex space-x-2.5 text-slate-400">
                <button className="p-1 rounded-full hover:bg-white/5 hover:text-white transition">
                  <Phone className="h-3.5 w-3.5" />
                </button>
                <button className="p-1 rounded-full hover:bg-white/5 hover:text-white transition">
                  <Video className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none flex flex-col">
              
              <div className="text-center my-1 select-none">
                <span className="text-[8px] font-extrabold font-mono text-slate-500 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  💬 INSTANT SMS CHAT BLUEPRINT
                </span>
              </div>

              <div className="space-y-4 flex-1">
                <AnimatePresence initial={false}>
                  {messages.map((m) => {
                    const isUser = m.sender === "customer";
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`flex ${isUser ? "justify-end" : "justify-start"} items-end space-x-1.5`}
                      >
                        {!isUser && (
                          <div className="h-6 w-6 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[10px] select-none shadow-sm flex-shrink-0">
                            🤖
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-3 py-2.5 leading-relaxed shadow-md relative ${
                          isUser
                            ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-br-none"
                            : "bg-slate-800 text-slate-100 rounded-bl-none border border-white/5"
                        }`}>
                          <p className="text-[11px] font-medium whitespace-pre-wrap leading-relaxed">{m.text}</p>
                          
                          {/* Message Time Tag */}
                          <span className="text-[7.5px] font-mono text-white/40 block mt-1 text-right select-none">
                            {m.timestamp === "Just Now" ? phoneTime : m.timestamp}
                          </span>

                          {/* Interactive Hold Button inside Chat */}
                          {m.timeSlot && !chatCompleted && (
                            <button
                              type="button"
                              onClick={() => handleSendMessage(`Yes, lock in slot: ${m.timeSlot}`)}
                              className="mt-3 w-full bg-emerald-500 hover:bg-emerald-400 hover:scale-[1.02] text-white font-black font-mono text-[9px] py-2 px-2.5 rounded-xl border border-emerald-400/30 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
                            >
                              <Calendar className="h-3 w-3 animate-pulse" />
                              <span>CONFIRM SLOT</span>
                            </button>
                          )}

                          {/* Confirmation Ticket Badge */}
                          {m.isConfirmed && (
                            <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9.5px] text-emerald-400 font-mono flex items-start gap-1.5">
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                              <div>
                                <span className="font-extrabold block text-emerald-300 tracking-tight">CALENDAR SLOT BOOKED</span>
                                100% Autopilot Handshake Completed.
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Typing Bubble Indicator */}
                {isAiTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start items-center space-x-1.5 text-[10px] text-slate-400 font-mono pl-7 bg-transparent py-1"
                  >
                    <div className="flex space-x-1.5 items-center">
                      <span className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-[9px] italic text-slate-400">Replying instantly...</span>
                  </motion.div>
                )}
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies block */}
            {!chatCompleted && !isAiTyping && (
              <div className="px-3 pb-3 flex overflow-x-auto gap-2 scrollbar-none select-none z-10 bg-slate-900/90 backdrop-blur-sm pt-2">
                {activeScenario.quickOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(opt)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] text-purple-300 hover:text-white border border-purple-500/20 hover:border-purple-500/50 rounded-xl whitespace-nowrap font-bold transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02]"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-slate-950 border-t border-white/5 flex items-center gap-2">
              <div className="flex items-center space-x-1 text-slate-400">
                <button className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition">
                  <Paperclip className="h-3.5 w-3.5" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition">
                  <Smile className="h-3.5 w-3.5" />
                </button>
              </div>

              <input
                type="text"
                disabled={chatCompleted || isAiTyping}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage(userInput)}
                placeholder={chatCompleted ? "Booking finalized! 🎉" : "Type custom answer..."}
                className="flex-1 bg-slate-900 border border-white/5 px-3 py-2 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              
              <button
                type="button"
                onClick={() => handleSendMessage(userInput)}
                disabled={chatCompleted || isAiTyping || !userInput.trim()}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  userInput.trim() && !chatCompleted && !isAiTyping
                    ? "bg-purple-600 hover:bg-purple-500 text-white cursor-pointer hover:scale-105"
                    : "bg-slate-800 text-slate-500 cursor-default"
                }`}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Reset Session Link */}
        {chatCompleted && (
          <div className="text-center mt-4">
            <button
              onClick={() => {
                setActiveScenarioId(activeScenario.id); // Trigger re-init
              }}
              className="text-[10px] font-mono font-black text-purple-600 hover:text-purple-500 tracking-wider uppercase border border-purple-200 bg-purple-50/50 hover:bg-purple-50 px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 mx-auto transition-all"
            >
              <RefreshCw className="h-3 w-3 animate-spin" />
              REPLAY SCENARIO
            </button>
          </div>
        )}

      </div>
    </CardGlow>
  );
}
