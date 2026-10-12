import { z } from "zod";
import type { ProfileRole, UserProfile } from "@urbanthali/shared";
import {
  createProfileStore,
  deleteProfileStore,
  getProfileByIdStore,
  getProfileStatsStore,
  listProfilesStore,
  updateProfileStore
} from "./profile.store.js";

export const addressSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1).default("Home"),
  street: z.string().min(3),
  area: z.string().min(2),
  city: z.string().min(2),
  postalCode: z.string().min(4),
  isDefault: z.boolean().default(false)
});

export const customerPreferencesSchema = z.object({
  mealType: z.enum(["veg", "non_veg", "jain", "keto"]).default("veg"),
  spiceLevel: z.enum(["mild", "medium", "spicy"]).default("medium"),
  preferredSlot: z.enum(["lunch", "dinner", "both"]).default("both"),
  allergies: z.array(z.string()).default([]),
  deliveryInstructions: z.string().optional()
});

const baseProfileSchema = {
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  avatarUrl: z.string().url().optional(),
  status: z.enum(["active", "inactive", "busy", "on_delivery", "suspended", "pending"]).default("active")
};

export const createProfileSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("customer"),
    ...baseProfileSchema,
    loyaltyPoints: z.number().int().nonnegative().default(100),
    activeSubscriptionId: z.string().optional(),
    addresses: z.array(addressSchema).default([]),
    preferences: customerPreferencesSchema.default({
      mealType: "veg",
      spiceLevel: "medium",
      preferredSlot: "both",
      allergies: []
    })
  }),
  z.object({
    role: z.literal("rider"),
    ...baseProfileSchema,
    vehicleType: z.enum(["bike", "scooter", "ev"]).default("bike"),
    vehicleNumber: z.string().min(4),
    drivingLicense: z.string().min(5),
    rating: z.number().min(0).max(5).default(5.0),
    totalDeliveries: z.number().int().nonnegative().default(0),
    activeHub: z.string().min(2),
    currentLat: z.number().optional(),
    currentLng: z.number().optional()
  }),
  z.object({
    role: z.literal("kitchen"),
    ...baseProfileSchema,
    kitchenName: z.string().min(3),
    fssaiLicense: z.string().min(6),
    address: z.string().min(5),
    city: z.string().min(2),
    dailyCapacity: z.number().int().positive().default(200),
    specialties: z.array(z.enum(["veg", "non_veg", "jain", "keto"])).min(1),
    operatingHours: z.string().min(3).default("07:00 AM - 10:00 PM"),
    managerName: z.string().min(2),
    currentOrdersLoad: z.number().int().nonnegative().default(0)
  }),
  z.object({
    role: z.literal("admin"),
    ...baseProfileSchema,
    department: z.enum(["Operations", "Kitchen", "Logistics", "SuperAdmin", "Support"]).default("Operations"),
    permissions: z.array(z.string()).min(1).default(["manage_subscriptions", "view_reports"])
  })
]);

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  avatarUrl: z.string().url().optional(),
  status: z.enum(["active", "inactive", "busy", "on_delivery", "suspended", "pending"]).optional(),
  loyaltyPoints: z.number().int().nonnegative().optional(),
  activeSubscriptionId: z.string().optional(),
  addresses: z.array(addressSchema).optional(),
  preferences: customerPreferencesSchema.partial().optional(),
  vehicleType: z.enum(["bike", "scooter", "ev"]).optional(),
  vehicleNumber: z.string().min(4).optional(),
  drivingLicense: z.string().min(5).optional(),
  rating: z.number().min(0).max(5).optional(),
  totalDeliveries: z.number().int().nonnegative().optional(),
  activeHub: z.string().min(2).optional(),
  kitchenName: z.string().min(3).optional(),
  fssaiLicense: z.string().min(6).optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  dailyCapacity: z.number().int().positive().optional(),
  specialties: z.array(z.enum(["veg", "non_veg", "jain", "keto"])).optional(),
  operatingHours: z.string().min(3).optional(),
  managerName: z.string().min(2).optional(),
  department: z.enum(["Operations", "Kitchen", "Logistics", "SuperAdmin", "Support"]).optional(),
  permissions: z.array(z.string()).optional()
});

export function listProfiles(role?: ProfileRole, search?: string): UserProfile[] {
  return listProfilesStore(role, search);
}

export function getProfileById(id: string): UserProfile {
  const profile = getProfileByIdStore(id);
  if (!profile) {
    throw new Error(`Profile with ID '${id}' not found`);
  }
  return profile;
}

export function createProfile(data: z.infer<typeof createProfileSchema>): UserProfile {
  // If customer addresses don't have id, inject one
  if (data.role === "customer" && data.addresses) {
    data.addresses = data.addresses.map((a, i) => ({
      ...a,
      id: a.id ?? `addr-${Date.now()}-${i}`
    }));
  }
  return createProfileStore(data as unknown as Omit<UserProfile, "id" | "createdAtIso" | "updatedAtIso">);
}

export function updateProfile(id: string, updates: z.infer<typeof updateProfileSchema>): UserProfile {
  const existing = getProfileById(id);
  let mergedUpdates: Partial<UserProfile> = { ...updates };

  if (existing.role === "customer" && updates.preferences) {
    mergedUpdates = {
      ...mergedUpdates,
      preferences: {
        ...existing.preferences,
        ...updates.preferences
      }
    };
  }

  return updateProfileStore(id, mergedUpdates);
}

export function deleteProfile(id: string): { success: boolean; id: string } {
  return deleteProfileStore(id);
}

export function getProfileStats() {
  return getProfileStatsStore();
}
