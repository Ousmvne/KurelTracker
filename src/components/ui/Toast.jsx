export default function Toast({ message }) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold z-[1000] shadow-[0_8px_24px_rgba(0,0,0,0.2)] font-sans">
      {message}
    </div>
  );
}
