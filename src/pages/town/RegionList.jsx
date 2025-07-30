import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function RegionList() {
  const { language } = useLanguage();
  const query = useQuery();
  const cityId = query.get("cityId");
  const cityName = query.get("cityName");
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newRegionName, setNewRegionName] = useState("");
  const [addMessage, setAddMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  // Remove showSidebar and showCompaniesMenu state

  useEffect(() => {
    if (!cityId) {
      setError(getTranslation(language, "error"));
      setLoading(false);
      return;
    }
    const fetchRegions = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(
          `/town/get-regions-by-city-id?cityId=${cityId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        setRegions(res.data || []);
      } catch (err) {
        setError(getTranslation(language, "error"));
      } finally {
        setLoading(false);
      }
    };
    fetchRegions();
  }, [cityId]);

  const handleAddRegion = async (e) => {
    e.preventDefault();
    setAddMessage("");
    if (!newRegionName.trim()) return;
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/town/add-region",
        { name: newRegionName, cityId: Number(cityId) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setAddMessage(getTranslation(language, "success"));
      setNewRegionName("");
      // Listeyi güncelle
      const res = await api.get(
        `/town/get-regions-by-city-id?cityId=${cityId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setRegions(res.data || []);
    } catch (err) {
      setAddMessage(getTranslation(language, "error"));
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteRegion = async (id) => {
    if (!window.confirm(getTranslation(language, "confirmDeleteRegion")))
      return;
    try {
      const token = localStorage.getItem("token");
      await api.delete("/town/soft-delete-region", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        data: { id },
      });
      setRegions(regions.filter((r) => r.id !== id));
    } catch (err) {
      alert("Bölge silinemedi!");
    }
  };

  useEffect(() => {
    if (addMessage) {
      const timer = setTimeout(() => setAddMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [addMessage]);

  if (loading) return <div>{getTranslation(language, "loading")}</div>;
  if (error)
    return (
      <div style={{ color: "#e53935", textAlign: "center", marginBottom: 8 }}>
        {error}
      </div>
    );

  return (
    <>
      {/* Remove Navbar and Sidebar JSX completely. Only render the main content. */}
      <div>
        <div style={{ maxWidth: 900, margin: "100px auto" }}>
          <h2 style={{ textAlign: "center", marginBottom: 24 }}>
            {cityName} - {getTranslation(language, "districts")}
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
                  {getTranslation(language, "districtName")}
                </th>
                <th style={{ padding: 8, border: "1px solid #333" }}>
                  {getTranslation(language, "regions")}
                </th>
                <th style={{ padding: 8, border: "1px solid #333" }}>
                  {getTranslation(language, "actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {regions.map((region, idx) => (
                <tr key={region.id}>
                  <td style={{ padding: 8, border: "1px solid #333" }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #333" }}>
                    {region.name}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #333" }}>
                    <button
                      onClick={() =>
                        navigate(
                          `/admin/towns?cityId=${cityId}&regionId=${
                            region.id
                          }&cityName=${encodeURIComponent(
                            cityName
                          )}&regionName=${encodeURIComponent(region.name)}`
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
                      {getTranslation(language, "viewRegions")}
                    </button>
                  </td>
                  <td style={{ padding: 8, border: "1px solid #333" }}>
                    <button
                      onClick={() => handleDeleteRegion(region.id)}
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
                    onSubmit={handleAddRegion}
                    style={{ display: "flex", gap: 8 }}
                  >
                    <input
                      type="text"
                      placeholder={getTranslation(language, "newDistrictName")}
                      value={newRegionName}
                      onChange={(e) => setNewRegionName(e.target.value)}
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
                <td style={{ padding: 8, border: "1px solid #333" }}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
