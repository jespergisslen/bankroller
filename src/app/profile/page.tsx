export default function ProfilePage() {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>My Profile</h1>
        <p style={{ color: "var(--text-2)", marginTop: 4 }}>Your public tipster page.</p>
      </div>
      <div className="panel" style={{ padding: "var(--pad)", minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 12.5 }}>Coming soon.</p>
      </div>
    </div>
  );
}
