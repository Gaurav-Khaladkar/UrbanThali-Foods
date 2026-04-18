const metrics = [
  { label: "Active Subscribers", value: "1,280" },
  { label: "Today's Deliveries", value: "842" },
  { label: "On-Time Rate", value: "96.8%" },
  { label: "Monthly MRR", value: "INR 7.4L" }
];

export default function App() {
  return (
    <main className="page">
      <header className="hero">
        <h1>UrbanThali Control Center</h1>
        <p>Monitor subscriptions, kitchen operations, and dispatch performance in one place.</p>
      </header>

      <section className="grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="card">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
