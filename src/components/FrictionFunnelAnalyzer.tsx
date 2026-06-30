import React, { useState } from "react";
import { 
  TrendingDown, TrendingUp, DollarSign, Users, Clock, Flame, 
  ArrowRight, ShieldCheck, RefreshCw, BarChart2, Activity, Percent,
  Zap, AlertTriangle, Heart, ShieldAlert, ArrowDown, ChevronRight
} from "lucide-react";
import CardGlow from "./CardGlow";

const RESPONSE_SPEED_PRESETS = [
  { 
    id: "instant", 
    label: "Instant (< 1 Min)", 
    closeRate: 0.95, 
    text: "Almost zero lead dropoff. Customers are locked in while high-intent is peak.",
    badge: "95% Booked",
    color: "emerald",
    icon: Zap
  },
  { 
    id: "quarter", 
    label: "Under 15 Mins", 
    closeRate: 0.70, 
    text: "Decent, but 30% of prospects have already searched and found a competitor.",
    badge: "70% Booked",
    color: "teal",
    icon: Clock
  },
  { 
    id: "hour", 
    label: "Under 1 Hour", 
    closeRate: 0.45, 
    text: "Major dropoff. Customer intent starts to fade and distraction kicks in.",
    badge: "45% Booked",
    color: "amber",
    icon: AlertTriangle
  },
  { 
    id: "day", 
    label: "Same Day (4-8 Hrs)", 
    closeRate: 0.25, 
    text: "High leakage. 75% of leads ignore the callback or chose someone else.",
    badge: "25% Booked",
    color: "rose",
    icon: TrendingDown
  },
  { 
    id: "next_day", 
    label: "Next Day / Callback", 
    closeRate: 0.10, 
    text: "Max leakage. 90% of marketing dollars are wasted because lead went cold.",
    badge: "10% Booked",
    color: "red",
    icon: Flame
  }
];

export default function FrictionFunnelAnalyzer({ onDeploy }: { onDeploy?: () => void }) {
  const [traffic, setTraffic] = useState(2500); // Monthly Site Visitors
  const [conversionRate, setConversionRate] = useState(5.0); // % that want to book
  const [orderValue, setOrderValue] = useState(150); // Average booking value in USD
  const [currentSpeedId, setCurrentSpeedId] = useState("day");

  const currentPreset = RESPONSE_SPEED_PRESETS.find(p => p.id === currentSpeedId) || RESPONSE_SPEED_PRESETS[3];
  const optimalPreset = RESPONSE_SPEED_PRESETS[0]; // Instant

  // Calculations
  const leadsAttemptingToBook = Math.round(traffic * (conversionRate / 100));
  
  // Current performance based on response speed
  const currentBookedCount = Math.round(leadsAttemptingToBook * currentPreset.closeRate);
  const currentRevenue = currentBookedCount * orderValue;

  // Optimal performance (using Workspace automated instant scheduling)
  const optimalBookedCount = Math.round(leadsAttemptingToBook * optimalPreset.closeRate);
  const optimalRevenue = optimalBookedCount * orderValue;

  // Leakage values
  const lostBookings = Math.max(0, optimalBookedCount - currentBookedCount);
  const monthlyRevenueBleed = Math.max(0, optimalRevenue - currentRevenue);
  const annualRevenueBleed = monthlyRevenueBleed * 12;

  // Performance multiplier
  const liftMultiplier = currentRevenue > 0 ? (optimalRevenue / currentRevenue).toFixed(1) : "3.8";

  return (
    <CardGlow 
      glowColor="rgba(244, 63, 94, 0.08)" // Red/rose warning glow by default
      hoverBorderColor="border-slate-200 hover:border-rose-500/30"
      className="bg-white border border-slate-200/80 shadow-xl rounded-3xl p-6 md:p-8 flex flex-col justify-between h-full"
    >
      <div className="space-y-6 flex-grow flex flex-col justify-between">
        
        {/* Header block */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="bg-rose-100 text-rose-700 p-2 rounded-2xl shadow-sm">
              <TrendingDown className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold font-mono text-rose-600 uppercase tracking-widest block">FEATURE 4: CONVERSION LEAKAGE</span>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Friction & Cash Bleed Analyzer</h3>
            </div>
          </div>

          <p className="text-slate-600 text-xs leading-relaxed">
            How much money is your business bleeding from slow callback times or manual booking forms? Adjust the sliders below to calculate your exact monthly leakage rate.
          </p>

          {/* Sliders Grid with custom stylized look */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-inner">
            
            {/* Traffic Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-slate-400" /> MONTHLY VISITORS</span>
                <span className="text-purple-600 font-extrabold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{traffic.toLocaleString()} Visitors</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="500"
                  max="25000"
                  step="100"
                  value={traffic}
                  onChange={(e) => setTraffic(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30
                    [&::-webkit-slider-runnable-track]:bg-slate-200 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-runnable-track]:h-2
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white"
                />
              </div>
            </div>

            {/* Intended Booking Rate Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Percent className="h-3.5 w-3.5 text-slate-400" /> WANTING TO BOOK</span>
                <span className="text-purple-600 font-extrabold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{conversionRate}% of traffic</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30
                    [&::-webkit-slider-runnable-track]:bg-slate-200 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-runnable-track]:h-2
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white"
                />
              </div>
            </div>

            {/* Average Ticket Value */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-slate-400" /> AVERAGE ORDER VALUE</span>
                <span className="text-purple-600 font-extrabold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">${orderValue} USD</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="25"
                  max="1000"
                  step="25"
                  value={orderValue}
                  onChange={(e) => setOrderValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30
                    [&::-webkit-slider-runnable-track]:bg-slate-200 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-runnable-track]:h-2
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Response Speed Selector (Friction Factor) */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> CURRENT LEAD RESPONSE TIME (FRICTION FACTOR)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {RESPONSE_SPEED_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = currentSpeedId === preset.id;
              
              let accentClasses = "";
              if (isSelected) {
                if (preset.color === "emerald") accentClasses = "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/15";
                else if (preset.color === "teal") accentClasses = "bg-teal-50 border-teal-500 text-teal-700 ring-2 ring-teal-500/15";
                else if (preset.color === "amber") accentClasses = "bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/15";
                else if (preset.color === "rose") accentClasses = "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/15";
                else accentClasses = "bg-red-50 border-red-500 text-red-700 ring-2 ring-red-500/15";
              } else {
                accentClasses = "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800";
              }

              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setCurrentSpeedId(preset.id)}
                  className={`py-2 px-1.5 rounded-2xl text-[10px] font-black border transition-all duration-300 text-center flex flex-col items-center justify-center gap-1 shadow-sm ${accentClasses}`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? "text-inherit scale-110" : "text-slate-400"}`} />
                  <span className="font-extrabold leading-tight">{preset.label.split(" ")[0]}</span>
                  <span className={`text-[8.5px] font-mono px-1 rounded ${isSelected ? "bg-white/60 font-black" : "text-slate-400"}`}>
                    {preset.badge}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
            <p className="text-[10.5px] text-slate-500 italic leading-relaxed font-medium">
              "{currentPreset.text}"
            </p>
          </div>
        </div>

        {/* Visual Funnel Comparison Chart - Upgraded to Tapered Interactive Glass Diagram */}
        <div className="bg-slate-950 text-white p-5 rounded-3xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h4 className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <BarChart2 className="h-3.5 w-3.5 text-purple-400" /> CONVERSION LEAKAGE FLOW
            </h4>
            <span className="text-[8.5px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full uppercase font-black">
              LIVE SIMULATION
            </span>
          </div>

          {/* Interactive Funnel Drawing */}
          <div className="space-y-4">
            
            {/* Stage 1: Traffic (Wide Funnel Top) */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl opacity-15 group-hover:opacity-25 transition duration-300 blur" />
              <div className="relative bg-slate-900 border border-white/5 p-3 rounded-2xl flex items-center justify-between overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 bg-purple-600/10 w-full animate-pulse" />
                <div className="flex items-center space-x-2.5 z-10">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/15 flex items-center justify-center border border-purple-500/20">
                    <Users className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold font-mono text-purple-400 tracking-wider block uppercase">STAGE 1: TOTAL REACH</span>
                    <span className="text-xs font-black font-mono text-white">{traffic.toLocaleString()} Visitors</span>
                  </div>
                </div>
                <div className="text-right z-10">
                  <span className="text-[10px] font-extrabold font-mono text-slate-400">100% Inflow</span>
                </div>
              </div>
            </div>

            {/* Connecting visual flow */}
            <div className="flex justify-center -my-2">
              <ArrowDown className="h-4.5 w-4.5 text-purple-500/40 animate-bounce" />
            </div>

            {/* Stage 2: Intent-Driven Leads (Middle Funnel Neck) */}
            <div className="relative max-w-[85%] mx-auto group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl opacity-15 group-hover:opacity-25 transition duration-300 blur" />
              <div className="relative bg-slate-900 border border-white/5 p-3 rounded-2xl flex items-center justify-between overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 bg-pink-600/10 w-[40%] animate-pulse" />
                <div className="flex items-center space-x-2.5 z-10">
                  <div className="h-7 w-7 rounded-lg bg-pink-500/15 flex items-center justify-center border border-pink-500/20">
                    <Percent className="h-4 w-4 text-pink-400" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold font-mono text-pink-400 tracking-wider block uppercase">STAGE 2: INTENT (WANT TO BOOK)</span>
                    <span className="text-xs font-black font-mono text-white">{leadsAttemptingToBook} Prospects</span>
                  </div>
                </div>
                <div className="text-right z-10">
                  <span className="text-[10px] font-extrabold font-mono text-pink-400">{conversionRate}% interest</span>
                </div>
              </div>
            </div>

            {/* Connecting visual flow bifurcations */}
            <div className="flex justify-between px-12 -my-2.5 select-none text-slate-600">
              <span className="text-[11px] font-mono">↙ manual pipeline</span>
              <span className="text-[11px] font-mono text-emerald-500/50">autopilot ⚡ ↘</span>
            </div>

            {/* Stage 3: Split Channels (Funnel outlets) */}
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              
              {/* Branch A: Leakage manual flow */}
              <div className="bg-rose-950/20 border border-rose-900/30 p-3.5 rounded-2xl space-y-2 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-3 -bottom-3 text-rose-500/10 select-none">
                  <ShieldAlert className="h-14 w-14" />
                </div>
                
                <div>
                  <span className="text-[9px] font-black font-mono text-rose-400 tracking-wider block uppercase">CURRENT MANUAL</span>
                  <div className="text-lg font-black text-rose-400 font-mono tracking-tight leading-none mt-1">
                    {currentBookedCount} <span className="text-[9.5px] font-normal text-slate-400 font-sans">Booked ({Math.round(currentPreset.closeRate * 100)}%)</span>
                  </div>
                </div>
                
                <div className="text-xs font-black text-rose-300 font-mono pt-1 border-t border-rose-900/20 flex justify-between items-center">
                  <span>${currentRevenue.toLocaleString()} <span className="text-[9px] font-normal text-slate-500">/mo</span></span>
                  <span className="text-[8.5px] font-mono text-rose-500 bg-rose-500/10 px-1 py-0.5 rounded">-{Math.round((1 - currentPreset.closeRate)*100)}% Leak</span>
                </div>
              </div>

              {/* Branch B: Glowing automated flow */}
              <div className="bg-emerald-950/20 border border-emerald-900/30 p-3.5 rounded-2xl space-y-2 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-3 -bottom-3 text-emerald-500/10 select-none">
                  <Zap className="h-14 w-14 animate-pulse" />
                </div>
                
                <div>
                  <span className="text-[9px] font-black font-mono text-emerald-400 tracking-wider block uppercase">⚡ WORKSPACE AUTOPILOT</span>
                  <div className="text-lg font-black text-emerald-400 font-mono tracking-tight leading-none mt-1">
                    {optimalBookedCount} <span className="text-[9.5px] font-normal text-slate-400 font-sans">Booked ({Math.round(optimalPreset.closeRate * 100)}%)</span>
                  </div>
                </div>
                
                <div className="text-xs font-black text-emerald-300 font-mono pt-1 border-t border-emerald-900/20 flex justify-between items-center">
                  <span>${optimalRevenue.toLocaleString()} <span className="text-[9px] font-normal text-slate-500">/mo</span></span>
                  <span className="text-[8.5px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">Max Capture</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Summary Card with calculations - High Fidelity Radar warning style */}
        <div className="bg-rose-50 border border-rose-200/50 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-rose-200/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3.5">
            <div className="bg-rose-600 text-white p-2.5 rounded-2xl shadow-md shadow-rose-600/15 animate-pulse flex-shrink-0">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-bold font-mono text-rose-600 tracking-widest block uppercase">MONTHLY REVENUE LEAKED</span>
              <h4 className="text-xl font-black text-rose-700 tracking-tight">-${monthlyRevenueBleed.toLocaleString()} / mo</h4>
              <p className="text-[10px] text-slate-500 font-mono">
                Annual cash bleed: <strong className="text-rose-600 font-black">-${annualRevenueBleed.toLocaleString()}/yr</strong>
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right flex-shrink-0 bg-white/60 p-2.5 rounded-2xl border border-rose-200/20">
            <span className="text-[9px] font-black font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block mb-1 border border-emerald-200/20">
              +{liftMultiplier}x BOOKING LIFT
            </span>
            <p className="text-[10px] text-slate-600 font-medium leading-normal">
              Via automatic booking handshakes.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            if (onDeploy) {
              onDeploy();
            }
          }}
          className="w-full mt-4 py-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black tracking-widest flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg shadow-rose-600/15 rounded-2xl transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <span>PLUG REVENUE BLEED & CAPTURE LEADS NOW</span>
          <ArrowRight className="h-4 w-4" />
        </button>

      </div>
    </CardGlow>
  );
}
