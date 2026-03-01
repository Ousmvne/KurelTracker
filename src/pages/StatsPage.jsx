import { useGroupContext } from "../contexts/GroupContext";
import PageHeader from "../components/layout/PageHeader";
import ProgressBar from "../components/ui/ProgressBar";
import EmptyState from "../components/ui/EmptyState";

export default function StatsPage() {
  const { members, songs, sessions, memberRanking, getSongStats } = useGroupContext();

  if (members.length === 0 || sessions.length === 0) {
    return (
      <div className="p-5 pb-20">
        <PageHeader title="📊 Statistiques" />
        <EmptyState>Pas encore de données.</EmptyState>
      </div>
    );
  }

  return (
    <div className="p-5 pb-20">
      <PageHeader title="📊 Statistiques" />

      <h3 className="text-[15px] font-bold text-gray-700 m-0 mb-2.5 font-sans">Classement membres</h3>
      <div className="flex flex-col gap-2 mb-6">
        {memberRanking.map((m, i) => {
          const pct = m.stats.totalSessions > 0 ? Math.round((m.stats.totalValid / m.stats.totalSessions) * 100) : 0;
          return (
            <div key={m.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3.5 py-3">
              <div className="text-[22px] w-9 text-center shrink-0">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-800">{m.name}</div>
                <ProgressBar percent={pct} />
                <div className="text-[11px] text-gray-500 mt-1">
                  ✅ {m.stats.totalPresent} • 🎤 {m.stats.totalVocal} • {pct}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="text-[15px] font-bold text-gray-700 m-0 mb-2.5 font-sans">Avancement morceaux</h3>
      <div className="flex flex-col gap-2">
        {songs.map((song) => {
          const s = getSongStats(song.id);
          const pct = s.target > 0 ? Math.round((s.completed / s.target) * 100) : 0;
          return (
            <div key={song.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3.5 py-3">
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-800">{song.name}</div>
                <ProgressBar percent={pct} />
                <div className="text-[11px] text-gray-500 mt-1">{s.completed}/{s.target} ({pct}%)</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
