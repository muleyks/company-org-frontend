import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";

export default function CompanyTypeList() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Şirket tipi çeviri fonksiyonu
  const translateCompanyType = (typeName) => {
    switch (typeName) {
      case "E-commerce":
        return getTranslation(language, "ecommerce");
      case "Real Estate":
        return getTranslation(language, "realEstate");
      case "Consulting":
        return getTranslation(language, "consulting");
      case "Automotive":
        return getTranslation(language, "automotive");
      case "Financial Services":
        return getTranslation(language, "financialServices");
      case "Food & Beverage":
        return getTranslation(language, "foodBeverage");
      case "Logistics & Shipping":
        return getTranslation(language, "logisticsShipping");
      case "Healthcare":
        return getTranslation(language, "healthcare");
      case "Retail":
        return getTranslation(language, "retail");
      case "Energy":
        return getTranslation(language, "energy");
      case "Media & Entertainment":
        return getTranslation(language, "mediaEntertainment");
      case "Construction":
        return getTranslation(language, "construction");
      case "Telecommunications":
        return getTranslation(language, "telecommunications");
      case "Pharmaceutical":
        return getTranslation(language, "pharmaceutical");
      case "Education":
        return getTranslation(language, "education");
      case "Manufacturing":
        return getTranslation(language, "manufacturing");
      default:
        return typeName;
    }
  };

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [addMessage, setAddMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log("Şirket tipleri çekiliyor (fetchTypes useEffect)");
    const fetchTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/company-type/get-all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setTypes(response.data);
      } catch (err) {
        setError(getTranslation(language, "error"));
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    console.log("Admin kontrolü başlatıldı");
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/user/get-self", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        console.log("Kullanıcı rolü:", res.data.role?.name);
        setIsAdmin(res.data.role?.name === "Admin");
      } catch (err) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const handleDelete = async (typeId) => {
    if (!window.confirm(getTranslation(language, "confirmDeleteCompanyType")))
      return;
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/company-type/soft-delete",
        { typeId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setTypes(types.filter((t) => t.id !== typeId));
    } catch (err) {
      console.log("Silme hatası:", err, err.response?.data);
      alert(getTranslation(language, "companyTypeDeleteError"));
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddType = async (e) => {
    e.preventDefault();
    setAddMessage("");
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/company-type/create",
        { name: form.name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setForm({ name: "" });
      // Listeyi güncelle
      const response = await api.get("/company-type/get-all", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      setTypes(response.data);
      setShowForm(false);
    } catch (err) {
      setAddMessage(getTranslation(language, "companyTypeAddError"));
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div>{getTranslation(language, "loading")}</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  console.log("CompanyTypeList render oldu");
  return (
    <>
      {/* Remove Navbar and Sidebar JSX completely. Only render the main content. */}
      <div>
        <div
          style={{
            maxWidth: 600,
            margin: "60px auto",
            background: "#222",
            color: "#fff",
            padding: 24,
            borderRadius: 8,
          }}
        >
          <h2>{getTranslation(language, "companyTypes")}</h2>
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
                <th
                  style={{
                    padding: 8,
                    border: "1px solid #333",
                    textAlign: "left",
                  }}
                >
                  {getTranslation(language, "id")}
                </th>
                <th
                  style={{
                    padding: 8,
                    border: "1px solid #333",
                    textAlign: "left",
                  }}
                >
                  {getTranslation(language, "name")}
                </th>
                <th
                  style={{
                    padding: 8,
                    border: "1px solid #333",
                    textAlign: "left",
                  }}
                >
                  {getTranslation(language, "active")}
                </th>
                <th
                  style={{
                    padding: 8,
                    border: "1px solid #333",
                    textAlign: "left",
                  }}
                >
                  {getTranslation(language, "createdAt")}
                </th>
                <th
                  style={{
                    padding: 8,
                    border: "1px solid #333",
                    textAlign: "left",
                  }}
                >
                  {getTranslation(language, "deletedAt")}
                </th>
              </tr>
            </thead>
            <tbody>
              {types.map((type) => (
                <tr key={type.id}>
                  <td
                    style={{
                      padding: 8,
                      border: "1px solid #333",
                      textAlign: "left",
                    }}
                  >
                    {type.id}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: "1px solid #333",
                      textAlign: "left",
                    }}
                  >
                    {translateCompanyType(type.name)}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: "1px solid #333",
                      textAlign: "left",
                    }}
                  >
                    {type.active
                      ? getTranslation(language, "active")
                      : getTranslation(language, "inactive")}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: "1px solid #333",
                      textAlign: "left",
                    }}
                  >
                    {type.createdAt
                      ? new Date(type.createdAt).toLocaleString()
                      : "-"}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: "1px solid #333",
                      textAlign: "left",
                    }}
                  >
                    {type.deletedAt
                      ? new Date(type.deletedAt).toLocaleString()
                      : "-"}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: "1px solid #333",
                      textAlign: "left",
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(type.id)}
                        style={{
                          color: "#fff",
                          background: "#d32f2f",
                          border: "none",
                          borderRadius: 4,
                          padding: "4px 10px",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        {getTranslation(language, "delete")}
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() =>
                          navigate(`/admin/update-company-type/${type.id}`)
                        }
                        style={{
                          color: "#fff",
                          background: "#1976d2",
                          border: "none",
                          borderRadius: 4,
                          padding: "4px 10px",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        {getTranslation(language, "edit")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginTop: 16,
            }}
          >
            {isAdmin && !showForm && (
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
                {getTranslation(language, "add")}
              </button>
            )}
          </div>
          {isAdmin && showForm && (
            <form
              onSubmit={handleAddType}
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
                name="name"
                placeholder={getTranslation(language, "companyTypeName")}
                value={form.name}
                onChange={handleFormChange}
                required
              />
              <button
                type="submit"
                disabled={adding}
                style={{
                  color: "#fff",
                  background: "#1976d2",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 20px",
                  fontSize: 16,
                  cursor: adding ? "not-allowed" : "pointer",
                }}
              >
                {adding
                  ? getTranslation(language, "adding")
                  : getTranslation(language, "save")}
              </button>
              {addMessage && (
                <div
                  style={{
                    marginTop: 12,
                    color: "#e53935",
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: 400,
                  }}
                >
                  {addMessage}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
}
