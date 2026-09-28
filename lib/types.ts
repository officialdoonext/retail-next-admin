export interface ClientModule {
  id: string;
  name: string;
  description: string;
  category: "Core" | "Sales & Commerce" | "Inventory" | "People & Operations";
  subFeatures: string[];
  icon: string;
}

export interface ClientStore {
  id: string;
  name: string;
  code: string;
  city?: string;
  location?: string;
  mobileNumber?: string;
  gstNumber?: string;
  status: "Active" | "Inactive";
}

export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  mobile: string;
  city: string;
  address?: string;
  gstNumber?: string;
  status: "Active" | "Inactive" | "Suspended";
  plan: string;
  planPrice?: number;
  billingCycle?: "Monthly" | "Annual";
  createdAt: string;
  expiryDate: string; // ISO format: YYYY-MM-DD
  maxStores: number; // Maximum stores client is allowed to create in retail-next-software
  storesCount: number;
  stores?: ClientStore[];
  enabledModules: string[]; // List of module IDs enabled for this client
  notes?: string;
}

export interface ClientPlan {
  id: string;
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  maxStores: number;
  includedModules: string[];
  isPopular?: boolean;
}

export const ALL_SOFTWARE_MODULES: ClientModule[] = [
  {
    id: "sales-manager",
    name: "Sales Manager",
    description: "All sales transactions, counter sales, order history & employee attribution",
    category: "Sales & Commerce",
    subFeatures: ["Sales Transactions", "Employee Sales Attribution", "Counter Sales / Terminals"],
    icon: "TrendingUp",
  },
  {
    id: "product-manager",
    name: "Product Manager",
    description: "Product catalog, multi-size/color variations, units & category hierarchies",
    category: "Core",
    subFeatures: ["Categories", "Variations & Attributes", "Product Master Catalog", "Barcode"],
    icon: "Package",
  },
  {
    id: "return-exchange-manager",
    name: "Return & Exchange Manager",
    description: "Customer product returns, replacements, credit notes & size exchanges",
    category: "Sales & Commerce",
    subFeatures: ["Returns & Refunds", "Product Exchanges", "Credit Notes"],
    icon: "RefreshCw",
  },
  {
    id: "stock-manager",
    name: "Stock Manager",
    description: "Central warehouse, inventory counts, barcode scanning & inter-store transfers",
    category: "Inventory",
    subFeatures: ["Warehouse Management", "Live Stock Levels", "Stock Transfers"],
    icon: "Boxes",
  },
  {
    id: "customer-manager",
    name: "Customer Manager",
    description: "Customer directory, individual transaction profiles & loyalty history",
    category: "Sales & Commerce",
    subFeatures: ["Customer Directory", "Individual Profiles & History"],
    icon: "Users",
  },
  {
    id: "discount-manager",
    name: "Discount Manager",
    description: "Cart discount coupons, product-specific offers & customer reward codes",
    category: "Sales & Commerce",
    subFeatures: ["Order Coupons", "Product Coupons", "Customer Coupons"],
    icon: "Tag",
  },
  {
    id: "vendors-manager",
    name: "Vendors Manager",
    description: "Supplier directory, purchase orders, vendor invoices & pending dues tracking",
    category: "Inventory",
    subFeatures: ["Vendors Directory", "Vendor Orders", "Vendor Invoices", "Vendor Dues"],
    icon: "Building2",
  },
  {
    id: "staff-manager",
    name: "Staff Manager",
    description: "POS terminal cashiers, user credentials & role-based page permissions",
    category: "People & Operations",
    subFeatures: ["Staff Directory", "Terminal Logins", "Granular Access Permissions"],
    icon: "UserCheck",
  },
  {
    id: "employee-manager",
    name: "Employee Manager",
    description: "Staff master, daily attendance, payroll generation, ID cards, leaves & advances",
    category: "People & Operations",
    subFeatures: ["Employee Profiles", "Attendance Logs", "Payroll Processing", "ID Card Generator", "Leaves", "Salary Advances"],
    icon: "Briefcase",
  },
  {
    id: "pos",
    name: "POS Billing Module",
    description: "High-speed thermal receipt checkout, barcode scanner support & instant billing",
    category: "Core",
    subFeatures: ["Fast Billing Terminal", "Thermal Printing", "Saved Carts & Barcodes"],
    icon: "Receipt",
  },
  {
    id: "stores",
    name: "Stores & Branch Manager",
    description: "Multi-branch store creation, GST registrations & branch-specific data",
    category: "Core",
    subFeatures: ["Branch Creation", "Branch Switcher", "Store Details & GST"],
    icon: "Store",
  },
];
