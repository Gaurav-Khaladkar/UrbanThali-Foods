import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import type { MealType, ProfileRole, UserProfile } from "@urbanthali/shared";

type Screen = "login" | "register" | "home" | "payment" | "mapping" | "delivery" | "profile";

interface Delivery {
  id: string;
  customerName: string;
  status: "assigned" | "picked_up" | "in_transit" | "delivered" | "failed";
  etaMinutes: number;
}

const API_URL = "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error ?? "Request failed");
  }

  return json as T;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [message, setMessage] = useState("Welcome to UrbanThali");

  // Auth State
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("admin@proapp.local");
  const [password, setPassword] = useState("Admin@123");
  const [token, setToken] = useState("");

  // Payment State
  const [amount, setAmount] = useState("199");
  const [paymentId, setPaymentId] = useState("");
  const [otp, setOtp] = useState("1234");
  const [routeInfo, setRouteInfo] = useState("");

  // Delivery State
  const [deliveryName, setDeliveryName] = useState("Aarav");
  const [deliveryPhone, setDeliveryPhone] = useState("9999999999");
  const [deliveryAddress, setDeliveryAddress] = useState("Baner, Pune");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  // Multi-Role Profiles State
  const [activeRole, setActiveRole] = useState<ProfileRole>("customer");
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  // Profile Edit Inputs
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editMealType, setEditMealType] = useState<MealType>("veg");
  const [editSpice, setEditSpice] = useState<"mild" | "medium" | "spicy">("medium");
  const [editSlot, setEditSlot] = useState<"lunch" | "dinner" | "both">("both");
  const [editAddress, setEditAddress] = useState("");
  const [editVehicleNumber, setEditVehicleNumber] = useState("");
  const [editKitchenName, setEditKitchenName] = useState("");

  // Quick Create Profile State
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    onLoadProfiles(activeRole);
  }, [activeRole]);

  function syncEditState(p: UserProfile) {
    setSelectedProfile(p);
    setEditName(p.name);
    setEditEmail(p.email);
    setEditPhone(p.phone);
    setEditStatus(p.status);

    if (p.role === "customer") {
      setEditMealType(p.preferences.mealType);
      setEditSpice(p.preferences.spiceLevel);
      setEditSlot(p.preferences.preferredSlot);
      if (p.addresses && p.addresses[0]) {
        setEditAddress(`${p.addresses[0].street}, ${p.addresses[0].area}, ${p.addresses[0].city}`);
      } else {
        setEditAddress("Shivajinagar, Pune");
      }
    } else if (p.role === "rider") {
      setEditVehicleNumber(p.vehicleNumber);
    } else if (p.role === "kitchen") {
      setEditKitchenName(p.kitchenName);
    }
  }

  async function onLoadProfiles(role: ProfileRole = activeRole): Promise<void> {
    try {
      const result = await request<{ data: UserProfile[] }>(`/profiles?role=${role}`);
      setProfiles(result.data);
      if (result.data.length > 0) {
        syncEditState(result.data[0]);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load profiles");
    }
  }

  async function onSaveProfile(): Promise<void> {
    if (!selectedProfile) return;
    try {
      const updates: Record<string, unknown> = {
        name: editName,
        email: editEmail,
        phone: editPhone,
        status: editStatus
      };

      if (selectedProfile.role === "customer") {
        updates.preferences = {
          mealType: editMealType,
          spiceLevel: editSpice,
          preferredSlot: editSlot
        };
      } else if (selectedProfile.role === "rider") {
        updates.vehicleNumber = editVehicleNumber;
      } else if (selectedProfile.role === "kitchen") {
        updates.kitchenName = editKitchenName;
      }

      const result = await request<{ message: string; data: UserProfile }>(`/profiles/${selectedProfile.id}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
      });
      setMessage(`Success: ${result.message}`);
      await onLoadProfiles(activeRole);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile update failed");
    }
  }

  async function onCreateQuickProfile(): Promise<void> {
    if (!newName || !newEmail || !newPhone) {
      setMessage("Please fill Name, Email, and Phone to create profile.");
      return;
    }
    try {
      let payload: Record<string, unknown> = {
        name: newName,
        email: newEmail,
        phone: newPhone,
        role: activeRole,
        status: "active"
      };

      if (activeRole === "customer") {
        payload = {
          ...payload,
          loyaltyPoints: 100,
          addresses: [
            {
              label: "Home",
              street: "Main Street",
              area: "Kothrud",
              city: "Pune",
              postalCode: "411038",
              isDefault: true
            }
          ],
          preferences: {
            mealType: "veg",
            spiceLevel: "medium",
            preferredSlot: "both",
            allergies: []
          }
        };
      } else if (activeRole === "rider") {
        payload = {
          ...payload,
          vehicleType: "bike",
          vehicleNumber: "MH 12 AB 7788",
          drivingLicense: "MH12-20230009",
          rating: 5.0,
          totalDeliveries: 0,
          activeHub: "Pune Central Hub"
        };
      } else if (activeRole === "kitchen") {
        payload = {
          ...payload,
          kitchenName: `${newName} Hub`,
          fssaiLicense: "FSSAI-214000000000",
          address: "Food Park, Pune",
          city: "Pune",
          dailyCapacity: 250,
          specialties: ["veg"],
          operatingHours: "07:00 AM - 10:00 PM",
          managerName: newName,
          currentOrdersLoad: 0
        };
      } else if (activeRole === "admin") {
        payload = {
          ...payload,
          department: "Operations",
          permissions: ["manage_subscriptions", "view_reports"]
        };
      }

      const res = await request<{ message: string; data: UserProfile }>("/profiles", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setMessage(res.message);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setShowCreate(false);
      await onLoadProfiles(activeRole);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Creation failed");
    }
  }

  async function onRegisterAdmin(): Promise<void> {
    try {
      const result = await request<{ message: string; data: { email: string } }>("/auth/admin/register", {
        method: "POST",
        body: JSON.stringify({
          name: adminName || "Admin User",
          email,
          password
        })
      });
      setMessage(`${result.message}: ${result.data.email}`);
      setScreen("login");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed");
    }
  }

  async function onLogin(): Promise<void> {
    try {
      const result = await request<{ data: { token: string; email: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setToken(result.data.token);
      setMessage(`Logged in as ${result.data.email}`);
      setScreen("home");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    }
  }

  function onLogout(): void {
    setToken("");
    setMessage("Logged out successfully");
    setScreen("login");
  }

  async function onCreatePayment(): Promise<void> {
    try {
      const result = await request<{ data: { id: string } }>("/payments/create-intent", {
        method: "POST",
        body: JSON.stringify({
          amountInr: Number(amount),
          method: "upi",
          customerEmail: email
        })
      });
      setPaymentId(result.data.id);
      setMessage("Payment intent created. Confirm with OTP 1234.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment creation failed");
    }
  }

  async function onConfirmPayment(): Promise<void> {
    try {
      const result = await request<{ message: string }>("/payments/confirm", {
        method: "POST",
        body: JSON.stringify({
          paymentId,
          otp
        })
      });
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment confirm failed");
    }
  }

  async function onGenerateRoute(): Promise<void> {
    try {
      const result = await request<{ data: { distanceKm: number; etaMinutes: number } }>("/navigation/route", {
        method: "POST",
        body: JSON.stringify({
          start: { lat: 18.5204, lng: 73.8567 },
          end: { lat: 18.5314, lng: 73.8446 }
        })
      });
      setRouteInfo(`${result.data.distanceKm} km | ETA ${result.data.etaMinutes} min`);
      setMessage("Navigation route loaded");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Route request failed");
    }
  }

  async function onCreateDelivery(): Promise<void> {
    try {
      await request("/deliveries", {
        method: "POST",
        body: JSON.stringify({
          customerName: deliveryName,
          customerPhone: deliveryPhone,
          address: deliveryAddress,
          riderName: "Ravi Rider",
          start: { lat: 18.5204, lng: 73.8567 },
          end: { lat: 18.5314, lng: 73.8446 }
        })
      });
      setMessage("Delivery order created");
      await onRefreshDeliveries();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delivery create failed");
    }
  }

  async function onRefreshDeliveries(): Promise<void> {
    try {
      const result = await request<{ data: Delivery[] }>("/deliveries");
      setDeliveries(result.data);
      setMessage("Delivery list refreshed");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delivery fetch failed");
    }
  }

  const navButton = (target: Screen, label: string) => (
    <Pressable style={[styles.navBtn, screen === target && styles.navBtnActive]} onPress={() => setScreen(target)}>
      <Text style={styles.navBtnText}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>UrbanThali Mobile</Text>
            <Text style={styles.headerSub}>
              Customer & Operations App {isAuthenticated ? "| Authenticated" : "| Guest Mode"}
            </Text>
          </View>
          {isAuthenticated && (
            <Pressable style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {screen === "login" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Admin Login</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} />
            <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" style={styles.input} />
            <Pressable style={styles.primaryBtn} onPress={onLogin}>
              <Text style={styles.primaryBtnText}>Login</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => setScreen("register")}>
              <Text style={styles.secondaryBtnText}>Go to Admin Registration</Text>
            </Pressable>
            <Pressable style={styles.accentBtn} onPress={() => setScreen("profile")}>
              <Text style={styles.accentBtnText}>Explore Profiles Directory</Text>
            </Pressable>
          </View>
        )}

        {screen === "register" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Admin Registration</Text>
            <TextInput value={adminName} onChangeText={setAdminName} placeholder="Full Name" style={styles.input} />
            <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} />
            <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" style={styles.input} />
            <Pressable style={styles.primaryBtn} onPress={onRegisterAdmin}>
              <Text style={styles.primaryBtnText}>Register Admin</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => setScreen("login")}>
              <Text style={styles.secondaryBtnText}>Back to Login</Text>
            </Pressable>
          </View>
        )}

        {screen === "home" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Operations Dashboard</Text>
            <Text style={styles.copy}>All major platform modules are connected to backend services.</Text>
            <View style={styles.featureGrid}>
              <Text style={styles.feature}>Navigation API: Active</Text>
              <Text style={styles.feature}>Payment Gateway: Sandbox Active</Text>
              <Text style={styles.feature}>Delivery Tracking: Active</Text>
              <Text style={styles.feature}>Profiles Module: Multi-Role Active</Text>
            </View>
            <Pressable style={styles.primaryBtn} onPress={() => setScreen("profile")}>
              <Text style={styles.primaryBtnText}>Open Multi-Role Profiles</Text>
            </Pressable>
          </View>
        )}

        {screen === "profile" && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionTitle}>Multi-Role Profile Hub</Text>
              <Pressable
                style={styles.smallOutlineBtn}
                onPress={() => setShowCreate(!showCreate)}
              >
                <Text style={styles.smallOutlineBtnText}>{showCreate ? "Close" : "+ New Profile"}</Text>
              </Pressable>
            </View>

            {/* Role Switcher Tabs */}
            <View style={styles.roleTabsContainer}>
              {(["customer", "kitchen", "rider", "admin"] as const).map((r) => (
                <Pressable
                  key={r}
                  style={[styles.roleTab, activeRole === r && styles.roleTabActive]}
                  onPress={() => setActiveRole(r)}
                >
                  <Text style={[styles.roleTabText, activeRole === r && styles.roleTabTextActive]}>
                    {r.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Quick Create Collapsible Form */}
            {showCreate && (
              <View style={styles.createBox}>
                <Text style={styles.subHeading}>Create New {activeRole.toUpperCase()} Profile</Text>
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Full Name"
                  style={styles.input}
                />
                <TextInput
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="Email Address"
                  style={styles.input}
                  keyboardType="email-address"
                />
                <TextInput
                  value={newPhone}
                  onChangeText={setNewPhone}
                  placeholder="Phone Number (+91...)"
                  style={styles.input}
                />
                <Pressable style={styles.primaryBtn} onPress={onCreateQuickProfile}>
                  <Text style={styles.primaryBtnText}>Save New Profile</Text>
                </Pressable>
              </View>
            )}

            {/* Active Profile Card */}
            {selectedProfile && (
              <View style={styles.profileBox}>
                <View style={styles.profileHeader}>
                  <Image
                    source={{
                      uri:
                        selectedProfile.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(selectedProfile.name)}`
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.profileHeaderTextCol}>
                    <Text style={styles.profileName}>{selectedProfile.name}</Text>
                    <Text style={styles.profileMeta}>{selectedProfile.email}</Text>
                    <View style={styles.badgeRow}>
                      <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>{selectedProfile.role.toUpperCase()}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          selectedProfile.status === "active" ? styles.statusActive : styles.statusWarning
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>{selectedProfile.status}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Editable Fields */}
                <Text style={styles.fieldLabel}>Display Name</Text>
                <TextInput value={editName} onChangeText={setEditName} style={styles.input} />

                <Text style={styles.fieldLabel}>Phone Number</Text>
                <TextInput value={editPhone} onChangeText={setEditPhone} style={styles.input} />

                {/* Customer Specific Controls */}
                {selectedProfile.role === "customer" && (
                  <>
                    <Text style={styles.fieldLabel}>Dietary Meal Preference</Text>
                    <View style={styles.pillRow}>
                      {(["veg", "non_veg", "jain", "keto"] as const).map((meal) => (
                        <Pressable
                          key={meal}
                          style={[styles.pillBtn, editMealType === meal && styles.pillBtnActive]}
                          onPress={() => setEditMealType(meal)}
                        >
                          <Text
                            style={[styles.pillBtnText, editMealType === meal && styles.pillBtnTextActive]}
                          >
                            {meal.replace("_", " ").toUpperCase()}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={styles.fieldLabel}>Spice Level</Text>
                    <View style={styles.pillRow}>
                      {(["mild", "medium", "spicy"] as const).map((sp) => (
                        <Pressable
                          key={sp}
                          style={[styles.pillBtn, editSpice === sp && styles.pillBtnActive]}
                          onPress={() => setEditSpice(sp)}
                        >
                          <Text style={[styles.pillBtnText, editSpice === sp && styles.pillBtnTextActive]}>
                            {sp.toUpperCase()}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={styles.fieldLabel}>Preferred Delivery Slot</Text>
                    <View style={styles.pillRow}>
                      {(["lunch", "dinner", "both"] as const).map((sl) => (
                        <Pressable
                          key={sl}
                          style={[styles.pillBtn, editSlot === sl && styles.pillBtnActive]}
                          onPress={() => setEditSlot(sl)}
                        >
                          <Text style={[styles.pillBtnText, editSlot === sl && styles.pillBtnTextActive]}>
                            {sl.toUpperCase()}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={styles.fieldLabel}>Default Delivery Address</Text>
                    <TextInput value={editAddress} onChangeText={setEditAddress} style={styles.input} />
                  </>
                )}

                {/* Rider Specific Controls */}
                {selectedProfile.role === "rider" && (
                  <>
                    <Text style={styles.fieldLabel}>Vehicle Registration Plate</Text>
                    <TextInput
                      value={editVehicleNumber}
                      onChangeText={setEditVehicleNumber}
                      style={styles.input}
                    />
                    <View style={styles.metaRow}>
                      <Text style={styles.copy}>
                        Rating: ⭐ {selectedProfile.rating} | Hub: {selectedProfile.activeHub}
                      </Text>
                      <Text style={styles.copy}>
                        Total Deliveries: {selectedProfile.totalDeliveries}
                      </Text>
                    </View>
                  </>
                )}

                {/* Kitchen Specific Controls */}
                {selectedProfile.role === "kitchen" && (
                  <>
                    <Text style={styles.fieldLabel}>Cloud Kitchen Name</Text>
                    <TextInput
                      value={editKitchenName}
                      onChangeText={setEditKitchenName}
                      style={styles.input}
                    />
                    <View style={styles.metaRow}>
                      <Text style={styles.copy}>
                        License: {selectedProfile.fssaiLicense} | Cap: {selectedProfile.dailyCapacity}/day
                      </Text>
                      <Text style={styles.copy}>
                        Hours: {selectedProfile.operatingHours}
                      </Text>
                    </View>
                  </>
                )}

                {/* Admin Specific Controls */}
                {selectedProfile.role === "admin" && (
                  <View style={styles.metaRow}>
                    <Text style={styles.copy}>Department: {selectedProfile.department}</Text>
                    <Text style={styles.copy}>
                      Permissions: {selectedProfile.permissions.join(", ")}
                    </Text>
                  </View>
                )}

                <Pressable style={styles.primaryBtn} onPress={onSaveProfile}>
                  <Text style={styles.primaryBtnText}>Save Profile Updates</Text>
                </Pressable>
              </View>
            )}

            {/* Profile Directory List */}
            <Text style={[styles.subHeading, { marginTop: 12 }]}>
              All {activeRole.toUpperCase()} Profiles in Directory ({profiles.length})
            </Text>
            {profiles.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.dirCard, selectedProfile?.id === p.id && styles.dirCardActive]}
                onPress={() => syncEditState(p)}
              >
                <View style={styles.dirRow}>
                  <View>
                    <Text style={styles.dirName}>{p.name}</Text>
                    <Text style={styles.dirSub}>{p.phone} | {p.email}</Text>
                  </View>
                  <View style={styles.smallPill}>
                    <Text style={styles.smallPillText}>{selectedProfile?.id === p.id ? "Selected" : "Switch"}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {screen === "payment" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Gateway</Text>
            <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Amount in INR" style={styles.input} />
            <Pressable style={styles.primaryBtn} onPress={onCreatePayment}>
              <Text style={styles.primaryBtnText}>Create Payment Intent</Text>
            </Pressable>
            <TextInput value={paymentId} onChangeText={setPaymentId} placeholder="Payment ID" style={styles.input} />
            <TextInput value={otp} onChangeText={setOtp} placeholder="OTP (1234)" style={styles.input} />
            <Pressable style={styles.primaryBtn} onPress={onConfirmPayment}>
              <Text style={styles.primaryBtnText}>Confirm Payment</Text>
            </Pressable>
          </View>
        )}

        {screen === "mapping" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mapping and GPS Route</Text>
            <Text style={styles.copy}>Start: Pune Station | End: Baner</Text>
            <Pressable style={styles.primaryBtn} onPress={onGenerateRoute}>
              <Text style={styles.primaryBtnText}>Generate Route</Text>
            </Pressable>
            {routeInfo ? <Text style={styles.highlight}>Route: {routeInfo}</Text> : null}
          </View>
        )}

        {screen === "delivery" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Delivery System</Text>
            <TextInput value={deliveryName} onChangeText={setDeliveryName} placeholder="Customer Name" style={styles.input} />
            <TextInput value={deliveryPhone} onChangeText={setDeliveryPhone} placeholder="Customer Phone" style={styles.input} />
            <TextInput value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder="Address" style={styles.input} />
            <Pressable style={styles.primaryBtn} onPress={onCreateDelivery}>
              <Text style={styles.primaryBtnText}>Create Delivery</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={onRefreshDeliveries}>
              <Text style={styles.secondaryBtnText}>Refresh Deliveries</Text>
            </Pressable>
            {deliveries.map((delivery) => (
              <View key={delivery.id} style={styles.deliveryCard}>
                <Text style={styles.deliveryTitle}>
                  {delivery.customerName} - {delivery.status}
                </Text>
                <Text style={styles.copy}>ETA: {delivery.etaMinutes} min</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navButton("home", "Home")}
        {navButton("profile", "Profiles")}
        {navButton("payment", "Payment")}
        {navButton("mapping", "Route")}
        {navButton("delivery", "Delivery")}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{message}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220"
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  logoutBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 1,
    borderColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  logoutBtnText: {
    color: "#fca5a5",
    fontSize: 12,
    fontWeight: "600"
  },
  headerTitle: {
    color: "#f8fbff",
    fontSize: 20,
    fontWeight: "700"
  },
  headerSub: {
    color: "#a9bdd8",
    marginTop: 4,
    fontSize: 13
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 14
  },
  card: {
    backgroundColor: "#f7faff",
    borderRadius: 16,
    padding: 16,
    gap: 12
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#13203b"
  },
  subHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e3a6a",
    marginVertical: 4
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginTop: 4
  },
  input: {
    borderWidth: 1,
    borderColor: "#c9d6ec",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#ffffff",
    fontSize: 14,
    color: "#0f172a"
  },
  primaryBtn: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4
  },
  primaryBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14
  },
  secondaryBtn: {
    backgroundColor: "#dde7f8",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center"
  },
  secondaryBtnText: {
    color: "#12326c",
    fontWeight: "600",
    fontSize: 14
  },
  accentBtn: {
    backgroundColor: "#059669",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center"
  },
  accentBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14
  },
  smallOutlineBtn: {
    borderWidth: 1,
    borderColor: "#1d4ed8",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  smallOutlineBtnText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "600"
  },
  copy: {
    color: "#334155",
    fontSize: 13
  },
  featureGrid: {
    gap: 8
  },
  feature: {
    color: "#1f3e7a",
    fontWeight: "600"
  },
  highlight: {
    color: "#0f3f8f",
    fontWeight: "700"
  },
  roleTabsContainer: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    padding: 3,
    gap: 4
  },
  roleTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center"
  },
  roleTabActive: {
    backgroundColor: "#1d4ed8"
  },
  roleTabText: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "700"
  },
  roleTabTextActive: {
    color: "#ffffff"
  },
  profileBox: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8
  },
  profileHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 6
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#cbd5e1"
  },
  profileHeaderTextCol: {
    flex: 1,
    gap: 2
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a"
  },
  profileMeta: {
    fontSize: 12,
    color: "#64748b"
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 3
  },
  roleBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  roleBadgeText: {
    color: "#1e40af",
    fontSize: 10,
    fontWeight: "700"
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  statusActive: {
    backgroundColor: "#dcfce7"
  },
  statusWarning: {
    backgroundColor: "#fef3c7"
  },
  statusBadgeText: {
    color: "#15803d",
    fontSize: 10,
    fontWeight: "700"
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2
  },
  pillBtn: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  pillBtnActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#1d4ed8"
  },
  pillBtnText: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "600"
  },
  pillBtnTextActive: {
    color: "#ffffff"
  },
  metaRow: {
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 8,
    gap: 4,
    marginTop: 4
  },
  dirCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10
  },
  dirCardActive: {
    borderColor: "#1d4ed8",
    backgroundColor: "#eff6ff"
  },
  dirRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  dirName: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 14
  },
  dirSub: {
    color: "#64748b",
    fontSize: 12
  },
  smallPill: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  smallPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155"
  },
  createBox: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    gap: 8
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 38,
    backgroundColor: "#0f172a",
    borderTopColor: "#2a3652",
    borderTopWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  navBtn: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#192944",
    alignItems: "center"
  },
  navBtnActive: {
    backgroundColor: "#1d4ed8"
  },
  navBtnText: {
    color: "#dbeafe",
    fontWeight: "600",
    fontSize: 11
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  footerText: {
    color: "#dbeafe",
    fontSize: 11
  },
  deliveryCard: {
    borderWidth: 1,
    borderColor: "#d5e1f4",
    borderRadius: 10,
    padding: 10
  },
  deliveryTitle: {
    color: "#0f172a",
    fontWeight: "700"
  }
});
