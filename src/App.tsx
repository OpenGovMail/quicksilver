import {
  Box,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import { lazy, startTransition, Suspense } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useHotkeys } from "@tanstack/react-hotkeys";
import { AccountProvider } from "./nonview/core/AccountContext";
import { AuthProvider } from "./nonview/core/AuthContext";
import { DataProvider } from "./nonview/core/DataContext";
import theme from "./theme";
import { ComposeProvider } from "./view/moles/ComposeProvider";
// Import ProtectedRoute component
import ProtectedRoute from "./view/moles/ProtectedRoute";
import ForgotPasswordPage from "./view/pages/ForgotPasswordPage";
// Import page components
import LoginPage from "./view/pages/LoginPage";
import MailPage from "./view/pages/MailPage";
import NotFoundPage from "./view/pages/NotFoundPage";
import ProfilePage from "./view/pages/ProfilePage";
import RegisterPage from "./view/pages/RegisterPage";
import ThreadPage from "./view/pages/ThreadPage";

// Compose pulls in react-email (templates + renderer). Lazy-load it so that
// weight only ships when the user actually opens the composer.
const ComposePage = lazy(() => import("./view/pages/ComposePage"));

const RouteFallback = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
    }}
  >
    <CircularProgress />
  </Box>
);

const HotKeys = (): null => {
  const navigate = useNavigate();
  const navigatePath = (path: string) => {
    startTransition(() => navigate(path));
  };

  useHotkeys([
    { hotkey: ["G", "L"], callback: () => navigatePath("/login") },
    { hotkey: ["G", "I"], callback: () => navigatePath("/inbox") },
    { hotkey: ["G", "P"], callback: () => navigatePath("/profile") },
    { hotkey: "C", callback: () => navigatePath("/compose") },
  ]);
  return null;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AccountProvider>
          <DataProvider>
            <ComposeProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MailPage />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    path="thread/:threadId"
                    element={
                      <ProtectedRoute>
                        <ThreadPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>
                <Route
                  path="/inbox"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sent"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/drafts"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trash"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/conversations"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/compose"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<RouteFallback />}>
                        <ComposePage />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Not Found - catch all */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <HotKeys />
            </ComposeProvider>
          </DataProvider>
        </AccountProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
