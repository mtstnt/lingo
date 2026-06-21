import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import SignIn from "@/pages/auth/signin";
import SignUp from "@/pages/auth/signup";
import ResourcesPage from "@/pages/resources";
import MaterialsPage from "@/pages/materials";
import MaterialDetailPage from "@/pages/material-detail";
import QueuePage from "@/pages/queue";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/my/resources" element={<ResourcesPage />} />
            <Route path="/my/materials" element={<MaterialsPage />} />
            <Route path="/my/materials/:id" element={<MaterialDetailPage />} />
            <Route path="/my/resources/queue" element={<QueuePage />} />
          </Route>
          <Route path="/" element={<Navigate to="/my/resources" replace />} />
          <Route path="*" element={<Navigate to="/my/resources" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
