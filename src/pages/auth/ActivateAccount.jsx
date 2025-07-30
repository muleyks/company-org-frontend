import React, { useState } from "react";
import api from "../../api/axios";

export default function ActivateAccount() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResend = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await api.post(
        "/auth/activation/resend",
        { email },
        {
          headers: { "ngrok-skip-browser-warning": "true" },
        }
      );
      setMessage(
        "Aktivasyon e-postası gönderildi! Lütfen mailinizi kontrol edin."
      );
    } catch (err) {
      setError("E-posta gönderilemedi. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h2>Hesap Aktivasyonu</h2>
      <form onSubmit={handleResend}>
        <div>
          <label>E-Posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 8 }}
          />
        </div>
        <button type="submit" style={{ width: "100%" }}>
          Aktivasyon Kodunu Gönder
        </button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {message && <div style={{ color: "green" }}>{message}</div>}
    </div>
  );
}
