import { Outlet } from "react-router-dom";
import Toast from "../ui/Toast";
import { useGroupContext } from "../../contexts/GroupContext";

export default function AppShell() {
  const { toast } = useGroupContext();

  return (
    <div className="font-sans w-full max-w-[600px] min-h-screen bg-gradient-to-b from-kurel-50 to-yellow-50 relative shadow-[0_0_40px_rgba(0,0,0,0.08)] mx-auto sm:rounded-[20px] sm:min-h-[calc(100vh-48px)] sm:my-6">
      {toast && <Toast message={toast} />}
      <Outlet />
    </div>
  );
}
