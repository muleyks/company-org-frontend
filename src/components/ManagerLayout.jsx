import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../translations";

export default function ManagerLayout({ children }) {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCompaniesMenu, setShowCompaniesMenu] = useState(false);

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
          padding: "0 0.0000001px",
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
            marginLeft: "16px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            gap: "9px",
          }}
          onClick={() => setShowSidebar(true)}
        >
          <div
            style={{
              width: "30px",
              height: "1.5px",
              backgroundColor: "#fff",
              borderRadius: "1px",
            }}
          />
          <div
            style={{
              width: "30px",
              height: "1.5px",
              backgroundColor: "#fff",
              borderRadius: "1px",
            }}
          />
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
            onClick={() => navigate("/manager/manager-dashboard")}
          >
            {getTranslation(language, "home")}
          </span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/manager/users")}
          >
            {getTranslation(language, "userManagement")}
          </span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/manager/profile")}
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
      {/* Sidebar */}
      {showSidebar && (
        <>
          {/* Overlay to close sidebar when clicked outside */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.5)",
              zIndex: 1500,
            }}
            onClick={() => setShowSidebar(false)}
          />
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
              paddingTop: 16,
              boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
              textAlign: "left",
              transition: "left 0.3s",
            }}
          >
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
              {getTranslation(language, "companies")}
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
                    navigate("/manager/companies");
                    setShowSidebar(false);
                    setShowCompaniesMenu(false);
                  }}
                >
                  <span style={{ fontSize: 16 }}>›</span>{" "}
                  {getTranslation(language, "companies")}
                </div>
              </div>
            )}
            {/* Diğer menü başlıkları */}
          </div>
        </>
      )}
      <div style={{ paddingTop: 60 }}>{children}</div>
    </>
  );
}
