import { ATTENDANCE_CONFIG } from "../../lib/utils";

export default function AttendanceButton({ index, name, status, onClick }) {
  const cfg = ATTENDANCE_CONFIG[status] || ATTENDANCE_CONFIG.absent;

  return (
    <button
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-none cursor-pointer w-full font-sans border-l-4 ${cfg.bg} ${cfg.border}`}
      onClick={onClick}
    >
      <span className="text-[13px] font-bold text-gray-500 w-[22px] text-center">{index}</span>
      <span className="flex-1 text-[15px] font-semibold text-gray-800 text-left">{name}</span>
      <span className="text-[22px]">{cfg.icon}</span>
    </button>
  );
}
