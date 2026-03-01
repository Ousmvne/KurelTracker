import { Link } from "react-router-dom";
import { fmtDate } from "../../lib/utils";

export default function SessionCard({ session, song, attendance }) {
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const vocalCount = attendance.filter((a) => a.status === "vocal").length;

  return (
    <Link
      to={`/session/${session.id}`}
      className="flex justify-between items-center bg-white border border-gray-200 rounded-xl px-3.5 py-3 mb-2 cursor-pointer w-full font-sans text-left no-underline"
    >
      <div>
        <div className="font-semibold text-sm text-gray-800">{song?.name || "—"}</div>
        <div className="text-xs text-gray-500 mt-0.5">{fmtDate(session.date)}</div>
      </div>
      <div className="flex gap-2">
        <span className="text-xs bg-kurel-100 text-kurel-800 px-2 py-0.5 rounded-lg font-semibold">
          ✅ {presentCount}
        </span>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-lg font-semibold">
          🎤 {vocalCount}
        </span>
      </div>
    </Link>
  );
}
