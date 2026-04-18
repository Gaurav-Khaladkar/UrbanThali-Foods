import { useMemo, useState } from "react";

type Page = "dashboard" | "adminRegistration" | "login" | "payments" | "mapping" | "delivery";

interface Delivery {
  id: string;
  customerName: string;
  status: "assigned" | "picked_up" | "in_transit" | "delivered" | "failed";
  etaMinutes: number;
}

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data as T;
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [message, setMessage] = useState("Ready");
  const [token, setToken] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [routeSummary, setRouteSummary] = useState("");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  const navItems = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard" },
      { key: "adminRegistration", label: "Admin Registration" },
      { key: "login", label: "Login" },
      { key: "payments", label: "Payment Gateway" },
      { key: "mapping", label: "Mapping API" },
      { key: "delivery", label: "Delivery System" }
    ] as const,
    []
  );

  async function handleAdminRegistration(formData: FormData): Promise<void> {
    const payload = {
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      password: String(formData.get("password"))
    };
    const result = await request<{ message: string; data: { id: string; email: string } }>("/auth/admin/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setMessage(`${result.message}: ${result.data.email}`);
  }

  async function handleLogin(formData: FormData): Promise<void> {
    const payload = {
      email: String(formData.get("email")),
      password: String(formData.get("password"))
    };
    const result = await request<{ data: { token: string; email: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setToken(result.data.token);
    setMessage(`Logged in as ${result.data.email}`);
  }

  async function handleCreatePayment(formData: FormData): Promise<void> {
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
    setMessage(`Payment intent created with status ${result.data.status}. OTP for confirm: 1234`);
  }

  async function handleConfirmPayment(formData: FormData): Promise<void> {
    const payload = {
      paymentId: String(formData.get("paymentId")),
      otp: String(formData.get("otp"))
    };
    const result = await request<{ message: string; data: { status: string } }>("/payments/confirm", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setMessage(`${result.message} (${result.data.status})`);
  }

  async function handleGenerateRoute(formData: FormData): Promise<void> {
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
      `Distance ${result.data.distanceKm} km | ETA ${result.data.etaMinutes} min | ${result.data.points.length} points`
    );
    setMessage("Navigation route generated successfully");
  }

  async function handleCreateDelivery(formData: FormData): Promise<void> {
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
    setMessage("Delivery order created");
    await loadDeliveries();
  }

  async function loadDeliveries(): Promise<void> {
    const result = await request<{ data: Delivery[] }>("/deliveries");
    setDeliveries(result.data);
  }

  async function updateDeliveryStatus(id: string, status: Delivery["status"]): Promise<void> {
    await request(`/deliveries/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    setMessage(`Delivery ${id.slice(0, 6)} updated to ${status}`);
    await loadDeliveries();
  }

  return (
    <main className="layout">
      <aside className="sidebar">
        <h1>Pro Operations</h1>
        <p>Professional app control panel</p>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.key}
              className={page === item.key ? "navBtn active" : "navBtn"}
              onClick={() => setPage(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="content">
        <header className="topBar">
          <strong>API:</strong> {apiBase}
          <span>Session: {token ? `Active (${token.slice(0, 8)}...)` : "Not logged in"}</span>
        </header>

        {page === "dashboard" && (
          <section className="panel">
            <h2>System Dashboard</h2>
            <div className="grid">
              <article className="card">
                <span>Navigation API</span>
                <strong>Enabled</strong>
              </article>
              <article className="card">
                <span>Payment Gateway</span>
                <strong>Sandbox Ready</strong>
              </article>
              <article className="card">
                <span>Delivery Tracking</span>
                <strong>Live Endpoint</strong>
              </article>
              <article className="card">
                <span>Admin Auth</span>
                <strong>Registration + Login</strong>
              </article>
            </div>
          </section>
        )}

        {page === "adminRegistration" && (
          <section className="panel">
            <h2>Admin Registration</h2>
            <form
              className="form"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  await handleAdminRegistration(new FormData(event.currentTarget));
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Admin registration failed");
                }
              }}
            >
              <input name="name" placeholder="Admin full name" required />
              <input name="email" type="email" placeholder="admin@company.com" required />
              <input name="password" type="password" placeholder="Minimum 6 characters" required minLength={6} />
              <button type="submit">Register Admin</button>
            </form>
          </section>
        )}

        {page === "login" && (
          <section className="panel">
            <h2>Admin Login</h2>
            <form
              className="form"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  await handleLogin(new FormData(event.currentTarget));
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Login failed");
                }
              }}
            >
              <input name="email" type="email" placeholder="admin@proapp.local" required />
              <input name="password" type="password" placeholder="Admin@123" required />
              <button type="submit">Login</button>
            </form>
          </section>
        )}

        {page === "payments" && (
          <section className="panel">
            <h2>Payment Gateway</h2>
            <form
              className="form"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  await handleCreatePayment(new FormData(event.currentTarget));
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Payment creation failed");
                }
              }}
            >
              <input name="customerEmail" type="email" placeholder="customer@email.com" required />
              <input name="amountInr" type="number" placeholder="Amount in INR" min={1} required />
              <select name="method" defaultValue="upi">
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Netbanking</option>
              </select>
              <button type="submit">Create Intent</button>
            </form>

            <form
              className="form compact"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  await handleConfirmPayment(new FormData(event.currentTarget));
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Payment confirmation failed");
                }
              }}
            >
              <input name="paymentId" defaultValue={paymentId} placeholder="Payment ID" required />
              <input name="otp" defaultValue="1234" placeholder="OTP (demo: 1234)" required />
              <button type="submit">Confirm Payment</button>
            </form>
          </section>
        )}

        {page === "mapping" && (
          <section className="panel">
            <h2>Mapping and Route API</h2>
            <form
              className="form"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  await handleGenerateRoute(new FormData(event.currentTarget));
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Route generation failed");
                }
              }}
            >
              <input name="startLat" type="number" step="0.000001" defaultValue={18.5204} required />
              <input name="startLng" type="number" step="0.000001" defaultValue={73.8567} required />
              <input name="endLat" type="number" step="0.000001" defaultValue={18.5314} required />
              <input name="endLng" type="number" step="0.000001" defaultValue={73.8446} required />
              <button type="submit">Generate Route</button>
            </form>
            {routeSummary && <p className="summary">{routeSummary}</p>}
          </section>
        )}

        {page === "delivery" && (
          <section className="panel">
            <h2>Delivery System</h2>
            <form
              className="form"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  await handleCreateDelivery(new FormData(event.currentTarget));
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Delivery creation failed");
                }
              }}
            >
              <input name="customerName" placeholder="Customer name" required />
              <input name="customerPhone" placeholder="Customer phone" required />
              <input name="address" placeholder="Delivery address" required />
              <input name="riderName" placeholder="Rider name" required />
              <input name="startLat" type="number" step="0.000001" defaultValue={18.5204} required />
              <input name="startLng" type="number" step="0.000001" defaultValue={73.8567} required />
              <input name="endLat" type="number" step="0.000001" defaultValue={18.5314} required />
              <input name="endLng" type="number" step="0.000001" defaultValue={73.8446} required />
              <button type="submit">Create Delivery</button>
            </form>

            <button className="secondary" onClick={() => loadDeliveries()}>
              Refresh Deliveries
            </button>

            <div className="deliveryList">
              {deliveries.map((delivery) => (
                <article key={delivery.id} className="deliveryItem">
                  <strong>
                    {delivery.customerName} ({delivery.status})
                  </strong>
                  <span>
                    ETA: {delivery.etaMinutes} min | ID: {delivery.id.slice(0, 8)}
                  </span>
                  <div className="actions">
                    <button onClick={() => updateDeliveryStatus(delivery.id, "picked_up")}>Picked Up</button>
                    <button onClick={() => updateDeliveryStatus(delivery.id, "in_transit")}>In Transit</button>
                    <button onClick={() => updateDeliveryStatus(delivery.id, "delivered")}>Delivered</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="message">{message}</footer>
      </section>
    </main>
  );
}
