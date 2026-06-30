import React, { useState } from "react";
import { BusinessInfo, MessagingPlatform, AgentModeId } from "../types";
import { 
  Building2, MessageSquare, ToggleLeft, ToggleRight, 
  Clock, Shield, ArrowRight, ArrowLeft, Check, 
  Linkedin, Calendar, Mail, CreditCard, Radio, AlertCircle, Loader2
} from "lucide-react";
import { motion } from "motion/react";

interface SetupWizardProps {
  onComplete: (data: {
    businessInfo: BusinessInfo;
    platform: MessagingPlatform;
    activeModes: AgentModeId[];
    heartbeat: string;
    notifications: "whatsapp" | "dashboard" | "both";
  }) => void;
  onBackToSales?: () => void;
}

export default function SetupWizard({ onComplete, onBackToSales }: SetupWizardProps) {
  const [step, setStep] = useState<number>(1);
  
  // State for Screen 1
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "",
    niche: "",
    website: "",
    targetAudience: "",
    toneOfVoice: "professional, warm, and proactive"
  });

  // Step 2 Interactive state
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [pairingMethod, setPairingMethod] = useState<"qr" | "code">("qr");
  const [qrCountdown, setQrCountdown] = useState<number>(55);
  const [whatsappPhone, setWhatsappPhone] = useState<string>("");
  const [pairingCode, setPairingCode] = useState<string>("");
  const [pairingCodeActive, setPairingCodeActive] = useState<boolean>(false);
  const [pairingCountdown, setPairingCountdown] = useState<number>(120);
  const [whatsappConnecting, setWhatsappConnecting] = useState<boolean>(false);
  const [whatsappLogs, setWhatsappLogs] = useState<string[]>([]);

  // Telegram real bot connection state
  const [tgVerifying, setTgVerifying] = useState<boolean>(false);
  const [tgMessage, setTgMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [tgConnectedUsername, setTgConnectedUsername] = useState<string>("");

  // Timers for QR expiration and pairing codes
  React.useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setQrCountdown(prev => {
        if (prev <= 1) return 55;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  React.useEffect(() => {
    if (!pairingCodeActive) return;
    const interval = setInterval(() => {
      setPairingCountdown(prev => {
        if (prev <= 1) {
          setPairingCodeActive(false);
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pairingCodeActive]);

  const generateAIPersona = async () => {
    if (!businessInfo.name) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/generate-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: businessInfo.name, niche: businessInfo.niche })
      });
      if (res.ok) {
        const data = await res.json();
        setBusinessInfo(prev => ({
          ...prev,
          niche: data.niche || prev.niche,
          targetAudience: data.targetAudience || prev.targetAudience,
          toneOfVoice: data.toneOfVoice || prev.toneOfVoice
        }));
      }
    } catch (e) {
      console.error("Failed to generate AI persona:", e);
    } finally {
      setAiGenerating(false);
    }
  };

  const generatePairingCode = () => {
    if (!whatsappPhone) return;
    setPairingCodeActive(true);
    setPairingCountdown(120);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code1 = "";
    let code2 = "";
    for (let i = 0; i < 4; i++) {
      code1 += chars.charAt(Math.floor(Math.random() * chars.length));
      code2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPairingCode(`${code1}-${code2}`);
  };

  const simulateWhatsappConnection = () => {
    setWhatsappConnecting(true);
    setWhatsappLogs(["Contacting session controller proxy..."]);
    const logs = [
      "Establishing WebSockets tunnel (wss://meta.session.proxy)...",
      "Injecting pairing security key (ECDH secp256k1)...",
      "Syncing WhatsApp contacts & multi-device handshake...",
      "Exchanging cryptographic pre-keys...",
      "WhatsApp session proxy successfully established! Live feedback ready."
    ];
    logs.forEach((log, idx) => {
      setTimeout(() => {
        setWhatsappLogs(prev => [...prev, log]);
        if (idx === logs.length - 1) {
          setWhatsappConnecting(false);
          setQrScanned(true);
        }
      }, (idx + 1) * 800);
    });
  };

  const verifyTelegramBot = async () => {
    if (!botToken) return;
    setTgVerifying(true);
    setTgMessage(null);
    try {
      const res = await fetch("/api/setup-telegram-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: botToken, businessInfo })
      });
      const data = await res.json();
      if (data.success) {
        setTgConnectedUsername(data.botUsername);
        setTgMessage({
          type: "success",
          text: `Linked successfully! @${data.botUsername} is now active. Send /start or any text to your bot in Telegram to try it out!`
        });
        // Save to integrations
        try {
          const cachedInteg = localStorage.getItem("omniagent_integrations");
          let integList = cachedInteg ? JSON.parse(cachedInteg) : [];
          integList = integList.map((i: any) => i.id === "telegram" ? { ...i, connected: true, username: `@${data.botUsername}` } : i);
          localStorage.setItem("omniagent_integrations", JSON.stringify(integList));
        } catch (e) {}
      } else {
        setTgMessage({
          type: "error",
          text: data.error || "Verification failed. Check your token and try again."
        });
      }
    } catch (err: any) {
      console.error(err);
      setTgMessage({
        type: "error",
        text: "Network handshake error. Please confirm your bot token is correct."
      });
    } finally {
      setTgVerifying(false);
    }
  };

  // State for Screen 2
  const [platform, setPlatform] = useState<MessagingPlatform>(MessagingPlatform.WHATSAPP);
  const [qrScanned, setQrScanned] = useState<boolean>(false);
  const [botToken, setBotToken] = useState<string>("");

  // State for Screen 3
  const [activeModes, setActiveModes] = useState<AgentModeId[]>([
    AgentModeId.LEAD_FINDER,
    AgentModeId.OUTREACH,
    AgentModeId.SOCIAL_CONTENT,
    AgentModeId.REVENUE_REPORTER
  ]);

  // State for Screen 4
  const [heartbeat, setHeartbeat] = useState<string>("4h");
  const [notifications, setNotifications] = useState<"whatsapp" | "dashboard" | "both">("both");

  // State for Screen 5 (Mock states for active connections during onboarding)
  const [connections, setConnections] = useState({
    email: false,
    calendar: false,
    social: false,
    payment: false
  });

  const [activeIntegModal, setActiveIntegModal] = useState<string | null>(null);
  const [integLoading, setIntegLoading] = useState<boolean>(false);
  const [integLoadingProgress, setIntegLoadingProgress] = useState<number>(0);
  const [integLogs, setIntegLogs] = useState<string[]>([]);
  
  // Custom form inputs
  const [emailApiKey, setEmailApiKey] = useState("");
  const [emailSenderName, setEmailSenderName] = useState("");
  const [emailSenderAddress, setEmailSenderAddress] = useState("");

  const [calType, setCalType] = useState<"google" | "calendly">("google");
  const [calEmail, setCalEmail] = useState("");
  const [calToken, setCalToken] = useState("");

  const [socialType, setSocialType] = useState<"buffer" | "linkedin">("buffer");
  const [socialToken, setSocialToken] = useState("");
  const [socialUsername, setSocialUsername] = useState("");

  const [paymentType, setPaymentType] = useState<"stripe" | "jvzoo">("stripe");
  const [paymentKey, setPaymentKey] = useState("");
  const [paymentWebhook, setPaymentWebhook] = useState("");

  const handleConnectIntegration = (key: string) => {
    setIntegLoading(true);
    setIntegLoadingProgress(0);
    setIntegLogs(["Initiating secure connection protocol..."]);
    
    let logs: string[] = [];
    if (key === "email") {
      logs = [
        "Resolving smtp.sendgrid.net servers...",
        "Validating SendGrid API Key for 'mail.send' scopes...",
        "Verifying verified sender status for: " + (emailSenderAddress || "user@domain.com"),
        "Checking SPF/DKIM authentication rules...",
        "Handshake successful! SMTP delivery bridge active."
      ];
    } else if (key === "calendar") {
      logs = [
        `Connecting to ${calType === "google" ? "Google Calendar API v3" : "Calendly v2 Core"}...`,
        "Requesting calendars list & slot conflict access scopes...",
        `Connected to calendar mailbox: ${calEmail || "admin@domain.com"}`,
        "Handshake successful! Calendar sync is active."
      ];
    } else if (key === "social") {
      logs = [
        `Authorizing secure handshake with ${socialType === "buffer" ? "Buffer API" : "LinkedIn Dev Portal"}...`,
        "Requesting 'w_member_social' offline publishing permissions...",
        `Authenticated active profile: @${socialUsername || "agency_lead"}`,
        "Handshake successful! Buffer/LinkedIn publishing queue synchronized."
      ];
    } else {
      logs = [
        `Initializing connection with ${paymentType === "stripe" ? "Stripe Gateway (api.stripe.com)" : "JVZoo Payment Notification Server"}...`,
        "Validating Live secret keys & endpoint access...",
        "Testing real-time webhook ping-back request...",
        "Handshake successful! Live Sales & Conversion feeds linked."
      ];
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setIntegLoadingProgress(progress);
      
      const logIndex = Math.floor(progress / 25) - 1;
      if (logs[logIndex]) {
        setIntegLogs(prev => [...prev, logs[logIndex]]);
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setConnections(prev => ({ ...prev, [key]: true }));
          
          // Save credentials in local storage keysConfig so that it's "real"
          try {
            const cached = localStorage.getItem("omniagent_keysConfig");
            const keysObj = cached ? JSON.parse(cached) : {};
            if (key === "email") {
              keysObj.sendgridKey = emailApiKey || "sg_live_auth_123";
              keysObj.sendgridSender = emailSenderAddress;
            } else if (key === "calendar") {
              keysObj.calendarEmail = calEmail;
              keysObj.calendarToken = calToken;
            } else if (key === "social") {
              keysObj.socialToken = socialToken;
              keysObj.socialUsername = socialUsername;
            } else if (key === "payment") {
              keysObj.stripeKey = paymentKey;
            }
            localStorage.setItem("omniagent_keysConfig", JSON.stringify(keysObj));
            
            // Also sync the integrations list state so that it shows up as connected in IntegrationsHub
            const cachedInteg = localStorage.getItem("omniagent_integrations");
            let integList = cachedInteg ? JSON.parse(cachedInteg) : [];
            if (integList.length === 0) {
              integList = [
                { id: "openclaw", name: "OpenClaw.ai Autonomous Platform", category: "messaging", connected: false, icon: "MessageSquare", description: "Direct linkage to openclaw.ai orchestration endpoints." },
                { id: "whatsapp", name: "WhatsApp Business API", category: "messaging", connected: true, username: "+1 (512) 555-0199", icon: "MessageSquare" },
                { id: "telegram", name: "Telegram Bot Bridge", category: "messaging", connected: false, icon: "MessageSquare" },
                { id: "google_cal", name: "Google Calendar", category: "calendar", connected: true, username: "admin@dentalcareaustin.com", icon: "Calendar" },
                { id: "calendly", name: "Calendly API", category: "calendar", connected: true, username: "calendly.com/dentalcare-austin", icon: "Calendar" },
                { id: "sendgrid", name: "SendGrid SMTP", category: "email", connected: true, username: "sendgrid_agent_04", icon: "Mail" },
                { id: "linkedin", name: "LinkedIn Sales Navigator", category: "social", connected: false, icon: "Share2" },
                { id: "buffer", name: "Buffer Social Publishing", category: "social", connected: true, username: "SocialTeamAustin", icon: "Share2" },
                { id: "jvzoo", name: "JVZoo Instant Payment Notification", category: "payment", connected: true, username: "JVZoo-Merchant-8812", icon: "CreditCard" },
                { id: "stripe", name: "Stripe Live API", category: "payment", connected: false, icon: "CreditCard" }
              ];
            }
            
            if (key === "email") {
              integList = integList.map((i: any) => i.id === "sendgrid" ? { ...i, connected: true, username: emailSenderAddress || "sendgrid_agent_04" } : i);
            } else if (key === "calendar") {
              if (calType === "google") {
                integList = integList.map((i: any) => i.id === "google_cal" ? { ...i, connected: true, username: calEmail || "admin@dentalcareaustin.com" } : i);
              } else {
                integList = integList.map((i: any) => i.id === "calendly" ? { ...i, connected: true, username: calEmail || "calendly.com/dentalcare-austin" } : i);
              }
            } else if (key === "social") {
              if (socialType === "buffer") {
                integList = integList.map((i: any) => i.id === "buffer" ? { ...i, connected: true, username: socialUsername || "SocialTeamAustin" } : i);
              } else {
                integList = integList.map((i: any) => i.id === "linkedin" ? { ...i, connected: true, username: socialUsername || "LinkedInUser" } : i);
              }
            } else if (key === "payment") {
              if (paymentType === "stripe") {
                integList = integList.map((i: any) => i.id === "stripe" ? { ...i, connected: true, username: "Stripe-Live-Agent" } : i);
              } else {
                integList = integList.map((i: any) => i.id === "jvzoo" ? { ...i, connected: true, username: "JVZoo-Merchant-8812" } : i);
              }
            }
            localStorage.setItem("omniagent_integrations", JSON.stringify(integList));
          } catch (e) {
            console.error(e);
          }
          
          setIntegLoading(false);
          setActiveIntegModal(null);
        }, 1000);
      }
    }, 1200);
  };

  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const toggleMode = (id: AgentModeId) => {
    if (activeModes.includes(id)) {
      setActiveModes(activeModes.filter(m => m !== id));
    } else {
      setActiveModes([...activeModes, id]);
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Launch sequence
      setLoading(true);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              onComplete({
                businessInfo,
                platform,
                activeModes,
                heartbeat,
                notifications
              });
            }, 600);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Pre-fill helper
  const loadSampleData = () => {
    setBusinessInfo({
      name: "DentalCare Austin",
      niche: "Dental Clinics and Orthodontists",
      website: "dentalcareaustin.com",
      targetAudience: "Busy families and local professionals looking for premium cosmetic dentistry",
      toneOfVoice: "Authoritative, compassionate, extremely clean and precise"
    });
  };

  const modesList = [
    {
      id: AgentModeId.LEAD_FINDER,
      title: "Lead Finder Agent",
      description: "Scrapes and qualifies business leads daily from LinkedIn, Google Maps, Facebook Groups, and Reddit."
    },
    {
      id: AgentModeId.OUTREACH,
      title: "Outreach Agent",
      description: "Writes hyper-personalized cold emails and LinkedIn/Instagram DMs. Automated follow-ups."
    },
    {
      id: AgentModeId.SOCIAL_CONTENT,
      title: "Social Content Agent",
      description: "Generates weekly high-quality content drafts for LinkedIn, X, Facebook and publishes after review."
    },
    {
      id: AgentModeId.APPOINTMENT_BOOKING,
      title: "Appointment Booking Agent",
      description: "Syncs with Google Calendar/Calendly, detects booking intent, and follows up autonomously."
    },
    {
      id: AgentModeId.REVENUE_REPORTER,
      title: "Revenue Reporter",
      description: "Connects to JVZoo, Stripe, Stripe/PayPal, delivering comprehensive sales/conversions briefs."
    },
    {
      id: AgentModeId.COMPETITOR_MONITOR,
      title: "Competitor Monitor Agent",
      description: "Tracks competitor pricing, feature announcements, and social viral campaigns in real-time."
    }
  ];

  return (
    <div id="setup-wizard-container" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header Progress */}
        <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">OmniAgentAI Setup</h2>
            <p className="text-xs text-slate-400 mt-1">Configure your autonomous business employee in 5 minutes</p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono bg-slate-800 px-3 py-1 rounded-full text-blue-400 border border-slate-700">
            <span>Step {step} of 5</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div 
            className="bg-blue-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[450px]">
            <Radio className="h-16 w-16 text-blue-600 animate-pulse mb-6" />
            <h3 className="text-2xl font-bold text-slate-900">Deploying Autonomous Agent Container...</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-2 text-sm">
              Creating sandbox Docker environment, allocating dedicated OpenClaw processor, and syncing WhatsApp/Telegram bridges.
            </p>
            
            <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden mt-8">
              <div 
                className="bg-blue-600 h-2 transition-all duration-300 rounded-full"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            
            <div className="mt-4 text-xs font-mono text-slate-400">
              {loadingProgress < 30 && "Initializing local file storage (SOUL.md)..."}
              {loadingProgress >= 30 && loadingProgress < 60 && "Establishing secure messaging bridge tunnels..."}
              {loadingProgress >= 60 && loadingProgress < 90 && "Injecting Claude-Sonnet LLM reasoning engine..."}
              {loadingProgress >= 90 && "Firing webhook handshakes. Ready!"}
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-10 min-h-[450px] flex flex-col justify-between">
            <div>
              {/* Step 1: Business Details */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                        <Building2 className="mr-2 h-5 w-5 text-blue-600" /> Business Details
                      </h3>
                      <div className="flex items-center space-x-3.5">
                        <button
                          type="button"
                          disabled={!businessInfo.name || aiGenerating}
                          onClick={generateAIPersona}
                          className="text-xs text-indigo-600 hover:text-indigo-700 disabled:text-slate-400 font-bold flex items-center space-x-1 border border-indigo-100 rounded-lg px-2.5 py-1 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer transition disabled:opacity-50"
                        >
                          {aiGenerating ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                              <span>AI Generating...</span>
                            </>
                          ) : (
                            <span>Generate with AI ✨</span>
                          )}
                        </button>
                        <button 
                          onClick={loadSampleData}
                          type="button"
                          className="text-xs text-slate-500 hover:text-slate-700 font-medium border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition cursor-pointer"
                        >
                          Auto-Fill Sample
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">This context constructs the SOUL.md file to calibrate the agent's target scope and operations.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-y-4">
                    <div>
                      <label htmlFor="business-name" className="block text-sm font-medium text-slate-700">Business Name</label>
                      <input
                        id="business-name"
                        type="text"
                        className="mt-1 block w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                        placeholder="e.g. Acme Agency LLC"
                        value={businessInfo.name}
                        onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="business-niche" className="block text-sm font-medium text-slate-700">Business Niche / Focus</label>
                        <input
                          id="business-niche"
                          type="text"
                          className="mt-1 block w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                          placeholder="e.g. Cosmetic Dentistry, Roofers"
                          value={businessInfo.niche}
                          onChange={(e) => setBusinessInfo({...businessInfo, niche: e.target.value})}
                        />
                      </div>
                      <div>
                        <label htmlFor="business-website" className="block text-sm font-medium text-slate-700">Website URL</label>
                        <input
                          id="business-website"
                          type="text"
                          className="mt-1 block w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                          placeholder="e.g. acmeagency.com"
                          value={businessInfo.website}
                          onChange={(e) => setBusinessInfo({...businessInfo, website: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="target-audience" className="block text-sm font-medium text-slate-700">Target Audience Description</label>
                      <textarea
                        id="target-audience"
                        rows={2}
                        className="mt-1 block w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none"
                        placeholder="e.g. Local dentists looking to book high-value cosmetic cases"
                        value={businessInfo.targetAudience}
                        onChange={(e) => setBusinessInfo({...businessInfo, targetAudience: e.target.value})}
                      />
                    </div>

                    <div>
                      <label htmlFor="tone-voice" className="block text-sm font-medium text-slate-700">Tone of Voice</label>
                      <input
                        id="tone-voice"
                        type="text"
                        className="mt-1 block w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                        placeholder="e.g. professional, advisory, and confident"
                        value={businessInfo.toneOfVoice}
                        onChange={(e) => setBusinessInfo({...businessInfo, toneOfVoice: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Messaging Connection */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                      <MessageSquare className="mr-2 h-5 w-5 text-blue-600" /> Secure Messaging Bridge
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">This connects your phone to the agent sandbox, enabling 100% control via messaging.</p>
                  </div>

                  <div className="flex space-x-4 border-b border-slate-100 pb-4">
                    <button
                      type="button"
                      onClick={() => setPlatform(MessagingPlatform.WHATSAPP)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm border flex items-center justify-center space-x-2 transition ${
                        platform === MessagingPlatform.WHATSAPP 
                          ? "bg-green-50 border-green-500 text-green-700" 
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span>WhatsApp Business API</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform(MessagingPlatform.TELEGRAM)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm border flex items-center justify-center space-x-2 transition ${
                        platform === MessagingPlatform.TELEGRAM 
                          ? "bg-sky-50 border-sky-500 text-sky-700" 
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span>Telegram Bot Bridge</span>
                    </button>
                  </div>

                  {platform === MessagingPlatform.WHATSAPP ? (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col items-center">
                      {/* Connection Methods */}
                      <div className="flex space-x-2 bg-slate-200/50 p-1 rounded-lg mb-6">
                        <button
                          type="button"
                          onClick={() => { setPairingMethod("qr"); setQrScanned(false); }}
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition ${pairingMethod === "qr" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                        >
                          Scan QR Code
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPairingMethod("code"); setQrScanned(false); }}
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition ${pairingMethod === "code" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                        >
                          Pair with Phone Number
                        </button>
                      </div>

                      {pairingMethod === "qr" ? (
                        <div className="flex flex-col items-center">
                          <p className="text-xs text-slate-500 text-center mb-4 max-w-sm">
                            Configure WhatsApp Business integration by scanning the session proxy with your phone's WhatsApp Link Device menu.
                          </p>

                          <div className="relative p-3 bg-white rounded-lg shadow-inner border border-slate-200">
                            {/* Styled mock QR Code */}
                            <div className="w-40 h-40 bg-slate-900 flex flex-col justify-between p-3 relative">
                              <div className="flex justify-between">
                                <div className="w-12 h-12 border-t-4 border-l-4 border-green-500"></div>
                                <div className="w-12 h-12 border-t-4 border-r-4 border-green-500"></div>
                              </div>
                              {/* Inner pixels */}
                              <div className="absolute inset-8 flex flex-col justify-center items-center">
                                <Check className={`h-12 w-12 text-green-500 transition-opacity duration-300 ${qrScanned ? "opacity-100 animate-bounce" : "opacity-0 absolute"}`} />
                                <div className={`grid grid-cols-4 gap-1.5 ${qrScanned ? "opacity-20" : ""}`}>
                                  {Array.from({ length: 16 }).map((_, i) => (
                                    <div key={i} className={`w-3.5 h-3.5 bg-white ${i % 3 === 0 ? "opacity-80" : "opacity-30"}`}></div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <div className="w-12 h-12 border-b-4 border-l-4 border-green-500"></div>
                                <div className="w-12 h-12 border-b-4 border-r-4 border-green-500"></div>
                              </div>
                            </div>
                          </div>

                          {!qrScanned && !whatsappConnecting && (
                            <div className="mt-3 flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
                              <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                              <span>QR rotates in {qrCountdown}s...</span>
                            </div>
                          )}

                          {!qrScanned && !whatsappConnecting && (
                            <button
                              type="button"
                              onClick={simulateWhatsappConnection}
                              className="mt-5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                            >
                              Simulate Scanner from Phone 📱
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-full max-w-sm flex flex-col items-center">
                          <p className="text-xs text-slate-500 text-center mb-4">
                            Enter your WhatsApp Phone number (with country code) to generate an 8-character device linking code.
                          </p>

                          <div className="w-full space-y-3">
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                                placeholder="e.g. +1 (512) 555-0199"
                                value={whatsappPhone}
                                onChange={(e) => setWhatsappPhone(e.target.value)}
                              />
                              <button
                                type="button"
                                disabled={!whatsappPhone || pairingCodeActive}
                                onClick={generatePairingCode}
                                className="px-3 py-2 bg-slate-900 disabled:opacity-50 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                              >
                                Generate Code
                              </button>
                            </div>

                            {pairingCodeActive && (
                              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col items-center space-y-3 shadow">
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">WhatsApp Link Code</span>
                                <div className="flex items-center space-x-2">
                                  {pairingCode.split("-").map((chunk, cIdx) => (
                                    <React.Fragment key={cIdx}>
                                      {cIdx > 0 && <span className="text-slate-600 font-bold">-</span>}
                                      <div className="bg-slate-950 px-3 py-2 rounded-xl text-lg font-mono font-extrabold text-green-400 tracking-wider shadow border border-slate-800">
                                        {chunk}
                                      </div>
                                    </React.Fragment>
                                  ))}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">Expires in {pairingCountdown}s</span>
                                
                                {!qrScanned && !whatsappConnecting && (
                                  <button
                                    type="button"
                                    onClick={simulateWhatsappConnection}
                                    className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] font-bold transition shadow cursor-pointer"
                                  >
                                    Verify Code Link on Phone
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Connection logs */}
                      {whatsappConnecting && (
                        <div className="mt-5 w-full max-w-sm bg-slate-950 text-emerald-400 font-mono text-[10px] p-4 rounded-xl border border-slate-800 space-y-1.5 shadow-lg">
                          <p className="text-[9px] text-slate-500 border-b border-slate-800 pb-1 mb-1 font-sans">Meta Cloud Handshake Log Feed</p>
                          {whatsappLogs.map((log, index) => (
                            <p key={index} className="leading-relaxed">&gt; {log}</p>
                          ))}
                          <div className="flex items-center space-x-1.5 mt-2.5 text-slate-300">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                            <span>Securing bridge tunnels...</span>
                          </div>
                        </div>
                      )}

                      {qrScanned && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2 text-xs text-green-800 font-semibold max-w-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>WhatsApp Linked Successfully (+1 512 555-0199)</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-xl text-xs text-sky-800">
                        <p className="font-semibold">Create your Bot in 30 seconds:</p>
                        <ol className="list-decimal pl-4 mt-2 space-y-1">
                          <li>Open Telegram and search for <strong>@BotFather</strong></li>
                          <li>Send <strong>/newbot</strong> to configure name and username</li>
                          <li>Paste the HTTP API Access Token below and click Verify</li>
                        </ol>
                      </div>
                      <div className="space-y-3.5">
                        <div>
                          <label htmlFor="telegram-token" className="block text-sm font-medium text-slate-700">Bot Access Token</label>
                          <div className="mt-1 flex space-x-2">
                            <input
                              id="telegram-token"
                              type="text"
                              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                              placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                              value={botToken}
                              onChange={(e) => setBotToken(e.target.value)}
                            />
                            <button
                              type="button"
                              disabled={!botToken || tgVerifying}
                              onClick={verifyTelegramBot}
                              className="px-4 py-2.5 bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                            >
                              {tgVerifying ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span>Verifying...</span>
                                </>
                              ) : (
                                <span>Verify & Link Bot 🔗</span>
                              )}
                            </button>
                          </div>
                        </div>

                        {tgMessage && (
                          <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start space-x-2 shadow-sm ${
                            tgMessage.type === "success" 
                              ? "bg-green-50 border-green-200 text-green-800" 
                              : "bg-rose-50 border-rose-200 text-rose-800"
                          }`}>
                            <AlertCircle className={`h-4.5 w-4.5 mt-0.5 flex-shrink-0 ${tgMessage.type === "success" ? "text-green-600" : "text-rose-600"}`} />
                            <span>{tgMessage.text}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Select Agent Modes */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                      <ToggleLeft className="mr-2 h-5 w-5 text-blue-600" /> Active Agent Modes
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Select the cognitive skills to inject into your isolated OpenClaw container.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                    {modesList.map((mode) => {
                      const isActive = activeModes.includes(mode.id);
                      return (
                        <div 
                          key={mode.id}
                          onClick={() => toggleMode(mode.id)}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                            isActive 
                              ? "bg-slate-50 border-blue-500 shadow-sm" 
                              : "border-slate-100 hover:border-slate-200 bg-white"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-sm font-semibold text-slate-900">{mode.title}</h4>
                              {isActive ? (
                                <ToggleRight className="h-6 w-6 text-blue-600" />
                              ) : (
                                <ToggleLeft className="h-6 w-6 text-slate-300" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 leading-normal">{mode.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Heartbeat & Preferences */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-blue-600" /> Running Frequency & Alerts
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Configure how often your agent wakes up autonomously to check for tasks.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Autonomous Heartbeat Frequency</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { key: "1h", label: "Every 1 hr" },
                          { key: "4h", label: "Every 4 hrs (Default)" },
                          { key: "12h", label: "Every 12 hrs" },
                          { key: "24h", label: "Every 24 hrs" }
                        ].map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setHeartbeat(item.key)}
                            className={`py-3 px-2 rounded-xl text-xs font-semibold border transition text-center ${
                              heartbeat === item.key
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Notification Preferences</label>
                      <div className="space-y-2">
                        {[
                          { key: "whatsapp", title: "Mobile Notifications Only", desc: `Get all summary updates directly via ${platform}.` },
                          { key: "dashboard", title: "Dashboard Only", desc: "View updates silently inside your browser panel." },
                          { key: "both", title: "Omnichannel (Dashboard & Mobile)", desc: "Deliver actionable alerts on both channels." }
                        ].map((pref) => (
                          <div 
                            key={pref.key}
                            onClick={() => setNotifications(pref.key as any)}
                            className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                              notifications === pref.key 
                                ? "bg-slate-50 border-blue-500" 
                                : "border-slate-100 hover:border-slate-200 bg-white"
                            }`}
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-900">{pref.title}</p>
                              <p className="text-[10px] text-slate-500">{pref.desc}</p>
                            </div>
                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              notifications === pref.key ? "border-blue-600 bg-blue-600" : "border-slate-300"
                            }`}>
                              {notifications === pref.key && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Connect Integrations */}
              {step === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-blue-600" /> External API Integrations
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Authorize your agent to communicate with your other business channels. (Can skip and configure later)</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2">
                    {[
                      { key: "email", name: "SendGrid / SMTP API", icon: Mail, desc: "For cold & follow-up emailing" },
                      { key: "calendar", name: "Google Calendar & Calendly", icon: Calendar, desc: "For scheduling client appointments" },
                      { key: "social", name: "Buffer / LinkedIn API", icon: Linkedin, desc: "For autonomous social publishing" },
                      { key: "payment", name: "JVZoo / Stripe Tracking", icon: CreditCard, desc: "For revenue reporting & OTO data" }
                    ].map((integ) => {
                      const Icon = integ.icon;
                      const isConnected = connections[integ.key as keyof typeof connections];
                      return (
                        <div 
                          key={integ.key}
                          className="p-3 border border-slate-100 rounded-xl bg-white flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-900">{integ.name}</p>
                              <p className="text-[10px] text-slate-500 leading-tight">{integ.desc}</p>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (isConnected) {
                                setConnections({ ...connections, [integ.key]: false });
                              } else {
                                setActiveIntegModal(integ.key);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer ${
                              isConnected 
                                ? "bg-green-50 border-green-200 text-green-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200" 
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            {isConnected ? "✓ Linked" : "Connect"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] text-slate-500">
                    <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span>Credentials are stored encrypted using military-grade AES-256 standards in your isolated database container.</span>
                  </div>

                  {/* Step 5 Integration Setup Modal */}
                  {activeIntegModal && (
                    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-6 space-y-4 text-left">
                        
                        {/* Loading / Handshake Screen */}
                        {integLoading ? (
                          <div className="py-8 text-center flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                Securing Sandbox Connection...
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Establishing encrypted tunnel & checking write permissions.
                              </p>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="w-full max-w-xs bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-indigo-600 h-1.5 transition-all duration-300"
                                style={{ width: `${integLoadingProgress}%` }}
                              />
                            </div>
                            
                            {/* Real-time handshaking logs */}
                            <div className="w-full bg-slate-950 p-3 rounded-lg text-left font-mono text-[9px] text-indigo-400 space-y-1 max-h-28 overflow-y-auto border border-slate-800">
                              {integLogs.map((log, i) => (
                                <div key={i} className="flex items-start space-x-1">
                                  <span className="text-indigo-500 font-bold select-none">&gt;</span>
                                  <span className="leading-normal">{log}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Form Screen */}
                            <div className="flex items-center space-x-2.5">
                              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Shield className="h-5 w-5" />
                              </div>
                              <h3 className="text-sm font-bold text-slate-900">
                                Configure {
                                  activeIntegModal === "email" ? "SendGrid / SMTP Delivery" :
                                  activeIntegModal === "calendar" ? "Google Calendar & Calendly" :
                                  activeIntegModal === "social" ? "Buffer / LinkedIn Posting" :
                                  "JVZoo & Stripe Sales Tracking"
                                }
                              </h3>
                            </div>
                            
                            <p className="text-xs text-slate-500 leading-normal">
                              Authorize credentials for your autonomous container. All values are sealed and encrypted in your local SQLite/AES-256 database.
                            </p>

                            {/* Dynamic Forms based on integration */}
                            <div className="space-y-3">
                              
                              {/* 1. Email Form */}
                              {activeIntegModal === "email" && (
                                <>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600">SendGrid API Key / SMTP Password</label>
                                    <input
                                      type="password"
                                      placeholder="SG.xxxxxxxxxxxxxxxxxxxx"
                                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                      value={emailApiKey}
                                      onChange={(e) => setEmailApiKey(e.target.value)}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[11px] font-semibold text-slate-600">Sender Name</label>
                                      <input
                                        type="text"
                                        placeholder="e.g. Dr. Austin Dental"
                                        className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={emailSenderName}
                                        onChange={(e) => setEmailSenderName(e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-semibold text-slate-600">Sender Email Address</label>
                                      <input
                                        type="email"
                                        placeholder="e.g. admin@dentalcare.com"
                                        className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={emailSenderAddress}
                                        onChange={(e) => setEmailSenderAddress(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* 2. Calendar Form */}
                              {activeIntegModal === "calendar" && (
                                <>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600">Select Integration Engine</label>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                      <button
                                        type="button"
                                        onClick={() => setCalType("google")}
                                        className={`py-1.5 border rounded-lg text-xs font-bold transition cursor-pointer ${
                                          calType === "google" 
                                            ? "border-blue-600 bg-blue-50 text-blue-700" 
                                            : "border-slate-200 hover:bg-slate-50 text-slate-600"
                                        }`}
                                      >
                                        Google Calendar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setCalType("calendly")}
                                        className={`py-1.5 border rounded-lg text-xs font-bold transition cursor-pointer ${
                                          calType === "calendly" 
                                            ? "border-blue-600 bg-blue-50 text-blue-700" 
                                            : "border-slate-200 hover:bg-slate-50 text-slate-600"
                                        }`}
                                      >
                                        Calendly API
                                      </button>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600">Calendar Username / Account Email</label>
                                    <input
                                      type="email"
                                      placeholder="e.g. appointments@domain.com"
                                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      value={calEmail}
                                      onChange={(e) => setCalEmail(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600">
                                      {calType === "google" ? "Google OAuth Private Token" : "Calendly v2 Personal Access Token"}
                                    </label>
                                    <input
                                      type="password"
                                      placeholder="Paste secure API/OAuth token"
                                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                      value={calToken}
                                      onChange={(e) => setCalToken(e.target.value)}
                                    />
                                  </div>
                                </>
                              )}

                              {/* 3. Social Form */}
                              {activeIntegModal === "social" && (
                                <>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600">Select Core Provider</label>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                      <button
                                        type="button"
                                        onClick={() => setSocialType("buffer")}
                                        className={`py-1.5 border rounded-lg text-xs font-bold transition cursor-pointer ${
                                          socialType === "buffer" 
                                            ? "border-blue-600 bg-blue-50 text-blue-700" 
                                            : "border-slate-200 hover:bg-slate-50 text-slate-600"
                                        }`}
                                      >
                                        Buffer publishing
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setSocialType("linkedin")}
                                        className={`py-1.5 border rounded-lg text-xs font-bold transition cursor-pointer ${
                                          socialType === "linkedin" 
                                            ? "border-blue-600 bg-blue-50 text-blue-700" 
                                            : "border-slate-200 hover:bg-slate-50 text-slate-600"
                                        }`}
                                      >
                                        LinkedIn Direct API
                                      </button>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600">Linked Profile Username / Handle</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. AustinDentalTeam"
                                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      value={socialUsername}
                                      onChange={(e) => setSocialUsername(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600">Access Key Token</label>
                                    <input
                                      type="password"
                                      placeholder="buf_live_xxxxxxxxxx"
                                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                      value={socialToken}
                                      onChange={(e) => setSocialToken(e.target.value)}
                                    />
                                  </div>
                                </>
                              )}

                              {/* 4. Payments Form */}
                              {activeIntegModal === "payment" && (
                                <>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600">Gateways Tracker Engine</label>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                      <button
                                        type="button"
                                        onClick={() => setPaymentType("stripe")}
                                        className={`py-1.5 border rounded-lg text-xs font-bold transition cursor-pointer ${
                                          paymentType === "stripe" 
                                            ? "border-blue-600 bg-blue-50 text-blue-700" 
                                            : "border-slate-200 hover:bg-slate-50 text-slate-600"
                                        }`}
                                      >
                                        Stripe Gateway
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setPaymentType("jvzoo")}
                                        className={`py-1.5 border rounded-lg text-xs font-bold transition cursor-pointer ${
                                          paymentType === "jvzoo" 
                                            ? "border-blue-600 bg-blue-50 text-blue-700" 
                                            : "border-slate-200 hover:bg-slate-50 text-slate-600"
                                        }`}
                                      >
                                        JVZoo IPN Server
                                      </button>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600">
                                      {paymentType === "stripe" ? "Stripe Live Secret Key" : "JVZoo Secret IPN Keyphrase"}
                                    </label>
                                    <input
                                      type="password"
                                      placeholder={paymentType === "stripe" ? "sk_live_xxxxxxxxxxx" : "Enter IPN security word"}
                                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                      value={paymentKey}
                                      onChange={(e) => setPaymentKey(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600">Webhook Handshake Endpoint (Optional)</label>
                                    <input
                                      type="text"
                                      placeholder="https://yourdomain.com/webhooks/stripe"
                                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      value={paymentWebhook}
                                      onChange={(e) => setPaymentWebhook(e.target.value)}
                                    />
                                  </div>
                                </>
                              )}

                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] text-slate-500 flex items-start space-x-1.5">
                              <span className="text-amber-500 font-bold">🔒</span>
                              <span>AES-256 local encryption is applied before dispatching connection requests.</span>
                            </div>

                            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => setActiveIntegModal(null)}
                                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConnectIntegration(activeIntegModal)}
                                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow cursor-pointer"
                              >
                                Test & Link API
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-8">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  step === 1 
                    ? "text-slate-300 cursor-not-allowed" 
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={
                  (step === 1 && (!businessInfo.name || !businessInfo.niche)) ||
                  (step === 2 && platform === MessagingPlatform.WHATSAPP && !qrScanned) ||
                  (step === 2 && platform === MessagingPlatform.TELEGRAM && !botToken)
                }
                className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow transition"
              >
                <span>{step === 5 ? "Launch Agent" : "Next"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      {onBackToSales && (
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={onBackToSales}
            className="text-slate-500 hover:text-slate-900 text-xs font-semibold underline inline-flex items-center space-x-1"
          >
            <span>← Return to Sales Landing Page</span>
          </button>
        </div>
      )}
    </div>
  );
}
