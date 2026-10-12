import { randomUUID } from "node:crypto";
import type {
  AdminProfile,
  CustomerProfile,
  KitchenProfile,
  ProfileRole,
  RiderProfile,
  UserProfile
} from "@urbanthali/shared";

export const initialProfiles: UserProfile[] = [
  {
    id: "cust-101",
    name: "Gaurav Khaladkar",
    email: "gaurav@urbanthali.com",
    phone: "+91 98765 43210",
    role: "customer",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80",
    loyaltyPoints: 450,
    activeSubscriptionId: "sub-9001",
    addresses: [
      {
        id: "addr-1",
        label: "Home",
        street: "Flat 402, Shivajinagar Heights",
        area: "Shivajinagar",
        city: "Pune",
        postalCode: "411005",
        isDefault: true
      },
      {
        id: "addr-2",
        label: "Office",
        street: "Tower B, Quadron Business Park",
        area: "Hinjawadi Phase 2",
        city: "Pune",
        postalCode: "411057",
        isDefault: false
      }
    ],
    preferences: {
      mealType: "veg",
      spiceLevel: "medium",
      preferredSlot: "both",
      allergies: ["Peanuts"],
      deliveryInstructions: "Leave with security at main gate if unavailable."
    },
    createdAtIso: "2026-03-01T10:00:00.000Z",
    updatedAtIso: "2026-04-10T12:30:00.000Z"
  },
  {
    id: "cust-102",
    name: "Ananya Sharma",
    email: "ananya.sharma@gmail.com",
    phone: "+91 98220 11223",
    role: "customer",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
    loyaltyPoints: 280,
    activeSubscriptionId: "sub-9002",
    addresses: [
      {
        id: "addr-3",
        label: "Home",
        street: "B-12, Kumar Park Residences",
        area: "Baner",
        city: "Pune",
        postalCode: "411045",
        isDefault: true
      }
    ],
    preferences: {
      mealType: "jain",
      spiceLevel: "mild",
      preferredSlot: "lunch",
      allergies: [],
      deliveryInstructions: "Ring bell twice."
    },
    createdAtIso: "2026-03-15T09:20:00.000Z",
    updatedAtIso: "2026-04-05T14:10:00.000Z"
  },
  {
    id: "kitchen-201",
    name: "Annapurna Cloud Kitchen",
    email: "kitchen.annapurna@urbanthali.com",
    phone: "+91 99234 56789",
    role: "kitchen",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=160&q=80",
    kitchenName: "Annapurna Central Hub #1",
    fssaiLicense: "FSSAI-21422010000456",
    address: "Plot 45, Food Tech Park, Senapati Bapat Road",
    city: "Pune",
    dailyCapacity: 500,
    specialties: ["veg", "jain"],
    operatingHours: "06:00 AM - 10:30 PM",
    managerName: "Chef Rajesh Sawant",
    currentOrdersLoad: 142,
    createdAtIso: "2026-01-10T08:00:00.000Z",
    updatedAtIso: "2026-04-12T07:15:00.000Z"
  },
  {
    id: "kitchen-202",
    name: "SpiceCraft Royal Kitchen",
    email: "spicecraft@urbanthali.com",
    phone: "+91 99750 98765",
    role: "kitchen",
    status: "busy",
    avatarUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=160&q=80",
    kitchenName: "SpiceCraft Premium Kitchen",
    fssaiLicense: "FSSAI-11523023000892",
    address: "Unit 12, Phoenix Marketcity Area, Viman Nagar",
    city: "Pune",
    dailyCapacity: 350,
    specialties: ["non_veg", "keto"],
    operatingHours: "07:00 AM - 11:00 PM",
    managerName: "Chef Meera Kulkarni",
    currentOrdersLoad: 289,
    createdAtIso: "2026-02-01T11:00:00.000Z",
    updatedAtIso: "2026-04-11T16:45:00.000Z"
  },
  {
    id: "rider-301",
    name: "Ravi Kumar",
    email: "ravi.rider@urbanthali.com",
    phone: "+91 97654 32109",
    role: "rider",
    status: "on_delivery",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
    vehicleType: "ev",
    vehicleNumber: "MH 12 QW 4821",
    drivingLicense: "MH12-2021004921",
    rating: 4.9,
    totalDeliveries: 1240,
    activeHub: "Baner Delivery Hub",
    currentLat: 18.5204,
    currentLng: 73.8567,
    createdAtIso: "2026-01-20T10:30:00.000Z",
    updatedAtIso: "2026-04-12T13:40:00.000Z"
  },
  {
    id: "rider-302",
    name: "Amit Singh",
    email: "amit.rider@urbanthali.com",
    phone: "+91 91234 56780",
    role: "rider",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    vehicleType: "bike",
    vehicleNumber: "MH 14 ER 7712",
    drivingLicense: "MH14-2022008819",
    rating: 4.8,
    totalDeliveries: 890,
    activeHub: "Kothrud Central Hub",
    currentLat: 18.5074,
    currentLng: 73.8077,
    createdAtIso: "2026-02-14T09:00:00.000Z",
    updatedAtIso: "2026-04-12T11:20:00.000Z"
  },
  {
    id: "admin-401",
    name: "Pooja Patil",
    email: "pooja.patil@urbanthali.com",
    phone: "+91 98901 23456",
    role: "admin",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80",
    department: "Operations",
    permissions: [
      "manage_subscriptions",
      "dispatch_orders",
      "kitchen_oversight",
      "rider_allocation",
      "financial_reports"
    ],
    lastLoginIso: "2026-04-12T14:30:00.000Z",
    createdAtIso: "2026-01-01T00:00:00.000Z",
    updatedAtIso: "2026-04-12T14:30:00.000Z"
  },
  {
    id: "admin-402",
    name: "Vikram Malhotra",
    email: "vikram.m@urbanthali.com",
    phone: "+91 98888 77777",
    role: "admin",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80",
    department: "Logistics",
    permissions: ["rider_allocation", "route_optimization", "fleet_telematics"],
    lastLoginIso: "2026-04-12T11:15:00.000Z",
    createdAtIso: "2026-01-15T08:00:00.000Z",
    updatedAtIso: "2026-04-12T11:15:00.000Z"
  }
];

export const profileStore: UserProfile[] = [...initialProfiles];

export function listProfilesStore(role?: ProfileRole, search?: string): UserProfile[] {
  return profileStore.filter((profile) => {
    if (role && profile.role !== role) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const matchName = profile.name.toLowerCase().includes(q);
      const matchEmail = profile.email.toLowerCase().includes(q);
      const matchPhone = profile.phone.toLowerCase().includes(q);
      const matchCity =
        profile.role === "kitchen"
          ? profile.city.toLowerCase().includes(q)
          : profile.role === "customer"
          ? profile.addresses.some((a: { city: string; area: string }) => a.city.toLowerCase().includes(q) || a.area.toLowerCase().includes(q))
          : false;
      return matchName || matchEmail || matchPhone || matchCity;
    }
    return true;
  });
}

export function getProfileByIdStore(id: string): UserProfile | undefined {
  return profileStore.find((p) => p.id === id);
}

export function createProfileStore(input: Omit<UserProfile, "id" | "createdAtIso" | "updatedAtIso">): UserProfile {
  const now = new Date().toISOString();
  const id = `${input.role}-${randomUUID().slice(0, 8)}`;
  const newProfile = {
    ...input,
    id,
    createdAtIso: now,
    updatedAtIso: now
  } as UserProfile;

  profileStore.push(newProfile);
  return newProfile;
}

export function updateProfileStore(id: string, updates: Partial<UserProfile>): UserProfile {
  const index = profileStore.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Profile not found for ID: ${id}`);
  }

  const existing = profileStore[index];
  const updated = {
    ...existing,
    ...updates,
    id: existing.id,
    role: existing.role, // role remains immutable
    updatedAtIso: new Date().toISOString()
  } as UserProfile;

  profileStore[index] = updated;
  return updated;
}

export function deleteProfileStore(id: string): { success: boolean; id: string } {
  const index = profileStore.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Profile not found for ID: ${id}`);
  }
  profileStore.splice(index, 1);
  return { success: true, id };
}

export function getProfileStatsStore() {
  const total = profileStore.length;
  const customers = profileStore.filter((p) => p.role === "customer").length;
  const riders = profileStore.filter((p) => p.role === "rider").length;
  const kitchens = profileStore.filter((p) => p.role === "kitchen").length;
  const admins = profileStore.filter((p) => p.role === "admin").length;

  const activeCount = profileStore.filter((p) => p.status === "active" || p.status === "on_delivery").length;

  return {
    total,
    customers,
    riders,
    kitchens,
    admins,
    activeCount
  };
}
