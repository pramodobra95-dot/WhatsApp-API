/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Cpu
} from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: { id: string; email: string; name: string; role: "super_admin" | "tenant_admin" | "manager" | "agent" | "viewer"; tenantId: string; permissions: string[] }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Static/LocalStorage User Accounts Resolver
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    setTimeout(() => {
      const emailLower = email.trim().toLowerCase();
      const pwd = password.trim();

      // 1. Check Super Admin
      if (emailLower === "admin@bouuz.com" && pwd === "admin") {
        onLoginSuccess({
          id: "super-admin-root",
          email: "admin@bouuz.com",
          name: "BouuZ Super Admin",
          role: "super_admin",
          tenantId: "tenant-alpha",
          permissions: ["super_dashboard", "super_tenants", "super_webhooks"]
        });
        setLoading(false);
        return;
      }

      // 2. Check tenant-specific accounts from localStorage
      const tenantId = "tenant-alpha"; // Default sandbox tenant
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
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed to parse staff from storage:", err);
        }
      }

      // 3. Fallback defaults if localStorage is empty or hasn't loaded yet
      if (emailLower === "talentadmin@bouuz.com" && pwd === "talent") {
        onLoginSuccess({
          id: "user-admin-1",
          email: "talentadmin@bouuz.com",
          name: "Jessica Lopez (Talent Admin)",
          role: "tenant_admin",
          tenantId: "tenant-alpha",
          permissions: ["dashboard", "live_inbox", "campaigns", "templates", "chatbot_builder", "crm", "flows_automation", "billing"]
        });
      } else if (emailLower === "talent@bouuz.com" && pwd === "agent") {
        onLoginSuccess({
          id: "user-agent-1",
          email: "talent@bouuz.com",
          name: "Rohan Sharma (Talent)",
          role: "agent",
          tenantId: "tenant-alpha",
          permissions: ["live_inbox", "chatbot_builder"] // Restricted agent access
        });
      } else {
        setErrorMsg("Invalid User ID (Email) or Password. Please try again or use the quick login helpers.");
      }
      setLoading(false);
    }, 600);
  };

  // Quick Login Simulation Actions
  const handleQuickLogin = (roleType: "super" | "admin" | "agent") => {
    setLoading(true);
    setTimeout(() => {
      if (roleType === "super") {
        onLoginSuccess({
          id: "super-admin-root",
          email: "admin@bouuz.com",
          name: "BouuZ Super Admin",
          role: "super_admin",
          tenantId: "tenant-alpha",
          permissions: ["super_dashboard", "super_tenants", "super_webhooks"]
        });
      } else if (roleType === "admin") {
        onLoginSuccess({
          id: "user-admin-1",
          email: "talentadmin@bouuz.com",
          name: "Jessica Lopez (Talent Admin)",
          role: "tenant_admin",
          tenantId: "tenant-alpha",
          permissions: ["dashboard", "live_inbox", "campaigns", "templates", "chatbot_builder", "crm", "flows_automation", "billing"]
        });
      } else {
        onLoginSuccess({
          id: "user-agent-1",
          email: "talent@bouuz.com",
          name: "Rohan Sharma (Talent)",
          role: "agent",
          tenantId: "tenant-alpha",
          permissions: ["live_inbox", "chatbot_builder"]
        });
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-slate-900 font-sans p-6 relative overflow-hidden">
      
      {/* Decorative Brand Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>

      {/* Main Content Container */}
      <div className="w-full max-w-md z-10">
        
        {/* Logo and Brand Title */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center bg-blue-600 rounded-2xl shadow-xl border border-blue-500/30 mb-4 animate-bounce duration-[2000ms]">
            <span className="text-white text-2xl font-black font-sans">B</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none">BouuZ</h1>
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">
            Powered by <span className="text-blue-500 font-bold">BANT</span><span className="text-yellow-400 font-bold">Confirm</span>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-3xl p-8 shadow-2xl shadow-slate-950/50">
          
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="h-4 w-4 text-yellow-400" />
            <span>Secure Agent Login Gate</span>
          </h2>

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs rounded-xl p-3 mb-5 leading-relaxed font-sans">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                User Account ID / Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  required
                />
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Secret Access Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Unlock Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

                  {/* Quick Sandbox Login Helpers */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <span className="block text-[11px] font-bold uppercase text-slate-300 tracking-wider mb-4 text-center">
              🔑 System Access Credentials
            </span>
            
            <div className="space-y-3">
              {/* Super Admin Credentials Block */}
              <div className="bg-slate-900/60 border border-yellow-500/30 rounded-xl p-3 text-slate-300 hover:border-yellow-500/60 transition duration-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 font-bold text-yellow-400 text-xs">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Super Admin Access</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@bouuz.com");
                      setPassword("admin");
                    }}
                    className="text-[10px] bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 font-bold px-2 py-0.5 rounded cursor-pointer"
                  >
                    Auto Fill
                  </button>
                </div>
                <div className="font-mono text-[11px] space-y-0.5 text-slate-400">
                  <div>Email: <span className="text-white select-all">admin@bouuz.com</span></div>
                  <div>Password: <span className="text-white select-all">admin</span></div>
                </div>
              </div>

              {/* Tenant Admin Credentials Block */}
              <div className="bg-slate-900/40 border border-blue-500/20 rounded-xl p-3 text-slate-300 hover:border-blue-500/40 transition duration-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 font-bold text-blue-400 text-xs">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Tenant Admin (Jessica Lopez)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("talentadmin@bouuz.com");
                      setPassword("talent");
                    }}
                    className="text-[10px] bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 font-bold px-2 py-0.5 rounded cursor-pointer"
                  >
                    Auto Fill
                  </button>
                </div>
                <div className="font-mono text-[11px] space-y-0.5 text-slate-400">
                  <div>Email: <span className="text-white select-all">talentadmin@bouuz.com</span></div>
                  <div>Password: <span className="text-white select-all">talent</span></div>
                </div>
              </div>

              {/* Agent/User Credentials Block */}
              <div className="bg-slate-900/40 border border-emerald-500/20 rounded-xl p-3 text-slate-300 hover:border-emerald-500/40 transition duration-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400 text-xs">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Agent / Talent (Rohan Sharma)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("talent@bouuz.com");
                      setPassword("agent");
                    }}
                    className="text-[10px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold px-2 py-0.5 rounded cursor-pointer"
                  >
                    Auto Fill
                  </button>
                </div>
                <div className="font-mono text-[11px] space-y-0.5 text-slate-400">
                  <div>Email: <span className="text-white select-all">talent@bouuz.com</span></div>
                  <div>Password: <span className="text-white select-all">agent</span></div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="text-[10px] text-slate-500 leading-relaxed block">
                💡 Tip: Click <strong className="text-slate-400">Auto Fill</strong> next to any role, then click <strong className="text-slate-400">Unlock Workspace</strong> to log in.
              </span>
            </div>
          </div>

        </div>

        {/* Footer Credit */}
        <div className="text-center mt-6 text-[10px] text-slate-500 tracking-tight flex items-center justify-center gap-0.5 leading-none">
          <span className="font-semibold text-slate-400">Powered by</span>
          <span className="text-blue-500 font-extrabold">BANT</span>
          <span className="text-yellow-500 font-extrabold font-semibold">Confirm</span>
        </div>

      </div>

    </div>
  );
}
