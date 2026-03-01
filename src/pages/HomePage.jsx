import { Link } from "react-router-dom";
import { useGroupContext } from "../contexts/GroupContext";
import { useAuthContext } from "../contexts/AuthContext";
import HeroCard from "../components/ui/HeroCard";
import SessionCard from "../components/sessions/SessionCard";
import { fmtDate } from "../lib/utils";

export default function HomePage() {
  const { group, members, songs, sessions, attendance, generateWhatsAppSummary, showToast, error: groupError } = useGroupContext();
  const { logout, error: authError } = useAuthContext();

  const serverError = authError || groupError;

  const handleWhatsApp = () => {
    generateWhatsAppSummary();
    showToast("Résumé copié ✓");
  };

  return (
    <div className="p-5 pb-20">
      {serverError && (
        <div className="bg-red-100 text-red-600 rounded-xl px-4 py-3 text-[13px] mb-4 font-semibold text-left border-l-4 border-red-600">
          {serverError}
        </div>
      )}

      <HeroCard
        icon="🎵"
        title={group?.name || "Mon Kurel"}
        subtitle={`Depuis le ${fmtDate(group?.start_date)} • ${members.length} membres • ${sessions.length} séances`}
      />

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { to: "/members", icon: "👥", label: "Membres", count: members.length },
          { to: "/songs", icon: "🎶", label: "Morceaux", count: songs.length },
          { to: "/new-session", icon: "📋", label: "Nouvelle Séance", count: "+" },
          { to: "/stats", icon: "📊", label: "Statistiques", count: "→" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white border border-gray-200 rounded-2xl py-[18px] px-3.5 flex flex-col items-center gap-1.5 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.04)] font-sans no-underline hover:shadow-md transition-shadow"
          >
            <span className="text-[28px]">{item.icon}</span>
            <span className="text-[13px] font-semibold text-gray-700">{item.label}</span>
            <span className="text-xs text-kurel-600 font-bold bg-kurel-100 rounded-[10px] px-2.5 py-0.5">
              {item.count}
            </span>
          </Link>
        ))}
      </div>

      {sessions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[15px] font-bold text-gray-700 m-0 mb-2.5 font-sans">Séances récentes</h3>
          {sessions.slice(-5).reverse().map((session) => {
            const song = songs.find((s) => s.id === session.song_id);
            const sa = attendance.filter((a) => a.session_id === session.id);
            return <SessionCard key={session.id} session={session} song={song} attendance={sa} />;
          })}
        </div>
      )}

      <button
        className="w-full bg-[#25D366] text-white border-none rounded-[14px] px-5 py-3.5 text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2.5 font-sans shadow-[0_4px_12px_rgba(37,211,102,0.3)] hover:brightness-105 transition-all"
        onClick={handleWhatsApp}
      >
        <span className="text-xl">📱</span> Partager sur WhatsApp
      </button>

      <div className="flex justify-between mt-5">
        <Link to="/settings" className="bg-transparent border-none text-gray-500 text-[13px] cursor-pointer font-sans no-underline hover:text-gray-700">
          ⚙️ Paramètres
        </Link>
        <button className="bg-transparent border-none text-gray-500 text-[13px] cursor-pointer font-sans" onClick={logout}>
          🚪 Déconnexion
        </button>
      </div>
    </div>
  );
}
