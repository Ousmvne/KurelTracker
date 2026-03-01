import { useState } from "react";

export default function SongForm({ onAdd }) {
  const [name, setName] = useState("");
  const [reps, setReps] = useState("10");

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name, reps);
    setName("");
    setReps("10");
  };

  return (
    <div className="flex gap-2 mb-4">
      <input
        className="flex-1 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none font-sans bg-white focus:border-kurel-600 transition-colors"
        placeholder="Nom du morceau"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
      />
      <input
        className="w-[60px] border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none font-sans bg-white text-center focus:border-kurel-600 transition-colors"
        type="number"
        placeholder="Rép."
        value={reps}
        onChange={(e) => setReps(e.target.value)}
      />
      <button
        className="w-11 h-11 rounded-xl border-none bg-kurel-600 text-white text-[22px] font-bold cursor-pointer flex items-center justify-center shrink-0"
        onClick={handleAdd}
      >
        +
      </button>
    </div>
  );
}
