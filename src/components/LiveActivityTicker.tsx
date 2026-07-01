import React, { useState } from "react";
import { 
  Target, Sparkles, Share2, Calendar, TrendingUp, Shield, 
  Activity, Pause, Play, Settings, X, ChevronRight, Eye, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TickerItem {
  id: string;
  timestamp: string;
  agent: string;
  text: string;
  icon: any;
  color: string;
  badge: string;
  fullDetail: string;
  metrics?: { label: string; value: string }[];
}

const TICKER_ITEMS: TickerItem[] = [
  {
    id: "lead-finder-1",
    timestamp: "Just Now",
    agent: "LEAD_FINDER",
    text: "Scanned SF Bay Area & indexed 'Nirvana Float & Spa' (website booking bottleneck detected).",
    icon: Target,
    color: "text-purple-300 bg-purple-900/40 border-purple-500/30",
    badge: "GAP MATCH",
    fullDetail: "A thorough geolocational search across San Francisco analyzed digital touchpoints of local service venues. Identified that Nirvana Float & Spa has a 4.8-star Google rating with 112 positive reviews but fails to provide a frictionless mobile booking link on their website, representing a 35% customer drop-off risk.",
    metrics: [
      { label: "Target Niche", value: "Float & Spa Center" },
      { label: "Lead Quality", value: "A+ Priority" },
      { label: "Estimated Retainer", value: "$1,250/mo" }
    ]
  },
  {
    id: "personal-writer-1",
    timestamp: "2 mins ago",
    agent: "PERSONAL_WRITER",
    text: "Drafted hyper-personalized reactivate proposal to Emma Larson (Nirvana Spa). Sent to Queue.",
    icon: Sparkles,
    color: "text-blue-300 bg-blue-900/40 border-blue-500/30",
    badge: "DRAFT READY",
    fullDetail: "Generated a non-spammy, high-authority email and SMS checklist tailored specifically for Emma Larson. The message offers a '1-Click Booking Trial' and includes custom-rendered wireframes showing how their reservation workflow will look in our automated mobile portal.",
    metrics: [
      { label: "Channel", value: "Email + SMS Outbound" },
      { label: "Complexity", value: "High-Personalization" },
      { label: "Queue Status", value: "Pending Approval" }
    ]
  },
  {
    id: "social-poster-1",
    timestamp: "5 mins ago",
    agent: "SOCIAL_POSTER",
    text: "Scheduled educational carousel to LinkedIn: 'Why 78% of local patients prefer booking online after hours.'",
    icon: Share2,
    color: "text-rose-300 bg-rose-900/40 border-rose-500/30",
    badge: "POST SCHEDULED",
    fullDetail: "Compiled verified scheduling and behavioral statistics into a modern, aesthetic slide deck designed for medical and therapy practice owners. Instantly queued to deliver on LinkedIn and Facebook at peak local engagement hours.",
    metrics: [
      { label: "Social Platform", value: "LinkedIn, FB Pages" },
      { label: "Media Assets", value: "5 Slide Carousel" },
      { label: "Posting Time", value: "Tomorrow 9:00 AM" }
    ]
  },
  {
    id: "scheduler-1",
    timestamp: "12 mins ago",
    agent: "SCHEDULER",
    text: "Detected reply from Dr. Marcus Vance. Proposed Thursday 2:30 PM slot. Reserved temporary hold.",
    icon: Calendar,
    color: "text-emerald-300 bg-emerald-900/40 border-emerald-500/30",
    badge: "HOLD RESERVED",
    fullDetail: "A friendly email reply was processed from Apex Dental. The system automatically scanned calendar integrations, located mutual openings on Thursday, and placed a brief 24-hour hold to guarantee slot availability.",
    metrics: [
      { label: "Sender", value: "Dr. Marcus Vance" },
      { label: "Proposed Time", value: "Thursday 2:30 PM" },
      { label: "Hold Duration", value: "24 Hours" }
    ]
  },
  {
    id: "reporter-1",
    timestamp: "18 mins ago",
    agent: "REVENUE_REPORTER",
    text: "Logged $222.00 on Stripe API across 6 checkout events. Dispatched WhatsApp report.",
    icon: TrendingUp,
    color: "text-amber-300 bg-amber-900/40 border-amber-500/30",
    badge: "STRIPE REPORT",
    fullDetail: "Secured direct integration validation with Stripe and updated active workspace balances. Dispatched an automated morning progress update directly to the business owner's mobile phone.",
    metrics: [
      { label: "Event Type", value: "Live Stripe Webhook" },
      { label: "Daily Total", value: "$222.00" },
      { label: "Pipeline Health", value: "100% Solid" }
    ]
  },
  {
    id: "shield-1",
    timestamp: "30 mins ago",
    agent: "GUARD_SHIELD",
    text: "Completed sandbox connection integrity scans. All 6 virtual employee secure bridges SAFE.",
    icon: Shield,
    color: "text-indigo-300 bg-indigo-900/40 border-indigo-500/30",
    badge: "INTEGRITY OK",
    fullDetail: "Performed automatic security scan across secure sandbox nodes, encrypted API tunnels, database entries, and active email clients. Zero alerts triggered, assuring complete client safety and compliance.",
    metrics: [
      { label: "Scanned Nodes", value: "6 Active Agents" },
      { label: "Tunnel Status", value: "Secure (SSL/SSH)" },
      { label: "Threat Alerts", value: "0 Detected" }
    ]
  }
];

export default function LiveActivityTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [selectedItem, setSelectedItem] = useState<TickerItem | null>(null);

  // Triple the items for a smooth and infinite marquee loop
  const tripledItems = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  // Set marquee animation speed
  const getSpeedClass = () => {
    if (speed === "slow") return "duration-[90s]";
    if (speed === "fast") return "duration-[30s]";
    return "duration-[60s]";
  };

  return (
    <div className="w-full bg-[#0a051d] border-y border-purple-950/80 text-white relative z-30 select-none">
      {/* Visual Ticker Bar */}
      <div className="flex flex-col md:flex-row items-stretch max-w-7xl mx-auto divide-y md:divide-y-0 md:divide-x divide-purple-950/60">
        
        {/* Left Side: Status Panel & Active Indicator */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0c0625] flex-shrink-0 gap-3 min-w-[200px]">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black font-mono tracking-widest text-purple-300 uppercase flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-purple-400" />
              LIVE AGENT FEED
            </span>
          </div>

          {/* Micro Controls */}
          <div className="flex items-center space-x-1 bg-purple-950/60 border border-purple-800/30 p-0.5 rounded-lg text-slate-400">
            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Play Autoplay Feed" : "Pause Autoplay Feed"}
              className={`p-1 rounded-md transition hover:text-white ${isPaused ? "bg-purple-600 text-white" : "hover:bg-purple-900/30"}`}
            >
              {isPaused ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3 fill-current" />}
            </button>
            
            <div className="h-3 w-px bg-purple-900/50" />

            {/* Speed Cycling */}
            <button
              onClick={() => {
                if (speed === "slow") setSpeed("normal");
                else if (speed === "normal") setSpeed("fast");
                else setSpeed("slow");
              }}
              title={`Current Pace: ${speed.toUpperCase()}. Click to toggle speed.`}
              className="px-1.5 py-0.5 text-[8px] font-mono font-bold rounded-md hover:bg-purple-900/30 hover:text-white transition"
            >
              {speed.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Middle: Endless Scrolling Marquee */}
        <div className="overflow-hidden flex-1 flex items-center py-2 relative bg-[#09041a] min-h-[44px]">
          {/* Edge shading gradients */}
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#09041a] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#09041a] to-transparent z-10 pointer-events-none" />

          <div 
            className="flex items-center"
            style={{ WebkitMaskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)" }}
          >
            <div 
              className={`animate-marquee flex items-center gap-12 whitespace-nowrap ${getSpeedClass()}`}
              style={{ 
                animationPlayState: isPaused ? "paused" : "running",
                animationName: "marquee"
              }}
            >
              {tripledItems.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    onClick={() => setSelectedItem(item)}
                    className="inline-flex items-center space-x-3 text-xs font-mono group cursor-pointer hover:bg-white/5 px-2.5 py-1 rounded-lg border border-transparent hover:border-purple-500/20 transition-all"
                  >
                    {/* Timestamp with clock bracket */}
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-300">[{item.timestamp}]</span>
                    
                    {/* Agent Pill Badge */}
                    <span className={`flex items-center gap-1.5 text-[9px] font-black px-2 py-0.5 rounded-full border shadow-sm ${item.color}`}>
                      <IconComp className="h-2.5 w-2.5" />
                      {item.agent}
                    </span>

                    {/* Short text snippet */}
                    <span className="text-slate-200 text-[11.5px] font-sans font-semibold tracking-wide max-w-[280px] truncate">
                      {item.text}
                    </span>

                    {/* View prompt action cue */}
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-purple-950/50 border border-purple-800/40 text-purple-300 group-hover:bg-purple-800 group-hover:text-white rounded transition-colors flex items-center gap-0.5">
                      <Eye className="h-2.5 w-2.5" />
                      INSPECT
                    </span>

                    {/* Glowing Separator Bead */}
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] ml-4" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Logs Inspection Box */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full bg-[#0d072b] border-t border-purple-950 overflow-hidden relative"
          >
            <div className="max-w-6xl mx-auto p-5 md:p-6 text-slate-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Left col: Title, Badge and Core Action */}
              <div className="md:col-span-4 space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl bg-purple-900/50 border border-purple-500/30 text-purple-400`}>
                    <selectedItem.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      {selectedItem.agent}
                      <span className="px-1.5 py-0.1 text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full">ACTIVE NODE</span>
                    </div>
                    <h4 className="text-sm font-black text-white tracking-tight">{selectedItem.badge} Event Log</h4>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-400 space-y-1 bg-black/30 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between">
                    <span>EVENT ID:</span>
                    <span className="text-purple-300 font-bold">{selectedItem.id.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TIME RETRIEVED:</span>
                    <span className="text-slate-300">{selectedItem.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SANDBOX POLICY:</span>
                    <span className="text-emerald-400 font-bold">SECURE BRIDGE</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Quick simulation rerun trigger
                    const btn = document.getElementById("interactive-playground");
                    if (btn) btn.scrollIntoView({ behavior: "smooth" });
                    setSelectedItem(null);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] py-2 px-3 rounded-lg border border-purple-500 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="h-3 w-3 animate-spin-slow" />
                  RERUN IN AUTOPILOT PLAYGROUND
                </button>
              </div>

              {/* Middle col: Deep Diagnostic Information */}
              <div className="md:col-span-5 space-y-2">
                <h5 className="text-[10px] font-black font-mono text-purple-400 tracking-wider uppercase">OPERATION DIRECTIVE TELEMETRY</h5>
                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-black/15 p-4 rounded-xl border border-white/5">
                  "{selectedItem.fullDetail}"
                </p>
              </div>

              {/* Right col: Metric Badges & Close */}
              <div className="md:col-span-3 space-y-4 flex flex-col justify-between h-full min-h-[160px]">
                <div className="space-y-2.5">
                  <h5 className="text-[10px] font-black font-mono text-purple-400 tracking-wider uppercase">EVENT METRICS</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedItem.metrics?.map((m, i) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-lg border border-white/5">
                        <span className="text-slate-400 text-[10px]">{m.label}</span>
                        <span className="text-white font-bold font-mono text-[11px]">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Close Button right aligned */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="self-end bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-mono border border-white/5 flex items-center gap-1.5 transition"
                >
                  <X className="h-3 w-3" />
                  <span>CLOSE DESK</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
