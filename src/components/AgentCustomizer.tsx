import React, { useState } from "react";
import { 
  User, Check, Cpu, Award, Badge, Settings, Star, Layers, Activity,
  Calendar, CreditCard, Share2, MessageSquare, MapPin, Play, CheckCircle, HelpCircle, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CardGlow from "./CardGlow";
import confetti from "canvas-confetti";

interface AgentRole {
  id: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  avatarEmoji: string;
  baseSkills: string[];
  suggestedName: string;
  glowColor: string;
  avatarColor: string;
}

const ROLES: AgentRole[] = [
  {
    id: "scout",
    name: "Outbound Lead Hunter",
    shortDesc: "Scrapes Google Maps & reviews to detect booking funnel gaps.",
    longDesc: "Monitors localized service keywords, cross-checks listings for Calendly/booking widgets, and filters out already optimized practices. Runs 24/7 on local databases.",
    avatarEmoji: "🎯",
    baseSkills: ["maps_scraper", "proposal_writer"],
    suggestedName: "Scout-X9",
    glowColor: "rgba(168, 85, 247, 0.15)",
    avatarColor: "from-purple-500 to-indigo-500"
  },
  {
    id: "scheduler",
    name: "Smart Calendar Negotiator",
    shortDesc: "Interacts with lead replies to book available slots on autopilot.",
    longDesc: "Reads context of incoming responses, matches free blocks on your calendar, places tentative client holds, and dispatches holding links for confirmation.",
    avatarEmoji: "🗓️",
    baseSkills: ["calendar_sync", "sms_delivery"],
    suggestedName: "BookMate",
    glowColor: "rgba(59, 130, 246, 0.15)",
    avatarColor: "from-blue-500 to-indigo-500"
  },
  {
    id: "reactivator",
    name: "Dormant Lead Reactivator",
    shortDesc: "Re-engages dead CRM prospects with targeted promotions.",
    longDesc: "Scans past client directories for accounts inactive for 90+ days and delivers hyper-personalized outreach campaigns to win back their booking flow.",
    avatarEmoji: "🔥",
    baseSkills: ["sms_delivery", "proposal_writer"],
    suggestedName: "ReactivatePro",
    glowColor: "rgba(244, 63, 94, 0.15)",
    avatarColor: "from-rose-500 to-purple-500"
  },
  {
    id: "broadcaster",
    name: "Autopilot Brand Publisher",
    shortDesc: "Compiles content and designs social carousels to establish authority.",
    longDesc: "Monitors daily market benchmarks, builds slide-decks with authority stats, and schedules them across LinkedIn, Google Business profile, and Facebook.",
    avatarEmoji: "📢",
    baseSkills: ["social_publisher", "proposal_writer"],
    suggestedName: "OmniPost-AI",
    glowColor: "rgba(16, 185, 129, 0.15)",
    avatarColor: "from-emerald-500 to-teal-500"
  }
];

const TONES = [
  { id: "warm", label: "Consultative & Warm", icon: "🤝", desc: "Focuses on helping, asking questions, and avoiding pushy marketing pitches." },
  { id: "corporate", label: "Polished & Executive", icon: "💼", desc: "Authoritative, fact-driven, professional tone tailored for high-ticket medical/legal fields." },
  { id: "bold", label: "Direct & Conversion-First", icon: "⚡", desc: "Short, punchy hooks, immediate value propositions, designed for quick action." }
];

const ADD_ON_SKILLS = [
  { id: "maps_scraper", label: "Google Maps Scraper", icon: MapPin, desc: "Extract reviews, positions, and phone directories." },
  { id: "calendar_sync", label: "GCal & Outlook Sync", icon: Calendar, desc: "Read free blocks and place automated system holds." },
  { id: "proposal_writer", label: "Smart Proposal Compiler", icon: Cpu, desc: "Personalize body copy using real business telemetry." },
  { id: "sms_delivery", label: "Twilio SMS Dispatcher", icon: MessageSquare, desc: "Coordinate immediate SMS alerts & booking templates." },
  { id: "social_publisher", label: "LinkedIn & FB API Publisher", icon: Share2, desc: "Post carousels and industry benchmark graphics." },
  { id: "billing", label: "Stripe Ledger Integrator", icon: CreditCard, desc: "Process payments & check live dashboard payouts." }
];

export default function AgentCustomizer({ onDeploy }: { onDeploy?: () => void }) {
  const [selectedRoleId, setSelectedRoleId] = useState("scout");
  const [selectedToneId, setSelectedToneId] = useState("warm");
  const [customName, setCustomName] = useState("");
  const [mountedSkills, setMountedSkills] = useState<string[]>(ROLES[0].baseSkills);
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [deployedAgent, setDeployedAgent] = useState<any | null>(null);

  const selectedRole = ROLES.find(r => r.id === selectedRoleId) || ROLES[0];
  const selectedTone = TONES.find(t => t.id === selectedToneId) || TONES[0];

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    const role = ROLES.find(r => r.id === roleId);
    if (role) {
      setMountedSkills(role.baseSkills);
      setCustomName("");
    }
  };

  const toggleSkill = (skillId: string) => {
    if (mountedSkills.includes(skillId)) {
      if (mountedSkills.length > 1) {
        setMountedSkills(mountedSkills.filter(id => id !== skillId));
      }
    } else {
      setMountedSkills([...mountedSkills, skillId]);
    }
  };

  const deploySteps = [
    "🧠 Cloning autonomous agent model node...",
    "🧱 Mounting API gateways for selected integrations...",
    "✍️ Calibration of personality tone and validation filters...",
    "🛡️ Registering secure sandbox workspace ID..."
  ];

  const handleDeploy = () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setDeployStep(0);
    setDeployedAgent(null);

    deploySteps.forEach((step, idx) => {
      setTimeout(() => {
        setDeployStep(idx + 1);
        if (idx === deploySteps.length - 1) {
          setIsDeploying(false);
          setDeployedAgent({
            name: customName.trim() || selectedRole.suggestedName,
            roleName: selectedRole.name,
            avatarEmoji: selectedRole.avatarEmoji,
            avatarColor: selectedRole.avatarColor,
            glowColor: selectedRole.glowColor,
            tone: selectedTone.label,
            skillsCount: mountedSkills.length,
            operatingHours: 168,
            agentId: `OAI-${Math.floor(1000 + Math.random() * 9000)}`,
            efficiency: Math.floor(95 + Math.random() * 5)
          });

          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.85 },
            colors: ["#a855f7", "#10b981", "#3b82f6"]
          });
        }
      }, (idx + 1) * 1000);
    });
  };

  return (
    <CardGlow 
      glowColor={selectedRole.glowColor} 
      hoverBorderColor="border-slate-200 hover:border-purple-500/30"
      className="bg-white border border-slate-200/80 shadow-xl rounded-3xl p-6 md:p-8"
    >
      <div className="space-y-6">
        
        {/* Header Block */}
        <div className="flex items-center space-x-2">
          <div className="bg-purple-100 text-purple-700 p-2 rounded-xl">
            <Cpu className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold font-mono text-purple-600 uppercase tracking-widest block">FEATURE 2: AGENT CREATOR</span>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Configure Your Virtual Employee</h3>
          </div>
        </div>

        <p className="text-slate-600 text-xs leading-relaxed">
          Design your first automated specialist. Choose their focus, calibrate their outreach tone, and select custom skill APIs to mount. Deploy in real-time.
        </p>

        {/* 1. Select Role */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">1. Choose Specialization Role</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROLES.map((role) => (
              <button
                type="button"
                key={role.id}
                disabled={isDeploying}
                onClick={() => handleRoleChange(role.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedRoleId === role.id
                    ? "bg-purple-50/50 border-purple-500 ring-2 ring-purple-500/10"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">{role.avatarEmoji}</span>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 tracking-tight">{role.name}</h4>
                    <p className="text-[10.5px] text-slate-500 leading-normal mt-0.5">{role.shortDesc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Select Tone */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">2. Calibrate Outbound Persona Tone</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TONES.map((tone) => (
              <button
                type="button"
                key={tone.id}
                disabled={isDeploying}
                onClick={() => setSelectedToneId(tone.id)}
                className={`p-3 rounded-2xl border text-left transition ${
                  selectedToneId === tone.id
                    ? "bg-purple-50/50 border-purple-500 ring-1 ring-purple-500/10"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{tone.icon}</span>
                  <span className="text-xs font-bold text-slate-800 tracking-tight">{tone.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal mt-1">{tone.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Assign Custom Skills */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">3. Mount Capabilities & Integrations</label>
            <span className="text-[9px] font-mono text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded font-bold">
              {mountedSkills.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {ADD_ON_SKILLS.map((skill) => {
              const IconComp = skill.icon;
              const isSelected = mountedSkills.includes(skill.id);
              return (
                <button
                  type="button"
                  key={skill.id}
                  disabled={isDeploying}
                  onClick={() => toggleSkill(skill.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-start space-x-2 ${
                    isSelected
                      ? "bg-white border-purple-500 shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100/50 border-slate-200 text-slate-600"
                  }`}
                >
                  <div className={`p-1 rounded-lg mt-0.5 ${
                    isSelected ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-500"
                  }`}>
                    <IconComp className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-bold text-slate-800 tracking-tight truncate">{skill.label}</span>
                      {isSelected && <Check className="h-3 w-3 text-purple-600 flex-shrink-0" />}
                    </div>
                    <p className="text-[9.5px] text-slate-500 leading-tight mt-0.5 truncate">{skill.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Name Customizer */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">4. Name Your Virtual Employee</label>
          <input
            type="text"
            disabled={isDeploying}
            placeholder={`E.g., ${selectedRole.suggestedName}`}
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition"
          />
        </div>

        {/* Deploy Actions */}
        <button
          type="button"
          onClick={handleDeploy}
          disabled={isDeploying}
          className={`w-full py-3 rounded-xl text-xs font-black tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md ${
            isDeploying
              ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20 hover:shadow-lg cursor-pointer"
          }`}
        >
          {isDeploying ? (
            <>
              <RefreshCw className="h-4.5 w-4.5 animate-spin" />
              <span>DEPLOYING WORKSPACE NODE...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              <span>LAUNCH VIRTUAL EMPLOYEE NODE</span>
            </>
          )}
        </button>

        {/* Deploy progress logs */}
        <AnimatePresence>
          {isDeploying && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-950 text-slate-200 p-4 rounded-2xl border border-white/5 font-mono text-[10px] space-y-2 shadow-inner"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2 text-slate-400">
                <span>VIRTUAL WORKSPACE CONTAINER SETUP</span>
                <span className="animate-pulse">MOUNTING...</span>
              </div>
              <div className="space-y-1.5">
                {deploySteps.map((step, idx) => {
                  const isDone = deployStep > idx;
                  const isActive = deployStep === idx;
                  return (
                    <div 
                      key={idx}
                      className={`flex items-start space-x-2 transition-opacity ${
                        isDone ? "text-emerald-400" : isActive ? "text-purple-300 font-bold animate-pulse" : "text-slate-600"
                      }`}
                    >
                      <span>{isDone ? "✓" : isActive ? "→" : "•"}</span>
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deployed Virtual Employee Contract Badge */}
        <AnimatePresence>
          {deployedAgent && !isDeploying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border border-purple-100 rounded-3xl overflow-hidden shadow-lg bg-gradient-to-tr from-purple-50/40 to-indigo-50/10 p-5 md:p-6"
            >
              <div className="flex flex-col sm:flex-row items-center gap-5">
                
                {/* Visual Employee Badge ID */}
                <div className="relative flex-shrink-0">
                  <div className={`h-24 w-24 rounded-2xl bg-gradient-to-tr ${deployedAgent.avatarColor} text-white flex items-center justify-center text-4xl shadow-lg relative overflow-hidden`}>
                    {deployedAgent.avatarEmoji}
                    
                    {/* Badge light reflection effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 rotate-12 transform scale-150 pointer-events-none" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>

                {/* ID Card Content */}
                <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 justify-center sm:justify-start">
                    <h4 className="text-md font-black text-slate-800 tracking-tight">{deployedAgent.name}</h4>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-purple-100 border border-purple-200 text-purple-700 rounded-full self-center">
                      ID: {deployedAgent.agentId}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 leading-normal font-sans">
                    <div>
                      <strong className="text-slate-800 font-bold">Role:</strong> {deployedAgent.roleName}
                    </div>
                    <div>
                      <strong className="text-slate-800 font-bold">Persona:</strong> {deployedAgent.tone}
                    </div>
                    <div>
                      <strong className="text-slate-800 font-bold">API Capabilities:</strong> {deployedAgent.skillsCount} Mounted Integrations
                    </div>
                  </div>

                  {/* Operational Status Ticker */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-[10px] font-mono text-slate-500">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
                      <span>Uptime: <strong className="text-slate-700 font-bold">100% (24/7)</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-current" />
                      <span>Operational Rate: <strong className="text-slate-700 font-bold">{deployedAgent.efficiency}%</strong></span>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="border-t border-purple-100/50 mt-5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="text-[10px] font-mono text-slate-500 max-w-sm">
                  ✓ Ready for background autopilot engagement on server port. Click below to add to your workspace dashboard.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("omniagent_custom_agent", JSON.stringify(deployedAgent));
                    
                    try {
                      const newActivity = {
                        id: "agent-deploy-" + Date.now(),
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        title: `Custom Agent Registered: ${deployedAgent.name}`,
                        description: `Booted autonomous employee container (${deployedAgent.roleName}) running in ${deployedAgent.tone} tone.`,
                        status: "success"
                      };
                      const existingActivityLog = JSON.parse(localStorage.getItem("omniagent_activityLog") || "[]");
                      localStorage.setItem("omniagent_activityLog", JSON.stringify([newActivity, ...existingActivityLog]));
                    } catch (e) {
                      console.error("Local storage update error:", e);
                    }

                    if (onDeploy) {
                      onDeploy();
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md shadow-purple-500/10 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  HIRE & DEPLOY TO WORKSPACE
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </CardGlow>
  );
}
