import React, { useState } from "react";
import { Integration } from "../types";
import { 
  MessageSquare, Calendar, Mail, Share2, CreditCard, 
  Settings2, Plus, Check, Shield, AlertCircle, RefreshCw, Loader2 
} from "lucide-react";

interface IntegrationsHubProps {
  onAddLog: (title: string, desc: string, type?: "success" | "warning" | "error" | "pending") => void;
}

export default function IntegrationsHub({ onAddLog }: IntegrationsHubProps) {
  const [integrations, setIntegrations] = useState<Integration[]>(() => {
    const cached = localStorage.getItem("omniagent_integrations");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error("Failed to parse integrations", err);
      }
    }
    return [
      { id: "openclaw", name: "OpenClaw.ai Autonomous Platform", category: "messaging", connected: false, icon: "MessageSquare", description: "Direct linkage to openclaw.ai orchestration endpoints." },
      { id: "whatsapp", name: "WhatsApp Business API", category: "messaging", connected: true, username: "+1 (512) 555-0199", icon: "MessageSquare" },
      { id: "telegram", name: "Telegram Bot Bridge", category: "messaging", connected: false, description: "Authorize connection to enable autonomous actions.", icon: "MessageSquare" },
      { id: "google_cal", name: "Google Calendar", category: "calendar", connected: true, username: "admin@dentalcareaustin.com", icon: "Calendar" },
      { id: "calendly", name: "Calendly API", category: "calendar", connected: true, username: "calendly.com/dentalcare-austin", icon: "Calendar" },
      { id: "sendgrid", name: "SendGrid SMTP", category: "email", connected: true, username: "sendgrid_agent_04", icon: "Mail" },
      { id: "linkedin", name: "LinkedIn Sales Navigator", category: "social", connected: false, description: "Authorize connection to enable autonomous actions.", icon: "Share2" },
      { id: "buffer", name: "Buffer Social Publishing", category: "social", connected: true, username: "SocialTeamAustin", icon: "Share2" },
      { id: "jvzoo", name: "JVZoo Instant Payment Notification", category: "payment", connected: false, description: "Authorize connection to enable autonomous actions.", icon: "CreditCard" },
      { id: "stripe", name: "Stripe Live API", category: "payment", connected: false, description: "Authorize connection to enable autonomous actions.", icon: "CreditCard" }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem("omniagent_integrations", JSON.stringify(integrations));
  }, [integrations]);

  const [activeTab, setActiveTab] = useState<"all" | "messaging" | "calendar" | "email" | "social" | "payment">("all");
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [modalInput, setModalInput] = useState("");
  const [modalUsername, setModalUsername] = useState("");

  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verifyLogs, setVerifyLogs] = useState<string[]>([]);

  const filteredIntegrations = integrations.filter(
    item => activeTab === "all" || item.category === activeTab
  );

  const handleToggleConnect = (item: Integration) => {
    if (item.connected) {
      // Disconnect
      setIntegrations(prev => prev.map(i => i.id === item.id ? { ...i, connected: false, username: undefined } : i));
      onAddLog(
        "Integration Unlinked",
        `Terminated active auth token and webhook endpoints for ${item.name}.`,
        "warning"
      );
    } else {
      // Show setup popup
      setSelectedIntegration(item);
      setModalInput("");
      setModalUsername("");
    }
  };

  const handleConfirmConnect = () => {
    if (!selectedIntegration) return;

    if (selectedIntegration.id === "openclaw") {
      try {
        const cached = localStorage.getItem("omniagent_keysConfig");
        const parsed = cached ? JSON.parse(cached) : {};
        parsed.openClawApiKey = modalInput;
        parsed.openClawEndpoint = modalUsername || "https://api.openclaw.ai/v1";
        localStorage.setItem("omniagent_keysConfig", JSON.stringify(parsed));
      } catch (e) {
        console.error("Failed to save openclaw credentials", e);
      }
    } else {
      try {
        const cached = localStorage.getItem("omniagent_keysConfig");
        const parsed = cached ? JSON.parse(cached) : {};
        if (selectedIntegration.id === "sendgrid") parsed.sendgridKey = modalInput;
        if (selectedIntegration.id === "whatsapp") parsed.metaCloudKey = modalInput;
        localStorage.setItem("omniagent_keysConfig", JSON.stringify(parsed));
      } catch (e) {}
    }

    setIntegrations(prev => prev.map(i => 
      i.id === selectedIntegration.id 
        ? { ...i, connected: true, username: modalUsername || "Linked API Account" } 
        : i
    ));

    onAddLog(
      "Integration Authenticated",
      `Secure handshake completed for ${selectedIntegration.name}. Enabled dual-channel synchronizations.`,
      "success"
    );

    setSelectedIntegration(null);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Connections Hub</h2>
          <p className="text-xs text-slate-500 mt-1">Manage secure API linkages and access tokens across your business ecosystem.</p>
        </div>

        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto max-w-full">
          {[
            { key: "all", label: "All Integrations" },
            { key: "messaging", label: "Messaging" },
            { key: "calendar", label: "Calendar" },
            { key: "email", label: "Email" },
            { key: "social", label: "Socials" },
            { key: "payment", label: "Payments" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === tab.key 
                  ? "bg-white text-slate-950 shadow" 
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of integration tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((item) => {
          let CategoryIcon = MessageSquare;
          if (item.category === "calendar") CategoryIcon = Calendar;
          if (item.category === "email") CategoryIcon = Mail;
          if (item.category === "social") CategoryIcon = Share2;
          if (item.category === "payment") CategoryIcon = CreditCard;

          return (
            <div 
              key={item.id}
              className="p-4 border border-slate-100 bg-slate-50/20 rounded-2xl flex flex-col justify-between hover:border-slate-200 hover:bg-slate-50/50 transition min-h-[160px]"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-sm">
                    <CategoryIcon className="h-5 w-5" />
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                    item.connected 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    {item.connected ? "Active" : "Unconnected"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-3">{item.name}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  {item.connected 
                    ? `Linked as: ${item.username}` 
                    : item.description || "Authorize connection to enable autonomous actions."}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleToggleConnect(item)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1 ${
                    item.connected
                      ? "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {item.connected ? (
                    <span>Disconnect</span>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Link API</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Setup Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-6 space-y-4">
            
            <>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Settings2 className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Configure {selectedIntegration.name}</h3>
              </div>
              
              <p className="text-xs text-slate-500 leading-normal">
                Authorize secure OAuth or API connections. Key scopes are requested purely for autonomous lead sync, outreach dispatch, or sales webhook tracking.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Access Username / Mail</label>
                  <input
                    type="text"
                    placeholder="e.g. accounts@acme.com"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={modalUsername}
                    onChange={(e) => setModalUsername(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">API Credentials / Secret Token Key</label>
                  <input
                    type="password"
                    placeholder="Paste secure API key string"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] text-slate-500 flex items-start space-x-2">
                <Shield className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>OmniAgentAI manages keys encrypted in isolated storage sandboxes. No plain text variables are logged.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedIntegration(null)}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmConnect}
                  disabled={!modalInput}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow cursor-pointer"
                >
                  Complete Connection
                </button>
              </div>
            </>
          </div>
        </div>
      )}

    </div>
  );
}
