import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";

export default function AdminProfile() {
  const { language } = useLanguage();

  // Departman ismi çeviri fonksiyonu
  const translateDepartmentName = (departmentName) => {
    switch (departmentName) {
      case "Management":
        return getTranslation(language, "management");
      case "Sales & Marketing":
        return getTranslation(language, "salesMarketing");
      case "Logistics":
        return getTranslation(language, "logistics");
      case "IT Support":
        return getTranslation(language, "itSupport");
      case "Senior Partners":
        return getTranslation(language, "seniorPartners");
      case "Financial Consulting":
        return getTranslation(language, "financialConsulting");
      case "Investment Banking":
        return getTranslation(language, "investmentBanking");
      case "Production":
        return getTranslation(language, "production");
      case "Software Development":
        return getTranslation(language, "softwareDevelopment");
      case "Mobile Development":
        return getTranslation(language, "mobileDevelopment");
      case "Web Development":
        return getTranslation(language, "webDevelopment");
      case "Human Resources":
        return getTranslation(language, "humanResources");
      case "Executive Board":
        return getTranslation(language, "executiveBoard");
      case "Data Science":
        return getTranslation(language, "dataScience");
      case "My department":
        return getTranslation(language, "myDepartment");
      default:
        return departmentName;
    }
  };

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    surName: "",
    email: "",
    username: "",
    roleName: "",
    departmentId: "",
    enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/user/get-self", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setProfile(res.data);
        setForm({
          firstName: res.data.firstName || "",
          surName: res.data.surName || "",
          email: res.data.email || "",
          username: res.data.username || "",
          roleName: res.data.role?.name || "",
          departmentId: res.data.department?.id || "",
          enabled: res.data.enabled ?? true,
        });
      } catch (err) {
        setError(getTranslation(language, "error"));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/user/update-user",
        {
          firstName: form.firstName,
          lastName: form.surName, // API'de lastName olarak bekleniyor olabilir!
          email: form.email,
          userId: profile.id,
          departmentId: form.departmentId,
          roleName: form.roleName,
          enabled: form.enabled,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setMessage(getTranslation(language, "success"));
      setEditing(false);
      setTimeout(() => setMessage(""), 1500);

      // PROFİLİ YENİDEN ÇEK
      const refreshed = await api.get("/user/get-self", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      setProfile(refreshed.data);
      setForm({
        firstName: refreshed.data.firstName || "",
        surName: refreshed.data.surName || "",
        email: refreshed.data.email || "",
        username: refreshed.data.username || "",
        roleName: refreshed.data.role?.name || "",
        departmentId: refreshed.data.department?.id || "",
        enabled: refreshed.data.enabled ?? true,
      });
    } catch (err) {
      setError(getTranslation(language, "error"));
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!profile) return null;

  return (
    <AdminLayout>
      <div style={{ maxWidth: 500, margin: "100px auto", marginTop: 80 }}>
        <div
          style={{
            maxWidth: 500,
            margin: "100px auto",
            background: "#181818",
            color: "#fff",
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 2px 12px #0002",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 300,
          }}
        >
          <h2 style={{ textAlign: "left", marginBottom: 24 }}>
            {getTranslation(language, "adminProfile")}
          </h2>
          {!editing ? (
            <>
              <div style={{ textAlign: "left", marginBottom: 24 }}>
                <div>
                  <b>{getTranslation(language, "firstName")}:</b>{" "}
                  {profile.firstName}
                </div>
                <div>
                  <b>{getTranslation(language, "lastName")}:</b>{" "}
                  {profile.surName}
                </div>
                <div>
                  <b>{getTranslation(language, "username")}:</b>{" "}
                  {profile.username}
                </div>
                <div>
                  <b>{getTranslation(language, "email")}:</b> {profile.email}
                </div>
                <div>
                  <b>{getTranslation(language, "role")}:</b>{" "}
                  {profile.role?.name}
                </div>
                <div>
                  <b>{getTranslation(language, "company")}:</b>{" "}
                  {profile.department?.company?.name ||
                    profile.company?.name ||
                    "-"}
                </div>
                <div>
                  <b>{getTranslation(language, "department")}:</b>{" "}
                  {translateDepartmentName(profile.department?.name) || "-"}
                </div>
              </div>
              <button
                onClick={() => setEditing(true)}
                style={{
                  color: "#fff",
                  background: "#1976d2",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 20px",
                  fontSize: 16,
                  cursor: "pointer",
                  marginBottom: 12,
                }}
              >
                {getTranslation(language, "edit")}
              </button>
              {message && (
                <div style={{ color: "#4caf50", marginTop: 8 }}>{message}</div>
              )}
              {error && (
                <div style={{ color: "#f44336", marginTop: 8 }}>{error}</div>
              )}
            </>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <input
                name="firstName"
                placeholder={getTranslation(language, "firstName")}
                value={form.firstName}
                onChange={handleChange}
                required
              />
              <input
                name="surName"
                placeholder={getTranslation(language, "lastName")}
                value={form.surName}
                onChange={handleChange}
                required
              />
              <input
                name="email"
                placeholder={getTranslation(language, "email")}
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                name="username"
                placeholder={getTranslation(language, "username")}
                value={form.username}
                onChange={handleChange}
                disabled
              />
              <input
                name="roleName"
                placeholder={getTranslation(language, "role")}
                value={form.roleName}
                onChange={handleChange}
                disabled
              />
              <input
                name="departmentId"
                placeholder={`${getTranslation(language, "department")} ID`}
                value={form.departmentId}
                onChange={handleChange}
                disabled
              />
              <button type="submit">{getTranslation(language, "save")}</button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                style={{
                  color: "#fff",
                  background: "#888",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 20px",
                  fontSize: 16,
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                {getTranslation(language, "cancel")}
              </button>
              {message && (
                <div style={{ color: "#4caf50", marginTop: 8 }}>{message}</div>
              )}
              {error && (
                <div style={{ color: "#f44336", marginTop: 8 }}>{error}</div>
              )}
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
