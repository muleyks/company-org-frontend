import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";

export default function CompanyTypeUpdate() {
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [type, setType] = useState(null);
  const [form, setForm] = useState({ newName: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchType = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/company-type/get-all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        const found = res.data.find((t) => String(t.id) === String(id));
        setType(found);
        setForm({ newName: found?.name || "" });
      } catch (err) {
        setMessage(getTranslation(language, "error"));
      } finally {
        setLoading(false);
      }
    };
    fetchType();
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
        "/company-type/update",
        {
          id: Number(id),
          newName: form.newName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      setMessage(getTranslation(language, "success"));
      setTimeout(() => navigate("/admin/company-types"), 1200);
    } catch (err) {
      setMessage(getTranslation(language, "error"));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>{getTranslation(language, "loading")}</div>;
  if (!type) return <div>{getTranslation(language, "error")}</div>;

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
          <h2>{getTranslation(language, "editCompanyType")}</h2>
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
              placeholder={getTranslation(language, "companyTypeName")}
              value={form.newName}
              onChange={handleChange}
              required
            />
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
