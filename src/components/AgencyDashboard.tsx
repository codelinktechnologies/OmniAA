import React, { useState } from "react";
import { ClientInstance } from "../types";
import { Plus, Users, UserCheck, ShieldAlert, SwitchCamera, Play, Pause, Trash2, ArrowRight } from "lucide-react";

interface AgencyDashboardProps {
  onAddLog: (title: string, desc: string, type?: "success" | "warning" | "error" | "pending") => void;
  onChangeClient: (clientName: string) => void;
}

export default function AgencyDashboard({ onAddLog, onChangeClient }: AgencyDashboardProps) {
  const [clients, setClients] = useState<ClientInstance[]>([
    { id: "1", name: "DentalCare Austin", businessName: "DentalCare Austin Group", niche: "Dental & Cosmetic", status: "Active", leadsCount: 34, revenueThisWeek: 1104.00 },
    { id: "2", name: "RooferMate Houston", businessName: "RooferMate Houston LLC", niche: "Roofing & Construction", status: "Active", leadsCount: 52, revenueThisWeek: 850.00 },
    { id: "3", name: "MedSpa Dallas", businessName: "MedSpa Premium Dallas", niche: "Spa & Medical Aesthetics", status: "Paused", leadsCount: 18, revenueThisWeek: 300.00 }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newBusinessName, setNewBusinessName] = useState("");
  const [newNiche, setNewNiche] = useState("");

  const handleToggleStatus = (id: string, name: string, current: "Active" | "Paused") => {
    const nextStatus = current === "Active" ? "Paused" : "Active";
    setClients(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
    onAddLog(
      `Client Sandbox ${nextStatus}`,
      `OpenClaw Docker instance for client: ${name} was ${nextStatus.toLowerCase()} successfully.`,
      nextStatus === "Active" ? "success" : "warning"
    );
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newBusinessName) return;

    const newClient: ClientInstance = {
      id: String(clients.length + 1),
      name: newClientName,
      businessName: newBusinessName,
      niche: newNiche || "General local leads",
      status: "Active",
      leadsCount: 0,
      revenueThisWeek: 0
    };

    setClients([...clients, newClient]);
    setShowAddForm(false);
    onAddLog(
      "Dedicated Client Instance Deployed",
      `Booted isolated OpenClaw client sandbox container for ${newClientName}. Initial handshake completed.`,
      "success"
    );

    setNewClientName("");
    setNewBusinessName("");
    setNewNiche("");
  };

  const handleSwitchActiveContext = (name: string) => {
    onChangeClient(name);
    onAddLog(
      "Dashboard Context Shifted",
      `Loaded active configuration tables and messaging streams for client instance: ${name}`,
      "success"
    );
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Agency Portal (OTO2 Upgrade)</h2>
          <p className="text-xs text-slate-500 mt-1">Multi-Client command hub. Manage separate, isolated agent instances for your local service retainers.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow"
        >
          <Plus className="h-4 w-4" />
          <span>Deploy Client Sandbox</span>
        </button>
      </div>

      {/* Form: Add client */}
      {showAddForm && (
        <form onSubmit={handleCreateClient} className="p-5 border border-blue-100 bg-blue-50/10 rounded-2xl space-y-4 text-xs animate-fade-in">
          <div className="flex items-center space-x-2 text-blue-800 font-bold">
            <Users className="h-4 w-4" />
            <span>Deploy Client Virtual Container</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-600">Client Reference Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. MedSpa Austin"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600">Registered Business Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Austin Aesthetics LLC"
                value={newBusinessName}
                onChange={(e) => setNewBusinessName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600">Target Niche Vertical</label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Skin Care, Botox"
                value={newNiche}
                onChange={(e) => setNewNiche(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 bg-white rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow"
            >
              Allocate Resources & Deploy
            </button>
          </div>
        </form>
      )}

      {/* Grid of clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => {
          const isActive = client.status === "Active";

          return (
            <div 
              key={client.id}
              className="p-5 border border-slate-100 bg-slate-50/20 rounded-2xl flex flex-col justify-between hover:border-slate-200 hover:bg-slate-50/50 transition min-h-[180px]"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                    isActive 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                      : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}>
                    {client.status}
                  </span>
                  
                  <button
                    onClick={() => handleToggleStatus(client.id, client.name, client.status)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition"
                    title={isActive ? "Pause Container" : "Resume Container"}
                  >
                    {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                </div>

                <h3 className="text-sm font-extrabold text-slate-950 mt-3">{client.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{client.businessName}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-b border-slate-100/80 py-2 my-3">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Niche</span>
                    <span className="font-semibold text-slate-700">{client.niche}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Weekly Revenue</span>
                    <span className="font-semibold text-emerald-700">${client.revenueThisWeek.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs mt-2">
                <span className="text-slate-500 font-semibold">{client.leadsCount} qualified leads</span>
                
                <button
                  onClick={() => handleSwitchActiveContext(client.name)}
                  className="text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1 hover:underline"
                >
                  <span>Manage Context</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
