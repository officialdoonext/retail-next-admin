"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { DEFAULT_PLANS } from "@/lib/data-store";
import { ALL_SOFTWARE_MODULES, ClientPlan } from "@/lib/types";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import {
  CreditCard,
  Check,
  Store,
  Layers,
  Sparkles,
  Plus,
  Edit2,
  Users,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function ClientPlansPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<ClientPlan[]>(DEFAULT_PLANS);
  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Annual">("Monthly");
  const [editingPlan, setEditingPlan] = useState<ClientPlan | null>(null);

  // Load any saved custom plans
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("retail_next_admin_plans");
      if (stored) {
        try {
          setPlans(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const updated = plans.map((p) => (p.id === editingPlan.id ? editingPlan : p));
    setPlans(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("retail_next_admin_plans", JSON.stringify(updated));
    }
    showToast("Plan Saved", `Configured ${editingPlan.name} with ${editingPlan.maxStores} stores cap.`, "success");
    setEditingPlan(null);
  };

  const togglePlanModule = (moduleId: string) => {
    if (!editingPlan) return;
    const current = new Set(editingPlan.includedModules || []);
    if (current.has(moduleId)) {
      current.delete(moduleId);
    } else {
      current.add(moduleId);
    }
    setEditingPlan({ ...editingPlan, includedModules: Array.from(current) });
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-7 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Client Subscription Plans
              </h1>
              <span className="text-xs bg-purple-50 text-[#5e2b9d] font-semibold px-2.5 py-0.5 rounded-full border border-purple-200/60">
                {plans.length} Tiers
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configure subscription tiers, maximum allowed stores count, and software module packages for clients.
            </p>
          </div>

          {/* Billing cycle toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setBillingCycle("Monthly")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === "Monthly"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("Annual")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "Annual"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const price = billingCycle === "Monthly" ? plan.monthlyPrice : plan.annualPrice;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl border p-5 flex flex-col justify-between transition-all relative ${
                  plan.isPopular
                    ? "border-[#5e2b9d] shadow-md ring-1 ring-[#5e2b9d]/30"
                    : "border-slate-200 shadow-xs hover:border-slate-300"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-4">
                    <span
                      className={`text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs ${
                        plan.isPopular
                          ? "bg-[#5e2b9d] text-white"
                          : "bg-slate-800 text-white"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-2 mt-1">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {plan.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingPlan(JSON.parse(JSON.stringify(plan)))}
                      className="p-1.5 text-slate-400 hover:text-[#5e2b9d] hover:bg-purple-50 rounded-md transition-colors"
                      title="Edit Plan Configuration"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pricing */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900">
                        ₹{price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500">
                        /{billingCycle === "Monthly" ? "mo" : "yr"}
                      </span>
                    </div>
                  </div>

                  {/* Store Limit Badge */}
                  <div className="mt-3 p-2.5 rounded-lg bg-purple-50/70 border border-purple-200/70 flex items-center gap-2 text-xs">
                    <Store className="w-4 h-4 text-[#5e2b9d] shrink-0" />
                    <span className="text-slate-800 font-semibold">
                      Max Allowed Stores:{" "}
                      <span className="text-[#5e2b9d] font-bold text-sm">
                        {plan.maxStores} {plan.maxStores === 1 ? "Store" : "Stores"}
                      </span>
                    </span>
                  </div>

                  {/* Modules count & list */}
                  <div className="mt-4 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Included Modules</span>
                      <span className="text-[#5e2b9d] font-semibold">
                        {plan.includedModules.length} of {ALL_SOFTWARE_MODULES.length}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      {ALL_SOFTWARE_MODULES.map((m) => {
                        const isIncluded = plan.includedModules.includes(m.id);
                        return (
                          <div
                            key={m.id}
                            className={`flex items-center gap-2 py-0.5 ${
                              isIncluded ? "text-slate-800" : "text-slate-400 line-through opacity-60"
                            }`}
                          >
                            <Check
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isIncluded ? "text-emerald-600" : "text-slate-300"
                              }`}
                            />
                            <span className="truncate">{m.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100">
                  <Link
                    href={`/clients`}
                    className="w-full py-2 rounded-lg bg-slate-50 hover:bg-[#5e2b9d] hover:text-white border border-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Assign to Client</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Edit Plan */}
        {editingPlan && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-[#5e2b9d]" />
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Plan: {editingPlan.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePlan} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#5e2b9d]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Monthly Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={editingPlan.monthlyPrice}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          monthlyPrice: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#5e2b9d]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Max Stores Allowed Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      required
                      value={editingPlan.maxStores}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          maxStores: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#5e2b9d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-2">
                    Included Software Modules ({editingPlan.includedModules.length} selected)
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                    {ALL_SOFTWARE_MODULES.map((m) => {
                      const isSel = editingPlan.includedModules.includes(m.id);
                      return (
                        <label
                          key={m.id}
                          className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-md cursor-pointer text-[11px]"
                        >
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => togglePlanModule(m.id)}
                            className="rounded text-[#5e2b9d] focus:ring-[#5e2b9d]"
                          />
                          <span className="truncate">{m.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#5e2b9d] text-white font-semibold hover:bg-[#4f2385] cursor-pointer shadow-xs"
                  >
                    Save Plan Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
