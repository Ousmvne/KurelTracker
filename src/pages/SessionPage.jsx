import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGroupContext } from "../contexts/GroupContext";
import PageHeader from "../components/layout/PageHeader";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { fmtDate, ATTENDANCE_CONFIG } from "../lib/utils";

export default function SessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessions, songs, members, attendance, toggleAttendance, deleteSession } = useGroupContext();
  const [confirmAction, setConfirmAction] = useState(null);

  const session = sessions.find((s) => s.id === sessionId);
  if (!session) {
    return (
      <div className="p-5 pb-20">
        <PageHeader title="Séance introuvable" />
        <p className="text-gray-500 text-sm">Cette séance n'existe pas ou a été supprimée.</p>
      </div>
    );
  }

  // Derive which xasiidas were in this session from attendance records
  const sessionSongIds = [...new Set(
    attendance.filter((a) => a.session_id === sessionId).map((a) => a.song_id)
  )];
  const sessionSongs = songs.filter((s) => sessionSongIds.includes(s.id));

  const handleDelete = async () => {
    await deleteSession(session.id);
    navigate("/");
  };

  return (
    <div className="p-5 pb-20 lg:p-8 lg:pb-8">
      <PageHeader title={`📋 Séance du ${fmtDate(session.date)}`} />

      {/* Legend */}
      <div className="flex gap-4 mb-4 justify-center flex-wrap">
        {Object.entries(ATTENDANCE_CONFIG).map(([key, cfg]) => (
          <span key={key} className={`text-xs font-semibold ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </span>
        ))}
      </div>

      {sessionSongs.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">Aucune donnée pour cette séance.</p>
      ) : (
        <div className="overflow-x-auto -mx-5 lg:-mx-8">
          <div className="px-5 lg:px-8" style={{ minWidth: `${160 + sessionSongs.length * 64}px` }}>
            {/* Header row */}
            <div
              className="grid items-center pb-2 mb-1 border-b-2 border-gray-200"
              style={{ gridTemplateColumns: `160px repeat(${sessionSongs.length}, 1fr)` }}
            >
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Membre</div>
              {sessionSongs.map((song) => (
                <div key={song.id} className="text-xs font-bold text-gray-700 text-center px-1 truncate" title={song.name}>
                  {song.name.length > 10 ? song.name.slice(0, 9) + "…" : song.name}
                </div>
              ))}
            </div>

            {/* Member rows */}
            {members.map((member) => (
              <div
                key={member.id}
                className="grid items-center py-2 border-b border-gray-100 last:border-0"
                style={{ gridTemplateColumns: `160px repeat(${sessionSongs.length}, 1fr)` }}
              >
                <div className="text-sm font-semibold text-gray-800 truncate pr-2">{member.name}</div>
                {sessionSongs.map((song) => {
                  const att = attendance.find(
                    (a) => a.session_id === sessionId && a.member_id === member.id && a.song_id === song.id
                  );
                  const status = att?.status || "absent";
                  const cfg = ATTENDANCE_CONFIG[status];
                  return (
                    <div key={song.id} className="flex justify-center">
                      <button
                        className={`w-11 h-11 rounded-xl border-none cursor-pointer text-xl flex items-center justify-center transition-transform active:scale-90 ${cfg.bg}`}
                        onClick={() => toggleAttendance(sessionId, member.id, song.id, attendance)}
                        title={`${member.name} — ${song.name}`}
                      >
                        {cfg.icon}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        className="w-full bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-sm font-semibold cursor-pointer font-sans mt-6"
        onClick={() => setConfirmAction({ msg: "Supprimer cette séance ?", action: handleDelete })}
      >
        🗑 Supprimer cette séance
      </button>

      {confirmAction && (
        <ConfirmDialog
          message={confirmAction.msg}
          onConfirm={() => { confirmAction.action(); setConfirmAction(null); }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
