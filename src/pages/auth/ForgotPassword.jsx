import React, { useState } from "react";
import api from "../../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      await api.post(
        "/auth/forgot-password",
        { email },
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      setMessage(
        "Şifre sıfırlama e-postası gönderildi! Lütfen mailinizi kontrol edin."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "E-posta gönderilemedi. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "100px auto",
        background: "#222",
        borderRadius: 12,
        padding: 32,
        boxShadow: "0 2px 12px rgba(0,0,0,0.16)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 24, color: "#fff" }}>
        Şifremi Unuttum
      </h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, color: "#fff" }}>E-Posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              marginTop: 4,
              padding: 10,
              borderRadius: 6,
              border: "1px solid #444",
              background: "#181818",
              color: "#fff",
              fontSize: 16,
              marginBottom: 8,
            }}
          />
        </div>
        {error && (
          <div
            style={{
              color: "#ff5252",
              background: "#2d1818",
              borderRadius: 6,
              padding: "8px 12px",
              marginBottom: 12,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}
        {message && (
          <div
            style={{
              color: "#4caf50",
              background: "#1b2d1b",
              borderRadius: 6,
              padding: "8px 12px",
              marginBottom: 12,
              fontWeight: 500,
            }}
          >
            {message}
          </div>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px 0",
            borderRadius: 6,
            border: "none",
            background: "#111",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            marginTop: 8,
          }}
          disabled={loading}
        >
          {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Maili Gönder"}
        </button>
      </form>
    </div>
  );
}
