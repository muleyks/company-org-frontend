import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";

export default function AdminDashboard() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    surName: "",
    email: "",
    departmentId: "",
    roleName: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const [showCompaniesMenu, setShowCompaniesMenu] = useState(false);

  //admin kontrolü
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

        console.log("Kullanıcı rolü:", res.data.role?.name); //admin miyiz değil miyiz?
        console.log("Aktif kullanıcı:", res.data);

        if (res.data.role.name === "Admin") {
          console.log("çalıştı");
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          navigate("/"); //admin değilse ana sayfaya yönlendir
        }
      } catch (err) {
        setIsAdmin(false);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

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
        },
      });
      setMessage("Kullanıcı başarıyla kaydedildi!");
      setShowForm(false);
      setForm({
        firstName: "",
        surName: "",
        email: "",
        departmentId: "",
        roleName: "",
      });
    } catch (err) {
      console.log("Register error:", err);
      if (err.response) {
        console.log("Error response data:", err.response.data);
        console.log("Error response status:", err.response.status);
        console.log("Error response headers:", err.response.headers);
      }
      setMessage("Kayıt başarısız! Lütfen bilgileri kontrol edin.");
    }
  };

  // 2. Yükleniyorsa gösterme, admin değilse gösterme
  if (loading) return <div>Yükleniyor...</div>;
  if (!isAdmin) return null;

  return (
    <AdminLayout>
      {/* İçerik alanı */}
      <div style={{ marginLeft: 0, paddingTop: 0 }}>
        <div style={{ maxWidth: 600, margin: "100px auto" }}>
          {/* Sadece form kapalıyken butonu göster */}
        </div>
      </div>
    </AdminLayout>
  );
}
