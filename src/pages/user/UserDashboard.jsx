import React from "react";
import UserLayout from "../../components/UserLayout";

export default function UserDashboard() {
  return (
    <UserLayout>
      <div style={{ maxWidth: 1200, margin: "100px auto", marginTop: 80 }}>
        {/* ... kullanıcıya özel içerik ... */}
      </div>
    </UserLayout>
  );
}
