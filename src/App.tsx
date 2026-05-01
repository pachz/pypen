import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { EditorLayout } from "./components/EditorLayout";
import { EnsureProfile } from "./components/EnsureProfile";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { StandardLayout } from "./components/StandardLayout";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { FullPageLayout } from "./components/FullPageLayout";
import { PenDetailsPage } from "./pages/PenDetailsPage";
import { PenEditorPage } from "./pages/PenEditorPage";
import { PenFullPage } from "./pages/PenFullPage";

export default function App() {
  return (
    <BrowserRouter>
      <EnsureProfile>
        <Routes>
          <Route element={<StandardLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route element={<EditorLayout />}>
            <Route path="/pen/:penId" element={<PenEditorPage />} />
            <Route path="/details/:penId" element={<PenDetailsPage />} />
          </Route>
          <Route element={<FullPageLayout />}>
            <Route path="/full/:penId" element={<PenFullPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </EnsureProfile>
    </BrowserRouter>
  );
}
