/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { 
  Users, 
  Plus, 
  Settings, 
  ShieldCheck, 
  Ban, 
  CheckCircle, 
  TrendingUp, 
  Code, 
  Terminal, 
  Clock, 
  ShieldAlert,
  Webhook,
  DollarSign,
  Cpu,
  RefreshCw,
  Trash
} from "lucide-react";
import { Tenant, AuditLog } from "../types";

interface SuperAdminProps {
  tenants: Tenant[];
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
}

export default function SuperAdmin({ tenants, setTenants }: SuperAdminProps) {
  const [activeTab, setActiveTab] = useState<"tenants" | "logs" | "webhooks">("tenants");
  const [systemStats, setSystemStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Tenant Form
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantDomain, setNewTenantDomain] = useState("");
  const [newTenantPlan, setNewTenantPlan] = useState<Tenant["plan"]>("growth");
  const [newTenantLimits, setNewTenantLimits] = useState("10000");
  const [newTenantCredits, setNewTenantCredits] = useState("1000");
  const [newMaxUsers, setNewMaxUsers] = useState("5");
  const [newInternalChat, setNewInternalChat] = useState(true);

  const [toastMsg, setToastMsg] = useState("");

  const fetchGlobalData = () => {
    setLoading(true);
    
    // Fetch global stats
    fetch("/api/system/stats")
      .then(res => res.json())
      .then(stats => setSystemStats(stats));

    // Fetch webhook simulation logs
    fetch("/api/webhooks/logs")
      .then(res => res.json())
      .then(logs => setWebhookLogs(logs));

    // Fetch admin tenants (sync)
    fetch("/api/admin/tenants")
      .then(res => res.json())
      .then(t => {
        setTenants(t);
        setLoading(false);
      })
      .catch(err => {
        console.error("Super admin fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const handleUpdateTenantLimit = (id: string, updates: Partial<Tenant>) => {
    fetch(`/api/admin/tenants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    })
      .then(res => res.json())
      .then(updated => {
        setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
        setToastMsg(`Tenant configuration updated successfully.`);
        setTimeout(() => setToastMsg(""), 3500);
      });
  };

  const handleCreateTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantDomain) return;

    fetch("/api/admin/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTenantName,
        domain: newTenantDomain,
        plan: newTenantPlan,
        whatsappLimit: parseInt(newTenantLimits) || 10000,
        aiCredits: parseInt(newTenantCredits) || 1000,
        maxUsersCount: parseInt(newMaxUsers) || 5,
        internalChatEnabled: newInternalChat
      })
    })
      .then(res => res.json())
      .then(newT => {
        setTenants(prev => [...prev, newT]);
        setNewTenantName("");
        setNewTenantDomain("");
        setNewMaxUsers("5");
        setNewInternalChat(true);
        setShowAddTenant(false);
        setToastMsg(`Tenant '${newT.name}' created and provisioned with database isolation.`);
        setTimeout(() => setToastMsg(""), 5000);
      });
  };

  // Toggle tenant status (suspend/activate)
  const toggleTenantStatus = (id: string, currentStatus: Tenant["status"]) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    handleUpdateTenantLimit(id, { status: nextStatus });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 min-h-screen">
      
      {/* Toast Notice */}
      {toastMsg && (
        <div className="mb-6 bg-teal-600 text-white rounded-lg p-4 flex items-center justify-between shadow-lg shadow-teal-600/10 transition animate-fade-in">
          <span className="text-xs font-mono font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> {toastMsg}
          </span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Super Admin Control Deck <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-mono font-semibold">Global Platform</span>
          </h2>
          <p className="text-sm text-slate-500">Monitor multi-tenant resource usages, provision database isolations, and trace incoming Meta webhook payloads.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchGlobalData}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-lg border border-slate-200 transition"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Global Nodes
          </button>
          <button
            onClick={() => setShowAddTenant(true)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow transition animate-pulse"
          >
            <Plus className="h-4 w-4" /> Provision Tenant Account
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      {systemStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Total Active Tenants</span>
            <h3 className="text-2xl font-sans font-extrabold text-slate-900 leading-none mt-2 flex items-center gap-1">
              <Users className="h-5 w-5 text-slate-400" /> {systemStats.activeTenantsCount} <span className="text-xs font-normal text-slate-400">/ {systemStats.totalTenants} total</span>
            </h3>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Platform Annual Run Rate</span>
            <h3 className="text-2xl font-sans font-extrabold text-slate-900 leading-none mt-2 flex items-center gap-1">
              <span className="text-xl font-bold text-slate-400 mr-0.5">₹</span> 36,06,350 <span className="text-xs font-normal text-slate-400">ARR</span>
            </h3>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Campaign Run Count</span>
            <h3 className="text-2xl font-sans font-extrabold text-slate-900 leading-none mt-2 flex items-center gap-1.5">
              <TrendingUp className="h-5 w-5 text-slate-400" /> {systemStats.totalCampaigns}
            </h3>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Connected Meta Lines</span>
            <h3 className="text-2xl font-sans font-extrabold text-slate-900 leading-none mt-2 flex items-center gap-1">
              <Webhook className="h-5 w-5 text-slate-400" /> {systemStats.whatsappNumbersCount}
            </h3>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        {(["tenants", "webhooks"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold capitalize border-b-2 transition font-mono ${
              activeTab === tab
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "tenants" ? "Tenant Accounts List" : "Raw Webhook logs"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-rose-600" />
          <p className="text-xs font-mono">Querying platform database schema...</p>
        </div>
      ) : (
        <>
          {activeTab === "tenants" && (
            /* TENANT MANAGEMENT ROW MATRIX */
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                    <th className="p-4">Workspace Name</th>
                    <th className="p-4">Secure Domain</th>
                    <th className="p-4">Tier Tier</th>
                    <th className="p-4">Users Limit</th>
                    <th className="p-4">Internal Chat</th>
                    <th className="p-4">Daily HSM Limit</th>
                    <th className="p-4">Gemini Credit</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-bold text-slate-800">{t.name}</td>
                      <td className="p-4 font-mono text-slate-500">{t.domain}</td>
                      <td className="p-4">
                        <span className={`inline-block text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                          t.plan === "enterprise" ? "bg-purple-100 text-purple-800" :
                          t.plan === "pro" ? "bg-indigo-100 text-indigo-800" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {t.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="1000"
                            value={t.maxUsersCount || 5}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 5;
                              handleUpdateTenantLimit(t.id, { maxUsersCount: v });
                            }}
                            className="w-12 bg-slate-50 border border-slate-200 rounded p-1 text-center font-mono font-bold text-slate-800"
                          />
                          <span className="text-[10px] text-slate-400">Users</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleUpdateTenantLimit(t.id, { internalChatEnabled: !t.internalChatEnabled })}
                          className={`text-[10px] font-bold py-1 px-2.5 rounded-lg border transition ${
                            t.internalChatEnabled
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          {t.internalChatEnabled ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                      <td className="p-4 font-mono font-medium">{t.whatsappLimit.toLocaleString()} / day</td>
                      <td className="p-4 font-mono font-medium">
                        {t.aiUsed} / <span className="font-semibold">{t.aiCredits}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          t.status === "active" ? "bg-teal-100 text-teal-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleTenantStatus(t.id, t.status)}
                          className={`text-[10px] font-bold py-1 px-2.5 rounded transition ${
                            t.status === "active"
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                          }`}
                        >
                          {t.status === "active" ? "Suspend Workspace" : "Unsuspend"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "webhooks" && (
            /* WEBHOOK PRETTY LOGGER */
            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-6 space-y-4 text-slate-100 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-1.5 font-bold text-teal-400">
                  <Terminal className="h-4 w-4" /> Live Meta Webhook Delivery Logs simulation
                </span>
                <span className="text-[10px] text-slate-500 bg-slate-800 py-0.5 px-2 rounded">
                  Listening on /api/webhooks/whatsapp
                </span>
              </div>

              <div className="max-h-[500px] overflow-y-auto space-y-4 divide-y divide-slate-800/60 pr-2 scrollbar-thin">
                {webhookLogs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No webhooks received yet in active sandbox session.
                  </div>
                ) : (
                  webhookLogs.map((log) => (
                    <div key={log.id} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-teal-400 font-bold">{log.type.toUpperCase()}</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 overflow-x-auto">
                        <pre className="text-[11px] leading-relaxed text-emerald-400 whitespace-pre-wrap">
                          {log.payload}
                        </pre>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* PROVISION TENANT MODAL DIALOG */}
      {showAddTenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl relative">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Provision tenant workspace</h4>
            <p className="text-xs text-slate-400 mb-4">Spin up database isolations, configure credentials and route plans instantly.</p>

            <form onSubmit={handleCreateTenantSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Workspace Corporate Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Logistics Group"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Dedicated Domain:</label>
                <input
                  type="text"
                  placeholder="e.g. acme.logistics.com"
                  value={newTenantDomain}
                  onChange={(e) => setNewTenantDomain(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Plan Tier:</label>
                  <select
                    value={newTenantPlan}
                    onChange={(e: any) => setNewTenantPlan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700"
                  >
                    <option value="growth">BouuZ Growth</option>
                    <option value="pro">BouuZ Pro</option>
                    <option value="enterprise">BouuZ Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Daily HSM Limit:</label>
                  <input
                    type="number"
                    value={newTenantLimits}
                    onChange={(e) => setNewTenantLimits(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Max Users Limit:</label>
                  <input
                    type="number"
                    min="1"
                    value={newMaxUsers}
                    onChange={(e) => setNewMaxUsers(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Gemini AI Credits:</label>
                  <input
                    type="number"
                    value={newTenantCredits}
                    onChange={(e) => setNewTenantCredits(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-700">Internal Team Chat</span>
                  <span className="text-[10px] text-slate-400">Allow user-to-user text channels</span>
                </div>
                <input
                  type="checkbox"
                  checked={newInternalChat}
                  onChange={(e) => setNewInternalChat(e.target.checked)}
                  className="h-4 w-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500 cursor-pointer"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTenant(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-1.5 px-4 rounded-lg shadow transition"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
