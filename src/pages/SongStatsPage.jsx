import { useParams } from "react-router-dom";
import { useGroupContext } from "../contexts/GroupContext";
import PageHeader from "../components/layout/PageHeader";
import ProgressBar from "../components/ui/ProgressBar";
import EmptyState from "../components/ui/EmptyState";
import { fmtDate } from "../lib/utils";

export default function SongStatsPage() {
  const { songId } = useParams();
  const { getSongDetailedStats } = useGroupContext();
  const data = getSongDetailedStats(songId);

  if (!data.song) {
    return (
      <div className="p-5 pb-20">
        <PageHeader title="Morceau introuvable" backTo="/stats" />
        <p className="text-gray-500 text-sm">Ce morceau n'existe pas ou a été supprimé.</p>
      </div>
    );
  }

  const globalPct = data.target > 0 ? Math.round((data.completed / data.target) * 100) : 0;

  return (
    <div className="p-5 pb-20">
      <PageHeader title={`🎵 ${data.song.name}`} backTo="/stats" />

      <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-3 mb-6">
        <div className="text-sm font-semibold text-gray-800">Avancement global</div>
        <ProgressBar percent={globalPct} />
        <div className="text-[11px] text-gray-500 mt-1">
          {data.completed}/{data.target} répétitions ({globalPct}%)
        </div>
      </div>

      <h3 className="text-[15px] font-bold text-gray-700 m-0 mb-2.5 font-sans">Classement sur ce morceau</h3>
      {data.ranking.length === 0 || data.completed === 0 ? (
        <EmptyState>Aucune session pour ce morceau.</EmptyState>
      ) : (
        <div className="flex flex-col gap-2 mb-6">
          {data.ranking.map((m) => {
            const pct = m.stats.totalSessions > 0
              ? Math.round((m.stats.totalValid / m.stats.totalSessions) * 100)
              : 0;
            return (
              <div key={m.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3.5 py-3">
                <div className="text-[22px] w-9 text-center shrink-0">
                  {m.rank === 1 ? "🥇" : m.rank === 2 ? "🥈" : m.rank === 3 ? "🥉" : `${m.rank}.`}
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
      )}

      <h3 className="text-[15px] font-bold text-gray-700 m-0 mb-2.5 font-sans">Historique des sessions</h3>
      {data.sessions.length === 0 ? (
        <EmptyState>Aucune session enregistrée.</EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          {data.sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3.5 py-3">
              <div className="text-sm font-semibold text-gray-800">{fmtDate(s.date)}</div>
              <div className="flex gap-3 text-[11px] text-gray-500">
                <span>✅ {s.present}</span>
                <span>🎤 {s.vocal}</span>
                <span>❌ {s.absent}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
