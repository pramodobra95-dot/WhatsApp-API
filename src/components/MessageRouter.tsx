/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { 
  Zap, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  User, 
  Cpu, 
  HelpCircle, 
  Clock, 
  Shuffle, 
  Bot, 
  MessageSquare,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { RoutingRule } from "../types";

interface MessageRouterProps {
  tenantId: string;
}

export default function MessageRouter({ tenantId }: MessageRouterProps) {
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  // Add rule form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleType, setNewRuleType] = useState<"keyword" | "random" | "round_robin" | "sentiment" | "time_based">("keyword");
  const [newRuleValue, setNewRuleValue] = useState("");
  const [newRuleTarget, setNewRuleTarget] = useState("Support Group");

  // Simulation states
  const [simName, setSimName] = useState("Preet Singh");
  const [simPhone, setSimPhone] = useState("+919988776655");
  const [simText, setSimText] = useState("Hi, I want to query about pricing discount coupon for bulk cargo shipment.");
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{
    success: boolean;
    matchedRule: RoutingRule | null;
    destination: string;
    sentiment: string;
    traceSteps: Array<{ ruleName: string; type: string; matched: boolean; reason: string }>;
    chatId: string;
  } | null>(null);

  const fetchRules = () => {
    if (!tenantId) return;
    setLoading(true);
    fetch(`/api/routing-rules/${tenantId}`)
      .then(res => res.json())
      .then(data => {
        setRules(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching routing rules:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRules();
  }, [tenantId]);

  const handleToggleRule = (ruleId: string, currentActive: boolean) => {
    fetch(`/api/routing-rules/${ruleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentActive })
    })
      .then(res => res.json())
      .then(updated => {
        setRules(prev => prev.map(r => r.id === updated.id ? updated : r));
        showToast(`Rule "${updated.name}" ${updated.isActive ? "enabled" : "disabled"} successfully.`);
      });
  };

  const handleDeleteRule = (ruleId: string) => {
    fetch(`/api/routing-rules/${ruleId}`, {
      method: "DELETE"
    })
      .then(() => {
        setRules(prev => prev.filter(r => r.id !== ruleId));
        showToast("Routing rule deleted successfully.");
      });
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRuleTarget) return;

    const payload = {
      name: newRuleName,
      type: newRuleType,
      conditionValue: newRuleValue,
      targetDestination: newRuleTarget,
      isActive: true
    };

    fetch(`/api/routing-rules/${tenantId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(newR => {
        setRules(prev => [...prev, newR]);
        setNewRuleName("");
        setNewRuleValue("");
        setNewRuleType("keyword");
        setNewRuleTarget("Support Group");
        setShowAddForm(false);
        showToast(`New rule "${newR.name}" added successfully!`);
      });
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName || !simPhone || !simText) return;

    setSimulating(true);
    setSimResult(null);

    fetch(`/api/routing-rules/simulate/${tenantId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: simName,
        customerPhone: simPhone,
        messageText: simText
      })
    })
      .then(res => res.json())
      .then(data => {
        setSimResult(data);
        setSimulating(false);
        showToast("Incoming message routed and simulated successfully!");
      })
      .catch(err => {
        console.error("Simulation failed:", err);
        setSimulating(false);
      });
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 min-h-screen">
      
      {/* Toast feedback banner */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-teal-400 border border-teal-500/30 rounded-xl p-4 flex items-center gap-3 shadow-2xl transition animate-fade-in text-xs font-mono">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Incoming Message Router <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-mono font-semibold">Active Engine</span>
          </h2>
          <p className="text-sm text-slate-500">Route incoming WhatsApp customer messages automatically using key triggers, sentiments or random balancing rules.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition"
          >
            <Plus className="h-4 w-4" /> {showAddForm ? "Show Rules List" : "Add Routing Rule"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIVE RULES & BUILDER */}
        <div className="lg:col-span-2 space-y-6">
          
          {showAddForm ? (
            /* ADD ROUTING RULE FORM */
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" /> Create Routing Rule
              </h3>
              
              <form onSubmit={handleAddRule} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1">Rule Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Refund Keyword Router"
                    value={newRuleName}
                    onChange={e => setNewRuleName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1">Routing Strategy / Condition:</label>
                    <select
                      value={newRuleType}
                      onChange={e => {
                        const val = e.target.value as any;
                        setNewRuleType(val);
                        if (val === "sentiment") setNewRuleValue("negative");
                        else if (val === "time_based") setNewRuleValue("20:00-08:00");
                        else if (val === "random" || val === "round_robin") setNewRuleValue("");
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="keyword">Keyword Match</option>
                      <option value="sentiment">Sentiment-Based</option>
                      <option value="time_based">Time-Based (Off-hours)</option>
                      <option value="random">Random Load Balancer</option>
                      <option value="round_robin">Round Robin Queue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1">Target Agent or Queue:</label>
                    <select
                      value={newRuleTarget}
                      onChange={e => setNewRuleTarget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Agent Alice">Agent Alice</option>
                      <option value="Agent Bob">Agent Bob</option>
                      <option value="Support Group">Support Group (Team)</option>
                      <option value="Sales Group">Sales Group (Team)</option>
                      <option value="Manager Jessica">Manager Jessica</option>
                      <option value="AI Chatbot">AI Chatbot (Autoresponder)</option>
                    </select>
                  </div>
                </div>

                {newRuleType === "keyword" && (
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1">Trigger Keywords (comma separated):</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., refund, return, status, shipping, delay"
                      value={newRuleValue}
                      onChange={e => setNewRuleValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                )}

                {newRuleType === "sentiment" && (
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1">Trigger Sentiment Type:</label>
                    <select
                      value={newRuleValue}
                      onChange={e => setNewRuleValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="negative">Negative Sentiment (Anger, Frustrated)</option>
                      <option value="positive">Positive Sentiment (Praise, Thanks)</option>
                      <option value="neutral">Neutral Sentiment</option>
                    </select>
                  </div>
                )}

                {newRuleType === "time_based" && (
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1">Simulated Active Hours (24-hour format range):</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 18:00-09:00"
                      value={newRuleValue}
                      onChange={e => setNewRuleValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow transition"
                  >
                    Deploy Rule
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ACTIVE RULES LIST */
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-600" /> Precedence Routing Pipeline
                </span>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                  Sequential Order (1 to N)
                </span>
              </h3>

              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-xs">Fetching active pipeline...</p>
                </div>
              ) : rules.length === 0 ? (
                <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs">No custom rules deployed. Messages default to standard queue.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {rules.map((rule, idx) => {
                    const strategyIcons = {
                      keyword: <HelpCircle className="h-4 w-4 text-teal-500" />,
                      sentiment: <AlertCircle className="h-4 w-4 text-rose-500" />,
                      time_based: <Clock className="h-4 w-4 text-amber-500" />,
                      random: <Shuffle className="h-4 w-4 text-indigo-500" />,
                      round_robin: <RefreshCw className="h-4 w-4 text-blue-500" />
                    }[rule.type] || <Zap className="h-4 w-4 text-slate-400" />;

                    return (
                      <div 
                        key={rule.id}
                        className={`p-4 rounded-xl border transition flex items-center justify-between ${
                          rule.isActive 
                            ? "bg-white border-slate-200 hover:border-slate-300" 
                            : "bg-slate-50/50 border-slate-100 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Priority index badge */}
                          <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 text-xs">{rule.name}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono flex items-center gap-1 font-bold uppercase ${
                                rule.type === "keyword" ? "bg-teal-50 text-teal-700" :
                                rule.type === "sentiment" ? "bg-rose-50 text-rose-700" :
                                rule.type === "time_based" ? "bg-amber-50 text-amber-700" :
                                "bg-indigo-50 text-indigo-700"
                              }`}>
                                {strategyIcons} {rule.type.replace("_", " ")}
                              </span>
                            </div>

                            {rule.conditionValue && (
                              <p className="text-[10px] text-slate-500 font-mono mt-1">
                                Trigger: <span className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded">{rule.conditionValue}</span>
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 mt-2">
                              <span className="text-[10px] text-slate-400">Target Queue:</span>
                              <span className="text-[10px] bg-slate-900 text-slate-100 font-mono px-2 py-0.5 rounded flex items-center gap-1">
                                {rule.targetDestination === "AI Chatbot" ? <Bot className="h-3 w-3 text-teal-400" /> : <User className="h-3 w-3 text-blue-400" />}
                                {rule.targetDestination}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleRule(rule.id, rule.isActive)}
                            className="text-slate-500 hover:text-slate-800 transition"
                            title={rule.isActive ? "Disable Rule" : "Enable Rule"}
                          >
                            {rule.isActive ? (
                              <ToggleRight className="h-6 w-6 text-emerald-500 cursor-pointer" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-slate-300 cursor-pointer" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Delete Rule"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {/* HELP INFO BOX */}
          <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-xl p-5 text-white shadow-md border border-slate-800">
            <h4 className="text-xs font-bold font-mono text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Routing Best Practices
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Our automated system processes WhatsApp webhook inbound message objects sequentialy from Priority 1 to N. Once a match is hit, the session is provisioned and routed, halting downstream pipeline execution. Place highly specific keyword rules above generic queue balancing strategies.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: SIMULATION & ROUTE TESTER */}
        <div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Play className="h-4 w-4 text-emerald-600 animate-pulse" /> Live Message Router Simulation
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">Simulate an incoming message from a source. Run it through the routing pipeline to verify target delivery paths.</p>

            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1">Customer Name:</label>
                <input
                  type="text"
                  required
                  value={simName}
                  onChange={e => setSimName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1">Sender Mobile Phone:</label>
                <input
                  type="text"
                  required
                  value={simPhone}
                  onChange={e => setSimPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1">Inbound Message Content:</label>
                <textarea
                  required
                  rows={3}
                  value={simText}
                  onChange={e => setSimText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={simulating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Simulating Webhook...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Inject & Route Message
                  </>
                )}
              </button>
            </form>

            {/* SIMULATION TRACE OUTPUT */}
            {simResult && (
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-4 animate-fade-in">
                
                {/* Result header */}
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-emerald-800 font-mono font-bold block uppercase tracking-wide">Destination Route Assigned</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <ArrowRight className="h-3 w-3 text-emerald-600" /> {simResult.destination}
                    </span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                    simResult.sentiment === "negative" ? "bg-red-100 text-red-800" :
                    simResult.sentiment === "positive" ? "bg-emerald-100 text-emerald-800" :
                    "bg-slate-100 text-slate-700"
                  }`}>
                    {simResult.sentiment} Sentiment
                  </span>
                </div>

                {/* Flow execution steps */}
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block mb-2">Engine Trace Logs:</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {simResult.traceSteps.map((step, sIdx) => (
                      <div key={sIdx} className="bg-slate-50 p-2 rounded border border-slate-100/80 text-[10px] space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700">{step.ruleName}</span>
                          <span className={`font-mono text-[8px] px-1 rounded uppercase ${
                            step.matched ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"
                          }`}>
                            {step.matched ? "MATCHED" : "SKIP"}
                          </span>
                        </div>
                        <p className="text-slate-500 font-mono text-[9px] leading-tight">{step.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Back Link notice */}
                <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 text-[10px] text-blue-800 leading-snug flex gap-2">
                  <MessageSquare className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                  <div>
                    This conversation is active! Open the <strong className="font-bold">Live Inbox</strong> tab to chat with <strong>{simName}</strong>.
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
