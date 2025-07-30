import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";
import AdminLayout from "../../components/AdminLayout";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [departments, setDepartments] = useState([]); // departmanlar için state

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

  // Kullanıcı ekleme formu için state'ler
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    surName: "",
    email: "",
    departmentId: "",
    roleName: "",
  });
  const [message, setMessage] = useState("");

  // Filtrelenmiş kullanıcılar
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState({
    company: "",
    region: "",
    city: "",
    department: "",
    role: "",
    active: "",
  });

  // Filtrelenmiş kullanıcılar
  const filteredUsers = users.filter((user) => {
    return (
      (!filter.company || user.department?.company?.name === filter.company) &&
      (!filter.region ||
        user.department?.company?.town?.region?.name === filter.region) &&
      (!filter.city ||
        user.department?.company?.town?.region?.city?.name === filter.city) &&
      (!filter.department || user.department?.name === filter.department) &&
      (!filter.role || user.role?.name === filter.role) &&
      (!filter.active ||
        (filter.active === "active" ? user.enabled : !user.enabled))
    );
  });

  // Unique filtre seçenekleri
  const companyOptions = [
    ...new Set(users.map((u) => u.department?.company?.name).filter(Boolean)),
  ];
  const regionOptions = [
    ...new Set(
      users
        .map((u) => u.department?.company?.town?.region?.name)
        .filter(Boolean)
    ),
  ];
  const cityOptions = [
    ...new Set(
      users
        .map((u) => u.department?.company?.town?.region?.city?.name)
        .filter(Boolean)
    ),
  ];
  const departmentOptions = [
    ...new Set(users.map((u) => u.department?.name).filter(Boolean)),
  ];
  const roleOptions = [
    ...new Set(users.map((u) => u.role?.name).filter(Boolean)),
  ];

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0); // If backend returns total count

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const payload = { ...form, departmentId: Number(form.departmentId) };
      await api.post("/auth/register", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      setMessage(getTranslation(language, "userSavedSuccess"));
      setShowForm(false);
      setForm({
        firstName: "",
        surName: "",
        email: "",
        departmentId: "",
        roleName: "",
      });
      // Kullanıcıları yeniden çek
      const res = await api.get("/user/get-all-users-detailed", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.log("Register error:", err);
      if (err.response) {
        console.log("Error response data:", err.response.data);
        console.log("Error response status:", err.response.status);
        console.log("Error response headers:", err.response.headers);
      }
      setMessage(getTranslation(language, "userDeleteError"));
    }
  };

  // Departmanları çek
  useEffect(() => {
    if (!showForm) return;
    const fetchDepartments = async () => {
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
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, [showForm]);

  // Admin kontrolü
  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await api.get("/user/get-self", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (res.data.role.name === "Admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          navigate("/login");
        }
      } catch (err) {
        setIsAdmin(false);
        navigate("/login");
      }
    };
    checkAdmin();
  }, [navigate]);

  // Kullanıcıları çek
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/user/get-all-users-detailed", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          params: { page, size },
        });
        if (res.data && Array.isArray(res.data.users)) {
          setUsers(res.data.users);
        } else if (res.data && res.data.content) {
          setUsers(res.data.content);
          setTotalCount(res.data.totalElements || 0);
        } else {
          setUsers([]);
        }
      } catch (err) {
        setError(getTranslation(language, "userDeleteError"));
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin) fetchUsers();
  }, [isAdmin, page, size]);

  // Kullanıcı silme
  const handleDelete = async (userId) => {
    if (!window.confirm(getTranslation(language, "confirmDeleteUser"))) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete("/user/soft-delete-user", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        data: { id: userId },
      });
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert(getTranslation(language, "userDeleteError"));
    }
  };

  if (loading) return <div>{getTranslation(language, "loading")}</div>;
  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1200, margin: "100px auto", marginTop: 80 }}>
        <h2>{getTranslation(language, "userManagement")}</h2>
        {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
        {!showFilters && (
          <button
            style={{ marginBottom: 16 }}
            onClick={() => setShowFilters(true)}
          >
            {getTranslation(language, "filters")}
          </button>
        )}
        {showFilters && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              background: "#222",
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <select
              value={filter.company}
              onChange={(e) =>
                setFilter((f) => ({ ...f, company: e.target.value }))
              }
            >
              <option value="">{getTranslation(language, "company")}</option>
              {companyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={filter.region}
              onChange={(e) =>
                setFilter((f) => ({ ...f, region: e.target.value }))
              }
            >
              <option value="">{getTranslation(language, "region")}</option>
              {regionOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={filter.city}
              onChange={(e) =>
                setFilter((f) => ({ ...f, city: e.target.value }))
              }
            >
              <option value="">{getTranslation(language, "city")}</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={filter.department}
              onChange={(e) =>
                setFilter((f) => ({ ...f, department: e.target.value }))
              }
            >
              <option value="">{getTranslation(language, "department")}</option>
              {departmentOptions.map((d) => (
                <option key={d} value={d}>
                  {translateDepartmentName(d)}
                </option>
              ))}
            </select>
            <select
              value={filter.role}
              onChange={(e) =>
                setFilter((f) => ({ ...f, role: e.target.value }))
              }
            >
              <option value="">{getTranslation(language, "role")}</option>
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={filter.active}
              onChange={(e) =>
                setFilter((f) => ({ ...f, active: e.target.value }))
              }
            >
              <option value="">
                {getTranslation(language, "activeFilter")}
              </option>
              <option value="active">
                {getTranslation(language, "active")}
              </option>
              <option value="inactive">
                {getTranslation(language, "inactive")}
              </option>
            </select>
            <button
              onClick={() => {
                setFilter({
                  company: "",
                  region: "",
                  city: "",
                  department: "",
                  role: "",
                  active: "",
                });
                setShowFilters(false);
              }}
            >
              {getTranslation(language, "clearFilters")}
            </button>
          </div>
        )}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#181818",
            color: "#fff",
          }}
        >
          <thead>
            <tr style={{ background: "#222" }}>
              <th style={{ padding: 8, border: "1px solid #333" }}>
                {getTranslation(language, "no")}
              </th>
              <th style={{ padding: 8, border: "1px solid #333" }}>
                {getTranslation(language, "name")}
              </th>
              <th style={{ padding: 8, border: "1px solid #333" }}>
                {getTranslation(language, "lastName")}
              </th>
              <th style={{ padding: 8, border: "1px solid #333" }}>
                {getTranslation(language, "email")}
              </th>
              <th style={{ padding: 8, border: "1px solid #333" }}>
                {getTranslation(language, "company")}
              </th>
              <th style={{ padding: 8, border: "1px solid #333" }}>
                {getTranslation(language, "department")}
              </th>
              <th style={{ padding: 8, border: "1px solid #333" }}>
                {getTranslation(language, "role")}
              </th>
              <th style={{ padding: 8, border: "1px solid #333" }}>
                {getTranslation(language, "status")}
              </th>
              <th style={{ padding: 8, border: "1px solid #333" }}>
                {getTranslation(language, "actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, idx) => (
              <tr key={user.id}>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  {idx + 1}
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  {user.firstName}
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  {user.surName}
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  {user.email}
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  {user.department?.company?.name || user.company?.name || "-"}
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  {translateDepartmentName(user.department?.name) || "-"}
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  {user.role?.name === "Manager"
                    ? getTranslation(language, "roleManager")
                    : user.role?.name === "User"
                    ? getTranslation(language, "roleUser")
                    : user.role?.name === "Admin"
                    ? getTranslation(language, "roleAdmin")
                    : user.role?.name}
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  {user.enabled
                    ? getTranslation(language, "active")
                    : getTranslation(language, "inactive")}
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  {user.enabled && (
                    <>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{
                          color: "#fff",
                          background: "#d32f2f",
                          border: "none",
                          borderRadius: 4,
                          padding: "4px 10px",
                          cursor: "pointer",
                          marginRight: 8,
                        }}
                      >
                        {getTranslation(language, "delete")}
                      </button>
                      <button
                        onClick={() => navigate(`/update-user/${user.id}`)}
                        style={{
                          color: "#fff",
                          background: "#1976d2",
                          border: "none",
                          borderRadius: 4,
                          padding: "4px 10px",
                          cursor: "pointer",
                        }}
                      >
                        {getTranslation(language, "edit")}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 16,
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            {getTranslation(language, "previous")}
          </button>
          <span>
            {getTranslation(language, "page")}: {page + 1}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={users.length < size}
          >
            {getTranslation(language, "next")}
          </button>
          <span>| {getTranslation(language, "perPage")}:</span>
          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
          >
            {[5, 10, 20, 50].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginTop: 16,
          }}
        >
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                color: "#fff",
                background: "#1976d2",
                border: "none",
                borderRadius: 4,
                padding: "8px 20px",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              {getTranslation(language, "addNewUser")}
            </button>
          )}
        </div>
        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxWidth: 400,
              marginLeft: "auto",
              marginRight: 0,
              background: "#222",
              padding: 20,
              borderRadius: 8,
            }}
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
            <select
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              required
            >
              <option value="">
                {getTranslation(language, "selectDepartment") ||
                  "Departman Seç"}
              </option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <input
              name="roleName"
              placeholder={`${getTranslation(
                language,
                "role"
              )} (e.g. Manager, User)`}
              value={form.roleName}
              onChange={handleChange}
              required
            />
            <button type="submit">{getTranslation(language, "save")}</button>
            {message && (
              <div
                style={{
                  marginTop: 12,
                  color: "#fff",
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: 400,
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
              >
                {message}
              </div>
            )}
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
