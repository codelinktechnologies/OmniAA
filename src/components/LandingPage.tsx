import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, Shield, MessageSquare, Terminal, Users, 
  Target, BarChart3, Globe, Sparkles, Check, 
  ArrowRight, Heart, Bell, Play, FileText, Lock,
  Cpu, Database, Sparkle, HelpCircle, Flame, Smile, Compass, Trophy,
  Star, ChevronDown, ChevronUp, MessageCircle,
  Search, Edit3, Megaphone, Calendar, TrendingUp, Eye,
  Dumbbell, Wrench, Flower, Loader2, RefreshCw, X, Share2
} from "lucide-react";
import LiveActivityTicker from "./LiveActivityTicker";
import CardGlow from "./CardGlow";
import confetti from "canvas-confetti";
import LiveAuditSimulator from "./LiveAuditSimulator";
import AgentCustomizer from "./AgentCustomizer";
import ConversationalSimulator from "./ConversationalSimulator";
import FrictionFunnelAnalyzer from "./FrictionFunnelAnalyzer";

interface LandingPageProps {
  onLaunchDemo: () => void;
}

const PROMPT_PRESETS = [
  {
    id: "lead_finder",
    agent: "Lead Finder Agent",
    icon: Target,
    title: "Deep Scan Prospecting",
    description: "Scan local maps & social indices for businesses with severe website booking bottlenecks.",
    directive: "Initiate geo-targeted radar sweep for local cosmetic business channels with high-intent scheduling gaps in San Francisco...",
    color: "from-purple-500 to-indigo-500",
    glowColor: "rgba(168, 85, 247, 0.12)",
    hoverBorder: "hover:border-purple-500/40",
    logs: [
      "✨ Lead Finder Agent initialized with geo-target mapping directive.",
      "🗺️ Sweeping active business listings in SF area for niche: 'Premium Spa & Well-being'...",
      "🔍 Deep-crawling active touchpoints and auditing Google Business profiles...",
      "🎯 GAP MATCH FOUND: 'Nirvana Float & Spa' (4.8⭐, 112 reviews) lacks online instant scheduler.",
      "📈 Risk Score: 0%. Potential retainer value: $1,250/mo.",
      "💾 Saved target record to CRM database on autopilot.",
      "✅ Scan successful. Relaying record telemetry to Personal Writer Agent."
    ]
  },
  {
    id: "personal_writer",
    agent: "Personal Writer Agent",
    icon: Sparkles,
    title: "AI Booking Pitch",
    description: "Compose a personalized, non-spammy introduction proposing a 1-click booking bridge.",
    directive: "Draft high-conversion suggestions for Emma Larson addressing the lack of mobile booking...",
    color: "from-blue-500 to-indigo-500",
    glowColor: "rgba(59, 130, 246, 0.12)",
    hoverBorder: "hover:border-blue-500/40",
    logs: [
      "✨ Smart Personal Writer active. Analyzing lead telemetry for 'Nirvana Float & Spa'...",
      "🧠 Scanned landing page text and social links: Identified 42% booking friction rate.",
      "✍️ Designing warm, bespoke proposal email addressing missing mobile CTA elements...",
      "✉️ Drafted subject: 'Quick suggestion for Nirvana Float & Spa - make booking simpler for new clients'",
      "📋 Body text calibrated to authoritative, compass-driven tone.",
      "📤 Sent to Approvals Queue. Ready for direct owner dispatch."
    ]
  },
  {
    id: "social_publisher",
    agent: "Autopilot Poster",
    icon: Share2,
    title: "Viral Growth Content",
    description: "Generate and schedule high-value educational social posts to establish practice authority.",
    directive: "Publish an educational post outlining why 78% of local patients require late-night booking convenience...",
    color: "from-rose-500 to-purple-500",
    glowColor: "rgba(244, 63, 94, 0.12)",
    hoverBorder: "hover:border-rose-500/40",
    logs: [
      "✨ Autopilot Poster Agent online. Initiating social campaign logic...",
      "📚 Extracting local healthcare and dentistry conversion benchmarks...",
      "📝 Generating educational carousel text detailing late-night scheduling convenience stats...",
      "🏷️ Tagging with optimized, high-authority hashtags: #LocalService #AutomationTips #FrictionlessBooking",
      "📅 Scheduled post for tomorrow at 9:00 AM CST (calibrated peak traffic hour).",
      "✅ Automation sequence completed."
    ]
  },
  {
    id: "scheduler",
    agent: "Scheduler Agent",
    icon: Calendar,
    title: "Handshake Negotiator",
    description: "Interact with inbound lead replies to coordinate and confirm open slots on your calendar.",
    directive: "Detect positive response and schedule a 10-minute demo session for Thursday afternoon...",
    color: "from-emerald-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.12)",
    hoverBorder: "hover:border-emerald-500/40",
    logs: [
      "✨ Outreach Scheduler Agent active. Scanning incoming thread replies...",
      "📩 Response detected from Emma Larson: 'This sounds useful. I'm open to a demo call Thursday afternoon.'",
      "🔄 Scanning Google Calendar API integration: Found empty slots Thursday 2:00 PM and 3:30 PM CST.",
      "💬 Composed conversational holding message proposing both slots.",
      "📆 Reserved tentative hold in calendar system.",
      "🚀 Reply dispatched successfully. Status updated: Pending final calendar invite validation."
    ]
  },
  {
    id: "reporter",
    agent: "Revenue Reporter",
    icon: TrendingUp,
    title: "Financial Dispatch",
    description: "Aggregate outbound campaigns, active leads, and current client value logs into a daily brief.",
    directive: "Compile daily metrics, connect Stripe API for live income statistics, and broadcast to phone...",
    color: "from-amber-500 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.12)",
    hoverBorder: "hover:border-amber-500/40",
    logs: [
      "✨ Revenue Reporter active. Aggregating 24-hour workspace metrics...",
      "📊 Performance indices: Outbound scan: 46 clinics, 4 warm drafts compiled, 1 booking secured.",
      "💳 Connecting to Stripe & Stripe Billing APIs: $222.00 captured today.",
      "📈 Retainer pipeline projected: $4,416.00/mo.",
      "📱 Formatting executive summary for WhatsApp dispatch...",
      "📤 Sent to user phone: 'Daily briefing: Your virtual team is active and working continuously on autopilot.'"
    ]
  },
  {
    id: "shield",
    agent: "Guard Shield Agent",
    icon: Shield,
    title: "Sandbox Integrity",
    description: "Perform active background scans across database fields, sandboxes, and API keys to ensure safety.",
    directive: "Verify secure connections, storage keys, and run full sandbox system health checks...",
    color: "from-blue-600 to-cyan-500",
    glowColor: "rgba(37, 99, 235, 0.12)",
    hoverBorder: "hover:border-blue-500/40",
    logs: [
      "✨ Guard Shield Agent active. Running routine diagnostic scans...",
      "🔒 Scanning workspace environment variables: All secure keys encrypted normally.",
      "🛡️ Testing outbound delivery sandbox servers against safety filters: 100% compliant.",
      "🔄 Checked database access policies and rate-limit scopes.",
      "✅ Secure automated system health check complete. 0 issues. Status: SAFE."
    ]
  }
];

export default function LandingPage({ onLaunchDemo }: LandingPageProps) {
  const [activeFeatureTab, setActiveFeatureTab] = useState<number>(0);
  const [activeSuiteTool, setActiveSuiteTool] = useState<number>(0);
  const [pricingCycle, setPricingCycle] = useState<"monthly" | "yearly">("yearly");
  
  // Interactive Demo State
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [demoLogs, setDemoLogs] = useState<string[]>([]);
  const [activeNiche, setActiveNiche] = useState<string>("Cozy Local Dentist");
  const [customNiche, setCustomNiche] = useState<string>("");

  // New States for Interactive Prompt Vertical Selector
  const [activePromptId, setActivePromptId] = useState<string>("lead_finder");
  const [customPrompt, setCustomPrompt] = useState<string>("");

  // ROI Calculator State
  const [retainerAmount, setRetainerAmount] = useState<number>(750);
  const [clientCount, setClientCount] = useState<number>(6);
  const [hoursSavedPerWeek, setHoursSavedPerWeek] = useState<number>(12);

  // Assistant Personality State
  const [activeDirectiveNiche, setActiveDirectiveNiche] = useState<"dental" | "gym" | "plumbing" | "spa">("dental");

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // --- DYNAMIC INTERACTIVE SANDBOXES FOR THE 6 VIRTUAL EMPLOYEES ---
  
  // 1. Finder Sandbox States & Handlers
  const [finderNiche, setFinderNiche] = useState("Dental Clinics");
  const [finderLocation, setFinderLocation] = useState("San Francisco");
  const [isFinderScanning, setIsFinderScanning] = useState(false);
  const [finderLogs, setFinderLogs] = useState<string[]>([]);
  const [finderLeads, setFinderLeads] = useState<any[]>([]);

  const handleFinderScan = () => {
    if (isFinderScanning) return;
    setIsFinderScanning(true);
    setFinderLeads([]);
    setFinderLogs(["[SYSTEM] Connecting to local business indices via secure bridge..."]);

    const steps = [
      { log: "🗺️ Geo-querying business maps API for Niche: \"" + finderNiche + "\" in " + finderLocation + "...", delay: 600 },
      { log: "🔗 Fetching meta metadata and verifying online touchpoints...", delay: 1200 },
      { log: "🌐 Crawling landing pages for active Facebook pixel or Google Tag...", delay: 1800 },
      { log: "✨ Auditing social channels: Looking for missing online appointment links...", delay: 2400 },
      { log: "🎯 Scan completed successfully! Parsed 2 high-value target accounts with structural gaps.", delay: 3000 }
    ];

    steps.forEach((s) => {
      setTimeout(() => {
        setFinderLogs(prev => [...prev, s.log]);
        if (s.delay === 3000) {
          setIsFinderScanning(false);
          setFinderLeads([
            {
              id: "lead-1",
              company: `${finderLocation} Premium ${finderNiche.replace("s", "")}`,
              name: "Dr. Robert Carter",
              email: `contact@${finderLocation.toLowerCase().replace(/\s/g, "")}${finderNiche.toLowerCase().replace(/\s/g, "").replace("s", "")}.com`,
              gap: "Runs active Facebook Ads but landing page lacks any fast booking system. 42% visitor drop-off rate estimated.",
              action: "Outreach initiated via Smart Writer"
            },
            {
              id: "lead-2",
              company: `Elite ${finderNiche.replace("s", "")} Group`,
              name: "Emma Larson, Practice Mgr",
              email: `emma.l@elite${finderNiche.toLowerCase().replace(/\s/g, "").replace("s", "")}sf.com`,
              gap: "Google profile has 48 reviews but no direct appointment scheduling button integration.",
              action: "Queued for automated intro pitch"
            }
          ]);
        }
      }, s.delay);
    });
  };

  // 2. Smart Personal Writer States & Handlers
  const [writerCompany, setWriterCompany] = useState("Apex Dental Group");
  const [writerAngle, setWriterAngle] = useState("booking");
  const [isWriterGenerating, setIsWriterGenerating] = useState(false);
  const [writerDraft, setWriterDraft] = useState("");

  const handleWriterGenerate = () => {
    if (isWriterGenerating) return;
    setIsWriterGenerating(true);
    setWriterDraft("");

    setTimeout(() => {
      setIsWriterGenerating(false);
      let draft = "";
      if (writerAngle === "booking") {
        draft = `Subject: Quick idea for ${writerCompany} - make scheduling simpler for new patients\n\n` +
          `Hi team at ${writerCompany},\n\n` +
          `I noticed you guys are running some great local social campaigns. However, when clicked, it takes visitors to your main home page which doesn't have an instant booking portal.\n\n` +
          `We built a simple 1-click booking bridge that lets clients pick open slots in your calendar in 5 seconds. If I sent over a short 45-second preview of how it would work for ${writerCompany}, would you be open to checking it out?\n\n` +
          `Best regards,\nYour Virtual Growth Assistant`;
      } else if (writerAngle === "social") {
        draft = `Subject: Gentle suggestion regarding ${writerCompany}'s Instagram presence\n\n` +
          `Hi there,\n\n` +
          `Love the patient results you show on your profile! I spotted that you guys have over 2,000 followers, but there's no call-to-action link in your bio.\n\n` +
          `By adding an automated chat-to-book template, you can convert post viewers into booked consults on autopilot. I compiled a custom template with 3 local tips specifically for your niche. Do you mind if I send it over?\n\n` +
          `Have a wonderful week,\nYour Virtual Growth Assistant`;
      } else {
        draft = `Subject: Patient follow-up concept for ${writerCompany}\n\n` +
          `Hello,\n\n` +
          `I noticed you have wonderful reviews from loyal patients! Have you considered a gentle reactivation campaign for clients who haven't visited in the last 6 months?\n\n` +
          `Our smart system does this gracefully via friendly SMS triggers, averaging an 18% re-booking rate. Let me know if you'd like to see the pre-built template for ${writerCompany}.\n\n` +
          `Warmly,\nYour Virtual Growth Assistant`;
      }
      setWriterDraft(draft);
    }, 900);
  };

  // 3. Autopilot Social Publisher States & Handlers
  const [pubTheme, setPubTheme] = useState("Booking Convenience");
  const [pubChannel, setPubChannel] = useState<"Instagram" | "Facebook" | "LinkedIn">("Instagram");
  const [isPubGenerating, setIsPubGenerating] = useState(false);
  const [pubPost, setPubPost] = useState<any>(null);

  const handlePubGenerate = () => {
    if (isPubGenerating) return;
    setIsPubGenerating(true);
    setPubPost(null);

    setTimeout(() => {
      setIsPubGenerating(false);
      let text = "";
      let hash = "";
      if (pubTheme === "Booking Convenience") {
        text = "🕒 Fact: 78% of busy families prefer booking appointments online late at night after traditional business hours have closed. If you still require them to call during the day, you're leaving revenue on the table! 🚀 Make booking frictionless with 1-click scheduling.";
        hash = "#LocalGrowth #AutopilotBooking #CustomerSatisfaction #TimeSaver";
      } else if (pubTheme === "Client Success") {
        text = "⭐ 'Our new virtual receptionist scheduled 18 appointments in our first week on complete autopilot, without us picking up the phone once!' Consistency is the absolute key to scaling local businesses. Let the system handle the scheduling while you deliver high-quality work.";
        hash = "#PassiveIncome #LocalBusinessSuccess #AutomationMindset #ScaleUp";
      } else {
        text = "📈 Stop chasing dead-end leads. Dynamic follow-ups and automated response systems convert prospects into active appointments up to 5x faster than manual outreach. Let's make your local service business stand out from the competition.";
        hash = "#BusinessOwnerTips #SmartSystems #MarketingAutomation #Autopilot";
      }
      setPubPost({
        content: text,
        hashtags: hash,
        scheduledFor: "Tomorrow at 9:00 AM (Optimal Time Slot)",
        engagementScore: "94% (Very High based on local patterns)"
      });
    }, 850);
  };

  // 4. Warm Handshake Scheduler States & Handlers
  const [schedulerReply, setSchedulerReply] = useState("Yeah, I'm open to chatting. How about Thursday afternoon?");
  const [isSchedulerProcessing, setIsSchedulerProcessing] = useState(false);
  const [schedulerOutput, setSchedulerOutput] = useState<any>(null);

  const handleSchedulerProcess = () => {
    if (isSchedulerProcessing) return;
    setIsSchedulerProcessing(true);
    setSchedulerOutput(null);

    setTimeout(() => {
      setIsSchedulerProcessing(false);
      let aiText = "";
      let actionTaken = "";
      if (schedulerReply.toLowerCase().includes("thursday") || schedulerReply.toLowerCase().includes("afternoon")) {
        aiText = "That sounds perfect! I have opened up our direct calendar integration. I've reserved Thursday at 2:00 PM or 3:30 PM (EST) for you. Which of those works better, or would you like to view our full schedule link?";
        actionTaken = "Calendar slot hold request sent. Temporary reservation placed on Google Calendar.";
      } else if (schedulerReply.toLowerCase().includes("expensive") || schedulerReply.toLowerCase().includes("cost") || schedulerReply.toLowerCase().includes("budget")) {
        aiText = "Completely understand! We love working with growing businesses. Our entry-level workspace setup is incredibly cost-effective (starting at just $47) and usually pays for itself with your very first booking. How about a quick chat to look at the exact ROI for your business?";
        actionTaken = "Budget objection sequence executed. Re-framed ROI with starter pricing info.";
      } else {
        aiText = "Thank you so much for your reply! I would love to schedule a quick 10-minute friendly introduction. Here is our direct calendar booking link to pick a time that works best for you: cal.omniagent.co/intro. Talk soon!";
        actionTaken = "General calendar link dispatched. Booking response logged.";
      }
      setSchedulerOutput({
        aiReply: aiText,
        systemAction: actionTaken,
        status: "Holding Appointment Confirmation"
      });
    }, 1000);
  };

  // 5. Daily Success Reporter States & Handlers
  const [reporterClients, setReporterClients] = useState(6);
  const [reporterStyle, setReporterStyle] = useState("Energetic & Pumped");
  const [isReporterRunning, setIsReporterRunning] = useState(false);
  const [reporterOutputText, setReporterOutputText] = useState("");

  const handleReporterRun = () => {
    if (isReporterRunning) return;
    setIsReporterRunning(true);
    setReporterOutputText("");

    setTimeout(() => {
      setIsReporterRunning(false);
      const rev = reporterClients * 750;
      const hours = reporterClients * 12;
      let report = "";
      if (reporterStyle === "Energetic & Pumped") {
        report = `🔥 AMAZING DAY! Your Virtual Assistants are absolutely crushing it! 🔥\n\n` +
          `📈 ACTIVE PARTNERS: ${reporterClients} local clients locked in.\n` +
          `💸 RECURRING REVENUE: $${rev.toLocaleString()}/mo currently flowing on autopilot.\n` +
          `⚡ HOURLY GAINS: You saved ${hours} manual hours this week!\n\n` +
          `🚀 STATUS SUMMARY:\n` +
          `• Finder Scout found 8 new leads today.\n` +
          `• Smart Writer sent 14 custom pitches.\n` +
          `• Scheduler booked 2 warm discovery meetings!\n\n` +
          `Keep winning! Your assistants are fully secure and active. 👊`;
      } else if (reporterStyle === "Professional Summary") {
        report = `[Daily Executive Assistant Report]\n` +
          `Date: ${new Date().toLocaleDateString()}\n\n` +
          `1. Key Performance Indicators:\n` +
          `• Client Base: ${reporterClients} active retainer contracts.\n` +
          `• Monthly Run-Rate: $${rev.toLocaleString()} MRR.\n` +
          `• Operational Time Saved: ${hours} hours/week.\n\n` +
          `2. Activity Register:\n` +
          `• Email campaigns operating within normal parameters.\n` +
          `• Lead database health: 100% verified.\n` +
          `• Handshake Scheduler: 2 incoming appointments pending confirmation.\n\n` +
          `All systems stable. No action required from your side.`;
      } else {
        report = `// AUTO_SYS_REPORT //\n` +
          `CLIENTS_COUNT: ${reporterClients}\n` +
          `AUTOPILOT_MRR: $${rev}\n` +
          `RECOVERED_HOURS_WEEK: ${hours}\n` +
          `ACTIVE_BRIDGE_STATUS: OK_SECURE\n` +
          `DB_VAL_COMPLIANCE: 100%\n` +
          `PENDING_APPOINTMENTS_COUNT: 2\n` +
          `SLEEP_TIMERS_HEALTH: COMPLIANT\n` +
          `// All signals verified green. 0 anomalies detected.`;
      }
      setReporterOutputText(report);
    }, 800);
  };

  // 6. Friendly Competitor Watcher States & Handlers
  const [watcherIndustry, setWatcherIndustry] = useState("Dental Clinics");
  const [watcherRadius, setWatcherRadius] = useState("3 miles");
  const [isWatcherScanning, setIsWatcherScanning] = useState(false);
  const [watcherResults, setWatcherResults] = useState<any[]>([]);

  const handleWatcherScan = () => {
    if (isWatcherScanning) return;
    setIsWatcherScanning(true);
    setWatcherResults([]);

    setTimeout(() => {
      setIsWatcherScanning(false);
      setWatcherResults([
        {
          competitor: "Downtown Dental Spa",
          distance: "1.2 miles away",
          observedChange: "Added a new \"New Patient $69 Special Checkup + Clean\" package to their homepage header.",
          strategy: "💡 Counter-Strategy: Do not engage in a price race to the bottom. Instead, prompt your Scheduler to pitch a high-end complimentary \"Teeth Whitening Voucher\" with full-price checkups to capture the higher quality market segments."
        },
        {
          competitor: "Metro Family Dental",
          distance: "2.4 miles away",
          observedChange: "Their automated booking link is currently down / showing 404. They are temporarily forcing manual calls.",
          strategy: "🚀 Speed-to-lead Opportunity: Run aggressive micro-ads to their postal code right now, highlighting your \"10-second instant 24/7 web booking!\" to capture impatient clients."
        }
      ]);
    }, 1100);
  };

  // Security Deployment States
  const [isSecurityDeploying, setIsSecurityDeploying] = useState<boolean>(false);
  const [securityStep, setSecurityStep] = useState<number>(0);
  const [securityStatus, setSecurityStatus] = useState<"secured" | "deploying" | "ready">("secured");
  const [securityLogs, setSecurityLogs] = useState<string[]>([
    "// Booting secure digital workspace...",
    "Secure Workspace ID: omniagent-room-77",
    "Memory Allocation: Dedicated Memory Stable",
    "Connection status: Fully Secure Bridge Active",
    "Encrypted Keys Vault: Active & Verified",
    "// Status report: All secure. 0 problems detected."
  ]);

  const handleDeploySecurityWorkspace = () => {
    if (isSecurityDeploying) return;
    setIsSecurityDeploying(true);
    setSecurityStatus("deploying");
    setSecurityStep(0);
    setSecurityLogs(["[SYSTEM] Initiating Secure Workspace isolated deployment sequence..."]);

    const steps = [
      { log: "🔑 Creating isolated workspace compartment 'omniagent-room-77'...", step: 1 },
      { log: "🛡️ Setting up client sandboxing enclaves with 0 crossover risk...", step: 2 },
      { log: "🔒 Locking API Credentials Vault with 256-bit AES cryptographic seals...", step: 3 },
      { log: "⏰ Activating anti-spam sleep guards & dynamic action timers...", step: 4 },
      { log: "🚀 System checks: Stable. Memory: Dedicated. Bridge: Secured. Active!", step: 5 }
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setSecurityStep(s.step);
        setSecurityLogs(prev => [...prev, s.log]);
        if (s.step === 5) {
          setIsSecurityDeploying(false);
          setSecurityStatus("ready");
        }
      }, (idx + 1) * 800);
    });
  };

  const agentModesInfo = [
    {
      id: "lead_finder",
      name: "The Friendly Customer Finder",
      role: "Looks up fresh local businesses who need your help.",
      desc: "Autonomously finds lovely local businesses (like dentists, gyms, or plumbers) in any city. It instantly spots simple things they can improve, like active social ads that are missing simple online booking links.",
      badge: "Automated Lead Magic",
      outputExample: "✨ Found 'Apex Dental Clinic'! They run Facebook Ads but have no fast way to book online. We can help them double their bookings!"
    },
    {
      id: "outreach",
      name: "The Smart Personal Writer",
      role: "Drafts warm, polite, and hyper-personalized friendly intros.",
      desc: "No cold templates here! It writes genuine, super-helpful messages talking about that business's exact needs. It sends follow-ups beautifully so you get the best reply rates without lifting a finger.",
      badge: "AI Human-like Copywriter",
      outputExample: "✉️ Drafted warm message to Dr. Vance. Topic: 'Apex Dental Care - quick idea to make booking easier for new clients.' Response rate at a wonderful 24.5%!"
    },
    {
      id: "social_content",
      name: "The Autopilot Social Publisher",
      role: "Creates and posts engaging local tips, updates, and news.",
      desc: "Autonomously schedules and publishes helpful local tips, beautiful images, and fun updates on your Facebook, Instagram, or LinkedIn pages to keep your audience excited.",
      badge: "Autopilot Brand Builder",
      outputExample: "📝 Generated beautiful tip: 'Did you know 78% of local clients prefer booking their appointments online after business hours?' Scheduled to post automatically."
    },
    {
      id: "appointment_booking",
      name: "The Warm Handshake Scheduler",
      role: "Greets replies on your phone and books meetings instantly.",
      desc: "It links directly to your Google Calendar. When a potential client replies 'I am interested!', it friendly guides them to pick an open time slot that works best for both of you.",
      badge: "Easy Calendar Assistant",
      outputExample: "🤝 Success! Dr. Elizabeth Vance said 'Yes!' and scheduled a quick 15-minute chat for tomorrow at 2:30 PM. Calendar event created!"
    },
    {
      id: "revenue_reporter",
      name: "The Daily Success Reporter",
      role: "Gathers all your success and revenue logs in one friendly chat.",
      desc: "It calculates exactly how much money your virtual assistants are making you, compiled beautifully in a friendly chat message delivered directly to your phone every afternoon.",
      badge: "Friendly Money Tracker",
      outputExample: "🎉 Daily Report: Your virtual team earned $222 today across 6 recurring clients! A WhatsApp summary notification has been dispatched."
    },
    {
      id: "competitor_monitor",
      name: "The Friendly Competitor Watcher",
      role: "Gently keeps an eye on other services nearby to keep you ahead.",
      desc: "It automatically scans competitor websites for special deals or pricing drops in your local neighborhood, notifying you immediately so you can offer the perfect match.",
      badge: "Local Trend Radar",
      outputExample: "🔔 Nearby dentistry started offering a '$50 Summer Special.' Sending a friendly tip so you can match the offer!"
    }
  ];

  const pricingTiers = [
    {
      name: "Starter Assistant",
      priceMonthly: 47,
      priceYearly: 37,
      desc: "Deploy a single autonomous digital assistant workspace for your local practice.",
      features: [
        "1 Active Virtual Assistant Space",
        "Customer Finder & Smart Writer enabled",
        "Direct WhatsApp / Telegram Sync Bridge",
        "Friendly setup wizard (no tech skills needed)",
        "Daily automated check-ins",
        "Full step-by-step help videos"
      ],
      cta: "Launch Starter Workspace",
      popular: false
    },
    {
      name: "Autopilot Pro (Recommended)",
      priceMonthly: 97,
      priceYearly: 67,
      desc: "Supercharge your business with faster schedules and more advanced templates.",
      features: [
        "Instant every-4-hours check-ins",
        "All 6 Virtual Employees fully active",
        "Direct Facebook, Instagram & Stripe links",
        "Automated LinkedIn & Meta content postings",
        "Active competitor local trend scanner",
        "Priority VIP friendly support team"
      ],
      cta: "Launch Autopilot Pro",
      popular: true
    },
    {
      name: "Agency Partner Suite",
      priceMonthly: 197,
      priceYearly: 147,
      desc: "Set up and manage unlimited virtual workspaces for your own high-paying local clients.",
      features: [
        "The Ultimate Multi-Client Dashboard",
        "Setup separate instructions for each local client",
        "Manage up to 25 different local clients at once",
        "1-Click pause or play buttons for any client",
        "Beautiful, simple client report builder",
        "Full client onboarding setup kit"
      ],
      cta: "Launch Agency Workspace",
      popular: false
    }
  ];

  // Interactive demo sequence logic (friendly, readable logs)
  const runDemo = () => {
    if (isDemoRunning) return;
    setIsDemoRunning(true);
    setSimStep(1);
    setDemoLogs(["[SYSTEM] Connecting to secure autonomous Workspace Agent Sandbox..."]);

    // Find active preset
    const currentPreset = PROMPT_PRESETS.find(p => p.id === activePromptId);
    
    // Calculate logs to run
    let logsToRun: string[] = [];
    if (customPrompt.trim()) {
      logsToRun = [
        `✨ Custom Prompt Received: "${customPrompt.trim()}"`,
        `🧠 Initializing Deep-Reasoning Agent LLM orchestrator...`,
        `🔍 Parsing parameters & auditing target directories for: "${customPrompt.trim().substring(0, 30)}..."`,
        `⚙️ Executing routine sandbox connection sweeps across active worker nodes...`,
        `🎯 Simulated outcome completed successfully on the sandbox server!`,
        `🎉 Confetti event triggered! Custom prompt action successfully simulated.`
      ];
    } else if (currentPreset) {
      logsToRun = currentPreset.logs;
    } else {
      logsToRun = [
        "✨ AI Agent connected to Workspace sandbox.",
        "⚙️ Running default business optimization guidelines...",
        "✅ Task processed successfully."
      ];
    }

    // Progressively type out the logs
    logsToRun.forEach((logText, index) => {
      setTimeout(() => {
        setDemoLogs(prev => [...prev, logText]);
        setSimStep(index + 2);
        
        // Trigger Canvas Confetti on the last step!
        if (index === logsToRun.length - 1) {
          setIsDemoRunning(false);
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 },
            colors: ["#a855f7", "#6366f1", "#f43f5e", "#10b981"]
          });
        }
      }, (index + 1) * 1300);
    });
  };

  const getDirectiveMarkdown = () => {
    switch (activeDirectiveNiche) {
      case "dental":
        return `How My Dental Assistant Behaves:
------------------------------------------
🌟 MY GOAL: Help busy cosmetic dental clinics get premium patient consultations.
🗣️ MY TONE: Friendly, professional, highly helpful, and warm.

💡 CONVERSATION PLAN:
- Look up cosmetic dentists with open booking slots.
- Send a nice message offering an automated patient scheduler.
- Guide interested dental staff to pick an open spot on our calendar.`;

      case "gym":
        return `How My Fitness Assistant Behaves:
------------------------------------------
🌟 MY GOAL: Get more high-energy people to join local fitness boxes & gyms.
🗣️ MY TONE: Enthusiastic, motivating, friendly, and super positive!

💡 CONVERSATION PLAN:
- Find local gyms running ads with no instant follow-up response.
- Instantly send a text pass proposal when someone requests info.
- Auto-deliver a fun 7-day welcoming sequence to new members.`;

      case "plumbing":
        return `How My Plumbing Assistant Behaves:
------------------------------------------
🌟 MY GOAL: Help plumbers and home services capture emergency leads instantly.
🗣️ MY TONE: Quick, reliable, direct, and reassuring.

💡 CONVERSATION PLAN:
- Monitor weekend requests when office staff is away.
- Automatically reply with instant SMS booking confirmation.
- Politely request a beautiful 5-star Google review after job is done.`;

      case "spa":
        return `How My Medical Spa Assistant Behaves:
------------------------------------------
🌟 MY GOAL: Fill calendar chairs with beauty, Botox, and facial treatments.
🗣️ MY TONE: Elegant, polished, relaxing, and welcoming.

💡 CONVERSATION PLAN:
- Find local spas with nice Instagram profiles but hard-to-use websites.
- Instantly greet users who comment on social posts with beautiful bookable links.
- Send a lovely birthday discount voucher automatically to regular clients.`;
    }
  };

  return (
    <div className="visible-white-mesh text-slate-900 font-sans min-h-screen selection:bg-purple-600 selection:text-white relative overflow-hidden">
      
      {/* Decorative Orbits & Playful Star Accents (Dark Cosmic Neon Style like Benchmark) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {/* Soft beautiful colorful background glows */}
        <motion.div 
          animate={{
            scale: [1, 1.15, 1],
            x: ["-50%", "-46%", "-50%"],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1200px] h-[750px] bg-gradient-to-tr from-purple-100 via-indigo-50 to-transparent rounded-full blur-[140px] animate-pulse" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.2, 0.9, 1],
            x: [0, 60, -30, 0],
            y: [0, -40, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[10%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-fuchsia-100 via-purple-100 to-transparent rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{
            scale: [1, 0.95, 1.15, 1],
            x: [0, -30, 40, 0],
            y: [0, 50, -20, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-tr from-indigo-100 via-violet-100 to-transparent rounded-full blur-[140px]" 
        />

        {/* Elegant modern workspace grids matching benchmark */}
        <div className="absolute inset-0 opacity-[0.14]" style={{
          backgroundImage: "linear-gradient(rgba(147, 51, 234, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />

        {/* Left Orbit Outline */}
        <svg className="absolute top-[12%] left-[-15%] w-[550px] h-[550px] text-purple-500/20 animate-[spin_120s_linear_infinite]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.15" strokeDasharray="1 3" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="2 2" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.05" strokeDasharray="1 4" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.05" strokeDasharray="1 4" />
        </svg>

        {/* Right Orbit Outline */}
        <svg className="absolute top-[8%] right-[-10%] w-[700px] h-[700px] text-indigo-500/20 animate-[spin_180s_linear_infinite]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 4" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.1" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.08" strokeDasharray="1 2" />
        </svg>

        {/* Tiny crosshairs and stars */}
        <div className="absolute top-[18%] left-[22%] text-purple-400/40 text-sm font-light select-none font-mono">+</div>
        <div className="absolute top-[48%] left-[10%] text-indigo-400/40 text-lg font-light select-none font-mono">+</div>
        <div className="absolute top-[14%] right-[24%] text-purple-400/40 text-sm font-light select-none font-mono">+</div>
        <div className="absolute top-[62%] right-[12%] text-indigo-400/40 text-sm font-light select-none font-mono">+</div>

        {/* Gentle shiny stars */}
        <svg className="absolute top-[35%] right-[25%] w-7 h-7 text-purple-500/40 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 3v18M3 12h18" strokeWidth="1" strokeLinecap="round" />
          <path d="M7.5 7.5l9 9M7.5 16.5l9-9" strokeWidth="0.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Sticky Header with Elegant Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 6 }}
              className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl shadow-md shadow-purple-500/20"
            >
              <Zap className="h-4.5 w-4.5 fill-current text-white animate-pulse" />
            </motion.div>
            <div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight">OmniAgent<span className="text-purple-600">AI</span></span>
              <span className="text-[9px] block text-purple-600/80 font-mono leading-none font-bold tracking-widest">AUTOPILOT GROWTH WORKSPACE</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-xs font-semibold text-slate-700">
            <a href="#interactive-playground" className="hover:text-purple-600 transition">Playground</a>
            <a href="#interactive-tools" className="hover:text-purple-600 transition">Live Tools</a>
            <a href="#features" className="hover:text-purple-600 transition">Assistants</a>
            <a href="#soul-md" className="hover:text-purple-600 transition">Templates</a>
            <a href="#roi-calculator" className="hover:text-purple-600 transition">Calculator</a>
            <a href="#pricing" className="hover:text-purple-600 transition">Pricing</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={onLaunchDemo}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 transition rounded-xl text-xs font-semibold"
            >
              Log in
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onLaunchDemo}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/15 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
            >
              <span>Sign Up</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </div>
      </header>

      <LiveActivityTicker />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-purple-50 border border-purple-200/80 px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-extrabold text-purple-700 uppercase tracking-widest shadow-[0_2px_12px_rgba(147,51,234,0.06)]"
          >
            <Sparkle className="h-3.5 w-3.5 text-purple-600 fill-current animate-spin" />
            <span>AGENTIC AI • FOR EXPERTS, COACHES AND SAAS FOUNDERS</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7.5xl font-black text-slate-900 tracking-tight leading-none"
          >
            AI agents that show up daily <br />
            to <span className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent font-extrabold">grow your revenue</span>
            <span className="text-purple-600 animate-blink font-light">|</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-slate-600 text-sm sm:text-base max-w-2.5xl mx-auto leading-relaxed font-normal"
          >
            Your autonomous Agentic AI team <strong className="text-slate-950 font-extrabold">Scrapes, Outreaches & Books</strong> 100+ pieces of personalized pitches weekly so you stay visible, trusted & selling without hiring, burnout, or juggling multiple complex tools.
          </motion.p>

          {/* Interactive CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={onLaunchDemo}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-[0_4px_25px_rgba(147,51,234,0.3)] text-white font-extrabold px-8 py-4 rounded-full text-xs tracking-wide flex items-center justify-center space-x-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Activate Your AI Team</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#interactive-playground"
              className="w-full sm:w-auto bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 px-7 py-4 rounded-full text-xs font-bold flex items-center justify-center space-x-2 transition transform hover:-translate-y-0.5 shadow-sm"
            >
              <Play className="h-4 w-4 text-purple-600 fill-current" />
              <span>Watch Intro</span>
            </a>
          </motion.div>

          {/* Trust Reviews */}
          <div className="pt-2 flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center space-x-1 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-current text-purple-600" />
              ))}
              <span className="text-slate-600 text-xs font-mono ml-2 font-semibold">10K+ reviews • 4.9</span>
            </div>
          </div>

          {/* --- BEAUTIFUL HORIZONTAL GROWTH ROADMAP PATH (Benchmark Screenshot 1) --- */}
          <div className="pt-12 pb-6 relative max-w-5xl mx-auto overflow-hidden">
            <div className="absolute inset-x-0 top-[60%] h-0.5 bg-gradient-to-r from-purple-300/10 via-purple-500/20 to-indigo-300/10 z-0 pointer-events-none" />
            
            {/* Elegant wavy glowing SVG Line */}
            <svg className="w-full h-32 absolute top-0 left-0 z-0 pointer-events-none opacity-80" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <path 
                d="M 0,80 Q 200,85 300,75 T 500,60 T 800,30 T 1000,10" 
                fill="none" 
                stroke="url(#glowing-line-gradient)" 
                strokeWidth="2.5" 
                strokeDasharray="6 4"
                className="animate-[dash_40s_linear_infinite]"
              />
              <defs>
                <linearGradient id="glowing-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.2" />
                  <stop offset="30%" stopColor="#7c3aed" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#a855f7" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
                </linearGradient>
              </defs>
            </svg>

            {/* Path Nodes & Floating Badges */}
            <div className="relative z-10 grid grid-cols-4 gap-2 text-center">
              {/* Node 1: Start */}
              <div className="flex flex-col items-center justify-end h-32 pb-1 text-left">
                <span className="text-[10px] font-mono text-purple-600/70 block mb-1">STAGE 01</span>
                <span className="text-xs text-slate-700 font-semibold">Workspace Configuration</span>
                <div className="h-3 w-3 rounded-full bg-white border-2 border-purple-500 mt-2 shadow-[0_2px_8px_rgba(99,102,241,0.2)]" />
              </div>

              {/* Node 2: Today (Active Highlight) */}
              <div className="flex flex-col items-center justify-end h-32 pb-1 relative">
                {/* Floating "Today" Badge Card with Cute Astronaut avatar */}
                <div className="absolute top-[-10px] bg-white border border-purple-200/80 rounded-2xl p-2.5 shadow-[0_4px_20px_rgba(147,51,234,0.12)] flex flex-col items-center space-y-1.5 max-w-[150px] animate-[bounce_4s_infinite_ease-in-out]">
                  <span className="bg-purple-100 text-purple-700 border border-purple-200 text-[9px] font-bold px-2 py-0.5 rounded-full">Today</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-700 font-semibold whitespace-nowrap">You Deployed</span>
                  </div>
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-xl shadow-inner">AI Agents</span>
                </div>
                <div className="h-4 w-4 rounded-full bg-purple-500 border-2 border-white mt-2 shadow-[0_0_12px_#a855f7] animate-ping absolute bottom-[5px]" />
                <div className="h-3 w-3 rounded-full bg-purple-500 border-2 border-white mt-2 shadow-[0_0_10px_#a855f7]" />
              </div>

              {/* Node 3: Growth */}
              <div className="flex flex-col items-center justify-end h-32 pb-1">
                {/* Floating "Consistent Growth" tag */}
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1.5 rounded-xl mb-4 shadow-md">
                  Consistent Growth
                </div>
                <div className="h-3 w-3 rounded-full bg-white border-2 border-indigo-400 mt-2" />
              </div>

              {/* Node 4: Trophy / Success */}
              <div className="flex flex-col items-center justify-end h-32 pb-1">
                {/* Floating Golden Trophy circle */}
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-[0_4px_15px_rgba(245,158,11,0.25)] mb-3 transform hover:scale-110 transition duration-300">
                  <Trophy className="h-4 w-4" />
                </div>
                <div className="h-3 w-3 rounded-full bg-white border-2 border-indigo-400 mt-2" />
              </div>
            </div>
          </div>

          <div className="text-center pt-8 max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Launch Your AI Team! In less Than 5 Mins</h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">See How Your Daily Visibility Becomes Automatic.</p>
          </div>

        </div>

        {/* Premium, Non-Technical Dashboard Mockup (Deep Dark Glassmorphism) */}
        <div className="max-w-5xl mx-auto mt-16 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative bg-white/[0.02] backdrop-blur-xl p-1.5">
          <div className="bg-[#2d266e]/80 border-b border-white/10 px-4 py-3.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-purple-500 animate-pulse" />
              <span className="h-3 w-3 rounded-full bg-indigo-500" />
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-[11px] text-slate-300 font-mono ml-4 flex items-center gap-1.5">
                💼 Your Active Growth Workspace
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-white/5 text-[10px] font-mono px-3 py-1.5 rounded-lg border border-white/10 text-purple-300 flex items-center gap-1.5 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping" /> Working Continuously on Autopilot
              </span>
            </div>
          </div>

          <div className="bg-[#09090b]/95 p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300">
            {/* Live Card 1 */}
            <motion.div 
              whileHover={{ y: -4, borderColor: "rgba(147, 51, 234, 0.4)" }}
              className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 space-y-4 transition-all"
            >
              <div className="text-white font-extrabold flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-purple-400">🤖 Assistant Health</span>
                <span className="text-[9px] bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md font-bold">100% Safe</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                Your virtual team operates in a secure sandbox, storing your potential clients beautifully in memory.
              </p>
              <div className="text-[10px] bg-white/[0.02] p-3 rounded-xl border border-white/5 text-slate-400 space-y-1 font-mono">
                <div className="flex justify-between"><span>CHECK-IN RATE:</span><span className="text-purple-400 font-bold">Every 4 Hours</span></div>
                <div className="flex justify-between"><span>NEXT AUTO RUN:</span><span className="text-purple-400 font-bold">In 1 Hour</span></div>
              </div>
            </motion.div>

            {/* Live Card 2 */}
            <motion.div 
              whileHover={{ y: -4, borderColor: "rgba(139, 92, 246, 0.4)" }}
              className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 space-y-4 transition-all"
            >
              <div className="text-white font-extrabold flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-indigo-400">💬 Mobile Sync</span>
                <span className="text-[9px] bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-bold">Active</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                All daily progress reports, warm lead replies, and confirmations are sent right to your handheld phone.
              </p>
              <div className="text-[10px] bg-white/[0.02] p-3 rounded-xl border border-white/5 text-slate-300 space-y-1 font-mono">
                <div className="text-purple-300 font-semibold truncate">💬 Setup Confirmed • Direct Sync Active</div>
                <div className="text-indigo-300 font-semibold truncate">🎯 Scraped 12 new local leads today</div>
              </div>
            </motion.div>

            {/* Live Card 3 */}
            <motion.div 
              whileHover={{ y: -4, borderColor: "rgba(244, 63, 94, 0.4)" }}
              className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 space-y-4 transition-all"
            >
              <div className="text-white font-extrabold flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-purple-400">📈 Client Retainers</span>
                <span className="text-[9px] bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md font-bold">Income</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                Easily monitor client values, daily outbound notes, and estimated monthly income.
              </p>
              <div className="pt-1.5">
                <span className="text-3xl font-black text-white tracking-tight">$4,416.00</span>
                <span className="text-[9px] block text-purple-300 font-normal mt-0.5 font-mono">Projected monthly retainer income</span>
              </div>
            </motion.div>
          </div>
        </div>

      </section>

      {/* Premium Autopilot Playground (Sleek Dark Mode Grid Style) */}
      <section id="interactive-playground" className="py-20 px-6 border-b border-slate-200/80 bg-transparent relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-purple-600 font-mono tracking-widest uppercase block">LIVE AUTOPILOT PLAYGROUND</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Test Run Your Virtual Assistant
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto">
              Select an agent's vertical prompt template below, or type your own custom directive to test simulate our autonomous 2.0 pipeline in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* LEFT COLUMN: INTERACTIVE PROMPT VERTICAL SELECTOR */}
            <div className="lg:col-span-5 flex flex-col space-y-3.5">
              <div className="flex items-center justify-between pb-1.5 px-1">
                <span className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-wider">Select Agent Preset</span>
                <span className="text-[10px] font-mono text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded">6 Specialized Employees</span>
              </div>
              
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
                {PROMPT_PRESETS.map((preset) => {
                  const IconComponent = preset.icon;
                  const isSelected = activePromptId === preset.id && !customPrompt.trim();
                  
                  return (
                    <CardGlow
                      key={preset.id}
                      glowColor={preset.glowColor}
                      hoverBorderColor={preset.hoverBorder}
                      className={`rounded-2xl transition-all duration-300 text-left cursor-pointer bg-white ${
                        isSelected 
                          ? "border-purple-500 ring-2 ring-purple-500/15 shadow-md shadow-purple-500/5 bg-purple-50/10" 
                          : "border-slate-200 shadow-sm hover:shadow"
                      }`}
                    >
                      <button
                        onClick={() => {
                          if (!isDemoRunning) {
                            setActivePromptId(preset.id);
                            setCustomPrompt("");
                            setDemoLogs([]);
                          }
                        }}
                        disabled={isDemoRunning}
                        className="w-full p-4.5 text-left focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-start space-x-3.5">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${preset.color} text-white shadow-md shadow-purple-500/10`}>
                            <IconComponent className="h-4.5 w-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                                {preset.agent}
                              </span>
                              {isSelected && (
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-ping" />
                              )}
                            </div>
                            <h4 className="text-xs font-black text-slate-800 tracking-tight mt-0.5">
                              {preset.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 leading-normal mt-1">
                              {preset.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    </CardGlow>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: ACTIVE CONSOLE & DIRECTIVE INPUT */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-wider">Or Input Custom Directive</label>
                  {customPrompt.trim() && (
                    <span className="text-[9px] font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold">Custom Prompt Override Active</span>
                  )}
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-purple-500">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    disabled={isDemoRunning}
                    placeholder="E.g., Write a newsletter update for dental client checkup rates..."
                    value={customPrompt}
                    onChange={(e) => {
                      setCustomPrompt(e.target.value);
                      if (e.target.value.trim() && !isDemoRunning) {
                        setDemoLogs([]);
                      }
                    }}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 shadow-sm rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition disabled:opacity-60"
                  />
                  {customPrompt && (
                    <button
                      onClick={() => {
                        setCustomPrompt("");
                        setDemoLogs([]);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Console Sandbox Shell (glowing dark card) */}
              <CardGlow
                glowColor="rgba(168, 85, 247, 0.08)"
                hoverBorderColor="border-white/10 hover:border-purple-500/30"
                className="bg-[#09090b] rounded-2xl border border-white/10 p-5 font-mono text-xs text-slate-200 min-h-[380px] flex flex-col justify-between relative shadow-2xl flex-1"
              >
                {/* Integrated Console Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 block"></span>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Autopilot Live Console</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={runDemo}
                    disabled={isDemoRunning}
                    className={`px-4.5 py-2 rounded-xl text-xs font-extrabold tracking-wider flex items-center space-x-2 shadow-md border ${
                      isDemoRunning
                        ? "bg-white/5 text-slate-500 border-white/5 cursor-not-allowed"
                        : "bg-purple-600 border-purple-500 hover:bg-purple-500 text-white shadow-purple-500/20 cursor-pointer"
                    }`}
                  >
                    <Play className={`h-3.5 w-3.5 ${isDemoRunning ? 'animate-spin text-white' : 'fill-current text-purple-200'}`} />
                    <span>{isDemoRunning ? "EXECUTING..." : "RUN DIRECTIVE"}</span>
                  </motion.button>
                </div>
                
                {/* Simulated Log Area */}
                <div className="space-y-3 max-h-[290px] overflow-y-auto pr-2 scrollbar-thin flex-1">
                  <div className="text-[11px] leading-relaxed border-l-2 border-purple-500/40 pl-3 py-1 bg-purple-500/5 mb-3 rounded-r">
                    <span className="text-purple-400 font-bold block mb-0.5">📥 ACTIVE DIRECTIVE TARGET:</span>
                    <span className="text-slate-300 italic">
                      {customPrompt.trim() 
                        ? `Custom Override: "${customPrompt}"`
                        : `${PROMPT_PRESETS.find(p => p.id === activePromptId)?.directive}`}
                    </span>
                  </div>

                  {demoLogs.length === 0 && (
                    <div className="text-slate-500 italic h-full flex flex-col items-center justify-center pt-10 pb-10">
                      <Terminal className="h-8 w-8 text-slate-700 mb-2 animate-pulse" />
                      <p className="text-slate-400 font-mono text-[11px] text-center max-w-xs leading-normal">
                        Select an agent preset on the left or enter a custom prompt directive above, then click <strong className="text-purple-400">"RUN DIRECTIVE"</strong> to execute in the workspace sandbox.
                      </p>
                    </div>
                  )}
                  
                  <AnimatePresence>
                    {demoLogs.map((log, idx) => {
                      const isSuccess = log.startsWith("🎉") || log.startsWith("✅") || log.includes("Success") || log.includes("successful");
                      const isWarning = log.includes("replied") || log.includes("GAP MATCH") || log.includes("Custom Prompt");
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`leading-relaxed border-l-2 pl-3 py-0.5 text-[11px] ${
                            isSuccess
                              ? "border-emerald-500 text-emerald-400 bg-emerald-500/5 font-semibold"
                              : isWarning
                              ? "border-amber-400 text-amber-300 bg-amber-500/5 font-semibold"
                              : "border-slate-800 text-slate-300"
                          }`}
                        >
                          <span className="text-slate-500 select-none mr-2">[{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                          {log}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Console Footer Status */}
                <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <div className="flex items-center space-x-2">
                    <span className={`h-2 w-2 rounded-full ${isDemoRunning ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
                    <span>ASSISTANT_STATUS: {isDemoRunning ? "WORKING" : "STANDBY_IDLE"}</span>
                  </div>
                  <div>SECURE AUTOMATED ROOM: ACTIVE</div>
                </div>
              </CardGlow>
            </div>

          </div>

        </div>
      </section>

      {/* Interactive Audit and Agent Creator Modules (Addictive Features 1, 2, 3 & 4) */}
      <section id="interactive-tools" className="py-24 px-6 border-b border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-white relative z-10">
        <div className="max-w-5xl mx-auto space-y-10">

          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-purple-600 font-mono tracking-widest uppercase block">Interactive Suite</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Try the Automation Live
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Pick a tool below to test-drive the pipeline. One step at a time, no clutter.
            </p>
          </div>

          {(() => {
            const suiteTools = [
              { label: "Lead Audit", icon: Search },
              { label: "Build an Agent", icon: Cpu },
              { label: "SMS Sandbox", icon: MessageSquare },
              { label: "Revenue Calculator", icon: BarChart3 },
            ];
            return (
              <>
                {/* Tab selector */}
                <div className="flex flex-wrap justify-center gap-2">
                  {suiteTools.map((tool, index) => {
                    const Icon = tool.icon;
                    const isActive = activeSuiteTool === index;
                    return (
                      <button
                        key={tool.label}
                        onClick={() => setActiveSuiteTool(index)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all border ${
                          isActive
                            ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200"
                            : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tool.label}
                      </button>
                    );
                  })}
                </div>

                {/* Active tool panel */}
                <div className="max-w-3xl mx-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSuiteTool}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.2 }}
                    >
                      {activeSuiteTool === 0 && <LiveAuditSimulator />}
                      {activeSuiteTool === 1 && <AgentCustomizer onDeploy={onLaunchDemo} />}
                      {activeSuiteTool === 2 && <ConversationalSimulator />}
                      {activeSuiteTool === 3 && <FrictionFunnelAnalyzer onDeploy={onLaunchDemo} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </>
            );
          })()}

        </div>
      </section>

      {/* Editorial/Fastest Path Section (Benchmark Screenshot 2) */}
      <section className="py-24 px-6 border-b border-slate-200/80 bg-transparent relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6 text-left">
            <span className="text-xs font-bold text-purple-600 font-mono tracking-widest uppercase block">THE NEW PARADIGM</span>
            <h2 className="text-3xl sm:text-4.5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              The Fastest Path to More Students, <br />
              SaaS Users & Clients
            </h2>
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>
                AI made product creation a vibe. Your SaaS, course, or service offer can be cloned or created in a single weekend. <strong className="text-slate-950 font-bold">You're not competing on product anymore. Distribution, audience & content is the new moat.</strong>
              </p>
              <p>
                The only way to win? Show up daily as the trusted expert in your niche to build a personal/expert brand. People buy from people, not faceless logos.
              </p>
              <p className="text-slate-500 font-medium italic">
                OmniAgentAI automates this entire cycle. It scouts active high-intent conversations, prepares hyper-relevant pitches, and routes warm responses directly to your phone.
              </p>
            </div>
          </div>
          <div className="md:col-span-5 relative text-left">
            {/* Elegant glowing graphics mockup */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 rounded-3xl blur-2xl opacity-50 z-0" />
            <div className="relative z-10 bg-white border border-purple-100 rounded-3xl p-6 shadow-xl space-y-6 text-xs text-slate-700">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-mono text-[10px] text-purple-600 font-bold">DISTRIBUTION STATS</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between font-mono"><span>OUTBOUND CAPACITY:</span><span className="text-slate-900 font-bold">100% Autopilot</span></div>
                <div className="flex justify-between font-mono"><span>DAILY ENGAGEMENT:</span><span className="text-emerald-600 font-bold">+412%</span></div>
                <div className="flex justify-between font-mono"><span>ORGANIC TRAFFIC:</span><span className="text-purple-700 font-bold">+2.4K / mo</span></div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 text-center font-bold text-purple-700 text-[11px]">
                🚀 Moat Status: Fully Automated
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OLD Way vs NEW Way Section (Benchmark Screenshot 2) */}
      <section className="py-24 px-6 border-b border-slate-200/80 bg-transparent relative z-10">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-purple-600 font-mono tracking-widest uppercase block">WORK SMARTER</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Showing Up Daily Can Be Slow, Expensive & Overwhelming
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              There's a faster, smarter way... using purpose-built AI Agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* The OLD Way */}
            <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-8 space-y-6 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <X className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">The OLD Way</h3>
              </div>
              
              <ul className="space-y-4 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 mt-0.5">✕</span>
                  <span>Spending 3+ hours daily manually looking up local directories and scraping Google Maps.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 mt-0.5">✕</span>
                  <span>Writing repetitive emails or LinkedIn pitches that get ignored or marked as spam.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 mt-0.5">✕</span>
                  <span>Hiring expensive visual agencies or virtual assistants who take weeks to onboard and require heavy salaries.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 mt-0.5">✕</span>
                  <span>Constantly burning out trying to balance client execution with outbound marketing.</span>
                </li>
              </ul>
            </div>

            {/* The NEW Way with OmniAgentAI */}
            <div className="bg-white border border-purple-200 rounded-3xl p-8 space-y-6 shadow-[0_4px_25px_rgba(147,51,234,0.06)] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider font-mono">
                highly recommended
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">The NEW Way with OmniAgentAI</h3>
              </div>
              
              <ul className="space-y-4 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 mt-0.5 font-bold">✓</span>
                  <span>Deploy 6 specialized agents that constantly scan, compile, and clean your prospect sheets.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 mt-0.5 font-bold">✓</span>
                  <span>AI drafts ultra-personalized messages matching their real-life focus instantly.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 mt-0.5 font-bold">✓</span>
                  <span>Your dashboard books appointments automatically to Google Calendar & Calendly.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 mt-0.5 font-bold">✓</span>
                  <span>Operates silently 24/7/365 for a small, tiny fraction of a single virtual assistant's pay.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Testimonial Block (Benchmark Screenshot 2 bottom) */}
          <div className="max-w-3xl mx-auto bg-purple-50/70 border border-purple-100 rounded-3xl p-8 text-center space-y-4 relative shadow-sm">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest font-mono">
              USER REVIEW
            </span>
            <p className="text-sm sm:text-base text-slate-800 italic leading-relaxed">
              "I added 14 new high-ticket clients in 45 days... I used to spend weeks sending manual cold outreach. Now, my AI team does it all on autopilot."
            </p>
            <div className="text-xs text-purple-700 font-bold font-mono">
              — Digital Tilda, Growth Lead
            </div>
          </div>
        </div>
      </section>

      {/* The 6 Agent Modes / Features Section (Stunning Benchmark Design like MarketingBlocks) */}
      <section id="features" className="py-24 px-6 border-b border-slate-200/80 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="inline-flex items-center space-x-2 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full text-xs font-extrabold text-purple-700 uppercase tracking-wider shadow-[0_2px_10px_rgba(147,51,234,0.04)]">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>Suite of 6 Specialized Autopilot Agents</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Six Dedicated AI Employees. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">Zero Payroll. Zero Onboarding.</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Why hire slow agencies or manage expensive freelancers? OmniAgentAI equips your business with a self-running, fully automated workforce. Select any agent below to test their live capabilities.
            </p>
          </div>

          {/* Interactive Bento Showcase and Playground */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Bento-Grid of AI Agent Cards (Left/Top) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agentModesInfo.map((mode, index) => {
                const isActive = activeFeatureTab === index;
                
                // Bespoke metrics and details for each agent card
                const agentMeta = [
                  { kpi: "100% Validated Leads", stat: "Maps & Directory Scraped", color: "from-blue-500 to-indigo-500", icon: Search },
                  { kpi: "24.5% Reply Rate", stat: "Hyper-Personalized Hooks", color: "from-purple-500 to-indigo-500", icon: Edit3 },
                  { kpi: "94% Match Score", stat: "Daily Automated Publishing", color: "from-pink-500 to-purple-500", icon: Megaphone },
                  { kpi: "1,200+ Bookings", stat: "Calendly & Google Synced", color: "from-emerald-500 to-teal-500", icon: Calendar },
                  { kpi: "100% Live Report", stat: "WhatsApp Status Update", color: "from-amber-500 to-orange-500", icon: TrendingUp },
                  { kpi: "Spy Audit Live", stat: "Competitor Price Alerts", color: "from-blue-500 to-cyan-500", icon: Eye }
                ][index];

                const IconComponent = agentMeta.icon;

                return (
                  <motion.div
                    key={mode.id}
                    whileHover={{ y: -4, scale: 1.015 }}
                    onClick={() => setActiveFeatureTab(index)}
                    className={`p-5 rounded-3xl border text-left cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group select-none ${
                      isActive 
                        ? "bg-white border-purple-500 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500/20" 
                        : "bg-white/60 border-slate-200 hover:border-purple-300 hover:bg-white"
                    }`}
                  >
                    {/* Active State Background Glow */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-indigo-500/5 to-transparent pointer-events-none" />
                    )}

                    <div className="space-y-4">
                      {/* Top Header of Card */}
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-2xl bg-gradient-to-tr ${agentMeta.color} text-white shadow-md`}>
                          <IconComponent className="h-4.5 w-4.5" />
                        </div>
                        
                        {isActive ? (
                          <span className="bg-purple-600 text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                            Active Test
                          </span>
                        ) : (
                          <span className="text-[9px] bg-slate-50 border border-slate-200 text-slate-500 font-bold font-mono px-2 py-0.5 rounded-full uppercase">
                            Ready
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
                          {mode.name}
                        </h3>
                        <p className="text-[10.5px] text-purple-600 font-semibold font-mono block mt-0.5">
                          {mode.badge}
                        </p>
                        <p className="text-[11.5px] text-slate-600 leading-normal mt-2 line-clamp-2">
                          {mode.role}
                        </p>
                      </div>
                    </div>

                    {/* Footer Metrics */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono">
                      <div className="text-slate-500 font-semibold">{agentMeta.stat}</div>
                      <div className="text-purple-600 font-extrabold bg-purple-50 px-1.5 py-0.5 rounded-md">
                        {agentMeta.kpi}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Selected Sandbox Playground Console Display (Right/Bottom) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/80 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-6">
                
                {/* Header Info */}
                <div className="flex justify-between items-start flex-wrap gap-3 pb-5 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-purple-50 border border-purple-200/80 text-purple-700 text-[9px] font-bold font-mono uppercase rounded-full">
                      {agentModesInfo[activeFeatureTab].badge}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      {agentModesInfo[activeFeatureTab].name}
                    </h3>
                  </div>

                  <button
                    onClick={onLaunchDemo}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-[10px] font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <span>Full Dashboard</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Agent Description Block */}
                <div className="space-y-2 text-left">
                  <span className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider block">AUTOPILOT FUNCTION</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {agentModesInfo[activeFeatureTab].desc}
                  </p>
                </div>

                {/* Live Sandbox Workspace */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-inner">
                  
                  {activeFeatureTab === 0 && (
                    /* 🔍 Finder Sandbox */
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-wider block">Live Finder Scan Sandbox</span>
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Query local maps dynamically to retrieve premium, unserved local clients.</p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[8.5px] font-bold text-slate-400 uppercase block font-mono">Business Niche</label>
                            <input
                              type="text"
                              value={finderNiche}
                              onChange={(e) => setFinderNiche(e.target.value)}
                              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-semibold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8.5px] font-bold text-slate-400 uppercase block font-mono">Postal City / State</label>
                            <input
                              type="text"
                              value={finderLocation}
                              onChange={(e) => setFinderLocation(e.target.value)}
                              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-semibold"
                            />
                          </div>
                        </div>

                        {finderLogs.length > 0 && (
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[9px] text-slate-300 max-h-[110px] overflow-y-auto space-y-1">
                            {finderLogs.map((log, idx) => (
                              <div key={idx} className={idx === finderLogs.length - 1 ? "text-indigo-300 font-bold" : ""}>
                                {log}
                              </div>
                            ))}
                          </div>
                        )}

                        {finderLeads.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {finderLeads.map((lead) => (
                              <div key={lead.id} className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-sm">
                                <div className="flex justify-between items-start">
                                  <span className="text-[10px] font-extrabold text-slate-800">{lead.company}</span>
                                  <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1 rounded font-bold font-mono uppercase">Verified</span>
                                </div>
                                <p className="text-[9px] text-slate-500 leading-normal font-medium">Gap: {lead.gap}</p>
                                <div className="text-[8px] text-emerald-600 font-bold flex items-center">
                                  <Check className="h-2 w-2 mr-1" /> {lead.action}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleFinderScan}
                        disabled={isFinderScanning}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isFinderScanning ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                            <span>Scanning Neighborhood Directories...</span>
                          </>
                        ) : (
                          <>
                            <Search className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Trigger Scout Search Scan</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {activeFeatureTab === 1 && (
                    /* 📝 Writer Sandbox */
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-wider block">Live Personal Writer</span>
                          <span className="text-[9px] text-slate-400 font-mono font-bold uppercase">Human-like AI Hook</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Draft customized, friendly follow-ups perfectly matched to lead attributes.</p>

                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-[8.5px] font-bold text-slate-400 uppercase block font-mono">Prospect Practice / Company</label>
                            <input
                              type="text"
                              value={writerCompany}
                              onChange={(e) => setWriterCompany(e.target.value)}
                              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-semibold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] font-bold text-slate-400 uppercase block font-mono">Outreach Pitch Angle</label>
                            <select
                              value={writerAngle}
                              onChange={(e) => setWriterAngle(e.target.value)}
                              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-semibold cursor-pointer"
                            >
                              <option value="booking">Fix Landing Page Online Booking</option>
                              <option value="social">Add Call-to-Action Link in Bio</option>
                              <option value="reactivation">Gentle Inactive Patient Follow-up</option>
                            </select>
                          </div>
                        </div>

                        {writerDraft && (
                          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm text-[9.5px] leading-relaxed text-slate-700 max-h-[140px] overflow-y-auto font-mono whitespace-pre-wrap">
                            {writerDraft}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleWriterGenerate}
                        disabled={isWriterGenerating}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isWriterGenerating ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                            <span>Formulating AI Hook...</span>
                          </>
                        ) : (
                          <>
                            <Edit3 className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Formulate Custom Hook Intro</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {activeFeatureTab === 2 && (
                    /* 📢 Publisher Sandbox */
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-wider block">Social Media Autopilot</span>
                          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        </div>
                        <p className="text-[11px] text-slate-500">Auto-publish beautiful updates and local tips to secure strong organic presence.</p>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[8.5px] font-bold text-slate-400 uppercase block font-mono">Post Theme</label>
                            <select
                              value={pubTheme}
                              onChange={(e) => setPubTheme(e.target.value)}
                              className="w-full text-xs bg-white border border-slate-250 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-semibold cursor-pointer"
                            >
                              <option value="Booking Convenience">Booking Convenience</option>
                              <option value="Client Success">Client Success Case</option>
                              <option value="Growth Tips">Local Growth Tips</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] font-bold text-slate-400 uppercase block font-mono">Target Channel</label>
                            <select
                              value={pubChannel}
                              onChange={(e: any) => setPubChannel(e.target.value)}
                              className="w-full text-xs bg-white border border-slate-250 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-semibold cursor-pointer"
                            >
                              <option value="Instagram">Instagram Feed</option>
                              <option value="Facebook">Facebook Business</option>
                              <option value="LinkedIn">LinkedIn Business</option>
                            </select>
                          </div>
                        </div>

                        {pubPost && (
                          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="h-6 w-6 rounded-full bg-slate-900 text-[10px] flex items-center justify-center text-white font-bold font-mono">AI</div>
                              <div>
                                <h4 className="text-[9px] font-bold text-slate-800">Your Autopilot Brand</h4>
                                <span className="text-[8px] text-slate-400 font-semibold font-mono block -mt-0.5">{pubChannel} Schedule</span>
                              </div>
                            </div>
                            <p className="text-[9px] text-slate-600 leading-normal font-medium">{pubPost.content}</p>
                            <p className="text-[9px] text-indigo-600 font-mono font-bold leading-none">{pubPost.hashtags}</p>
                            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[8px] text-slate-400 font-semibold font-mono">
                              <span>⏰ {pubPost.scheduledFor}</span>
                              <span className="text-emerald-600 bg-emerald-50 px-1 rounded uppercase">Score: {pubPost.engagementScore}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handlePubGenerate}
                        disabled={isPubGenerating}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isPubGenerating ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                            <span>Formatting Social Post...</span>
                          </>
                        ) : (
                          <>
                            <Megaphone className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Assemble & Schedule Post</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {activeFeatureTab === 3 && (
                    /* 📅 Scheduler Sandbox */
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-wider block">Warm Handshake Flow</span>
                          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        </div>
                        <p className="text-[11px] text-slate-500">Review a real-time response from an interested customer; see the assistant schedule them automatically.</p>

                        <div className="space-y-2">
                          <label className="text-[8.5px] font-bold text-slate-400 uppercase block font-mono">Select Potential Customer Mood</label>
                          <div className="flex flex-col gap-1.5">
                            <button
                              onClick={() => setSchedulerReply("Yeah, I'm open to chatting. How about Thursday afternoon?")}
                              className={`text-left text-[10px] px-2.5 py-1.5 border rounded-xl font-medium transition cursor-pointer ${
                                schedulerReply.includes("Thursday") 
                                  ? "bg-indigo-50 border-indigo-200 text-indigo-800" 
                                  : "bg-white border-slate-200 hover:bg-slate-100 text-slate-600"
                              }`}
                            >
                              📅 \"Sure, Thursday afternoon works for a quick talk.\"
                            </button>
                            <button
                              onClick={() => setSchedulerReply("Is this expensive? I don't have much budget right now.")}
                              className={`text-left text-[10px] px-2.5 py-1.5 border rounded-xl font-medium transition cursor-pointer ${
                                schedulerReply.includes("expensive") 
                                  ? "bg-indigo-50 border-indigo-200 text-indigo-800" 
                                  : "bg-white border-slate-200 hover:bg-slate-100 text-slate-600"
                              }`}
                            >
                              💰 \"Is it expensive? We are tight on budget right now.\"
                            </button>
                            <button
                              onClick={() => setSchedulerReply("I'm interested. Send me your full schedule info.")}
                              className={`text-left text-[10px] px-2.5 py-1.5 border rounded-xl font-medium transition cursor-pointer ${
                                schedulerReply.includes("schedule info") 
                                  ? "bg-indigo-50 border-indigo-200 text-indigo-800" 
                                  : "bg-white border-slate-200 hover:bg-slate-100 text-slate-600"
                              }`}
                            >
                              ✉️ \"I'm interested. Send me more details to check out.\"
                            </button>
                          </div>
                        </div>

                        {schedulerOutput && (
                          <div className="space-y-2 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] uppercase font-mono font-bold text-slate-400">Autopilot Response</span>
                              <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1 rounded uppercase font-bold font-mono">ACTIVE_ACTION</span>
                            </div>
                            <p className="text-[9.5px] italic text-slate-700 leading-normal bg-indigo-50/30 p-2 rounded-xl">
                              \"{schedulerOutput.aiReply}\"
                            </p>
                            <p className="text-[8px] font-mono text-indigo-600 font-bold -mt-1">
                              ⚡ System Trigger: {schedulerOutput.systemAction}
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleSchedulerProcess}
                        disabled={isSchedulerProcessing}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSchedulerProcessing ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                            <span>Processing Reply Objections...</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Process Reply Autonomously</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {activeFeatureTab === 4 && (
                    /* 📈 Reporter Sandbox */
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-wider block">Success Report Builder</span>
                          <span className="text-[9px] text-emerald-600 font-bold font-mono uppercase bg-emerald-50 border border-emerald-100 px-1 rounded">Metrics Connected</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Format dynamic progress metrics directly based on active autopilot counts.</p>

                        <div className="space-y-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8.5px] font-bold text-slate-400 font-mono uppercase">
                              <span>Local Clients Count</span>
                              <span className="text-indigo-600 font-extrabold">{reporterClients} Clients</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="12"
                              value={reporterClients}
                              onChange={(e) => setReporterClients(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] font-bold text-slate-400 uppercase block font-mono">Report Tone / Style</label>
                            <select
                              value={reporterStyle}
                              onChange={(e) => setReporterStyle(e.target.value)}
                              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-semibold cursor-pointer"
                            >
                              <option value="Energetic & Pumped">Energetic & Pumped up</option>
                              <option value="Professional Summary">Professional Executive Summary</option>
                              <option value="Direct Logs Only">Raw Telemetry & Database logs</option>
                            </select>
                          </div>
                        </div>

                        {reporterOutputText && (
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[9px] text-emerald-400 whitespace-pre-wrap max-h-[140px] overflow-y-auto leading-relaxed">
                            {reporterOutputText}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleReporterRun}
                        disabled={isReporterRunning}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isReporterRunning ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                            <span>Aggregating Sales Indices...</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Generate Daily Mobile Report</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {activeFeatureTab === 5 && (
                    /* 👀 Watcher Sandbox */
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-wider block">Local Trend Radar</span>
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                        </div>
                        <p className="text-[11px] text-slate-500">Scan nearby businesses for marketing adjustments or pricing promotions autonomously.</p>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[8.5px] font-bold text-slate-400 uppercase block font-mono">Industry Segment</label>
                            <select
                              value={watcherIndustry}
                              onChange={(e) => setWatcherIndustry(e.target.value)}
                              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-semibold cursor-pointer"
                            >
                              <option value="Dental Clinics">Dental Clinics</option>
                              <option value="Crossfit Gyms">Crossfit Gyms</option>
                              <option value="Plumbing Pros">Plumbing Pros</option>
                              <option value="Wellness & Spa">Wellness & Spa</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[8.5px] font-bold text-slate-400 uppercase block font-mono">Scan Radius</label>
                            <select
                              value={watcherRadius}
                              onChange={(e) => setWatcherRadius(e.target.value)}
                              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-semibold cursor-pointer"
                            >
                              <option value="3 miles">3 miles radius</option>
                              <option value="5 miles">5 miles radius</option>
                              <option value="10 miles">10 miles radius</option>
                            </select>
                          </div>
                        </div>

                        {watcherResults.length > 0 && (
                          <div className="space-y-2 max-h-[140px] overflow-y-auto">
                            {watcherResults.map((res, i) => (
                              <div key={i} className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm space-y-1">
                                <div className="flex justify-between text-[9px] font-bold">
                                  <span className="text-slate-800">{res.competitor}</span>
                                  <span className="text-indigo-600 font-mono font-semibold">{res.distance}</span>
                                </div>
                                <p className="text-[8.5px] text-slate-500 leading-normal font-medium">Observed: {res.observedChange}</p>
                                <p className="text-[9px] text-emerald-600 font-bold leading-normal">{res.strategy}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleWatcherScan}
                        disabled={isWatcherScanning}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isWatcherScanning ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                            <span>Scanning Neighborhood Competitors...</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Initiate Spy Sweep</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                </div>

              </div>

              {/* Agent Superpowers Panel */}
              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3 text-[10.5px] text-slate-600">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Runs Continuous Autopilot</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Encrypted Credentials Only</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>WhatsApp Mobile Sync</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>Detailed Success Logs</span>
                </div>
              </div>

            </div>

          </div>

          {/* MarketingBlocks-style Comparison Segment (The ultimate conversion block) */}
          <div className="pt-12">
            <div className="bg-white border border-slate-200/80 rounded-[36px] p-8 md:p-12 text-slate-900 relative overflow-hidden shadow-2xl">
              <div className="absolute top-[-20%] left-[-10%] h-[300px] w-[300px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-10%] h-[300px] w-[300px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                
                <div className="lg:col-span-5 space-y-6">
                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full font-bold font-mono text-indigo-700 uppercase tracking-widest">
                    CAPABILITY COMPARISON
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                    Traditional Agency Work <br />
                    vs. <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">OmniAgentAI</span>
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                    Traditional agencies demand massive monthly retainers, constant human management, and suffer from slow execution speeds. OmniAgentAI is secure, runs 24/7 on autopilot, and costs less than a single business coffee daily.
                  </p>
                  
                  <div className="pt-2">
                    <button
                      onClick={onLaunchDemo}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6 py-3 text-xs font-bold transition-all shadow-lg shadow-indigo-600/15 flex items-center space-x-2 cursor-pointer"
                    >
                      <span>UPGRADE TO AUTOPILOT AGENTS NOW</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200/60 shadow-xl">
                  {/* Row Header */}
                  <div className="grid grid-cols-3 p-4 text-[10px] font-bold font-mono uppercase text-slate-500 tracking-wider">
                    <div>Capability</div>
                    <div className="text-center text-rose-600">Manual Agency / Staff</div>
                    <div className="text-center text-indigo-700">OmniAgentAI Workspace</div>
                  </div>
                  
                  {/* Feature Rows */}
                  {[
                    { title: "Monthly Payroll Cost", manual: "$3,000 - $7,500/mo", auto: "$47 - $97/mo (Flat)" },
                    { title: "Lead Generation Speed", manual: "2-3 days manually", auto: "Continuous 15s scan" },
                    { title: "Client Messaging Drafts", manual: "Slow human emails", auto: "Instant hyper-personalized" },
                    { title: "Active Hours Working", manual: "9 AM - 5 PM (Mon-Fri)", auto: "24/7 Continuous Autopilot" },
                    { title: "Setup Onboarding", manual: "Weeks of instruction", auto: "3 Minutes friendly wizard" }
                  ].map((row, idx) => (
                    <div key={idx} className="grid grid-cols-3 p-4 items-center text-xs">
                      <div className="font-semibold text-slate-800">{row.title}</div>
                      <div className="text-center text-rose-600 font-bold">{row.manual}</div>
                      <div className="text-center text-emerald-700 font-extrabold flex items-center justify-center gap-1">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{row.auto}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive SOUL.md Directive Customizer Preview */}
      <section id="soul-md" className="py-20 px-6 border-b border-slate-200/80 bg-transparent relative z-10">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-purple-600 font-mono tracking-widest uppercase block">TRAIN THEM IN PLAIN ENGLISH</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tweak Your Team's Personality
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto">
              Your digital employees are trained with simple training guidelines in plain English. Choose an industry below to see how easy it is.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 shadow-2xl rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-3">
              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block text-left">CHOOSE AN INDUSTRY TO TEST</span>
              {[
                { id: "dental", title: "Dental Clinic Growth", icon: Smile, iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
                { id: "gym", title: "Gym & Yoga Studio", icon: Dumbbell, iconBg: "bg-orange-50 text-orange-600 border border-orange-100" },
                { id: "plumbing", title: "Home Services Plumber", icon: Wrench, iconBg: "bg-blue-50 text-blue-600 border border-blue-100" },
                { id: "spa", title: "Luxury Aesthetic Spa", icon: Flower, iconBg: "bg-pink-50 text-pink-600 border border-pink-100" }
              ].map((t) => {
                const IconComponent = t.icon;
                const isActive = activeDirectiveNiche === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveDirectiveNiche(t.id as any)}
                    className={`w-full p-3.5 rounded-2xl text-left border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      isActive
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg ring-1 ring-purple-500/30 scale-[1.01]"
                        : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl transition-all ${t.iconBg} ${isActive ? "scale-105 shadow-sm bg-white/20 border-white/10 text-white" : ""}`}>
                        <IconComponent className="h-4.5 w-4.5" />
                      </div>
                      <span className={`font-bold text-sm ${isActive ? "text-white" : "text-slate-800"}`}>{t.title}</span>
                    </div>
                    <Check className={`h-4 w-4 ${isActive ? "text-white opacity-100 scale-100" : "text-purple-400 opacity-0 scale-75"} transition-all duration-200`} />
                  </button>
                );
              })}

              <div className="pt-4">
                <button
                  onClick={onLaunchDemo}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-3.5 text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow cursor-pointer"
                >
                  <span>Configure Guidelines in Demo</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="md:col-span-7 bg-slate-900 rounded-2xl border border-slate-950 p-6 relative shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4 text-[10px] text-slate-500 font-mono">
                <span>📝 Guidelines Template: {activeDirectiveNiche}.txt</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">READY TO DEPLOY</span>
              </div>
              <pre className="font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[280px]">
                {getDirectiveMarkdown()}
              </pre>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section id="roi-calculator" className="py-20 px-6 border-b border-slate-200/80 bg-transparent relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-purple-600 font-mono tracking-widest uppercase block">IMPACT CALCULATOR</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Estimate Your Autopilot Income
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto font-medium">
              Drag the sliders below to discover how much money your virtual assistants can earn you each month.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 shadow-2xl rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Input Sliders */}
            <div className="lg:col-span-6 space-y-8 flex flex-col justify-center">
              
              {/* Slider 1 */}
              <div className="space-y-3 text-left">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-800 font-bold">Client Retainer Fee Per Month</span>
                  <span className="text-purple-700 font-black px-2.5 py-0.5 bg-purple-50 border border-purple-200 rounded-full">${retainerAmount}/mo</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="3000"
                  step="50"
                  value={retainerAmount}
                  onChange={(e) => setRetainerAmount(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((retainerAmount - 200) / (3000 - 200)) * 100}%, #e2e8f0 ${((retainerAmount - 200) / (3000 - 200)) * 100}%, #e2e8f0 100%)`
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-all outline-none focus:ring-2 focus:ring-purple-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono font-semibold">
                  <span>$200</span>
                  <span>$1,500</span>
                  <span>$3,000</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div className="space-y-3 text-left">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-800 font-bold">Active Local Clients</span>
                  <span className="text-purple-700 font-black px-2.5 py-0.5 bg-purple-50 border border-purple-200 rounded-full">{clientCount} {clientCount === 1 ? "Client" : "Clients"}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="1"
                  value={clientCount}
                  onChange={(e) => setClientCount(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((clientCount - 1) / (25 - 1)) * 100}%, #e2e8f0 ${((clientCount - 1) / (25 - 1)) * 100}%, #e2e8f0 100%)`
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-all outline-none focus:ring-2 focus:ring-purple-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono font-semibold">
                  <span>1 client</span>
                  <span>12 clients</span>
                  <span>25 clients</span>
                </div>
              </div>

              {/* Slider 3 */}
              <div className="space-y-3 text-left">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-800 font-bold">Weekly Manual Hours Saved</span>
                  <span className="text-purple-700 font-black px-2.5 py-0.5 bg-purple-50 border border-purple-200 rounded-full">{hoursSavedPerWeek} Hours/Client</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={hoursSavedPerWeek}
                  onChange={(e) => setHoursSavedPerWeek(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((hoursSavedPerWeek - 2) / (30 - 2)) * 100}%, #e2e8f0 ${((hoursSavedPerWeek - 2) / (30 - 2)) * 100}%, #e2e8f0 100%)`
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-all outline-none focus:ring-2 focus:ring-purple-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono font-semibold">
                  <span>2 hours</span>
                  <span>16 hours</span>
                  <span>30 hours</span>
                </div>
              </div>

              {/* Dynamic Insight Box */}
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl text-xs text-slate-700 text-left">
                {retainerAmount * clientCount < 1500 ? (
                  <p className="font-medium">
                    💡 <span className="font-bold text-purple-700">Side-Hustle Mode:</span> An excellent way to secure passive recurring cash flow with minimal administration effort.
                  </p>
                ) : retainerAmount * clientCount < 6000 ? (
                  <p className="font-medium">
                    🚀 <span className="font-bold text-purple-300">Autonomous Sweetspot:</span> This completely replaces a full-time professional income while virtual agents run the entire cycle.
                  </p>
                ) : (
                  <p className="font-medium">
                    👑 <span className="font-bold text-purple-300">High-Growth Micro-Agency:</span> Fully scaled recurring revenue operations. Exceptional margin efficiency and leverage!
                  </p>
                )}
              </div>

            </div>

            {/* Visual Outputs */}
            <div className="lg:col-span-6 bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-950 grid grid-cols-1 sm:grid-cols-2 gap-4 flex flex-col justify-between shadow-xl">
              
              <div className="p-4 bg-slate-800/80 border border-slate-700/50 rounded-2xl text-center sm:text-left shadow-md">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase block tracking-wider">Projected Monthly Revenue</span>
                <span className="text-2xl sm:text-3xl font-black text-white block mt-1">
                  ${(retainerAmount * clientCount).toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center sm:justify-start gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  On 100% Autopilot
                </span>
              </div>
              
              <div className="p-4 bg-slate-800/80 border border-slate-700/50 rounded-2xl text-center sm:text-left shadow-md">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase block tracking-wider">Annual Estimated Income</span>
                <span className="text-2xl sm:text-3xl font-black text-purple-400 block mt-1">
                  ${(retainerAmount * clientCount * 12).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">Steady recurring flow</span>
              </div>

              <div className="p-4 bg-slate-800/80 border border-slate-700/50 rounded-2xl text-center sm:text-left shadow-md">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase block tracking-wider">Weekly Free Time Recovered</span>
                <span className="text-2xl sm:text-3xl font-black text-white block mt-1">
                  {hoursSavedPerWeek * clientCount} Hours
                </span>
                <span className="text-[10px] text-purple-400 font-semibold">No more boring chores</span>
              </div>

              <div className="p-4 bg-slate-800/80 border border-slate-700/50 rounded-2xl text-center sm:text-left flex flex-col justify-between shadow-md">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase block tracking-wider">Deploy Cost Recoup</span>
                <span className="text-base sm:text-lg font-black text-emerald-400 block mt-2">
                  {(() => {
                    const starterCost = 150;
                    const monthlyRev = retainerAmount * clientCount;
                    const dailyRev = monthlyRev / 30.4;
                    const days = dailyRev > 0 ? (starterCost / dailyRev) : 0;
                    
                    if (days <= 0.1) return "Instant (< 1 hr)";
                    if (days < 1) return `${Math.ceil(days * 24)} Hours`;
                    return `${days.toFixed(1)} Days`;
                  })()}
                </span>
                <span className="text-[9px] text-slate-500">Based on Starter rate</span>
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  onClick={onLaunchDemo}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-3.5 text-xs font-extrabold tracking-wider transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-600/35 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>START CAPTURING REVENUE NOW</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* The 3-Step Setup Process */}
      <section id="how-it-works" className="py-20 px-6 bg-transparent border-b border-slate-200/80 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-purple-600 font-mono tracking-widest uppercase block">SIMPLE 3-STEP SETUP</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Up and Running in Under 3 Minutes
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto font-medium">
              Our super simple onboarding setup has zero confusing steps. You do not need any coding or tech skills whatsoever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "Step 01", title: "Connect Your Mobile Chat", desc: "Choose your favorite messaging app (WhatsApp or Telegram) and enter a safe PIN. Select the local business type you wish to grow.", icon: MessageSquare },
              { step: "Step 02", title: "Pick a Friendly Template", desc: "Select one of our pre-written personality templates. Instruct your assistant on their tone of voice and daily work hours.", icon: FileText },
              { step: "Step 03", title: "Sit Back & See Results", desc: "Your helper is active! Approve drafts, check found leads, and receive simple success updates right on your phone.", icon: Bell }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200/80 shadow-md rounded-3xl p-6 relative flex flex-col justify-between text-left">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full uppercase">
                      {item.step}
                    </span>
                    <item.icon className="h-5 w-5 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Testimonials / Real-life Success Stories */}
      <section id="success-stories" className="py-20 px-6 bg-transparent border-b border-slate-200/80 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-purple-600 font-mono tracking-widest uppercase block">LOVED BY LOCAL BUSINESSES</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Real Stories. Genuine Smiles.
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto font-medium">
              See how everyday business owners got their hours back and got high-paying regular clients on total autopilot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Dr. Evelyn Vance",
                role: "Cosmetic Dentist, TX",
                quote: "I was spending thousands each month on agencies with zero results. OmniAgentAI found 14 high-quality patients in my first two weeks. My favorite part is the warm, daily text updates right on my personal phone!",
                rating: 5,
                color: "bg-emerald-50 text-emerald-600 border-emerald-100",
                emoji: "🦷",
                icon: Smile,
                image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=150&h=150"
              },
              {
                name: "Sarah Thorne",
                role: "Downtown Yoga Studio",
                quote: "As a busy gym owner, I don't have time for social media. My digital social assistant schedules tips and coordinates bookings on autopilot. It feels like having a full-time assistant for the cost of coffee!",
                rating: 5,
                color: "bg-orange-50 text-orange-600 border-orange-100",
                emoji: "🧘",
                icon: Dumbbell,
                image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=150&h=150"
              },
              {
                name: "Leo Ramirez",
                role: "Emergency Plumber, CA",
                quote: "Weekends used to be a nightmare with missed emergency calls. Now, my assistant auto-replies to inquiries via text, locks the time slot on my calendar, and politely collects Google reviews afterwards.",
                rating: 5,
                color: "bg-blue-50 text-blue-600 border-blue-100",
                emoji: "🔧",
                icon: Wrench,
                image: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=150&h=150"
              },
              {
                name: "Dr. Chloe Dubois",
                role: "Radiant Skin & MedSpa",
                quote: "I am absolutely in love with my wellness assistant! She greets every single inquiry with genuine warmth, books consultations directly into our scheduler, and keeps our calendar fully packed. It is the easiest system ever!",
                rating: 5,
                color: "bg-pink-50 text-pink-600 border-pink-100",
                emoji: "✨",
                icon: Flower,
                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"
              }
            ].map((story, idx) => {
              const IconComponent = story.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6, boxShadow: "0 10px 30px -15px rgba(147,51,234,0.15)" }}
                  className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 flex flex-col justify-between transition-all font-sans text-left shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-0.5">
                        {[...Array(story.rating)].map((_, i) => (
                          <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <div className={`p-1.5 rounded-xl flex items-center justify-center ${story.color} border`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic font-medium">
                      "{story.quote}"
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 flex items-center space-x-3">
                    <img 
                      src={story.image} 
                      alt={story.name} 
                      className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-950">{story.name}</h4>
                      <span className="text-[10px] text-slate-500 block font-semibold">{story.role}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Stats banner */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-3xl font-black text-indigo-600 block">4.9/5</span>
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block mt-1">Average Star Rating</span>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 block">12,400+</span>
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block mt-1">Appointments Booked</span>
            </div>
            <div>
              <span className="text-3xl font-black text-indigo-600 block">14 Hours</span>
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block mt-1">Saved Per Owner Weekly</span>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 block">$0.00</span>
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block mt-1">Boring Manual Labor Left</span>
            </div>
          </div>

        </div>
      </section>

      {/* Security & Reliability */}
      <section id="sandbox" className="py-20 px-6 bg-transparent text-slate-900 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full text-[10px] font-bold text-rose-600 font-mono uppercase tracking-wider">
              <Lock className="h-3.5 w-3.5 text-rose-500" />
              <span>100% Secure & Reliable Isolation</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Safe & Private Workspaces <br />
              For You and Your Clients
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Every client you set up has their own isolated, secure virtual workspace. That means there's no shared logins, no shared secrets, and zero crossover risk. Simple, clean, and completely reliable.
            </p>

            <div className="space-y-3 text-xs">
              {[
                { title: "Safe Password & Secret Vault", desc: "All your API connections (Anthropic, Meta, Stripe) are locked with banking-grade encryption inside your private workspace." },
                { title: "Anti-Spam Safeguards Built-In", desc: "Includes gentle sleep timers so your messages always feel natural, keeping your accounts fully healthy and compliant." },
                { title: "1-Click Workspace Play & Pause", desc: "Easily turn your assistants on or off whenever you need with a single friendly switch in your dashboard." }
              ].map((guard, idx) => (
                <div key={idx} className="p-4 bg-white border border-slate-200 shadow-sm rounded-xl space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs">{guard.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-normal font-medium">{guard.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-4 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <span className="text-xs font-bold font-mono text-slate-500">Assistant Security Status</span>
              <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-mono border ${
                securityStatus === "secured" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                securityStatus === "deploying" ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" :
                "bg-blue-50 text-blue-600 border-blue-100"
              }`}>
                {securityStatus === "secured" ? "Secured" : securityStatus === "deploying" ? "Deploying..." : "Ready & Active"}
              </span>
            </div>

            <div className="font-mono text-[11px] text-slate-400 space-y-2.5 bg-slate-900 p-4 rounded-2xl border border-slate-950 min-h-[180px] flex flex-col justify-between">
              <div className="space-y-1.5">
                {securityLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={`${
                      log.startsWith("[SYSTEM]") ? "text-indigo-400 font-bold" :
                      log.startsWith("🔑") || log.startsWith("🛡️") || log.startsWith("🔒") || log.startsWith("⏰") || log.startsWith("🚀") ? "text-emerald-300" :
                      log.startsWith("//") ? "text-slate-500" : "text-slate-300"
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>

              {securityStatus === "deploying" && (
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-300" 
                    style={{ width: `${(securityStep / 5) * 100}%` }}
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDeploySecurityWorkspace}
                disabled={isSecurityDeploying || securityStatus === "ready"}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Deploy Secure Workspace</span>
                <Cpu className="h-3.5 w-3.5 text-indigo-600" />
              </button>
              
              <button
                onClick={onLaunchDemo}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-indigo-600/10"
              >
                <span>Enter Agent Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* License Pricing (Bright and Premium) */}
      <section id="pricing" className="py-20 px-6 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-purple-600 font-mono tracking-widest uppercase block">SIMPLE AUTOPILOT PLANS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Fair Licensing to Match Your Scale
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto font-medium">
              From individual local clinics to complete white-labeled growth agencies. Upgrade dynamically as your customer base expands.
            </p>
 
            <div className="pt-4 inline-flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setPricingCycle("monthly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${pricingCycle === "monthly" ? "bg-purple-600 text-white shadow" : "text-slate-500 hover:text-slate-900"}`}
              >
                Monthly Plan
              </button>
              <button
                onClick={() => setPricingCycle("yearly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${pricingCycle === "yearly" ? "bg-purple-600 text-white shadow" : "text-slate-500 hover:text-slate-900"}`}
              >
                <span>Yearly Plan</span>
                <span className="bg-emerald-500 text-white text-[9px] px-1.5 rounded-md uppercase font-mono">Save 20%</span>
              </button>
            </div>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {pricingTiers.map((tier, idx) => {
              const activePrice = pricingCycle === "yearly" ? tier.priceYearly : tier.priceMonthly;
              return (
                <div 
                  key={idx}
                  className={`bg-white border rounded-3xl p-6 flex flex-col justify-between relative text-left shadow-xl ${
                    tier.popular 
                      ? "border-purple-500 bg-purple-50 shadow-xl shadow-purple-500/5 ring-1 ring-purple-500/30" 
                      : "border-slate-200"
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow font-mono">
                      MOST POPULAR
                    </span>
                  )}
 
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">{tier.name}</h3>
                      <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed font-medium">{tier.desc}</p>
                    </div>
 
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-black text-slate-900">${activePrice}</span>
                      <span className="text-[10px] font-semibold text-slate-500 font-mono">/ Month</span>
                    </div>
 
                    <div className="space-y-2.5 border-t border-slate-100 pt-5">
                      <span className="text-[10px] font-bold font-mono text-purple-600 uppercase tracking-widest block">Key Features Included</span>
                      <ul className="space-y-2 text-[11px] text-slate-700 font-medium">
                        {tier.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start">
                            <Check className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
 
                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <button
                      onClick={onLaunchDemo}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-sm cursor-pointer ${
                        tier.popular
                          ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      }`}
                    >
                      <span>{tier.cta}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
 
                </div>
              );
            })}
          </div>
 
        </div>
      </section>
 
      {/* Frequently Asked Questions Accordion Section */}
      <section id="faq" className="py-20 px-6 bg-transparent border-t border-b border-slate-200/80 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-purple-600 font-mono tracking-widest uppercase block">ANSWERS TO YOUR DOUBTS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Got Questions? We Have Simple Answers!
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto font-medium">
              No confusing jargon here. Just honest, clear, and friendly answers for busy business owners.
            </p>
          </div>
 
          <div className="space-y-4">
            {[
              {
                q: "Do I need to know how to code or be good with technology?",
                a: "Absolutely not! If you know how to send a text message on your phone, you have all the skills you need to run OmniAgentAI. Our 3-minute friendly setup wizard handles every single technical detail for you under the hood."
              },
              {
                q: "How exactly do the digital assistants find clients for my business?",
                a: "Your finder assistant gently scans your local neighborhood directory for businesses that are actively running ads on Facebook or Instagram but are missing easy booking links. The assistant then drafts a super friendly, personalized message highlighting how they can get double the appointments with a simple booking system."
              },
              {
                q: "Is this safe? Will it spam people or get my accounts flagged?",
                a: "We hate spam! Your digital employees are programmed with gentle daily sleep cycles and human-like delays. They never send rapid-fire bulk messages. They draft individual, warm, helpful notes that you can inspect, edit, or approve first before any message goes out."
              },
              {
                q: "Can I pause my assistants if my schedule gets too full?",
                a: "Yes, you are in total control! There is a massive, simple 'Play & Pause' switch right in your main dashboard console. You can turn your virtual employees off or on with a single friendly click whenever you need a breather."
              },
              {
                q: "How will I know when a new client or appointment is booked?",
                a: "We send beautiful, simple success notifications directly to your mobile phone! You'll see the potential client's polite response, their email, and the calendar time slot they selected, synced beautifully with your Google Calendar."
              }
            ].map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-purple-500/40 text-left shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-sans focus:outline-none cursor-pointer"
                  >
                    <span className="text-sm font-extrabold text-slate-900 leading-snug">
                      {item.q}
                    </span>
                    <span className={`p-1.5 rounded-lg bg-slate-100 text-purple-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
 
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="border-t border-slate-100 bg-slate-50/50"
                      >
                        <div className="px-6 py-5 text-xs text-slate-600 leading-relaxed font-medium">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
 
        </div>
      </section>
 
      {/* Guarantee Section */}
      <section className="py-16 px-6 bg-transparent border-t border-slate-200/80 text-center relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-12 w-12 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto text-purple-600 mb-2">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">30-Day Risk-Free Satisfaction Guarantee</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            If you aren't completely blown away by the help and response rates of your autopilot digital growth employees, simply request a hassle-free refund through your purchase portal. No hard feelings whatsoever!
          </p>
        </div>
      </section>
 
      {/* Footer */}
      <footer className="bg-purple-950 text-purple-300 text-xs px-6 py-12 border-t border-purple-900 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="font-bold text-white block">OmniAgentAI Workspace Console</span>
            <p className="text-[10px] text-purple-400">Autonomous growth helpers for dental cosmetic clinics and local business verticals.</p>
          </div>
 
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
            <a href="#features" className="hover:text-white transition text-purple-200 font-semibold">Agent Skills</a>
            <a href="#how-it-works" className="hover:text-white transition text-purple-200 font-semibold">Onboarding</a>
            <a href="#sandbox" className="hover:text-white transition text-purple-200 font-semibold">Private Security</a>
            <span className="text-purple-800">|</span>
            <span className="text-[10px] text-purple-400">© 2026 OpenClaw Workspace. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
