import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";

export default function UpdateUser() {
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  // Company dropdown için state'ler
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Department dropdown için state'ler
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Companies'ları çek
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/company/get-all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          params: { page: 0, size: 1000 },
        });
        setCompanies(res.data.content || res.data || []);
      } catch (err) {
        console.error("Şirketler yüklenemedi:", err);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  // Departments'ları çek
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/department/get-all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          params: { page: 0, size: 1000 },
        });
        setDepartments(res.data.content || res.data || []);
      } catch (err) {
        console.error("Departmanlar yüklenemedi:", err);
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        // Tekil kullanıcıyı get-by-id ile çek
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
        } else {
          setUser({
            firstName: found.firstName || "",
            surName: found.surName || "",
            username: found.username || "",
            email: found.email || "",
            departmentId: found.department?.id || "",
            roleName: found.role?.name || "",
            companyName:
              found.department?.company?.name || found.company?.name || "",
            companyType:
              found.department?.company?.type || found.company?.type || "",
            companyTown:
              found.department?.company?.town || found.company?.town || "",
            companyRegion:
              found.department?.company?.region || found.company?.region || "",
            companyCity:
              found.department?.company?.city || found.company?.city || "",
            active: found.active,
          });
        }
      } catch (err) {
        setError("Kullanıcı bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
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
          userId: id,
          firstName: user.firstName,
          lastName: user.surName,
          email: user.email,
          departmentId: Number(user.departmentId),
          roleName: user.roleName,
          enabled: user.active,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setMessage("Kullanıcı başarıyla güncellendi!");
      setTimeout(() => navigate("/admin/users"), 1500);
    } catch (err) {
      setError("Güncelleme başarısız! Lütfen bilgileri kontrol edin.");
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!user) return null;

  return (
    <AdminLayout>
      <div style={{ maxWidth: 900, margin: "100px auto", marginTop: 80 }}>
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>
          Kullanıcıyı Düzenle
        </h2>
        {message && (
          <div style={{ color: "green", marginBottom: 16 }}>{message}</div>
        )}
        {/* TAB BUTTONS */}
        <div style={{ display: "flex", marginBottom: 24 }}>
          <button
            style={{
              flex: 1,
              padding: 12,
              background: activeTab === "personal" ? "#183d5d" : "#0d2236",
              color: "#fff",
              border: "none",
              borderBottom:
                activeTab === "personal" ? "3px solid #e53935" : "none",
              fontWeight: activeTab === "personal" ? "bold" : "normal",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("personal")}
          >
            {getTranslation(language, "personalInformation")}
          </button>
          <button
            style={{
              flex: 1,
              padding: 12,
              background: activeTab === "work" ? "#183d5d" : "#0d2236",
              color: "#fff",
              border: "none",
              borderBottom: activeTab === "work" ? "3px solid #e53935" : "none",
              fontWeight: activeTab === "work" ? "bold" : "normal",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("work")}
          >
            {getTranslation(language, "workInformation")}
          </button>
          <button
            style={{
              flex: 1,
              padding: 12,
              background: activeTab === "company" ? "#183d5d" : "#0d2236",
              color: "#fff",
              border: "none",
              borderBottom:
                activeTab === "company" ? "3px solid #e53935" : "none",
              fontWeight: activeTab === "company" ? "bold" : "normal",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("company")}
          >
            {getTranslation(language, "companyInformation")}
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {activeTab === "personal" && (
            <>
              <input
                name="firstName"
                placeholder={getTranslation(language, "firstName")}
                value={user.firstName}
                onChange={handleChange}
                required
              />
              <input
                name="surName"
                placeholder={getTranslation(language, "lastName")}
                value={user.surName}
                onChange={handleChange}
                required
              />
              <input
                name="username"
                placeholder={getTranslation(language, "username")}
                value={user.username || ""}
                onChange={handleChange}
              />
              <input
                name="email"
                placeholder={getTranslation(language, "email")}
                value={user.email}
                onChange={handleChange}
                required
              />
            </>
          )}
          {activeTab === "work" && (
            <>
              <label>{getTranslation(language, "department")}</label>
              <select
                name="departmentId"
                value={user.departmentId}
                onChange={handleChange}
                required
                disabled={loadingDepartments}
              >
                <option value="">
                  {getTranslation(language, "selectDepartment")}
                </option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              <input
                name="roleName"
                placeholder={getTranslation(language, "role")}
                value={user.roleName}
                onChange={handleChange}
                required
              />
              <select
                name="active"
                value={user.active ? "true" : "false"}
                onChange={(e) =>
                  setUser({ ...user, active: e.target.value === "true" })
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </>
          )}
          {activeTab === "company" && (
            <>
              <label>Company Name</label>
              <select
                name="companyName"
                value={user.companyName || ""}
                onChange={handleChange}
                disabled={loadingCompanies}
              >
                <option value="">Şirket Seçin</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.name}>
                    {company.name}
                  </option>
                ))}
              </select>
              <input
                name="companyType"
                placeholder="Company Type"
                value={user.companyType || ""}
                onChange={handleChange}
              />
              <input
                name="companyTown"
                placeholder="Company Town"
                value={user.companyTown || ""}
                onChange={handleChange}
              />
              <input
                name="companyRegion"
                placeholder="Company Region"
                value={user.companyRegion || ""}
                onChange={handleChange}
              />
              <input
                name="companyCity"
                placeholder="Company City"
                value={user.companyCity || ""}
                onChange={handleChange}
              />
            </>
          )}
          <button type="submit">
            {getTranslation(language, "updateUser")}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
