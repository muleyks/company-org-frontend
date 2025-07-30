import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";

export default function UpdateDepartment() {
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [form, setForm] = useState({
    newName: "",
    newCompanyId: "",
    newTypeId: "",
    newTownId: "",
    newAddress: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("department");
  const [towns, setTowns] = useState([]);
  const [loadingTowns, setLoadingTowns] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [departmentTypes, setDepartmentTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [hierarchyData, setHierarchyData] = useState({
    parents: [],
    children: [],
  });
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [loadingAvailableDepartments, setLoadingAvailableDepartments] =
    useState(false);
  const [selectedChildDepartment, setSelectedChildDepartment] = useState("");
  const [addingChild, setAddingChild] = useState(false);
  const [removingChild, setRemovingChild] = useState(null);

  // Tüm şirketleri çek
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
        });
        setCompanies(res.data || []);
      } catch (err) {
        console.error("Şirketler yüklenemedi:", err);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  // Tüm department type'larını çek
  useEffect(() => {
    const fetchDepartmentTypes = async () => {
      setLoadingTypes(true);
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/department/get-all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          params: { page: 0, size: 1000 },
        });

        const departments = res.data.content || res.data || [];
        // Unique department type'larını al
        const uniqueTypes = departments
          .map((d) => d.type)
          .filter((type) => type && type.id && type.name)
          .filter(
            (type, index, self) =>
              index === self.findIndex((t) => t.id === type.id)
          );
        setDepartmentTypes(uniqueTypes);
      } catch (err) {
        console.error("Department type'ları yüklenemedi:", err);
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchDepartmentTypes();
  }, []);

  // Hiyerarşi bilgilerini çek
  useEffect(() => {
    const fetchHierarchy = async () => {
      if (!id) return;
      setLoadingHierarchy(true);
      try {
        const token = localStorage.getItem("token");

        // Parent departmanları çek - POST request with body
        const parentsRes = await api.post(
          "/department-hierarchy/get-parents-only",
          { id: parseInt(id) },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        // Child departmanları çek - POST request with body
        const childrenRes = await api.post(
          "/department-hierarchy/get-children-only",
          { id: parseInt(id) },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        setHierarchyData({
          parents: parentsRes.data || [],
          children: childrenRes.data || [],
        });
      } catch (err) {
        console.error("Hiyerarşi bilgileri yüklenemedi:", err);
      } finally {
        setLoadingHierarchy(false);
      }
    };
    fetchHierarchy();
  }, [id]);

  // Mevcut departmanları çek (child eklemek için)
  useEffect(() => {
    const fetchAvailableDepartments = async () => {
      setLoadingAvailableDepartments(true);
      try {
        const token = localStorage.getItem("token");

        // Tüm departmanları çek
        const departmentsRes = await api.get("/department/get-all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          params: { page: 0, size: 1000 },
        });
        const allDepartments =
          departmentsRes.data.content || departmentsRes.data || [];

        // Hiyerarşi ilişkilerini çek
        const hierarchyRes = await api.get("/department-hierarchy/get-all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        const hierarchyData = hierarchyRes.data || [];

        // Parent olan departmanların ID'lerini topla
        const parentDepartmentIds = new Set();
        hierarchyData.forEach((relation) => {
          if (relation.parentDepartment && relation.parentDepartment.id) {
            parentDepartmentIds.add(relation.parentDepartment.id);
          }
        });

        // Mevcut departmanın şirketini bul
        const currentDepartment = allDepartments.find(
          (dept) => dept.id === parseInt(id)
        );
        const currentCompanyId = currentDepartment?.company?.id;

        // Sadece parent olmayan, kendisi olmayan ve aynı şirketteki departmanları filtrele
        const availableDepartments = allDepartments.filter(
          (dept) =>
            dept.id !== parseInt(id) &&
            !parentDepartmentIds.has(dept.id) &&
            dept.company?.id === currentCompanyId
        );

        setAvailableDepartments(availableDepartments);
      } catch (err) {
        console.error("Departmanlar yüklenemedi:", err);
      } finally {
        setLoadingAvailableDepartments(false);
      }
    };
    fetchAvailableDepartments();
  }, [id]);

  // Tüm town'ları çek
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

  useEffect(() => {
    const fetchDepartment = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Varsayım: /department/get-all ile tüm departmanlar çekiliyor, pagination yoksa veya büyük size ile çekilebilir
        const res = await api.get("/department/get-all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          params: { page: 0, size: 1000 },
        });
        const found = (res.data.content || res.data || []).find(
          (d) => String(d.id) === String(id)
        );
        if (!found) {
          setMessage("Departman bulunamadı.");
        } else {
          setDepartment(found);
          setForm({
            newName: found.name || "",
            newCompanyId: found.company?.id || "",
            newTypeId: found.type?.id || "",
            newTownId: found.town?.id || "",
            newAddress: found.address || "",
          });
        }
      } catch (err) {
        setMessage("Departman bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartment();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Child departman ekleme
  const handleAddChild = async () => {
    if (!selectedChildDepartment) return;

    setAddingChild(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/department-hierarchy/add",
        {
          parentDepartmentId: parseInt(id),
          childDepartmentId: parseInt(selectedChildDepartment),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      // Hiyerarşiyi yeniden yükle
      const fetchHierarchy = async () => {
        try {
          const parentsRes = await api.post(
            "/department-hierarchy/get-parents-only",
            { id: parseInt(id) },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
              },
            }
          );

          const childrenRes = await api.post(
            "/department-hierarchy/get-children-only",
            { id: parseInt(id) },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
              },
            }
          );

          setHierarchyData({
            parents: parentsRes.data || [],
            children: childrenRes.data || [],
          });
        } catch (err) {
          console.error("Hiyerarşi yeniden yüklenemedi:", err);
        }
      };

      await fetchHierarchy();
      setSelectedChildDepartment("");
    } catch (err) {
      console.error("Child departman eklenemedi:", err);
    } finally {
      setAddingChild(false);
    }
  };

  // Departman ismini çevir
  const translateDepartmentName = (name) => {
    const departmentTranslations = {
      "Sales & Marketing":
        language === "tr" ? "Satış ve Pazarlama" : "Sales & Marketing",
      Logistics: language === "tr" ? "Lojistik" : "Logistics",
      "IT Support": language === "tr" ? "IT Destek" : "IT Support",
      "Software Development":
        language === "tr" ? "Yazılım Geliştirme" : "Software Development",
      "Human Resources":
        language === "tr" ? "İnsan Kaynakları" : "Human Resources",
      Management: language === "tr" ? "Yönetim" : "Management",
      "Financial Consulting":
        language === "tr" ? "Finansal Danışmanlık" : "Financial Consulting",
      "Investment Banking":
        language === "tr" ? "Yatırım Bankacılığı" : "Investment Banking",
      Production: language === "tr" ? "Üretim" : "Production",
      "Mobile Development":
        language === "tr" ? "Mobil Geliştirme" : "Mobile Development",
      "Web Development":
        language === "tr" ? "Web Geliştirme" : "Web Development",
      "Executive Board":
        language === "tr" ? "Yönetim Kurulu" : "Executive Board",
      "Data Science": language === "tr" ? "Veri Bilimi" : "Data Science",
      "Senior Partners":
        language === "tr" ? "Kıdemli Ortaklar" : "Senior Partners",
    };
    return departmentTranslations[name] || name;
  };

  // Child departman silme
  const handleRemoveChild = async (childId) => {
    if (!window.confirm(getTranslation(language, "confirmRemoveChild"))) return;

    setRemovingChild(childId);
    try {
      const token = localStorage.getItem("token");
      await api.delete("/department-hierarchy/remove", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        data: {
          parentDepartmentId: parseInt(id),
          childDepartmentId: childId,
        },
      });

      // Hiyerarşiyi yeniden yükle
      const fetchHierarchy = async () => {
        try {
          const parentsRes = await api.post(
            "/department-hierarchy/get-parents-only",
            { id: parseInt(id) },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
              },
            }
          );

          const childrenRes = await api.post(
            "/department-hierarchy/get-children-only",
            { id: parseInt(id) },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
              },
            }
          );

          setHierarchyData({
            parents: parentsRes.data || [],
            children: childrenRes.data || [],
          });
        } catch (err) {
          console.error("Hiyerarşi yeniden yüklenemedi:", err);
        }
      };

      await fetchHierarchy();
    } catch (err) {
      console.error("Child departman silinemedi:", err);
    } finally {
      setRemovingChild(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const body = {
      id: Number(id),
      newName: form.newName,
      newCompanyId: Number(form.newCompanyId),
      newTypeId: Number(form.newTypeId),
      newTownId: Number(form.newTownId),
      newAddress: form.newAddress,
    };
    console.log("Departman güncelleme için gönderilen body:", body);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/department/update",
        {
          id: Number(id),
          newName: form.newName,
          newCompanyId: Number(form.newCompanyId),
          newTypeId: Number(form.newTypeId),
          newTownId: Number(form.newTownId),
          newAddress: form.newAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setMessage("Departman başarıyla güncellendi!");
      setTimeout(() => navigate("/admin/departments"), 1200);
    } catch (err) {
      setMessage("Departman güncellenemedi!");
    }
  };

  if (loading) return <div>{getTranslation(language, "loading")}</div>;
  if (message && !department)
    return <div style={{ color: "red" }}>{message}</div>;
  if (!department) return null;

  return (
    <div style={{ maxWidth: 600, margin: "100px auto", marginTop: 80 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>
        {getTranslation(language, "editDepartment")}
      </h2>
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
      {/* TAB BUTTONS */}
      <div style={{ display: "flex", marginBottom: 24 }}>
        <button
          style={{
            flex: 1,
            padding: 12,
            background: activeTab === "department" ? "#183d5d" : "#0d2236",
            color: "#fff",
            border: "none",
            borderBottom:
              activeTab === "department" ? "3px solid #e53935" : "none",
            fontWeight: activeTab === "department" ? "bold" : "normal",
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("department")}
        >
          {getTranslation(language, "departmentInfo")}
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
          {getTranslation(language, "companyInfo")}
        </button>
        <button
          style={{
            flex: 1,
            padding: 12,
            background: activeTab === "other" ? "#183d5d" : "#0d2236",
            color: "#fff",
            border: "none",
            borderBottom: activeTab === "other" ? "3px solid #e53935" : "none",
            fontWeight: activeTab === "other" ? "bold" : "normal",
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("other")}
        >
          {getTranslation(language, "other")}
        </button>
        <button
          style={{
            flex: 1,
            padding: 12,
            background: activeTab === "hierarchy" ? "#183d5d" : "#0d2236",
            color: "#fff",
            border: "none",
            borderBottom:
              activeTab === "hierarchy" ? "3px solid #e53935" : "none",
            fontWeight: activeTab === "hierarchy" ? "bold" : "normal",
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("hierarchy")}
        >
          {getTranslation(language, "hierarchy")}
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        {activeTab === "department" && (
          <>
            <label>{getTranslation(language, "departmentName")}</label>
            <input
              name="newName"
              value={form.newName}
              onChange={handleChange}
              required
            />
            <label>{getTranslation(language, "address")}</label>
            <input
              name="newAddress"
              value={form.newAddress}
              onChange={handleChange}
            />
          </>
        )}
        {activeTab === "company" && (
          <>
            <label>{getTranslation(language, "company")}</label>
            <select
              name="newCompanyId"
              value={form.newCompanyId}
              onChange={handleChange}
              required
              disabled={loadingCompanies}
            >
              <option value="">
                {getTranslation(language, "selectCompany")}
              </option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <label>{getTranslation(language, "departmentType")}</label>
            <select
              name="newTypeId"
              value={form.newTypeId}
              onChange={handleChange}
              required
              disabled={loadingTypes}
            >
              <option value="">
                {getTranslation(language, "selectDepartmentType")}
              </option>
              {departmentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
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
          </>
        )}
        {activeTab === "other" && (
          <>
            <div>
              {getTranslation(language, "createdAt")}:{" "}
              {department.createdAt || "-"}
            </div>
            <div>
              {getTranslation(language, "updatedAt")}:{" "}
              {department.updatedAt || "-"}
            </div>
            <div>
              {getTranslation(language, "deletedAt")}:{" "}
              {department.deletedAt || "-"}
            </div>
            <div>
              {getTranslation(language, "id")}: {department.id}
            </div>
          </>
        )}
        {activeTab === "hierarchy" && (
          <>
            {loadingHierarchy ? (
              <div>{getTranslation(language, "loading")}</div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ marginBottom: 8 }}>
                    {getTranslation(language, "parentDepartments")}
                  </h3>
                  {hierarchyData.parents.length > 0 ? (
                    <div
                      style={{
                        padding: 8,
                        background: "#333",
                        borderRadius: 4,
                      }}
                    >
                      {hierarchyData.parents.map((parent, idx) => (
                        <div
                          key={parent.id}
                          style={{
                            marginBottom: 8,
                            padding: 8,
                            background: "#444",
                            borderRadius: 4,
                          }}
                        >
                          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                            • {translateDepartmentName(parent.name)}
                          </div>
                          <div style={{ fontSize: "0.9em", color: "#ccc" }}>
                            <div>
                              {getTranslation(language, "company")}:{" "}
                              {parent.company?.name ||
                                getTranslation(language, "notAvailable")}
                            </div>
                            <div>
                              {getTranslation(language, "address")}:{" "}
                              {parent.address ||
                                getTranslation(language, "notAvailable")}
                            </div>
                            <div>
                              {getTranslation(language, "status")}:{" "}
                              {parent.active
                                ? getTranslation(language, "active")
                                : getTranslation(language, "inactive")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: 8,
                        background: "#333",
                        borderRadius: 4,
                        color: "#888",
                      }}
                    >
                      {getTranslation(language, "noParentDepartments")}
                    </div>
                  )}
                </div>

                <div>
                  <h3 style={{ marginBottom: 8 }}>
                    {getTranslation(language, "childDepartments")}
                  </h3>

                  {/* Child Ekleme Bölümü */}
                  <div
                    style={{
                      marginBottom: 16,
                      padding: 12,
                      background: "#333",
                      borderRadius: 4,
                    }}
                  >
                    <h4 style={{ marginBottom: 8, fontSize: "0.9em" }}>
                      {getTranslation(language, "addChildDepartment")}
                    </h4>
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <select
                        value={selectedChildDepartment}
                        onChange={(e) =>
                          setSelectedChildDepartment(e.target.value)
                        }
                        disabled={loadingAvailableDepartments || addingChild}
                        style={{
                          flex: 1,
                          padding: 8,
                          borderRadius: 4,
                          border: "1px solid #555",
                          background: "#222",
                          color: "#fff",
                        }}
                      >
                        <option value="">
                          {loadingAvailableDepartments
                            ? getTranslation(language, "loading")
                            : availableDepartments.length === 0
                            ? getTranslation(language, "noAvailableDepartments")
                            : getTranslation(language, "selectChildDepartment")}
                        </option>
                        {availableDepartments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {translateDepartmentName(dept.name)} (
                            {dept.company?.name ||
                              getTranslation(language, "notAvailable")}
                            )
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddChild}
                        disabled={!selectedChildDepartment || addingChild}
                        style={{
                          padding: "8px 16px",
                          background: "#1976d2",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          cursor:
                            !selectedChildDepartment || addingChild
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            !selectedChildDepartment || addingChild ? 0.6 : 1,
                        }}
                      >
                        {addingChild
                          ? getTranslation(language, "adding")
                          : getTranslation(language, "add")}
                      </button>
                    </div>
                  </div>

                  {/* Child Departmanlar Listesi */}
                  {hierarchyData.children.length > 0 ? (
                    <div
                      style={{
                        padding: 8,
                        background: "#333",
                        borderRadius: 4,
                      }}
                    >
                      {hierarchyData.children.map((child, idx) => (
                        <div
                          key={child.id}
                          style={{
                            marginBottom: 8,
                            padding: 8,
                            background: "#444",
                            borderRadius: 4,
                            position: "relative",
                          }}
                        >
                          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                            • {translateDepartmentName(child.name)}
                          </div>
                          <div style={{ fontSize: "0.9em", color: "#ccc" }}>
                            <div>
                              {getTranslation(language, "company")}:{" "}
                              {child.company?.name ||
                                getTranslation(language, "notAvailable")}
                            </div>
                            <div>
                              {getTranslation(language, "address")}:{" "}
                              {child.address ||
                                getTranslation(language, "notAvailable")}
                            </div>
                            <div>
                              {getTranslation(language, "status")}:{" "}
                              {child.active
                                ? getTranslation(language, "active")
                                : getTranslation(language, "inactive")}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveChild(child.id)}
                            disabled={removingChild === child.id}
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              padding: "4px 8px",
                              background: "#d32f2f",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              cursor:
                                removingChild === child.id
                                  ? "not-allowed"
                                  : "pointer",
                              fontSize: "0.8em",
                              opacity: removingChild === child.id ? 0.6 : 1,
                            }}
                          >
                            {removingChild === child.id
                              ? getTranslation(language, "removing")
                              : getTranslation(language, "delete")}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: 8,
                        background: "#333",
                        borderRadius: 4,
                        color: "#888",
                      }}
                    >
                      {getTranslation(language, "noChildDepartments")}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
        <button type="submit" style={{ marginTop: 16 }}>
          {getTranslation(language, "updateDepartment")}
        </button>
      </form>
    </div>
  );
}
