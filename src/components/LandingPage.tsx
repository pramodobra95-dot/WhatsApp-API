/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  ShieldCheck, 
  Zap, 
  Check, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Calendar, 
  Video, 
  MessageSquare, 
  Code, 
  Database, 
  Sparkles, 
  Play, 
  Users, 
  Mail, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  Clock, 
  Activity, 
  Webhook, 
  Smartphone,
  TrendingUp,
  Cpu,
  RefreshCw,
  Send,
  Sliders,
  Terminal,
  ArrowUpRight,
  UserCheck
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

interface LandingPageProps {
  onLoginSuccess: (user: { id: string; email: string; name: string; role: "super_admin" | "tenant_admin" | "manager" | "agent" | "viewer"; tenantId: string; permissions: string[] }) => void;
}

export default function LandingPage({ onLoginSuccess }: LandingPageProps) {
  // Navigation & Screen control
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Demo Scheduler State
  const [bookingStep, setBookingStep] = useState<"form" | "success">("form");
  const [selectedDate, setSelectedDate] = useState<string>("2026-07-20");
  const [selectedTime, setSelectedTime] = useState<string>("10:00 AM");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [crmType, setCrmType] = useState("hubspot");
  const [bookingWebhookLogs, setBookingWebhookLogs] = useState<string>("");

  // Running Dashboard State & Simulation Controllers
  const [dashboardTab, setDashboardTab] = useState<"analytics" | "chat_simulator" | "automation_builder" | "webhook_terminal">("analytics");
  const [trafficMode, setTrafficMode] = useState<"low" | "medium" | "peak">("medium");
  const [simulatedLiveTick, setSimulatedLiveTick] = useState(0);

  // Live ticking metrics
  const [sentCount, setSentCount] = useState(48210);
  const [deliveredCount, setDeliveredCount] = useState(47980);
  const [qualifiedCount, setQualifiedCount] = useState(8340);
  const [revenueScore, setRevenueScore] = useState(384500);
  
  // Highlight flash states for live ticks
  const [sentFlashed, setSentFlashed] = useState(false);
  const [deliveredFlashed, setDeliveredFlashed] = useState(false);
  const [qualifiedFlashed, setQualifiedFlashed] = useState(false);
  const [revenueFlashed, setRevenueFlashed] = useState(false);

  // Interactive BANT Chat Simulator state
  const [customInput, setCustomInput] = useState("");
  const [chatBotStatus, setChatBotStatus] = useState<"idle" | "typing" | "analyzing">("idle");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "bot" | "system"; text: string; time: string }>>([
    { sender: "bot", text: "Welcome to BouuZ AI demonstration workspace! I qualify incoming leads via WhatsApp. Try sending me details about your budget or product timeline to see BANT scoring live.", time: "10:10 AM" }
  ]);
  const [bantIndicators, setBantIndicators] = useState({
    budget: { status: "missing", val: "Unspecified", icon: "🔴" },
    authority: { status: "missing", val: "Unspecified", icon: "🔴" },
    need: { status: "missing", val: "Unspecified", icon: "🔴" },
    timeline: { status: "missing", val: "Unspecified", icon: "🔴" }
  });

  // Outbound Webhook Terminal Logs state
  const [terminalLogs, setTerminalLogs] = useState<Array<{ id: string; time: string; type: "info" | "success" | "warn" | "payload"; msg: string }>>([
    { id: "1", time: "10:10:02", type: "info", msg: "Initializing BouuZ AI Gateway Node Alpha..." },
    { id: "2", time: "10:10:03", type: "success", msg: "Secure database schema isolated successfully for tenant-alpha" },
    { id: "3", time: "10:10:05", type: "info", msg: "Webhook listener established at port 3000 /api/routing-rules" },
    { id: "4", time: "10:10:15", type: "payload", msg: `{"event": "ping", "tenant": "tenant-alpha", "provider": "Meta Cloud API", "ping_ms": 142}` }
  ]);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Recharts Dynamic Data representing actual data in Dashboard.tsx
  const getChartData = () => {
    const baseMult = trafficMode === "low" ? 0.6 : trafficMode === "peak" ? 1.5 : 1.0;
    return [
      { name: "Mon", Sent: Math.round(1200 * baseMult), Delivered: Math.round(1180 * baseMult), BANT_Qualified: Math.round(210 * baseMult) },
      { name: "Tue", Sent: Math.round(1400 * baseMult), Delivered: Math.round(1390 * baseMult), BANT_Qualified: Math.round(260 * baseMult) },
      { name: "Wed", Sent: Math.round(1800 * baseMult), Delivered: Math.round(1780 * baseMult), BANT_Qualified: Math.round(390 * baseMult) },
      { name: "Thu", Sent: Math.round(1600 * baseMult), Delivered: Math.round(1590 * baseMult), BANT_Qualified: Math.round(310 * baseMult) },
      { name: "Fri", Sent: Math.round(2100 * baseMult), Delivered: Math.round(2095 * baseMult), BANT_Qualified: Math.round(520 * baseMult) },
      { name: "Sat", Sent: Math.round(950 * baseMult), Delivered: Math.round(940 * baseMult), BANT_Qualified: Math.round(180 * baseMult) },
      { name: "Sun", Sent: Math.round(1100 * baseMult), Delivered: Math.round(1090 * baseMult), BANT_Qualified: Math.round(220 * baseMult) },
    ];
  };

  // Live metrics simulation loop
  useEffect(() => {
    const metricsInterval = setInterval(() => {
      const incrementSent = Math.floor(Math.random() * 3) + 1; // +1 to +3
      const incrementDelivered = incrementSent - (Math.random() > 0.85 ? 1 : 0);
      const isQualified = Math.random() > 0.70;
      
      setSentCount(prev => {
        setSentFlashed(true);
        setTimeout(() => setSentFlashed(false), 800);
        return prev + incrementSent;
      });

      setDeliveredCount(prev => {
        setDeliveredFlashed(true);
        setTimeout(() => setDeliveredFlashed(false), 800);
        return prev + incrementDelivered;
      });

      if (isQualified) {
        setQualifiedCount(prev => {
          setQualifiedFlashed(true);
          setTimeout(() => setQualifiedFlashed(false), 800);
          return prev + 1;
        });
        
        const dealAdded = Math.floor(Math.random() * 450) + 150;
        setRevenueScore(prev => {
          setRevenueFlashed(true);
          setTimeout(() => setRevenueFlashed(false), 800);
          return prev + dealAdded;
        });

        // Add a log into terminal representing real-time qualifying events
        const timestamp = new Date().toTimeString().split(" ")[0];
        setTerminalLogs(prev => [
          ...prev.slice(-30),
          {
            id: String(Date.now()),
            time: timestamp,
            type: "success",
            msg: `Lead Auto-Qualified! Synced metadata value of $${dealAdded} to CRM webhook gateway`
          }
        ]);
      }
    }, 4000);

    return () => clearInterval(metricsInterval);
  }, []);

  // Webhook terminal autoscroll
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs, dashboardTab]);

  // Handle BANT analysis mock engine
  const runBantAnalysis = (userInputText: string) => {
    if (!userInputText.trim()) return;

    const timeString = new Date().toTimeString().substring(0, 5);
    const newChatHistory = [
      ...chatHistory,
      { sender: "user" as const, text: userInputText, time: timeString }
    ];
    setChatHistory(newChatHistory);
    setCustomInput("");
    setChatBotStatus("typing");

    // Add a log into webhook console
    const timestamp = new Date().toTimeString().split(" ")[0];
    setTerminalLogs(prev => [
      ...prev,
      { id: String(Date.now()), time: timestamp, type: "info", msg: `Received inbound WhatsApp payload content: "${userInputText}"` }
    ]);

    setTimeout(() => {
      // Analyze text patterns
      const textLower = userInputText.toLowerCase();
      const updatedBant = { ...bantIndicators };
      let matchedPillars: string[] = [];

      // 1. Budget detection
      if (textLower.match(/(\d+|budget|dollar|usd|cost|price|\$|capital|worth|pay)/)) {
        updatedBant.budget = {
          status: "verified",
          val: textLower.includes("$") || textLower.includes("budget") ? "Extracted ✔" : "High Intent ✔",
          icon: "🟢"
        };
        matchedPillars.push("Budget");
      }

      // 2. Authority detection
      if (textLower.match(/(manager|ceo|cto|founder|owner|director|vp|head|decision|authorized|team)/)) {
        updatedBant.authority = {
          status: "verified",
          val: "Decision Maker ✔",
          icon: "🟢"
        };
        matchedPillars.push("Authority");
      }

      // 3. Need detection
      if (textLower.match(/(need|want|look|integrate|scale|require|automation|solve|problem|crm|hubspot|whatsapp|deliver)/)) {
        updatedBant.need = {
          status: "verified",
          val: "High Fit ✔",
          icon: "🟢"
        };
        matchedPillars.push("Need");
      }

      // 4. Timeline detection
      if (textLower.match(/(week|month|now|asap|urgent|timeline|schedule|tomorrow|immediately|day|soon)/)) {
        updatedBant.timeline = {
          status: "verified",
          val: "Active Intent ✔",
          icon: "🟢"
        };
        matchedPillars.push("Timeline");
      }

      setBantIndicators(updatedBant);

      let botResponse = "";
      if (matchedPillars.length > 0) {
        botResponse = `Excellent details received. I've recognized your [${matchedPillars.join(" & ")}] requirements. `;
        if (updatedBant.budget.status === "verified" && updatedBant.need.status === "verified") {
          botResponse += "Our system rates you as a qualified target partner! Generating CRM pipeline record and routing to VIP live queue.";
        } else {
          botResponse += "Could you specify your estimated investment budget and who will make the final software procurement choice?";
        }
      } else {
        botResponse = "Understood. To help configure your WhatsApp CRM automation workflow, can you tell me more about your timeline and estimated monthly broadcast volume?";
      }

      setChatHistory(prev => [
        ...prev,
        { sender: "bot" as const, text: botResponse, time: timeString }
      ]);
      setChatBotStatus("idle");

      // Push final status webhook logs
      setTerminalLogs(prev => [
        ...prev,
        { 
          id: String(Date.now() + 1), 
          time: new Date().toTimeString().split(" ")[0], 
          type: matchedPillars.length > 0 ? "success" : "warn", 
          msg: `BANT qualification engine parsing complete. Pillars updated: [${matchedPillars.join(",") || "None"}]. Score calculated.` 
        }
      ]);
    }, 1200);
  };

  // Preset Chips
  const presetPrompts = [
    { text: "My monthly budget is $2000 & we are ready to scale immediately.", desc: "Budget + Timeline" },
    { text: "I'm Sarah, CEO of Zenith Media. Looking to sync WhatsApp with HubSpot.", desc: "Authority + Need" },
    { text: "Just general inquiries, wanted to see how the system behaves.", desc: "Low Intent" }
  ];

  // Handle Unified Login Form
  const handleUnifiedLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    setTimeout(() => {
      const emailLower = loginEmail.trim().toLowerCase();
      const pwd = loginPassword.trim();

      // 1. Super Admin Account
      if (emailLower === "admin@bouuz.com" && pwd === "admin") {
        onLoginSuccess({
          id: "super-admin-root",
          email: "admin@bouuz.com",
          name: "BouuZ Super Admin",
          role: "super_admin",
          tenantId: "tenant-alpha",
          permissions: ["super_dashboard", "super_tenants", "super_webhooks"]
        });
        setLoginLoading(false);
        setShowLoginModal(false);
        return;
      }

      // 2. Tenant Admin Account
      if (emailLower === "talentadmin@bouuz.com" && pwd === "talent") {
        onLoginSuccess({
          id: "user-admin-1",
          email: "talentadmin@bouuz.com",
          name: "Jessica Lopez (Talent Admin)",
          role: "tenant_admin",
          tenantId: "tenant-alpha",
          permissions: ["dashboard", "live_inbox", "campaigns", "templates", "chatbot_builder", "crm", "flows_automation", "billing", "open_api", "tenant_settings"]
        });
        setLoginLoading(false);
        setShowLoginModal(false);
        return;
      }

      // 3. Agent Account
      if (emailLower === "talent@bouuz.com" && pwd === "agent") {
        onLoginSuccess({
          id: "user-agent-1",
          email: "talent@bouuz.com",
          name: "Rohan Sharma (Talent)",
          role: "agent",
          tenantId: "tenant-alpha",
          permissions: ["live_inbox", "chatbot_builder"]
        });
        setLoginLoading(false);
        setShowLoginModal(false);
        return;
      }

      // Try reading custom staff from localStorage
      const tenantId = "tenant-alpha";
      const storedStaffRaw = localStorage.getItem(`bouuz_staff_${tenantId}`);
      if (storedStaffRaw) {
        try {
          const staffList = JSON.parse(storedStaffRaw);
          const found = staffList.find((s: any) => s.email.toLowerCase() === emailLower && s.password === pwd);
          if (found) {
            onLoginSuccess({
              id: found.id,
              email: found.email,
              name: found.name,
              role: found.role,
              tenantId: found.tenantId,
              permissions: found.permissions || ["live_inbox"]
            });
            setLoginLoading(false);
            setShowLoginModal(false);
            return;
          }
        } catch (err) {
          console.error("Failed parsing staff list:", err);
        }
      }

      setLoginError("Invalid Account Identifier (Email) or Password configuration.");
      setLoginLoading(false);
    }, 800);
  };

  // Auto Fill Login Helpers
  const fillCredentialAndLogin = (role: "super" | "admin" | "agent") => {
    if (role === "super") {
      setLoginEmail("admin@bouuz.com");
      setLoginPassword("admin");
    } else if (role === "admin") {
      setLoginEmail("talentadmin@bouuz.com");
      setLoginPassword("talent");
    } else {
      setLoginEmail("talent@bouuz.com");
      setLoginPassword("agent");
    }
  };

  // Handle Demo Scheduler Booking
  const handleScheduleDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !whatsappPhone) {
      alert("Please provide all required fields to book the strategy demo.");
      return;
    }

    setBookingStep("success");
    
    // Simulate Outbound Webhook Delivery logs to represent how BANTConfirm processes lead integration
    const payload = {
      event: "lead.demo_booked",
      timestamp: new Date().toISOString(),
      lead: {
        name: fullName,
        email: email,
        phone: whatsappPhone,
        integrationPreferred: crmType,
        selectedSlot: `${selectedDate} at ${selectedTime}`
      },
      verificationStatus: {
        BANT_Ready: true,
        whatsapp_reachable: "Verified Live (99.8%)",
        deliveryChannel: "BouuZ CRM Node"
      }
    };
    setBookingWebhookLogs(JSON.stringify(payload, null, 2));
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      
      {/* Glow Rings & Mesh Backdrops */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-10 w-[450px] h-[450px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo with "BouuZ AI" brand context */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-950/40 relative group overflow-hidden">
              <span className="text-white font-black text-sm relative z-10">B</span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white leading-none">BouuZ</span>
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">AI</span>
              </div>
              <span className="text-[8px] text-slate-400 tracking-wider font-mono font-bold block mt-0.5 uppercase">Omni-Channel Lead Node</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#running-dashboard" className="hover:text-emerald-400 text-emerald-400 transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live Dashboard View
            </a>
            <a href="#bant" className="hover:text-emerald-400 transition-colors">BANT Validation</a>
            <a href="#scheduler" className="hover:text-emerald-400 transition-colors">Book Strategy Demo</a>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center gap-3">
            <a 
              href="#scheduler" 
              className="text-xs font-semibold text-slate-300 hover:text-white transition px-3 py-2 hidden sm:block"
            >
              Get Demo Webhook
            </a>
            <button
              onClick={() => {
                setLoginError("");
                setShowLoginModal(true);
              }}
              className="bg-[#0f172a] border border-slate-700/80 hover:bg-[#1e293b] hover:border-slate-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-black cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5 text-emerald-400" /> Portal Login
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center relative">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-spin" /> Autonomous Qualification Channels are Now Active
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-5xl mx-auto">
          Broadcast WhatsApp Campaigns & Verify Leads via <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">Autonomous BANT Agents</span>
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm mt-6 max-w-3xl mx-auto leading-relaxed">
          Stop chasing dead-end leads. BouuZ AI engages WhatsApp prospects, qualifies their budget, authority, and needs in real-time, and automatically maps live records into HubSpot or Salesforce CRM instantly.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#running-dashboard"
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm px-7 py-4 rounded-xl transition-transform duration-200 transform hover:scale-[1.02] shadow-lg shadow-emerald-950/60 cursor-pointer flex items-center gap-2"
          >
            <Activity className="h-4.5 w-4.5 animate-pulse" /> Launch Live Preview Simulator
          </a>
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white font-bold text-xs sm:text-sm px-7 py-4 rounded-xl border border-slate-700/60 transition cursor-pointer flex items-center gap-2"
          >
            <Play className="h-4 w-4 text-emerald-400 fill-current" /> Access Live Workspace
          </button>
        </div>

        {/* Live floating stats representing actual system metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-5xl mx-auto">
          {[
            { 
              label: "Meta Webhook Latency", 
              value: "0.24 seconds", 
              desc: "Instant live synchronization", 
              icon: <Zap className="h-4 w-4 text-emerald-400" /> 
            },
            { 
              label: "BANT Match Accuracy", 
              value: "94.2% Rating", 
              desc: "Driven by Generative parsing", 
              icon: <UserCheck className="h-4 w-4 text-emerald-400" /> 
            },
            { 
              label: "Isolated Storage", 
              value: "Schema isolated", 
              desc: "100% tenant separation", 
              icon: <ShieldCheck className="h-4 w-4 text-emerald-400" /> 
            },
            { 
              label: "Active CRM Webhooks", 
              value: "14,821 Connected", 
              desc: "API gateway nodes live", 
              icon: <Webhook className="h-4 w-4 text-emerald-400" /> 
            }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/65 border border-slate-800/80 p-5 rounded-2xl text-left hover:border-slate-700 transition relative group">
              <div className="absolute right-3 top-3 opacity-30 group-hover:opacity-100 transition-opacity">
                {stat.icon}
              </div>
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
              <span className="block text-lg font-extrabold text-white mt-1.5 font-mono">{stat.value}</span>
              <span className="block text-[10px] text-slate-400 mt-1 leading-normal">{stat.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ACTUAL PLATFORM RUNNING DASHBOARD SECTION (High attraction) */}
      <section id="running-dashboard" className="bg-[#04080e] border-y border-slate-900 py-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03),transparent_60%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3">
              <Sliders className="h-3.5 w-3.5 text-emerald-400 animate-spin" /> Interactive Preview Node
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              BouuZ Actual Platform Dashboard Simulator
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              This interactive widget demonstrates the exact live view of WATI Enterprise, our multi-tenant dashboard system. Observe live ticking statistics, try the BANT qualifying chat, and check the webhook logs!
            </p>
          </div>

          {/* Actual system counters which slowly tick live */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-5xl mx-auto">
            
            <div className={`p-4 bg-slate-900/80 border rounded-2xl transition-all duration-500 ${sentFlashed ? "border-emerald-500 bg-emerald-950/20 shadow-lg" : "border-slate-800"}`}>
              <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <span>TOTAL DISPATCHED</span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1.5">{sentCount.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 mt-1">Outbound templates sent</div>
            </div>

            <div className={`p-4 bg-slate-900/80 border rounded-2xl transition-all duration-500 ${deliveredFlashed ? "border-emerald-500 bg-emerald-950/20 shadow-lg" : "border-slate-800"}`}>
              <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <span>DELIVERY RATING</span>
                <span className="text-emerald-400 font-bold">99.5%</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1.5">{deliveredCount.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 mt-1">Confirmed device arrivals</div>
            </div>

            <div className={`p-4 bg-slate-900/80 border rounded-2xl transition-all duration-500 ${qualifiedFlashed ? "border-emerald-500 bg-emerald-950/20 shadow-lg" : "border-slate-800"}`}>
              <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <span>BANT QUALIFIED</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1 py-0.5 rounded font-bold">HIGH FIT</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1.5 text-emerald-400">{qualifiedCount.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 mt-1">AI-extracted prospect logs</div>
            </div>

            <div className={`p-4 bg-slate-900/80 border rounded-2xl transition-all duration-500 ${revenueFlashed ? "border-emerald-500 bg-emerald-950/20 shadow-lg" : "border-slate-800"}`}>
              <div className="flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <span>VERIFIED CRM VAL</span>
                <span className="text-emerald-400 font-bold">USD</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1.5 text-yellow-400">${revenueScore.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 mt-1">Automatic CRM deal volumes</div>
            </div>

          </div>

          {/* Interactive Frame wrapper */}
          <div className="bg-[#0b101c] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black max-w-5xl mx-auto">
            
            {/* Top Bar with tab controls */}
            <div className="bg-[#070b13] px-4 py-3 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 self-start">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono ml-2">
                  <span className="text-slate-400">workspace/</span>
                  <span className="text-emerald-400 font-bold">tenant-alpha</span>
                  <span className="bg-slate-900 border border-slate-800 text-[8px] px-1.5 py-0.5 rounded text-slate-400">Enterprise</span>
                </div>
              </div>

              {/* Tabs representing different screens of actual app */}
              <div className="flex flex-wrap gap-1 bg-[#0f172a] p-1 rounded-xl border border-slate-800/60 max-w-full">
                <button
                  onClick={() => setDashboardTab("analytics")}
                  className={`text-[9px] sm:text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    dashboardTab === "analytics" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <TrendingUp className="h-3 w-3" /> Live Analytics
                </button>
                <button
                  onClick={() => setDashboardTab("chat_simulator")}
                  className={`text-[9px] sm:text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    dashboardTab === "chat_simulator" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <MessageSquare className="h-3 w-3" /> BANT AI Chat
                </button>
                <button
                  onClick={() => setDashboardTab("automation_builder")}
                  className={`text-[9px] sm:text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    dashboardTab === "automation_builder" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Cpu className="h-3 w-3" /> Automation Nodes
                </button>
                <button
                  onClick={() => setDashboardTab("webhook_terminal")}
                  className={`text-[9px] sm:text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    dashboardTab === "webhook_terminal" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Terminal className="h-3 w-3" /> Webhook Terminal
                </button>
              </div>
            </div>

            {/* TAB CONTENT SPANS */}
            <div className="min-h-[400px] p-4 sm:p-6 bg-[#080d17] text-slate-300">
              
              {/* TAB 1: ANALYTICS (REAL RECHARTS AREA CHART SHOWN LIVE) */}
              {dashboardTab === "analytics" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Live Traffic Feed</span>
                      <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">WhatsApp Transmission Waveform</h4>
                    </div>

                    <div className="flex items-center gap-2 select-none self-end">
                      <span className="text-[9px] font-mono text-slate-400">Simulation Scale:</span>
                      <div className="flex bg-slate-950 p-0.5 border border-slate-800 rounded-lg">
                        {(["low", "medium", "peak"] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setTrafficMode(mode)}
                            className={`text-[9px] font-extrabold px-2 py-1 rounded capitalize ${
                              trafficMode === mode ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recharts responsive area container */}
                  <div className="h-[250px] w-full bg-slate-950/45 p-3 rounded-xl border border-slate-800/50">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorBant" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "11px" }}
                          labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                        />
                        <Area type="monotone" dataKey="Sent" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" />
                        <Area type="monotone" dataKey="BANT_Qualified" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBant)" />
                        <Legend wrapperStyle={{ fontSize: "10px", marginTop: "5px" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-2">
                    <div className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl">
                      <span className="block text-[8px] text-slate-500 font-bold uppercase font-mono">Conversion Ratio</span>
                      <span className="text-base font-extrabold text-slate-200 mt-1 block">17.3% BANT qualified</span>
                    </div>
                    <div className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl">
                      <span className="block text-[8px] text-slate-500 font-bold uppercase font-mono">Meta Endpoint API</span>
                      <span className="text-base font-extrabold text-emerald-400 mt-1 block flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 100% Operational
                      </span>
                    </div>
                    <div className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl">
                      <span className="block text-[8px] text-slate-500 font-bold uppercase font-mono">Isolated DB Instance</span>
                      <span className="text-base font-extrabold text-indigo-400 mt-1 block">PostgreSQL schema level</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INTERACTIVE BANT CHATBOT SIMULATOR (Extremely engaging) */}
              {dashboardTab === "chat_simulator" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-fade-in">
                  
                  {/* Conversations queue simulator column */}
                  <div className="md:col-span-8 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col justify-between overflow-hidden">
                    
                    {/* Inbox subheader */}
                    <div className="bg-slate-900/60 p-3 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                        <span className="text-xs font-bold text-slate-200">Active Session: +1 (312) 555-8941</span>
                      </div>
                      <span className="bg-emerald-950 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded border border-emerald-900">
                        BouuZ AI Agent Listening
                      </span>
                    </div>

                    {/* Chat log wrapper */}
                    <div className="p-4 space-y-3 h-[210px] overflow-y-auto">
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : msg.sender === "system" ? "justify-center" : "justify-start"}`}>
                          {msg.sender === "system" ? (
                            <span className="text-[9px] font-mono bg-slate-900 px-2 py-1 rounded text-slate-500">{msg.text}</span>
                          ) : (
                            <div className={`p-2.5 rounded-xl max-w-[80%] text-xs leading-normal ${
                              msg.sender === "user" 
                                ? "bg-emerald-600 text-white" 
                                : "bg-slate-900 border border-slate-800 text-slate-200"
                            }`}>
                              <span className="block font-medium">{msg.text}</span>
                              <span className="block text-[8px] text-slate-400 mt-1.5 text-right">{msg.time}</span>
                            </div>
                          )}
                        </div>
                      ))}

                      {chatBotStatus === "typing" && (
                        <div className="flex justify-start">
                          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Trigger Chips */}
                    <div className="px-4 pb-2">
                      <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 font-mono">Test Preset Leads (Click to trigger)</span>
                      <div className="flex flex-wrap gap-1.5">
                        {presetPrompts.map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => runBantAnalysis(chip.text)}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-[10px] text-slate-300 px-2.5 py-1 rounded-lg text-left transition hover:border-emerald-500/50 cursor-pointer"
                          >
                            <span className="block font-semibold">{chip.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chat Text Input field */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        runBantAnalysis(customInput);
                      }} 
                      className="p-3 border-t border-slate-800 bg-slate-900/40 flex items-center gap-2"
                    >
                      <input 
                        type="text" 
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Type any reply (e.g. 'Yes, I am decision maker, looking to integrate by next week')"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-600 font-sans"
                      />
                      <button 
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        Send <Send className="h-3 w-3" />
                      </button>
                    </form>

                  </div>

                  {/* Real-time BANT Scorecard column (Super attractive) */}
                  <div className="md:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xs uppercase tracking-wider border-b border-slate-900 pb-2.5 mb-3.5">
                        <Sparkles className="h-4 w-4 text-emerald-400" /> BANT Scorecard
                      </div>

                      <div className="space-y-3.5">
                        {[
                          { key: "budget", label: "Budget", desc: "Capital matched or specified", detail: bantIndicators.budget },
                          { key: "authority", label: "Authority", desc: "Direct stakeholder verified", detail: bantIndicators.authority },
                          { key: "need", label: "Need", desc: "Integration fit confirmed", detail: bantIndicators.need },
                          { key: "timeline", label: "Timeline", desc: "Purchase window declared", detail: bantIndicators.timeline }
                        ].map((row) => (
                          <div key={row.key} className={`p-2.5 rounded-xl border transition-colors ${row.detail.status === 'verified' ? 'bg-emerald-950/10 border-emerald-500/30' : 'bg-slate-900/30 border-slate-900'}`}>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span className="text-sm">{row.detail.icon}</span> {row.label}
                              </span>
                              <span className={`text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded ${
                                row.detail.status === 'verified' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-850 text-slate-500'
                              }`}>
                                {row.detail.val}
                              </span>
                            </div>
                            <span className="block text-[9px] text-slate-500 mt-1">{row.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-3 mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setBantIndicators({
                            budget: { status: "missing", val: "Unspecified", icon: "🔴" },
                            authority: { status: "missing", val: "Unspecified", icon: "🔴" },
                            need: { status: "missing", val: "Unspecified", icon: "🔴" },
                            timeline: { status: "missing", val: "Unspecified", icon: "🔴" }
                          });
                          setChatHistory([
                            { sender: "bot", text: "Scorecard cleared! Try typing details containing a budget or urgent schedule again.", time: "10:10 AM" }
                          ]);
                        }}
                        className="w-full text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white py-1.5 rounded-lg border border-slate-800 transition text-center cursor-pointer"
                      >
                        Reset Simulator Scorecard
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: VISUAL AUTOMATION NODE CANVAS */}
              {dashboardTab === "automation_builder" && (
                <div className="space-y-4 animate-fade-in relative">
                  
                  {/* Canvas header info */}
                  <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Node Logic Designer</span>
                      <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">BANT Automatic Handover Flow</h4>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wide">
                      Compiled (Flow Active)
                    </span>
                  </div>

                  {/* Flow Diagram Mock Canvas */}
                  <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-around gap-6 min-h-[220px]">
                    
                    {/* Background grid representation */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

                    {/* Node 1: Webhook Ingestion */}
                    <div className="bg-[#0b1329] border-2 border-blue-500/50 p-3 rounded-xl w-44 text-center shadow-lg relative z-10 hover:border-blue-400 transition">
                      <div className="bg-blue-500/10 w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 mx-auto mb-2 border border-blue-500/20">
                        <Webhook className="h-4 w-4" />
                      </div>
                      <span className="block text-[9px] uppercase font-bold text-blue-400 font-mono">1. API Inbound</span>
                      <span className="block text-xs font-bold text-white mt-0.5">WhatsApp Trigger</span>
                      <span className="block text-[8px] text-slate-500 mt-1">Accepts live customer JSON payload</span>
                    </div>

                    {/* Glowing animated line simulator */}
                    <div className="h-6 w-0.5 md:h-0.5 md:w-12 bg-gradient-to-r from-blue-500 to-emerald-500 relative flex items-center justify-center">
                      <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    </div>

                    {/* Node 2: AI BANT Verification Node */}
                    <div className="bg-[#0b1329] border-2 border-emerald-500 p-3.5 rounded-xl w-48 text-center shadow-lg relative z-10 hover:border-emerald-400 transition animate-pulse">
                      <div className="bg-emerald-500/10 w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 mx-auto mb-2 border border-emerald-500/20">
                        <Bot className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="block text-[9px] uppercase font-bold text-emerald-400 font-mono">2. AI Gatekeeper</span>
                      <span className="block text-xs font-bold text-white mt-0.5">BANT Parser</span>
                      <span className="block text-[8px] text-slate-400 mt-1">Evaluates Budget & Authority live</span>
                    </div>

                    {/* Glowing animated line simulator */}
                    <div className="h-6 w-0.5 md:h-0.5 md:w-12 bg-gradient-to-r from-emerald-500 to-indigo-500 relative flex items-center justify-center">
                      <span className="absolute w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                    </div>

                    {/* Node 3: Sync to HubSpot */}
                    <div className="bg-[#0b1329] border-2 border-indigo-500/50 p-3 rounded-xl w-44 text-center shadow-lg relative z-10 hover:border-indigo-400 transition">
                      <div className="bg-indigo-500/10 w-8 h-8 rounded-lg flex items-center justify-center text-indigo-400 mx-auto mb-2 border border-indigo-500/20">
                        <Database className="h-4 w-4" />
                      </div>
                      <span className="block text-[9px] uppercase font-bold text-indigo-400 font-mono">3. CRM Handover</span>
                      <span className="block text-xs font-bold text-white mt-0.5">HubSpot API Post</span>
                      <span className="block text-[8px] text-slate-500 mt-1">Pushes qualified profile metrics</span>
                    </div>

                  </div>

                  <p className="text-[10px] text-slate-500 text-center font-mono select-none">
                    💡 Signal packets transmit through this visual pipeline automatically when clients speak on WhatsApp.
                  </p>
                </div>
              )}

              {/* TAB 4: WEBHOOK LOGS TERMINAL */}
              {dashboardTab === "webhook_terminal" && (
                <div className="space-y-4 animate-fade-in font-mono">
                  
                  <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                      <span className="text-[10px] uppercase font-bold text-slate-300">Live API Ingestion Console</span>
                    </div>
                    <button
                      onClick={() => {
                        const timestamp = new Date().toTimeString().split(" ")[0];
                        setTerminalLogs([
                          { id: String(Date.now()), time: timestamp, type: "info", msg: "Cleared console buffer logs." }
                        ]);
                      }}
                      className="text-[9px] bg-slate-950 hover:bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-400 transition"
                    >
                      Clear Log
                    </button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-[10px] text-slate-300 h-[220px] overflow-y-auto space-y-1.5 scrollbar-thin">
                    {terminalLogs.map((log) => (
                      <div key={log.id} className="leading-relaxed">
                        <span className="text-slate-500">[{log.time}]</span>{" "}
                        <span className={`font-bold ${
                          log.type === "success" 
                            ? "text-emerald-400" 
                            : log.type === "warn" 
                            ? "text-amber-400" 
                            : log.type === "payload"
                            ? "text-sky-400"
                            : "text-slate-400"
                        }`}>
                          {log.type.toUpperCase()}:
                        </span>{" "}
                        <span className={log.type === "payload" ? "text-slate-400 block ml-4 pl-2 border-l border-slate-800" : "text-slate-200"}>
                          {log.msg}
                        </span>
                      </div>
                    ))}
                    <div ref={terminalBottomRef} />
                  </div>
                </div>
              )}

            </div>

            {/* Simulated Live status bar */}
            <div className="bg-[#070b13] px-5 py-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 select-none">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Live BouuZ Engine: Simulation Active
              </span>
              <span>Click on BANT Chat tab or Webhook Terminal tab to interact</span>
            </div>

          </div>

        </div>
      </section>

      {/* WHAT IS BANT / VALUE VALUE PROP */}
      <section id="bant" className="bg-[#070b14] py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Qualify Leads Instantly with Autonomous BANT Criteria
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-3 leading-relaxed">
              Don't waste expensive sales call cycles on window shoppers. Let BouuZ Conversational AI evaluate prospect interest before booking human calendar slots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { letter: "B", title: "Budget Qualification", desc: "Our AI gently maps pricing questions to extract the buyer's budget scale and financial range.", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
              { letter: "A", title: "Authority Verification", desc: "Filters out casual researchers and detects if the contact holds direct decision-making power.", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
              { letter: "N", title: "Need & Urgency Analysis", desc: "Discovers the precise operations bottlenecks of the user and maps specific product fits.", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
              { letter: "T", title: "Timeline Allocation", desc: "Locks down the onboarding target date, highlighting ASAP buyers for immediate routing.", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
            ].map((pillar, idx) => (
              <div key={idx} className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition duration-300">
                <span className={`inline-flex w-11 h-11 items-center justify-center rounded-xl text-xl font-black font-mono border ${pillar.color} mb-4`}>
                  {pillar.letter}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">{pillar.title}</h3>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>

          {/* BANT Flow visualization */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 mt-12 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">Enterprise Automated Lead Scoring</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                As soon as our WhatsApp chatbot marks BANT criteria as met, our backend immediately pushes the customer profile, custom fields, and conversation transcript to your central CRM hub using the Secure Open API key.
              </p>
            </div>
            <a 
              href="#scheduler" 
              className="bg-slate-800 border border-slate-700 hover:bg-slate-700 transition text-xs font-bold px-4 py-2.5 rounded-xl text-slate-200 shrink-0 text-center"
            >
              Configure Integration
            </a>
          </div>

        </div>
      </section>

      {/* SCHEDULE DEMO FORM WITH CALENDAR */}
      <section id="scheduler" className="bg-[#04080e] py-20 border-t border-slate-900 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Schedule Your Free Strategy Demonstration
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Choose an available date and time slot below, and BouuZ will schedule a personalized live showcase of the platform tailored to your sales process.
            </p>
          </div>

          <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            {bookingStep === "form" ? (
              <form onSubmit={handleScheduleDemo} className="space-y-6">
                
                {/* Time & Date selector row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Strategy Call Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-[#070a12] border border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Strategy Call Time</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full bg-[#070a12] border border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    >
                      <option value="09:00 AM">09:00 AM (EST)</option>
                      <option value="10:00 AM">10:00 AM (EST)</option>
                      <option value="11:30 AM">11:30 AM (EST)</option>
                      <option value="02:00 PM">02:00 PM (EST)</option>
                      <option value="03:30 PM">03:30 PM (EST)</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-800/60 my-6"></div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Your Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Jessica Lopez" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#070a12] border border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Work Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. jessica@company.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#070a12] border border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">WhatsApp Contact Number (with country code)</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +14155552671" 
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="w-full bg-[#070a12] border border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Business CRM System</label>
                    <select
                      value={crmType}
                      onChange={(e) => setCrmType(e.target.value)}
                      className="w-full bg-[#070a12] border border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="hubspot">HubSpot CRM</option>
                      <option value="salesforce">Salesforce Cloud</option>
                      <option value="zoho">Zoho CRM</option>
                      <option value="webhooks">Custom Rest API Gateway</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm py-3.5 rounded-xl transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  <Check className="h-4 w-4" /> Schedule Strategy Call & Provision Sandbox
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-6 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                  <Check className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Strategy Demo Call Scheduled!</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    A confirmation link and automated invite has been queued to reach you on <strong className="text-emerald-400 font-mono font-bold">{whatsappPhone}</strong>.
                  </p>
                </div>

                {/* Simulated Webhook logs */}
                <div className="bg-[#070a12] border border-slate-800 p-4 rounded-xl text-left font-mono text-[10px] space-y-2 max-w-xl mx-auto">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-slate-500">
                    <span>OUTBOUND CRM WEBHOOK TRANSACTION LOG</span>
                    <span className="text-emerald-400">STATUS: 201 CREATED</span>
                  </div>
                  <pre className="text-sky-400 overflow-x-auto leading-normal">
                    {bookingWebhookLogs}
                  </pre>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFullName("");
                    setEmail("");
                    setWhatsappPhone("");
                    setBookingStep("form");
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs px-5 py-2.5 rounded-lg border border-slate-700 transition cursor-pointer"
                >
                  Schedule Another Slot
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#04080e] py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">B</div>
            <span className="font-bold text-sm tracking-tight text-white">BouuZ AI</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed">
            Autonomous qualification channels and secure database-isolated tenant systems powered by standard REST API webhooks.
          </p>
          <div className="border-t border-slate-900/40 pt-6 mt-6 flex flex-wrap justify-center gap-6 text-[11px]">
            <span>© 2026 BouuZ AI Systems. All rights reserved.</span>
            <span className="text-slate-400">Powered by BANTConfirm Integration Engine</span>
          </div>
        </div>
      </footer>

      {/* UNIFIED SINGLE LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04080e]/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative bg-[#0d1222] border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-scale-up my-8">
            
            {/* Close button */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 p-1.5 rounded-lg transition"
            >
              ✕
            </button>

            {/* Title */}
            <div className="text-center mb-6">
              <div className="inline-flex h-11 w-11 items-center justify-center bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl shadow-lg border border-emerald-500/20 mb-3">
                <span className="text-white text-lg font-black">B</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <h2 className="text-xl font-bold text-white">BouuZ Platform Portal</h2>
                <span className="bg-emerald-400 text-slate-950 text-[9px] font-black px-1 rounded">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Single Gateway for all Roles</p>
            </div>

            {/* Error alerts */}
            {loginError && (
              <div className="bg-rose-500/15 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-3 mb-4 leading-relaxed">
                ⚠️ {loginError}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleUnifiedLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  User Account Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#070a12] border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Secret Account Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#070a12] border border-slate-800 rounded-xl py-2.5 pl-9 pr-9 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {loginLoading ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Unlock Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Sandbox Login helper options */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3 text-center">
                Select Demo Role Account to Autofill
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentialAndLogin("super")}
                  className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-center hover:border-emerald-500/50 transition cursor-pointer"
                >
                  <span className="block text-[9px] font-bold text-yellow-400 uppercase">Super Admin</span>
                  <span className="block text-[8px] text-slate-500 mt-0.5">Control deck</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentialAndLogin("admin")}
                  className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-center hover:border-emerald-500/50 transition cursor-pointer"
                >
                  <span className="block text-[9px] font-bold text-emerald-400 uppercase">Tenant Admin</span>
                  <span className="block text-[8px] text-slate-500 mt-0.5">Full access</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentialAndLogin("agent")}
                  className="bg-[#0b0e17] border border-slate-800 p-2 rounded-lg text-center hover:border-emerald-500/50 transition cursor-pointer"
                >
                  <span className="block text-[9px] font-bold text-emerald-400 uppercase">Staff Agent</span>
                  <span className="block text-[8px] text-slate-500 mt-0.5">Chat-only</span>
                </button>
              </div>

              <div className="mt-4 text-center">
                <span className="text-[9px] text-slate-500 leading-normal block">
                  💡 Fill and login to access any workspace role in one click.
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
