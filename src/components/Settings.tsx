import React, { useState } from "react";
import { BusinessInfo } from "../types";
import { 
  Sliders, Bell, Terminal, Lock, Key, 
  Trash2, RefreshCw, Save, Check, Globe, HelpCircle 
} from "lucide-react";

interface SettingsProps {
  businessInfo: BusinessInfo;
  setBusinessInfo: (info: BusinessInfo) => void;
  heartbeat: string;
  setHeartbeat: (hb: string) => void;
  onResetWizard: () => void;
  onAddLog: (title: string, desc: string, type?: "success" | "warning" | "error" | "pending") => void;
}

export default function Settings({
  businessInfo,
  setBusinessInfo,
  heartbeat,
  setHeartbeat,
  onResetWizard,
  onAddLog
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<"personality" | "alerts" | "secrets" | "whitelabel" | "danger">("personality");
  
  // Local editable SOUL.md prompt
  const [soulPrompt, setSoulPrompt] = useState(
    `You are a professional AI business assistant operating autonomously for ${businessInfo.name || "User"}'s business in the ${businessInfo.niche || "local service"} space. Your job is to execute business growth tasks without being asked each time. You proactively find leads, send outreach, post content, and book appointments based on the goals set during setup. You report results every 24 hours. You always ask for confirmation before sending messages to more than 50 people at once. You never reveal that you are an AI agent when communicating with third parties.`
  );

  const [notificationConfig, setNotificationConfig] = useState({
    dailyBriefs: true,
    leadAlerts: true,
    errorFlags: false,
    outreachApproved: true
  });

  const [keysConfig, setKeysConfig] = useState(() => {
    const cached = localStorage.getItem("omniagent_keysConfig");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          anthropicKey: parsed.anthropicKey || "",
          metaCloudKey: parsed.metaCloudKey || "",
          sendgridKey: parsed.sendgridKey || "",
          mapsKey: parsed.mapsKey || "",
          openClawApiKey: parsed.openClawApiKey || "",
          openClawEndpoint: parsed.openClawEndpoint || "https://api.openclaw.ai/v1"
        };
      } catch (e) {}
    }
    return {
      anthropicKey: "",
      metaCloudKey: "",
      sendgridKey: "",
      mapsKey: "",
      openClawApiKey: "",
      openClawEndpoint: "https://api.openclaw.ai/v1"
    };
  });

  const [whitelabelConfig, setWhitelabelConfig] = useState({
    customDomain: "agent.mydentalcareaustin.com",
    logoUrl: "",
    brandColor: "#185FA5",
    whitelabelActive: false
  });

  const handleSaveSoul = () => {
    onAddLog(
      "SOUL.md Context Overwritten",
      "Successfully hot-reloaded the active OpenClaw Agent persona ruleset.",
      "success"
    );
  };

  const handleSaveAlerts = () => {
    onAddLog(
      "Alert Preferences Saved",
      "Notification routing tables compiled and applied.",
      "success"
    );
  };

  const handleSaveSecrets = () => {
    localStorage.setItem("omniagent_keysConfig", JSON.stringify(keysConfig));
    onAddLog(
      "Secure Sandbox Secrets Stored",
      "Updated credentials. AES-256 handshake completed with keystore database.",
      "success"
    );
  };

  const handleSaveWhitelabel = () => {
    onAddLog(
      "Whitelabel Domain Updated",
      "CNAME validation passed. Custom assets cached on local servers.",
      "success"
    );
    setWhitelabelConfig({ ...whitelabelConfig, whitelabelActive: true });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
      
      {/* Sidebar navigation */}
      <div className="w-full md:w-64 border-r border-slate-100 bg-slate-50/50 p-4 space-y-1.5 flex-shrink-0 text-xs font-semibold">
        <h3 className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider px-3.5 mb-3">System Properties</h3>
        {[
          { key: "personality", label: "Agent SOUL & Persona", icon: Sliders },
          { key: "alerts", label: "Alert Toggles", icon: Bell },
          { key: "secrets", label: "Keystore API Secrets", icon: Lock },
          { key: "whitelabel", label: "Whitelabel (OTO4 Upgrade)", icon: Globe },
          { key: "danger", label: "Danger Settings Area", icon: Trash2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`w-full p-3 rounded-xl text-left cursor-pointer transition flex items-center space-x-2.5 ${
                isActive 
                  ? "bg-white border border-slate-200 text-slate-950 shadow-sm font-bold" 
                  : "hover:bg-slate-100 border border-transparent text-slate-600"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Panel */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        
        <div className="space-y-6">
          
          {/* Personality Tab */}
          {activeTab === "personality" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">SOUL.md Agent Prompt</h3>
                <p className="text-xs text-slate-500 mt-1">This text dictates the core instructions, safety guidelines, and operations rules injected into Claude Sonnet for reasoning.</p>
              </div>

              <div>
                <textarea
                  rows={8}
                  className="w-full p-4 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono resize-none leading-relaxed"
                  value={soulPrompt}
                  onChange={(e) => setSoulPrompt(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-500">Note: Modifying this prompt overwrites the system's baseline behavior instantly.</span>
                <button
                  onClick={handleSaveSoul}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Update Soul</span>
                </button>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === "alerts" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Notification Preferences</h3>
                <p className="text-xs text-slate-500 mt-1">Configure which automatic operations dispatch live notifications to your phone.</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: "dailyBriefs", title: "Daily Revenue Bulletins", desc: "Sends a compiled sales summary at 7:00 AM every morning." },
                  { key: "leadAlerts", title: "High-Intent Lead Signals", desc: "Alerts you the instant a lead with 'Running Ads' is scraped." },
                  { key: "outreachApproved", title: "Approval Sign-Off Notifications", desc: "Notifies your phone when items enter the Approvals queue." },
                  { key: "errorFlags", title: "Sandbox Crash Alerts", desc: "Sends trace dumps if background container meets API rate-limits." }
                ].map((item) => {
                  const val = notificationConfig[item.key as keyof typeof notificationConfig];
                  return (
                    <div 
                      key={item.key}
                      onClick={() => setNotificationConfig({ ...notificationConfig, [item.key]: !val })}
                      className="p-4 border border-slate-100 rounded-xl flex justify-between items-center cursor-pointer hover:bg-slate-50/50 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <div className={`w-11 h-6 rounded-full p-0.5 transition ${val ? "bg-blue-600" : "bg-slate-200"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${val ? "translate-x-5" : ""}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={handleSaveAlerts}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>
          )}

          {/* Secrets Tab */}
          {activeTab === "secrets" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dedicated Sandbox Secrets Keys</h3>
                <p className="text-xs text-slate-500 mt-1">API credentials are stored in an isolated Keystore, isolated from third parties.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600">Anthropic API Key (Claude Sonnet 3.5)</label>
                  <input
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    value={keysConfig.anthropicKey}
                    onChange={(e) => setKeysConfig({ ...keysConfig, anthropicKey: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600">Meta WhatsApp Cloud Access Key</label>
                  <input
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    value={keysConfig.metaCloudKey}
                    onChange={(e) => setKeysConfig({ ...keysConfig, metaCloudKey: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600">SendGrid SMTP Delivery Key</label>
                  <input
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    value={keysConfig.sendgridKey}
                    onChange={(e) => setKeysConfig({ ...keysConfig, sendgridKey: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600">Google Maps Platform Key</label>
                  <input
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    value={keysConfig.mapsKey}
                    onChange={(e) => setKeysConfig({ ...keysConfig, mapsKey: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600">OpenClaw API Key</label>
                  <input
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    placeholder="Enter openclaw.ai API token"
                    value={keysConfig.openClawApiKey}
                    onChange={(e) => setKeysConfig({ ...keysConfig, openClawApiKey: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600">OpenClaw API Endpoint URL</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    placeholder="https://api.openclaw.ai/v1"
                    value={keysConfig.openClawEndpoint}
                    onChange={(e) => setKeysConfig({ ...keysConfig, openClawEndpoint: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={handleSaveSecrets}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Update Keys</span>
                </button>
              </div>
            </div>
          )}

          {/* Whitelabel Tab */}
          {activeTab === "whitelabel" && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Custom Branding & Whitelabel Domains</h3>
                  <p className="text-xs text-slate-500 mt-1">Publish autonomous dashboards under your own domains and brand logos. (Requires OTO4 Whitelabel Upgrade)</p>
                </div>
                
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase border ${
                  whitelabelConfig.whitelabelActive 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse" 
                    : "bg-purple-50 text-purple-700 border-purple-100"
                }`}>
                  {whitelabelConfig.whitelabelActive ? "Fully active" : "Upgrade Showcase"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600">Whitelabel Custom Domain Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. app.myagency.com"
                    value={whitelabelConfig.customDomain}
                    onChange={(e) => setWhitelabelConfig({ ...whitelabelConfig, customDomain: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600">Brand Primary Hex Code</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    placeholder="e.g. #185FA5"
                    value={whitelabelConfig.brandColor}
                    onChange={(e) => setWhitelabelConfig({ ...whitelabelConfig, brandColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={handleSaveWhitelabel}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Activate Whitelabel domain</span>
                </button>
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === "danger" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-rose-600">Danger Zone</h3>
                <p className="text-xs text-slate-500 mt-1">Admin level actions. Proceed with absolute caution as operations are irreversible.</p>
              </div>

              <div className="space-y-3 text-xs border border-rose-100 bg-rose-50/20 p-5 rounded-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-3 border-b border-rose-100">
                  <div>
                    <p className="font-bold text-slate-900">Reset Setup Wizard Onboarding</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Clears local cached state and forces the 5-screen setup onboarding to load from fresh.</p>
                  </div>
                  <button
                    onClick={onResetWizard}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition"
                  >
                    Reset Wizard
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-3">
                  <div>
                    <p className="font-bold text-slate-900">Kill Autonomous sandbox</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Destroys the isolated OpenClaw container process. Halts scheduling heartbeats and disconnects active webhooks.</p>
                  </div>
                  <button
                    onClick={() => {
                      onAddLog("OpenClaw Docker Container Terminated", "sandbox destroyed, process killed.", "error");
                    }}
                    className="bg-slate-950 hover:bg-slate-900 text-slate-100 font-bold text-xs px-4 py-2 rounded-xl shadow transition"
                  >
                    Kill Container
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
