/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import LiveInbox from "./components/LiveInbox";
import Campaigns from "./components/Campaigns";
import Templates from "./components/Templates";
import ChatbotBuilder from "./components/ChatbotBuilder";
import CRM from "./components/CRM";
import FlowsAndAutomation from "./components/FlowsAndAutomation";
import Billing from "./components/Billing";
import MessageRouter from "./components/MessageRouter";
import SuperAdmin from "./components/SuperAdmin";
import StaffPermissions from "./components/StaffPermissions";
import TenantSettings from "./components/TenantSettings";
import InternalChat from "./components/InternalChat";
import Login from "./components/Login";
import OpenApiSettings from "./components/OpenApiSettings";
import LandingPage from "./components/LandingPage";
import { Tenant } from "./types";
import { RefreshCw, Menu } from "lucide-react";

export default function App() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  // Responsive Sidebar States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Authentication & Credentials States
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Default to false for landing page on boot!
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name: string;
    role: "super_admin" | "tenant_admin" | "manager" | "agent" | "viewer";
    tenantId: string;
    permissions: string[];
  } | null>(null);

  // Active Role simulator in sync with current user role
  const [activeRole, setActiveRole] = useState<"super_admin" | "tenant_admin" | "manager" | "agent" | "viewer">("tenant_admin");
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const fetchTenants = () => {
    setLoading(true);
    fetch("/api/admin/tenants")
      .then((res) => res.json())
      .then((data) => {
        setTenants(data);
        if (data.length > 0) {
          setActiveTenant(data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("App initialization tenants error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Synchronize simulated role clicks with simulated user session details
  const handleSetSimulatedRole = (role: "super_admin" | "tenant_admin" | "manager" | "agent" | "viewer") => {
    setActiveRole(role);
    if (role === "super_admin") {
      setCurrentUser({
        id: "super-admin-root",
        email: "admin@bouuz.com",
        name: "BouuZ Super Admin",
        role: "super_admin",
        tenantId: "tenant-alpha",
        permissions: ["super_dashboard", "super_tenants", "super_webhooks"]
      });
      setActiveTab("super_dashboard");
    } else if (role === "tenant_admin") {
      setCurrentUser({
        id: "user-admin-1",
        email: "talentadmin@bouuz.com",
        name: "Jessica Lopez (Talent Admin)",
        role: "tenant_admin",
        tenantId: "tenant-alpha",
        permissions: ["dashboard", "live_inbox", "message_router", "campaigns", "templates", "chatbot_builder", "crm", "flows_automation", "billing"]
      });
      setActiveTab("dashboard");
    } else {
      setCurrentUser({
        id: "user-agent-1",
        email: "talent@bouuz.com",
        name: "Rohan Sharma (Talent)",
        role: "agent",
        tenantId: "tenant-alpha",
        permissions: ["live_inbox", "message_router", "chatbot_builder"] // Default restricted agent permissions
      });
      setActiveTab("dashboard");
    }
  };

  // Sync active tenant selection if tenants list updates
  const handleSelectTenant = (tenantId: string) => {
    const found = tenants.find((t) => t.id === tenantId);
    if (found) {
      setActiveTenant(found);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 font-mono">
        <RefreshCw className="h-10 w-10 text-teal-500 animate-spin mb-4" />
        <h2 className="text-sm font-bold tracking-widest uppercase">Bootstrapping Isolated Tenant DB Sandbox...</h2>
      </div>
    );
  }

  // If logged out, render the magnificent LandingPage screen which has single login built-in!
  if (!isLoggedIn || !currentUser) {
    return (
      <LandingPage 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setActiveRole(user.role);
          setIsLoggedIn(true);
          if (user.role === "super_admin") {
            setActiveTab("super_dashboard");
          } else {
            setActiveTab("dashboard");
          }
        }} 
      />
    );
  }

  const fallbackTenant: Tenant = {
    id: "tenant-alpha",
    name: "Alpha Logistics Inc",
    domain: "alpha.logistics.com",
    plan: "pro",
    status: "active",
    createdAt: "2026-01-10",
    whatsappLimit: 100000,
    aiCredits: 5000,
    aiUsed: 1240,
    phoneNumbersCount: 2,
    maxUsersCount: 15,
    internalChatEnabled: true,
    allowedFeatures: ["live_inbox", "internal_chat", "message_router", "campaigns", "templates", "chatbot_builder", "crm", "flows_automation", "billing", "open_api"]
  };

  const currentTenant = activeTenant || tenants[0] || fallbackTenant;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans relative">
      {/* Mobile sidebar overlay backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container with responsive visibility */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 transition-all duration-300 ease-in-out shrink-0
        ${isSidebarCollapsed ? "md:w-20" : "md:w-64"} w-64
      `}>
        <Sidebar
          tenants={tenants.length > 0 ? tenants : [fallbackTenant]}
          selectedTenantId={currentTenant.id}
          setSelectedTenantId={handleSelectTenant}
          userRole={activeRole}
          setUserRole={handleSetSimulatedRole}
          currentTab={activeTab}
          setCurrentTab={setActiveTab}
          currentUserName={currentUser.name}
          currentUserEmail={currentUser.email}
          allowedPermissions={currentUser.permissions}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onCloseMobile={() => setIsSidebarOpen(false)}
          onLogOut={() => {
            setIsLoggedIn(false);
            setCurrentUser(null);
          }}
        />
      </div>

      {/* RENDER ACTIVE TAB BODY */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Responsive Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none transition cursor-pointer"
              title="Open Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <span className="font-bold text-sm text-slate-900 tracking-tight">BouuZ</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {activeTab.replace(/_/g, " ")}
          </div>
        </header>
        {activeTab === "dashboard" && currentTenant && (
          <Dashboard tenantId={currentTenant.id} />
        )}
        
        {activeTab === "live_inbox" && currentTenant && (
          <LiveInbox tenantId={currentTenant.id} />
        )}

        {activeTab === "campaigns" && currentTenant && (
          <Campaigns tenantId={currentTenant.id} />
        )}

        {activeTab === "templates" && currentTenant && (
          <Templates tenantId={currentTenant.id} />
        )}

        {activeTab === "chatbot_builder" && currentTenant && (
          <ChatbotBuilder tenantId={currentTenant.id} />
        )}

        {activeTab === "crm" && currentTenant && (
          <CRM tenantId={currentTenant.id} />
        )}

        {activeTab === "flows_automation" && currentTenant && (
          <FlowsAndAutomation tenantId={currentTenant.id} />
        )}

        {activeTab === "message_router" && currentTenant && (
          <MessageRouter tenantId={currentTenant.id} />
        )}

        {activeTab === "billing" && currentTenant && (
          <Billing tenantId={currentTenant.id} />
        )}

        {activeTab === "open_api" && currentTenant && (
          <OpenApiSettings tenantId={currentTenant.id} />
        )}

        {activeTab === "tenant_settings" && currentTenant && (
          <TenantSettings tenantId={currentTenant.id} />
        )}

        {activeTab === "internal_chat" && currentTenant && (
          <InternalChat 
            tenantId={currentTenant.id} 
            currentUser={{
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              role: currentUser.role
            }}
            internalChatEnabled={currentTenant.internalChatEnabled !== false}
          />
        )}

        {activeTab === "staff_permissions" && currentTenant && (
          <StaffPermissions 
            tenantId={currentTenant.id} 
            currentUserId={currentUser.id}
            maxUsersCount={currentTenant.maxUsersCount}
            onLoginAsUser={(user) => {
              setCurrentUser({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId,
                permissions: user.permissions
              });
              setActiveRole(user.role);
              setActiveTab("dashboard");
            }}
          />
        )}

        {activeTab.startsWith("super_") && (
          <SuperAdmin 
            tenants={tenants} 
            setTenants={setTenants} 
            currentTab={activeTab} 
            setCurrentTab={setActiveTab} 
          />
        )}
      </div>
    </div>
  );
}

