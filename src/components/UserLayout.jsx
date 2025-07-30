import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../translations";

export default function UserLayout({ children }) {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();

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
          padding: "0 0.5px",
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
          onClick={() => navigate("/user-dashboard")}
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
            onClick={() => navigate("/user-dashboard")}
          >
            {getTranslation(language, "home")}
          </span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/user/profile")}
          >
            {getTranslation(language, "profile")}
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <button
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
            marginRight: 16,
            padding: "4px 8px",
            borderRadius: 4,
            fontWeight: "bold",
          }}
          onClick={toggleLanguage}
          title={language === "tr" ? "Switch to English" : "Türkçeye geç"}
        >
          {language === "tr" ? "EN" : "TR"}
        </button>
        <button
          style={{
            background: "#d32f2f",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "6px 12px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
          onClick={() => navigate("/login")}
        >
          {getTranslation(language, "logout")}
        </button>
      </div>
      <div style={{ paddingTop: 60 }}>{children}</div>
    </>
  );
}
