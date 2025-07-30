import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function ActivateForgotPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [checkingToken, setCheckingToken] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Token'ı URL'den al
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setCheckingToken(false);
      return;
    }
    setCheckingToken(true);
    api
      .get("/auth/activate-forgot-password", {
        params: { token },
        headers: { "ngrok-skip-browser-warning": "true" },
      })
      .then(() => {
        setTokenValid(true);
      })
      .catch(() => {
        setTokenValid(false);
      })
      .finally(() => {
        setCheckingToken(false);
      });
  }, [token]);

  // Şifre kuralları
  const validatePassword = (password) => {
    const lengthCheck = /^.{8,32}$/;
    const upperCheck = /[A-Z]/;
    const lowerCheck = /[a-z]/;
    const numberCheck = /[0-9]/;
    const specialCheck = /[@$.!\-+]/;
    if (!lengthCheck.test(password))
      return "Şifre 8-32 karakter arasında olmalı.";
    if (!upperCheck.test(password))
      return "Şifre en az bir büyük harf içermeli.";
    if (!lowerCheck.test(password))
      return "Şifre en az bir küçük harf içermeli.";
    if (!numberCheck.test(password)) return "Şifre en az bir rakam içermeli.";
    if (!specialCheck.test(password))
      return "Şifre en az bir özel karakter (@$.!-+) içermeli.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!token) {
      setError("Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Şifreler uyuşmuyor!");
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setLoading(true);
    try {
      await api.post(
        "/auth/reset-password",
        {
          token,
          password,
          confirmPassword,
        },
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      setMessage(
        "Şifreniz başarıyla sıfırlandı! Giriş sayfasına yönlendiriliyorsunuz..."
      );
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Şifre sıfırlama başarısız! Bağlantı süresi dolmuş veya geçersiz."
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
        Şifre Sıfırlama
      </h2>
      {checkingToken ? (
        <div style={{ color: "#fff", textAlign: "center", margin: "32px 0" }}>
          Bağlantı kontrol ediliyor...
        </div>
      ) : tokenValid ? (
        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500, color: "#fff" }}>Yeni Şifre</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500, color: "#fff" }}>
              Yeni Şifre (Tekrar)
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: "#fff" }}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                style={{ marginRight: 6 }}
              />
              Şifreyi Göster
            </label>
          </div>
          <ul
            style={{
              color: "#bbb",
              fontSize: 13,
              marginBottom: 16,
              paddingLeft: 18,
            }}
          >
            <li>En az bir büyük harf</li>
            <li>En az bir küçük harf</li>
            <li>En az bir rakam</li>
            <li>En az bir özel karakter (@$.!-+)</li>
            <li>8-32 karakter uzunluğunda</li>
          </ul>
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
            {loading ? "İşleniyor..." : "Şifremi Sıfırla"}
          </button>
        </form>
      ) : (
        <div
          style={{
            color: "#ff5252",
            background: "#2d1818",
            borderRadius: 6,
            padding: "16px 12px",
            marginTop: 32,
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.
        </div>
      )}
    </div>
  );
}
