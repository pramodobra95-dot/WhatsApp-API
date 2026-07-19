/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from "react";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import LandingPage from "./components/LandingPage";
import { Tenant } from "./types";
import { RefreshCw, Menu } from "lucide-react";

// Lazy-loaded dashboard, automation flows, CRM, Campaigns, and chat widgets for code splitting
const Dashboard = lazy(() => import("./components/Dashboard"));
const LiveInbox = lazy(() => import("./components/LiveInbox"));
const Campaigns = lazy(() => import("./components/Campaigns"));
const Templates = lazy(() => import("./components/Templates"));
const ChatbotBuilder = lazy(() => import("./components/ChatbotBuilder"));
const CRM = lazy(() => import("./components/CRM"));
const FlowsAndAutomation = lazy(() => import("./components/FlowsAndAutomation"));
const Billing = lazy(() => import("./components/Billing"));
const MessageRouter = lazy(() => import("./components/MessageRouter"));
const SuperAdmin = lazy(() => import("./components/SuperAdmin"));
const StaffPermissions = lazy(() => import("./components/StaffPermissions"));
const TenantSettings = lazy(() => import("./components/TenantSettings"));
const InternalChat = lazy(() => import("./components/InternalChat"));
const OpenApiSettings = lazy(() => import("./components/OpenApiSettings"));

function TabLoadingSpinner() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50/50 min-h-[400px]">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-12 h-12 rounded-full border-4 border-blue-500/20 animate-ping"></div>
        <div className="w-10 h-10 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <p className="text-[11px] text-slate-400 font-mono font-medium tracking-wider uppercase mt-4 animate-pulse">
        Initializing Module...
      </p>
    </div>
  );
}

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

  // Keep-alive routing: store all visited tabs so we only lazy-mount them and keep them alive in the DOM!
  const [visitedTabs, setVisitedTabs] = useState<string[]>(["dashboard"]);

  // Automatically track visited tabs to load them lazily and cache their viewport
  useEffect(() => {
    if (activeTab && !visitedTabs.includes(activeTab)) {
      setVisitedTabs((prev) => [...prev, activeTab]);
    }
  }, [activeTab]);

  // Expose the dynamic dashboard prefetching helper globally
  useEffect(() => {
    (window as any).__dashboardCache = (window as any).__dashboardCache || {};
    
    (window as any).prefetchDashboard = (tenantId: string) => {
      if (!tenantId) return;
      
      const cache = (window as any).__dashboardCache;
      const cached = cache[tenantId];
      // If already fetched within 30 seconds, don't refetch
      if (cached && Date.now() - cached.timestamp < 30000) {
        return;
      }
      
      // Mark as prefetching to prevent duplicate fetch calls
      cache[tenantId] = { data: cached?.data || null, timestamp: Date.now() };
      
      fetch(`/api/tenants/${tenantId}/dashboard`)
        .then((res) => res.json())
        .then((data) => {
          cache[tenantId] = { data, timestamp: Date.now() };
          // Fire custom event to notify listeners (like Dashboard component if it is currently loading/mounted)
          const event = new CustomEvent(`dashboard-prefetched-${tenantId}`, { detail: data });
          window.dispatchEvent(event);
        })
        .catch((err) => {
          console.error("Prefetching error:", err);
        });
    };
  }, []);

  const fetchTenants = () => {
    setLoading(true);
    fetch("/api/admin/tenants")
      .then((res) => res.json())
      .then((data) => {
        setTenants(data);
        
        // Dynamic Path-Based Router: Extract tenant ID and active tab from URL on boot
        const pathParts = window.location.pathname.split("/").filter(Boolean);
        if (pathParts.length >= 2) {
          const tenantId = pathParts[0];
          const tabName = pathParts[1];
          const found = data.find((t: Tenant) => t.id === tenantId);
          if (found) {
            setActiveTenant(found);
            setActiveTab(tabName);
            setVisitedTabs((prev) => prev.includes(tabName) ? prev : [...prev, tabName]);
            setIsLoggedIn(true);
            setCurrentUser({
              id: "user-admin-1",
              email: "talentadmin@bouuz.com",
              name: "Jessica Lopez (Talent Admin)",
              role: "tenant_admin",
              tenantId: found.id,
              permissions: ["dashboard", "live_inbox", "message_router", "campaigns", "templates", "chatbot_builder", "crm", "flows_automation", "billing"]
            });
            setActiveRole("tenant_admin");
          }
        } else if (pathParts[0] === "super-admin" && pathParts[1]) {
          setIsLoggedIn(true);
          setCurrentUser({
            id: "super-admin-root",
            email: "admin@bouuz.com",
            name: "BouuZ Super Admin",
            role: "super_admin",
            tenantId: "tenant-alpha",
            permissions: ["super_dashboard", "super_tenants", "super_webhooks"]
          });
          setActiveRole("super_admin");
          setActiveTab(pathParts[1]);
          setVisitedTabs((prev) => prev.includes(pathParts[1]) ? prev : [...prev, pathParts[1]]);
        } else if (data.length > 0) {
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

  // Sync state transitions back to URL history to enable bookmarking and sharing
  useEffect(() => {
    if (isLoggedIn && currentUser && activeTenant) {
      const newPath = activeTab.startsWith("super_")
        ? `/super-admin/${activeTab}`
        : `/${activeTenant.id}/${activeTab}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, "", newPath);
      }
    }
  }, [isLoggedIn, currentUser, activeTenant, activeTab]);

  // Listener to support fully native browser back/forward routing events
  useEffect(() => {
    const handlePopState = () => {
      const pathParts = window.location.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        const tenantId = pathParts[0];
        const tabName = pathParts[1];
        const foundTenant = tenants.find((t) => t.id === tenantId);
        if (foundTenant) {
          setActiveTenant(foundTenant);
          setActiveTab(tabName);
          setVisitedTabs((prev) => prev.includes(tabName) ? prev : [...prev, tabName]);
        }
      } else if (pathParts[0] === "super-admin" && pathParts[1]) {
        setActiveTab(pathParts[1]);
        setVisitedTabs((prev) => prev.includes(pathParts[1]) ? prev : [...prev, pathParts[1]]);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [tenants]);

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
      const targetTenant = activeTenant || tenants[0] || fallbackTenant;
      setCurrentUser({
        id: "user-admin-1",
        email: "talentadmin@bouuz.com",
        name: "Jessica Lopez (Talent Admin)",
        role: "tenant_admin",
        tenantId: targetTenant.id,
        permissions: ["dashboard", "live_inbox", "message_router", "campaigns", "templates", "chatbot_builder", "crm", "flows_automation", "billing"]
      });
      setActiveTab("dashboard");
    } else {
      const targetTenant = activeTenant || tenants[0] || fallbackTenant;
      setCurrentUser({
        id: "user-agent-1",
        email: "talent@bouuz.com",
        name: "Rohan Sharma (Talent)",
        role: "agent",
        tenantId: targetTenant.id,
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
      // Synchronize current user with newly selected tenant
      if (currentUser && currentUser.role !== "super_admin") {
        setCurrentUser(prev => prev ? { ...prev, tenantId: found.id } : null);
      }
      // Prefetch dashboard for the newly selected tenant
      if ((window as any).prefetchDashboard) {
        (window as any).prefetchDashboard(found.id);
      }
    }
  };

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

  // Prefetch dashboard immediately on login/authentication state change
  useEffect(() => {
    if (isLoggedIn && currentTenant && (window as any).prefetchDashboard) {
      (window as any).prefetchDashboard(currentTenant.id);
    }
  }, [isLoggedIn, currentTenant?.id]);

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
            setVisitedTabs(["dashboard"]);
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

        {/* KEEP-ALIVE COMPONENT CARRIER PANELS */}
        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === "dashboard" ? "block" : "hidden"}`}>
          {visitedTabs.includes("dashboard") && currentTenant && (
            <Suspense fallback={<TabLoadingSpinner />}>
              <Dashboard tenantId={currentTenant.id} />
            </Suspense>
          )}
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === "live_inbox" ? "block" : "hidden"}`}>
          {visitedTabs.includes("live_inbox") && currentTenant && (
            <Suspense fallback={<TabLoadingSpinner />}>
              <LiveInbox tenantId={currentTenant.id} />
            </Suspense>
          )}
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === "campaigns" ? "block" : "hidden"}`}>
          {visitedTabs.includes("campaigns") && currentTenant && (
            <Suspense fallback={<TabLoadingSpinner />}>
              <Campaigns tenantId={currentTenant.id} />
            </Suspense>
          )}
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === "templates" ? "block" : "hidden"}`}>
          {visitedTabs.includes("templates") && currentTenant && (
            <Suspense fallback={<TabLoadingSpinner />}>
              <Templates tenantId={currentTenant.id} />
            </Suspense>
          )}
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === "chatbot_builder" ? "block" : "hidden"}`}>
          {visitedTabs.includes("chatbot_builder") && currentTenant && (
            <Suspense fallback={<TabLoadingSpinner />}>
              <ChatbotBuilder tenantId={currentTenant.id} />
            </Suspense>
          )}
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === "crm" ? "block" : "hidden"}`}>
          {visitedTabs.includes("crm") && currentTenant && (
            <Suspense fallback={<TabLoadingSpinner />}>
              <CRM tenantId={currentTenant.id} />
            </Suspense>
          )}
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === "flows_automation" ? "block" : "hidden"}`}>
          {visitedTabs.includes("flows_automation") && currentTenant && (
            <Suspense fallback={<TabLoadingSpinner />}>
              <FlowsAndAutomation tenantId={currentTenant.id} />
            </Suspense>
          )}
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === "message_router" ? "block" : "hidden"}`}>
          {visitedTabs.includes("message_router") && currentTenant && (
            <Suspense fallback={<TabLoadingSpinner />}>
              <MessageRouter tenantId={currentTenant.id} />
            </Suspense>
          )}
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === "billing" ? "block" : "hidden"}`}>
          {visitedTabs.includes("billing") && currentTenant && (
            <Suspense fallback={<TabLoadingSpinner />}>
              <Billing tenantId={currentTenant.id} />
            </Suspense>
          )}
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === "open_api" ? "block" : "hidden"}`}>
          {visitedTabs.includes("open_api") && currentTenant && (
            <Suspense fallback={<TabLoadingSpinner />}>
              <OpenApiSettings tenantId={currentTenant.id} />
            </Suspense>
          )}
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === "tenant_settings" ? "block" : "hidden"}`}>
          {visitedTabs.includes("tenant_settings") && currentTenant && (
            <Suspense fallback={<TabLoadingSpinner />}>
              <TenantSettings tenantId={currentTenant.id} />
            </Suspense>
          )}
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === "internal_chat" ? "block" : "hidden"}`}>
          {visitedTabs.includes("internal_chat") && currentTenant && (
            <Suspense fallback={<TabLoadingSpinner />}>
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
            </Suspense>
          )}
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab === "staff_permissions" ? "block" : "hidden"}`}>
          {visitedTabs.includes("staff_permissions") && currentTenant && (
            <Suspense fallback={<TabLoadingSpinner />}>
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
            </Suspense>
          )}
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab.startsWith("super_") ? "block" : "hidden"}`}>
          {(visitedTabs.includes("super_dashboard") || visitedTabs.includes("super_tenants") || visitedTabs.includes("super_webhooks")) && (
            <Suspense fallback={<TabLoadingSpinner />}>
              <SuperAdmin 
                tenants={tenants} 
                setTenants={setTenants} 
                currentTab={activeTab} 
                setCurrentTab={setActiveTab} 
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

