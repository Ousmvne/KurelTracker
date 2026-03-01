import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { GroupProvider } from "../contexts/GroupContext";
import LoadingScreen from "../components/layout/LoadingScreen";
import AppShell from "../components/layout/AppShell";

import AuthPage from "../pages/AuthPage";
import HomePage from "../pages/HomePage";
import MembersPage from "../pages/MembersPage";
import SongsPage from "../pages/SongsPage";
import NewSessionPage from "../pages/NewSessionPage";
import SessionPage from "../pages/SessionPage";
import StatsPage from "../pages/StatsPage";
import SettingsPage from "../pages/SettingsPage";
import MemberDashboardPage from "../pages/MemberDashboardPage";

function RequireAuth({ children }) {
  const { user, loading } = useAuthContext();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { role, loading } = useAuthContext();
  if (loading) return <LoadingScreen />;
  if (role === "member") return <Navigate to="/dashboard" replace />;
  return children;
}

function RequireMember({ children }) {
  const { role, loading } = useAuthContext();
  if (loading) return <LoadingScreen />;
  if (role === "admin") return <Navigate to="/" replace />;
  return children;
}

function AuthRedirect({ children }) {
  const { user, role, loading } = useAuthContext();
  if (loading) return <LoadingScreen />;
  if (user && role === "admin") return <Navigate to="/" replace />;
  if (user && role === "member") return <Navigate to="/dashboard" replace />;
  return children;
}

function AuthenticatedLayout() {
  return (
    <GroupProvider>
      <AppShell />
    </GroupProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: (
      <AuthRedirect>
        <AuthPage />
      </AuthRedirect>
    ),
  },
  {
    element: (
      <RequireAuth>
        <RequireAdmin>
          <AuthenticatedLayout />
        </RequireAdmin>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "members", element: <MembersPage /> },
      { path: "songs", element: <SongsPage /> },
      { path: "new-session", element: <NewSessionPage /> },
      { path: "session/:sessionId", element: <SessionPage /> },
      { path: "stats", element: <StatsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <RequireAuth>
        <RequireMember>
          <AuthenticatedLayout />
        </RequireMember>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <MemberDashboardPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/auth" replace />,
  },
]);
