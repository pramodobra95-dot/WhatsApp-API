/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Users, 
  Cpu, 
  ShieldCheck,
  Check,
  Smartphone,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { Tenant } from "../types";

interface DashboardProps {
  tenantId: string;
}

export default function Dashboard({ tenantId }: DashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    fetch(`/api/tenants/${tenantId}/dashboard`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Dashboard fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [tenantId]);

  if (loading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 text-teal-600 animate-spin" />
          <span className="text-sm text-slate-500 font-mono">Synthesizing tenant dashboard...</span>
        </div>
      </div>
    );
  }

  const { tenant, phoneNumbers, contactsCount, chatsCount, campaignsCount, templatesCount, chatbotActive, dealsCount, automationsCount } = data;

  // Mock message delivery analytics over the past 7 days
  const dailyMetrics = [
    { day: "Mon", Sent: 1200, Delivered: 1180, Read: 920 },
    { day: "Tue", Sent: 1400, Delivered: 1390, Read: 1120 },
    { day: "Wed", Sent: 1800, Delivered: 1780, Read: 1540 },
    { day: "Thu", Sent: 1600, Delivered: 1590, Read: 1350 },
    { day: "Fri", Sent: 2100, Delivered: 2095, Read: 1890 },
    { day: "Sat", Sent: 950, Delivered: 940, Read: 780 },
    { day: "Sun", Sent: 1100, Delivered: 1090, Read: 850 },
  ];

  const campaignPerf = [
    { name: "Promo Offer V1", Sent: 1400, Read: 1100, Clicked: 340 },
    { name: "Inbound Welcome", Sent: 800, Read: 780, Clicked: 220 },
    { name: "Support Alert", Sent: 350, Read: 345, Clicked: 150 },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 min-h-screen flex flex-col font-sans">
      {/* Header banner */}
      <div className="flex items-center justify-between h-16 bg-white border-b border-slate-200 px-8 shrink-0">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400 font-medium">Dashboard</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">Overview</span>
          <span className="text-slate-300">/</span>
          <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
            {tenant.plan}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-wide">
            Meta API: <span className="font-bold">Operational</span>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3.5 rounded-lg border border-slate-200 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Metrics
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Workspace info note */}
        <div className="text-sm text-slate-500">
          Live operational feed and WhatsApp API health tracking for <span className="text-slate-800 font-bold">{tenant.name}</span>.
        </div>

        {/* Primary KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Chats open card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute right-4 top-4 text-emerald-500/10">
              <MessageSquare className="h-12 w-12" />
            </div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Conversations</div>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{chatsCount}</div>
            <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Active live sessions
            </div>
          </div>

          {/* Campaign cards */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute right-4 top-4 text-slate-500/10">
              <Send className="h-12 w-12" />
            </div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Campaigns run</div>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{campaignsCount}</div>
            <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Completed broadcasts
            </div>
          </div>

          {/* AI Credits */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute right-4 top-4 text-emerald-500/10">
              <Cpu className="h-12 w-12" />
            </div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">AI Gemini Quota</div>
            <div className="text-3xl font-bold tracking-tight text-slate-900">
              {tenant.aiCredits - tenant.aiUsed} <span className="text-xs font-normal text-slate-400">/ {tenant.aiCredits}</span>
            </div>
            <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Smart responses left
            </div>
          </div>

          {/* Contacts database */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute right-4 top-4 text-slate-500/10">
              <Users className="h-12 w-12" />
            </div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Contacts DB</div>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{contactsCount}</div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" /> Opted-in directory
            </div>
          </div>
        </div>

        {/* Tech Setup & WhatsApp Lines status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Message Outbox Traffic Patterns (7 Days)
            </h4>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyMetrics}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Sent" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" />
                  <Area type="monotone" dataKey="Read" stroke="#64748b" strokeWidth={2} fillOpacity={1} fill="url(#colorRead)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* WhatsApp Channel Quality Line status Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-slate-600" /> WhatsApp Phone Lines
              </h4>
              <div className="space-y-4">
                {phoneNumbers.map((phone: any) => (
                  <div key={phone.id} className="p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">{phone.verifiedName}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        phone.status === "connected" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-rose-50 text-rose-800 border border-rose-100"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${phone.status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                        {phone.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-mono text-slate-500 mb-2">{phone.displayPhoneNumber}</p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Meta Quality rating:</span>
                      <span className={`font-semibold flex items-center gap-1 ${
                        phone.qualityRating === "green" ? "text-emerald-600" : "text-amber-500"
                      }`}>
                        <Check className="h-3.5 w-3.5" /> {phone.qualityRating.toUpperCase()} QUALITY
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-4 mt-4">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Overall Bot Router Status:</span>
                <span className={`font-semibold flex items-center gap-1 ${chatbotActive ? "text-emerald-600" : "text-slate-400"}`}>
                  <Cpu className="h-3.5 w-3.5" /> {chatbotActive ? "ACTIVE HANDLER" : "INACTIVE"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campaign metrics breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Meta Broadcast Conversion Performance</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerf}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Sent" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Read" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Clicked" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fast sandbox walkthrough info */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-9 w-9 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/20">
                <Sparkles className="h-5 w-5 text-emerald-400" />
              </div>
              <h4 className="text-lg font-sans font-bold text-white mb-2">Simulated Live WhatsApp Sandbox</h4>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                BouuZ runs a complete real-time messaging simulation. Head over to 
                <strong className="text-white"> Live Inbox</strong> or the 
                <strong className="text-white"> Webhook Logs</strong> in the Super Admin Deck. 
                You can fire virtual inbound WhatsApp messages using the webhook tool inside the 
                <strong className="text-white"> Tenant Settings</strong> view to see immediate AI auto-replies powered by Gemini!
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300 font-mono">Gemini-3.5-flash online and optimized.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
