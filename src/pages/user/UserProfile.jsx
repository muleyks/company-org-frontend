import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/UserLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../translations";

export default function UserProfile() {
  const { language } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Rol çeviri fonksiyonu
  const translateRole = (roleName) => {
    switch (roleName) {
      case "User":
        return getTranslation(language, "user");
      case "Manager":
        return getTranslation(language, "manager");
      case "Admin":
        return getTranslation(language, "admin");
      default:
        return roleName;
    }
  };

  // Departman ismi çeviri fonksiyonu
  const translateDepartmentName = (departmentName) => {
    switch (departmentName) {
      case "Management":
        return getTranslation(language, "management");
      case "Sales & Marketing":
        return getTranslation(language, "salesMarketing");
      case "Logistics":
        return getTranslation(language, "logistics");
      case "IT Support":
        return getTranslation(language, "itSupport");
      case "Senior Partners":
        return getTranslation(language, "seniorPartners");
      case "Financial Consulting":
        return getTranslation(language, "financialConsulting");
      case "Investment Banking":
        return getTranslation(language, "investmentBanking");
      case "Production":
        return getTranslation(language, "production");
      case "Software Development":
        return getTranslation(language, "softwareDevelopment");
      case "Mobile Development":
        return getTranslation(language, "mobileDevelopment");
      case "Web Development":
        return getTranslation(language, "webDevelopment");
      case "Human Resources":
        return getTranslation(language, "humanResources");
      case "Executive Board":
        return getTranslation(language, "executiveBoard");
      case "Data Science":
        return getTranslation(language, "dataScience");
      case "My department":
        return getTranslation(language, "myDepartment");
      default:
        return departmentName;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/user/get-self", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setProfile(res.data);
      } catch (err) {
        setError(getTranslation(language, "error"));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div>{getTranslation(language, "loading")}</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!profile) return null;

  return (
    <UserLayout>
      <div style={{ maxWidth: 500, margin: "100px auto", marginTop: 80 }}>
        <div
          style={{
            maxWidth: 500,
            margin: "100px auto",
            background: "#181818",
            color: "#fff",
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 2px 12px #0002",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 300,
          }}
        >
          <div style={{ textAlign: "left" }}>
            <h2 style={{ textAlign: "left", marginBottom: 24 }}>
              {getTranslation(language, "userProfile")}
            </h2>
            <div>
              <b>{getTranslation(language, "firstName")}:</b>{" "}
              {profile.firstName}
            </div>
            <div>
              <b>{getTranslation(language, "lastName")}:</b> {profile.surName}
            </div>
            <div>
              <b>{getTranslation(language, "username")}:</b> {profile.username}
            </div>
            <div>
              <b>{getTranslation(language, "email")}:</b> {profile.email}
            </div>
            <div>
              <b>{getTranslation(language, "role")}:</b>{" "}
              {translateRole(profile.role?.name)}
            </div>
            <div>
              <b>{getTranslation(language, "company")}:</b>{" "}
              {profile.department?.company?.name ||
                profile.company?.name ||
                "-"}
            </div>
            <div>
              <b>{getTranslation(language, "department")}:</b>{" "}
              {translateDepartmentName(profile.department?.name) || "-"}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
