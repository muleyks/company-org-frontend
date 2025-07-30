import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";

export default function UpdateCompany() {
  const { language } = useLanguage();
  const { id } = useParams();
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
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({
    newName: "",
    newShortName: "",
    newAddress: "",
    newTypeId: "",
    newTownId: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  // Dropdown verileri için state'ler
  const [companyTypes, setCompanyTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [towns, setTowns] = useState([]);
  const [loadingTowns, setLoadingTowns] = useState(false);

  // Company types'ları çek
  useEffect(() => {
    const fetchCompanyTypes = async () => {
      setLoadingTypes(true);
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/company/get-all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          params: { page: 0, size: 1000 },
        });

        const companies = res.data.content || res.data || [];
        // Unique company type'larını al
        const uniqueTypes = companies
          .map((c) => c.type)
          .filter((type) => type && type.id && type.name)
          .filter(
            (type, index, self) =>
              index === self.findIndex((t) => t.id === type.id)
          );
        setCompanyTypes(uniqueTypes);
      } catch (err) {
        console.error("Company type'ları yüklenemedi:", err);
        // API'dan çekemiyorsa boş bırak
        setCompanyTypes([]);
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchCompanyTypes();
  }, []);

  // Tüm town'ları zincirleme API çağrısıyla çek
  useEffect(() => {
    const fetchTowns = async () => {
      setLoadingTowns(true);
      try {
        const token = localStorage.getItem("token");
        // 1. Şehirleri çek
        const citiesRes = await api.get("/town/get-all-cities", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        const cities = citiesRes.data || [];
        let allTowns = [];
        // 2. Her şehir için bölgeleri çek
        for (const city of cities) {
          const regionsRes = await api.get("/town/get-regions-by-city-id", {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
            params: { cityId: city.id },
          });
          const regions = regionsRes.data || [];
          // 3. Her bölge için town'ları çek
          for (const region of regions) {
            const townsRes = await api.get(
              "/town/get-towns-by-region-id-city-id",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "ngrok-skip-browser-warning": "true",
                },
                params: { regionId: region.id, cityId: city.id },
              }
            );
            const towns = townsRes.data || [];
            // 4. Town'ları birleştir
            allTowns = allTowns.concat(
              towns.map((town) => ({
                ...town,
                region: { ...region, city },
              }))
            );
          }
        }
        // Unique ve sıralı yap (id'ye göre)
        const uniqueTowns = allTowns
          .filter(
            (town, index, self) =>
              town &&
              town.id &&
              index === self.findIndex((t) => t.id === town.id)
          )
          .sort((a, b) => a.name.localeCompare(b.name));
        console.log("Yüklenen town'lar:", uniqueTowns);
        setTowns(uniqueTowns);
      } catch (err) {
        console.error("Town'lar yüklenemedi:", err);
        setTowns([]);
      } finally {
        setLoadingTowns(false);
      }
    };
    fetchTowns();
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Use the correct endpoint and request body
        const res = await api.post(
          "/company/get-id",
          { id: Number(id) },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        const found = res.data;
        setCompany(found);
        setForm({
          newName: found?.name || "",
          newShortName: found?.shortName || "",
          newAddress: found?.address || "",
          newTypeId: found?.type?.id || "",
          newTownId: found?.town?.id || "",
        });
      } catch (err) {
        setMessage("Şirket bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/company/update",
        {
          id: Number(id),
          newName: form.newName,
          newShortName: form.newShortName,
          newAddress: form.newAddress,
          newTypeId: Number(form.newTypeId),
          newTownId: Number(form.newTownId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setMessage(getTranslation(language, "success"));
      setTimeout(() => navigate("/admin/companies"), 1200);
    } catch (err) {
      setMessage(getTranslation(language, "error"));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>{getTranslation(language, "loading")}</div>;
  if (!company) return <div>{getTranslation(language, "error")}</div>;

  return (
    <>
      {/* Remove Navbar and Sidebar JSX completely. Only render the main content. */}
      <div>
        {/* İçerik */}
        <div
          style={{
            maxWidth: 500,
            margin: "100px auto",
            marginTop: 80,
            background: "#222",
            color: "#fff",
            padding: 32,
            borderRadius: 8,
          }}
        >
          <h2>{getTranslation(language, "editCompany")}</h2>
          <form
            onSubmit={handleUpdate}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginTop: 24,
            }}
          >
            <input
              name="newName"
              placeholder={getTranslation(language, "companyName")}
              value={form.newName}
              onChange={handleChange}
              required
            />
            <input
              name="newShortName"
              placeholder={getTranslation(language, "shortName")}
              value={form.newShortName}
              onChange={handleChange}
              required
            />
            <input
              name="newAddress"
              placeholder={getTranslation(language, "address")}
              value={form.newAddress}
              onChange={handleChange}
              required
            />
            <label>{getTranslation(language, "companyType")}</label>
            <select
              name="newTypeId"
              value={form.newTypeId}
              onChange={handleChange}
              required
              disabled={loadingTypes}
            >
              <option value="">
                {getTranslation(language, "selectCompanyType")}
              </option>
              {companyTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {translateCompanyType(type.name)}
                </option>
              ))}
            </select>
            <label>{getTranslation(language, "town")}</label>
            <select
              name="newTownId"
              value={form.newTownId}
              onChange={handleChange}
              required
              disabled={loadingTowns}
            >
              <option value="">{getTranslation(language, "selectTown")}</option>
              {towns.map((town) => (
                <option key={town.id} value={town.id}>
                  {town.name} - {town.region?.city?.name || "N/A"}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={updating}
              style={{
                color: "#fff",
                background: "#1976d2",
                border: "none",
                borderRadius: 4,
                padding: "8px 20px",
                fontSize: 16,
                cursor: updating ? "not-allowed" : "pointer",
              }}
            >
              {updating
                ? getTranslation(language, "updating")
                : getTranslation(language, "save")}
            </button>
            {message && (
              <div
                style={{
                  marginTop: 12,
                  color:
                    message.toLowerCase().includes("başarı") ||
                    message.toLowerCase().includes("success")
                      ? "#4caf50"
                      : "#e53935",
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: 400,
                }}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
