import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import LoginPage from "./pages/auth/LoginPage";
import ActivateAccount from "./pages/auth/ActivateAccount";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SetInitialPassword from "./pages/auth/SetInitialPassword";
import ActivateForgotPassword from "./pages/auth/ActivateForgotPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import UpdateUser from "./pages/admin/UpdateUser";
import AdminProfile from "./pages/admin/AdminProfile";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerProfile from "./pages/manager/ManagerProfile";
import ManagerUserManagement from "./pages/manager/UserManagement";
import ManagerUpdateUser from "./pages/manager/UpdateUser";
import UserProfile from "./pages/user/UserProfile";
import UserDashboard from "./pages/user/UserDashboard";
import TownList from "./pages/town/TownList";
import RegionList from "./pages/town/RegionList";
import CityList from "./pages/town/CityList";
import DepartmentList from "./pages/department/DepartmentList";
import CompanyList from "./pages/company/CompanyList";
import UpdateCompany from "./pages/company/UpdateCompany";
import CompanyTypeList from "./pages/company/CompanyTypeList";
import CompanyTypeUpdate from "./pages/company/CompanyTypeUpdate";
import AdminLayout from "./components/AdminLayout";
import ManagerLayout from "./components/ManagerLayout";
import UpdateDepartment from "./pages/department/UpdateDepartment";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/activate" element={<ActivateAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/set-initial-password"
            element={<SetInitialPassword />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/auth/activate-forgot-password"
            element={<ActivateForgotPassword />}
          />
          {/* Admin panel routes wrapped with AdminLayout */}
          <Route
            path="/admin/admin-dashboard"
            element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminLayout>
                <UserManagement />
              </AdminLayout>
            }
          />
          <Route
            path="/update-user/:id"
            element={
              <AdminLayout>
                <UpdateUser />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <AdminLayout>
                <AdminProfile />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/companies"
            element={
              <AdminLayout>
                <CompanyList />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/towns"
            element={
              <AdminLayout>
                <TownList />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/regions"
            element={
              <AdminLayout>
                <RegionList />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/cities"
            element={
              <AdminLayout>
                <CityList />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <AdminLayout>
                <DepartmentList />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/update-company/:id"
            element={
              <AdminLayout>
                <UpdateCompany />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/company-types"
            element={
              <AdminLayout>
                <CompanyTypeList />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/update-company-type/:id"
            element={
              <AdminLayout>
                <CompanyTypeUpdate />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/update-department/:id"
            element={
              <AdminLayout>
                <UpdateDepartment />
              </AdminLayout>
            }
          />
          {/* Manager panel routes wrapped with ManagerLayout */}
          <Route
            path="/manager/users"
            element={
              <ManagerLayout>
                <ManagerUserManagement />
              </ManagerLayout>
            }
          />
          <Route
            path="/manager/profile"
            element={
              <ManagerLayout>
                <ManagerProfile />
              </ManagerLayout>
            }
          />
          <Route
            path="/manager/manager-dashboard"
            element={
              <ManagerLayout>
                <ManagerDashboard />
              </ManagerLayout>
            }
          />
          <Route
            path="/manager/update-user/:id"
            element={
              <ManagerLayout>
                <ManagerUpdateUser />
              </ManagerLayout>
            }
          />
          <Route
            path="/manager/companies"
            element={
              <ManagerLayout>
                <CompanyList />
              </ManagerLayout>
            }
          />
          {/* User routes remain unwrapped */}
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
export default App;
