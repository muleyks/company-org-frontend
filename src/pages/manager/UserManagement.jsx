import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import ManagerLayout from "../../components/ManagerLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";

export default function UserManagement() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // State'ler
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [myDepartmentId, setMyDepartmentId] = useState(null);
  const [myCompanyId, setMyCompanyId] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    surName: "",
    email: "",
    roleName: "User", // Default role
  });

  // Manager'ın kendi bilgilerini çek
  useEffect(() => {
    const fetchManagerInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/user/get-self", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (res.data.role?.name !== "Manager") {
          navigate("/login");
          return;
        }

        setMyDepartmentId(res.data.department?.id);
        setMyCompanyId(res.data.department?.company?.id);
        console.log("Manager'ın departman ID'si:", res.data.department?.id);
      } catch (err) {
        console.error("Manager bilgileri alınamadı:", err);
        navigate("/login");
      }
    };

    fetchManagerInfo();
  }, [navigate]);

  // Kullanıcıları çek
  useEffect(() => {
    const fetchUsers = async () => {
      if (!myDepartmentId) return;

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

        // Backend zaten manager'ın departmanı ve alt departmanlarındaki kullanıcıları döndürüyor
        // Ekstra filtreleme yapmaya gerek yok
        setUsers(res.data.users || []);
        setTotalUsers(res.data.totalElements || res.data.users?.length || 0);
      } catch (err) {
        console.error("Kullanıcılar yüklenemedi:", err);
        setError(getTranslation(language, "error"));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [myDepartmentId, page, size, language]);

  // Form değişiklikleri
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Kullanıcı ekleme
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...form,
        departmentId: myDepartmentId,
      };

      await api.post("/auth/register", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      setMessage(getTranslation(language, "userSavedSuccess"));
      setShowForm(false);
      setForm({ firstName: "", surName: "", email: "", roleName: "User" });

      // Listeyi yenile
      const res = await api.get("/user/get-all-users-detailed", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        params: { page, size },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Kullanıcı eklenemedi:", err);
      setMessage(getTranslation(language, "userDeleteError"));
    }
  };

  // Kullanıcı silme
  const handleDelete = async (userId) => {
    if (!window.confirm(getTranslation(language, "confirmDeleteUser"))) return;

    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/user/soft-delete-user",
        { id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      setUsers(users.filter((u) => u.id !== userId));
      setMessage(getTranslation(language, "userDeletedSuccess"));
    } catch (err) {
      console.error("Kullanıcı silinemedi:", err);
      alert(getTranslation(language, "userDeleteError"));
    }
  };

  // Role çevirisi
  const getRoleTranslation = (roleName) => {
    switch (roleName) {
      case "Manager":
        return getTranslation(language, "roleManager");
      case "User":
        return getTranslation(language, "roleUser");
      case "Admin":
        return getTranslation(language, "roleAdmin");
      default:
        return roleName;
    }
  };

  if (loading) return <div>{getTranslation(language, "loading")}</div>;

  return (
    <ManagerLayout>
      <div style={{ maxWidth: 1200, margin: "100px auto", marginTop: 80 }}>
        <h2>{getTranslation(language, "userManagement")}</h2>

        {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}

        {message && (
          <div
            style={{
              color: message.includes("başarı") ? "green" : "red",
              marginBottom: 16,
            }}
          >
            {message}
          </div>
        )}

        {/* Kullanıcılar Tablosu */}
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
                {getTranslation(language, "role")}
              </th>
              <th style={{ padding: 8, border: "1px solid #333" }}>
                {getTranslation(language, "department")}
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
            {users.map((user, idx) => (
              <tr key={user.id}>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  {page * size + idx + 1}
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
                  {getRoleTranslation(user.role?.name)}
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  {user.department?.name || "-"}
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  {user.active
                    ? getTranslation(language, "active")
                    : getTranslation(language, "inactive")}
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  {user.role?.name !== "Manager" && user.enabled && (
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
                        onClick={() =>
                          navigate(`/manager/update-user/${user.id}`)
                        }
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

        {/* Kullanıcı Ekleme Butonu */}
        <div style={{ marginTop: 16 }}>
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

        {/* Kullanıcı Ekleme Formu */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxWidth: 400,
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
              style={{ padding: 8, borderRadius: 4, border: "1px solid #555" }}
            />
            <input
              name="surName"
              placeholder={getTranslation(language, "lastName")}
              value={form.surName}
              onChange={handleChange}
              required
              style={{ padding: 8, borderRadius: 4, border: "1px solid #555" }}
            />
            <input
              name="email"
              type="email"
              placeholder={getTranslation(language, "email")}
              value={form.email}
              onChange={handleChange}
              required
              style={{ padding: 8, borderRadius: 4, border: "1px solid #555" }}
            />
            <select
              name="roleName"
              value={form.roleName}
              onChange={handleChange}
              required
              style={{ padding: 8, borderRadius: 4, border: "1px solid #555" }}
            >
              <option value="User">
                {getTranslation(language, "roleUser")}
              </option>
              <option value="Manager">
                {getTranslation(language, "roleManager")}
              </option>
            </select>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                style={{
                  color: "#fff",
                  background: "#4caf50",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                {getTranslation(language, "save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({
                    firstName: "",
                    surName: "",
                    email: "",
                    roleName: "User",
                  });
                }}
                style={{
                  color: "#fff",
                  background: "#666",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                {getTranslation(language, "cancel")}
              </button>
            </div>
          </form>
        )}

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            marginTop: 20,
          }}
        >
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            style={{
              padding: "8px 16px",
              background: page === 0 ? "#666" : "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: page === 0 ? "not-allowed" : "pointer",
            }}
          >
            {getTranslation(language, "previous")}
          </button>

          <span>
            {getTranslation(language, "page")}: {page + 1}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={users.length < size}
            style={{
              padding: "8px 16px",
              background: users.length < size ? "#666" : "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: users.length < size ? "not-allowed" : "pointer",
            }}
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
            style={{ padding: 4, borderRadius: 4 }}
          >
            {[5, 10, 20, 50].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </ManagerLayout>
  );
}
