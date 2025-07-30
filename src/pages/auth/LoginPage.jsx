import React, { useState } from "react";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    if (!email) return "E-posta adresi gereklidir.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Geçerli bir e-posta giriniz.";
    if (!password) return "Şifre gereklidir.";
    if (password.length < 6) return "Şifre en az 6 karakter olmalı.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    try {
      // 1. Login isteği at
      const response = await api.post("/auth/authenticate", {
        email,
        password,
      });
      const token = response.data.token;
      // 2. Token'ı localStorage'a kaydet
      localStorage.setItem("token", token);

      const userRes = await api.get("/user/get-self", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Login sonrası aktif kullanıcı:", userRes.data);

      // 3. Token ile kullanıcı bilgilerini çek
      const userResponse = await api.get("/user/get-self", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(userResponse.data); //kullanıcının admin olup olmadığını görmeye çalıştım
      // 4. Kullanıcı rolüne göre yönlendir

      if (userResponse.data.role.name === "Admin") {
        navigate("/admin/admin-dashboard"); // admin sayfanın path'i
      } else if (userResponse.data.role.name === "Manager") {
        navigate("/manager/manager-dashboard"); // manager sayfanın path'i
      } else if (userResponse.data.role.name === "User") {
        navigate("/user-dashboard"); // user sayfanın path'i
      } else {
        navigate("/"); // bilinmeyen rol için ana sayfa
      }
    } catch (err) {
      setError("Giriş başarısız! Lütfen bilgilerinizi kontrol edin.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h2>Giriş Yap</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>E-Posta Adresi</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", marginBottom: 8 }}
          />
        </div>
        <div>
          <label>Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", marginBottom: 8 }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        <button type="submit" style={{ width: "100%" }}>
          GİRİŞ YAP
        </button>
      </form>
      <p style={{ marginTop: 8, textAlign: "center" }}>
        <Link to="/activate">Hesabımı Aktifleştir</Link>
      </p>
      <p style={{ marginTop: 8, textAlign: "center" }}>
        <Link to="/forgot-password">Şifremi Unuttum</Link>
      </p>
    </div>
  );
}
