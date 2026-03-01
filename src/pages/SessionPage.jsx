import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGroupContext } from "../contexts/GroupContext";
import PageHeader from "../components/layout/PageHeader";
import AttendanceButton from "../components/sessions/AttendanceButton";
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

  const song = songs.find((s) => s.id === session.song_id);

  const handleDelete = async () => {
    await deleteSession(session.id);
    navigate("/");
  };

  return (
    <div className="p-5 pb-20">
      <PageHeader title={`${song?.name || "Séance"} — ${fmtDate(session.date)}`} />
      <p className="text-gray-500 text-[13px] m-0 mb-3">Tapez pour changer : Absent → Présent → Vocal</p>

      <div className="flex gap-4 mb-4 justify-center">
        {Object.entries(ATTENDANCE_CONFIG).map(([key, cfg]) => (
          <span key={key} className={`text-xs font-semibold ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {members.map((m, i) => {
          const att = attendance.find((a) => a.session_id === session.id && a.member_id === m.id);
          const status = att?.status || "absent";
          return (
            <AttendanceButton
              key={m.id}
              index={i + 1}
              name={m.name}
              status={status}
              onClick={() => toggleAttendance(session.id, m.id, attendance)}
            />
          );
        })}
      </div>

      <button
        className="w-full bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-sm font-semibold cursor-pointer font-sans mt-5"
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
