"use client";

import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Client, ALL_SOFTWARE_MODULES } from "@/lib/types";
import {
  searchClientsInFirestore,
  saveClientToDb,
  DEFAULT_PLANS,
} from "@/lib/data-store";
import { useToast } from "@/components/Toast";
import {
  Search,
  Users,
  Store,
  Calendar,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  Layers,
  Save,
  RefreshCw,
  TrendingUp,
  Package,
  Boxes,
  Tag,
  UserCheck,
  Briefcase,
  Receipt,
  ShieldAlert,
  ArrowRight,
  X,
  AlertCircle,
} from "lucide-react";

export default function ClientsPage() {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Client[]>([]);

  // Selected client for inspection and editing
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editDraft, setEditDraft] = useState<Client | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Perform search against real Firestore database
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryTerm = searchQuery.trim();
    if (!queryTerm) {
      showToast("Search Input Required", "Please enter a Name, Email, or Client ID to search", "info");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setSelectedClient(null);
    setEditDraft(null);
    setIsDirty(false);

    try {
      const results = await searchClientsInFirestore(queryTerm);
      setSearchResults(results);

      if (results.length === 1) {
        // Automatically select if exact single match
        setSelectedClient(results[0]);
        setEditDraft(JSON.parse(JSON.stringify(results[0])));
      } else if (results.length === 0) {
        showToast("No Client Found", `No record found matching "${queryTerm}" in Firestore`, "error");
      }
    } catch (err) {
      console.error("Firestore search error:", err);
      showToast("Search Failed", "Could not query Firestore database. Check connection.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (client: Client) => {
    setSelectedClient(client);
    setEditDraft(JSON.parse(JSON.stringify(client)));
    setIsDirty(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setHasSearched(false);
    setSearchResults([]);
    setSelectedClient(null);
    setEditDraft(null);
    setIsDirty(false);
  };

  // Update field in draft
  const updateDraftField = <K extends keyof Client>(key: K, value: Client[K]) => {
    if (!editDraft) return;
    setEditDraft((prev) => {
      if (!prev) return null;
      return { ...prev, [key]: value };
    });
    setIsDirty(true);
  };

  // Quick Extend Expiry Date
  const handleExtendExpiry = (daysToAdd: number) => {
    if (!editDraft) return;
    const baseDate = editDraft.expiryDate ? new Date(editDraft.expiryDate) : new Date();
    const effectiveBase = baseDate.getTime() < Date.now() ? new Date() : baseDate;
    effectiveBase.setDate(effectiveBase.getDate() + daysToAdd);
    const newDateStr = effectiveBase.toISOString().split("T")[0];
    updateDraftField("expiryDate", newDateStr);
    showToast("Expiry Extended", `Subscription extended by ${daysToAdd} days to ${newDateStr}`, "info");
  };

  // Toggle Module
  const handleToggleModule = (moduleId: string) => {
    if (!editDraft) return;
    const current = new Set(editDraft.enabledModules || []);
    if (current.has(moduleId)) {
      current.delete(moduleId);
    } else {
      current.add(moduleId);
    }
    updateDraftField("enabledModules", Array.from(current));
  };

  // Select / Deselect All Modules
  const handleSelectAllModules = (enable: boolean) => {
    if (!editDraft) return;
    if (enable) {
      updateDraftField("enabledModules", ALL_SOFTWARE_MODULES.map((m) => m.id));
    } else {
      updateDraftField("enabledModules", ["pos", "stores"]);
    }
  };

  // Save client changes directly to Firestore
  const handleSaveClient = async () => {
    if (!editDraft) return;
    setIsSaving(true);
    try {
      await saveClientToDb(editDraft);
      setSelectedClient(JSON.parse(JSON.stringify(editDraft)));
      setIsDirty(false);
      showToast(
        "Client Updated in Firestore",
        `Changes saved for ${editDraft.companyName || editDraft.name}. Expiry, store limit & modules synchronized live.`,
        "success"
      );
    } catch (err) {
      console.error("Failed to save client to Firestore:", err);
      showToast("Save Failed", "Could not synchronize client changes to Firestore", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Expiry countdown calculation
  const getExpiryDetails = (expiryDateStr: string) => {
    if (!expiryDateStr) return { text: "No expiry set", isExpired: false, days: 0 };
    const exp = new Date(expiryDateStr);
    const now = new Date();
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Expired ${Math.abs(diffDays)} days ago`, isExpired: true, days: diffDays };
    }
    if (diffDays === 0) {
      return { text: "Expires today", isExpired: false, days: 0 };
    }
    return { text: `Valid for ${diffDays} more days`, isExpired: false, days: diffDays };
  };

  // Module Icon mapper
  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case "TrendingUp":
        return <TrendingUp className="w-5 h-5" />;
      case "Package":
        return <Package className="w-5 h-5" />;
      case "RefreshCw":
        return <RefreshCw className="w-5 h-5" />;
      case "Boxes":
        return <Boxes className="w-5 h-5" />;
      case "Users":
        return <Users className="w-5 h-5" />;
      case "Tag":
        return <Tag className="w-5 h-5" />;
      case "Building2":
        return <Building2 className="w-5 h-5" />;
      case "UserCheck":
        return <UserCheck className="w-5 h-5" />;
      case "Briefcase":
        return <Briefcase className="w-5 h-5" />;
      case "Receipt":
        return <Receipt className="w-5 h-5" />;
      case "Store":
        return <Store className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-7 max-w-7xl mx-auto w-full space-y-6">
        {/* Search Header Banner */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="max-w-3xl">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Client Search & Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Search by client name, email, mobile number, or Client ID to look up real records in Firestore.
            </p>
          </div>

          {/* Search Form with Search Button */}
          <form onSubmit={handleSearch} className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Client Name, Email, or Client ID... (e.g. arumullasivakrishna6@gmail.com, Doonext, 9874859632)"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5e2b9d]/30 focus:border-[#5e2b9d] transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 rounded-lg bg-[#5e2b9d] hover:bg-[#4f2385] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              {isSearching ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>{isSearching ? "Searching..." : "Search Client"}</span>
            </button>
          </form>

          {/* Quick Search Hints */}
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
            <span>Try searching:</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("arumullasivakrishna6@gmail.com");
              }}
              className="text-[#5e2b9d] hover:underline font-mono bg-purple-50 px-2 py-0.5 rounded"
            >
              arumullasivakrishna6@gmail.com
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("official.gamanext@gmail.com");
              }}
              className="text-[#5e2b9d] hover:underline font-mono bg-purple-50 px-2 py-0.5 rounded"
            >
              official.gamanext@gmail.com
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("Doonext");
              }}
              className="text-[#5e2b9d] hover:underline font-mono bg-purple-50 px-2 py-0.5 rounded"
            >
              Doonext
            </button>
          </div>
        </div>

        {/* Multiple Results Selector (if search returned > 1 match) */}
        {hasSearched && searchResults.length > 1 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Found {searchResults.length} Matching Clients (Click to inspect)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleSelectResult(client)}
                    className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-purple-50 border-[#5e2b9d] ring-1 ring-[#5e2b9d]"
                        : "bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {client.companyName || client.name}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                          {client.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{client.email}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{client.storesCount} Stores</span>
                      <span className="text-[#5e2b9d] font-semibold flex items-center gap-1">
                        Select <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* DEFAULT STATE: No search made yet */}
        {!hasSearched && (
          <div className="bg-white rounded-xl border border-slate-200/90 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#5e2b9d] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Search to Load Client Data</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Use the search bar above to look up any client by Name, Email, or Client ID. Real data will be queried live from Firestore.
            </p>
          </div>
        )}

        {/* NO RESULTS STATE */}
        {hasSearched && searchResults.length === 0 && !isSearching && (
          <div className="bg-white rounded-xl border border-rose-200/80 p-12 text-center shadow-xs bg-rose-50/20">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No Client Found</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
              No real client record matching &ldquo;{searchQuery}&rdquo; exists in Firestore. Please verify the client email, name, or ID and try again.
            </p>
          </div>
        )}

        {/* CLIENT DETAILS DISPLAY (Shown once client is found and selected) */}
        {editDraft && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Banner */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5e2b9d] to-[#8c4be0] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {editDraft.companyName?.slice(0, 2).toUpperCase() || "RN"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        {editDraft.companyName}
                      </h2>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                          editDraft.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : editDraft.status === "Inactive"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        ● {editDraft.status}
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                        Plan: {editDraft.plan}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client ID: <span className="font-mono text-slate-700 font-semibold">{editDraft.id}</span> • Email: <strong className="text-slate-800">{editDraft.email}</strong>
                    </p>
                  </div>
                </div>

                {/* Save button */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                  {isDirty && (
                    <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 animate-pulse">
                      Unsaved Changes
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveClient}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5e2b9d] hover:bg-[#4f2385] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSaving ? "Saving to Firestore..." : "Save All Changes"}</span>
                  </button>
                </div>
              </div>

              {/* Quick Info bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{editDraft.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{editDraft.mobile}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{editDraft.city || "Nellore"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono truncate">{editDraft.gstNumber || "No GST"}</span>
                </div>
              </div>
            </div>

            {/* SECTION 1: General Details & Expiry Management */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#5e2b9d]" />
                  <h3 className="text-base font-bold text-slate-900">
                    Client Details & Expiry Configuration
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Update fields and click Save</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store / Company Name
                  </label>
                  <input
                    type="text"
                    value={editDraft.companyName || ""}
                    onChange={(e) => updateDraftField("companyName", e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5e2b9d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={editDraft.name || ""}
                    onChange={(e) => updateDraftField("name", e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5e2b9d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Login Email (Admin)
                  </label>
                  <input
                    type="email"
                    value={editDraft.email || ""}
                    onChange={(e) => updateDraftField("email", e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5e2b9d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={editDraft.mobile || ""}
                    onChange={(e) => updateDraftField("mobile", e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5e2b9d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={editDraft.city || ""}
                    onChange={(e) => updateDraftField("city", e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5e2b9d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={editDraft.gstNumber || ""}
                    onChange={(e) => updateDraftField("gstNumber", e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5e2b9d] uppercase font-mono"
                  />
                </div>
              </div>

              {/* Status and Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-800">
                      Software Account Access Status
                    </label>
                    <span className="text-[11px] text-slate-400">Controls software login</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Active", "Inactive", "Suspended"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateDraftField("status", st)}
                        className={`py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          editDraft.status === st
                            ? st === "Active"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : st === "Inactive"
                              ? "bg-amber-600 text-white shadow-xs"
                              : "bg-rose-600 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-800 mb-2">
                    Subscription Plan Tier
                  </label>
                  <select
                    value={editDraft.plan}
                    onChange={(e) => updateDraftField("plan", e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#5e2b9d]"
                  >
                    {DEFAULT_PLANS.map((plan) => (
                      <option key={plan.id} value={plan.name}>
                        {plan.name} (Max {plan.maxStores} Stores • ₹{plan.monthlyPrice}/mo)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expiry Date Section */}
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#5e2b9d]" />
                    <span className="text-xs font-bold text-slate-900">
                      Subscription Expiry Date
                    </span>
                    {(() => {
                      const expInfo = getExpiryDetails(editDraft.expiryDate);
                      return (
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            expInfo.isExpired
                              ? "bg-rose-100 text-rose-800"
                              : expInfo.days <= 30
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {expInfo.text}
                        </span>
                      );
                    })()}
                  </div>
                  <span className="text-[11px] text-slate-500">Format: YYYY-MM-DD</span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative sm:w-60">
                    <input
                      type="date"
                      value={editDraft.expiryDate || ""}
                      onChange={(e) => updateDraftField("expiryDate", e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e2b9d]/30 font-mono font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline">
                      Quick Extend:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleExtendExpiry(30)}
                      className="px-2.5 py-1.5 rounded-md bg-white border border-purple-200 text-xs font-medium text-[#5e2b9d] hover:bg-purple-100 transition-colors cursor-pointer"
                    >
                      +30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExtendExpiry(90)}
                      className="px-2.5 py-1.5 rounded-md bg-white border border-purple-200 text-xs font-medium text-[#5e2b9d] hover:bg-purple-100 transition-colors cursor-pointer"
                    >
                      +90 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExtendExpiry(180)}
                      className="px-2.5 py-1.5 rounded-md bg-white border border-purple-200 text-xs font-medium text-[#5e2b9d] hover:bg-purple-100 transition-colors cursor-pointer"
                    >
                      +6 Months
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExtendExpiry(365)}
                      className="px-2.5 py-1.5 rounded-md bg-white border border-purple-200 text-xs font-medium text-[#5e2b9d] hover:bg-purple-100 transition-colors cursor-pointer"
                    >
                      +1 Year
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: TOTAL NUMBER OF STORES COUNT (STRICTLY ABOVE THE MODULES) */}
            <div className="bg-white rounded-xl border-2 border-purple-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#5e2b9d] text-white flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Total Allowed Stores Count & Branch Limit
                    </h3>
                    <p className="text-xs text-slate-500">
                      In retail-next-software, this client can only create up to this maximum count of stores.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-[#5e2b9d] font-semibold border border-purple-200">
                    Currently Created: {editDraft.stores?.length || 0} Stores
                  </span>
                </div>
              </div>

              {/* Stepper and Presets */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Max Stores Allowed
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateDraftField(
                          "maxStores",
                          Math.max(1, (editDraft.maxStores || 1) - 1)
                        )
                      }
                      className="w-10 h-10 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-base flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={editDraft.maxStores || 1}
                      onChange={(e) =>
                        updateDraftField(
                          "maxStores",
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-24 h-10 text-center font-bold text-lg bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5e2b9d]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateDraftField("maxStores", (editDraft.maxStores || 1) + 1)
                      }
                      className="w-10 h-10 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-base flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Quick Preset Limit
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[1, 2, 3, 5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => updateDraftField("maxStores", num)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          editDraft.maxStores === num
                            ? "bg-[#5e2b9d] text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-purple-50 hover:text-[#5e2b9d]"
                        }`}
                      >
                        {num} {num === 1 ? "Store" : "Stores"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Informational Alert */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Software Enforcement Rule:</strong> In the client&rsquo;s retail-next-software application, store registration is strictly restricted. The client can create a maximum of <strong>{editDraft.maxStores} {editDraft.maxStores === 1 ? "store" : "stores"}</strong> only. Attempts to create additional stores will be blocked.
                </div>
              </div>

              {/* Client's Real Stores in Firestore */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Client&rsquo;s Real Branches in Database ({editDraft.stores?.length || 0})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Usage: {editDraft.stores?.length || 0} of {editDraft.maxStores} allowed
                  </span>
                </div>

                {!editDraft.stores || editDraft.stores.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    No store branches found in Firestore for this client email yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {editDraft.stores.map((store) => (
                      <div
                        key={store.id}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[11px] font-mono font-semibold text-slate-400">
                              {store.code || store.id.slice(0, 8)}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                              {store.name}
                            </h4>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              store.status === "Active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            ● {store.status}
                          </span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {store.mobileNumber || "N/A"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {store.id.slice(0, 10)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {store.city || store.location || "Branch Location"}
                            </span>
                          </div>
                          {store.gstNumber && (
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                                <FileText className="w-3 h-3 text-slate-400" />
                                GST: {store.gstNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: SOFTWARE MODULES CONFIGURATION (MANAGERS) */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#5e2b9d] flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Software Modules Configuration (Managers)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select which managers will appear in this client&rsquo;s RetailNext software sidebar and dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAllModules(true)}
                    className="px-3 py-1.5 rounded-md bg-purple-50 hover:bg-purple-100 text-xs font-semibold text-[#5e2b9d] transition-colors cursor-pointer"
                  >
                    Enable All (11)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAllModules(false)}
                    className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    Core Only
                  </button>
                </div>
              </div>

              {/* Module Active Count Summary */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">
                  Active Modules for {editDraft.companyName}:{" "}
                  <span className="text-[#5e2b9d]">
                    {editDraft.enabledModules?.length || 0} of {ALL_SOFTWARE_MODULES.length} enabled
                  </span>
                </span>
                <span className="text-slate-500 hidden sm:inline">
                  Only selected modules are visible in the client&rsquo;s software session
                </span>
              </div>

              {/* Modules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {ALL_SOFTWARE_MODULES.map((module) => {
                  const isEnabled = (editDraft.enabledModules || []).includes(module.id);
                  return (
                    <div
                      key={module.id}
                      onClick={() => handleToggleModule(module.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                        isEnabled
                          ? "bg-purple-50/40 border-purple-300 ring-1 ring-[#5e2b9d]/20 shadow-xs"
                          : "bg-white border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                isEnabled
                                  ? "bg-[#5e2b9d] text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {getModuleIcon(module.icon)}
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                                {module.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 uppercase font-medium">
                                {module.category}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center px-0.5 ${
                              isEnabled ? "bg-[#5e2b9d]" : "bg-slate-300"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                                isEnabled ? "translate-x-4.5" : "translate-x-0.5"
                              }`}
                            />
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-2">
                          {module.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1 flex-wrap">
                          {module.subFeatures.map((sub, i) => (
                            <span
                              key={i}
                              className={`text-[9.5px] px-1.5 py-0.5 rounded font-medium ${
                                isEnabled
                                  ? "bg-white text-[#5e2b9d] border border-purple-200"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {sub}
                            </span>
                          ))}
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[10.5px]">
                          <span
                            className={`font-semibold ${
                              isEnabled ? "text-emerald-700" : "text-slate-400"
                            }`}
                          >
                            {isEnabled ? "✓ Enabled in Client Dashboard" : "✕ Disabled / Hidden"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sticky Save Bar */}
            {isDirty && (
              <div className="sticky bottom-4 z-30 bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold">
                      Unsaved updates for {editDraft.companyName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Stores Limit: {editDraft.maxStores} • Active Modules: {editDraft.enabledModules?.length} • Expiry: {editDraft.expiryDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedClient) setEditDraft(JSON.parse(JSON.stringify(selectedClient)));
                      setIsDirty(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveClient}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg bg-[#5e2b9d] hover:bg-[#4f2385] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "Saving..." : "Save to Firestore"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
