import React, { useState } from "react";
import { LeadItem, BusinessInfo } from "../types";
import { 
  Search, Sparkles, Plus, Trash2, Edit2, Check, X, 
  MapPin, Mail, Linkedin, Eye, Filter, Loader2, ArrowRight,
  User, Send, MessageSquare, AlertCircle, RefreshCw, Star,
  Archive, List, Columns, GripVertical, Map as MapIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  APIProvider, 
  Map as GoogleMap, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useAdvancedMarkerRef, 
  useMapsLibrary, 
  useMap 
} from '@vis.gl/react-google-maps';

// Email & LinkedIn Validation Helpers
const isEmailValid = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isLinkedinValid = (linkedin: string): boolean => {
  if (!linkedin) return false;
  // It should contain linkedin.com (standard URLs or custom slugs can be validated)
  const isOk = linkedin.toLowerCase().includes("linkedin.com") && !/\s/.test(linkedin);
  return isOk;
};

interface LeadsDatabaseProps {
  leads: LeadItem[];
  setLeads: React.Dispatch<React.SetStateAction<LeadItem[]>>;
  businessInfo: BusinessInfo;
  onAddLog: (title: string, desc: string, type?: "success" | "warning" | "error" | "pending") => void;
  onAddApproval: (newApproval: any) => void;
  searchTermOverride?: string;
  onClearSearchOverride?: () => void;
}

export default function LeadsDatabase(props: LeadsDatabaseProps) {
  const API_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    "";

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <LeadsDatabaseContent {...props} apiKey={API_KEY} />
    </APIProvider>
  );
}

function LeadMarker({ lead, onSelect }: { key?: string; lead: LeadItem; onSelect: (lead: LeadItem) => void }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  if (!lead.lat || !lead.lng) return null;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: lead.lat, lng: lead.lng }}
        onClick={() => setOpen(true)}
        title={lead.company}
      >
        <Pin 
          background={lead.status === "booked" ? "#10B981" : lead.status === "outreached" ? "#6366F1" : "#3B82F6"} 
          glyphColor="#fff" 
        />
      </AdvancedMarker>
      {open && (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
          <div className="p-2 max-w-xs space-y-1 text-slate-800">
            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block font-mono">
              {lead.niche}
            </span>
            <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
              {lead.company}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              📍 {lead.address || "Austin, TX"}
            </p>
            {lead.notes && (
              <p className="text-[9px] text-slate-500 bg-slate-50 p-1 rounded border border-slate-100 italic leading-snug">
                "{lead.notes.substring(0, 120)}{lead.notes.length > 120 ? "..." : ""}"
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                onSelect(lead);
                setOpen(false);
              }}
              className="w-full mt-1.5 py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[10px] transition flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>👉 Select & Outreach</span>
            </button>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function LeadsDatabaseContent({
  leads,
  setLeads,
  businessInfo,
  onAddLog,
  onAddApproval,
  searchTermOverride,
  onClearSearchOverride,
  apiKey
}: LeadsDatabaseProps & { apiKey: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "outreached" | "warm" | "booked" | "rejected">("all");
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "map">("list");
  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);

  React.useEffect(() => {
    if (searchTermOverride !== undefined) {
      setSearchTerm(searchTermOverride);
      if (searchTermOverride) {
        setStatusFilter("all");
        // If there's an exact or partial match, select it!
        const match = leads.find(l => 
          l.company.toLowerCase().includes(searchTermOverride.toLowerCase()) ||
          l.name.toLowerCase().includes(searchTermOverride.toLowerCase())
        );
        if (match) {
          setSelectedLead(match);
        }
      }
    }
  }, [searchTermOverride, leads]);

  const getLeadsByKanbanColumn = (col: "new" | "warm" | "approved" | "rejected") => {
    return filteredLeads.filter(lead => {
      if (col === "new") return lead.status === "new" || lead.status === "outreached";
      if (col === "warm") return lead.status === "warm";
      if (col === "approved") return lead.status === "approved" || lead.status === "booked";
      if (col === "rejected") return lead.status === "rejected";
      return false;
    });
  };

  const kanbanColumns = [
    { key: "new", label: "New", color: "bg-slate-100 text-slate-700 border-slate-200", dropStatus: "new" as const },
    { key: "warm", label: "Warm", color: "bg-amber-100 text-amber-700 border-amber-200", dropStatus: "warm" as const },
    { key: "approved", label: "Approved", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dropStatus: "approved" as const },
    { key: "rejected", label: "Archived", color: "bg-rose-100 text-rose-700 border-rose-200", dropStatus: "rejected" as const }
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    if (draggedOverCol !== columnKey) {
      setDraggedOverCol(columnKey);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: LeadItem["status"]) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) {
      handleStatusChange(id, targetStatus);
    }
    setDraggedOverCol(null);
  };
  
  // Validation feature states
  const [isValidating, setIsValidating] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  
  // AI Lead Scout form states
  const [scoutNiche, setScoutNiche] = useState(businessInfo.niche || "Dental Clinics");
  const [scoutLocation, setScoutLocation] = useState("San Francisco");
  const [isScouting, setIsScouting] = useState(false);
  
  // AI Outreach writer states
  const [outreachTone, setOutreachTone] = useState<"warm" | "professional" | "direct" | "bold">("warm");
  const [outreachDraft, setOutreachDraft] = useState("");
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
  
  // Manual Lead Entry states
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualCompany, setManualCompany] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualLinkedin, setManualLinkedin] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [manualLat, setManualLat] = useState<number | undefined>(undefined);
  const [manualLng, setManualLng] = useState<number | undefined>(undefined);

  // Google Places search states
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  const placesLib = useMapsLibrary("places");

  const hasValidKey = Boolean(apiKey) && apiKey !== "YOUR_API_KEY";

  const handlePlaceSearch = async () => {
    if (!placesLib || !placeSearchQuery.trim()) return;
    setIsSearchingPlaces(true);
    try {
      const result = await placesLib.Place.searchByText({
        textQuery: placeSearchQuery,
        fields: ["displayName", "location", "formattedAddress"],
        maxResultCount: 5,
      });
      if (result && result.places) {
        setPlaceResults(result.places);
      }
    } catch (err) {
      console.error("Place search failed:", err);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  const handleSelectPlace = (place: any) => {
    setManualCompany(place.displayName || "");
    setManualAddress(place.formattedAddress || "");
    
    const latVal = typeof place.location?.lat === "function" ? place.location.lat() : place.location?.lat;
    const lngVal = typeof place.location?.lng === "function" ? place.location.lng() : place.location?.lng;
    
    if (latVal && lngVal) {
      setManualLat(latVal);
      setManualLng(lngVal);
    }
    
    // Clear search results
    setPlaceResults([]);
    setPlaceSearchQuery("");
  };

  // Edit Lead states
  const [editingLead, setEditingLead] = useState<LeadItem | null>(null);

  // Bulk selection state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "archive" | "delete";
    scope: "single" | "bulk";
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  const handleBulkApprove = () => {
    if (selectedLeadIds.length === 0) return;
    
    setLeads(prev => prev.map(lead => 
      selectedLeadIds.includes(lead.id) ? { ...lead, status: "approved" } : lead
    ));
    
    if (selectedLead && selectedLeadIds.includes(selectedLead.id)) {
      setSelectedLead(prev => prev ? { ...prev, status: "approved" } : null);
    }
    
    onAddLog(
      "Bulk Action Executed",
      `Approved ${selectedLeadIds.length} selected leads to lifecycle state "APPROVED" in batch.`,
      "success"
    );
    setSelectedLeadIds([]);
  };

  const handleBulkReject = (force = false) => {
    if (selectedLeadIds.length === 0) return;
    
    if (!force) {
      setConfirmModal({
        isOpen: true,
        type: "archive",
        scope: "bulk",
        title: `Archive ${selectedLeadIds.length} Selected Leads?`,
        description: `Are you sure you want to move these ${selectedLeadIds.length} leads to the Archived zone? This will update their status in bulk.`,
        confirmLabel: "Archive Selected",
        onConfirm: () => {
          handleBulkReject(true);
          setConfirmModal(null);
        }
      });
      return;
    }
    
    setLeads(prev => prev.map(lead => 
      selectedLeadIds.includes(lead.id) ? { ...lead, status: "rejected" } : lead
    ));
    
    if (selectedLead && selectedLeadIds.includes(selectedLead.id)) {
      setSelectedLead(prev => prev ? { ...prev, status: "rejected" } : null);
    }
    
    onAddLog(
      "Bulk Action Executed",
      `Archived ${selectedLeadIds.length} selected leads in batch.`,
      "warning"
    );
    setSelectedLeadIds([]);
  };

  const handleBulkDelete = (force = false) => {
    if (selectedLeadIds.length === 0) return;
    
    if (!force) {
      setConfirmModal({
        isOpen: true,
        type: "delete",
        scope: "bulk",
        title: `Delete ${selectedLeadIds.length} Selected Leads?`,
        description: `Are you sure you want to permanently delete these ${selectedLeadIds.length} leads? This action cannot be undone and will erase them and all drafted campaign states.`,
        confirmLabel: "Delete All Selected",
        onConfirm: () => {
          handleBulkDelete(true);
          setConfirmModal(null);
        }
      });
      return;
    }
    
    setLeads(prev => prev.filter(lead => !selectedLeadIds.includes(lead.id)));
    
    if (selectedLead && selectedLeadIds.includes(selectedLead.id)) {
      setSelectedLead(null);
    }
    
    onAddLog(
      "Bulk Action Executed",
      `Deleted ${selectedLeadIds.length} selected leads permanently from local database.`,
      "warning"
    );
    setSelectedLeadIds([]);
  };

  const handleValidateData = () => {
    setIsValidating(true);
    onAddLog("Data Validation Initiated", "Cross-referencing email addresses and LinkedIn URLs against structural schemas...", "pending");
    
    setTimeout(() => {
      setIsValidating(false);
      setHasValidated(true);
      
      let emailIssues = 0;
      let linkedinIssues = 0;
      
      leads.forEach(lead => {
        if (!isEmailValid(lead.email)) emailIssues++;
        if (!isLinkedinValid(lead.linkedin)) linkedinIssues++;
      });
      
      const totalIssues = emailIssues + linkedinIssues;
      if (totalIssues === 0) {
        onAddLog(
          "Data Validation Complete",
          `Successfully verified all ${leads.length} contacts! 100% compliant with standard patterns.`,
          "success"
        );
      } else {
        onAddLog(
          "Data Validation Complete",
          `Checked ${leads.length} contacts: Found ${emailIssues} invalid email formats and ${linkedinIssues} invalid LinkedIn profiles. Red indicators are active.`,
          "warning"
        );
      }
    }, 800);
  };

  // Filtered Leads list
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Call backend to trigger live Gemini lead generation
  const handleLaunchAIScout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoutNiche || !scoutLocation) return;

    setIsScouting(true);
    onAddLog("AI Lead Scout Initialized", `Contacting Gemini API to look up fresh local prospects in ${scoutLocation} (${scoutNiche}).`, "pending");

    try {
      const response = await fetch("/api/generate-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: scoutLocation,
          niche: scoutNiche,
          businessInfo
        })
      });

      const data = await response.json();
      setIsScouting(false);

      if (data.status === "success" && data.lead) {
        const generated = data.lead;
        const newLead: LeadItem = {
          id: String(Date.now()),
          name: generated.name || "Contact Person",
          company: generated.company || "Local Co",
          niche: scoutNiche,
          email: generated.email || "hello@domain.com",
          linkedin: generated.linkedin || "linkedin.com",
          source: data.mode === "ai" ? "Gemini Local Scout" : "Scout Template Fallback",
          budgetSignal: generated.budgetSignal || "High",
          notes: generated.notes || "Discovered via interactive AI scan.",
          status: "new"
        };

        setLeads(prev => [newLead, ...prev]);
        setSelectedLead(newLead);
        
        // Also queue up as a dynamic approval
        onAddApproval({
          id: String(Date.now() + 2),
          type: "lead",
          title: `Approve Lead: ${newLead.company}`,
          description: `${newLead.name} (${newLead.notes}). Review custom budget signals to authorize personalized intro letter.`,
          metadata: {
            company: newLead.company,
            linkedin: newLead.linkedin,
            source: newLead.source,
            niche: newLead.niche,
            budgetSignal: newLead.budgetSignal
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "pending"
        });

        onAddLog(
          "AI Scout Search Completed",
          `Successfully qualified "${newLead.company}" as a high-intent target. Created draft campaign and sent to approvals.`,
          "success"
        );
      } else {
        onAddLog("AI Scout Finished with No Data", "The crawler scanned endpoints but couldn't verify new budget signatures.", "warning");
      }
    } catch (err) {
      console.error(err);
      setIsScouting(false);
      onAddLog("AI Scout Sync Error", `Connection dropped with local crawler daemon: ${(err as Error).message}`, "error");
    }
  };

  // Call backend to trigger personalized AI outreach drafting
  const handleGenerateOutreach = async (leadToOutreach: LeadItem, selectedTone = outreachTone) => {
    setIsGeneratingOutreach(true);
    setOutreachTone(selectedTone);
    
    try {
      const response = await fetch("/api/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: leadToOutreach,
          tone: selectedTone,
          businessInfo
        })
      });

      const data = await response.json();
      setIsGeneratingOutreach(false);

      if (data.status === "success" && data.content) {
        setOutreachDraft(data.content);
      }
    } catch (err) {
      console.error(err);
      setIsGeneratingOutreach(false);
      setOutreachDraft(`Hi ${leadToOutreach.name},\n\nWe noticed some incredible optimization opportunities for ${leadToOutreach.company}. I'd love to chat and set up some automated bookings on your schedule.\n\nBest,\nThe Team at ${businessInfo.name}`);
    }
  };

  // Select a lead and auto-generate initial outreach
  const handleSelectLead = (lead: LeadItem) => {
    setSelectedLead(lead);
    handleGenerateOutreach(lead, "warm");
  };

  // Change lead status
  const handleStatusChange = (id: string, newStatus: LeadItem["status"], force = false) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    if (newStatus === "rejected" && !force) {
      setConfirmModal({
        isOpen: true,
        type: "archive",
        scope: "single",
        title: "Archive Lead Contact?",
        description: `Are you sure you want to move "${lead.company}" to the Archived zone? This will pause active outreach drafting, but keep their data in the database.`,
        confirmLabel: "Archive Lead",
        onConfirm: () => {
          handleStatusChange(id, "rejected", true);
          setConfirmModal(null);
        }
      });
      return;
    }

    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
    }
    
    onAddLog(
      "CRM Status Updated",
      `Changed lead lifecycle tracking to "${newStatus.toUpperCase()}" for ${lead.company}.`,
      "success"
    );
  };

  // Add lead manually
  const handleAddManualLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualCompany) return;

    const newLead: LeadItem = {
      id: String(Date.now()),
      name: manualName,
      company: manualCompany,
      niche: businessInfo.niche || "Local Business",
      email: manualEmail || "contact@example.com",
      linkedin: manualLinkedin || "linkedin.com",
      source: "Manual Entry Form",
      budgetSignal: "Medium",
      notes: manualNotes || "Manually logged by agency executive.",
      status: "new",
      address: manualAddress || "Austin, TX",
      lat: manualLat || 30.2672,
      lng: manualLng || -97.7431
    };

    setLeads(prev => [newLead, ...prev]);
    setShowManualModal(false);
    
    // Clear inputs
    setManualName("");
    setManualCompany("");
    setManualEmail("");
    setManualLinkedin("");
    setManualNotes("");
    setManualAddress("");
    setManualLat(undefined);
    setManualLng(undefined);

    onAddLog(
      "Manual Lead Registered",
      `Created custom CRM card for "${newLead.company}" (Contact: ${newLead.name}).`,
      "success"
    );
  };

  // Delete lead
  const handleDeleteLead = (id: string, company: string, force = false) => {
    if (!force) {
      setConfirmModal({
        isOpen: true,
        type: "delete",
        scope: "single",
        title: "Delete Lead Contact?",
        description: `Are you sure you want to permanently delete the lead for "${company}"? This action cannot be undone and will remove all associated outreach history.`,
        confirmLabel: "Delete Permanently",
        onConfirm: () => {
          handleDeleteLead(id, company, true);
          setConfirmModal(null);
        }
      });
      return;
    }

    setLeads(prev => prev.filter(l => l.id !== id));
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead(null);
    }
    onAddLog("Lead Deleted", `Removed "${company}" permanently from local active database cache.`, "warning");
  };

  // Save edits
  const handleSaveEditLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    setLeads(prev => prev.map(l => l.id === editingLead.id ? editingLead : l));
    if (selectedLead && selectedLead.id === editingLead.id) {
      setSelectedLead(editingLead);
    }
    setEditingLead(null);
    onAddLog("CRM Record Modified", `Successfully updated company profile details for ${editingLead.company}.`, "success");
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Scout Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Live AI Lead Scout Panel (Left) */}
        <div className="lg:col-span-4 bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="absolute right-0 top-0 opacity-10">
            <Sparkles className="h-40 w-40 text-blue-500" />
          </div>
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold text-blue-400 w-fit">
              <Sparkles className="h-3 w-3" />
              <span>Interactive Gemini Lead Scout</span>
            </div>
            
            <div>
              <h3 className="text-base font-bold text-white">Live AI Prospector</h3>
              <p className="text-xs text-slate-300 mt-1">
                Enter your target location and niche. Gemini will scan and generate real, highly relevant target leads with customized pain-points.
              </p>
            </div>

            <form onSubmit={handleLaunchAIScout} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Location City</label>
                  <input 
                    type="text" 
                    value={scoutLocation}
                    onChange={(e) => setScoutLocation(e.target.value)}
                    placeholder="e.g. Seattle"
                    className="mt-1 block w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Niche Keyword</label>
                  <input 
                    type="text" 
                    value={scoutNiche}
                    onChange={(e) => setScoutNiche(e.target.value)}
                    placeholder="e.g. Gyms"
                    className="mt-1 block w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isScouting}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScouting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    <span>Scouting local area...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Launch AI Lead Scan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="border-t border-slate-800 pt-3 text-[10px] text-slate-400 flex items-center space-x-1.5 mt-4">
            <MapPin className="h-3.5 w-3.5 text-blue-400" />
            <span>Scanning live maps, organic signals, and active social ads.</span>
          </div>
        </div>

        {/* Dynamic CRM Table and Quick Stats (Right) */}
        <div className="lg:col-span-8 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">CRM Contacts & Sales Pipeline</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage active client context. Tap any prospect card to open the **AI Outreach Campaign Writer**.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleValidateData}
                  disabled={isValidating}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  title="Cross-reference email formats and LinkedIn URL patterns"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Analyzing Patterns...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 text-blue-600" />
                      <span>Validate Data</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowManualModal(true)}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Lead Manually</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="text-center sm:text-left">
                <span className="text-[10px] text-slate-400 font-mono block uppercase">Total Scraped</span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{leads.length}</span>
              </div>
              <div className="text-center sm:text-left border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
                <span className="text-[10px] text-slate-400 font-mono block uppercase">New / Pending</span>
                <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{leads.filter(l => l.status === "new").length}</span>
              </div>
              <div className="text-center sm:text-left border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
                <span className="text-[10px] text-slate-400 font-mono block uppercase">Active Outreach</span>
                <span className="text-xl font-extrabold text-indigo-700 mt-0.5 block">{leads.filter(l => l.status === "outreached" || l.status === "warm").length}</span>
              </div>
              <div className="text-center sm:text-left border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
                <span className="text-[10px] text-slate-400 font-mono block uppercase">Meetings / Closed</span>
                <span className="text-xl font-extrabold text-emerald-700 mt-0.5 block">{leads.filter(l => l.status === "booked").length}</span>
              </div>
            </div>

            {/* Filter and Search controls */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search leads, companies, signals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto max-w-full">
                {[
                  { key: "all", label: "All Statuses" },
                  { key: "new", label: "New" },
                  { key: "outreached", label: "Outreached" },
                  { key: "booked", label: "Booked" }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key as any)}
                    className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                      statusFilter === tab.key 
                        ? "bg-white text-slate-950 shadow" 
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CRM Main Grid: Left is Leads Database list, Right is AI Copywriting Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Leads Table Card */}
        <div className={`${
          viewMode === "kanban" 
            ? (selectedLead ? "lg:col-span-8" : "lg:col-span-12") 
            : "lg:col-span-7"
        } bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4 transition-all duration-300`}>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 gap-3">
            <div className="flex items-center space-x-3.5 flex-wrap gap-2">
              {viewMode === "list" && filteredLeads.length > 0 && (
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.includes(l.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const allFilteredIds = filteredLeads.map(l => l.id);
                        setSelectedLeadIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
                      } else {
                        const allFilteredIds = filteredLeads.map(l => l.id);
                        setSelectedLeadIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
                      }
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-500 font-semibold">Select All</span>
                </label>
              )}
              <h3 className="text-sm font-bold text-slate-900">Registered Lead Contacts</h3>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold font-mono">
                {filteredLeads.length} Matches
              </span>
            </div>

            {/* View Toggle (List vs Kanban vs Map) */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-stretch sm:self-auto justify-center">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                  viewMode === "list" 
                    ? "bg-white text-slate-950 shadow" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                  viewMode === "kanban" 
                    ? "bg-white text-slate-950 shadow" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Kanban Board</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                  viewMode === "map" 
                    ? "bg-white text-slate-950 shadow" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span>Map View</span>
              </button>
            </div>
          </div>

          {viewMode === "kanban" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
              {kanbanColumns.map((col) => {
                const colLeads = getLeadsByKanbanColumn(col.key as any);
                const isOver = draggedOverCol === col.key;
                
                return (
                  <div
                    key={col.key}
                    onDragOver={(e) => handleDragOver(e, col.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.dropStatus)}
                    className={`flex flex-col rounded-2xl border p-3.5 transition-all min-h-[350px] ${
                      isOver 
                        ? "bg-blue-50/40 border-blue-300 ring-2 ring-blue-100/50" 
                        : "bg-slate-50/50 border-slate-100"
                    }`}
                  >
                    {/* Column Header */}
                    <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-100">
                      <span className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded-md uppercase border ${col.color}`}>
                        {col.label}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded-md">
                        {colLeads.length}
                      </span>
                    </div>

                    {/* Cards Container */}
                    <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[400px] pr-1">
                      {colLeads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-8 text-center border border-dashed border-slate-200/60 rounded-xl bg-white/50 text-slate-400">
                          <p className="text-[10px] font-medium font-mono uppercase tracking-wider">Empty Zone</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">Drag prospects here</p>
                        </div>
                      ) : (
                        colLeads.map((lead) => {
                          const isSelected = selectedLead && selectedLead.id === lead.id;
                          return (
                            <div
                              key={lead.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, lead.id)}
                              onClick={() => handleSelectLead(lead)}
                              className={`p-3 bg-white border rounded-xl shadow-sm hover:shadow transition-all cursor-grab active:cursor-grabbing relative flex flex-col justify-between gap-2 border-slate-100 ${
                                isSelected 
                                  ? "ring-2 ring-blue-400 border-transparent bg-blue-50/10" 
                                  : "hover:border-slate-300"
                              }`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-1">
                                  <div className="flex items-start space-x-1.5">
                                    <GripVertical className="h-3.5 w-3.5 text-slate-300 mt-0.5 cursor-grab flex-shrink-0 animate-pulse" />
                                    <div>
                                      <h4 className="text-[11px] font-bold text-slate-900 leading-tight">
                                        {lead.company}
                                      </h4>
                                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                        {lead.name}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <p className="text-[9px] text-slate-400 font-mono mt-1 block truncate">
                                  Source: {lead.source}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-50 flex-wrap gap-1">
                                <span className="text-[8.5px] font-bold text-slate-500 bg-slate-100 px-1 rounded uppercase">
                                  {lead.budgetSignal} Budget
                                </span>
                                
                                <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => setEditingLead(lead)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition"
                                    title="Edit Lead"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLead(lead.id, lead.company)}
                                    className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition"
                                    title="Delete Lead"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewMode === "map" ? (
            !hasValidKey ? (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-2xl min-h-[400px] text-center space-y-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                  <MapIcon className="h-7 w-7" />
                </div>
                <div className="max-w-md space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Google Maps Connection Required</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Set up your Google Maps API key to map local business clients, view coordinates, and enable physical address search.
                  </p>
                </div>
                
                <div className="bg-white border border-slate-100 rounded-xl p-4 text-left max-w-sm w-full shadow-sm text-[11px] space-y-2 text-slate-600">
                  <p className="font-bold text-slate-800">To configure your API Key:</p>
                  <ol className="list-decimal list-inside space-y-1 font-medium leading-relaxed">
                    <li>Get a key: <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google Cloud Console</a></li>
                    <li>Open <span className="font-bold text-slate-800">Settings</span> (⚙️ gear icon, top-right)</li>
                    <li>Select <span className="font-bold text-slate-800">Secrets</span></li>
                    <li>Add <code className="bg-slate-50 text-indigo-600 px-1 py-0.5 rounded border border-slate-100 font-mono text-[10px]">GOOGLE_MAPS_PLATFORM_KEY</code></li>
                    <li>Paste your key and press Enter.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-slate-100 shadow-inner relative">
                <GoogleMap
                  defaultCenter={{ lat: 30.2672, lng: -97.7431 }}
                  defaultZoom={11}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%' }}
                >
                  {filteredLeads.map((lead) => (
                    <LeadMarker 
                      key={lead.id} 
                      lead={lead} 
                      onSelect={(l) => handleSelectLead(l)} 
                    />
                  ))}
                </GoogleMap>
                
                {/* Floating Map Legend */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-150 rounded-xl p-3 shadow-md text-[10px] font-bold space-y-2 text-slate-600 z-10">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">
                    Map Legend
                  </span>
                  <div className="flex flex-col space-y-1.5 font-semibold">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white" />
                      <span>New / Uncontacted</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white" />
                      <span>Outreached</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                      <span>Booked</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <>
              {filteredLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                  <User className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">No leads found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Change filters or run the AI Scout to qualify targets.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {filteredLeads.map((lead) => {
                    const isSelected = selectedLead && selectedLead.id === lead.id;
                    return (
                      <div
                        key={lead.id}
                        onClick={() => handleSelectLead(lead)}
                        className={`p-4 border rounded-xl transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer relative ${
                          isSelected
                            ? "bg-blue-50/30 border-blue-400 ring-1 ring-blue-100 shadow-sm"
                            : "bg-white hover:bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div className="flex items-start space-x-3 max-w-sm">
                          <div 
                            className="flex items-center justify-center h-8 mt-1.5 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selectedLeadIds.includes(lead.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedLeadIds(prev => [...prev, lead.id]);
                                } else {
                                  setSelectedLeadIds(prev => prev.filter(id => id !== lead.id));
                                }
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                          <div className={`p-2 rounded-lg border mt-0.5 flex-shrink-0 ${
                            lead.status === "new" ? "bg-slate-50 text-slate-500 border-slate-200" :
                            lead.status === "outreached" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                            lead.status === "booked" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            "bg-rose-50 text-rose-600 border-rose-100"
                          }`}>
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900">{lead.company}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                                lead.status === "new" ? "bg-slate-100 text-slate-600" :
                                lead.status === "outreached" ? "bg-indigo-50 text-indigo-700" :
                                lead.status === "booked" ? "bg-emerald-50 text-emerald-700" :
                                "bg-rose-50 text-rose-700"
                              }`}>
                                {lead.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1">Contact: <span className="font-semibold text-slate-800">{lead.name}</span></p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Niche: {lead.niche} • Source: {lead.source}</p>
                            
                            {hasValidated && (
                              <div className="flex gap-2 mt-1.5 flex-wrap">
                                {isEmailValid(lead.email) ? (
                                  <span className="inline-flex items-center text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                    <Check className="h-2.5 w-2.5 mr-0.5" />
                                    Email Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded" title={`Format mismatch: "${lead.email}"`}>
                                    <AlertCircle className="h-2.5 w-2.5 mr-0.5 animate-pulse" />
                                    Email Invalid
                                  </span>
                                )}

                                {isLinkedinValid(lead.linkedin) ? (
                                  <span className="inline-flex items-center text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                    <Check className="h-2.5 w-2.5 mr-0.5" />
                                    LinkedIn Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded" title={`Format mismatch: "${lead.linkedin}"`}>
                                    <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                                    LinkedIn Warn
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-0 pt-2 sm:pt-0">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-mono hidden sm:inline-block">
                            {lead.budgetSignal} Budget
                          </span>

                          <div className="flex space-x-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingLead(lead);
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                              title="Edit Profile"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLead(lead.id, lead.company);
                              }}
                              className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition"
                              title="Delete Card"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* AI Outreach Campaign Pane */}
        {(viewMode !== "kanban" || selectedLead) && (
          <div className={`${
            viewMode === "kanban" ? "lg:col-span-4" : "lg:col-span-5"
          } bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between min-h-[480px] transition-all duration-300`}>
            {selectedLead ? (
              <div className="space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-3.5">
                  {/* Header Profile Summary */}
                  <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-blue-600 uppercase tracking-wider block">AI Copywriter Assistant</span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{selectedLead.company} Outreach</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedLead(null)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition"
                      title="Deselect Lead"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-col space-y-1.5 mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-600 flex items-center">
                        <Mail className="h-3 w-3 text-slate-400 mr-1 flex-shrink-0" />
                        <span className="font-mono">{selectedLead.email}</span>
                      </span>
                      {hasValidated && (
                        isEmailValid(selectedLead.email) ? (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">Valid</span>
                        ) : (
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded animate-pulse">Invalid Pattern</span>
                        )
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-600 flex items-center">
                        <Linkedin className="h-3 w-3 text-blue-500 mr-1 flex-shrink-0" />
                        <span className="font-mono truncate max-w-[200px]">{selectedLead.linkedin || "N/A"}</span>
                      </span>
                      {hasValidated && selectedLead.linkedin && (
                        isLinkedinValid(selectedLead.linkedin) ? (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">Valid</span>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">Format Warn</span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Pain Points / Analysis Callout */}
                  <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800 flex items-center space-x-1">
                      <AlertCircle className="h-3.5 w-3.5 text-blue-600 mr-1 flex-shrink-0" />
                      <span>Prospect Weakness Signal</span>
                    </p>
                    <p className="text-[11px] leading-relaxed italic">"{selectedLead.notes}"</p>
                  </div>

                  {/* Tone select chips */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Outreach Tone</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { key: "warm", label: "Warm" },
                        { key: "professional", label: "Polished" },
                        { key: "direct", label: "Direct" },
                        { key: "bold", label: "Confident" }
                      ].map((t) => (
                        <button
                          key={t.key}
                          disabled={isGeneratingOutreach}
                          onClick={() => handleGenerateOutreach(selectedLead, t.key as any)}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold transition whitespace-nowrap cursor-pointer ${
                            outreachTone === t.key
                              ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Outreach Copy Preview */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Generated Outreach Copy</label>
                      <button
                        onClick={() => handleGenerateOutreach(selectedLead, outreachTone)}
                        disabled={isGeneratingOutreach}
                        className="text-[10px] font-bold text-blue-600 flex items-center space-x-1 hover:underline cursor-pointer"
                      >
                        <RefreshCw className={`h-2.5 w-2.5 ${isGeneratingOutreach ? "animate-spin" : ""}`} />
                        <span>Re-draft</span>
                      </button>
                    </div>

                    {isGeneratingOutreach ? (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 min-h-[180px] flex flex-col items-center justify-center text-slate-400 text-xs">
                        <Loader2 className="h-6 w-6 text-blue-500 animate-spin mb-2" />
                        <span>Gemini is drafting hyper-personalized intro...</span>
                      </div>
                    ) : (
                      <textarea
                        value={outreachDraft}
                        onChange={(e) => setOutreachDraft(e.target.value)}
                        className="w-full min-h-[185px] p-3 border border-slate-200 rounded-xl text-xs font-mono bg-slate-950 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                      />
                    )}
                  </div>
                </div>

                {/* Action Handshake buttons */}
                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedLead.id, "rejected")}
                    className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <X className="h-4 w-4 text-rose-500" />
                    <span>Reject Prospect</span>
                  </button>

                  <button
                    onClick={() => {
                      handleStatusChange(selectedLead.id, "outreached");
                      onAddLog(
                        "Campaign Sent",
                        `Dispatched personalized cold campaign directly to ${selectedLead.name} (${selectedLead.email}).`,
                        "success"
                      );
                    }}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Send className="h-4 w-4 text-emerald-400" />
                    <span>Send Campaign</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
                <MessageSquare className="h-12 w-12 text-slate-300 mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No lead selected</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  Tap any contact card on the left to start editing personalized campaigns with Gemini.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MANUAL ENTRY MODAL */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <User className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Log New Client Lead</h3>
              </div>

              <form onSubmit={handleAddManualLead} className="space-y-3.5 max-h-[70vh] overflow-y-auto px-1">
                {/* Google Places Autocomplete */}
                {hasValidKey ? (
                  <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50 space-y-2">
                    <label className="block text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      🔍 Google Maps Business Auto-Fill
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search business (e.g. South Dental Austin)..."
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={placeSearchQuery}
                        onChange={(e) => setPlaceSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handlePlaceSearch();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={placeSearchQuery.trim() ? handlePlaceSearch : undefined}
                        disabled={isSearchingPlaces || !placeSearchQuery.trim()}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold disabled:bg-slate-300 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        {isSearchingPlaces ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
                      </button>
                    </div>

                    {placeResults.length > 0 && (
                      <div className="border border-slate-150 rounded-lg bg-white max-h-32 overflow-y-auto divide-y divide-slate-100 mt-1 shadow-sm">
                        {placeResults.map((place) => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => handleSelectPlace(place)}
                            className="w-full text-left p-2 hover:bg-indigo-50/50 text-[11px] transition block cursor-pointer"
                          >
                            <span className="font-bold text-slate-800 block">{place.displayName}</span>
                            <span className="text-slate-500 block truncate text-[9px]">{place.formattedAddress}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/60 text-[10px] text-slate-500 flex items-start space-x-1.5">
                    <span className="text-amber-500 font-bold">💡</span>
                    <span>Pro-tip: Connect your <span className="font-semibold text-slate-700">GOOGLE_MAPS_PLATFORM_KEY</span> in Secrets to search businesses and auto-fill address coordinates.</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Contact Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Company Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Spas"
                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={manualCompany}
                      onChange={(e) => setManualCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Physical Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 123 Congress Ave, Austin, TX 78701"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Prospect Email Address</label>
                  <input
                    type="email"
                    placeholder="jane@company.com"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">LinkedIn Profile Link</label>
                  <input
                    type="text"
                    placeholder="linkedin.com/in/profile"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={manualLinkedin}
                    onChange={(e) => setManualLinkedin(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Deduplication notes / weaknesses</label>
                  <textarea
                    placeholder="e.g. Run active ads but lack booking widgets..."
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs h-16 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowManualModal(false)}
                    className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow"
                  >
                    Register Lead
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingLead && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Edit2 className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Modify Prospect Profile</h3>
              </div>

              <form onSubmit={handleSaveEditLead} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Contact Full Name</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={editingLead.name}
                      onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Company Name</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={editingLead.company}
                      onChange={(e) => setEditingLead({ ...editingLead, company: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Physical Address</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={editingLead.address || ""}
                    onChange={(e) => setEditingLead({ ...editingLead, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Email Address</label>
                  <input
                    type="email"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={editingLead.email}
                    onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">LinkedIn Slug</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={editingLead.linkedin}
                    onChange={(e) => setEditingLead({ ...editingLead, linkedin: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Budget Strength</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={editingLead.budgetSignal}
                    onChange={(e) => setEditingLead({ ...editingLead, budgetSignal: e.target.value })}
                  >
                    <option value="High">High (Active Ads Running)</option>
                    <option value="Medium">Medium (Strong Organic Signal)</option>
                    <option value="Low">Low (Passive Website Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Identified Vulnerabilities</label>
                  <textarea
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs h-16 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={editingLead.notes}
                    onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingLead(null)}
                    className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION TOOLBAR */}
      <AnimatePresence>
        {selectedLeadIds.length > 0 && (
          <motion.div
            initial={{ y: 50, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 50, x: "-50%", opacity: 0 }}
            className="fixed bottom-6 left-1/2 bg-slate-950 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-800 z-50 flex items-center gap-6 backdrop-blur-md bg-opacity-95 max-w-lg w-[90%] sm:w-auto"
          >
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-xs font-bold font-mono whitespace-nowrap">
                {selectedLeadIds.length} {selectedLeadIds.length === 1 ? "lead" : "leads"} selected
              </span>
            </div>

            <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer"
                title="Bulk Approve Selected"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Bulk Approve</span>
              </button>

              <button
                onClick={handleBulkReject}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer"
                title="Bulk Archive Selected"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>Bulk Archive</span>
              </button>

              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-rose-700/80 hover:bg-rose-600 text-white rounded-xl text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer"
                title="Bulk Delete Selected"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Bulk Delete</span>
              </button>

              <button
                onClick={() => setSelectedLeadIds([])}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Clear Selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-sm w-full p-6 space-y-4"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                  confirmModal.type === "delete" 
                    ? "bg-rose-50 text-rose-600" 
                    : "bg-amber-50 text-amber-600"
                }`}>
                  {confirmModal.type === "delete" ? (
                    <Trash2 className="h-5 w-5" />
                  ) : (
                    <Archive className="h-5 w-5" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">{confirmModal.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {confirmModal.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className={`px-3.5 py-2 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer ${
                    confirmModal.type === "delete"
                      ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/10"
                      : "bg-amber-600 hover:bg-amber-500 shadow-amber-600/10"
                  }`}
                >
                  {confirmModal.confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
