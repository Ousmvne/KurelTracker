import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", icon: "🏠", label: "Accueil", match: (p) => p === "/" },
  { to: "/members", icon: "👥", label: "Membres", match: (p) => p.startsWith("/members") },
  { to: "/songs", icon: "🎶", label: "Morceaux", match: (p) => p.startsWith("/songs") },
  { to: "/new-session", icon: "📋", label: "Séance", match: (p) => p.startsWith("/new-session") || p.startsWith("/session") },
  { to: "/stats", icon: "📊", label: "Stats", match: (p) => p.startsWith("/stats") },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] bg-white/95 backdrop-blur-sm border-t border-gray-200 flex justify-around px-1 pt-2 pb-[max(env(safe-area-inset-bottom),8px)] z-50">
      {NAV_ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl no-underline transition-colors min-w-[52px] ${active ? "text-kurel-600" : "text-gray-400"}`}
          >
            <span className="text-[22px] leading-none">{item.icon}</span>
            <span className={`text-[10px] font-semibold leading-tight ${active ? "text-kurel-600" : "text-gray-400"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
