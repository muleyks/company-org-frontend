import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function TownList() {
  const { language } = useLanguage();
  const query = useQuery();
  const cityId = query.get("cityId");
  const cityName = query.get("cityName");
  const regionId = query.get("regionId");
  const regionName = query.get("regionName");
  const [towns, setTowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTownName, setNewTownName] = useState("");
  const [addMessage, setAddMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCompaniesMenu, setShowCompaniesMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cityId || !regionId) {
      setError(getTranslation(language, "error"));
      setLoading(false);
      return;
    }
    const fetchTowns = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(
          `/town/get-towns-by-region-id-city-id?regionId=${regionId}&cityId=${cityId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        setTowns(res.data || []);
      } catch (err) {
        setError(getTranslation(language, "error"));
      } finally {
        setLoading(false);
      }
    };
    fetchTowns();
  }, [cityId, regionId]);

  useEffect(() => {
    if (addMessage) {
      const timer = setTimeout(() => setAddMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [addMessage]);

  const handleAddTown = async (e) => {
    e.preventDefault();
    setAddMessage("");
    if (!newTownName.trim()) return;
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/town/add-town",
        {
          name: newTownName,
          regionId: Number(regionId),
          cityId: Number(cityId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setAddMessage(getTranslation(language, "success"));
      setNewTownName("");
      // Listeyi güncelle
      const res = await api.get(
        `/town/get-towns-by-region-id-city-id?regionId=${regionId}&cityId=${cityId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setTowns(res.data || []);
    } catch (err) {
      setAddMessage(getTranslation(language, "error"));
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteTown = async (id) => {
    if (!window.confirm("Bu bölgeyi silmek istediğinize emin misiniz?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete("/town/soft-delete-town", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        data: { id },
      });
      setTowns(towns.filter((t) => t.id !== id));
    } catch (err) {
      alert("Bölge silinemedi!");
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error)
    return (
      <div style={{ color: "#e53935", textAlign: "center", marginBottom: 8 }}>
        {error}
      </div>
    );

  return (
    <>
      {/* Navbar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          background: "#111",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          height: 60,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          fontFamily: "inherit",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: 22,
            letterSpacing: 2,
            marginRight: 40,
            cursor: "pointer",
          }}
          onClick={() => setShowSidebar(true)}
        >
          DELTA
        </div>
        <div
          style={{
            display: "flex",
            gap: 32,
            fontSize: 18,
          }}
        >
          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/admin-dashboard")}
          >
            Home
          </span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/users")}
          >
            User Management
          </span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/profile")}
          >
            Profile
          </span>
        </div>
      </div>
      {/* Sidebar */}
      {showSidebar && (
        <div
          style={{
            position: "fixed",
            top: 60,
            left: 0,
            width: 220,
            background: "#222",
            color: "#fff",
            height: "calc(100vh - 60px)",
            zIndex: 2000,
            display: "flex",
            flexDirection: "column",
            paddingTop: 0,
            boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
            textAlign: "left",
            transition: "left 0.3s",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "2px 8px 0 4px",
            }}
          >
            <span
              style={{
                fontWeight: "bold",
                fontSize: 20,
                paddingLeft: 16,
                textAlign: "left",
              }}
            >
              Menü
            </span>
            <button
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: 22,
                cursor: "pointer",
              }}
              onClick={() => setShowSidebar(false)}
              aria-label="Kapat"
            >
              ×
            </button>
          </div>
          {/* Şirketler ana başlık ve alt başlıklar */}
          <div
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              fontSize: 20,
              fontWeight: 400,
            }}
            onClick={() => setShowCompaniesMenu((v) => !v)}
          >
            Şirketler
          </div>
          {showCompaniesMenu && (
            <div style={{ paddingLeft: 16 }}>
              <div
                style={{
                  padding: "8px 0",
                  cursor: "pointer",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onClick={() => {
                  navigate("/admin/companies");
                  setShowSidebar(false);
                  setShowCompaniesMenu(false);
                }}
              >
                <span style={{ fontSize: 16 }}>›</span> Şirketler
              </div>
              <div
                style={{
                  padding: "8px 0",
                  cursor: "pointer",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onClick={() => {
                  navigate("/admin/company-types");
                  setShowSidebar(false);
                  setShowCompaniesMenu(false);
                }}
              >
                <span style={{ fontSize: 16 }}>›</span> Şirket Tipleri
              </div>
            </div>
          )}
          {/* Diğer menü başlıkları */}
          <div
            style={{ padding: "12px 16px", cursor: "pointer", fontSize: 20 }}
            onClick={() => {
              navigate("/admin/departments");
              setShowSidebar(false);
            }}
          >
            Departmanlar
          </div>
          <div
            style={{ padding: "12px 16px", cursor: "pointer", fontSize: 20 }}
            onClick={() => {
              navigate("/admin/cities");
              setShowSidebar(false);
            }}
          >
            {getTranslation(language, "citiesRegions")}
          </div>
        </div>
      )}
      <div style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 900, margin: "100px auto" }}>
          <h2 style={{ textAlign: "center", marginBottom: 24 }}>
            {cityName} - {regionName} - {getTranslation(language, "regions")}
          </h2>
          {addMessage && (
            <div
              style={{
                color:
                  addMessage.toLowerCase().includes("başarı") ||
                  addMessage.toLowerCase().includes("success")
                    ? "#4caf50"
                    : "#e53935",
                fontSize: 15,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {addMessage}
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
                  {getTranslation(language, "regionName")}
                </th>
                <th style={{ padding: 8, border: "1px solid #333" }}>
                  {getTranslation(language, "actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {towns.map((town, idx) => (
                <tr key={town.id}>
                  <td style={{ padding: 8, border: "1px solid #333" }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #333" }}>
                    {town.name}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #333" }}>
                    <button
                      onClick={() => handleDeleteTown(town.id)}
                      style={{
                        color: "#fff",
                        background: "#d32f2f",
                        border: "none",
                        borderRadius: 4,
                        padding: "4px 10px",
                        cursor: "pointer",
                      }}
                    >
                      {getTranslation(language, "delete")}
                    </button>
                  </td>
                </tr>
              ))}
              {/* Bölge ekleme satırı */}
              <tr>
                <td style={{ padding: 8, border: "1px solid #333" }}></td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  <form
                    onSubmit={handleAddTown}
                    style={{ display: "flex", gap: 8 }}
                  >
                    <input
                      type="text"
                      placeholder={getTranslation(language, "newRegionName")}
                      value={newTownName}
                      onChange={(e) => setNewTownName(e.target.value)}
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
                        cursor: adding ? "not-allowed" : "pointer",
                        fontWeight: 500,
                      }}
                      disabled={adding}
                    >
                      {getTranslation(language, "add")}
                    </button>
                  </form>
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
