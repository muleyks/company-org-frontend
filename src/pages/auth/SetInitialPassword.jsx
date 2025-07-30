import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function SetInitialPassword() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [tokenValid, setTokenValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // URL'den token'ı otomatik al
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) setToken(tokenFromUrl);

    // Token'ı kontrol et
    api
      .get("/auth/activation", {
        params: { token: tokenFromUrl },
        headers: { "ngrok-skip-browser-warning": "true" },
      })
      .then(() => {
        setTokenValid(true); // Token geçerli
      })
      .catch(() => {
        setTokenValid(false); // Token geçersiz
        setError("Aktivasyon kodu geçersiz veya süresi dolmuş.");
      });
  }, [location]);

  // Şifre kurallarını kontrol eden fonksiyon
  const validatePassword = (password) => {
    const lengthCheck = /^.{8,32}$/;
    const upperCheck = /[A-Z]/;
    const lowerCheck = /[a-z]/;
    const numberCheck = /[0-9]/;
    const specialCheck = /[@$\\.\\!\\-\\+]/;
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
    if (newPassword !== confirmPassword) {
      setError("Şifreler uyuşmuyor!");
      return;
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    try {
      await api.post(
        "/auth/activation/confirm",
        {
          token,
          email,
          password: newPassword,
        },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      setMessage(
        "Hesabınız başarıyla aktifleştirildi! Giriş sayfasına yönlendiriliyorsunuz..."
      );
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError("Aktivasyon başarısız! Lütfen tekrar deneyin.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h2>Hesap Aktivasyonu</h2>
      {tokenValid ? (
        <form onSubmit={handleSubmit}>
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
          <div>
            <label>Yeni Şifre</label>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ width: "100%", marginBottom: 8 }}
            />
          </div>
          <div>
            <label>Yeni Şifre (Tekrar)</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: "100%", marginBottom: 8 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                style={{ marginRight: 6 }}
              />
              Şifreyi Göster
            </label>
          </div>
          {error && <div style={{ color: "red" }}>{error}</div>}
          {message && <div style={{ color: "green" }}>{message}</div>}
          <button type="submit" style={{ width: "100%" }}>
            Hesabımı Aktifleştir
          </button>
        </form>
      ) : (
        <div style={{ color: "red", marginTop: 16 }}>
          {error || "Aktivasyon kodu geçersiz veya süresi dolmuş."}
        </div>
      )}
    </div>
  );
}
