import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";

export default function CityList() {
  const { language } = useLanguage();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCityName, setNewCityName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const navigate = useNavigate();
  // Remove showSidebar and showCompaniesMenu state

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (deleteMessage) {
      const timer = setTimeout(() => setDeleteMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [deleteMessage]);

  useEffect(() => {
    if (addMessage) {
      const timer = setTimeout(() => setAddMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [addMessage]);

  const fetchCities = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/town/get-all-cities", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      setCities(res.data || []);
    } catch (err) {
      setError(getTranslation(language, "error"));
    } finally {
      setLoading(false);
    }
  };

  // Sil butonu için gerçek API çağrısı
  const handleDelete = async (id) => {
    if (!window.confirm(getTranslation(language, "confirmDeleteCity"))) return;
    setDeleteMessage("");
    try {
      const token = localStorage.getItem("token");
      await api.delete("/town/soft-delete-city", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        data: { id },
      });
      setDeleteMessage(getTranslation(language, "success"));
      fetchCities();
    } catch (err) {
      setDeleteMessage(getTranslation(language, "error"));
    }
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    setAdding(true);
    setAddMessage("");
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/town/add-city",
        { name: newCityName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setAddMessage(getTranslation(language, "success"));
      setNewCityName("");
      fetchCities();
    } catch (err) {
      setAddMessage(getTranslation(language, "error"));
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      {/* Remove Navbar and Sidebar JSX completely. Only render the main content. */}
      <div>
        <div style={{ maxWidth: 900, margin: "100px auto" }}>
          <h2 style={{ textAlign: "center", marginBottom: 24 }}>
            {getTranslation(language, "cityList")}
          </h2>
          {loading && <div>{getTranslation(language, "loading")}</div>}
          {error && (
            <div
              style={{ color: "#e53935", textAlign: "center", marginBottom: 8 }}
            >
              {error}
            </div>
          )}
          {deleteMessage && (
            <div
              style={{
                color:
                  deleteMessage.toLowerCase().includes("başarı") ||
                  deleteMessage.toLowerCase().includes("success")
                    ? "#4caf50"
                    : "#e53935",
                fontSize: 15,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {deleteMessage}
            </div>
          )}
          {!loading && !error && (
            <>
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
                      {getTranslation(language, "actions")}
                    </th>
                    <th style={{ padding: 8, border: "1px solid #333" }}>
                      {getTranslation(language, "districts")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cities.map((city, idx) => (
                    <tr key={city.id}>
                      <td style={{ padding: 8, border: "1px solid #333" }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: 8, border: "1px solid #333" }}>
                        {city.name}
                      </td>
                      <td style={{ padding: 8, border: "1px solid #333" }}>
                        <button
                          onClick={() => handleDelete(city.id)}
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
                      </td>
                      <td style={{ padding: 8, border: "1px solid #333" }}>
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/regions?cityId=${
                                city.id
                              }&cityName=${encodeURIComponent(city.name)}`
                            )
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
                          {getTranslation(language, "districts")}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Add new city row */}
                  <tr>
                    <td style={{ padding: 8, border: "1px solid #333" }}></td>
                    <td style={{ padding: 8, border: "1px solid #333" }}>
                      <form
                        onSubmit={handleAddCity}
                        style={{ display: "flex", gap: 8 }}
                      >
                        <input
                          type="text"
                          placeholder={getTranslation(language, "newCityName")}
                          value={newCityName}
                          onChange={(e) => setNewCityName(e.target.value)}
                          style={{
                            padding: 4,
                            borderRadius: 4,
                            border: "1px solid #555",
                            width: 140,
                          }}
                          disabled={adding}
                        />
                        <button
                          type="submit"
                          style={{
                            color: "#fff",
                            background: "#1976d2",
                            border: "none",
                            borderRadius: 4,
                            padding: "4px 14px",
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                          disabled={adding}
                        >
                          {getTranslation(language, "add")}
                        </button>
                      </form>
                      {addMessage && (
                        <div
                          style={{
                            color:
                              addMessage.toLowerCase().includes("başarı") ||
                              addMessage.toLowerCase().includes("success")
                                ? "#4caf50"
                                : "#e53935",
                            fontSize: 14,
                            marginTop: 4,
                          }}
                        >
                          {addMessage}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: 8, border: "1px solid #333" }}></td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </>
  );
}
