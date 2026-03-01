import { useState } from "react";

export default function MemberForm({ onAdd }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name, email);
    setName("");
    setEmail("");
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none font-sans bg-white focus:border-kurel-600 transition-colors"
          placeholder="Nom du membre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          className="w-11 h-11 rounded-xl border-none bg-kurel-600 text-white text-[22px] font-bold cursor-pointer flex items-center justify-center shrink-0"
          onClick={handleAdd}
        >
          +
        </button>
      </div>
      <input
        className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none font-sans bg-white mt-1.5 box-border focus:border-kurel-600 transition-colors"
        placeholder="Email du membre (optionnel — pour lier son compte)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>
  );
}
