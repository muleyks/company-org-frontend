import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";

export default function CompanyList() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0); // If backend returns total count
  // Filtre state
  const [filter, setFilter] = useState({
    type: "",
    city: "",
    active: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    shortName: "",
    address: "",
    typeId: "",
    townId: "",
  });
  const [addMessage, setAddMessage] = useState("");
  const [adding, setAdding] = useState(false);

  // Dropdown data states
  const [companyTypes, setCompanyTypes] = useState([]);
  const [towns, setTowns] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingTowns, setLoadingTowns] = useState(false);

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

  // Unique filtre seçenekleri
  // const nameOptions = [...new Set(companies.map(c => c.name).filter(Boolean))];
  // const shortNameOptions = [...new Set(companies.map(c => c.shortName).filter(Boolean))];
  const typeOptions = [
    ...new Set(companies.map((c) => c.type?.name).filter(Boolean)),
  ];
  const cityOptions = [
    ...new Set(
      companies.map((c) => c.town?.region?.city?.name).filter(Boolean)
    ),
  ];
  const activeOptions = [
    getTranslation(language, "active"),
    getTranslation(language, "inactive"),
  ];

  // Filtreli şirketler
  const filteredCompanies = companies.filter(
    (company) =>
      (!filter.type || company.type?.name === filter.type) &&
      (!filter.city || company.town?.region?.city?.name === filter.city) &&
      (!filter.active ||
        (filter.active === "Aktif" ? company.active : !company.active))
  );

  const handleDelete = async (companyId) => {
    if (!window.confirm(getTranslation(language, "confirmDeleteCompany")))
      return;
    try {
      const token = localStorage.getItem("token");
      await api.delete("/company/soft-delete", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        data: { id: companyId },
      });
      setCompanies(companies.filter((c) => c.id !== companyId));
    } catch (err) {
      alert(getTranslation(language, "companyDeleteError"));
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    setAddMessage("");
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/company/add",
        {
          name: form.name,
          shortName: form.shortName,
          address: form.address,
          typeId: Number(form.typeId),
          townId: Number(form.townId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setForm({ name: "", shortName: "", address: "", typeId: "", townId: "" });
      // Listeyi güncelle
      const response = await api.get("/company/get-all", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        params: { page, size },
      });
      if (Array.isArray(response.data)) {
        setCompanies(response.data);
      } else if (response.data.content) {
        setCompanies(response.data.content);
        setTotalCount(response.data.totalElements || 0);
      } else {
        setCompanies([]);
      }
      setShowForm(false);
    } catch (err) {
      setAddMessage("Şirket eklenemedi!");
    } finally {
      setAdding(false);
    }
  };

  // Kullanıcının rolünü kontrol et
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/user/get-self", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setUserRole(res.data.role?.name || "");
      } catch (err) {
        console.error("Kullanıcı rolü alınamadı:", err);
      }
    };
    checkUserRole();
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/company/get-all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          params: { page, size },
        });
        // If backend returns { content: [...], totalElements: ... }
        if (Array.isArray(response.data)) {
          setCompanies(response.data);
        } else if (response.data.content) {
          setCompanies(response.data.content);
          setTotalCount(response.data.totalElements || 0);
        } else {
          setCompanies([]);
        }
      } catch (err) {
        setError("Şirketler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [page, size]);

  // Company types'ları çek
  useEffect(() => {
    const fetchCompanyTypes = async () => {
      setLoadingTypes(true);
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/company-type/get-all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setCompanyTypes(res.data || []);
      } catch (err) {
        console.error("Company type'ları yüklenemedi:", err);
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchCompanyTypes();
  }, []);

  // Towns'ları çek
  useEffect(() => {
    const fetchTowns = async () => {
      setLoadingTowns(true);
      try {
        const token = localStorage.getItem("token");

        // Önce tüm şehirleri çek
        const citiesRes = await api.get("/town/get-all-cities", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        // Her şehir için bölgeleri çek
        const allTowns = [];
        for (const city of citiesRes.data || []) {
          try {
            const regionsRes = await api.get(
              `/town/get-regions-by-city-id?cityId=${city.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "ngrok-skip-browser-warning": "true",
                },
              }
            );

            for (const region of regionsRes.data || []) {
              try {
                const townsRes = await api.get(
                  `/town/get-towns-by-region-id-city-id?regionId=${region.id}&cityId=${city.id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "ngrok-skip-browser-warning": "true",
                    },
                  }
                );

                allTowns.push(...(townsRes.data || []));
              } catch (err) {
                console.error(
                  `Town'lar yüklenemedi - Region: ${region.id}`,
                  err
                );
              }
            }
          } catch (err) {
            console.error(`Bölgeler yüklenemedi - City: ${city.id}`, err);
          }
        }

        setTowns(allTowns);
      } catch (err) {
        console.error("Town'lar yüklenemedi:", err);
      } finally {
        setLoadingTowns(false);
      }
    };
    fetchTowns();
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <>
      {/* Remove Navbar and Sidebar JSX completely. Only render the main content. */}
      <div>
        <div
          style={{
            maxWidth: 900,
            margin: "60px auto",
            background: "#222",
            color: "#fff",
            padding: 24,
            borderRadius: 8,
          }}
        >
          <h2>{getTranslation(language, "companies")}</h2>
          {/* Filtreler */}
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
                background: "#181818",
                padding: 16,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <select
                value={filter.type}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, type: e.target.value }))
                }
              >
                <option value="">
                  {getTranslation(language, "typeFilter")}
                </option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {translateCompanyType(t)}
                  </option>
                ))}
              </select>
              <select
                value={filter.city}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, city: e.target.value }))
                }
              >
                <option value="">
                  {getTranslation(language, "cityFilter")}
                </option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
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
                {activeOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setFilter({ type: "", city: "", active: "" });
                  setShowFilters(false);
                }}
                style={{
                  background: "#333",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "6px 16px",
                  cursor: "pointer",
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
                  {getTranslation(language, "shortName")}
                </th>
                <th
                  style={{
                    padding: 8,
                    border: "1px solid #333",
                    textAlign: "left",
                  }}
                >
                  {getTranslation(language, "type")}
                </th>
                <th
                  style={{
                    padding: 8,
                    border: "1px solid #333",
                    textAlign: "left",
                  }}
                >
                  {getTranslation(language, "city")}
                </th>
                <th
                  style={{
                    padding: 8,
                    border: "1px solid #333",
                    textAlign: "left",
                  }}
                >
                  {getTranslation(language, "address")}
                </th>
                <th
                  style={{
                    padding: 8,
                    border: "1px solid #333",
                    textAlign: "left",
                  }}
                >
                  {getTranslation(language, "status")}
                </th>
                <th
                  style={{
                    padding: 8,
                    border: "1px solid #333",
                    textAlign: "left",
                  }}
                >
                  {getTranslation(language, "actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id}>
                  <td
                    style={{
                      padding: 8,
                      border: "1px solid #333",
                      textAlign: "left",
                    }}
                  >
                    {company.id}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: "1px solid #333",
                      textAlign: "left",
                    }}
                  >
                    {company.name}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: "1px solid #333",
                      textAlign: "left",
                    }}
                  >
                    {company.shortName}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: "1px solid #333",
                      textAlign: "left",
                    }}
                  >
                    {translateCompanyType(company.type?.name) || "-"}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: "1px solid #333",
                      textAlign: "left",
                    }}
                  >
                    {company.town?.region?.city?.name || "-"}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: "1px solid #333",
                      textAlign: "left",
                    }}
                  >
                    {company.address || "-"}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      border: "1px solid #333",
                      textAlign: "left",
                    }}
                  >
                    {company.active
                      ? getTranslation(language, "active")
                      : getTranslation(language, "inactive")}
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
                    {company.active && userRole === "Admin" && (
                      <>
                        <button
                          onClick={() => handleDelete(company.id)}
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
                        <button
                          onClick={() =>
                            navigate(`/admin/update-company/${company.id}`)
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
              disabled={companies.length < size}
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
            {!showForm && userRole === "Admin" && (
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
                {getTranslation(language, "addCompany")}
              </button>
            )}
          </div>
          {showForm && (
            <form
              onSubmit={handleAddCompany}
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
                placeholder={getTranslation(language, "companyName")}
                value={form.name}
                onChange={handleFormChange}
                required
              />
              <input
                name="shortName"
                placeholder={getTranslation(language, "shortName")}
                value={form.shortName}
                onChange={handleFormChange}
                required
              />
              <input
                name="address"
                placeholder={getTranslation(language, "address")}
                value={form.address}
                onChange={handleFormChange}
                required
              />
              <select
                name="typeId"
                value={form.typeId}
                onChange={handleFormChange}
                required
                disabled={loadingTypes}
                style={{
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid #444",
                  background: "#333",
                  color: "#fff",
                  fontSize: "14px",
                }}
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
              <select
                name="townId"
                value={form.townId}
                onChange={handleFormChange}
                required
                disabled={loadingTowns}
                style={{
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid #444",
                  background: "#333",
                  color: "#fff",
                  fontSize: "14px",
                }}
              >
                <option value="">
                  {getTranslation(language, "selectCity")}
                </option>
                {towns.map((town) => (
                  <option key={town.id} value={town.id}>
                    {town.name} -{" "}
                    {town.region?.city?.name ||
                      getTranslation(language, "unknownCity")}
                  </option>
                ))}
              </select>
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
