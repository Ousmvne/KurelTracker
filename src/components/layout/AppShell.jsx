import { Outlet } from "react-router-dom";
import Toast from "../ui/Toast";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import LoadingScreen from "./LoadingScreen";
import { useGroupContext } from "../../contexts/GroupContext";
import { useAuthContext } from "../../contexts/AuthContext";

export default function AppShell() {
  const { toast, loading } = useGroupContext();
  const { role } = useAuthContext();

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-kurel-50 to-yellow-50 lg:flex">
      {role === "admin" && <Sidebar />}

      <main className="flex-1 min-w-0">
        {/* Mobile/tablet: centered card with shadow; Desktop: full-width, no card */}
        <div className="font-sans w-full max-w-[600px] min-h-screen mx-auto relative
                        shadow-[0_0_40px_rgba(0,0,0,0.08)]
                        sm:rounded-[20px] sm:min-h-[calc(100vh-48px)] sm:my-6
                        lg:max-w-none lg:shadow-none lg:rounded-none lg:min-h-0 lg:my-0">
          {toast && <Toast message={toast} />}
          <Outlet />
        </div>
      </main>

      {role === "admin" && <BottomNav />}
    </div>
  );
}
