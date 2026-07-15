/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  GitBranch, 
  Plus, 
  Settings, 
  CheckCircle2, 
  Trash2, 
  Zap, 
  Clock, 
  ArrowRight, 
  FileText, 
  Smartphone,
  Sliders,
  Send,
  HelpCircle,
  Eye
} from "lucide-react";

interface FlowsAndAutomationProps {
  tenantId: string;
}

export default function FlowsAndAutomation({ tenantId }: FlowsAndAutomationProps) {
  // Mock workflows list
  const [automations, setAutomations] = useState([
    { id: "auto-1", name: "Inbound Onboarding Auto-Reply", trigger: "incoming_message", delaySeconds: 5, actionTemplate: "delivery_update_v2" },
    { id: "auto-2", name: "Cart Abandonment Retargeting", trigger: "webhook_event", delaySeconds: 3600, actionTemplate: "seasonal_offer_discount" }
  ]);

  // Flows builder
  const [activeFlowType, setActiveFlowType] = useState<"lead" | "booking" | "otp">("lead");
  
  // Custom Flow Inputs
  const [leadQuestions, setLeadQuestions] = useState([
    { id: "q1", label: "Company Name", type: "text", required: true },
    { id: "q2", label: "Fleet size requirements", type: "dropdown", required: false },
    { id: "q3", label: "Target start date", type: "date", required: true }
  ]);

  // New automation states
  const [showAddAutoModal, setShowAddAutoModal] = useState(false);
  const [newAutoName, setNewAutoName] = useState("");
  const [newAutoTrigger, setNewAutoTrigger] = useState("incoming_message");
  const [newAutoDelay, setNewAutoDelay] = useState("10");

  const [toastMsg, setToastMsg] = useState("");

  const handleCreateAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAutoName) return;

    const newAuto = {
      id: `auto-${Date.now()}`,
      name: newAutoName,
      trigger: newAutoTrigger,
      delaySeconds: parseInt(newAutoDelay) || 5,
      actionTemplate: "delivery_update_v2"
    };

    setAutomations(prev => [...prev, newAuto]);
    setNewAutoName("");
    setNewAutoDelay("10");
    setShowAddAutoModal(false);
    setToastMsg("Automation trigger compiled and deployed successfully.");
    setTimeout(() => setToastMsg(""), 4000);
  };

  const deleteAuto = (id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
    setToastMsg("Automation trigger deleted.");
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 min-h-screen">
      
      {/* Toast NOTICE */}
      {toastMsg && (
        <div className="mb-6 bg-teal-600 text-white rounded-lg p-4 flex items-center justify-between shadow-lg shadow-teal-600/10 transition animate-fade-in">
          <span className="text-xs font-mono font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {toastMsg}
          </span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Flows & Automated Workflows <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-1 rounded-full font-mono font-semibold">Triggers & Forms</span>
          </h2>
          <p className="text-sm text-slate-500">Design WhatsApp native inline checkout forms (Meta Flows) and set up event-driven autoresponders.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => setShowAddAutoModal(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow transition"
          >
            <Plus className="h-4 w-4" /> Setup Automated Workflow
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* AUTOMATION TRIGGERS BOX */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" /> Active Event-Triggered Automations
          </h4>

          <div className="space-y-4">
            {automations.map((auto) => (
              <div key={auto.id} className="p-4 border border-slate-100 bg-slate-50 rounded-xl flex items-center justify-between hover:border-slate-200 transition">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
                    <GitBranch className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{auto.name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Trigger: <span className="text-indigo-600">{auto.trigger}</span> | Delay: {auto.delaySeconds}s | Template: {auto.actionTemplate}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => deleteAuto(auto.id)}
                  className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100"
                  title="Remove Trigger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* WORKFLOW CONFIGURATION METRIC EXPLANATION */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl text-white shadow flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold text-teal-400 font-mono uppercase tracking-wider block mb-1">Meta Flows Guide</span>
            <h4 className="text-base font-bold text-white mb-2">Native Inline WhatsApp Questionnaires</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Instead of forcing users to exit WhatsApp and open their browsers, Meta Flows let you display interactive form sheets 
              directly inside the chat thread. Excellent for collecting sales leads, booking freight slots, or validating phone numbers with OTP.
            </p>
          </div>

          <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
            <span className="font-mono text-slate-300 text-[10px]">Security sandbox validates Flow JSON schema automatically.</span>
          </div>
        </div>
      </div>

      {/* META FLOWS FORM BUILDER WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* INTERACTIVE FORM FIELD CONFIGURATOR */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-teal-600" /> WhatsApp Flow Schema Builder
            </h4>
            
            <div className="flex gap-1.5">
              {(["lead", "booking", "otp"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFlowType(type)}
                  className={`text-[10px] py-1 px-2.5 rounded font-mono uppercase ${
                    activeFlowType === type
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {activeFlowType === "lead" && (
            <div className="space-y-4">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Dynamic Fields Definition (Schema.json)</span>
              <div className="space-y-2">
                {leadQuestions.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-2.5 border border-slate-100 bg-slate-50 rounded-lg">
                    <span className="text-xs font-bold text-slate-700">{q.label} <span className="text-[10px] text-slate-400">({q.type})</span></span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 rounded ${q.required ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-600"}`}>
                      {q.required ? "REQUIRED" : "OPTIONAL"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[10px] text-slate-500 font-mono">
                <span className="font-bold">Raw Meta Flow JSON Payload Preview:</span>
                <pre className="mt-1 max-h-40 overflow-y-auto leading-relaxed">
{`{
  "version": "2.1",
  "screens": [
    {
      "id": "screen_lead_collection",
      "title": "Alpha Lead Sheet",
      "layout": {
        "type": "Form",
        "children": [
          { "type": "TextInput", "label": "Company Name", "required": true },
          { "type": "Dropdown", "label": "Fleet requirements" },
          { "type": "DatePicker", "label": "Target Date" }
        ]
      }
    }
  ]
}`}
                </pre>
              </div>
            </div>
          )}

          {activeFlowType === "booking" && (
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800">Appointment Slot Booking Flow configured details:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Screen 1: Select preferred logistics depot location.</li>
                <li>Screen 2: Select date calendar slot and timing (9AM - 4PM limits).</li>
                <li>Screen 3: Submit confirmation, write details to backend CRM automatically.</li>
              </ul>
              <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-lg text-[11px] font-semibold">
                📅 Generates dynamic reservation calendar on users' phone with one-tap checkout.
              </div>
            </div>
          )}

          {activeFlowType === "otp" && (
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800">Inline Secure Authentication OTP Flow details:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>User clicks 'Secure Sign In' inside custom WhatsApp templates.</li>
                <li>Meta Flow sheet pops up immediately, asking for the secure login pin.</li>
                <li>Automated trigger compares input with backend auth database and logs user in.</li>
              </ul>
            </div>
          )}
        </div>

        {/* FLOW GRAPHICS / MOBILE PREVIEW SIMULATOR */}
        <div className="flex justify-center items-start">
          <div className="w-80 bg-slate-900 rounded-[3rem] p-4 border-4 border-slate-800 aspect-[9/18]">
            <div className="w-24 h-4 bg-slate-800 mx-auto rounded-b-xl mb-4" />

            <div className="bg-slate-950 h-[calc(100%-2rem)] rounded-[2rem] p-3 flex flex-col justify-between relative overflow-hidden">
              <div className="bg-white rounded-xl p-4 space-y-3 text-slate-900 z-10 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="text-[10px] font-extrabold text-teal-600 font-mono tracking-wider">META FLOW</span>
                  <Smartphone className="h-4 w-4 text-slate-400" />
                </div>

                {activeFlowType === "lead" && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold">Alpha Lead Collection Sheet</p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold font-mono">Company Name *</span>
                        <div className="h-7 border border-slate-200 rounded px-2 text-[10px] flex items-center text-slate-400 bg-slate-50">
                          Alpha Freight Systems
                        </div>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold font-mono">Fleet requirements</span>
                        <div className="h-7 border border-slate-200 rounded px-2 text-[10px] flex items-center text-slate-400 bg-slate-50">
                          Choose fleet size...
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeFlowType === "booking" && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold">Depot Reservation Flow</p>
                    <span className="text-[9px] text-slate-500 block">Select preferred scheduling calendar slot below:</span>
                    <div className="h-20 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                      [Interactive Calendar Grid]
                    </div>
                  </div>
                )}

                {activeFlowType === "otp" && (
                  <div className="space-y-3 text-center py-2">
                    <p className="text-xs font-bold">Verify Security Passcode</p>
                    <span className="text-[9px] text-slate-500 block">We sent a secure OTP pin code to your number.</span>
                    <div className="flex justify-center gap-1.5">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-8 w-8 border border-slate-200 rounded flex items-center justify-center font-bold text-xs bg-slate-50">
                          -
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setToastMsg("WhatsApp Flow form submitted successfully inside sandbox simulation!");
                    setTimeout(() => setToastMsg(""), 3000);
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] py-1.5 rounded-lg text-center mt-2 cursor-pointer"
                >
                  Submit Form Details
                </button>
              </div>

              <div className="bg-slate-900 h-8 rounded-xl border border-slate-800 flex items-center justify-center text-[8px] text-slate-500">
                <span>WhatsApp Native Screen Preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE AUTOMATION MODAL */}
      {showAddAutoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl relative">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Add Automated Event Trigger</h4>
            <p className="text-xs text-slate-400 mb-4">Set up delayed automatic HSM template replies whenever specific triggers execute.</p>

            <form onSubmit={handleCreateAutomation} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Automation Descriptor Name:</label>
                <input
                  type="text"
                  placeholder="e.g. New User Instant Welcome HSM"
                  value={newAutoName}
                  onChange={(e) => setNewAutoName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Execution Trigger:</label>
                  <select
                    value={newAutoTrigger}
                    onChange={(e) => setNewAutoTrigger(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="incoming_message">Any Inbound Text</option>
                    <option value="webhook_event">Meta Webhook Callback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Delay Timer (seconds):</label>
                  <input
                    type="number"
                    value={newAutoDelay}
                    onChange={(e) => setNewAutoDelay(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAutoModal(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-1.5 px-4 rounded-lg shadow transition"
                >
                  Save Trigger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
