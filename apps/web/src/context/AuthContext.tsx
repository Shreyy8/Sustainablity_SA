"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { UserSessionPayload } from "@/lib/auth";

export interface AuthenticUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  orgId: string;
  orgName: string;
  orgType: string;
}

export interface AuthContextType {
  session: UserSessionPayload | null;
  loading: boolean;
  users: AuthenticUser[];
  tenants: string[];
  switchUser: (userId: string) => Promise<boolean>;
  switchTenant: (tenantName: string) => Promise<void>;
  updateReusableData: (data: Partial<UserSessionPayload["reusableData"]>) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AuthenticUser[]>([]);
  const [tenants, setTenants] = useState<string[]>([]);

  // Refresh active session from /api/auth/session
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data?.session) {
          setSession(data.session);
        }
      }
    } catch (err) {
      console.error("Auth session fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch authenticatable users & organizations
  const loadUsersAndTenants = useCallback(async () => {
    try {
      const [uRes, oRes] = await Promise.all([
        fetch("/api/auth/users"),
        fetch("/api/orgs")
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData?.users) {
          setUsers(uData.users);
        }
      }

      if (oRes.ok) {
        const oData = await oRes.json();
        if (oData?.orgs) {
          setTenants(oData.orgs.map((o: any) => o.name));
        }
      }
    } catch (err) {
      console.error("Failed to load users & tenants:", err);
    }
  }, []);

  useEffect(() => {
    refreshSession();
    loadUsersAndTenants();
  }, [refreshSession, loadUsersAndTenants]);

  // Switch user role/identity by issuing a new JWT cookie
  const switchUser = async (userId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          reusableData: session?.reusableData
        })
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();
      if (data?.user) {
        setSession(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error switching user:", err);
      return false;
    }
  };

  // Switch tenant workspace and persist to JWT session
  const switchTenant = async (tenantName: string) => {
    await updateReusableData({ tenantName });
  };

  // Update reusable session info in cookie token
  const updateReusableData = async (data: Partial<UserSessionPayload["reusableData"]>) => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reusableData: data })
      });

      if (res.ok) {
        const result = await res.json();
        if (result?.session) {
          setSession(result.session);
        }
      }
    } catch (err) {
      console.error("Error updating reusable session data:", err);
    }
  };

  // Logout session
  const logout = async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      setSession(null);
      // Auto-reconnect default session
      await refreshSession();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        users,
        tenants,
        switchUser,
        switchTenant,
        updateReusableData,
        logout,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
