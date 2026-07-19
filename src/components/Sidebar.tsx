/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Send, 
  FileText, 
  GitBranch, 
  Cpu, 
  Users, 
  Briefcase, 
  Settings, 
  CreditCard, 
  ShieldAlert, 
  Webhook, 
  Bot,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  Code
} from "lucide-react";
import { UserRole, Tenant } from "../types";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  tenants: Tenant[];
  selectedTenantId: string;
  setSelectedTenantId: (id: string) => void;
  onLogOut?: () => void;
  currentUserName?: string;
  currentUserEmail?: string;
  allowedPermissions?: string[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  tenants,
  selectedTenantId,
  setSelectedTenantId,
  onLogOut,
  currentUserName,
  currentUserEmail,
  allowedPermissions,
  isCollapsed = false,
  onToggleCollapse,
  onCloseMobile
}: SidebarProps) {
  
  // Dynamic navigation items based on selected role
  const baseNavItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "live_inbox", name: "Live Inbox", icon: MessageSquare, badge: 1, isSelectedTab: true },
    { id: "internal_chat", name: "Internal Chat", icon: MessageSquare },
    { id: "message_router", name: "Message Router", icon: Zap, isSelectedTab: true },
    { id: "campaigns", name: "Campaigns", icon: Send },
    { id: "templates", name: "Templates", icon: FileText },
    { id: "chatbot_builder", name: "Chatbot Builder", icon: Bot, isSelectedTab: true },
    { id: "crm", name: "CRM & Deals", icon: Briefcase },
    { id: "flows_automation", name: "Flows & Automations", icon: GitBranch, isSelectedTab: true },
    { id: "billing", name: "Billing & Plans", icon: CreditCard },
    { id: "open_api", name: "Open API & CRM", icon: Code },
  ];

  const selectedTenant = tenants.find(t => t.id === selectedTenantId) || tenants[0];

  // Admins get access to Staff & Permissions
  const tenantNavItems = [...baseNavItems];
  if (userRole === "tenant_admin" || userRole === "super_admin") {
    tenantNavItems.push({ id: "staff_permissions", name: "Staff & Permissions", icon: Users, isSelectedTab: false });
    tenantNavItems.push({ id: "tenant_settings", name: "Custom Labels / Settings", icon: Settings, isSelectedTab: false });
  }

  // Filter based on allowedPermissions for agent role and tenant-level features
  const filteredNavItems = tenantNavItems.filter(item => {
    // If the selected tenant restricts this feature, hide it
    if (selectedTenant && selectedTenant.allowedFeatures) {
      const coreTabs = ["dashboard", "staff_permissions", "tenant_settings"];
      if (!coreTabs.includes(item.id) && !selectedTenant.allowedFeatures.includes(item.id)) {
        return false;
      }
    }
    
    if (userRole === "super_admin" || userRole === "tenant_admin") return true;
    if (item.id === "dashboard") return true; // Always allow dashboard as baseline
    return allowedPermissions ? allowedPermissions.includes(item.id) : true;
  });

  const superAdminNavItems = [
    { id: "super_dashboard", name: "Super Admin Deck", icon: ShieldAlert },
    { id: "super_tenants", name: "Tenant Management", icon: Users },
    { id: "super_webhooks", name: "Webhook Logs", icon: Webhook },
  ];

  return (
    <div className={`bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 font-sans text-slate-900 transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
      {/* Brand Logo & Controls */}
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2 border-b border-slate-100 shrink-0`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="font-bold text-base tracking-tight text-slate-950 block truncate">BouuZ</span>
                <span className="bg-emerald-500 text-white text-[8px] font-black px-1 rounded">AI</span>
              </div>
              <div className="text-[9px] text-slate-500 font-medium leading-none mt-0.5 truncate">
                Powered by <span className="text-blue-600 font-bold">BANT</span><span className="text-emerald-500 font-bold">Confirm</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
            <span className="text-white font-bold text-sm">B</span>
          </div>
        )}
        
        <div className="flex items-center gap-1 shrink-0">
          {/* Toggle button for desktop */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Close button for mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
            title="Close Menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Active Tenant Workspace Switcher */}
      {!isCollapsed && tenants && tenants.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-col gap-1.5 shrink-0 animate-fade-in">
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold font-mono flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Workspace Tenant
          </span>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg py-1.5 px-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-xs transition"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                🏢 {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Menu Navigation Scrollable */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {/* Tenant Navigation Menu */}
        <div>
          {!isCollapsed && (
            <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 px-2">
              Main Menu
            </div>
          )}
          <nav className="space-y-0.5">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    if (window.innerWidth < 768 && onCloseMobile) {
                      onCloseMobile();
                    }
                  }}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center py-2.5' : 'justify-between px-3 py-1.5'} rounded-lg text-xs font-medium transition-all relative ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  } ${
                    item.isSelectedTab && !isCollapsed
                      ? "border-l-4 border-yellow-400 pl-2 bg-slate-50/50"
                      : ""
                  }`}
                  title={item.name}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-blue-600" : item.isSelectedTab ? "text-blue-500" : "text-slate-400"}`} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <div className="flex items-center gap-1">
                      {item.isSelectedTab && (
                        <span className="text-[7px] bg-yellow-100 text-yellow-800 border border-yellow-300 font-semibold px-1 py-0.2 rounded font-sans uppercase shrink-0">
                          BANT
                        </span>
                      )}
                      {item.badge && (
                        <span className="bg-blue-600 text-white text-[9px] px-1 py-0.2 rounded-full font-bold leading-none">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                  {isCollapsed && item.badge && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 border-2 border-white rounded-full"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Super Admin Section (Only displayed for Super Admins) */}
        {userRole === "super_admin" && (
          <div>
            {!isCollapsed && (
              <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 px-2">
                System Admin
              </div>
            )}
            <nav className="space-y-0.5">
              {superAdminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      if (window.innerWidth < 768 && onCloseMobile) {
                        onCloseMobile();
                      }
                    }}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center py-2.5' : 'gap-2.5 px-3 py-1.5'} rounded-lg text-xs font-medium transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    title={item.name}
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-blue-500" : "text-slate-400"}`} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Active User Session with Log Out */}
      {(currentUserName || currentUserEmail) && (
        <div className={`px-3 py-2.5 bg-slate-50/80 border-t border-slate-200/60 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2 shrink-0`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-extrabold text-[11px] flex items-center justify-center uppercase shrink-0" title={currentUserName}>
              {currentUserName ? currentUserName[0] : "A"}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="text-[10px] font-bold text-slate-800 truncate leading-tight">
                  {currentUserName || "Talent Account"}
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5 leading-none">
                  {currentUserEmail || "Logged In"}
                </div>
              </div>
            )}
          </div>
          {!isCollapsed && onLogOut && (
            <button
              onClick={onLogOut}
              className="text-[9px] font-bold text-slate-500 hover:text-rose-600 transition shrink-0 bg-white border border-slate-200 hover:border-rose-100 rounded-md px-1.5 py-0.5 shadow-sm cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      )}

      {/* BANTConfirm Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex flex-col items-center justify-center gap-1 shrink-0">
          <div className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase leading-none">
            Powered by
          </div>
          <div className="text-xs tracking-tight flex items-center gap-0.5 leading-none">
            <span className="text-blue-600 font-extrabold text-xs">BANT</span>
            <span className="text-yellow-500 font-extrabold text-xs">Confirm</span>
          </div>
          <div className="text-[8px] text-slate-400 font-mono mt-0.5">
            © {new Date().getFullYear()} BouuZ. All rights reserved.
          </div>
        </div>
      )}
    </div>
  );
}
