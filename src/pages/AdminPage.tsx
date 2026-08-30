/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import {
  ShieldCheck,
  Users,
  Layers,
  Sparkles,
  Activity,
  Server,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  UserCheck,
  UserX,
  X,
  TrendingUp,
  HardDrive,
  Cpu,
  Shirt,
  Calendar,
  Lock,
} from "lucide-react";
import {
  adminService,
  AdminOverviewStats,
  AdminUserDetails,
} from "../services/adminService";

type AdminTab = "overview" | "users" | "activity" | "system" | "ai";

export function AdminPage() {
  const { user, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Overview data
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);

  // Users data
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<
    "All" | "Active" | "Suspended"
  >("All");
  const [userRoleFilter, setUserRoleFilter] = useState<
    "All" | "user" | "supervisor" | "admin"
  >("All");

  /* Selected user for inspection drawer */
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] =
    useState<AdminUserDetails | null>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  // Activity logs
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [activityCategoryFilter, setActivityCategoryFilter] =
    useState<string>("All");

  // System telemetry
  const [systemHealth, setSystemHealth] = useState<any | null>(null);

  const fetchAdminData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      setRefreshing(true);
      try {
        const [overviewData, usersData, logsData, healthData] =
          await Promise.all([
            adminService.getOverview(),
            adminService.getUsers(),
            adminService.getActivityLogs(),
            adminService.getSystemHealth(),
          ]);

        setOverview(overviewData);
        setUsersList(usersData);
        setActivityLogs(logsData);
        setSystemHealth(healthData);
      } catch (err: any) {
        console.error("Failed to fetch admin data:", err);
        showToast({
          title: "Admin Data Load Error",
          description:
            err.message || "Could not retrieve supervisor telemetry.",
          type: "error",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleInspectUser = async (targetUserId: string) => {
    setSelectedUserId(targetUserId);
    setLoadingUserDetails(true);
    try {
      const details = await adminService.getUserDetails(targetUserId);
      setSelectedUserDetails(details);
    } catch (err: any) {
      showToast({
        title: "Error loading user details",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const handleToggleUserStatus = async (targetUser: any) => {
    const newStatus = targetUser.status === "Active" ? "Suspended" : "Active";
    try {
      await adminService.updateUserStatus(targetUser.id, { status: newStatus });
      showToast({
        title: "Account Status Updated",
        description: `${targetUser.name} is now ${newStatus}.`,
        type: "success",
      });
      // Refresh list and inspection modal
      await fetchAdminData(true);
      if (selectedUserId === targetUser.id) {
        handleInspectUser(targetUser.id);
      }
    } catch (err: any) {
      showToast({
        title: "Status Update Failed",
        description: err.message,
        type: "error",
      });
    }
  };

  const handleToggleUserRole = async (targetUser: any) => {
    const newRole = targetUser.role === "supervisor" ? "user" : "supervisor";
    try {
      await adminService.updateUserStatus(targetUser.id, { role: newRole });
      showToast({
        title: "Role Updated",
        description: `${targetUser.name} role changed to ${newRole}.`,
        type: "success",
      });
      await fetchAdminData(true);
      if (selectedUserId === targetUser.id) {
        handleInspectUser(targetUser.id);
      }
    } catch (err: any) {
      showToast({
        title: "Role Update Failed",
        description: err.message,
        type: "error",
      });
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesStatus =
      userStatusFilter === "All" || u.status === userStatusFilter;
    const matchesRole = userRoleFilter === "All" || u.role === userRoleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Filtered Logs
  const filteredLogs = activityLogs.filter((log) => {
    if (activityCategoryFilter === "All") return true;
    return log.category === activityCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header with Supervisor Badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-semibold tracking-wider text-emerald-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              PAURVI Atelier
            </span>
            <span className="text-gray-400">·</span>
            <span className="text-xs text-gray-600 font-mono">
              Supervisor Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 font-editorial">
            Administrator / Supervisor
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Real-time multi-tenant monitoring, capsule isolation inspection,
            telemetry, and live audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-700 font-medium">{user.name}</div>
            <div className="text-[11px] text-emerald-500 uppercase tracking-wider font-mono">
              Role: {user.role}
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchAdminData(true)}
            disabled={refreshing}
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
            }
          >
            {refreshing ? "Refreshing..." : "Refresh Telemetry"}
          </Button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition ${
            activeTab === "overview"
              ? "bg-gray-100 text-gray-900 border border-gray-300 shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition ${
            activeTab === "users"
              ? "bg-gray-100 text-gray-900 border border-gray-300 shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition ${
            activeTab === "activity"
              ? "bg-gray-100 text-gray-900 border border-gray-300 shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Activity Logs ({activityLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition ${
            activeTab === "system"
              ? "bg-gray-100 text-gray-900 border border-gray-300 shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>System Diagnostics</span>
        </button>

        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wider transition ${
            activeTab === "ai"
              ? "bg-gray-100 text-gray-900 border border-gray-300 shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>AI Insights</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase tracking-widest text-gray-600 font-mono">
            Loading Real-Time Supervisor Telemetry...
          </p>
        </div>
      ) : (
        <>
          {/* ================= 1. TAB: OVERVIEW ================= */}
          {activeTab === "overview" && overview && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-white/80 border-gray-200">
                  <div className="flex items-center justify-between text-gray-600 mb-2">
                    <span className="text-xs uppercase tracking-wider">
                      Registered Users
                    </span>
                    <Users className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold text-gray-900 font-editorial">
                    {overview.totalUsers}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>
                      {overview.activeUsers} active · {overview.newUsers} new
                      (30d)
                    </span>
                  </div>
                </Card>

                <Card className="p-4 bg-white/80 border-gray-200">
                  <div className="flex items-center justify-between text-gray-600 mb-2">
                    <span className="text-xs uppercase tracking-wider">
                      Catalogued Pieces
                    </span>
                    <Shirt className="w-4 h-4 text-gray-700" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold text-gray-900 font-editorial">
                    {overview.totalWardrobeItems}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    Zero demo filler · Real user uploads
                  </div>
                </Card>

                <Card className="p-4 bg-white/80 border-gray-200">
                  <div className="flex items-center justify-between text-gray-600 mb-2">
                    <span className="text-xs uppercase tracking-wider">
                      Saved Lookbooks
                    </span>
                    <Layers className="w-4 h-4 text-gray-700" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold text-gray-900 font-editorial">
                    {overview.totalOutfits}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    Composed & styled ensembles
                  </div>
                </Card>

                <Card className="p-4 bg-white/80 border-gray-200">
                  <div className="flex items-center justify-between text-gray-600 mb-2">
                    <span className="text-xs uppercase tracking-wider">
                      AI Stylist Requests
                    </span>
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold text-gray-900 font-editorial">
                    {overview.totalAiRequests}
                  </div>
                  <div className="text-[11px] text-emerald-500 mt-1">
                    Gemini 3.6 Flash executions
                  </div>
                </Card>
              </div>

              {/* Secondary Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span>Wear History & Capsule Rotation</span>
                    </h3>
                    <Badge variant="gold" size="sm">
                      Live Telemetry
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="text-xs text-gray-600 uppercase tracking-wider">
                        Total Wear Cycles
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {overview.totalWearCycles}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Incremented across all users
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="text-xs text-gray-600 uppercase tracking-wider">
                        Audit Trail Events
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {overview.totalActivityLogs}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Recorded user activities
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-500" />
                      <span>Security & Data Isolation Status</span>
                    </h3>
                    <Badge variant="subtle" size="sm">
                      Enforced
                    </Badge>
                  </div>
                  <div className="space-y-2 text-xs text-gray-700">
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
                      <span className="text-gray-600">
                        Password Encryption:
                      </span>
                      <span className="font-mono text-gray-800">
                        PBKDF2-SHA512 + 10k Iterations
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-gray-200">
                      <span className="text-gray-600">
                        Multi-Tenant Scoping:
                      </span>
                      <span className="text-emerald-400">
                        Strict Token Partitioning (Backend)
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-gray-600">
                        Role-Based Guard (RBAC):
                      </span>
                      <span className="text-emerald-400">
                        Server-Side Middleware Enforced
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Activity Snapshot */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span>Recent Live Audit Events</span>
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("activity")}
                  >
                    View All Logs ({activityLogs.length})
                  </Button>
                </div>

                <div className="divide-y divide-zinc-850">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            log.category === "AUTH"
                              ? "gold"
                              : log.category === "WARDROBE"
                                ? "subtle"
                                : log.category === "AI_STYLIST"
                                  ? "gold"
                                  : "subtle"
                          }
                          size="sm"
                        >
                          {log.category}
                        </Badge>
                        <span className="text-gray-800">{log.action}</span>
                      </div>
                      <div className="text-gray-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                  {activityLogs.length === 0 && (
                    <div className="py-6 text-center text-gray-500 text-xs">
                      No activity logs recorded yet.
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* ================= 2. TAB: USERS ================= */}
          {activeTab === "users" && (
            <div className="space-y-4">
              {/* Search and Filters Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/60 p-3 rounded-xl border border-gray-200">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-zinc-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value as any)}
                    className="bg-gray-50 border border-gray-200 text-xs text-gray-700 rounded-lg px-2.5 py-1.5 outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>

                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as any)}
                    className="bg-gray-50 border border-gray-200 text-xs text-gray-700 rounded-lg px-2.5 py-1.5 outline-none"
                  >
                    <option value="All">All Roles</option>
                    <option value="user">User</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <Card className="overflow-hidden border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider font-mono border-b border-gray-200 text-[10px]">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Wardrobe</th>
                        <th className="py-3 px-4 text-center">Outfits</th>
                        <th className="py-3 px-4 text-center">Wear Cycles</th>
                        <th className="py-3 px-4 text-center">AI Requests</th>
                        <th className="py-3 px-4">Joined</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850 text-gray-700">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/50 transition">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">
                              {u.name}
                            </div>
                            <div className="text-gray-500 font-mono text-[11px]">
                              {u.email}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                u.role === "supervisor" ? "gold" : "subtle"
                              }
                              size="sm"
                            >
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                u.status === "Active"
                                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                                  : "bg-red-950/60 text-red-400 border border-red-800/40"
                              }`}
                            >
                              {u.status === "Active" ? (
                                <CheckCircle2 className="w-2.5 h-2.5" />
                              ) : (
                                <AlertTriangle className="w-2.5 h-2.5" />
                              )}
                              <span>{u.status}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-gray-900">
                            {u.wardrobeCount}
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-gray-900">
                            {u.outfitsCount}
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-gray-900">
                            {u.wearCyclesCount}
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-emerald-500">
                            {u.aiRequestsCount}
                          </td>
                          <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                            {u.joinedDate}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleInspectUser(u.id)}
                                title="Inspect User Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleUserStatus(u)}
                                title={
                                  u.status === "Active"
                                    ? "Suspend User"
                                    : "Activate User"
                                }
                              >
                                {u.status === "Active" ? (
                                  <UserX className="w-3.5 h-3.5 text-red-400" />
                                ) : (
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredUsers.length === 0 && (
                        <tr>
                          <td
                            colSpan={9}
                            className="py-8 text-center text-gray-500"
                          >
                            No registered users found matching the filter
                            criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ================= 3. TAB: ACTIVITY LOGS ================= */}
          {activeTab === "activity" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 bg-white/60 p-3 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-600">
                  Showing{" "}
                  <span className="text-gray-800 font-medium">
                    {filteredLogs.length}
                  </span>{" "}
                  audit trail events
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Category:</span>
                  <select
                    value={activityCategoryFilter}
                    onChange={(e) => setActivityCategoryFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-xs text-gray-700 rounded-lg px-2.5 py-1.5 outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="AUTH">AUTH</option>
                    <option value="WARDROBE">WARDROBE</option>
                    <option value="AI_STYLIST">AI_STYLIST</option>
                    <option value="PLANNER">PLANNER</option>
                    <option value="SETTINGS">SETTINGS</option>
                    <option value="SYSTEM">SYSTEM</option>
                  </select>
                </div>
              </div>

              <Card className="divide-y divide-zinc-850">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/40 transition"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <Badge
                        variant={
                          log.category === "AUTH"
                            ? "gold"
                            : log.category === "WARDROBE"
                              ? "subtle"
                              : log.category === "AI_STYLIST"
                                ? "gold"
                                : "subtle"
                        }
                        size="sm"
                      >
                        {log.category}
                      </Badge>
                      <div>
                        <div className="text-xs font-medium text-gray-800">
                          {log.action}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          By{" "}
                          <span className="text-gray-600">{log.userName}</span>{" "}
                          ({log.userEmail})
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-gray-500 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}

                {filteredLogs.length === 0 && (
                  <div className="py-12 text-center text-gray-500 text-xs">
                    No activity logs found for this category.
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ================= 4. TAB: SYSTEM DIAGNOSTICS ================= */}
          {activeTab === "system" && systemHealth && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-xs uppercase tracking-wider">
                      Atelier Core Status
                    </span>
                    <Server className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{systemHealth.status}</span>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Server Uptime: {Math.floor(systemHealth.uptimeSeconds / 60)}{" "}
                    minutes
                  </div>
                </Card>

                <Card className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-xs uppercase tracking-wider">
                      AI Model Engine
                    </span>
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-xl font-semibold text-gray-900">
                    {systemHealth.aiModel}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Server-Side Google GenAI Gateway
                  </div>
                </Card>

                <Card className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-xs uppercase tracking-wider">
                      Active Sessions
                    </span>
                    <Lock className="w-4 h-4 text-gray-700" />
                  </div>
                  <div className="text-xl font-semibold text-gray-900">
                    {systemHealth.activeSessions} Active
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Encrypted Token Vault
                  </div>
                </Card>
              </div>

              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  <span>Node.js Memory & Storage Telemetry</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500">Heap Used:</span>
                    <div className="text-sm font-bold text-gray-800 mt-1 font-mono">
                      {(
                        systemHealth.serverMemoryUsage.heapUsed /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500">Heap Total:</span>
                    <div className="text-sm font-bold text-gray-800 mt-1 font-mono">
                      {(
                        systemHealth.serverMemoryUsage.heapTotal /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500">RSS Allocation:</span>
                    <div className="text-sm font-bold text-gray-800 mt-1 font-mono">
                      {(
                        systemHealth.serverMemoryUsage.rss /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-gray-500">DB File Size:</span>
                    <div className="text-sm font-bold text-gray-800 mt-1 font-mono">
                      {(systemHealth.databaseSizeBytes / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ================= 5. TAB: AI INSIGHTS ================= */}
          {activeTab === "ai" && overview && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1A1813] via-zinc-900 to-zinc-900 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                    PAURVI Intelligent Stylist Core
                  </span>
                  <Badge variant="gold" size="sm">
                    Strict Wardrobe Grounding
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-3xl">
                  The AI Stylist model is strictly bounded to each user's
                  authenticated wardrobe inventory. It receives real piece IDs
                  and attributes, rejecting hallucinations of un-owned garments
                  while explaining wardrobe gaps honestly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Stylist Capabilities</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Natural Language Look Generator:
                      </span>
                      <Badge variant="gold" size="sm">
                        Active
                      </Badge>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Haute Couture Conversational Concierge:
                      </span>
                      <Badge variant="gold" size="sm">
                        Active
                      </Badge>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Gemini Vision Garment Auto-Cataloguing:
                      </span>
                      <Badge variant="gold" size="sm">
                        Active
                      </Badge>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Occasion & Weather Suitability Engine:
                      </span>
                      <Badge variant="gold" size="sm">
                        Active
                      </Badge>
                    </li>
                  </ul>
                </Card>

                <Card className="p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Shirt className="w-4 h-4 text-emerald-500" />
                    <span>Total AI Operations</span>
                  </h4>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <div className="text-2xl font-bold text-emerald-500 font-editorial">
                      {overview.totalAiRequests} Invocations
                    </div>
                    <div className="text-xs text-gray-600">
                      Logged across all active users in the system.
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= USER DETAIL INSPECTOR MODAL ================= */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-500">
                    User Inspection
                  </span>
                  <span className="text-gray-400">·</span>
                  <span className="text-xs text-gray-600 font-mono">
                    {selectedUserId}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mt-0.5">
                  {selectedUserDetails?.user.name || "User Capsule"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setSelectedUserDetails(null);
                }}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-gray-700">
              {loadingUserDetails ? (
                <div className="py-12 text-center text-gray-600">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading user capsule data...
                </div>
              ) : selectedUserDetails ? (
                <>
                  {/* User Profile Info Card */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-500 uppercase tracking-wider text-[10px]">
                        Email:
                      </span>
                      <div className="text-gray-900 font-mono mt-0.5">
                        {selectedUserDetails.user.email}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase tracking-wider text-[10px]">
                        Role:
                      </span>
                      <div className="mt-0.5">
                        <Badge
                          variant={
                            selectedUserDetails.user.role === "supervisor"
                              ? "gold"
                              : "subtle"
                          }
                          size="sm"
                        >
                          {selectedUserDetails.user.role}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase tracking-wider text-[10px]">
                        Status:
                      </span>
                      <div className="mt-0.5 font-medium text-emerald-400">
                        {selectedUserDetails.user.status}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase tracking-wider text-[10px]">
                        Joined:
                      </span>
                      <div className="text-gray-700 mt-0.5">
                        {selectedUserDetails.user.joinedDate}
                      </div>
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-lg font-bold text-gray-900">
                        {selectedUserDetails.stats.wardrobeCount}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase">
                        Pieces
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-lg font-bold text-gray-900">
                        {selectedUserDetails.stats.outfitsCount}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase">
                        Looks
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-lg font-bold text-gray-900">
                        {selectedUserDetails.stats.wearCyclesCount}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase">
                        Wear Cycles
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-lg font-bold text-gray-900">
                        {selectedUserDetails.stats.favoritesCount}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase">
                        Favorites
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 col-span-2 sm:col-span-1">
                      <div className="text-lg font-bold text-emerald-500">
                        {selectedUserDetails.stats.aiRequestsCount}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase">
                        AI Calls
                      </div>
                    </div>
                  </div>

                  {/* Wardrobe Sample */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 uppercase tracking-wider text-[11px]">
                      Wardrobe Inventory Snapshot (
                      {selectedUserDetails.recentWardrobePieces.length} shown)
                    </h4>
                    {selectedUserDetails.recentWardrobePieces.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedUserDetails.recentWardrobePieces.map(
                          (piece) => (
                            <div
                              key={piece.id}
                              className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2.5"
                            >
                              {piece.imageUrl ? (
                                <img
                                  src={piece.imageUrl}
                                  alt={piece.name}
                                  className="w-10 h-10 object-cover rounded bg-white shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded bg-white flex items-center justify-center shrink-0">
                                  <Shirt className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-medium text-gray-800 truncate">
                                  {piece.name}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  {piece.category} · {piece.color}
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs italic">
                        User has not uploaded any wardrobe pieces yet (0 items).
                      </p>
                    )}
                  </div>

                  {/* Supervisor Actions */}
                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
                    <Button
                      variant={
                        selectedUserDetails.user.status === "Active"
                          ? "danger"
                          : "secondary"
                      }
                      size="sm"
                      onClick={() =>
                        handleToggleUserStatus(selectedUserDetails.user)
                      }
                    >
                      {selectedUserDetails.user.status === "Active"
                        ? "Suspend Account"
                        : "Reactivate Account"}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        handleToggleUserRole(selectedUserDetails.user)
                      }
                    >
                      {selectedUserDetails.user.role === "supervisor"
                        ? "Demote to User"
                        : "Promote to Supervisor"}
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
