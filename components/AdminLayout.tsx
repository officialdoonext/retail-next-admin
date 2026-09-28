"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("arumullasivakrishna6@gmail.com");
  const [adminName, setAdminName] = useState("Arumulla SivaKrishna");

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard" || pathname === "/",
    },
    {
      id: "client-plans",
      label: "Client Plans",
      href: "/client-plans",
      icon: CreditCard,
      isActive: pathname === "/client-plans",
    },
    {
      id: "clients",
      label: "Clients",
      href: "/clients",
      icon: Users,
      isActive: pathname === "/clients" || pathname.startsWith("/clients/"),
    },
  ];

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out of the Admin Portal?")) {
      router.push("/");
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#fcfcfd] font-sans text-slate-800 antialiased">
      {/* Top Navbar: ONLY Logo on left, and Login details on right */}
      <header className="h-[60px] shrink-0 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between z-40 shadow-xs">
        {/* Left Side: Mobile Menu Button + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 hover:text-[#5e2b9d] hover:bg-purple-50 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Image
              src="/logo.jpeg"
              alt="RetailNext Logo"
              width={145}
              height={36}
              priority
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-[#5e2b9d] border border-purple-200/60">
              <ShieldCheck className="w-3 h-3" />
              Admin
            </span>
          </Link>
        </div>

        {/* Right Side: ONLY Login Details and Logout Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#5e2b9d] text-white text-xs sm:text-sm font-semibold flex items-center justify-center shadow-xs">
              AR
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight max-w-[130px] sm:max-w-[200px] truncate" title={adminEmail}>
                {adminEmail}
              </span>
              <span className="text-[10.5px] leading-tight text-slate-400 font-medium">
                Administrator
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Logout Icon Button */}
          <button
            type="button"
            onClick={handleLogout}
            title="Log Out"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-slate-200/80 sm:border-transparent"
          >
            <LogOut className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar: ONLY 3 items (Dashboard, Client Plans, Clients) */}
        <aside className="hidden md:flex w-[240px] shrink-0 bg-white border-r border-slate-200/90 flex-col justify-between select-none">
          <div className="p-3">
            <div className="px-3 pt-2 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              MENU
            </div>

            <nav className="space-y-1 mt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13.5px] font-medium transition-all ${
                      item.isActive
                        ? "bg-[#5e2b9d] text-white shadow-xs font-semibold"
                        : "text-slate-600 hover:bg-purple-50/70 hover:text-[#5e2b9d]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        item.isActive ? "text-white" : "text-slate-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer info */}
          <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>RetailNext Central</span>
            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono">v1.2</span>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="w-64 bg-white h-full shadow-2xl flex flex-col justify-between p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    MENU
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <nav className="space-y-1.5 mt-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          item.isActive
                            ? "bg-[#5e2b9d] text-white shadow-xs"
                            : "text-slate-600 hover:bg-purple-50 hover:text-[#5e2b9d]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                <span>RetailNext Admin</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">v1.2</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
