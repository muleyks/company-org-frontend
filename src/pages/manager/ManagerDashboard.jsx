import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import ManagerLayout from "../../components/ManagerLayout";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  // ... diğer state ve useEffect'ler ...

  return (
    <ManagerLayout>
      <div style={{ maxWidth: 1200, margin: "100px auto", marginTop: 80 }}>
        {/* ... mevcut içerik ... */}
      </div>
    </ManagerLayout>
  );
}
