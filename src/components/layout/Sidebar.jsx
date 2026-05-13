import { Link, useLocation } from "react-router-dom";
import { useGroupContext } from "../../contexts/GroupContext";
import { useAuthContext } from "../../contexts/AuthContext";

const NAV_ITEMS = [
  { to: "/", icon: "🏠", label: "Accueil", match: (p) => p === "/" },
  { to: "/members", icon: "👥", label: "Membres", match: (p) => p.startsWith("/members") },
  { to: "/songs", icon: "🎶", label: "Morceaux", match: (p) => p.startsWith("/songs") },
  { to: "/new-session", icon: "📋", label: "Nouvelle Séance", match: (p) => p.startsWith("/new-session") || p.startsWith("/session") },
  { to: "/stats", icon: "📊", label: "Statistiques", match: (p) => p.startsWith("/stats") },
  { to: "/settings", icon: "⚙️", label: "Paramètres", match: (p) => p.startsWith("/settings") },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { group } = useGroupContext();
  const { logout } = useAuthContext();

  return (
    <aside className="hidden lg:flex flex-col w-56 h-screen sticky top-0 bg-white border-r border-gray-200 shrink-0">
      <div className="p-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🎵</span>
          <div>
            <div className="text-sm font-extrabold text-gray-800 leading-tight">Kurel Tracker</div>
            {group?.name && (
              <div className="text-[11px] text-gray-500 truncate max-w-[130px]">{group.name}</div>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline text-sm font-semibold transition-colors ${
                active
                  ? "bg-kurel-100 text-kurel-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <span className="text-base w-5 text-center leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer font-sans text-left"
          onClick={logout}
        >
          <span className="text-base w-5 text-center leading-none">🚪</span>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
