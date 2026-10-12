import { useEffect, useMemo, useState } from "react";
import type {
  AdminProfile,
  CustomerProfile,
  KitchenProfile,
  MealType,
  ProfileRole,
  ProfileStatus,
  RiderProfile,
  UserProfile
} from "@urbanthali/shared";
import heroOps from "./assets/hero-ops.svg";
import mapPreview from "./assets/map-preview.svg";

type Page = "dashboard" | "admin-registration" | "login" | "payments" | "mapping" | "delivery" | "profiles";
type MessageTone = "success" | "danger" | "warning" | "info";

interface Delivery {
  id: string;
  customerName: string;
  status: "assigned" | "picked_up" | "in_transit" | "delivered" | "failed";
  etaMinutes: number;
}

interface Notice {
  tone: MessageTone;
  text: string;
}

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const defaultNotice: Notice = { tone: "info", text: "Professional control panel ready." };

function normalizePage(value: string): Page {
  const clean = value.replace("#", "") as Page;
  const supported: Page[] = [
    "dashboard",
    "admin-registration",
    "login",
    "payments",
    "mapping",
    "delivery",
    "profiles"
  ];
  return supported.includes(clean) ? clean : "dashboard";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const message = typeof data === "object" && data !== null && "error" in data ? String(data.error) : "Request failed";
    throw new Error(message);
  }

  return data as T;
}

export default function App() {
  const [page, setPage] = useState<Page>(() => normalizePage(window.location.hash));
  const [notice, setNotice] = useState<Notice>(defaultNotice);
  const [token, setToken] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [routeSummary, setRouteSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  // Multi-Role Profiles State
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [profileStats, setProfileStats] = useState({
    total: 0,
    customers: 0,
    riders: 0,
    kitchens: 0,
    admins: 0,
    activeCount: 0
  });
  const [roleFilter, setRoleFilter] = useState<"all" | ProfileRole>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [createRole, setCreateRole] = useState<ProfileRole>("customer");

  useEffect(() => {
    const onHashChange = () => setPage(normalizePage(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navItems = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
      { key: "profiles", label: "Multi-Role Profiles", icon: "bi-people-fill" },
      { key: "admin-registration", label: "Admin Registration", icon: "bi-person-vcard" },
      { key: "login", label: "Login", icon: "bi-shield-lock" },
      { key: "payments", label: "Payment Gateway", icon: "bi-credit-card-2-front" },
      { key: "mapping", label: "Mapping API", icon: "bi-geo-alt" },
      { key: "delivery", label: "Delivery System", icon: "bi-truck" }
    ] as const,
    []
  );

  function navigate(next: Page): void {
    window.location.hash = next;
    setPage(next);
  }

  function showNotice(tone: MessageTone, text: string): void {
    setNotice({ tone, text });
  }

  async function withLoader(action: () => Promise<void>): Promise<void> {
    setLoading(true);
    try {
      await action();
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminRegistration(formData: FormData): Promise<void> {
    await withLoader(async () => {
      const payload = {
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        password: String(formData.get("password"))
      };
      const result = await request<{ message: string; data: { email: string } }>("/auth/admin/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      showNotice("success", `${result.message} (${result.data.email})`);
      navigate("login");
    });
  }

  async function handleLogin(formData: FormData): Promise<void> {
    await withLoader(async () => {
      const payload = {
        email: String(formData.get("email")),
        password: String(formData.get("password"))
      };
      const result = await request<{ message: string; data: { token: string; email: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setToken(result.data.token);
      showNotice("success", `Logged in as ${result.data.email}`);
      navigate("dashboard");
    });
  }

  async function handleCreatePayment(formData: FormData): Promise<void> {
    await withLoader(async () => {
      const payload = {
        amountInr: Number(formData.get("amountInr")),
        method: String(formData.get("method")) as "card" | "upi" | "netbanking",
        customerEmail: String(formData.get("customerEmail"))
      };
      const result = await request<{ data: { id: string; status: string } }>("/payments/create-intent", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setPaymentId(result.data.id);
      showNotice("info", `Intent created (${result.data.status}). Demo OTP: 1234`);
    });
  }

  async function handleConfirmPayment(formData: FormData): Promise<void> {
    await withLoader(async () => {
      const payload = {
        paymentId: String(formData.get("paymentId")),
        otp: String(formData.get("otp"))
      };
      const result = await request<{ message: string; data: { status: string } }>("/payments/confirm", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      showNotice(result.data.status === "authorized" ? "success" : "warning", `${result.message} (${result.data.status})`);
    });
  }

  async function handleGenerateRoute(formData: FormData): Promise<void> {
    await withLoader(async () => {
      const payload = {
        start: {
          lat: Number(formData.get("startLat")),
          lng: Number(formData.get("startLng"))
        },
        end: {
          lat: Number(formData.get("endLat")),
          lng: Number(formData.get("endLng"))
        }
      };
      const result = await request<{ data: { distanceKm: number; etaMinutes: number; points: unknown[] } }>(
        "/navigation/route",
        {
          method: "POST",
          body: JSON.stringify(payload)
        }
      );
      setRouteSummary(
        `${result.data.distanceKm} km route | ETA ${result.data.etaMinutes} min | ${result.data.points.length} GPS points`
      );
      showNotice("success", "Route generated from mapping API.");
    });
  }

  async function handleCreateDelivery(formData: FormData): Promise<void> {
    await withLoader(async () => {
      const payload = {
        customerName: String(formData.get("customerName")),
        customerPhone: String(formData.get("customerPhone")),
        address: String(formData.get("address")),
        riderName: String(formData.get("riderName")),
        start: {
          lat: Number(formData.get("startLat")),
          lng: Number(formData.get("startLng"))
        },
        end: {
          lat: Number(formData.get("endLat")),
          lng: Number(formData.get("endLng"))
        }
      };
      await request("/deliveries", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      showNotice("success", "Delivery order created.");
      await loadDeliveries();
    });
  }

  async function loadDeliveries(): Promise<void> {
    await withLoader(async () => {
      const result = await request<{ data: Delivery[] }>("/deliveries");
      setDeliveries(result.data);
      showNotice("info", `Loaded ${result.data.length} delivery record(s).`);
    });
  }

  async function updateDeliveryStatus(id: string, status: Delivery["status"]): Promise<void> {
    await withLoader(async () => {
      await request(`/deliveries/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      showNotice("success", `Delivery ${id.slice(0, 8)} updated to ${status}.`);
      await loadDeliveries();
    });
  }

  async function loadProfiles(role = roleFilter, search = searchQuery): Promise<void> {
    await withLoader(async () => {
      const params = new URLSearchParams();
      if (role !== "all") params.append("role", role);
      if (search.trim()) params.append("search", search.trim());
      const query = params.toString() ? `?${params.toString()}` : "";
      const result = await request<{ data: UserProfile[]; count: number }>(`/profiles${query}`);
      setProfiles(result.data);

      const statsRes = await request<{ data: typeof profileStats }>("/profiles/stats");
      setProfileStats(statsRes.data);
    });
  }

  useEffect(() => {
    loadProfiles("all", "");
  }, []);

  useEffect(() => {
    if (page === "profiles") {
      loadProfiles(roleFilter, searchQuery);
    }
  }, [page, roleFilter]);

  async function handleCreateProfile(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await withLoader(async () => {
      const formData = new FormData(event.currentTarget);
      const role = createRole;
      let payload: Record<string, unknown> = {
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        phone: String(formData.get("phone")),
        role,
        status: String(formData.get("status") || "active")
      };

      if (role === "customer") {
        payload = {
          ...payload,
          loyaltyPoints: Number(formData.get("loyaltyPoints") || 100),
          addresses: [
            {
              label: String(formData.get("addressLabel") || "Home"),
              street: String(formData.get("street") || "Main Street"),
              area: String(formData.get("area") || "Kothrud"),
              city: String(formData.get("city") || "Pune"),
              postalCode: String(formData.get("postalCode") || "411038"),
              isDefault: true
            }
          ],
          preferences: {
            mealType: (formData.get("mealType") as MealType) || "veg",
            spiceLevel: (formData.get("spiceLevel") as "mild" | "medium" | "spicy") || "medium",
            preferredSlot: (formData.get("preferredSlot") as "lunch" | "dinner" | "both") || "both",
            allergies: formData.get("allergies")
              ? String(formData.get("allergies"))
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
            deliveryInstructions: String(formData.get("deliveryInstructions") || "")
          }
        };
      } else if (role === "rider") {
        payload = {
          ...payload,
          vehicleType: (formData.get("vehicleType") as "bike" | "scooter" | "ev") || "bike",
          vehicleNumber: String(formData.get("vehicleNumber") || "MH 12 AB 1234"),
          drivingLicense: String(formData.get("drivingLicense") || "MH12-20230012"),
          rating: 5.0,
          totalDeliveries: 0,
          activeHub: String(formData.get("activeHub") || "Pune Central Hub")
        };
      } else if (role === "kitchen") {
        payload = {
          ...payload,
          kitchenName: String(formData.get("kitchenName") || "Urban Cloud Kitchen"),
          fssaiLicense: String(formData.get("fssaiLicense") || "FSSAI-214000000000"),
          address: String(formData.get("address") || "Commercial Hub"),
          city: String(formData.get("city") || "Pune"),
          dailyCapacity: Number(formData.get("dailyCapacity") || 300),
          specialties: [(formData.get("specialty") as MealType) || "veg"],
          operatingHours: String(formData.get("operatingHours") || "07:00 AM - 10:00 PM"),
          managerName: String(formData.get("managerName") || "Head Chef"),
          currentOrdersLoad: 0
        };
      } else if (role === "admin") {
        payload = {
          ...payload,
          department:
            (formData.get("department") as "Operations" | "Kitchen" | "Logistics" | "SuperAdmin" | "Support") ||
            "Operations",
          permissions: ["manage_subscriptions", "view_reports", "profile_management"]
        };
      }

      const res = await request<{ message: string; data: UserProfile }>("/profiles", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      showNotice("success", res.message);
      setIsCreatingProfile(false);
      await loadProfiles(roleFilter, searchQuery);
    });
  }

  async function handleUpdateProfile(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!editingProfile) return;
    await withLoader(async () => {
      const formData = new FormData(event.currentTarget);
      const updates: Record<string, unknown> = {
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        phone: String(formData.get("phone")),
        status: String(formData.get("status"))
      };

      if (editingProfile.role === "customer") {
        updates.preferences = {
          mealType: formData.get("mealType") as MealType,
          spiceLevel: formData.get("spiceLevel") as "mild" | "medium" | "spicy",
          preferredSlot: formData.get("preferredSlot") as "lunch" | "dinner" | "both"
        };
      } else if (editingProfile.role === "rider") {
        updates.vehicleType = formData.get("vehicleType") as "bike" | "scooter" | "ev";
        updates.vehicleNumber = String(formData.get("vehicleNumber"));
        updates.activeHub = String(formData.get("activeHub"));
      } else if (editingProfile.role === "kitchen") {
        updates.kitchenName = String(formData.get("kitchenName"));
        updates.dailyCapacity = Number(formData.get("dailyCapacity"));
        updates.operatingHours = String(formData.get("operatingHours"));
      } else if (editingProfile.role === "admin") {
        updates.department = String(formData.get("department"));
      }

      const res = await request<{ message: string; data: UserProfile }>(`/profiles/${editingProfile.id}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
      });
      showNotice("success", res.message);
      setEditingProfile(null);
      await loadProfiles(roleFilter, searchQuery);
    });
  }

  async function handleDeleteProfile(id: string, name: string): Promise<void> {
    if (!window.confirm(`Are you sure you want to delete profile for "${name}"?`)) return;
    await withLoader(async () => {
      await request(`/profiles/${id}`, { method: "DELETE" });
      showNotice("info", `Profile for ${name} deleted.`);
      await loadProfiles(roleFilter, searchQuery);
    });
  }

  async function handleToggleStatus(profile: UserProfile): Promise<void> {
    await withLoader(async () => {
      const nextStatus: ProfileStatus = profile.status === "active" ? "inactive" : "active";
      await request(`/profiles/${profile.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus })
      });
      showNotice("success", `${profile.name} status updated to ${nextStatus}.`);
      await loadProfiles(roleFilter, searchQuery);
    });
  }

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg navbar-dark app-navbar shadow-sm">
        <div className="container-xxl">
          <a className="navbar-brand d-flex align-items-center gap-2" href="#dashboard" onClick={() => navigate("dashboard")}>
            <span className="brand-dot" />
            <span>UrbanThali Pro Panel</span>
          </a>
          <span className="navbar-text text-light small">API: {apiBase}</span>
        </div>
      </nav>

      <div className="container-xxl py-4">
        <div className="row g-4">
          <aside className="col-xl-3 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-3">
                <div className="small text-uppercase text-muted fw-semibold mb-2">Navigation</div>
                <div className="list-group list-group-flush">
                  {navItems.map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      className={`list-group-item list-group-item-action rounded-3 border-0 d-flex align-items-center gap-2 mb-1 ${
                        page === item.key ? "active nav-active" : ""
                      }`}
                      onClick={() => navigate(item.key)}
                    >
                      <i className={`bi ${item.icon}`} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="col-xl-9 col-lg-8">
            <div className={`alert alert-${notice.tone} border-0 shadow-sm`} role="alert">
              <div className="d-flex justify-content-between align-items-center">
                <span>{notice.text}</span>
                <span className="badge text-bg-dark">
                  Session: {token ? `${token.slice(0, 8)}...` : "not logged in"}
                </span>
              </div>
            </div>

            {page === "dashboard" && (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="row g-0">
                  <div className="col-md-7 p-4 p-lg-5">
                    <h2 className="fw-bold mb-2">Professional Operations Dashboard</h2>
                    <p className="text-muted mb-4">
                      Bootstrap UI, working navigation, API-connected forms, and delivery/payment controls.
                    </p>
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <div className="metric-card">
                          <i className="bi bi-credit-card-2-front text-primary" />
                          <div>
                            <div className="metric-label">Payment Gateway</div>
                            <div className="metric-value">Connected</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="metric-card">
                          <i className="bi bi-geo-alt text-success" />
                          <div>
                            <div className="metric-label">Mapping API</div>
                            <div className="metric-value">Working</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="metric-card">
                          <i className="bi bi-truck text-warning" />
                          <div>
                            <div className="metric-label">Delivery Engine</div>
                            <div className="metric-value">Live Status</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="metric-card">
                          <i className="bi bi-shield-check text-info" />
                          <div>
                            <div className="metric-label">Admin Auth</div>
                            <div className="metric-value">Secured</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div
                          className="metric-card bg-primary text-white border-0 shadow-sm"
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate("profiles")}
                        >
                          <i className="bi bi-people-fill text-white fs-3" />
                          <div className="d-flex flex-column flex-grow-1">
                            <div className="text-white-50 text-uppercase small fw-semibold">Multi-Role Profile Hub</div>
                            <div className="fw-bold fs-6">
                              {profileStats.total > 0
                                ? `${profileStats.total} Profiles Active (${profileStats.customers} Customers, ${profileStats.kitchens} Kitchens, ${profileStats.riders} Riders)`
                                : "Manage Customers, Kitchens, Riders & Staff"}
                            </div>
                          </div>
                          <span className="badge bg-white text-primary fw-semibold px-3 py-2">
                            Manage Profiles <i className="bi bi-arrow-right ms-1"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-5 hero-panel d-flex align-items-center justify-content-center p-4">
                    <img src={heroOps} alt="Operations dashboard illustration" className="img-fluid rounded-4" />
                  </div>
                </div>
              </div>
            )}

            {page === "admin-registration" && (
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <h3 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-person-vcard text-primary" />
                    Admin Registration
                  </h3>
                  <form
                    className="row g-3"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      try {
                        await handleAdminRegistration(new FormData(event.currentTarget));
                      } catch (error) {
                        showNotice("danger", error instanceof Error ? error.message : "Admin registration failed.");
                      }
                    }}
                  >
                    <div className="col-md-6">
                      <label className="form-label">Full Name</label>
                      <input className="form-control form-control-lg" name="name" placeholder="Operations Manager" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input className="form-control form-control-lg" name="email" type="email" placeholder="admin@company.com" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Password</label>
                      <input
                        className="form-control form-control-lg"
                        name="password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="col-12">
                      <button className="btn btn-primary btn-lg px-4" type="submit" disabled={loading}>
                        <i className="bi bi-person-plus me-2" />
                        Register Admin
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {page === "login" && (
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <h3 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-shield-lock text-success" />
                    Login
                  </h3>
                  <form
                    className="row g-3"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      try {
                        await handleLogin(new FormData(event.currentTarget));
                      } catch (error) {
                        showNotice("danger", error instanceof Error ? error.message : "Login failed.");
                      }
                    }}
                  >
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input className="form-control form-control-lg" name="email" type="email" placeholder="admin@proapp.local" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Password</label>
                      <input className="form-control form-control-lg" name="password" type="password" placeholder="Admin@123" required />
                    </div>
                    <div className="col-12">
                      <button className="btn btn-success btn-lg px-4" type="submit" disabled={loading}>
                        <i className="bi bi-box-arrow-in-right me-2" />
                        Login
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {page === "payments" && (
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <h3 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-credit-card-2-front text-primary" />
                    Payment Gateway
                  </h3>
                  <form
                    className="row g-3 mb-4"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      try {
                        await handleCreatePayment(new FormData(event.currentTarget));
                      } catch (error) {
                        showNotice("danger", error instanceof Error ? error.message : "Payment creation failed.");
                      }
                    }}
                  >
                    <div className="col-md-4">
                      <label className="form-label">Customer Email</label>
                      <input className="form-control" name="customerEmail" type="email" defaultValue="customer@example.com" required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Amount (INR)</label>
                      <input className="form-control" name="amountInr" type="number" min={1} defaultValue={499} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Method</label>
                      <select className="form-select" name="method" defaultValue="upi">
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                        <option value="netbanking">Netbanking</option>
                      </select>
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                        Create Intent
                      </button>
                    </div>
                  </form>

                  <form
                    className="row g-3"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      try {
                        await handleConfirmPayment(new FormData(event.currentTarget));
                      } catch (error) {
                        showNotice("danger", error instanceof Error ? error.message : "Payment confirmation failed.");
                      }
                    }}
                  >
                    <div className="col-md-4">
                      <label className="form-label">Payment ID</label>
                      <input className="form-control" name="paymentId" defaultValue={paymentId} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">OTP</label>
                      <input className="form-control" name="otp" defaultValue="1234" required />
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                      <button className="btn btn-outline-success w-100" type="submit" disabled={loading}>
                        Confirm
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {page === "mapping" && (
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <h3 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-geo-alt text-success" />
                    Mapping & Route API
                  </h3>
                  <div className="row g-4 align-items-center">
                    <div className="col-lg-7">
                      <form
                        className="row g-3"
                        onSubmit={async (event) => {
                          event.preventDefault();
                          try {
                            await handleGenerateRoute(new FormData(event.currentTarget));
                          } catch (error) {
                            showNotice("danger", error instanceof Error ? error.message : "Route generation failed.");
                          }
                        }}
                      >
                        <div className="col-md-6">
                          <label className="form-label">Start Latitude</label>
                          <input className="form-control" name="startLat" type="number" step="0.000001" defaultValue={18.5204} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Start Longitude</label>
                          <input className="form-control" name="startLng" type="number" step="0.000001" defaultValue={73.8567} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">End Latitude</label>
                          <input className="form-control" name="endLat" type="number" step="0.000001" defaultValue={18.5314} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">End Longitude</label>
                          <input className="form-control" name="endLng" type="number" step="0.000001" defaultValue={73.8446} required />
                        </div>
                        <div className="col-12">
                          <button className="btn btn-success" type="submit" disabled={loading}>
                            <i className="bi bi-sign-turn-right me-2" />
                            Generate Route
                          </button>
                        </div>
                      </form>
                      {routeSummary && <div className="alert alert-success mt-3 mb-0">{routeSummary}</div>}
                    </div>
                    <div className="col-lg-5">
                      <img src={mapPreview} alt="Route mapping preview" className="img-fluid rounded-4 border" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {page === "delivery" && (
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <h3 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-truck text-warning" />
                    Delivery System
                  </h3>
                  <form
                    className="row g-3 mb-3"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      try {
                        await handleCreateDelivery(new FormData(event.currentTarget));
                      } catch (error) {
                        showNotice("danger", error instanceof Error ? error.message : "Delivery creation failed.");
                      }
                    }}
                  >
                    <div className="col-md-4">
                      <input className="form-control" name="customerName" placeholder="Customer Name" required />
                    </div>
                    <div className="col-md-4">
                      <input className="form-control" name="customerPhone" placeholder="Customer Phone" required />
                    </div>
                    <div className="col-md-4">
                      <input className="form-control" name="address" placeholder="Delivery Address" required />
                    </div>
                    <div className="col-md-4">
                      <input className="form-control" name="riderName" placeholder="Rider Name" required />
                    </div>
                    <div className="col-md-2">
                      <input className="form-control" name="startLat" type="number" step="0.000001" defaultValue={18.5204} required />
                    </div>
                    <div className="col-md-2">
                      <input className="form-control" name="startLng" type="number" step="0.000001" defaultValue={73.8567} required />
                    </div>
                    <div className="col-md-2">
                      <input className="form-control" name="endLat" type="number" step="0.000001" defaultValue={18.5314} required />
                    </div>
                    <div className="col-md-2">
                      <input className="form-control" name="endLng" type="number" step="0.000001" defaultValue={73.8446} required />
                    </div>
                    <div className="col-md-6 d-flex gap-2">
                      <button className="btn btn-warning text-dark fw-semibold" type="submit" disabled={loading}>
                        Create Delivery
                      </button>
                      <button className="btn btn-outline-primary" type="button" onClick={() => loadDeliveries()} disabled={loading}>
                        Refresh
                      </button>
                    </div>
                  </form>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Customer</th>
                          <th>Status</th>
                          <th>ETA</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveries.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center text-muted py-4">
                              No deliveries yet. Create one above.
                            </td>
                          </tr>
                        )}
                        {deliveries.map((delivery) => (
                          <tr key={delivery.id}>
                            <td>{delivery.id.slice(0, 8)}</td>
                            <td>{delivery.customerName}</td>
                            <td>
                              <span className="badge text-bg-secondary">{delivery.status}</span>
                            </td>
                            <td>{delivery.etaMinutes} min</td>
                            <td className="d-flex flex-wrap gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                type="button"
                                onClick={() => updateDeliveryStatus(delivery.id, "picked_up")}
                              >
                                Picked Up
                              </button>
                              <button
                                className="btn btn-sm btn-outline-info"
                                type="button"
                                onClick={() => updateDeliveryStatus(delivery.id, "in_transit")}
                              >
                                In Transit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-success"
                                type="button"
                                onClick={() => updateDeliveryStatus(delivery.id, "delivered")}
                              >
                                Delivered
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {page === "profiles" && (
              <div className="d-flex flex-column gap-4">
                {/* Header Card */}
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                      <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
                        <i className="bi bi-people-fill text-primary" />
                        Multi-Role Directory & Profile Management
                      </h3>
                      <p className="text-muted mb-0">
                        Live directory for Customers, Kitchen Partners, Delivery Riders, and Admin Team
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        type="button"
                        onClick={() => loadProfiles()}
                        disabled={loading}
                      >
                        <i className="bi bi-arrow-clockwise" />
                        Refresh
                      </button>
                      <button
                        className="btn btn-primary d-flex align-items-center gap-2 px-3 fw-semibold"
                        type="button"
                        onClick={() => {
                          setIsCreatingProfile(true);
                          setCreateRole("customer");
                        }}
                      >
                        <i className="bi bi-person-plus-fill" />
                        Add New Profile
                      </button>
                    </div>
                  </div>

                  {/* KPI Metrics Row */}
                  <div className="row g-3 mt-3">
                    <div className="col-sm-6 col-lg-2">
                      <div className="metric-card">
                        <i className="bi bi-person-badge text-primary" />
                        <div>
                          <div className="metric-label">Total</div>
                          <div className="metric-value">{profileStats.total}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-2">
                      <div className="metric-card">
                        <i className="bi bi-person-heart text-info" />
                        <div>
                          <div className="metric-label">Customers</div>
                          <div className="metric-value">{profileStats.customers}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                      <div className="metric-card">
                        <i className="bi bi-shop text-warning" />
                        <div>
                          <div className="metric-label">Kitchens</div>
                          <div className="metric-value">{profileStats.kitchens}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-2">
                      <div className="metric-card">
                        <i className="bi bi-bicycle text-success" />
                        <div>
                          <div className="metric-label">Riders</div>
                          <div className="metric-value">{profileStats.riders}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                      <div className="metric-card">
                        <i className="bi bi-shield-lock text-purple" style={{ color: "#7e22ce" }} />
                        <div>
                          <div className="metric-label">Admins</div>
                          <div className="metric-value">{profileStats.admins}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className="row g-3 mt-3 align-items-center">
                    <div className="col-md-7 d-flex flex-wrap gap-2">
                      {(["all", "customer", "kitchen", "rider", "admin"] as const).map((r) => {
                        const active = roleFilter === r;
                        const labelMap = {
                          all: `All (${profileStats.total})`,
                          customer: `Customers (${profileStats.customers})`,
                          kitchen: `Kitchens (${profileStats.kitchens})`,
                          rider: `Riders (${profileStats.riders})`,
                          admin: `Admins (${profileStats.admins})`
                        };
                        return (
                          <button
                            key={r}
                            className={`btn btn-sm ${active ? "btn-dark fw-semibold" : "btn-outline-secondary"}`}
                            onClick={() => {
                              setRoleFilter(r);
                              loadProfiles(r, searchQuery);
                            }}
                          >
                            {labelMap[r]}
                          </button>
                        );
                      })}
                    </div>
                    <div className="col-md-5">
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-search text-muted" />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 bg-light"
                          placeholder="Search by name, email, phone, city..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            loadProfiles(roleFilter, e.target.value);
                          }}
                        />
                        {searchQuery && (
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setSearchQuery("");
                              loadProfiles(roleFilter, "");
                            }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profiles Cards Grid */}
                <div className="row g-3">
                  {profiles.length === 0 && (
                    <div className="col-12">
                      <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
                        <i className="bi bi-person-x fs-1 mb-2 text-secondary" />
                        <h5 className="fw-semibold">No profiles found</h5>
                        <p className="mb-3">Try adjusting your filters or click below to create one.</p>
                        <div>
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              setIsCreatingProfile(true);
                              setCreateRole("customer");
                            }}
                          >
                            Create First Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {profiles.map((profile) => {
                    const roleBadgeClass =
                      profile.role === "customer"
                        ? "badge-role-customer"
                        : profile.role === "kitchen"
                        ? "badge-role-kitchen"
                        : profile.role === "rider"
                        ? "badge-role-rider"
                        : "badge-role-admin";

                    const statusBadgeClass =
                      profile.status === "active"
                        ? "bg-success"
                        : profile.status === "busy" || profile.status === "on_delivery"
                        ? "bg-warning text-dark"
                        : profile.status === "suspended"
                        ? "bg-danger"
                        : "bg-secondary";

                    return (
                      <div className="col-md-6" key={profile.id}>
                        <div className="card profile-card bg-white h-100 shadow-sm p-3">
                          <div className="d-flex align-items-start gap-3">
                            <img
                              src={
                                profile.avatarUrl ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`
                              }
                              alt={profile.name}
                              className="profile-avatar shadow-sm"
                            />
                            <div className="flex-grow-1 min-w-0">
                              <div className="d-flex align-items-center justify-content-between gap-2">
                                <h5 className="fw-bold mb-0 text-truncate">{profile.name}</h5>
                                <span className={`badge ${roleBadgeClass} text-uppercase px-2 py-1`}>
                                  {profile.role}
                                </span>
                              </div>
                              <div className="text-muted small text-truncate">{profile.email}</div>
                              <div className="text-muted small">{profile.phone}</div>
                            </div>
                          </div>

                          <hr className="my-2 text-muted" />

                          {/* Role-Specific Details */}
                          <div className="small flex-grow-1">
                            {profile.role === "customer" && (
                              <div className="d-flex flex-column gap-1">
                                <div className="d-flex flex-wrap gap-1 align-items-center">
                                  <span className="badge bg-light text-dark border">
                                    Meal: {profile.preferences.mealType.toUpperCase()}
                                  </span>
                                  <span className="badge bg-light text-dark border">
                                    Spice: {profile.preferences.spiceLevel}
                                  </span>
                                  <span className="badge bg-light text-dark border">
                                    Slot: {profile.preferences.preferredSlot}
                                  </span>
                                  <span className="badge bg-warning-subtle text-warning-emphasis">
                                    ⭐ {profile.loyaltyPoints} pts
                                  </span>
                                </div>
                                {profile.addresses[0] && (
                                  <div className="text-muted text-truncate mt-1">
                                    <i className="bi bi-geo-alt me-1 text-danger"></i>
                                    {profile.addresses[0].area}, {profile.addresses[0].city} (
                                    {profile.addresses[0].label})
                                  </div>
                                )}
                              </div>
                            )}

                            {profile.role === "rider" && (
                              <div className="d-flex flex-column gap-1">
                                <div className="d-flex flex-wrap gap-1 align-items-center">
                                  <span className="badge bg-light text-dark border">
                                    <i className="bi bi-bicycle me-1 text-success"></i>
                                    {profile.vehicleType.toUpperCase()}: {profile.vehicleNumber}
                                  </span>
                                  <span className="badge bg-warning-subtle text-warning-emphasis">
                                    ⭐ {profile.rating}
                                  </span>
                                  <span className="badge bg-success-subtle text-success-emphasis">
                                    {profile.totalDeliveries} Deliveries
                                  </span>
                                </div>
                                <div className="text-muted mt-1">
                                  <i className="bi bi-compass me-1 text-primary"></i>
                                  Hub: {profile.activeHub} | DL: {profile.drivingLicense}
                                </div>
                              </div>
                            )}

                            {profile.role === "kitchen" && (
                              <div className="d-flex flex-column gap-1">
                                <div className="fw-semibold text-dark">{profile.kitchenName}</div>
                                <div className="d-flex flex-wrap gap-1 align-items-center">
                                  <span className="badge bg-light text-dark border">
                                    Cap: {profile.dailyCapacity}/day
                                  </span>
                                  <span className="badge bg-light text-dark border">
                                    Load: {profile.currentOrdersLoad} active
                                  </span>
                                  <span className="badge bg-light text-dark border">
                                    {profile.specialties.join(", ")}
                                  </span>
                                </div>
                                <div className="text-muted small mt-1">
                                  <i className="bi bi-shield-check text-success me-1"></i>
                                  {profile.fssaiLicense} | {profile.city}
                                </div>
                              </div>
                            )}

                            {profile.role === "admin" && (
                              <div className="d-flex flex-column gap-1">
                                <div className="d-flex align-items-center gap-2">
                                  <span className="badge bg-primary-subtle text-primary fw-bold">
                                    Dept: {profile.department}
                                  </span>
                                  {profile.lastLoginIso && (
                                    <span className="text-muted small">
                                      Login: {new Date(profile.lastLoginIso).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <div className="d-flex flex-wrap gap-1 mt-1">
                                  {profile.permissions.slice(0, 3).map((perm) => (
                                    <span key={perm} className="badge bg-light text-secondary border small">
                                      {perm}
                                    </span>
                                  ))}
                                  {profile.permissions.length > 3 && (
                                    <span className="badge bg-light text-secondary border small">
                                      +{profile.permissions.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                            <span className={`badge ${statusBadgeClass} px-2 py-1`}>
                              {profile.status}
                            </span>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                type="button"
                                title="Toggle Status"
                                onClick={() => handleToggleStatus(profile)}
                              >
                                {profile.status === "active" ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                type="button"
                                onClick={() => setEditingProfile(profile)}
                              >
                                <i className="bi bi-pencil me-1"></i>Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                type="button"
                                onClick={() => handleDeleteProfile(profile.id, profile.name)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Create Profile Modal */}
                {isCreatingProfile && (
                  <div className="modal-backdrop-custom" onClick={() => setIsCreatingProfile(false)}>
                    <div className="modal-content-custom p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="fw-bold mb-0">Create New Profile</h4>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setIsCreatingProfile(false)}
                        ></button>
                      </div>

                      {/* Role Selector Tabs */}
                      <div className="btn-group w-100 mb-3" role="group">
                        {(["customer", "kitchen", "rider", "admin"] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            className={`btn ${createRole === r ? "btn-primary" : "btn-outline-primary"} text-capitalize`}
                            onClick={() => setCreateRole(r)}
                          >
                            {r}
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleCreateProfile} className="row g-3">
                        {/* Common Fields */}
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Full Name / Entity Name</label>
                          <input className="form-control" name="name" placeholder="e.g. Rahul Patil" required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Email Address</label>
                          <input className="form-control" name="email" type="email" placeholder="rahul@example.com" required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Phone Number</label>
                          <input className="form-control" name="phone" placeholder="+91 98765 00000" required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Status</label>
                          <select className="form-select" name="status" defaultValue="active">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="busy">Busy</option>
                            <option value="on_delivery">On Delivery</option>
                          </select>
                        </div>

                        {/* Customer Dynamic Fields */}
                        {createRole === "customer" && (
                          <>
                            <div className="col-12">
                              <h6 className="fw-bold text-primary mt-2">Customer Preferences & Address</h6>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Meal Type</label>
                              <select className="form-select" name="mealType" defaultValue="veg">
                                <option value="veg">Vegetarian</option>
                                <option value="non_veg">Non-Vegetarian</option>
                                <option value="jain">Jain Thali</option>
                                <option value="keto">Keto Friendly</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Spice Level</label>
                              <select className="form-select" name="spiceLevel" defaultValue="medium">
                                <option value="mild">Mild</option>
                                <option value="medium">Medium</option>
                                <option value="spicy">Spicy</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Slot</label>
                              <select className="form-select" name="preferredSlot" defaultValue="both">
                                <option value="lunch">Lunch Only</option>
                                <option value="dinner">Dinner Only</option>
                                <option value="both">Lunch & Dinner</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Address Label</label>
                              <input className="form-control" name="addressLabel" defaultValue="Home" />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Street / Flat</label>
                              <input className="form-control" name="street" placeholder="Flat 201, Green Heights" />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Area / City</label>
                              <input className="form-control" name="area" placeholder="Kothrud, Pune" />
                            </div>
                          </>
                        )}

                        {/* Rider Dynamic Fields */}
                        {createRole === "rider" && (
                          <>
                            <div className="col-12">
                              <h6 className="fw-bold text-success mt-2">Delivery Fleet Information</h6>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Vehicle Type</label>
                              <select className="form-select" name="vehicleType" defaultValue="bike">
                                <option value="bike">Motorcycle</option>
                                <option value="scooter">Scooter</option>
                                <option value="ev">Electric EV</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Vehicle Registration</label>
                              <input className="form-control" name="vehicleNumber" placeholder="MH 12 AB 9988" required />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Driving License</label>
                              <input className="form-control" name="drivingLicense" placeholder="MH12-20220000" required />
                            </div>
                            <div className="col-md-12">
                              <label className="form-label small fw-semibold">Assigned Delivery Hub</label>
                              <input className="form-control" name="activeHub" defaultValue="Pune Central Delivery Hub" />
                            </div>
                          </>
                        )}

                        {/* Kitchen Dynamic Fields */}
                        {createRole === "kitchen" && (
                          <>
                            <div className="col-12">
                              <h6 className="fw-bold text-warning mt-2">Cloud Kitchen Credentials</h6>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold">Kitchen Hub Name</label>
                              <input className="form-control" name="kitchenName" placeholder="Annapurna Central Hub" required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold">FSSAI License Number</label>
                              <input className="form-control" name="fssaiLicense" placeholder="FSSAI-214000000000" required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold">Daily Meal Capacity</label>
                              <input className="form-control" name="dailyCapacity" type="number" defaultValue={300} required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold">Manager / Head Chef</label>
                              <input className="form-control" name="managerName" placeholder="Chef Anand" required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold">Kitchen Address</label>
                              <input className="form-control" name="address" placeholder="Commercial Complex, Baner" required />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold">City</label>
                              <input className="form-control" name="city" defaultValue="Pune" required />
                            </div>
                          </>
                        )}

                        {/* Admin Dynamic Fields */}
                        {createRole === "admin" && (
                          <>
                            <div className="col-12">
                              <h6 className="fw-bold text-purple mt-2" style={{ color: "#7e22ce" }}>
                                Administrative Role Details
                              </h6>
                            </div>
                            <div className="col-md-12">
                              <label className="form-label small fw-semibold">Department</label>
                              <select className="form-select" name="department" defaultValue="Operations">
                                <option value="Operations">Operations</option>
                                <option value="Kitchen">Kitchen Oversight</option>
                                <option value="Logistics">Fleet Logistics</option>
                                <option value="SuperAdmin">SuperAdmin</option>
                                <option value="Support">Customer Support</option>
                              </select>
                            </div>
                          </>
                        )}

                        <div className="col-12 d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setIsCreatingProfile(false)}
                          >
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={loading}>
                            Create Profile
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Edit Profile Modal */}
                {editingProfile && (
                  <div className="modal-backdrop-custom" onClick={() => setEditingProfile(null)}>
                    <div className="modal-content-custom p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="fw-bold mb-0">Edit {editingProfile.role.toUpperCase()} Profile</h4>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setEditingProfile(null)}
                        ></button>
                      </div>

                      <form onSubmit={handleUpdateProfile} className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Name</label>
                          <input className="form-control" name="name" defaultValue={editingProfile.name} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Email</label>
                          <input className="form-control" name="email" type="email" defaultValue={editingProfile.email} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Phone</label>
                          <input className="form-control" name="phone" defaultValue={editingProfile.phone} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Status</label>
                          <select className="form-select" name="status" defaultValue={editingProfile.status}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="busy">Busy</option>
                            <option value="on_delivery">On Delivery</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>

                        {/* Customer specifics */}
                        {editingProfile.role === "customer" && (
                          <>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Meal Type</label>
                              <select className="form-select" name="mealType" defaultValue={editingProfile.preferences.mealType}>
                                <option value="veg">Vegetarian</option>
                                <option value="non_veg">Non-Vegetarian</option>
                                <option value="jain">Jain</option>
                                <option value="keto">Keto</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Spice Level</label>
                              <select className="form-select" name="spiceLevel" defaultValue={editingProfile.preferences.spiceLevel}>
                                <option value="mild">Mild</option>
                                <option value="medium">Medium</option>
                                <option value="spicy">Spicy</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Slot</label>
                              <select className="form-select" name="preferredSlot" defaultValue={editingProfile.preferences.preferredSlot}>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="both">Both</option>
                              </select>
                            </div>
                          </>
                        )}

                        {/* Rider specifics */}
                        {editingProfile.role === "rider" && (
                          <>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Vehicle Type</label>
                              <select className="form-select" name="vehicleType" defaultValue={editingProfile.vehicleType}>
                                <option value="bike">Bike</option>
                                <option value="scooter">Scooter</option>
                                <option value="ev">Electric EV</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Vehicle Number</label>
                              <input className="form-control" name="vehicleNumber" defaultValue={editingProfile.vehicleNumber} />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-semibold">Hub</label>
                              <input className="form-control" name="activeHub" defaultValue={editingProfile.activeHub} />
                            </div>
                          </>
                        )}

                        {/* Kitchen specifics */}
                        {editingProfile.role === "kitchen" && (
                          <>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold">Kitchen Name</label>
                              <input className="form-control" name="kitchenName" defaultValue={editingProfile.kitchenName} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold">Daily Capacity</label>
                              <input className="form-control" name="dailyCapacity" type="number" defaultValue={editingProfile.dailyCapacity} />
                            </div>
                            <div className="col-md-12">
                              <label className="form-label small fw-semibold">Operating Hours</label>
                              <input className="form-control" name="operatingHours" defaultValue={editingProfile.operatingHours} />
                            </div>
                          </>
                        )}

                        {/* Admin specifics */}
                        {editingProfile.role === "admin" && (
                          <div className="col-md-12">
                            <label className="form-label small fw-semibold">Department</label>
                            <select className="form-select" name="department" defaultValue={editingProfile.department}>
                              <option value="Operations">Operations</option>
                              <option value="Kitchen">Kitchen Oversight</option>
                              <option value="Logistics">Logistics</option>
                              <option value="SuperAdmin">SuperAdmin</option>
                              <option value="Support">Customer Support</option>
                            </select>
                          </div>
                        )}

                        <div className="col-12 d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setEditingProfile(null)}
                          >
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={loading}>
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
