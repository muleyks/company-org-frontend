import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";

export default function UpdateUser() {
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  // State'ler
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    surName: "",
    email: "",
    roleName: "",
  });

  // Kullanıcıyı çek
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/user/get-by-id", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          params: { id },
        });
        const found = res.data;
        if (!found) {
          setError("Kullanıcı bulunamadı.");
          setLoading(false);
          return;
        }
        console.log("Düzenlenen kullanıcı:", found);
        setUser(found);
        setForm({
          firstName: found.firstName || "",
          surName: found.surName || "",
          email: found.email || "",
          roleName: found.role?.name || "",
        });
        setLoading(false);
      } catch (err) {
        setError("Kullanıcı bilgileri alınamadı.");
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  // Form değişiklikleri
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Kullanıcı güncelleme
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/user/update-user",
        {
          firstName: form.firstName,
          lastName: form.surName, // Swagger'a göre lastName
          email: form.email,
          userId: Number(id),
          departmentId: user.department?.id,
          roleName: form.roleName,
          enabled: user.enabled,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setMessage("Kullanıcı başarıyla güncellendi!");
      setTimeout(() => navigate("/manager/users"), 1500);
    } catch (err) {
      setError("Güncelleme başarısız! Lütfen bilgileri kontrol edin.");
    }
  };

  if (loading) return <div>{getTranslation(language, "loading")}</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!user) return null;

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "100px auto",
        background: "#222",
        padding: 24,
        borderRadius: 8,
      }}
    >
      <h2>{getTranslation(language, "updateUser")}</h2>
      {message && (
        <div style={{ color: "#4caf50", marginBottom: 16 }}>{message}</div>
      )}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>
            {getTranslation(language, "firstName")}
          </label>
          <input
            name="firstName"
            placeholder={getTranslation(language, "firstName")}
            value={form.firstName}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #555",
              background: "#333",
              color: "#fff",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>
            {getTranslation(language, "lastName")}
          </label>
          <input
            name="surName"
            placeholder={getTranslation(language, "lastName")}
            value={form.surName}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #555",
              background: "#333",
              color: "#fff",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>
            {getTranslation(language, "email")}
          </label>
          <input
            name="email"
            type="email"
            placeholder={getTranslation(language, "email")}
            value={form.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #555",
              background: "#333",
              color: "#fff",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>
            {getTranslation(language, "role")}
          </label>
          <select
            name="roleName"
            value={form.roleName}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #555",
              background: "#333",
              color: "#fff",
            }}
          >
            <option value="User">{getTranslation(language, "roleUser")}</option>
            <option value="Manager">
              {getTranslation(language, "roleManager")}
            </option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>
            {getTranslation(language, "status")}
          </label>
          <input
            name="active"
            type="text"
            value={
              user.active
                ? getTranslation(language, "active")
                : getTranslation(language, "inactive")
            }
            readOnly
            disabled
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #555",
              background: "#333",
              color: "#fff",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>
            {getTranslation(language, "department")}
          </label>
          <input
            name="department"
            type="text"
            value={user.department?.name || user.department?.id || "-"}
            readOnly
            disabled
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #555",
              background: "#333",
              color: "#fff",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            type="submit"
            style={{
              color: "#fff",
              background: "#4caf50",
              border: "none",
              borderRadius: 4,
              padding: "12px 24px",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            {getTranslation(language, "save")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/manager/user-management")}
            style={{
              color: "#fff",
              background: "#666",
              border: "none",
              borderRadius: 4,
              padding: "12px 24px",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            {getTranslation(language, "cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
