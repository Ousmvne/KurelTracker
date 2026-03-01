export default function ProgressBar({ percent, className = "" }) {
  const color = percent >= 100 ? "bg-kurel-600" : percent >= 80 ? "bg-kurel-600" : percent >= 50 ? "bg-amber-500" : "bg-red-600";

  return (
    <div className={`h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1.5 ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-400 ${color}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}
