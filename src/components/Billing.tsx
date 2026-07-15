/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  CreditCard, 
  CheckCircle2, 
  Cpu, 
  MessageSquare, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  Award
} from "lucide-react";

interface BillingProps {
  tenantId: string;
}

export default function Billing({ tenantId }: BillingProps) {
  const [activePlan, setActivePlan] = useState<"growth" | "pro" | "enterprise">("pro");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlanUpgrade, setSelectedPlanUpgrade] = useState<string>("");
  const [toastMessage, setToastMessage] = useState("");

  const handleTriggerUpgrade = (plan: string) => {
    setSelectedPlanUpgrade(plan);
    setShowCheckoutModal(true);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActivePlan(selectedPlanUpgrade as any);
    setShowCheckoutModal(false);
    setToastMessage(`Congratulations! Your workspace is upgraded to ${selectedPlanUpgrade.toUpperCase()} successfully.`);
    setTimeout(() => setToastMessage(""), 5000);
  };

  // Pricing Plans definition
  const PLANS = [
    {
      id: "growth",
      name: "BouuZ Growth",
      price: 3999,
      features: ["1,000 WhatsApp HSM/day Limit", "1,000 Free Gemini AI response credits", "2 Support Agent Seats Included", "Visual Chatbot Flow Builder Included"],
      badge: "STARTUP"
    },
    {
      id: "pro",
      name: "BouuZ Pro Account",
      price: 9999,
      features: ["10,000 WhatsApp HSM/day Limit", "5,000 Free Gemini AI response credits", "5 Support Agent Seats Included", "Auto Intent & Sentiment Analyzer", "Meta Native Flows Enabled"],
      badge: "MOST POPULAR"
    },
    {
      id: "enterprise",
      name: "BouuZ Enterprise Engine",
      price: 28999,
      features: ["Unlimited WhatsApp HSM/day Limit", "20,000 Free Gemini AI response credits", "Unlimited Agent Seats Included", "Direct Custom Webhooks API integrations", "Dedicated AWS Cloud Run Isolation"],
      badge: "UNLIMITED POWER"
    }
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
            Billing & Subscriptions <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-1 rounded-full font-mono font-semibold">Payment Quotas</span>
          </h2>
          <p className="text-sm text-slate-500">Manage tenant subscription packages, WhatsApp daily message volume limits, and Gemini AI query credits.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-white border border-slate-200 p-2.5 rounded-lg">
            <Award className="h-4 w-4 text-amber-500" /> Active Plan Tier: <strong className="text-slate-800 capitalize">{activePlan}</strong>
          </div>
        </div>
      </div>

      {/* Usage meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* HSM Message Limit card */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">WhatsApp HSM message Limit</span>
          <h3 className="text-2xl font-sans font-extrabold text-slate-900 leading-none mt-2">
            {activePlan === "growth" ? "1,000" : activePlan === "pro" ? "10,000" : "Unlimited"} <span className="text-xs font-sans text-slate-400 font-medium">/ day</span>
          </h3>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-teal-500 h-full w-[25%]" />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">250 messages delivered today (25% rate)</p>
        </div>

        {/* AI response metrics */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">AI Copilot response credits</span>
          <h3 className="text-2xl font-sans font-extrabold text-slate-900 leading-none mt-2">
            {activePlan === "growth" ? "1,000" : activePlan === "pro" ? "5,000" : "20,000"} <span className="text-xs font-sans text-slate-400 font-medium">credits</span>
          </h3>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-purple-500 h-full w-[40%]" />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">40% AI credits utilized in active thread queries</p>
        </div>

        {/* Agent limits */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Authorized support Agent seats</span>
          <h3 className="text-2xl font-sans font-extrabold text-slate-900 leading-none mt-2">
            {activePlan === "growth" ? "2 Seats" : activePlan === "pro" ? "5 Seats" : "Unlimited"}
          </h3>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-500 h-full w-[60%]" />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">3 Seats active (60% seat count reached)</p>
        </div>
      </div>

      {/* PRICING SELECTOR CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => {
          const isCurrentPlan = activePlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`bg-white border rounded-2xl p-6 flex flex-col justify-between shadow-sm relative transition ${
                isCurrentPlan 
                  ? "border-teal-500 ring-2 ring-teal-500/10" 
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {plan.badge && (
                <span className="absolute right-4 top-4 text-[9px] bg-slate-900 text-teal-400 py-1 px-2.5 rounded-full font-mono font-bold">
                  {plan.badge}
                </span>
              )}

              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase font-mono tracking-wider mb-2">{plan.name}</h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-slate-900 font-sans">₹{plan.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-400 font-mono">/ Month billed yearly</span>
                </div>

                <ul className="space-y-3 border-t border-slate-100 pt-5 text-xs text-slate-600">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-5">
                {isCurrentPlan ? (
                  <div className="bg-teal-50 text-teal-800 text-xs text-center py-2.5 rounded-xl font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-teal-600" /> Currently Active Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleTriggerUpgrade(plan.id)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Select Plan Upgrade
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CHECKOUT POPUP DIALOG */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl relative">
            <h4 className="text-base font-bold text-slate-900 mb-1">Simulated Stripe Billing Checkout</h4>
            <p className="text-xs text-slate-400 mb-4">Complete sandbox test payment process to authorize upgrade.</p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-600 space-y-1">
                <p>Upgrading To: <strong className="text-slate-800 capitalize font-mono">{selectedPlanUpgrade} plan</strong></p>
                <p>Price: <strong className="text-slate-800 font-mono">₹{PLANS.find(p => p.id === selectedPlanUpgrade)?.price?.toLocaleString('en-IN')} / month</strong></p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Simulated Card Details:</label>
                <div className="border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-xs font-mono text-slate-700">
                  4242 •••• •••• 4242
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 py-2 px-3 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow transition"
                >
                  Complete Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
