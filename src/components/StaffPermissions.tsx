/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, 
  Lock, 
  Plus, 
  Trash2, 
  Shield, 
  CheckCircle2, 
  UserPlus, 
  Key, 
  RefreshCw, 
  Eye, 
  EyeOff,
  UserCheck
} from "lucide-react";
import { UserRole } from "../types";

export interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  password?: string;
  permissions: string[]; // List of tab IDs they can access
  status: "active" | "suspended";
}

interface StaffPermissionsProps {
  tenantId: string;
  currentUserId: string;
  onLoginAsUser?: (user: StaffMember) => void;
  maxUsersCount?: number;
}

export default function StaffPermissions({ tenantId, currentUserId, onLoginAsUser, maxUsersCount = 5 }: StaffPermissionsProps) {
  // Load staff from localStorage or initialize with high-fidelity defaults
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem(`bouuz_staff_${tenantId}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    
    // Default staff list
    const defaults: StaffMember[] = [
      { 
        id: "user-admin-1", 
        email: "talentadmin@bouuz.com", 
        name: "Jessica Lopez (Talent Admin)", 
        role: "tenant_admin", 
        tenantId, 
        password: "talent", 
        permissions: ["dashboard", "live_inbox", "campaigns", "templates", "chatbot_builder", "crm", "flows_automation", "billing"],
        status: "active" 
      },
      { 
        id: "user-agent-1", 
        email: "talent@bouuz.com", 
        name: "Rohan Sharma (Talent)", 
        role: "agent", 
        tenantId, 
        password: "agent", 
        permissions: ["live_inbox", "chatbot_builder"], // Default restricted permissions
        status: "active" 
      },
      { 
        id: "user-agent-2", 
        email: "priya@bouuz.com", 
        name: "Priya Patel", 
        role: "agent", 
        tenantId, 
        password: "agent", 
        permissions: ["live_inbox", "crm", "flows_automation"], 
        status: "active" 
      }
    ];
    localStorage.setItem(`bouuz_staff_${tenantId}`, JSON.stringify(defaults));
    return defaults;
  });

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("agent");
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState("");

  const saveStaff = (updated: StaffMember[]) => {
    setStaff(updated);
    localStorage.setItem(`bouuz_staff_${tenantId}`, JSON.stringify(updated));
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName || !newPassword) return;

    // Check account creation limit
    if (staff.length >= maxUsersCount) {
      setToastMsg(`Error: Plan user limit reached (${maxUsersCount} max). Upgrade your workspace subscription or delete inactive users to create more.`);
      setTimeout(() => setToastMsg(""), 5000);
      return;
    }

    // Check duplicate email
    if (staff.some(s => s.email.toLowerCase() === newEmail.toLowerCase())) {
      setToastMsg("Error: A user with this Email ID already exists!");
      setTimeout(() => setToastMsg(""), 3500);
      return;
    }

    const newMember: StaffMember = {
      id: `user-${Date.now()}`,
      email: newEmail,
      name: newName,
      role: newRole,
      tenantId,
      password: newPassword,
      // Default permissions based on role
      permissions: newRole === "tenant_admin" 
        ? ["dashboard", "live_inbox", "campaigns", "templates", "chatbot_builder", "crm", "flows_automation", "billing"]
        : ["live_inbox"], // Talent agents get Live Inbox by default
      status: "active"
    };

    const updated = [...staff, newMember];
    saveStaff(updated);
    setNewEmail("");
    setNewName("");
    setNewPassword("");
    setNewRole("agent");
    setToastMsg("New Talent account successfully created with password!");
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handleDeleteStaff = (id: string) => {
    if (id === currentUserId) {
      setToastMsg("Error: You cannot delete your own logged-in account!");
      setTimeout(() => setToastMsg(""), 3500);
      return;
    }
    const updated = staff.filter(s => s.id !== id);
    saveStaff(updated);
    setToastMsg("Talent account removed.");
    setTimeout(() => setToastMsg(""), 3000);
  };

  const togglePermission = (userId: string, permission: string) => {
    const updated = staff.map(s => {
      if (s.id === userId) {
        const hasPerm = s.permissions.includes(permission);
        const newPerms = hasPerm 
          ? s.permissions.filter(p => p !== permission)
          : [...s.permissions, permission];
        return { ...s, permissions: newPerms };
      }
      return s;
    });
    saveStaff(updated);
    setToastMsg("Permissions updated instantly.");
    setTimeout(() => setToastMsg(""), 2000);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const ALL_SYSTEM_PERMISSIONS = [
    { id: "dashboard", label: "Dashboard View", desc: "Access the central KPIs and summaries" },
    { id: "live_inbox", label: "Live Chat Inbox", desc: "Read and reply to WhatsApp threads" },
    { id: "campaigns", label: "Campaign Dispatch", desc: "Blast marketing templates to contacts" },
    { id: "templates", label: "Meta Templates", desc: "Create and review pre-approved WhatsApp texts" },
    { id: "chatbot_builder", label: "Chatbot Studio", desc: "Design and build decision tree response bots" },
    { id: "crm", label: "CRM & Deals Pipeline", desc: "Transition freight deals and view pipeline" },
    { id: "flows_automation", label: "Automated Triggers", desc: "Configure event autoresponders and interactive Meta Flows" },
    { id: "billing", label: "Billing & Plans", desc: "Access pricing and upgrade tenant tiers" },
  ];

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
            <Users className="h-6 w-6 text-blue-600" /> 
            <span>Talent Accounts & Permissions</span>
            <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
              BANTConfirm Gate
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Create user credentials for your WhatsApp Agents and configure granular tab-level access permissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left column: Add new staff credentials */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <span>Create New Talent Credentials</span>
              </span>
            </h3>
            <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Active Plan Allocation:</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                staff.length >= maxUsersCount ? "bg-red-100 text-red-700 animate-pulse" : "bg-blue-100 text-blue-700"
              }`}>
                {staff.length} / {maxUsersCount} Users
              </span>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Full Name / Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anil Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                  User Account Email (Login ID)
                </label>
                <input
                  type="email"
                  placeholder="e.g. anil@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Secret Login Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="e.g. strongpwd123"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-10 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                    required
                  />
                  <Key className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Assigned Platform Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="agent">Talent (Agent/Standard User)</option>
                  <option value="tenant_admin">Talent Admin (Manager Account)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                <Plus className="h-4 w-4" /> Create User Credentials
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Manage Users & Active Permissions Map */}
        <div className="xl:col-span-2 space-y-6">
          {staff.map((member) => (
            <div key={member.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              
              {/* Card Header with User Details & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                    member.role === "tenant_admin" ? "bg-yellow-500" : "bg-blue-600"
                  }`}>
                    {member.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{member.name}</span>
                      <span className={`text-[9px] font-extrabold uppercase font-mono px-2 py-0.5 rounded-full ${
                        member.role === "tenant_admin" 
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200" 
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}>
                        {member.role === "tenant_admin" ? "Talent Admin" : "Talent / Agent"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>ID: {member.email}</span>
                      <span className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                        Password: 
                        <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                          {showPassword[member.id] ? member.password : "••••••••"}
                        </span>
                        <button 
                          onClick={() => togglePasswordVisibility(member.id)} 
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {showPassword[member.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {onLoginAsUser && member.id !== currentUserId && (
                    <button
                      onClick={() => onLoginAsUser(member)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                      title="Simulate logging in as this user to verify their menu restrictions"
                    >
                      <UserCheck className="h-3 w-3" /> Simulate Login
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteStaff(member.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Credentials"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Granular Permission Toggles */}
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">
                  Granular Tab Permissions ({member.permissions.length} Enabled)
                </span>
                
                {member.role === "tenant_admin" ? (
                  <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-3.5 text-xs text-yellow-800 leading-relaxed">
                    🌟 <strong>Talent Administrator Privilege:</strong> Administrators bypass permission gating and always maintain full absolute master access to all platform tabs, databases, billing tiers, and staff lists.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                      const isGranted = member.permissions.includes(perm.id);
                      return (
                        <div 
                          key={perm.id}
                          onClick={() => togglePermission(member.id, perm.id)}
                          className={`cursor-pointer border p-3 rounded-xl transition flex flex-col justify-between ${
                            isGranted 
                              ? "bg-blue-50/40 border-blue-200 text-blue-900 hover:bg-blue-50" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs font-sans block truncate pr-1">{perm.label}</span>
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={() => {}} // Swallowed since parent handles click
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer shrink-0"
                            />
                          </div>
                          <span className="text-[10px] opacity-75 mt-1.5 leading-tight line-clamp-2">
                            {perm.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
