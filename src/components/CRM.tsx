/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  FolderPlus, 
  MoreVertical,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import { Deal } from "../types";

interface CRMProps {
  tenantId: string;
}

export default function CRM({ tenantId }: CRMProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [dealTitle, setDealTitle] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [dealContact, setDealContact] = useState("");
  const [dealStage, setDealStage] = useState<Deal["stage"]>("lead");
  const [dealAssignedTo, setDealAssignedTo] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  const fetchDeals = () => {
    setLoading(true);
    fetch(`/api/deals/${tenantId}`)
      .then(res => res.json())
      .then(data => {
        setDeals(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("CRM Deals fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDeals();

    // Load active staff for assignment and monitoring filters
    const saved = localStorage.getItem(`bouuz_staff_${tenantId}`);
    if (saved) {
      try {
        setStaff(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing staff:", e);
      }
    }
  }, [tenantId]);

  const handleAddDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle || !dealValue) return;

    const assignedStaff = staff.find(s => s.id === dealAssignedTo);

    fetch(`/api/deals/${tenantId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: dealTitle,
        value: parseFloat(dealValue) || 0,
        stage: dealStage,
        contactName: dealContact || "David Miller",
        assignedTo: dealAssignedTo || undefined,
        assignedToName: assignedStaff ? assignedStaff.name : undefined
      })
    })
      .then(res => res.json())
      .then(newDeal => {
        setDeals(prev => [...prev, newDeal]);
        setDealTitle("");
        setDealValue("");
        setDealContact("");
        setDealStage("lead");
        setDealAssignedTo("");
        setShowAddDealModal(false);
        setToastMessage("SaaS Deal Lead appended to active pipeline sales stage.");
        setTimeout(() => setToastMessage(""), 4000);
      });
  };

  // Move deal stage
  const moveDealStage = (id: string, nextStage: Deal["stage"]) => {
    fetch(`/api/deals/${tenantId}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: nextStage })
    })
      .then(res => res.json())
      .then(updated => {
        setDeals(prev => prev.map(d => d.id === updated.id ? updated : d));
        setToastMessage(`Deal stage transitioned to '${nextStage.replace("_", " ")}'.`);
        setTimeout(() => setToastMessage(""), 3000);
      });
  };

  // Update deal assignee
  const updateDealAssignee = (dealId: string, staffId: string) => {
    const assignedStaff = staff.find(s => s.id === staffId);
    fetch(`/api/deals/${tenantId}/${dealId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignedTo: staffId || null,
        assignedToName: assignedStaff ? assignedStaff.name : null
      })
    })
      .then(res => res.json())
      .then(updated => {
        setDeals(prev => prev.map(d => d.id === updated.id ? updated : d));
        setToastMessage(`Deal assignee successfully updated.`);
        setTimeout(() => setToastMessage(""), 3000);
      })
      .catch(err => console.error(err));
  };

  // Filter deals based on dropdown assignment selection
  const filteredDeals = deals.filter(d => {
    if (selectedAgentFilter === "all") return true;
    if (selectedAgentFilter === "unassigned") return !d.assignedTo;
    return d.assignedTo === selectedAgentFilter;
  });

  // Calculate Pipeline Sum
  const totalPipelineSum = filteredDeals.reduce((sum, d) => sum + d.value, 0);
  const activeDealsCount = filteredDeals.filter(d => d.stage !== "won" && d.stage !== "closed").length;
  const closedWonSum = filteredDeals.filter(d => d.stage === "won").reduce((sum, d) => sum + d.value, 0);

  // Stages definition with followups, pending, closed, won
  const STAGES: Array<{ id: Deal["stage"]; name: string; color: string }> = [
    { id: "lead", name: "Inbound Leads", color: "bg-slate-100 text-slate-800 border-slate-300" },
    { id: "contacted", name: "Contacted", color: "bg-sky-50 text-sky-800 border-sky-200" },
    { id: "followup", name: "Follow-Up Scheduled", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
    { id: "pending", name: "Pending Action", color: "bg-amber-50 text-amber-800 border-amber-200" },
    { id: "won", name: "Closed Won", color: "bg-teal-50 text-teal-800 border-teal-200" },
    { id: "closed", name: "Closed / Inactive", color: "bg-rose-50 text-rose-800 border-rose-200" }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 min-h-screen">
      
      {/* Toast Notice */}
      {toastMessage && (
        <div className="mb-6 bg-teal-600 text-white rounded-lg p-4 flex items-center justify-between shadow-lg shadow-teal-600/10 transition animate-fade-in">
          <span className="text-xs font-mono font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {toastMessage}
          </span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight flex items-center gap-2">
            CRM Sales Pipeline <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-mono font-semibold">Deal Flow</span>
          </h2>
          <p className="text-sm text-slate-500">Track value funnels, leads obtained from automated WhatsApp conversations, and stages progress.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddDealModal(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow transition"
          >
            <Plus className="h-4 w-4" /> Log Pipeline Deal
          </button>
        </div>
      </div>

      {/* CRM Dashboard Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Total Active Pipeline</span>
          <h3 className="text-2xl font-sans font-extrabold text-slate-900 leading-none mt-2 flex items-center gap-1">
            <span className="text-xl font-bold text-slate-400 mr-0.5">₹</span> {totalPipelineSum.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">Combined prospective values in queue</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Active Deals</span>
          <h3 className="text-2xl font-sans font-extrabold text-slate-900 leading-none mt-2 flex items-center gap-1.5">
            <Briefcase className="h-5 w-5 text-slate-400" /> {activeDealsCount}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">Leads undergoing active discussion</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Closed Won Revenue</span>
          <h3 className="text-2xl font-sans font-extrabold text-slate-900 leading-none mt-2 flex items-center gap-1">
            <span className="text-xl font-bold text-emerald-500 mr-0.5">₹</span> {closedWonSum.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-teal-600 font-medium mt-2">Successfully closed freight deals</p>
        </div>
      </div>

      {/* FILTER CONTROLS FOR TENANT ADMINS MONITORING */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Users className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="font-bold">Teammates Monitor Control:</span>
          <span className="text-slate-400">Tenant Admins can view and filter all user deal databases.</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium shrink-0">Filter by Assignee:</label>
          <select
            value={selectedAgentFilter}
            onChange={(e) => setSelectedAgentFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-3 font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
          >
            <option value="all">⚡ All Teammates / All Data</option>
            <option value="unassigned">⚠️ Unassigned Leads</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>👤 {s.name} ({s.role === "tenant_admin" ? "Admin" : "Agent"})</option>
            ))}
          </select>
        </div>
      </div>

      {/* STAGE KANBAN GRID BOARD */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-teal-600" />
          <p className="text-xs font-mono">Syncing CRM pipeline cards...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
            const stageSum = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div key={stage.id} className="bg-slate-100/60 border border-slate-200/50 p-3 rounded-xl shadow-sm min-w-[200px]">
                {/* Stage Header */}
                <div className="mb-3">
                  <span className={`inline-block text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border ${stage.color}`}>
                    {stageDeals.length} CARDS
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 mt-1 truncate">{stage.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">₹{stageSum.toLocaleString('en-IN')}</p>
                </div>

                {/* Deal Cards Container */}
                <div className="space-y-3">
                  {stageDeals.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-lg p-4 text-center text-[10px] text-slate-400">
                      Empty stage
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div key={deal.id} className="bg-white border border-slate-200/80 p-3.5 rounded-lg shadow-xs hover:shadow transition relative group">
                        <h5 className="text-xs font-bold text-slate-800 leading-tight mb-1">{deal.title}</h5>
                        <p className="text-[10px] text-slate-500 mb-1">Ref: {deal.contactName}</p>
                        
                        <div className="border-t border-slate-100 pt-2 pb-1 text-[10px] text-slate-500 flex items-center justify-between">
                          <span className="font-medium">Owner:</span>
                          <select
                            value={deal.assignedTo || ""}
                            onChange={(e) => updateDealAssignee(deal.id, e.target.value)}
                            className="bg-transparent border-none text-[10px] text-blue-600 font-bold focus:ring-0 p-0 text-right cursor-pointer"
                          >
                            <option value="">Unassigned</option>
                            {staff.map(s => (
                              <option key={s.id} value={s.id}>{s.name.split(" ")[0]}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                          <span className="text-xs font-mono font-bold text-slate-700">₹{deal.value.toLocaleString('en-IN')}</span>
                          
                          {/* Stage Transition trigger */}
                          <select
                            value={deal.stage}
                            onChange={(e) => moveDealStage(deal.id, e.target.value as Deal["stage"])}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[9px] py-0.5 px-1 font-mono text-slate-600 focus:outline-none cursor-pointer"
                          >
                            <option value="lead">Inbound</option>
                            <option value="contacted">Contacted</option>
                            <option value="followup">Followup</option>
                            <option value="pending">Pending</option>
                            <option value="won">Won</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE DEAL POPUP DIALOG */}
      {showAddDealModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl relative">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Create Lead Deal record</h4>
            <p className="text-xs text-slate-400 mb-4">Append prospective target freight licensing metrics directly to pipeline stages.</p>

            <form onSubmit={handleAddDealSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Deal Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Bulk Freight Contract - Alpha"
                  value={dealTitle}
                  onChange={(e) => setDealTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Contract Value (₹):</label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Sales Stage:</label>
                  <select
                    value={dealStage}
                    onChange={(e: any) => setDealStage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="lead">Inbound Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="followup">Followup Scheduled</option>
                    <option value="pending">Pending Action</option>
                    <option value="won">Closed Won</option>
                    <option value="closed">Closed / Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Assign To Agent:</label>
                <select
                  value={dealAssignedTo}
                  onChange={(e) => setDealAssignedTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="">Select teammate (Unassigned)</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role === "tenant_admin" ? "Admin" : "Agent"})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Associated Contact Name:</label>
                <input
                  type="text"
                  placeholder="e.g. David Miller"
                  value={dealContact}
                  onChange={(e) => setDealContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDealModal(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-1.5 px-4 rounded-lg shadow transition"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
