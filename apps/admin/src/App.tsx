import { useEffect, useMemo, useState } from "react";
import heroOps from "./assets/hero-ops.svg";
import mapPreview from "./assets/map-preview.svg";

type Page = "dashboard" | "admin-registration" | "login" | "payments" | "mapping" | "delivery";
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
  const supported: Page[] = ["dashboard", "admin-registration", "login", "payments", "mapping", "delivery"];
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

  useEffect(() => {
    const onHashChange = () => setPage(normalizePage(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navItems = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
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
          </section>
        </div>
      </div>
    </div>
  );
}
