export type MealType = "veg" | "non_veg" | "jain" | "keto";

export type SubscriptionStatus =
  | "active"
  | "paused"
  | "cancelled"
  | "expired";

export interface SubscriptionPlan {
  id: string;
  name: string;
  cycleDays: number;
  priceInPaise: number;
}

export interface CustomerSubscription {
  id: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  preferredMealType: MealType;
  startDateIso: string;
  endDateIso: string;
}

export type ProfileRole = "customer" | "rider" | "kitchen" | "admin";

export type ProfileStatus = "active" | "inactive" | "busy" | "on_delivery" | "suspended" | "pending";

export interface Address {
  id: string;
  label: string;
  street: string;
  area: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface CustomerPreferences {
  mealType: MealType;
  spiceLevel: "mild" | "medium" | "spicy";
  preferredSlot: "lunch" | "dinner" | "both";
  allergies: string[];
  deliveryInstructions?: string;
}

export interface BaseProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: ProfileRole;
  status: ProfileStatus;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface CustomerProfile extends BaseProfile {
  role: "customer";
  addresses: Address[];
  preferences: CustomerPreferences;
  loyaltyPoints: number;
  activeSubscriptionId?: string;
}

export interface RiderProfile extends BaseProfile {
  role: "rider";
  vehicleType: "bike" | "scooter" | "ev";
  vehicleNumber: string;
  drivingLicense: string;
  rating: number;
  totalDeliveries: number;
  activeHub: string;
  currentLat?: number;
  currentLng?: number;
}

export interface KitchenProfile extends BaseProfile {
  role: "kitchen";
  kitchenName: string;
  fssaiLicense: string;
  address: string;
  city: string;
  dailyCapacity: number;
  specialties: MealType[];
  operatingHours: string;
  managerName: string;
  currentOrdersLoad: number;
}

export interface AdminProfile extends BaseProfile {
  role: "admin";
  department: "Operations" | "Kitchen" | "Logistics" | "SuperAdmin" | "Support";
  permissions: string[];
  lastLoginIso?: string;
}

export type UserProfile = CustomerProfile | RiderProfile | KitchenProfile | AdminProfile;

