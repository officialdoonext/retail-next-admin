import { Client, ClientPlan, ALL_SOFTWARE_MODULES, ClientStore } from "./types";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

export const DEFAULT_PLANS: ClientPlan[] = [
  {
    id: "starter",
    name: "Starter Retail",
    badge: "Basic",
    description: "Ideal for single boutique stores looking for POS billing and inventory management.",
    monthlyPrice: 999,
    annualPrice: 9990,
    maxStores: 1,
    includedModules: ["pos", "stores", "sales-manager", "product-manager"],
  },
  {
    id: "growth",
    name: "Growth Merchant",
    badge: "Most Popular",
    description: "Perfect for scaling retailers with multiple counters, stock transfers and vendors.",
    monthlyPrice: 2499,
    annualPrice: 24990,
    maxStores: 3,
    includedModules: [
      "pos",
      "stores",
      "sales-manager",
      "product-manager",
      "stock-manager",
      "customer-manager",
      "discount-manager",
      "staff-manager",
    ],
    isPopular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Multi-Branch",
    badge: "Full Power",
    description: "All 11 modules included with comprehensive payroll, attendance and multi-store control.",
    monthlyPrice: 4999,
    annualPrice: 49990,
    maxStores: 6,
    includedModules: ALL_SOFTWARE_MODULES.map((m) => m.id),
  },
  {
    id: "unlimited",
    name: "Apex Enterprise Chain",
    badge: "Enterprise",
    description: "Unlimited scale for retail franchises with high transaction volumes and up to 20 stores.",
    monthlyPrice: 9999,
    annualPrice: 99990,
    maxStores: 20,
    includedModules: ALL_SOFTWARE_MODULES.map((m) => m.id),
  },
];

// Helper to sanitize Firestore doc ID
export function getClientDocId(email: string): string {
  return email.toLowerCase().trim().replace(/[^a-zA-Z0-9_]/g, "_");
}

// Fetch real stores owned by this email
export async function getStoresForClient(email: string): Promise<ClientStore[]> {
  try {
    const storesRef = collection(db, "stores");
    const q = query(storesRef, where("ownerEmail", "==", email.toLowerCase().trim()));
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || "Store Branch",
        code: data.code || "",
        city: data.city || data.location || "",
        location: data.location || data.fullAddress || "",
        mobileNumber: data.mobileNumber || data.phone || "",
        gstNumber: data.gstNumber || data.license || "",
        status: data.status === "Active" ? "Active" : "Inactive",
      };
    });
  } catch (err) {
    console.error("Error querying stores for client:", err);
    return [];
  }
}

// Search clients in Firestore by Name, Email, Mobile number, or Client ID
export async function searchClientsInFirestore(searchQuery: string): Promise<Client[]> {
  const q = searchQuery.toLowerCase().trim();
  if (!q) return [];

  const cleanDigits = q.replace(/\D/g, "");

  try {
    // 1. Fetch real users from Firestore
    const usersRef = collection(db, "users");
    const userSnapshot = await getDocs(usersRef);

    // 2. Also fetch stores to match by store name / phone
    const storesRef = collection(db, "stores");
    const storeSnapshot = await getDocs(storesRef);

    const allStores = storeSnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as any[];

    const matchedClients: Client[] = [];

    for (const docSnap of userSnapshot.docs) {
      const data = docSnap.data();
      const docId = docSnap.id.toLowerCase();
      const email = (data.email || "").toLowerCase();
      const name = (data.name || data.staffName || "").toLowerCase();
      const mobile = (data.mobile || data.phone || "").replace(/\D/g, "");

      // Associated stores for this user
      const clientStores = allStores.filter(
        (s) => (s.ownerEmail || "").toLowerCase() === email
      );

      // Check if any associated store matches query
      const storeMatch = clientStores.some((s) => {
        const sName = (s.name || "").toLowerCase();
        const sPhone = (s.mobileNumber || s.phone || "").replace(/\D/g, "");
        const sCode = (s.code || "").toLowerCase();
        return (
          sName.includes(q) ||
          sCode.includes(q) ||
          (cleanDigits && sPhone.includes(cleanDigits))
        );
      });

      const isMatch =
        docId.includes(q) ||
        email.includes(q) ||
        name.includes(q) ||
        (cleanDigits && mobile.includes(cleanDigits)) ||
        storeMatch;

      if (isMatch) {
        const primaryStore = clientStores[0];
        const statusValue = (data.status || "active").toLowerCase();
        const normalizedStatus =
          statusValue === "active"
            ? "Active"
            : statusValue === "suspended"
            ? "Suspended"
            : "Inactive";

        let expiryDateStr = "2030-12-31";
        if (data.expiryDate) {
          if (typeof data.expiryDate === "string") {
            expiryDateStr = data.expiryDate.split("T")[0];
          } else if (data.expiryDate.seconds) {
            expiryDateStr = new Date(data.expiryDate.seconds * 1000)
              .toISOString()
              .split("T")[0];
          }
        }

        matchedClients.push({
          id: docSnap.id,
          name: data.name || data.staffName || primaryStore?.name || email.split("@")[0],
          companyName: primaryStore?.name || data.companyName || `${data.name || "Client"} Store`,
          email: data.email || docSnap.id,
          mobile: data.mobile || primaryStore?.mobileNumber || primaryStore?.phone || "N/A",
          city: primaryStore?.city || data.city || "Nellore",
          address: primaryStore?.fullAddress || primaryStore?.location || data.address || "",
          gstNumber: primaryStore?.gstNumber || data.gstNumber || "",
          status: normalizedStatus,
          plan: data.plan || "Enterprise Multi-Branch",
          planPrice: data.planPrice || 4999,
          billingCycle: data.billingCycle || "Monthly",
          createdAt: data.createdAt
            ? typeof data.createdAt === "number"
              ? new Date(data.createdAt).toISOString().split("T")[0]
              : String(data.createdAt).split("T")[0]
            : "2026-01-01",
          expiryDate: expiryDateStr,
          maxStores: Number(data.maxStores) || Math.max(clientStores.length, 2),
          storesCount: clientStores.length,
          stores: clientStores.map((s) => ({
            id: s.id,
            name: s.name || "Branch Store",
            code: s.code || "",
            city: s.city || s.location || "",
            location: s.location || s.fullAddress || "",
            mobileNumber: s.mobileNumber || s.phone || "",
            gstNumber: s.gstNumber || s.license || "",
            status: s.status === "Active" ? "Active" : "Inactive",
          })),
          enabledModules:
            Array.isArray(data.enabledModules) && data.enabledModules.length > 0
              ? data.enabledModules
              : ALL_SOFTWARE_MODULES.map((m) => m.id),
          notes: data.notes || "",
        });
      }
    }

    return matchedClients;
  } catch (err) {
    console.error("Error searching Firestore:", err);
    throw err;
  }
}

// Fetch all real clients from Firestore (for dashboard KPI calculations)
export async function getAllRealClients(): Promise<Client[]> {
  try {
    const usersRef = collection(db, "users");
    const userSnapshot = await getDocs(usersRef);

    const storesRef = collection(db, "stores");
    const storeSnapshot = await getDocs(storesRef);

    const allStores = storeSnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as any[];

    const clients: Client[] = [];

    for (const docSnap of userSnapshot.docs) {
      const data = docSnap.data();
      const email = (data.email || "").toLowerCase();
      const clientStores = allStores.filter(
        (s) => (s.ownerEmail || "").toLowerCase() === email
      );

      const primaryStore = clientStores[0];
      const statusValue = (data.status || "active").toLowerCase();
      const normalizedStatus =
        statusValue === "active"
          ? "Active"
          : statusValue === "suspended"
          ? "Suspended"
          : "Inactive";

      let expiryDateStr = "2030-12-31";
      if (data.expiryDate) {
        if (typeof data.expiryDate === "string") {
          expiryDateStr = data.expiryDate.split("T")[0];
        } else if (data.expiryDate.seconds) {
          expiryDateStr = new Date(data.expiryDate.seconds * 1000)
            .toISOString()
            .split("T")[0];
        }
      }

      clients.push({
        id: docSnap.id,
        name: data.name || data.staffName || primaryStore?.name || email.split("@")[0],
        companyName: primaryStore?.name || data.companyName || "Retail Client",
        email: data.email || docSnap.id,
        mobile: data.mobile || primaryStore?.mobileNumber || primaryStore?.phone || "N/A",
        city: primaryStore?.city || data.city || "",
        address: primaryStore?.fullAddress || primaryStore?.location || "",
        gstNumber: primaryStore?.gstNumber || data.gstNumber || "",
        status: normalizedStatus,
        plan: data.plan || "Enterprise Multi-Branch",
        planPrice: data.planPrice || 4999,
        billingCycle: data.billingCycle || "Monthly",
        createdAt: data.createdAt
          ? typeof data.createdAt === "number"
            ? new Date(data.createdAt).toISOString().split("T")[0]
            : String(data.createdAt).split("T")[0]
          : "2026-01-01",
        expiryDate: expiryDateStr,
        maxStores: Number(data.maxStores) || Math.max(clientStores.length, 2),
        storesCount: clientStores.length,
        stores: clientStores.map((s) => ({
          id: s.id,
          name: s.name || "Branch Store",
          code: s.code || "",
          city: s.city || s.location || "",
          location: s.location || s.fullAddress || "",
          mobileNumber: s.mobileNumber || s.phone || "",
          gstNumber: s.gstNumber || s.license || "",
          status: s.status === "Active" ? "Active" : "Inactive",
        })),
        enabledModules:
          Array.isArray(data.enabledModules) && data.enabledModules.length > 0
            ? data.enabledModules
            : ALL_SOFTWARE_MODULES.map((m) => m.id),
        notes: data.notes || "",
      });
    }

    return clients;
  } catch (err) {
    console.error("Error fetching all clients from Firestore:", err);
    return [];
  }
}

// Save real client updates directly to Firestore
export async function saveClientToDb(client: Client): Promise<void> {
  const docId = client.id || getClientDocId(client.email);
  const userRef = doc(db, "users", docId);

  const updatePayload = {
    email: client.email.toLowerCase().trim(),
    name: client.name || "",
    companyName: client.companyName || "",
    mobile: client.mobile || "",
    city: client.city || "",
    address: client.address || "",
    gstNumber: client.gstNumber || "",
    status: client.status.toLowerCase(), // In software auth, it checks status === "active"
    plan: client.plan || "Enterprise Multi-Branch",
    planPrice: client.planPrice || 4999,
    billingCycle: client.billingCycle || "Monthly",
    expiryDate: client.expiryDate,
    maxStores: Number(client.maxStores) || 2,
    enabledModules: client.enabledModules || ALL_SOFTWARE_MODULES.map((m) => m.id),
    notes: client.notes || "",
    updatedAt: Date.now(),
    role: "Admin",
  };

  await setDoc(userRef, updatePayload, { merge: true });
}
