//admin kontrolü yapılacak

import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";

export default function DepartmentList() {
  const { language } = useLanguage();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    companyId: "",
    typeId: "",
    townId: "",
    address: "",
  });
  const [addMessage, setAddMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editDepartment, setEditDepartment] = useState({
    newName: "",
    newCompanyId: "",
    newTypeId: "",
    newTownId: "",
    newAddress: "",
  });
  const [expandedRow, setExpandedRow] = useState(null);
  const [hierarchyDetails, setHierarchyDetails] = useState({
    parent: null,
    children: [],
  });
  const [hierarchyLoading, setHierarchyLoading] = useState(false);
  const [newChildId, setNewChildId] = useState("");
  const [childAddLoading, setChildAddLoading] = useState(false);
  const [childRemoveLoading, setChildRemoveLoading] = useState(null); // id
  const [hierarchyList, setHierarchyList] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0); // If backend returns total count

  // Dropdown verileri için state'ler
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [towns, setTowns] = useState([]);
  const [loadingTowns, setLoadingTowns] = useState(false);
  const [departmentTypes, setDepartmentTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // Company'leri çek
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
        const companiesData = res.data.content || res.data || [];
        setCompanies(companiesData);
      } catch (err) {
        console.error("Departmanlar yüklenemedi:", err);
        // API'dan çekemiyorsa boş bırak
        setCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  // Department type'ları çek
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
        setDepartmentTypes([]);
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchDepartmentTypes();
  }, []);

  // Town'ları çek - chained API call kullanarak
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
        setTowns([]);
      } finally {
        setLoadingTowns(false);
      }
    };
    fetchTowns();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/department/get-all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          params: { page, size },
        });
        if (Array.isArray(response.data)) {
          setDepartments(response.data);
        } else if (response.data.content) {
          setDepartments(response.data.content);
          setTotalCount(response.data.totalElements || 0);
        } else {
          setDepartments([]);
        }
        // Hiyerarşi ilişkilerini çek
        const hierarchyRes = await api.get("/department-hierarchy/get-all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setHierarchyList(hierarchyRes.data);
      } catch (err) {
        setError(getTranslation(language, "error"));
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, [page, size]);

  const handleDelete = async (id) => {
    if (!window.confirm(getTranslation(language, "confirmDeleteDepartment")))
      return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/department/soft-delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        data: { id },
      });
      setDepartments(departments.filter((d) => d.id !== id));
    } catch (err) {
      alert(getTranslation(language, "departmentDeleteError"));
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setAddMessage("");
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/department/add",
        {
          name: newDepartment.name,
          companyId: Number(newDepartment.companyId),
          typeId: Number(newDepartment.typeId),
          townId: Number(newDepartment.townId),
          address: newDepartment.address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setAddMessage("Departman başarıyla eklendi!");
      setNewDepartment({
        name: "",
        companyId: "",
        typeId: "",
        townId: "",
        address: "",
      });
      // Listeyi güncelle
      const response = await api.get("/department/get-all", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      setDepartments(response.data);
    } catch (err) {
      setAddMessage("Departman eklenemedi!");
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    if (addMessage) {
      const timer = setTimeout(() => setAddMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [addMessage]);

  const handleEditClick = (department) => {
    navigate(`/admin/update-department/${department.id}`);
  };

  const handleEditChange = (e) => {
    setEditDepartment((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/department/update",
        {
          id: editId,
          newName: editDepartment.newName,
          newCompanyId: Number(editDepartment.newCompanyId),
          newTypeId: Number(editDepartment.newTypeId),
          newTownId: Number(editDepartment.newTownId),
          newAddress: editDepartment.newAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setAddMessage("Departman başarıyla güncellendi!");
      setEditId(null);
      // Listeyi güncelle
      const response = await api.get("/department/get-all", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      setDepartments(response.data);
    } catch (err) {
      setAddMessage("Departman güncellenemedi!");
      console.error("Güncelleme hatası:", err, err.response?.data);
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
  };

  const handleExpandRow = async (departmentId) => {
    if (expandedRow === departmentId) {
      setExpandedRow(null);
      setHierarchyDetails({ parent: null, children: [] });
      return;
    }
    setExpandedRow(departmentId);
    setHierarchyLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Parent departmanı çek
      const parentRes = await api.post(
        "/department-hierarchy/get-parents-only",
        { id: departmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      // Child departmanları çek
      const childRes = await api.post(
        "/department-hierarchy/get-children-only",
        { id: departmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setHierarchyDetails({
        parent: parentRes.data[0] || null,
        children: childRes.data || [],
      });
    } catch (err) {
      setHierarchyDetails({ parent: null, children: [] });
    } finally {
      setHierarchyLoading(false);
    }
  };

  const handleAddChild = async (parentId) => {
    if (!newChildId) return;
    console.log("Child ekleme isteği:", {
      parentDepartmentId: parentId,
      childDepartmentId: Number(newChildId),
    });
    setChildAddLoading(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/department-hierarchy/add",
        {
          parentDepartmentId: parentId,
          childDepartmentId: Number(newChildId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setNewChildId("");
      // Child listesini güncelle
      await handleExpandRow(parentId);
    } catch (err) {
      console.log("API error:", err.response?.data);
      alert("Child eklenemedi!");
    } finally {
      setChildAddLoading(false);
    }
  };

  const handleRemoveChild = async (parentId, childId) => {
    setChildRemoveLoading(childId);
    try {
      const token = localStorage.getItem("token");
      await api.delete("/department-hierarchy/remove", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        data: {
          parentDepartmentId: parentId,
          childDepartmentId: childId,
        },
      });
      // Child listesini güncelle
      await handleExpandRow(parentId);
    } catch (err) {
      alert("Child silinemedi!");
    } finally {
      setChildRemoveLoading(null);
    }
  };

  // Zincirdeki tüm parent'ları bulmak için fonksiyon
  function getParentChainIds(departmentId, hierarchyList) {
    const chain = [];
    let currentId = departmentId;
    while (true) {
      const parentLink = hierarchyList.find(
        (rel) => rel.childDepartment.id === currentId
      );
      if (parentLink && parentLink.parentDepartment) {
        const parentId = parentLink.parentDepartment.id;
        if (chain.includes(parentId)) break; // döngü engeli
        chain.push(parentId);
        currentId = parentId;
      } else {
        break;
      }
    }
    return chain;
  }

  if (loading) return <div>{getTranslation(language, "loading")}</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      {/* Remove Navbar and Sidebar JSX completely. Only render the main content. */}
      <div>
        <div style={{ maxWidth: 1200, margin: "100px auto", marginTop: 80 }}>
          <h2>{getTranslation(language, "departments")}</h2>
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
                  {getTranslation(language, "departmentName")}
                </th>
                <th style={{ padding: 8, border: "1px solid #333" }}>
                  {getTranslation(language, "company")}
                </th>
                <th style={{ padding: 8, border: "1px solid #333" }}>
                  {getTranslation(language, "address")}
                </th>
                <th style={{ padding: 8, border: "1px solid #333" }}>
                  {getTranslation(language, "town")}
                </th>
                <th style={{ padding: 8, border: "1px solid #333" }}>
                  {getTranslation(language, "region")}
                </th>
                <th style={{ padding: 8, border: "1px solid #333" }}>
                  {getTranslation(language, "city")}
                </th>
                <th style={{ padding: 8, border: "1px solid #333" }}>
                  {getTranslation(language, "active")}
                </th>
                <th style={{ padding: 8, border: "1px solid #333" }}>
                  {getTranslation(language, "actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department, idx) => (
                <React.Fragment key={department.id}>
                  <tr>
                    <td style={{ padding: 8, border: "1px solid #333" }}>
                      {idx + 1}
                    </td>
                    {editId === department.id ? (
                      <>
                        <td style={{ padding: 8, border: "1px solid #333" }}>
                          <input
                            type="text"
                            name="newName"
                            value={editDepartment.newName}
                            onChange={handleEditChange}
                            style={{ width: 120, padding: 4 }}
                          />
                        </td>
                        <td style={{ padding: 8, border: "1px solid #333" }}>
                          <select
                            name="newCompanyId"
                            value={editDepartment.newCompanyId}
                            onChange={handleEditChange}
                            style={{ width: 90, padding: 4 }}
                            disabled={loadingCompanies}
                          >
                            <option value="">
                              {loadingCompanies
                                ? getTranslation(language, "loading")
                                : companies.length === 0
                                ? getTranslation(
                                    language,
                                    "noCompaniesAvailable"
                                  )
                                : getTranslation(language, "selectCompany")}
                            </option>
                            {companies.map((company) => (
                              <option key={company.id} value={company.id}>
                                {company.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: 8, border: "1px solid #333" }}>
                          <input
                            type="text"
                            name="newAddress"
                            value={editDepartment.newAddress}
                            onChange={handleEditChange}
                            style={{ width: 90, padding: 4 }}
                          />
                        </td>
                        <td style={{ padding: 8, border: "1px solid #333" }}>
                          <select
                            name="newTownId"
                            value={editDepartment.newTownId}
                            onChange={handleEditChange}
                            style={{ width: 70, padding: 4 }}
                            disabled={loadingTowns}
                          >
                            <option value="">
                              {loadingTowns
                                ? getTranslation(language, "loading")
                                : towns.length === 0
                                ? getTranslation(language, "noTownsAvailable")
                                : getTranslation(language, "selectTown")}
                            </option>
                            {towns.map((town) => (
                              <option key={town.id} value={town.id}>
                                {town.name} - {town.region?.city?.name || "N/A"}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td
                          style={{ padding: 8, border: "1px solid #333" }}
                        ></td>
                        <td
                          style={{ padding: 8, border: "1px solid #333" }}
                        ></td>
                        <td
                          style={{ padding: 8, border: "1px solid #333" }}
                        ></td>
                        <td style={{ padding: 8, border: "1px solid #333" }}>
                          <form
                            onSubmit={handleEditSave}
                            style={{ display: "flex", gap: 8 }}
                          >
                            <select
                              name="newTypeId"
                              value={editDepartment.newTypeId}
                              onChange={handleEditChange}
                              style={{ width: 70, padding: 4 }}
                              disabled={loadingTypes}
                            >
                              <option value="">
                                {loadingTypes
                                  ? getTranslation(language, "loading")
                                  : departmentTypes.length === 0
                                  ? getTranslation(
                                      language,
                                      "noDepartmentTypesAvailable"
                                    )
                                  : getTranslation(
                                      language,
                                      "selectDepartmentType"
                                    )}
                              </option>
                              {departmentTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              style={{
                                color: "#fff",
                                background: "#388e3c",
                                border: "none",
                                borderRadius: 4,
                                padding: "4px 14px",
                                cursor: "pointer",
                                fontWeight: 500,
                              }}
                            >
                              {getTranslation(language, "save")}
                            </button>
                            <button
                              type="button"
                              onClick={handleEditCancel}
                              style={{
                                color: "#fff",
                                background: "#d32f2f",
                                border: "none",
                                borderRadius: 4,
                                padding: "4px 14px",
                                cursor: "pointer",
                                fontWeight: 500,
                              }}
                            >
                              {getTranslation(language, "cancel")}
                            </button>
                          </form>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: 8, border: "1px solid #333" }}>
                          {department.name}
                        </td>
                        <td style={{ padding: 8, border: "1px solid #333" }}>
                          {department.company?.name || "-"}
                        </td>
                        <td style={{ padding: 8, border: "1px solid #333" }}>
                          {department.address || "-"}
                        </td>
                        <td style={{ padding: 8, border: "1px solid #333" }}>
                          {department.town?.name || "-"}
                        </td>
                        <td style={{ padding: 8, border: "1px solid #333" }}>
                          {department.town?.region?.name || "-"}
                        </td>
                        <td style={{ padding: 8, border: "1px solid #333" }}>
                          {department.town?.region?.city?.name || "-"}
                        </td>
                        <td style={{ padding: 8, border: "1px solid #333" }}>
                          {department.active
                            ? getTranslation(language, "active")
                            : getTranslation(language, "inactive")}
                        </td>
                        <td style={{ padding: 8, border: "1px solid #333" }}>
                          {department.active && (
                            <button
                              onClick={() => handleDelete(department.id)}
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
                          )}
                          {department.active && (
                            <button
                              onClick={() => handleEditClick(department)}
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
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                  {expandedRow === department.id && (
                    <tr>
                      <td
                        colSpan={10}
                        style={{ background: "#232323", padding: 12 }}
                      >
                        {hierarchyLoading ? (
                          <div>Yükleniyor...</div>
                        ) : (
                          <div style={{ display: "flex", gap: 40 }}>
                            <div>
                              <strong>Üst Departman (Parent):</strong>
                              {hierarchyDetails.parent ? (
                                <div style={{ marginTop: 4 }}>
                                  {hierarchyDetails.parent.name} (ID:{" "}
                                  {hierarchyDetails.parent.id})
                                </div>
                              ) : (
                                <div style={{ marginTop: 4 }}>Yok</div>
                              )}
                            </div>
                            <div>
                              <strong>Alt Departmanlar (Children):</strong>
                              {hierarchyDetails.children.length > 0 ? (
                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                  {hierarchyDetails.children.map((child) => (
                                    <li
                                      key={child.id}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                      }}
                                    >
                                      {child.name} (ID: {child.id})
                                      <button
                                        onClick={() =>
                                          handleRemoveChild(
                                            department.id,
                                            child.id
                                          )
                                        }
                                        style={{
                                          color: "#fff",
                                          background: "#d32f2f",
                                          border: "none",
                                          borderRadius: 4,
                                          padding: "2px 8px",
                                          cursor:
                                            childRemoveLoading === child.id
                                              ? "not-allowed"
                                              : "pointer",
                                          fontSize: 13,
                                        }}
                                        disabled={
                                          childRemoveLoading === child.id
                                        }
                                      >
                                        {childRemoveLoading === child.id
                                          ? "Siliniyor..."
                                          : "Sil"}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div style={{ marginTop: 4 }}>Yok</div>
                              )}
                              {/* Child ekleme alanı */}
                              <div style={{ marginTop: 12 }}>
                                {(() => {
                                  // Zinciri bul
                                  const parentChainIds = getParentChainIds(
                                    department.id,
                                    hierarchyList
                                  );
                                  return (
                                    <select
                                      value={newChildId}
                                      onChange={(e) =>
                                        setNewChildId(e.target.value)
                                      }
                                      style={{ padding: 4, minWidth: 120 }}
                                      disabled={childAddLoading}
                                    >
                                      <option value="">
                                        Alt departman seç
                                      </option>
                                      {departments
                                        .filter(
                                          (d) =>
                                            d.id !== department.id &&
                                            !hierarchyDetails.children.some(
                                              (c) => c.id === d.id
                                            ) &&
                                            d.company?.id ===
                                              department.company?.id &&
                                            !parentChainIds.includes(d.id)
                                        )
                                        .map((d) => (
                                          <option key={d.id} value={d.id}>
                                            {d.name}
                                          </option>
                                        ))}
                                    </select>
                                  );
                                })()}
                                <button
                                  onClick={() => handleAddChild(department.id)}
                                  style={{
                                    color: "#fff",
                                    background: "#1976d2",
                                    border: "none",
                                    borderRadius: 4,
                                    padding: "4px 10px",
                                    marginLeft: 8,
                                    cursor: childAddLoading
                                      ? "not-allowed"
                                      : "pointer",
                                    fontWeight: 500,
                                  }}
                                  disabled={childAddLoading || !newChildId}
                                >
                                  {childAddLoading
                                    ? "Ekleniyor..."
                                    : "Alt Departman Ekle"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {/* Departman ekleme satırı */}
              <tr>
                <td style={{ padding: 8, border: "1px solid #333" }}></td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  <input
                    type="text"
                    placeholder={getTranslation(language, "departmentName")}
                    value={newDepartment.name}
                    onChange={(e) =>
                      setNewDepartment((d) => ({ ...d, name: e.target.value }))
                    }
                    style={{ width: 120, padding: 4 }}
                    disabled={adding}
                  />
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  <select
                    value={newDepartment.companyId}
                    onChange={(e) =>
                      setNewDepartment((d) => ({
                        ...d,
                        companyId: e.target.value,
                      }))
                    }
                    style={{ width: 90, padding: 4 }}
                    disabled={adding || loadingCompanies}
                  >
                    <option value="">
                      {loadingCompanies
                        ? getTranslation(language, "loading")
                        : companies.length === 0
                        ? getTranslation(language, "noCompaniesAvailable")
                        : getTranslation(language, "selectCompany")}
                    </option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  <input
                    type="text"
                    placeholder={getTranslation(language, "address")}
                    value={newDepartment.address}
                    onChange={(e) =>
                      setNewDepartment((d) => ({
                        ...d,
                        address: e.target.value,
                      }))
                    }
                    style={{ width: 90, padding: 4 }}
                    disabled={adding}
                  />
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  <select
                    value={newDepartment.townId}
                    onChange={(e) =>
                      setNewDepartment((d) => ({
                        ...d,
                        townId: e.target.value,
                      }))
                    }
                    style={{ width: 70, padding: 4 }}
                    disabled={adding || loadingTowns}
                  >
                    <option value="">
                      {loadingTowns
                        ? getTranslation(language, "loading")
                        : towns.length === 0
                        ? getTranslation(language, "noTownsAvailable")
                        : getTranslation(language, "selectTown")}
                    </option>
                    {towns.map((town) => (
                      <option key={town.id} value={town.id}>
                        {town.name} - {town.region?.city?.name || "N/A"}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: 8, border: "1px solid #333" }}></td>
                <td style={{ padding: 8, border: "1px solid #333" }}></td>
                <td style={{ padding: 8, border: "1px solid #333" }}></td>
                <td style={{ padding: 8, border: "1px solid #333" }}>
                  <form
                    onSubmit={handleAddDepartment}
                    style={{ display: "flex", gap: 8 }}
                  >
                    <select
                      value={newDepartment.typeId}
                      onChange={(e) =>
                        setNewDepartment((d) => ({
                          ...d,
                          typeId: e.target.value,
                        }))
                      }
                      style={{ width: 70, padding: 4 }}
                      disabled={adding || loadingTypes}
                    >
                      <option value="">
                        {loadingTypes
                          ? getTranslation(language, "loading")
                          : departmentTypes.length === 0
                          ? getTranslation(
                              language,
                              "noDepartmentTypesAvailable"
                            )
                          : getTranslation(language, "selectDepartmentType")}
                      </option>
                      {departmentTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
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
              </tr>
            </tbody>
          </table>
        </div>
        {addMessage && (
          <div
            style={{
              color: addMessage.includes("başarı") ? "#4caf50" : "#e53935",
              fontSize: 15,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            {addMessage}
          </div>
        )}
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
            disabled={departments.length < size}
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
      </div>
    </>
  );
}
