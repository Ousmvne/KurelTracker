import { useAuthContext } from "../contexts/AuthContext";
import { useGroupContext } from "../contexts/GroupContext";
import HeroCard from "../components/ui/HeroCard";
import ProgressBar from "../components/ui/ProgressBar";
import EmptyState from "../components/ui/EmptyState";
import SongAudioPlayer from "../components/ui/SongAudioPlayer";
import { fmtDate, ATTENDANCE_CONFIG } from "../lib/utils";

export default function MemberDashboardPage() {
  const { myMember, logout } = useAuthContext();
  const { group, sessions, songs, attendance } = useGroupContext();

  const myAttendance = attendance.filter((a) => a.member_id === myMember.id);
  const totalSessions = sessions.length;
  const totalPresent = myAttendance.filter((a) => a.status === "present").length;
  const totalVocal = myAttendance.filter((a) => a.status === "vocal").length;
  const totalValid = totalPresent + totalVocal;
  const pct = totalSessions > 0 ? Math.round((totalValid / totalSessions) * 100) : 0;

  return (
    <div className="p-5 pb-20">
      <HeroCard icon="👤" title={myMember.name} subtitle={group.name} />

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { num: `${totalValid}/${totalSessions}`, label: "Présences" },
          { num: `${pct}%`, label: "Assiduité" },
          { num: totalPresent, label: "✅ Présent" },
          { num: totalVocal, label: "🎤 Vocal" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl px-3 py-4 text-center border border-gray-200">
            <div className="text-[28px] font-extrabold text-kurel-800">{stat.num}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <ProgressBar percent={pct} className="mb-1" />
      <p className="text-center mb-6 text-sm text-gray-500">
        {pct >= 80 ? "Excellent ! Continue comme ça 💪" : pct >= 50 ? "Pas mal, mais tu peux mieux faire !" : "Il faut venir plus souvent aux répétitions !"}
      </p>

      {songs.filter((s) => s.audio_url).length > 0 && (
        <>
          <h3 className="text-[15px] font-bold text-gray-700 m-0 mb-2.5 font-sans">🎵 Morceaux à réviser</h3>
          <div className="flex flex-col gap-2 mb-6">
            {songs.filter((s) => s.audio_url).map((song) => (
              <div key={song.id} className="bg-white border border-gray-200 rounded-xl px-3.5 py-3">
                <div className="text-sm font-semibold text-gray-800">{song.name}</div>
                <SongAudioPlayer audioUrl={song.audio_url} />
              </div>
            ))}
          </div>
        </>
      )}

      <h3 className="text-[15px] font-bold text-gray-700 m-0 mb-2.5 font-sans">Historique des séances</h3>
      <div className="flex flex-col gap-2">
        {sessions.slice().reverse().map((session) => {
          const song = songs.find((s) => s.id === session.song_id);
          const att = myAttendance.find((a) => a.session_id === session.id);
          const status = att?.status || "absent";
          const cfg = ATTENDANCE_CONFIG[status];
          return (
            <div key={session.id} className={`flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3.5 py-3 border-l-4 ${cfg.border}`}>
              <div>
                <div className="text-sm font-semibold text-gray-800">{song?.name || "—"}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{fmtDate(session.date)}</div>
              </div>
              <span className={`${cfg.bg} ${cfg.color} px-3 py-1 rounded-lg text-[13px] font-semibold`}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
          );
        })}
        {sessions.length === 0 && <EmptyState>Aucune séance enregistrée.</EmptyState>}
      </div>

      <button
        className="w-full bg-gray-100 text-gray-700 border border-gray-300 rounded-xl p-3 text-sm font-semibold cursor-pointer font-sans mt-8"
        onClick={logout}
      >
        Se déconnecter
      </button>
    </div>
  );
}
