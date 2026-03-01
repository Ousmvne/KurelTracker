export default function HeroCard({ icon, title, subtitle }) {
  return (
    <div className="bg-gradient-to-br from-kurel-800 via-kurel-700 to-kurel-500 rounded-[20px] px-5 pt-8 pb-6 text-center text-white mb-5 shadow-[0_8px_32px_rgba(22,101,52,0.3)]">
      <div className="text-5xl mb-2">{icon}</div>
      <h1 className="text-xl font-extrabold m-0 mb-1.5 tracking-wide">{title}</h1>
      {subtitle && <p className="text-[13px] opacity-85 m-0">{subtitle}</p>}
    </div>
  );
}
