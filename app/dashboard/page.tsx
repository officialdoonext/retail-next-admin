"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Client } from "@/lib/types";
import { getAllRealClients } from "@/lib/data-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Store,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Building2,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickSearch, setQuickSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAllRealClients();
        setClients(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "Active").length;
  const totalStores = clients.reduce(
    (acc, c) => acc + (c.storesCount || c.stores?.length || 0),
    0
  );
  const totalAllowedStores = clients.reduce((acc, c) => acc + (c.maxStores || 1), 0);

  // Expiring in < 30 days or expired
  const expiringClients = clients.filter((c) => {
    if (!c.expiryDate) return false;
    const diff = new Date(c.expiryDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days <= 30;
  });

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/clients?search=${encodeURIComponent(quickSearch.trim())}`);
    } else {
      router.push("/clients");
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-7 max-w-7xl mx-auto w-full space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#5e2b9d] via-[#7335bd] to-[#8c4be0] rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold tracking-wider uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Retail Next Master Control Admin
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Retail Platform Overview
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Monitor active retail subscribers, regulate maximum branch store allowances, extend expiration dates, and activate software manager modules.
            </p>

            {/* Quick search input */}
            <form onSubmit={handleQuickSearchSubmit} className="mt-5 flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-slate-400" />
                <input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Quick lookup by phone, email or client..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white shadow-xs"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* Decorative background element */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
            <Store className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Clients */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Clients
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {loading ? "..." : totalClients}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                {activeClients} Active • {totalClients - activeClients} Inactive
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#5e2b9d] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Total Stores Managed */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Retail Stores
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {loading ? "..." : totalStores}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Capacity: {totalStores} / {totalAllowedStores} allowed
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Subscription Plans */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Tier Plans
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                4 Tiers
              </h3>
              <Link
                href="/client-plans"
                className="text-[11px] text-[#5e2b9d] font-semibold mt-1 inline-flex items-center gap-1 hover:underline"
              >
                <span>Manage Plans</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Expiring Soon */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Expiry Watchlist
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
                {loading ? "..." : expiringClients.length}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Expiring or expired
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Urgent Expiry Alerts Banner if any */}
        {expiringClients.length > 0 && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <strong>Notice:</strong> {expiringClients.length} client {expiringClients.length === 1 ? "subscription is" : "subscriptions are"} due for expiry or already expired.
              </div>
            </div>
            <Link
              href="/clients"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors self-start sm:self-auto"
            >
              <span>Review & Extend Expiry</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Recent Clients Table */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Enrolled Clients</h3>
              <p className="text-xs text-slate-500">
                Click any client to modify status, set store limits, and select software modules.
              </p>
            </div>
            <Link
              href="/clients"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5e2b9d] hover:underline"
            >
              <span>View All Clients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Client / Store</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Plan & Stores</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Modules</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => {
                  const exp = client.expiryDate ? new Date(client.expiryDate) : null;
                  const isExpired = exp ? exp.getTime() < Date.now() : false;
                  return (
                    <tr key={client.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#5e2b9d] flex items-center justify-center font-bold text-xs shrink-0">
                            {client.companyName?.slice(0, 2).toUpperCase() || "RN"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{client.companyName}</p>
                            <p className="text-[11px] text-slate-500">{client.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <p className="font-mono">{client.mobile}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {client.email}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10.5px] px-2 py-0.5 rounded-full font-semibold ${
                            client.status === "Active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          ● {client.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-900">{client.plan}</p>
                        <p className="text-[11px] text-purple-700 font-semibold">
                          {client.storesCount || client.stores?.length || 0} / {client.maxStores} Stores
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono text-xs ${
                            isExpired ? "text-rose-600 font-bold" : "text-slate-700"
                          }`}
                        >
                          {client.expiryDate}
                        </span>
                        {isExpired && (
                          <span className="block text-[10px] text-rose-500 font-semibold">
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                          {client.enabledModules?.length || 0} / 11 Modules
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/clients`}
                          className="px-2.5 py-1.5 rounded-md bg-[#5e2b9d] text-white hover:bg-[#4f2385] text-xs font-semibold transition-colors"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
