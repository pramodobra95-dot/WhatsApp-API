/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Plus, 
  Trash2, 
  Tag, 
  CheckCircle2, 
  Sliders, 
  Shield,
  Globe,
  HelpCircle,
  Key,
  Link2,
  LogIn,
  Phone,
  RefreshCw,
  Copy,
  ExternalLink,
  Check,
  MessageSquare
} from "lucide-react";

interface TenantSettingsProps {
  tenantId: string;
}

export interface CustomLabel {
  name: string;
  color: string; // Tailwind class background & text e.g., "bg-blue-100 text-blue-800"
}

export default function TenantSettings({ tenantId }: TenantSettingsProps) {
  const [labels, setLabels] = useState<CustomLabel[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-blue-100 text-blue-800 border-blue-200");
  const [toastMsg, setToastMsg] = useState("");

  const [activeSubTab, setActiveSubTab] = useState<"labels" | "meta">("labels");
  
  // Meta Configuration States
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [systemUserToken, setSystemUserToken] = useState("");
  const [webhookVerifyToken, setWebhookVerifyToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Embedded Signup Dialog States
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupStep, setSignupStep] = useState(1); // 1: Login, 2: Select business/number, 3: Verify OTP, 4: Connect Complete
  
  // Simulated Signup form states
  const [selectedBusiness, setSelectedBusiness] = useState("Alpha Logistics Meta");
  const [simPhoneNumber, setSimPhoneNumber] = useState("+91 98765 43210");
  const [simVerifiedName, setSimVerifiedName] = useState("Alpha Logistics CRM");
  const [simWabaId, setSimWabaId] = useState("waba_948201048291032");
  const [simPhoneId, setSimPhoneId] = useState("phone_284910482910394");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Connected Numbers state for this tenant
  const [connectedNumbers, setConnectedNumbers] = useState<any[]>([]);

  const DEFAULT_LABELS: CustomLabel[] = [
    { name: "VIP", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { name: "Support", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { name: "Urgent", color: "bg-rose-100 text-rose-800 border-rose-200" },
    { name: "Logistics", color: "bg-amber-100 text-amber-800 border-amber-200" },
    { name: "Interested", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { name: "Follow-up", color: "bg-indigo-100 text-indigo-800 border-indigo-200" }
  ];

  const COLOR_PALETTES = [
    { label: "Blue Slate", value: "bg-blue-100 text-blue-800 border-blue-200" },
    { label: "Emerald Mint", value: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { label: "Rose Ruby", value: "bg-rose-100 text-rose-800 border-rose-200" },
    { label: "Amber Sun", value: "bg-amber-100 text-amber-800 border-amber-200" },
    { label: "Purple Orchid", value: "bg-purple-100 text-purple-800 border-purple-200" },
    { label: "Indigo Royal", value: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { label: "Teal Lagoon", value: "bg-teal-100 text-teal-800 border-teal-200" },
    { label: "Slate Carbon", value: "bg-slate-100 text-slate-700 border-slate-200" }
  ];

  useEffect(() => {
    const saved = localStorage.getItem(`bouuz_labels_${tenantId}`);
    if (saved) {
      try {
        setLabels(JSON.parse(saved));
      } catch (e) {
        setLabels(DEFAULT_LABELS);
      }
    } else {
      setLabels(DEFAULT_LABELS);
      localStorage.setItem(`bouuz_labels_${tenantId}`, JSON.stringify(DEFAULT_LABELS));
    }
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    
    // Fetch Meta Config
    fetch(`/api/tenants/${tenantId}/meta-config`)
      .then(res => res.json())
      .then(data => {
        setAppId(data.appId || "");
        setAppSecret(data.appSecret || "");
        setSystemUserToken(data.systemUserToken || "");
        setWebhookVerifyToken(data.webhookVerifyToken || "");
        setWebhookUrl(data.webhookUrl || "");
        setIsConfigured(data.isConfigured || false);
      })
      .catch(err => console.error("Error fetching Meta config", err));

    // Fetch Connected Numbers
    fetch(`/api/tenants/${tenantId}/dashboard`)
      .then(res => res.json())
      .then(data => {
        setConnectedNumbers(data.phoneNumbers || []);
      })
      .catch(err => console.error("Error fetching tenant phone numbers", err));
  }, [tenantId]);

  const saveLabels = (updated: CustomLabel[]) => {
    setLabels(updated);
    localStorage.setItem(`bouuz_labels_${tenantId}`, JSON.stringify(updated));
    setToastMsg("Chat labels updated successfully!");
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newLabelName.trim();
    if (!cleanName) return;

    if (labels.some(l => l.name.toLowerCase() === cleanName.toLowerCase())) {
      setToastMsg("Error: This label already exists!");
      setTimeout(() => setToastMsg(""), 3500);
      return;
    }

    const updated = [...labels, { name: cleanName, color: selectedColor }];
    saveLabels(updated);
    setNewLabelName("");
  };

  const handleDeleteLabel = (name: string) => {
    const updated = labels.filter(l => l.name !== name);
    saveLabels(updated);
  };

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSaveMetaConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setMetaLoading(true);
    fetch(`/api/tenants/${tenantId}/meta-config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, appSecret, systemUserToken, webhookVerifyToken })
    })
      .then(res => res.json())
      .then(data => {
        setIsConfigured(data.isConfigured);
        setToastMsg("Meta Cloud Connection configurations saved successfully!");
        setTimeout(() => setToastMsg(""), 3000);
      })
      .catch(err => {
        setToastMsg("Error: Failed to save Meta configuration.");
        setTimeout(() => setToastMsg(""), 3500);
      })
      .finally(() => setMetaLoading(false));
  };

  const handleCompleteEmbeddedSignup = () => {
    const payload = {
      phoneNumber: simPhoneNumber,
      displayPhoneNumber: simPhoneNumber,
      verifiedName: simVerifiedName,
      wabaId: simWabaId,
      phoneId: simPhoneId,
      limitCategory: "tier1"
    };

    fetch(`/api/tenants/${tenantId}/embedded-signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to connect");
        return res.json();
      })
      .then(newNumber => {
        setConnectedNumbers(prev => [...prev, newNumber]);
        setToastMsg(`Successfully connected ${simPhoneNumber} via Meta Embedded Signup!`);
        setTimeout(() => setToastMsg(""), 4000);
        setShowSignupModal(false);
        setSignupStep(1);
        setOtpCode("");
        setOtpSent(false);
      })
      .catch(err => {
        setToastMsg("Error: Failed to register WhatsApp line.");
        setTimeout(() => setToastMsg(""), 3500);
      });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 min-h-screen">
      
      {/* Toast Feedback */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl p-4 flex items-center gap-3 shadow-xl transition-all duration-300 ${
          toastMsg.startsWith("Error") ? "bg-rose-600 text-white" : "bg-blue-600 text-white"
        }`}>
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-slate-700" />
            <span>Tenant Workspace Panel</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
              Tenant Admin Mode
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Customize platform parameters, create WhatsApp CRM outcome tags, and tweak business rules.
          </p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-slate-200 mb-8 gap-6">
        <button
          onClick={() => setActiveSubTab("labels")}
          className={`pb-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "labels"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-800"
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>CRM Outcome Labels</span>
        </button>
        <button
          onClick={() => setActiveSubTab("meta")}
          className={`pb-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "meta"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-800"
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Meta Embedded Signup Connection</span>
          <span className="bg-blue-100 text-blue-800 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
            WABA API
          </span>
        </button>
      </div>

      {activeSubTab === "labels" ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Form: Create label */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Tag className="h-4 w-4 text-blue-600" />
                <span>Provision Custom Output Tag</span>
              </h3>

              <form onSubmit={handleAddLabel} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Tag Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paid Customer"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                    Select Visual Tag Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_PALETTES.map((color) => {
                      const isSelected = selectedColor === color.value;
                      return (
                        <button
                          type="button"
                          key={color.value}
                          onClick={() => setSelectedColor(color.value)}
                          className={`text-[10px] py-2 px-2.5 border rounded-xl text-center font-medium truncate transition ${
                            isSelected
                              ? "ring-2 ring-blue-600 border-transparent shadow-sm"
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <span className={`px-2 py-0.5 rounded border ${color.value}`}>
                            {color.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Save Tag to Workspace
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel: Labels list */}
          <div className="xl:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-blue-600" />
                  <span>Custom Workspace Outcome Labels</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {labels.length} Tags Configured
                </span>
              </h3>

              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                These outcome labels are loaded instantly into the Live Chat Inbox view for your WhatsApp Business agents. They can assign these labels to contacts during ongoing conversations based on the customer output.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {labels.map((lbl) => (
                  <div
                    key={lbl.name}
                    className="bg-white border border-slate-100 hover:border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      <div>
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded border ${lbl.color}`}>
                          {lbl.name}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteLabel(lbl.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Remove outcome label"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}

                {labels.length === 0 && (
                  <div className="col-span-2 text-center py-12 border border-dashed border-slate-200 rounded-2xl">
                    <Tag className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400">No custom chat tags defined yet. Initialize your tags now.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Steps, Setup & Button */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Meta Prerequisites & Overview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>WABA Integration &amp; Embedded Signup Guide (हिन्दी &amp; English)</span>
              </h3>
              
              <div className="space-y-4 text-xs leading-relaxed text-slate-600">
                <p>
                  <strong>Meta Embedded Signup</strong> enables you or your clients to securely register their WhatsApp Business API numbers directly inside our multi-tenant application within 2 minutes. Before initializing the registration, please prepare the following assets on your Meta Developer Portal:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-xs">
                      <Key className="h-3.5 w-3.5 text-blue-600" />
                      <span>Required Meta Assets</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px]">
                      <li><strong className="text-slate-700">Meta App (Business Type)</strong> with the &quot;WhatsApp&quot; product activated.</li>
                      <li><strong className="text-slate-700">Facebook App ID</strong> configured for client-side JavaScript SDK.</li>
                      <li><strong className="text-slate-700">Permanent System User Token</strong> with `whatsapp_business_management` and `whatsapp_business_messaging` permissions.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-blue-50/50 border border-blue-100/60 rounded-xl">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5 mb-1 text-xs">
                      <Globe className="h-3.5 w-3.5 text-blue-700" />
                      <span>हिन्दी गाइड (आवश्यक एपीआई)</span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-normal">
                      आपको अपने <strong>Meta Cloud Console</strong> से <strong>App ID</strong>, <strong>App Secret</strong>, और एक स्थायी <strong>System User Access Token</strong> (विशिष्ट अनुमतियों के साथ) यहाँ दर्ज करनी होगी। यह इस प्लेटफार्म को विभिन्न कस्टूमर नंबरों के मैसेज रिसीव और सेंड करने की अनुमति प्रदान करता है।
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Config Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Settings className="h-4 w-4 text-blue-600" />
                <span>Step 1: Save Meta Developer App Configurations</span>
              </h3>

              <form onSubmit={handleSaveMetaConfig} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                      Facebook App ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 938210349281034"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                      Meta App Secret (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="e.g. ••••••••••••••••••••••••••••••••"
                      value={appSecret}
                      onChange={(e) => setAppSecret(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    System User Access Token (Long-Lived/Permanent)
                  </label>
                  <textarea
                    placeholder="e.g. EAAGzoPZB1ZC5kBALuN8ZCWuO3747..."
                    value={systemUserToken}
                    onChange={(e) => setSystemUserToken(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Make sure to generate this under Meta Business Settings &rarr; System Users with WhatsApp permissions.
                  </p>
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-4">
                  <button
                    type="submit"
                    disabled={metaLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-5 rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-55"
                  >
                    {metaLoading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Save Meta Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Connection launcher button */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-6 text-center">
              <h3 className="text-sm font-extrabold text-slate-950 mb-2">
                Step 2: Launch Interactive Meta Embedded Signup Callback
              </h3>
              <p className="text-xs text-slate-500 max-w-lg mx-auto mb-5 leading-normal">
                Credentials save karne ke baad, aap is option ka upyog karke WhatsApp Business profile ko secure authenticate krke multi-tenant pipeline me bind kar sakte hain.
              </p>

              <button
                type="button"
                onClick={() => {
                  if (!isConfigured) {
                    setToastMsg("Error: Please provide and save Facebook App ID and System User Token in Step 1 first!");
                    setTimeout(() => setToastMsg(""), 4000);
                    return;
                  }
                  setShowSignupModal(true);
                  setSignupStep(1);
                }}
                className={`py-3 px-6 rounded-xl font-bold text-xs transition duration-300 flex items-center gap-2 mx-auto shadow-sm cursor-pointer ${
                  isConfigured 
                    ? "bg-slate-900 hover:bg-black text-white" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <LogIn className="h-4 w-4 text-blue-400" />
                <span>Launch Embedded Signup Simulator</span>
              </button>
              {!isConfigured && (
                <p className="text-[10px] text-rose-600 font-medium mt-2">
                  ⚠️ Prerequisites: App credentials configuration must be saved first to enable the signup module.
                </p>
              )}
            </div>

          </div>

          {/* Column 3: Webhooks & Connected Accounts */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Real Webhook Parameters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Link2 className="h-4 w-4 text-blue-600" />
                <span>WhatsApp Webhook Subscriptions</span>
              </h3>
              
              <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                Copy and register these variables inside your <strong>Meta App Dashboard (WhatsApp &rarr; Configuration)</strong> to forward active messaging events instantly:
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Webhook Callback URL</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(webhookUrl, "webhookUrl")}
                      className="text-blue-600 hover:text-blue-800 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                    >
                      {copiedField === "webhookUrl" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedField === "webhookUrl" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] text-slate-700 truncate select-all">
                    {webhookUrl}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Webhook Verify Token</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(webhookVerifyToken, "verifyToken")}
                      className="text-blue-600 hover:text-blue-800 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                    >
                      {copiedField === "verifyToken" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedField === "verifyToken" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px] text-slate-700 truncate select-all">
                    {webhookVerifyToken || "verify_token_alpha_12345"}
                  </div>
                </div>
              </div>
            </div>

            {/* Currently Connected WABA lines */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>Connected Numbers ({connectedNumbers.length})</span>
                </span>
                <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 font-mono rounded-full font-bold">
                  Active lines
                </span>
              </h3>

              <div className="space-y-3">
                {connectedNumbers.map((num) => (
                  <div key={num.id} className="p-3 border border-slate-100 hover:border-slate-200 rounded-xl bg-slate-50/50 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 font-sans">{num.verifiedName}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {num.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{num.displayPhoneNumber}</div>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-400">
                      <span>Quality: <span className="text-emerald-600 font-bold">{num.qualityRating}</span></span>
                      <span>Category: <span className="text-blue-600 font-bold">{num.limitCategory}</span></span>
                    </div>
                  </div>
                ))}

                {connectedNumbers.length === 0 && (
                  <div className="text-center py-6">
                    <Phone className="h-6 w-6 mx-auto text-slate-300 mb-2" />
                    <p className="text-[11px] text-slate-400">No WhatsApp lines connected yet.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Meta Embedded Signup Modal Simulator Dialogue */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Simulator Header with Facebook Meta Branding */}
            <div className="bg-blue-600 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-extrabold text-base">f</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-none">Meta Embedded Signup Platform</h4>
                  <span className="text-[10px] text-blue-100 font-mono">App Client ID: {appId}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSignupModal(false);
                  setSignupStep(1);
                }}
                className="text-blue-100 hover:text-white font-bold text-xs p-1 px-2.5 bg-blue-700/60 hover:bg-blue-700 rounded-lg transition cursor-pointer"
              >
                Cancel Setup
              </button>
            </div>

            {/* Steps tracker */}
            <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-semibold shrink-0">
              <span className={signupStep === 1 ? "text-blue-600 font-bold" : ""}>1. Sign in</span>
              <span>&amp;rarr;</span>
              <span className={signupStep === 2 ? "text-blue-600 font-bold" : ""}>2. Profile Detail</span>
              <span>&amp;rarr;</span>
              <span className={signupStep === 3 ? "text-blue-600 font-bold" : ""}>3. SMS Verification</span>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              
              {signupStep === 1 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <LogIn className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-950 text-sm">Log in with Facebook</h5>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-normal">
                      Connect BouuZ to your Facebook account to import your Meta Business Portfolios and manage WhatsApp accounts.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-left text-slate-500 space-y-1">
                    <p className="font-bold text-slate-700">BouuZ is requesting permissions to:</p>
                    <p>&bull; Manage your WhatsApp Business Accounts (WABA)</p>
                    <p>&bull; Read and write WhatsApp business assets and profile info</p>
                    <p>&bull; Access Facebook basic developer profile settings</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSignupStep(2)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer"
                  >
                    Continue as Pramod Kumar
                  </button>
                </div>
              )}

              {signupStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h5 className="font-bold text-slate-950 text-sm">Select WABA Asset Details</h5>
                    <p className="text-[11px] text-slate-500">
                      Select which Meta Business Portfolio and WhatsApp profile you want to register in this tenant.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                        Meta Business Portfolio
                      </label>
                      <select
                        value={selectedBusiness}
                        onChange={(e) => setSelectedBusiness(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none"
                      >
                        <option value="Alpha Logistics Meta">Alpha Logistics Meta Portfolio (ID: b_9381029)</option>
                        <option value="Bouuz Testing Portfolio">Bouuz Partner Portfolio (ID: b_3810482)</option>
                        <option value="New Meta Portfolio">Create New Meta Business Profile</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                          WABA Display Name
                        </label>
                        <input
                          type="text"
                          value={simVerifiedName}
                          onChange={(e) => setSimVerifiedName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                          WhatsApp Phone Number
                        </label>
                        <input
                          type="text"
                          value={simPhoneNumber}
                          onChange={(e) => setSimPhoneNumber(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-[9px] text-slate-400">
                      <div>
                        <span className="block font-bold">WABA ID (Meta assigned)</span>
                        <input
                          type="text"
                          value={simWabaId}
                          onChange={(e) => setSimWabaId(e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-[10px] text-slate-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="block font-bold">Phone Number ID</span>
                        <input
                          type="text"
                          value={simPhoneId}
                          onChange={(e) => setSimPhoneId(e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-[10px] text-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(true);
                        setSignupStep(3);
                      }}
                      className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Next: Verify Number
                    </button>
                  </div>
                </div>
              )}

              {signupStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h5 className="font-bold text-slate-950 text-sm">2-Factor Phone Verification</h5>
                    <p className="text-[11px] text-slate-500">
                      Meta needs to verify that you own the WhatsApp line <strong>{simPhoneNumber}</strong> via SMS pin.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-100 text-amber-950 rounded-2xl text-xs space-y-1.5">
                    <p className="font-bold">🔑 Simulated OTP Code:</p>
                    <p>Enter the security OTP code <strong>998811</strong> below to verify the WhatsApp Business number challenge.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      SMS Verification Code (OTP)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 998811"
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value);
                        setOtpError("");
                      }}
                      maxLength={6}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-lg font-bold font-mono tracking-widest text-slate-900 focus:outline-none"
                    />
                    {otpError && (
                      <span className="text-[10px] text-rose-600 font-bold block mt-1">{otpError}</span>
                    )}
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSignupStep(2)}
                      className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (otpCode.trim() !== "998811") {
                          setOtpError("Error: Invalid verification PIN. Enter the simulated code 998811 to test.");
                          return;
                        }
                        handleCompleteEmbeddedSignup();
                      }}
                      className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Complete Registration
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
