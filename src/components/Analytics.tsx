import React from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend 
} from "recharts";
import { TrendingUp, Users, Calendar, Target, Award } from "lucide-react";

const leadData = [
  { day: "Mon", Scraped: 24, Outreached: 12, Responded: 3 },
  { day: "Tue", Scraped: 35, Outreached: 20, Responded: 5 },
  { day: "Wed", Scraped: 42, Outreached: 28, Responded: 8 },
  { day: "Thu", Scraped: 30, Outreached: 18, Responded: 4 },
  { day: "Fri", Scraped: 48, Outreached: 32, Responded: 11 },
  { day: "Sat", Scraped: 15, Outreached: 10, Responded: 2 },
  { day: "Sun", Scraped: 18, Outreached: 12, Responded: 3 }
];

const appointmentData = [
  { week: "Wk 21", Booked: 2, Completed: 2 },
  { week: "Wk 22", Booked: 4, Completed: 3 },
  { week: "Wk 23", Booked: 5, Completed: 4 },
  { week: "Wk 24", Booked: 8, Completed: 6 },
  { week: "Wk 25", Booked: 11, Completed: 9 }
];

const revenueTrendData = [
  { date: "06/19", Revenue: 180, Projected: 200 },
  { date: "06/20", Revenue: 340, Projected: 300 },
  { date: "06/21", Revenue: 510, Projected: 450 },
  { date: "06/22", Revenue: 690, Projected: 600 },
  { date: "06/23", Revenue: 880, Projected: 800 },
  { date: "06/24", Revenue: 1104, Projected: 1000 }
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Outreach Deliverability", value: "98.7%", change: "+1.2% this week", icon: Target, color: "text-blue-600 bg-blue-50 border-blue-100" },
          { title: "Average Response Rate", value: "24.5%", change: "Industry standard: 12%", icon: Users, color: "text-purple-600 bg-purple-50 border-purple-100" },
          { title: "Demo Call Conversions", value: "18.2%", change: "+2.4% from last month", icon: Calendar, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { title: "Total Attributed sales", value: "$4,416.00", change: "Projected monthly pace", icon: Award, color: "text-amber-600 bg-amber-50 border-amber-100" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium block">{item.title}</span>
              <span className="text-2xl font-extrabold text-slate-900 block">{item.value}</span>
              <span className="text-[10px] text-slate-500 font-mono block">{item.change}</span>
            </div>
            <div className={`p-3 rounded-xl border ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Leads Scan Chart */}
        <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Leads Scanned & Contacted</h3>
            <p className="text-xs text-slate-500 mt-1">Autonomous daily scrape volume from OpenClaw Skills.</p>
          </div>
          
          <div className="h-80 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scrapedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="outreachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" iconSize={6} />
                <Area type="monotone" dataKey="Scraped" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#scrapedGrad)" />
                <Area type="monotone" dataKey="Outreached" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#outreachGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments Bar Chart */}
        <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Demo Bookings Handshakes</h3>
            <p className="text-xs text-slate-500 mt-1">Calendly appointments detected and completed by Agent.</p>
          </div>
          
          <div className="h-80 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" iconSize={6} />
                <Bar dataKey="Booked" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Completed" fill="#047857" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Performance line Chart */}
        <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Revenue Growth Trend</h3>
              <p className="text-xs text-slate-500 mt-1">Cumulative sales generated across connected payment channels.</p>
            </div>
            
            <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-semibold border border-emerald-100">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Projected pace: $4.4k / Month</span>
            </div>
          </div>
          
          <div className="h-80 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" iconSize={6} />
                <Line type="monotone" dataKey="Revenue" stroke="#185FA5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Projected" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
